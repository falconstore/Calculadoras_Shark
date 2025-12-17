import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HandicapTable } from "./HandicapTable";
import { HandicapEuropeanTable } from "./HandicapEuropeanTable";
import { HandicapProtection } from "./HandicapProtection";
import { CasasRegulamentadasWrapper } from "./CasasRegulamentadasWrapper";
import { CasasArbbetList } from "./CasasArbbetList";
import { Target, Shield, ShieldCheck, Globe, Database } from "lucide-react";

export const HandicapTabs = () => {
  const [activeTab, setActiveTab] = useState("handicap-asiatico");

  return (
    <section id="handicap-casas" className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-5xl mx-auto grid-cols-5 mb-8 h-14 p-1 bg-background/50 backdrop-blur-sm border border-border/50">
            <TabsTrigger 
              value="handicap-asiatico" 
              className="text-xs md:text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--shark-gradient-start))] data-[state=active]:to-[hsl(var(--shark-gradient-end))] data-[state=active]:text-white transition-all duration-300"
            >
              <Target className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">HA Asiático</span>
              <span className="sm:hidden">HA Asia</span>
            </TabsTrigger>
            <TabsTrigger 
              value="handicap-europeu" 
              className="text-xs md:text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--shark-gradient-start))] data-[state=active]:to-[hsl(var(--shark-gradient-end))] data-[state=active]:text-white transition-all duration-300"
            >
              <Globe className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">HA Europeu</span>
              <span className="sm:hidden">HA Euro</span>
            </TabsTrigger>
            <TabsTrigger 
              value="protection" 
              className="text-xs md:text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--shark-gradient-start))] data-[state=active]:to-[hsl(var(--shark-gradient-end))] data-[state=active]:text-white transition-all duration-300"
            >
              <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Proteção</span>
              <span className="sm:hidden">Proteção</span>
            </TabsTrigger>
            <TabsTrigger 
              value="casas" 
              className="text-xs md:text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--shark-gradient-start))] data-[state=active]:to-[hsl(var(--shark-gradient-end))] data-[state=active]:text-white transition-all duration-300"
            >
              <Shield className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Casas Regulamentadas</span>
              <span className="sm:hidden">Casas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="info-casas" 
              className="text-xs md:text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--shark-gradient-start))] data-[state=active]:to-[hsl(var(--shark-gradient-end))] data-[state=active]:text-white transition-all duration-300"
            >
              <Database className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Info Casas</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="handicap-asiatico" className="mt-0">
            <HandicapTable />
          </TabsContent>

          <TabsContent value="handicap-europeu" className="mt-0">
            <HandicapEuropeanTable />
          </TabsContent>

          <TabsContent value="protection" className="mt-0">
            <HandicapProtection />
          </TabsContent>

          <TabsContent value="casas" className="mt-0">
            <CasasRegulamentadasWrapper />
          </TabsContent>

          <TabsContent value="info-casas" className="mt-0">
            <CasasArbbetList />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
