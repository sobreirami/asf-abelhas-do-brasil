# ASF Abelhas Nativas - Guia de Instalação e Configuração

## 📋 Pré-requisitos

- Node.js >= 20.19.4
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Conta no Firebase
- Conta no Expo (para push notifications)

## 🚀 Passo a Passo

### 1. Clonar e Instalar

```bash
cd asf-abelhas-do-brasil
npm install
```

### 2. Configurar Firebase

#### 2.1 Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Dê um nome ao projeto (ex: "asf-abelhas-brasil")
4. Desative Google Analytics (opcional)
5. Clique em "Criar projeto"

#### 2.2 Adicionar App Web

1. No painel do projeto, clique no ícone Web `</>`
2. Dê um nome ao app
3. Marque "Configure Firebase Hosting" (opcional)
4. Clique em "Registrar app"
5. **COPIE AS CREDENCIAIS** que aparecem

#### 2.3 Atualizar Configuração no Código

Abra `services/firebase.ts` e substitua as credenciais:

```typescript
const firebaseConfig = {
  apiKey: 'AIza...sua-api-key',
  authDomain: 'seu-projeto.firebaseapp.com',
  projectId: 'seu-projeto-id',
  storageBucket: 'seu-projeto.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456',
};
```

### 3. Configurar Firestore Database

#### 3.1 Criar Database

1. No Firebase Console, vá em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Selecione modo "Produção"
4. Escolha a localização (recomendado: southamerica-east1)

#### 3.2 Configurar Regras de Segurança

1. Vá em "Regras" na aba Firestore
2. Copie o conteúdo de `firestore.rules` e cole lá
3. Clique em "Publicar"

#### 3.3 Adicionar Dados de Exemplo

1. Abra `firestore-example-data.json`
2. Para cada espécie no array:
   - Clique em "Iniciar coleção" (primeira vez) ou "Adicionar documento"
   - ID do documento: use o campo `id` (ex: "mandacaia")
   - Copie os campos do JSON
   - Para `createdAt` e `updatedAt`: use o tipo "timestamp" e a data atual
   - Clique em "Salvar"

### 4. Configurar Firebase Storage

#### 4.1 Ativar Storage

1. No Firebase Console, vá em "Storage"
2. Clique em "Começar"
3. Aceite as regras padrão
4. Escolha a mesma localização do Firestore

#### 4.2 Configurar Regras

Vá em "Regras" e cole:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /species/{speciesId}/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

#### 4.3 Upload de Imagens (Exemplo)

1. Crie a pasta `species/mandacaia/` no Storage
2. Faça upload de 3 versões da imagem:
   - `thumb.jpg` (200x200px)
   - `media.jpg` (800x600px)
   - `original.jpg` (1920x1440px)
3. Para cada arquivo, clique com botão direito > "Obter URL de download"
4. Atualize os documentos no Firestore com essas URLs

### 5. Configurar Push Notifications

#### 5.1 Criar Conta Expo

1. Acesse [expo.dev](https://expo.dev)
2. Crie uma conta ou faça login

#### 5.2 Criar Projeto Expo

```bash
npx expo login
npx expo start
```

#### 5.3 Atualizar Project ID

1. Abra `app.json`
2. Note o campo `"projectId"` (ou crie um rodando `eas init`)
3. Abra `services/notificationService.ts`
4. Atualize:

```typescript
const tokenData = await Notifications.getExpoPushTokenAsync({
  projectId: 'seu-project-id-aqui', // do app.json
});
```

### 6. Testar o App

```bash
# Iniciar o servidor de desenvolvimento
npx expo start

# No terminal, pressione:
# - 'a' para abrir no Android
# - 'i' para abrir no iOS
# - 'w' para abrir na web
```

## 🐛 Problemas Comuns

### Erro: "Firebase: Firebase App named '[DEFAULT]' already exists"

**Solução**: Reinicie o servidor Expo (`Ctrl+C` e `npx expo start` novamente)

### Erro: "Missing or insufficient permissions"

**Solução**: Verifique as regras do Firestore. Certifique-se de que `allow read: if true;` está configurado.

### Notificações não funcionam

**Soluções**:

- Notificações só funcionam em dispositivos físicos
- Verifique se o `projectId` no código corresponde ao do `app.json`
- Certifique-se de que o app tem permissão para notificações no sistema

### Imagens não carregam

**Soluções**:

- Verifique se as URLs do Storage estão corretas no Firestore
- Certifique-se de que as regras do Storage permitem leitura pública
- Teste as URLs diretamente no navegador

### Erro de versão do Node

**Solução**: Atualize o Node para versão >= 20.19.4

```bash
# Usando nvm:
nvm install 20.19.4
nvm use 20.19.4
```

## 📱 Build para Produção

### Android

```bash
# Configurar EAS
npx eas build:configure

# Build APK
npx eas build -p android --profile preview

# Build AAB para Google Play
npx eas build -p android --profile production
```

### iOS

```bash
# Build para simulator
npx eas build -p ios --profile preview

# Build para App Store
npx eas build -p ios --profile production
```

## 🔑 Variáveis de Ambiente (Opcional)

Para usar variáveis de ambiente:

1. Instale: `npm install react-native-dotenv`
2. Copie `.env.example` para `.env`
3. Preencha com suas credenciais
4. Configure o babel.config.js

## 📚 Recursos Adicionais

- [Documentação Expo](https://docs.expo.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Expo Router](https://expo.github.io/router/docs/)
- [FlashList](https://shopify.github.io/flash-list/)
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/)

## 💡 Dicas de Desenvolvimento

1. Use o Expo Go app para testar rapidamente no celular
2. O Metro Bundler mostra erros úteis no terminal
3. Use o React DevTools para debug
4. Teste em modo escuro e claro
5. Teste com dados vazios (sem espécies) para ver os EmptyStates

## 🤝 Suporte

Se encontrar problemas:

1. Verifique os logs no terminal do Expo
2. Verifique o console do navegador (para Web)
3. Verifique os logs do Firebase Console
4. Consulte a documentação oficial do Expo/Firebase

---

Desenvolvido com ❤️ usando React Native + Expo
