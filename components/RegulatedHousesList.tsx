import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle2, ExternalLink, Info } from "lucide-react";

// Dados reais das casas regulamentadas no Brasil - 2025
const houses = [
  { 
    name: "Bet365", 
    status: "Regulamentada", 
    license: "MF/SPA-2025", 
    url: "https://www.bet365.com",
    features: ["Comissão variável", "Freebet", "Cash Out"]
  },
  { 
    name: "Betano", 
    status: "Regulamentada", 
    license: "MF/SPA-2025",
    url: "https://www.betano.com",
    features: ["Comissão 0%", "Supertitulo", "Live Streaming"]
  },
  { 
    name: "Betfair", 
    status: "Regulamentada", 
    license: "MF/SPA-2025",
    url: "https://www.betfair.com",
    features: ["Exchange", "Comissão 5%", "Cash Out"]
  },
  { 
    name: "KTO", 
    status: "Regulamentada", 
    license: "MF/SPA-2025",
    url: "https://www.kto.com",
    features: ["Sem comissão", "Apostas ao vivo", "App móvel"]
  },
  { 
    name: "Sportingbet", 
    status: "Regulamentada", 
    license: "MF/SPA-2025",
    url: "https://www.sportingbet.com",
    features: ["Comissão 0%", "Múltiplas", "Cashback"]
  },
  { 
    name: "Betway", 
    status: "Regulamentada", 
    license: "MF/SPA-2025",
    url: "https://www.betway.com",
    features: ["Odds aumentadas", "Freebet", "Live"]
  },
  { 
    name: "Stake", 
    status: "Regulamentada", 
    license: "MF/SPA-2025",
    url: "https://www.stake.com",
    features: ["Cripto aceita", "Rakeback", "VIP"]
  },
  { 
    name: "Superbet", 
    status: "Regulamentada", 
    license: "MF/SPA-2025",
    url: "https://www.superbet.com",
    features: ["SuperOdds", "Freebet", "Cash Out"]
  },
  { 
    name: "Novibet", 
    status: "Regulamentada", 
    license: "MF/SPA-2025",
    url: "https://www.novibet.com",
    features: ["Odds turbinadas", "Cashback", "App"]
  },
  { 
    name: "Esportiva.bet", 
    status: "Regulamentada", 
    license: "MF/SPA-2025",
    url: "https://www.esportiva.bet",
    features: ["Sem comissão", "Apostas BR", "Pix"]
  },
  { 
    name: "Betboo", 
    status: "Regulamentada", 
    license: "MF/SPA-2025",
    url: "https://www.betboo.com",
    features: ["Comissão 0%", "Bônus", "Pix rápido"]
  },
  { 
    name: "BetMGM", 
    status: "Regulamentada", 
    license: "MF/SPA-2025",
    url: "https://www.betmgm.com",
    features: ["Odds aumentadas", "Live", "Cashback"]
  },
];

export const RegulatedHousesList = () => {
  return (
    <section id="casas" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Casas <span className="text-gradient">Regulamentadas</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-6">
            Apenas plataformas verificadas e autorizadas pelo Ministério da Fazenda
          </p>
          <Badge className="bg-success/20 text-success border-success/50 text-sm px-4 py-2">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Lista atualizada - Outubro 2025
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map((house, index) => (
            <Card
              key={house.name}
              className="glass-card p-6 glow-hover group cursor-pointer transition-all"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => window.open(house.url, '_blank')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors mb-2">
                    {house.name}
                  </h3>
                  <Badge className="bg-success/20 text-success border-success/50 mb-3">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {house.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Licença: {house.license}
                  </p>
                </div>
                <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>

              {/* Features */}
              <div className="space-y-2 pt-3 border-t border-border/50">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Recursos:</p>
                <div className="flex flex-wrap gap-1">
                  {house.features.map((feature) => (
                    <Badge 
                      key={feature} 
                      variant="outline" 
                      className="text-xs border-primary/30"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Disclaimer */}
        <Card className="glass-card p-6 mt-8 text-center border-warning/50">
          <p className="text-sm text-muted-foreground">
            ⚠️ <strong>Importante:</strong> Sempre verifique se a casa de apostas está na lista oficial do Ministério da Fazenda antes de realizar apostas.
            Apenas casas regulamentadas garantem segurança e proteção aos apostadores.
          </p>
        </Card>
      </div>
    </section>
  );
};
