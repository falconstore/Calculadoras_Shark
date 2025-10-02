import { Card } from "./ui/card";
import { Target, Zap, Gift, TrendingUp, CheckCircle, BookOpen, Image, Link, Video, HeadphonesIcon, Fish, ListChecks, Calculator, Sparkles } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Cashback",
    description: "Maximize seus retornos com estratégias otimizadas",
  },
  {
    icon: Zap,
    title: "Super Odds",
    description: "Aproveite as melhores cotações do mercado",
  },
  {
    icon: Gift,
    title: "Apostas Grátis",
    description: "Otimize seus freebets para máximo lucro",
  },
  {
    icon: TrendingUp,
    title: "Giros Grátis",
    description: "Aproveite promoções de casino com inteligência",
  },
];

const offerings = [
  {
    icon: BookOpen,
    title: "Instruções passo a passo",
    description: "Guias detalhados e fáceis de seguir",
  },
  {
    icon: Image,
    title: "Imagens explicativas",
    description: "Tutoriais visuais para melhor compreensão",
  },
  {
    icon: Link,
    title: "Links diretos",
    description: "Acesso direto para cada promoção",
  },
  {
    icon: Video,
    title: "Vídeos tutoriais",
    description: "Explicações simples em vídeo",
  },
  {
    icon: HeadphonesIcon,
    title: "Suporte rápido",
    description: "Resposta rápida para tirar dúvidas",
  },
];

const requirements = [
  {
    number: "1",
    title: "Um celular com internet",
    description: "Simples assim, só isso",
  },
  {
    number: "2",
    title: "Saber copiar e colar",
    description: "Básico de tecnologia",
  },
  {
    number: "3",
    title: "Vontade de mudar de vida",
    description: "O mais importante de tudo",
  },
];

export const About = () => {
  return (
    <section id="sobre" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Hero Stats */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            <span className="text-gradient">Shark 100% Green</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Sistema profissional de calculadoras matemáticas para otimização de apostas esportivas e arbitragem
          </p>
          
          <div className="stats-grid max-w-4xl mx-auto">
            <div className="stat-card">
              <div className="stat-value text-gradient">100%</div>
              <div className="stat-label">Precisão Matemática</div>
            </div>
            <div className="stat-card">
              <div className="stat-value text-gradient">2</div>
              <div className="stat-label">Calculadoras Avançadas</div>
            </div>
            <div className="stat-card">
              <div className="stat-value text-gradient">2500+</div>
              <div className="stat-label">Usuários Ativos</div>
            </div>
          </div>
        </div>

        {/* O que é o Shark Green */}
        <Card className="glass-card p-8 md:p-12 mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2 rounded-lg gradient-glow">
              <Fish className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-black text-center">
              O que é o Shark 100% Green?
            </h3>
          </div>
          <p className="text-lg text-center mb-8 max-w-3xl mx-auto">
            É o grupo que te mostra, de forma <strong>100% mastigada</strong>, como lucrar com apostas esportivas 
            e promoções de casas de aposta — mesmo sem entender nada!
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="text-center p-6 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-lg gradient-glow">
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* O que oferecemos */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-2 rounded-lg gradient-glow">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-black text-center">
              O que a gente te dá:
            </h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offerings.map((offering, index) => {
              const Icon = offering.icon;
              return (
                <Card
                  key={offering.title}
                  className="glass-card p-6 glow-hover"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg gradient-glow flex-shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold mb-1">{offering.title}</h4>
                      <p className="text-sm text-muted-foreground">{offering.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Requisitos */}
        <Card className="glass-card p-8 md:p-12 mb-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-2 rounded-lg gradient-glow">
              <ListChecks className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-black text-center">
              Você só precisa de 3 coisas:
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {requirements.map((req, index) => (
              <div
                key={req.number}
                className="text-center"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[hsl(var(--shark-gradient-start))] to-[hsl(var(--shark-gradient-end))] text-white text-2xl font-black flex items-center justify-center mx-auto mb-4">
                  {req.number}
                </div>
                <h4 className="text-xl font-bold mb-2">{req.title}</h4>
                <p className="text-muted-foreground">{req.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Calculadoras */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-2 rounded-lg gradient-glow">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-black text-center">
              Nossas Calculadoras
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="glass-card p-8 glow-hover">
              <h4 className="text-2xl font-bold mb-4 text-gradient">ArbiPro</h4>
              <p className="text-muted-foreground mb-6">
                Calculadora profissional de arbitragem para garantir lucro em qualquer resultado
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Suporte para até 6 casas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Cálculo de comissões</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Otimização de stakes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Suporte a lay bets</span>
                </li>
              </ul>
            </Card>

            <Card className="glass-card p-8 glow-hover">
              <h4 className="text-2xl font-bold mb-4 text-gradient">FreePro</h4>
              <p className="text-muted-foreground mb-6">
                Especializada em otimização de freebets e promoções específicas
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Maximização de freebets</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Cálculo de extrações</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Estratégias de cobertura</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Análise de cenários</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <Card className="glass-card p-8 md:p-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 rounded-lg gradient-glow">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black">
              Se você seguir o que a gente ensina, o lucro vem. Ponto final.
            </h3>
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            Comece agora mesmo com nossas calculadoras profissionais
          </p>
        </Card>
      </div>
    </section>
  );
};
