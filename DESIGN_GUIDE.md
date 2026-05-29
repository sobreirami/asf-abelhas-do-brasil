# 🎨 Guia de Design e Assets - ASF Abelhas do Brasil

## 📐 Especificações de Design

### Paleta de Cores

#### Modo Claro

```css
Primary: #6B8E23     /* Verde Oliva */
Secondary: #D4AF37   /* Dourado Mel */
Accent: #FF9500      /* Laranja Mel */
Background: #FFFFFF
Card: #FFFFFF
Text: #2C3E35
```

#### Modo Escuro

```css
Primary: #8FBC8F     /* Verde Claro */
Secondary: #FFD700   /* Dourado Mel */
Accent: #FFB84D
Background: #1A1F1A
Card: #2A2F2A
Text: #E8EDE7
```

## 📸 Especificações de Imagens

### Dimensões Recomendadas

#### Fotos de Espécies

```
thumbnail: 200x200px   (quadrada, para cards)
media: 800x600px       (4:3, para galeria)
original: 1920x1440px  (4:3, full resolution)
```

#### Qualidade

- **Thumbnail**: JPEG 70-80% qualidade
- **Media**: JPEG 85% qualidade
- **Original**: JPEG 90-95% qualidade

### Estrutura no Firebase Storage

```
species/
├── mandacaia/
│   ├── thumb.jpg     (200x200)
│   ├── media.jpg     (800x600)
│   └── original.jpg  (1920x1440)
├── jatai/
│   ├── thumb.jpg
│   ├── media.jpg
│   └── original.jpg
└── [outra-especie]/
    └── ...
```

### Onde Encontrar Imagens

#### Fontes Gratuitas e Confiáveis:

1. **Wikimedia Commons** - commons.wikimedia.org
   - Busque por nome científico
   - Verifique a licença (CC-BY ou CC0)

2. **iNaturalist** - inaturalist.org
   - Observações de abelhas brasileiras
   - Respeite as licenças Creative Commons

3. **Pixabay/Unsplash** - pixabay.com / unsplash.com
   - Imagens gerais de abelhas
   - Uso comercial permitido

4. **Bancos Científicos**
   - BIOTA-FAPESP
   - SiBBr (Sistema de Informação sobre a Biodiversidade Brasileira)

### Processamento de Imagens

#### Usando ImageMagick (CLI)

```bash
# Instalar
brew install imagemagick  # macOS
# ou
sudo apt install imagemagick  # Linux

# Criar thumbnail
convert original.jpg -resize 200x200^ -gravity center -extent 200x200 thumb.jpg

# Criar media
convert original.jpg -resize 800x600 -quality 85 media.jpg

# Otimizar original
convert original.jpg -resize 1920x1440 -quality 90 original-optimized.jpg
```

#### Usando Online (mais fácil)

1. **TinyPNG** - tinypng.com
   - Upload e compressão automática
2. **Squoosh** - squoosh.app
   - Ferramenta visual do Google
3. **ResizeImage** - resizeimage.net
   - Redimensionar online

## 🎯 Diretrizes de UX/UI

### Hierarquia Visual

1. **Título Principal** (32-40px, Bold)
2. **Subtítulos** (20-24px, Semibold)
3. **Corpo de Texto** (16px, Regular)
4. **Texto Secundário** (14px, Regular)
5. **Captions** (12px, Regular)

### Espaçamentos

```typescript
xs: 4px    // Elementos muito próximos
sm: 8px    // Espaçamento interno de botões
md: 16px   // Espaçamento padrão entre elementos
lg: 24px   // Seções maiores
xl: 32px   // Entre grandes blocos
xxl: 48px  // Topo/fundo de telas
```

### Animações

**Duração:**

- Micro-interações: 150-200ms
- Transições: 300ms
- Animações complexas: 400-600ms

**Easing:**

- Entrada: `cubic-bezier(0.4, 0, 0.2, 1)`
- Saída: `cubic-bezier(0, 0, 0.2, 1)`
- Padrão: `ease-in-out`

### Efeitos Visuais

**Blur (Glass Morphism):**

```typescript
intensity: 80;
tint: 'light' | 'dark';
```

**Sombras:**

- SM: Elevation 2
- MD: Elevation 4
- LG: Elevation 8

## 📱 Componentes e Estados

### SpeciesCard

**Estados:**

- Normal
- Pressed (scale: 0.98)
- Loading (skeleton)

**Variações:**

- Grid (2 colunas)
- List (largura total)

### Buttons

**Primary:**

- Background: Primary color
- Text: White
- Padding: 16px 24px
- Border Radius: 12px

**Secondary:**

- Background: Transparent
- Border: 1px Primary
- Text: Primary color

### Input (SearchBar)

**Estados:**

- Default
- Focused (border: Primary)
- Filled (show clear button)
- Error (border: Error color)

## 🎨 Ícones

**Fonte:** Ionicons (incluído no @expo/vector-icons)

**Tamanhos:**

- Small: 16-18px
- Medium: 20-24px
- Large: 28-32px
- Hero: 60-80px

**Ícones Principais:**

```typescript
home: 'home';
gallery: 'grid';
favorites: 'heart';
about: 'information-circle';
search: 'search';
filter: 'funnel';
back: 'arrow-back';
share: 'share-social';
bee: 'bee' | 'leaf';
```

## 💾 Assets Estáticos Necessários

### Logo/App Icon

```
ios/
  icon-1024x1024.png  (App Store)

android/
  icon-512x512.png    (Google Play)

adaptive-icon/
  foreground.png      (Android Adaptive Icon)
  background.png      (Android Adaptive Icon)

splash-screen/
  splash-1242x2688.png  (iPhone)
  splash-1080x1920.png  (Android)
```

### Placeholder Image

Crie um placeholder simples para quando as imagens não carregarem:

1. Imagem 200x200px
2. Fundo gradiente (Primary → Secondary)
3. Ícone de abelha branco no centro
4. Salve como `assets/images/placeholder.png`

### Empty States

Ilustrações simples para:

- Sem resultados de busca
- Sem favoritos
- Sem conexão
- Erro ao carregar

## 🔧 Ferramentas Recomendadas

### Design

- **Figma** - Design de interfaces
- **Adobe XD** - Prototipagem
- **Sketch** - Design macOS

### Processamento de Imagens

- **ImageMagick** - Batch processing
- **GIMP** - Editor gratuito
- **Photoshop** - Editor profissional

### Otimização

- **TinyPNG** - Compressão PNG/JPG
- **Squoosh** - Otimização web
- **ImageOptim** - Otimização macOS

### Ícones e Ilustrações

- **Ionicons** - Já incluído
- **Flaticon** - Ícones grátis
- **unDraw** - Ilustrações SVG

## 📋 Checklist de Assets

Antes de publicar, certifique-se de ter:

- [ ] App Icon (1024x1024)
- [ ] Splash Screen (várias resoluções)
- [ ] Adaptive Icon Android
- [ ] Placeholder image
- [ ] Pelo menos 5 espécies com fotos
- [ ] Todas as fotos em 3 tamanhos
- [ ] Screenshots para lojas (mínimo 3)
- [ ] Banner/Feature Graphic (opcional)
- [ ] Logo em alta resolução
- [ ] Ícones de tabs customizados (opcional)

## 🎨 Inspirações de Design

**Apps Similares:**

- National Geographic
- iNaturalist
- Plant ID apps
- Educational biology apps

**Estilos:**

- Glass morphism (iOS style)
- Material Design 3 (Android)
- Neumorphism (cards com profundidade)
- Minimalist/Clean UI

## 📊 Performance de Imagens

### Otimizações Implementadas

1. **expo-image** ao invés de Image nativo
   - Cache automático
   - Placeholder blur
   - Transições suaves

2. **FlashList** para listas
   - Renderização otimizada
   - Menos re-renders

3. **Lazy Loading**
   - Imagens carregam sob demanda
   - Thumbnails primeiro, depois media

4. **Responsive**
   - Usa thumbnail em cards
   - Media em tela de detalhes
   - Original apenas em fullscreen (futuro)

---

**Dica Final:** Mantenha as imagens otimizadas desde o início. Fotos muito grandes podem tornar o app lento e consumir muitos dados do usuário!
