# 🎨 Shark Calculadoras - Design System

## Paleta de Cores

### Cores Principais (HSL)

```css
/* Tema Dark (padrão) */
--background: 220 25% 6%;           /* Azul escuro profundo */
--foreground: 180 100% 95%;         /* Ciano claro para texto */

--primary: 190 95% 55%;             /* Ciano vibrante */
--primary-foreground: 220 25% 6%;  /* Texto no primary */

--secondary: 160 85% 50%;           /* Verde água */
--secondary-foreground: 220 25% 6%;

--accent: 280 85% 65%;              /* Roxo/magenta */
--accent-foreground: 220 25% 6%;

--success: 160 85% 50%;             /* Verde sucesso */
--warning: 45 95% 60%;              /* Amarelo alerta */
--destructive: 0 85% 60%;           /* Vermelho erro */

/* Cards e Superfícies */
--card: 220 20% 10%;                /* Card background */
--muted: 220 15% 15%;               /* Backgrounds secundários */
--border: 220 20% 18%;              /* Bordas */
```

### Gradientes Personalizados

```css
/* Gradiente Principal */
.gradient-primary {
  background: linear-gradient(135deg, 
    hsl(195 100% 50%),    /* Ciano */
    hsl(175 85% 55%),     /* Ciano-Verde */
    hsl(160 90% 50%)      /* Verde */
  );
}

/* Gradiente com Glow */
.gradient-glow {
  background: linear-gradient(135deg, 
    hsl(var(--primary)), 
    hsl(var(--secondary))
  );
  box-shadow: 0 0 60px hsl(var(--glow) / 0.3);
}

/* Texto com Gradiente */
.text-gradient {
  background: linear-gradient(135deg, 
    hsl(var(--primary)), 
    hsl(var(--secondary))
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## Efeitos Visuais

### Glassmorphism

```css
.glass-card {
  background: hsl(var(--card) / 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid hsl(var(--border) / 0.5);
}
```

### Glow Effects

```css
.glow-hover {
  transition: all 0.3s ease;
}

.glow-hover:hover {
  box-shadow: 0 0 30px hsl(var(--glow) / 0.4);
  transform: translateY(-2px);
}
```

## Animações

### Keyframes Disponíveis

```css
/* Fade In */
@keyframes fade-in {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* Slide In */
@keyframes slide-in {
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

/* Glow Pulse */
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 20px hsl(var(--glow) / 0.3); }
  50% { box-shadow: 0 0 40px hsl(var(--glow) / 0.6); }
}

/* Float */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

### Classes de Animação

```tsx
// Uso nos componentes:
<div className="animate-fade-in">Conteúdo</div>
<div className="animate-slide-in">Conteúdo</div>
<div className="animate-glow-pulse">Conteúdo</div>
<div className="animate-float">Conteúdo</div>
```

## Componentes

### Buttons

```tsx
// Primary (Gradient Glow)
<Button className="gradient-glow">
  Ação Principal
</Button>

// Outline
<Button variant="outline" className="border-primary/50 hover:bg-primary/10">
  Ação Secundária
</Button>

// Destructive
<Button variant="outline" className="border-destructive/50 hover:bg-destructive/10">
  Deletar
</Button>
```

### Cards

```tsx
// Glass Card
<Card className="glass-card p-6 glow-hover">
  Conteúdo
</Card>

// Com borda colorida
<Card className="glass-card p-6 border-l-4 border-primary">
  Conteúdo
</Card>

// Success
<Card className="glass-card p-6 border-success/50 bg-success/5">
  Conteúdo
</Card>
```

### Badges

```tsx
// Default (Gradient)
<Badge className="gradient-glow">v2.0</Badge>

// Success
<Badge className="bg-success/20 text-success border-success/50">
  <CheckCircle2 className="w-3 h-3 mr-1" />
  Regulamentada
</Badge>

// Interactive
<Badge
  variant={active ? "default" : "outline"}
  className="cursor-pointer glow-hover"
  onClick={handleClick}
>
  Opção
</Badge>
```

### Inputs

```tsx
// Com ícone prefix
<div className="relative">
  <span className="absolute left-3 top-1/2 -translate-y-1/2">
    R$
  </span>
  <Input
    type="number"
    className="pl-10 bg-muted/50 border-primary/30 focus:border-primary"
  />
</div>

// Com estilo premium
<Input
  className="bg-muted/50 border-primary/30 focus:border-primary text-lg font-medium h-12"
/>
```

## Tipografia

### Font Stack

```css
font-family: 'Inter', system-ui, sans-serif;
```

### Hierarquia

```tsx
// Hero Title
<h1 className="text-6xl md:text-8xl font-black">
  <span className="text-gradient">Shark</span>
  <span className="text-foreground"> Calculadoras</span>
</h1>

// Section Title
<h2 className="text-4xl md:text-5xl font-black">
  Título <span className="text-gradient">Destacado</span>
</h2>

// Card Title
<h3 className="text-2xl font-bold">Título do Card</h3>

// Label
<Label className="text-sm font-semibold">Campo</Label>
```

## Espaçamento

### Containers

```tsx
<div className="container mx-auto max-w-6xl px-4">
  {/* Conteúdo limitado a 6xl com padding lateral */}
</div>
```

### Sections

```tsx
<section className="py-20 px-4">
  {/* Padding vertical 20, horizontal 4 */}
</section>
```

## Responsividade

### Breakpoints

```css
/* Mobile: default */
/* Tablet: md: (768px) */
/* Desktop: lg: (1024px) */
/* Wide: xl: (1280px) */
```

### Grid Responsivo

```tsx
// 1 coluna mobile, 2 tablet, 3 desktop
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

## Estados Interativos

### Hover States

```tsx
// Hover com scale
<div className="transition-all hover:scale-105">

// Hover com glow
<div className="glow-hover">

// Hover com color change
<div className="group">
  <h3 className="group-hover:text-primary transition-colors">
```

### Focus States

```tsx
<Input className="focus:border-primary focus:ring-2 focus:ring-primary/20" />
```

## Acessibilidade

### Cores com Contraste

Todas as combinações de cores têm contraste mínimo de **4.5:1** para WCAG AA.

### Focus Visible

```css
*:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}
```

## Personalização

### Mudando Cores do Tema

Edite `src/index.css`:

```css
:root {
  /* Mude apenas os valores HSL */
  --primary: 190 95% 55%;     /* Seu ciano */
  --secondary: 160 85% 50%;   /* Seu verde */
  
  /* As variantes são calculadas automaticamente */
}
```

### Adicionando Novos Gradientes

```css
/* Em src/index.css */
.gradient-custom {
  background: linear-gradient(135deg, 
    hsl(sua-cor-1), 
    hsl(sua-cor-2)
  );
}
```

---

**Design System mantido simples e escalável para fácil customização** 🎨
