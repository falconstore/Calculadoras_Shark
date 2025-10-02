import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Mail, MessageSquare, DollarSign, HelpCircle, Instagram, Youtube, Phone, Star, CheckCircle, Wrench, Clock, Target, BookOpen, CreditCard, RefreshCw, BarChart, Rocket } from "lucide-react";

export const Contact = () => {
  return (
    <section id="contato" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 rounded-lg gradient-glow">
              <Phone className="w-6 h-6" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black">
              Entre em <span className="text-gradient">Contato</span>
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            O único grupo VIP do Brasil que realmente entrega lucro consistente em arbitragem de bônus. 
            Suporte personalizado e resultados comprovados.
          </p>
        </div>

        {/* Canais Principais */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-2 rounded-lg gradient-glow">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-black text-center">
              Canais Principais
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Telegram Group */}
            <Card className="glass-card p-6 glow-hover">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[hsl(var(--shark-gradient-start))] to-[hsl(var(--shark-gradient-end))] flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-2">Grupo Telegram FREE</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Comunidade ativa com +2500 membros
                </p>
                <div className="space-y-1 mb-6 text-sm">
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Estratégias gratuitas</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Comunidade ativa</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Suporte da equipe</span>
                  </div>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-[hsl(var(--shark-gradient-start))] to-[hsl(var(--shark-gradient-end))] hover:opacity-90"
                  asChild
                >
                  <a href="https://t.me/+M1SY4YU6T-pjYWQx" target="_blank" rel="noopener noreferrer">
                    Entrar no Grupo
                  </a>
                </Button>
              </div>
            </Card>

            {/* Instagram */}
            <Card className="glass-card p-6 glow-hover">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[hsl(var(--shark-gradient-start))] to-[hsl(var(--shark-gradient-end))] flex items-center justify-center mb-4">
                  <Instagram className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-2">Instagram Oficial</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Conteúdo exclusivo e novidades
                </p>
                <div className="space-y-1 mb-6 text-sm">
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Conteúdo visual</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Stories diárias</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Dicas rápidas</span>
                  </div>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-[hsl(var(--shark-gradient-start))] to-[hsl(var(--shark-gradient-end))] hover:opacity-90"
                  asChild
                >
                  <a href="https://www.instagram.com/_sharkgreen" target="_blank" rel="noopener noreferrer">
                    Seguir @_sharkgreen
                  </a>
                </Button>
              </div>
            </Card>

            {/* YouTube */}
            <Card className="glass-card p-6 glow-hover">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[hsl(var(--shark-gradient-start))] to-[hsl(var(--shark-gradient-end))] flex items-center justify-center mb-4">
                  <Youtube className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-2">Canal YouTube</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Tutoriais em vídeo e conteúdo exclusivo
                </p>
                <div className="space-y-1 mb-6 text-sm">
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Vídeos tutoriais</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Estratégias visuais</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Lives exclusivas</span>
                  </div>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-[hsl(var(--shark-gradient-start))] to-[hsl(var(--shark-gradient-end))] hover:opacity-90"
                  asChild
                >
                  <a href="https://www.youtube.com/@sharkuniverse" target="_blank" rel="noopener noreferrer">
                    Assistir Canal
                  </a>
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Suporte Especializado */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-2 rounded-lg gradient-glow">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-black text-center">
              Suporte Especializado
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Suporte Procedimentos */}
            <Card className="glass-card p-8 glow-hover">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg gradient-glow">
                  <HelpCircle className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-2">Suporte Procedimentos</h4>
                  <p className="text-muted-foreground">
                    Dúvidas sobre estratégias e procedimentos
                  </p>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm">Resposta em até 5 minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm">Especialistas em arbitragem</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-sm">Atendimento personalizado</span>
                </div>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-[hsl(var(--shark-gradient-start))] to-[hsl(var(--shark-gradient-end))] hover:opacity-90"
                asChild
              >
                <a href="https://t.me/SuporteSharkGreen_procedimentos" target="_blank" rel="noopener noreferrer">
                  Abrir Suporte
                </a>
              </Button>
            </Card>

            {/* Suporte Financeiro */}
            <Card className="glass-card p-8 glow-hover">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg gradient-glow">
                  <DollarSign className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-2">Suporte Financeiro</h4>
                  <p className="text-muted-foreground">
                    Questões sobre pagamentos e assinaturas
                  </p>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span className="text-sm">Pagamentos</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-primary" />
                  <span className="text-sm">Renovações e upgrades</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-primary" />
                  <span className="text-sm">Planos e preços</span>
                </div>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-[hsl(var(--shark-gradient-start))] to-[hsl(var(--shark-gradient-end))] hover:opacity-90"
                asChild
              >
                <a href="https://t.me/SuporteSharkGreen_financeiro" target="_blank" rel="noopener noreferrer">
                  Abrir Suporte
                </a>
              </Button>
            </Card>
          </div>
        </div>

        {/* Email Direto */}
        <Card className="glass-card p-8 md:p-12 text-center mb-12">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[hsl(var(--shark-gradient-start))] to-[hsl(var(--shark-gradient-end))] flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Contato Direto por E-mail</h3>
            <p className="text-muted-foreground mb-6">
              Para questões específicas ou parcerias comerciais
            </p>
            <Button
              variant="outline"
              className="border-primary/50 hover:bg-primary/10"
              asChild
            >
              <a href="mailto:sharkgreenvip@hotmail.com">
                sharkgreenvip@hotmail.com
              </a>
            </Button>
          </div>
        </Card>

        {/* CTA Final */}
        <Card className="glass-card p-8 md:p-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 rounded-lg gradient-glow">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black">
              Pronto para começar?
            </h3>
          </div>
          <p className="text-lg text-muted-foreground">
            Acesse nossas calculadoras profissionais agora mesmo
          </p>
        </Card>
      </div>
    </section>
  );
};
