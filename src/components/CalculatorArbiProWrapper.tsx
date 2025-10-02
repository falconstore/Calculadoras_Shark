import { useEffect, useRef } from "react";

declare global {
  interface Window {
    ArbiPro?: any;
  }
}

export const CalculatorArbiProWrapper = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    
    const initCalculator = () => {
      if (window.ArbiPro && containerRef.current) {
        try {
          const calculator = new window.ArbiPro();
          calculator.init();
          initializedRef.current = true;
        } catch (error) {
          console.error('Erro ao inicializar ArbiPro:', error);
        }
      }
    };

    // Tentar inicializar imediatamente
    if (window.ArbiPro) {
      initCalculator();
    } else {
      // Aguardar o script carregar
      const checkInterval = setInterval(() => {
        if (window.ArbiPro) {
          initCalculator();
          clearInterval(checkInterval);
        }
      }, 100);

      // Timeout de segurança
      setTimeout(() => clearInterval(checkInterval), 5000);
    }
  }, []);

  return (
    <div className="w-full">
      <div id="panel-1" className="w-full">
        <div id="app" ref={containerRef} className="calculator-container"></div>
      </div>
    </div>
  );
};
