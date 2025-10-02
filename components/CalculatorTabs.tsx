import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculatorArbiProWrapper } from "./CalculatorArbiProWrapper";
import { CalculatorFreeProWrapper } from "./CalculatorFreeProWrapper";
import { Calculator, TrendingUp } from "lucide-react";

export const CalculatorTabs = () => {
  const [activeTab, setActiveTab] = useState("arbipro");

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
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 h-14 p-1 bg-background/50 backdrop-blur-sm border border-border/50">
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
          </TabsList>

          <TabsContent value="arbipro" className="mt-0">
            <CalculatorArbiProWrapper />
          </TabsContent>

          <TabsContent value="freepro" className="mt-0">
            <CalculatorFreeProWrapper />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
