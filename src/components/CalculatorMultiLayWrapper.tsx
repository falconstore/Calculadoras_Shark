import { useState, useEffect } from "react";
import { CalculatorMultiLay } from "./CalculatorMultiLay";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";

export const CalculatorMultiLayWrapper = () => {
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dev") === "shark") {
      setIsDev(true);
    }
  }, []);

  if (!isDev) {
    return (
      <Card className="glass-card border-border/50">
        <CardContent className="p-8 sm:p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20">
              <Layers className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              MultiLay - Em Breve
            </h3>
            <p className="text-muted-foreground max-w-md">
              Esta calculadora está em desenvolvimento e será lançada em breve! 
              Fique atento às novidades.
            </p>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500 px-4 py-1">
              🚀 Coming Soon
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <CalculatorMultiLay />;
};
