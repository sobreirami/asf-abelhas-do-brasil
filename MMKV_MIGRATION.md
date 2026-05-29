# Migração AsyncStorage → MMKV

## ✅ Implementação Concluída

A aplicação foi migrada de **AsyncStorage** para **MMKV** para melhor performance de armazenamento local.

## 🚀 Benefícios

- **30x mais rápido** que AsyncStorage
- **Operações síncronas** (sem await desnecessários)
- **Menor consumo de memória**
- **Criptografia nativa** (opcional)
- **Suporte a múltiplos tipos** (string, number, boolean, buffer)

## 📁 Arquivos Modificados

### Novo Arquivo
- **`services/storage.ts`**: Adaptador centralizado do MMKV com API compatível

### Serviços Atualizados
- **`services/cacheService.ts`**: Cache de espécies (offline-first)
- **`services/favoritesService.ts`**: Favoritos do usuário
- **`services/languageService.ts`**: Preferência de idioma
- **`services/preferencesService.ts`**: Preferências de tema

### App Atualizado
- **`app/_layout.tsx`**: Verificação de onboarding
- **`app/onboarding.tsx`**: Marcação de onboarding concluído
- **`app/(tabs)/preferences.tsx`**: Limpeza de dados

## 🔄 API Compatível

O `storageAdapter` mantém API similar ao AsyncStorage para facilitar migração:

```typescript
// Antes (AsyncStorage)
await AsyncStorage.setItem(key, value);
const data = await AsyncStorage.getItem(key);
await AsyncStorage.removeItem(key);

// Depois (MMKV)
storageAdapter.setItem(key, value);
const data = storageAdapter.getItem(key);
storageAdapter.removeItem(key);
```

## ⚡ Performance

### AsyncStorage (antigo)
- Operações assíncronas (overhead de Promises)
- ~10-50ms por operação de leitura
- Baseado em SQLite

### MMKV (novo)
- Operações síncronas (instant return)
- ~0.1-2ms por operação de leitura
- Baseado em mmap

## 📦 Dependências

```json
{
  "react-native-mmkv": "^3.1.0"
}
```

## 🔧 Uso no Projeto

### Importar o Storage
```typescript
import { storageAdapter } from '@/services/storage';
```

### Operações Básicas
```typescript
// Salvar
storageAdapter.setItem('@user_theme', 'dark');

// Ler
const theme = storageAdapter.getItem('@user_theme');

// Remover
storageAdapter.removeItem('@user_theme');

// Remover múltiplos
storageAdapter.multiRemove(['@key1', '@key2']);

// Limpar tudo
storageAdapter.clear();
```

### Acesso Direto ao MMKV (avançado)
```typescript
import { storage } from '@/services/storage';

// Tipos nativos
storage.set('number', 42);
storage.set('boolean', true);
storage.set('string', 'value');

// Obter com tipo específico
const num = storage.getNumber('number');
const bool = storage.getBoolean('boolean');
const str = storage.getString('string');
```

## 🎯 Offline-First

A estratégia offline-first continua funcionando perfeitamente:

1. **Cache sempre prioritário**: Se existe cache, retorna imediatamente
2. **Firebase apenas quando necessário**: Só busca se não houver cache
3. **Skeleton só no loading real**: Mostra carregamento apenas ao buscar do Firebase
4. **Performance máxima**: MMKV faz as leituras de cache instantâneas

## ✨ Próximos Passos (Opcional)

- [ ] Implementar criptografia de dados sensíveis
- [ ] Usar múltiplas instâncias MMKV (separar cache/favoritos/config)
- [ ] Migrar para tipos nativos onde apropriado (números, booleans)
- [ ] Implementar listener de mudanças com MMKV

## 📚 Referências

- [MMKV GitHub](https://github.com/mrousavy/react-native-mmkv)
- [Documentação Oficial](https://mrousavy.com/react-native-mmkv/)
- [Benchmarks](https://github.com/mrousavy/react-native-mmkv#-benchmark)
