// Report Modal - Reportar Erros nas Informações
import {
  ImpactFeedbackStyle,
  NotificationFeedbackType,
  triggerHaptic,
  triggerNotificationHaptic,
} from '@/utils/haptics';
import Ionicons, { type IoniconsIconName } from '@react-native-vector-icons/ionicons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { Colors, Shadows } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '@/services/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { styles } from './styles';

type ReportType = 'info-incorreta' | 'imagem-errada' | 'outro';

type ReportModalProps = {
  onClose: () => void;
  speciesId: string;
  speciesName: string;
};

export default function ReportModal({ onClose, speciesId, speciesName }: ReportModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const REPORT_TYPES: { value: ReportType; label: string; icon: IoniconsIconName }[] = [
    { value: 'info-incorreta', label: t.report.types['info-incorreta'], icon: 'alert-circle' },
    { value: 'imagem-errada', label: t.report.types['imagem-errada'], icon: 'image' },
    { value: 'outro', label: t.report.types.outro, icon: 'ellipsis-horizontal' },
  ];

  const [selectedType, setSelectedType] = useState<ReportType>('info-incorreta');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert(t.report.attention, t.report.errorMessage);
      return;
    }

    try {
      setSubmitting(true);

      // Salva o report no Firestore
      const report = {
        speciesId,
        speciesName,
        type: selectedType,
        description: description.trim(),
        email: email.trim() || t.report.anonymous,
        createdAt: new Date(),
        status: 'pending', // pending, reviewed, resolved
      };

      await addDoc(collection(db, 'reports'), report);

      await triggerNotificationHaptic(NotificationFeedbackType.Success);

      Alert.alert(t.report.successTitle, t.report.successMessage, [
        { text: t.common.ok, onPress: handleClose },
      ]);
    } catch {
      Alert.alert(t.common.error, t.report.sendError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setDescription('');
    setEmail('');
    setSelectedType('info-incorreta');
    onClose();
  };

  return (
    <BlurView intensity={80} tint={colorScheme ?? 'light'} style={styles.container}>
      <View style={[styles.content, { backgroundColor: colors.background }, Shadows.lg]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{t.report.title}</Text>
            <Text style={[styles.subtitle, { color: colors.icon }]}>{speciesName}</Text>
          </View>
          <Pressable
            onPress={handleClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel={t.common.cancel}
          >
            <Ionicons name="close" size={28} color={colors.icon} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Tipo de Report */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.report.typeLabel}</Text>
            {REPORT_TYPES.map((type) => (
              <Pressable
                key={type.value}
                onPress={async () => {
                  await triggerHaptic(ImpactFeedbackStyle.Light);
                  setSelectedType(type.value);
                }}
                style={[
                  styles.typeOption,
                  {
                    backgroundColor: selectedType === type.value ? colors.primary : colors.card,
                    borderColor: selectedType === type.value ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={type.icon}
                  size={24}
                  color={selectedType === type.value ? colors.onPrimary : colors.icon}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    { color: selectedType === type.value ? colors.onPrimary : colors.text },
                  ]}
                >
                  {type.label}
                </Text>
                {selectedType === type.value && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.onPrimary} />
                )}
              </Pressable>
            ))}
          </View>

          {/* Descrição */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t.report.descriptionLabel}
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t.report.descriptionPlaceholder}
              placeholderTextColor={colors.icon}
              multiline
              numberOfLines={4}
              maxLength={500}
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
            />
            <Text style={[styles.charCount, { color: colors.icon }]}>{description.length}/500</Text>
          </View>

          {/* Email (Opcional) */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.report.emailLabel}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t.report.emailPlaceholder}
              placeholderTextColor={colors.icon}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
            />
            <Text style={[styles.hint, { color: colors.icon }]}>{t.report.emailHint}</Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View
          style={[
            styles.footer,
            { borderTopColor: colors.border, paddingBottom: insets.bottom + 8 },
          ]}
        >
          <Button
            label={t.common.cancel}
            onPress={handleClose}
            variant="secondary"
            fullWidth
            style={styles.footerButton}
          />
          <Button
            label={submitting ? t.report.sending : t.report.submit}
            onPress={handleSubmit}
            variant="primary"
            fullWidth
            loading={submitting}
            disabled={submitting}
            style={styles.footerButton}
          />
        </View>
      </View>
    </BlurView>
  );
}
