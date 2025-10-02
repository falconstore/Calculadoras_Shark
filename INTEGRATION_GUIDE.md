# 🦈 Shark Calculadoras - Guia de Integração

## ⚠️ IMPORTANTE: Apenas Redesign Visual

Este projeto contém **APENAS o redesign visual** do Shark Calculadoras. 
**NÃO inclui a lógica de cálculo** - você precisa integrar seu código original.

## 📁 Estrutura de Arquivos Criados

```
src/
├── components/
│   ├── Hero.tsx                    # Hero section com animações
│   ├── Navigation.tsx              # Menu de navegação responsivo
│   ├── CalculatorArbiPro.tsx       # ⚠️ ESTRUTURA VISUAL - Adicione sua lógica aqui
│   ├── RegulatedHousesList.tsx     # Lista de casas regulamentadas (dados reais)
│   ├── About.tsx                   # Seção sobre o projeto
│   ├── Contact.tsx                 # Seção de contato
│   └── ui/                         # Componentes shadcn (Button, Card, Input, etc)
├── pages/
│   └── Index.tsx                   # Página principal
├── index.css                       # 🎨 Design System (cores, gradientes, animações)
└── tailwind.config.ts              # 🎨 Configuração do Tailwind

index.html                          # HTML principal com meta tags SEO
```

## 🔧 Como Integrar Sua Lógica de Cálculo

### 1. Arquivo Principal: `src/components/CalculatorArbiPro.tsx`

Este arquivo contém apenas a estrutura visual. Você precisa:

#### A) Substituir as funções de cálculo placeholder:

```typescript
// ANTES (placeholder):
const calculateROI = () => {
  return "0.00";
};

// DEPOIS (sua lógica original):
const calculateROI = () => {
  // Cole aqui sua função de cálculo de ROI original
  const odds = houses.map(h => parseFloat(h.odd) || 0);
  // ... resto da sua lógica
  return roi.toFixed(2);
};
```

#### B) Integrar cálculo de stakes:

```typescript
// Procure por:
const calculateStakes = () => {
  console.log("Calcular stakes com sua lógica original");
};

// Substitua por sua lógica de cálculo de stakes
```

#### C) Integrar sistema de compartilhamento:

```typescript
const handleShare = () => {
  // Use sua lógica de compartilhamento original
  // O código atual é apenas um exemplo
};
```

### 2. Calculadora FreePro

Atualmente é apenas um placeholder. Para adicionar:

1. Crie `src/components/CalculatorFreePro.tsx` seguindo o mesmo padrão visual do ArbiPro
2. Adicione sua lógica de cálculo específica
3. Substitua o placeholder em `src/pages/Index.tsx`

## 🎨 Design System

### Cores Principais (podem ser customizadas em `src/index.css`):

```css
:root {
  --primary: 190 95% 55%;        /* Ciano */
  --secondary: 160 85% 50%;      /* Verde */
  --accent: 280 85% 65%;         /* Roxo */
  --success: 160 85% 50%;        /* Verde sucesso */
  --warning: 45 95% 60%;         /* Amarelo */
  --destructive: 0 85% 60%;      /* Vermelho */
  
  /* Gradientes personalizados */
  --shark-gradient-start: 195 100% 50%;
  --shark-gradient-mid: 175 85% 55%;
  --shark-gradient-end: 160 90% 50%;
}
```

### Classes Utilitárias Criadas:

- `.gradient-primary` - Gradiente ciano → verde
- `.gradient-glow` - Gradiente com efeito glow
- `.glass-card` - Card com efeito glassmorphism
- `.text-gradient` - Texto com gradiente
- `.glow-hover` - Efeito glow no hover

### Animações:

- `animate-fade-in` - Fade in suave
- `animate-slide-in` - Slide da esquerda
- `animate-glow-pulse` - Pulso de glow
- `animate-float` - Flutuação suave

## 📊 Casas Regulamentadas

O arquivo `RegulatedHousesList.tsx` contém dados reais de 12 casas regulamentadas:

- Bet365, Betano, Betfair, KTO
- Sportingbet, Betway, Stake, Superbet
- Novibet, Esportiva.bet, Betboo, BetMGM

Cada casa tem:
- Nome e status de regulamentação
- Licença (MF/SPA-2025)
- URL oficial
- Features (Comissão, Freebet, Cash Out, etc)

**Para adicionar mais casas:** Edite o array `houses` no arquivo.

## 🚀 Próximos Passos

1. **Integrar Cálculos:**
   - Abra `src/components/CalculatorArbiPro.tsx`
   - Substitua os placeholders pelas suas funções originais
   - Teste todos os cenários de cálculo

2. **Adicionar FreePro:**
   - Crie o componente seguindo o padrão do ArbiPro
   - Integre a lógica específica de freebets

3. **Testar:**
   - Teste em diferentes tamanhos de tela
   - Verifique todos os cálculos
   - Teste compartilhamento de configurações

4. **Deploy:**
   - Faça commit no seu repositório GitHub
   - Deploy no Vercel

## 📝 Notas Importantes

- ✅ **O que está pronto:** Design system, layout, animações, estrutura visual
- ⚠️ **O que falta:** Lógica de cálculo (você precisa adicionar)
- 🎨 **Personalizável:** Todas as cores em `index.css` podem ser ajustadas
- 📱 **Responsivo:** Funciona em mobile, tablet e desktop

## 💡 Dicas

1. **Não mexa nas cores diretamente nos componentes** - Use o design system
2. **Mantenha a estrutura de states** no CalculatorArbiPro
3. **Use os badges interativos** existentes (Comissão, Freebet, etc)
4. **Preserve os IDs das seções** para navegação funcionar

## 🆘 Suporte

Se tiver dúvidas sobre integração:
1. Verifique os comentários `// AQUI:` nos arquivos
2. Compare com seu código original
3. Mantenha a mesma estrutura de dados (BettingHouse interface)

---

**Desenvolvido com ❤️ para a comunidade de apostadores profissionais**
