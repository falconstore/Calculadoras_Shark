import { useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle2 } from "lucide-react";

declare global {
  interface Window {
    CasasRegulamentadas?: any;
  }
}

export const CasasRegulamentadasWrapper = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    
    const initCasas = () => {
      if (window.CasasRegulamentadas && containerRef.current) {
        try {
          const casas = new window.CasasRegulamentadas();
          casas.init();
          casas.onPageActivated();
          initializedRef.current = true;
        } catch (error) {
          console.error('Erro ao inicializar Casas Regulamentadas:', error);
        }
      }
    };

    // Tentar inicializar imediatamente
    if (window.CasasRegulamentadas) {
      initCasas();
    } else {
      // Aguardar o script carregar
      const checkInterval = setInterval(() => {
        if (window.CasasRegulamentadas) {
          initCasas();
          clearInterval(checkInterval);
        }
      }, 100);

      // Timeout de segurança
      setTimeout(() => clearInterval(checkInterval), 5000);
    }
  }, []);

  return (
    <section id="casas" className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Casas <span className="text-gradient">Regulamentadas</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-6">
            Lista oficial do Ministério da Fazenda com CNPJ, portarias e domínios
          </p>
          <Badge className="bg-success/20 text-success border-success/50 text-sm px-4 py-2">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Atualizada - Outubro 2025
          </Badge>
        </div>

        <Card className="glass-card p-6 md:p-8">
          <div id="casas-content" ref={containerRef}></div>
        </Card>
      </div>
    </section>
  );
};
