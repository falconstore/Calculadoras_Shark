import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculatorArbiProWrapper } from "./CalculatorArbiProWrapper";
import { CalculatorFreeProWrapper } from "./CalculatorFreeProWrapper";
import { CalculatorMultiLayWrapper } from "./CalculatorMultiLayWrapper";
import { Calculator, TrendingUp, Layers } from "lucide-react";

export const CalculatorTabs = () => {
  const [activeTab, setActiveTab] = useState("arbipro");

  // Detectar qual calculadora abrir baseado nos parâmetros da URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Parâmetros exclusivos da FreePro
    const freeproParams = ['mode', 'ho', 'hc', 'qs', 'fv', 'er', 'co', 'cc', 'cs', 'cr', 'entries', 'numEntries'];
    
    // Parâmetros exclusivos da ArbiPro  
    const arbiproParams = ['n', 'h', 'sc', 'si'];

    // Parâmetros exclusivos da MultiLay
    const multilayParams = ['ml', 'mlt', 'mle', 'mlf', 'mlo', 'mln', 'mlb'];
    
    // Verificar se tem parâmetros da FreePro
    const hasFreePro = freeproParams.some(param => params.has(param));
    
    // Verificar se tem parâmetros da ArbiPro
    const hasArbiPro = arbiproParams.some(param => params.has(param));

    // Verificar se tem parâmetros da MultiLay
    const hasMultiLay = multilayParams.some(param => params.has(param));
    
    // Se tem parâmetros da FreePro e NÃO tem da ArbiPro, abrir FreePro
    if (hasFreePro && !hasArbiPro && !hasMultiLay) {
      setActiveTab("freepro");
    } else if (hasMultiLay && !hasArbiPro && !hasFreePro) {
      setActiveTab("multilay");
    }
  }, []);

  return (
    <section id="calculadoras" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Nossas <span className="text-gradient">Calculadoras</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Ferramentas profissionais para maximizar seus lucros
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-xl mx-auto grid-cols-3 mb-8 h-14 p-1 bg-background/50 backdrop-blur-sm border border-border/50">
            <TabsTrigger 
              value="arbipro" 
              className="text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--shark-gradient-start))] data-[state=active]:to-[hsl(var(--shark-gradient-end))] data-[state=active]:text-white transition-all duration-300"
            >
              <Calculator className="w-5 h-5 mr-2" />
              ArbiPro
            </TabsTrigger>
            <TabsTrigger 
              value="freepro" 
              className="text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--shark-gradient-start))] data-[state=active]:to-[hsl(var(--shark-gradient-end))] data-[state=active]:text-white transition-all duration-300"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              FreePro
            </TabsTrigger>
            <TabsTrigger 
              value="multilay" 
              className="text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--shark-gradient-start))] data-[state=active]:to-[hsl(var(--shark-gradient-end))] data-[state=active]:text-white transition-all duration-300"
            >
              <Layers className="w-5 h-5 mr-2" />
              MultiLay
            </TabsTrigger>
          </TabsList>

          <TabsContent value="arbipro" className="mt-0">
            <CalculatorArbiProWrapper />
          </TabsContent>

          <TabsContent value="freepro" className="mt-0">
            <CalculatorFreeProWrapper />
          </TabsContent>

          <TabsContent value="multilay" className="mt-0">
            <CalculatorMultiLayWrapper />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
