import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingUp, TrendingDown, DollarSign, AlertCircle, Link, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Bet {
  datetime: string;
  name: string;
  odd: number;
  commission: number;
  hedgeType: "lay" | "back";
}

export const CalculatorMultiLay = () => {
  const [freebetValue, setFreebetValue] = useState(20);
  const [finalOdd, setFinalOdd] = useState(13.48);
  const [extractionPercent, setExtractionPercent] = useState(68);
  const [numberOfBets, setNumberOfBets] = useState(2);
  const [betType, setBetType] = useState("freebet");
  const [isSharing, setIsSharing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  const [bets, setBets] = useState<Bet[]>([
    { datetime: "", name: "", odd: 3.25, commission: 2.8, hedgeType: "lay" },
    { datetime: "", name: "", odd: 2.66, commission: 2.8, hedgeType: "lay" },
    { datetime: "", name: "", odd: 2.36, commission: 2.8, hedgeType: "lay" },
    { datetime: "", name: "", odd: 2.00, commission: 2.8, hedgeType: "lay" },
    { datetime: "", name: "", odd: 2.00, commission: 2.8, hedgeType: "lay" },
    { datetime: "", name: "", odd: 2.00, commission: 2.8, hedgeType: "lay" },
    { datetime: "", name: "", odd: 2.00, commission: 2.8, hedgeType: "lay" }
  ]);

  // Carregar dados da URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has("ml") || params.has("mlt") || params.has("mlf")) {
      if (params.has("mlt")) setBetType(params.get("mlt") || "freebet");
      if (params.has("mlf")) setFreebetValue(parseFloat(params.get("mlf") || "20"));
      if (params.has("mlo")) setFinalOdd(parseFloat(params.get("mlo") || "13.48"));
      if (params.has("mle")) setExtractionPercent(parseFloat(params.get("mle") || "68"));
      if (params.has("mln")) setNumberOfBets(parseInt(params.get("mln") || "2"));
      
      if (params.has("mlb")) {
        try {
          const betsData = JSON.parse(decodeURIComponent(params.get("mlb") || "[]"));
          if (Array.isArray(betsData) && betsData.length > 0) {
            // Handle migration from old 'lay' field to new 'odd' field and add hedgeType
            const migratedBets = betsData.map((bet: any) => ({
              datetime: bet.datetime || "",
              name: bet.name || "",
              odd: bet.odd ?? bet.lay ?? 2.0,
              commission: bet.commission ?? 2.8,
              hedgeType: bet.hedgeType || "lay"
            }));
            setBets(migratedBets);
          }
        } catch (e) {
          console.error("Error parsing bets from URL:", e);
        }
      }
    }
  }, []);

  const serializeState = () => {
    const params = new URLSearchParams();
    params.set("ml", "1"); // Marker for MultiLay
    params.set("mlt", betType);
    params.set("mlf", freebetValue.toString());
    params.set("mlo", finalOdd.toString());
    params.set("mle", extractionPercent.toString());
    params.set("mln", numberOfBets.toString());
    
    const betsToSave = bets.slice(0, numberOfBets);
    params.set("mlb", encodeURIComponent(JSON.stringify(betsToSave)));
    
    return params.toString();
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const queryString = serializeState();
      const url = `${window.location.origin}${window.location.pathname}?${queryString}#calculadoras`;
      
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "Compartilhe o link para recriar este cálculo.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleClear = () => {
    setIsClearing(true);
    setFreebetValue(20);
    setFinalOdd(13.48);
    setExtractionPercent(68);
    setNumberOfBets(2);
    setBetType("freebet");
    setBets([
      { datetime: "", name: "", odd: 3.25, commission: 2.8, hedgeType: "lay" },
      { datetime: "", name: "", odd: 2.66, commission: 2.8, hedgeType: "lay" },
      { datetime: "", name: "", odd: 2.36, commission: 2.8, hedgeType: "lay" },
      { datetime: "", name: "", odd: 2.00, commission: 2.8, hedgeType: "lay" },
      { datetime: "", name: "", odd: 2.00, commission: 2.8, hedgeType: "lay" },
      { datetime: "", name: "", odd: 2.00, commission: 2.8, hedgeType: "lay" },
      { datetime: "", name: "", odd: 2.00, commission: 2.8, hedgeType: "lay" }
    ]);
    
    // Limpar URL
    window.history.replaceState({}, "", window.location.pathname);
    
    toast({
      title: "Calculadora resetada",
      description: "Todos os valores foram restaurados.",
    });
    setIsClearing(false);
  };

  const updateBet = (index: number, field: keyof Bet, value: string | number) => {
    const newBets = [...bets];
    (newBets[index] as any)[field] = value;
    setBets(newBets);
  };

  // Cálculos
  const targetValue = freebetValue * (extractionPercent / 100);
  
  const calculations: Array<{
    stake: number;
    liability: number;
    commission: number;
    netProfit: number;
    realProfit: number;
    hedgeType: "lay" | "back";
  }> = [];
  
  let accumulatedLoss = 0; // No Lay é responsabilidade, no Back é a Stake perdida

  for (let i = 0; i < numberOfBets; i++) {
    const currentBet = bets[i];
    const isLay = currentBet.hedgeType === "lay";
    let amountToCover;
    let stake, profit, risk, commission;

    // 1. Define quanto precisamos recuperar
    if (betType === "simple") {
      amountToCover = targetValue + accumulatedLoss + freebetValue;
    } else {
      amountToCover = targetValue + accumulatedLoss;
    }

    if (isLay) {
      // --- LÓGICA LAY (EXCHANGE) ---
      stake = amountToCover / (1 - currentBet.commission / 100);
      risk = stake * (currentBet.odd - 1); 
      commission = stake * (currentBet.commission / 100);
      profit = stake - commission;
    } else {
      // --- LÓGICA BACK (CASA) ---
      stake = amountToCover / (currentBet.odd - 1);
      risk = stake; // No Back, o risco é a própria Stake
      commission = 0; // Back geralmente não tem comissão
      profit = (stake * currentBet.odd) - stake;
    }
    
    accumulatedLoss += risk;
    
    // Cálculo do Lucro Real
    let realProfit;
    if (betType === "simple") {
      realProfit = profit - (accumulatedLoss - risk) - freebetValue; 
    } else {
      realProfit = profit - (accumulatedLoss - risk);
    }
    
    calculations.push({
      stake,
      liability: risk,
      commission,
      netProfit: profit,
      realProfit,
      hedgeType: currentBet.hedgeType
    });
  }
  
  const bancaNecessaria = calculations.reduce((sum, calc) => sum + calc.liability, 0);
  
  const houseBalance = betType === "freebet" 
    ? freebetValue * (finalOdd - 1)
    : freebetValue * finalOdd;
  
  const profitIfExchange = targetValue;
  
  const profitIfHouse = betType === "simple"
    ? houseBalance - bancaNecessaria - freebetValue
    : houseBalance - bancaNecessaria;

  const percentIfExchange = (profitIfExchange / freebetValue) * 100;
  const percentIfHouse = (profitIfHouse / freebetValue) * 100;

  const betColors = [
    "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    "from-purple-500/20 to-purple-600/20 border-purple-500/30",
    "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30",
    "from-pink-500/20 to-pink-600/20 border-pink-500/30",
    "from-amber-500/20 to-amber-600/20 border-amber-500/30",
    "from-green-500/20 to-green-600/20 border-green-500/30",
    "from-red-500/20 to-red-600/20 border-red-500/30"
  ];

  // Verificar se todas as apostas são do mesmo tipo (para labels globais)
  const allLay = bets.slice(0, numberOfBets).every(b => b.hedgeType === "lay");
  const allBack = bets.slice(0, numberOfBets).every(b => b.hedgeType === "back");
  const mixedType = !allLay && !allBack;
  
  const globalHedgeLabel = allLay ? "Exchange" : allBack ? "Back" : "Hedge";
  const profitLabel = allLay ? "Lucro se Exchange" : allBack ? "Lucro se Hedge" : "Lucro se Hedge";

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center px-2">
        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          Calculadora Multi-Hedge
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground">
          Calcule a extração ideal da sua Freebet com contra-apostas sequenciais
          {mixedType ? " (LAY + BACK)" : allLay ? " via Exchange" : " via Casas de Apostas"}
        </p>
      </div>

      {/* Configurações Principais */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Configurações da Freebet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm text-muted-foreground">Tipo de Aposta</Label>
              <Select value={betType} onValueChange={(value) => setBetType(value)}>
                <SelectTrigger className="bg-background/50 border-border h-10 sm:h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freebet">Aposta Freebet</SelectItem>
                  <SelectItem value="simple">Aposta Simples</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm text-muted-foreground">
                Valor da {betType === "freebet" ? "Freebet" : "Aposta"} (R$)
              </Label>
              <Input
                type="number"
                value={freebetValue}
                onChange={(e) => setFreebetValue(parseFloat(e.target.value) || 0)}
                className="bg-background/50 border-border font-semibold h-10 sm:h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm text-muted-foreground">Odd Final do Bilhete</Label>
              <Input
                type="number"
                step="0.01"
                value={finalOdd}
                onChange={(e) => setFinalOdd(parseFloat(e.target.value) || 0)}
                className="bg-background/50 border-border font-semibold h-10 sm:h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm text-muted-foreground">Número de Apostas</Label>
              <Select value={numberOfBets.toString()} onValueChange={(value) => setNumberOfBets(parseInt(value))}>
                <SelectTrigger className="bg-background/50 border-border h-10 sm:h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Entradas</SelectItem>
                  <SelectItem value="3">3 Entradas</SelectItem>
                  <SelectItem value="4">4 Entradas</SelectItem>
                  <SelectItem value="5">5 Entradas</SelectItem>
                  <SelectItem value="6">6 Entradas</SelectItem>
                  <SelectItem value="7">7 Entradas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-xs sm:text-sm text-muted-foreground">% Objetivo da Extração</Label>
              <span className="text-lg sm:text-xl font-bold text-primary">{extractionPercent}%</span>
            </div>
            <div className="py-2">
              <Slider
                value={[extractionPercent]}
                onValueChange={(value) => setExtractionPercent(value[0])}
                min={betType === "simple" ? -20 : 0}
                max={betType === "simple" ? 50 : 100}
                step={betType === "simple" ? 0.1 : 1}
                className="w-full touch-pan-y"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{betType === "simple" ? "-20%" : "0%"}</span>
              <span>{betType === "simple" ? "15%" : "50%"}</span>
              <span>{betType === "simple" ? "50%" : "100%"}</span>
            </div>
          </div>

          <div className="bg-primary/10 rounded-xl p-3 sm:p-4 text-center border border-primary/20">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Valor Objetivo da Freebet</p>
            <p className="text-2xl sm:text-3xl font-black text-primary">R$ {targetValue.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Resultados Finais */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Resultados Finais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-muted/30 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Odd Final</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{finalOdd.toFixed(2)}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Saldo na Casa</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">R$ {houseBalance.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-2 border-emerald-500/50 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                <div>
                  <p className="font-semibold text-emerald-300 text-sm sm:text-base">{profitLabel}</p>
                  <p className="text-xs text-emerald-400/70">Cenário Ideal</p>
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 mb-1 sm:mb-2">R$ {profitIfExchange.toFixed(2)}</p>
              <p className="text-xs sm:text-sm text-emerald-300">{percentIfExchange.toFixed(2)}%</p>
            </div>

            <div className={`bg-gradient-to-br ${profitIfHouse >= 0 ? 'from-amber-500/20 to-amber-600/20 border-amber-500/50' : 'from-red-500/20 to-red-600/20 border-red-500/50'} border-2 rounded-xl p-4 sm:p-6`}>
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                {profitIfHouse >= 0 ? (
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                )}
                <div>
                  <p className={`font-semibold text-sm sm:text-base ${profitIfHouse >= 0 ? 'text-amber-300' : 'text-red-300'}`}>Lucro se Casa</p>
                  <p className={`text-xs ${profitIfHouse >= 0 ? 'text-amber-400/70' : 'text-red-400/70'}`}>Cenário Alternativo</p>
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-black ${profitIfHouse >= 0 ? 'text-amber-400' : 'text-red-400'} mb-1 sm:mb-2`}>
                {profitIfHouse >= 0 ? 'R$ ' : '-R$ '}{Math.abs(profitIfHouse).toFixed(2)}
              </p>
              <p className={`text-xs sm:text-sm ${profitIfHouse >= 0 ? 'text-amber-300' : 'text-red-300'}`}>
                {percentIfHouse >= 0 ? '+' : ''}{percentIfHouse.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="bg-muted/30 rounded-xl p-3 sm:p-4 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
            <div className="text-center flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                {allLay ? "Banca Necessária" : allBack ? "Investimento Total" : "Banca/Investimento Total"}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">R$ {bancaNecessaria.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apostas Dinâmicas */}
      {[...Array(numberOfBets)].map((_, index) => {
        const isLay = bets[index].hedgeType === "lay";
        const oddLabel = isLay ? "Odd LAY" : "Odd BACK";
        const stakeLabel = isLay ? "Stake Lay" : "Stake Back";
        const riskLabel = isLay ? "Responsabilidade" : "Risco (Stake)";
        const hedgeLabel = isLay ? "Exchange" : "Back";
        
        return (
        <Card key={index} className={`bg-gradient-to-br ${betColors[index]} border overflow-hidden`}>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-bold">
                APOSTA {index + 1}
              </CardTitle>
              <Select 
                value={bets[index].hedgeType} 
                onValueChange={(value) => updateBet(index, 'hedgeType', value)}
              >
                <SelectTrigger className="w-[110px] h-8 text-xs bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lay">LAY</SelectItem>
                  <SelectItem value="back">BACK</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isLay ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-3`}>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm text-muted-foreground">Horário - Data</Label>
                <Input
                  type="text"
                  placeholder="Ex: 15:00 - 20/01"
                  value={bets[index].datetime}
                  onChange={(e) => updateBet(index, 'datetime', e.target.value)}
                  className="bg-background/50 border-border h-10"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm text-muted-foreground">Nome do Jogo</Label>
                <Input
                  type="text"
                  placeholder="Ex: Time A vs Time B"
                  value={bets[index].name}
                  onChange={(e) => updateBet(index, 'name', e.target.value)}
                  className="bg-background/50 border-border h-10"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm text-muted-foreground">{oddLabel}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={bets[index].odd}
                  onChange={(e) => updateBet(index, 'odd', parseFloat(e.target.value) || 0)}
                  className="bg-background/50 border-border h-10"
                />
              </div>
              {isLay && (
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm text-muted-foreground">Comissão (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={bets[index].commission}
                    onChange={(e) => updateBet(index, 'commission', parseFloat(e.target.value) || 0)}
                    className="bg-background/50 border-border h-10"
                  />
                </div>
              )}
            </div>

            <div className={`grid ${isLay ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-3"} gap-2 sm:gap-3 pt-2`}>
              <div className="bg-background/30 rounded-lg p-2 sm:p-3 text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">{stakeLabel}</p>
                <p className="text-sm sm:text-lg font-bold text-foreground">R$ {calculations[index]?.stake.toFixed(2)}</p>
              </div>
              <div className="bg-background/30 rounded-lg p-2 sm:p-3 text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">{riskLabel}</p>
                <p className="text-sm sm:text-lg font-bold text-foreground">R$ {calculations[index]?.liability.toFixed(2)}</p>
              </div>
              {isLay && (
                <div className="bg-background/30 rounded-lg p-2 sm:p-3 text-center">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Comissão</p>
                  <p className="text-sm sm:text-lg font-bold text-foreground">R$ {calculations[index]?.commission.toFixed(2)}</p>
                </div>
              )}
              <div className="bg-background/30 rounded-lg p-2 sm:p-3 text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Lucro Líquido</p>
                <p className="text-sm sm:text-lg font-bold text-emerald-400">R$ {calculations[index]?.realProfit.toFixed(2)}</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground text-center pt-2 border-t border-border/30">
              {index < numberOfBets - 1 
                ? `Se der ${hedgeLabel}, finaliza. Se der CASA, fazer aposta ${index + 2}.`
                : `Se der ${hedgeLabel}, finaliza a operação.`
              }
            </p>
          </CardContent>
        </Card>
        );
      })}

      {/* Resultados Detalhados - Estilo Shark ArbiPro */}
      <Card className="glass-card border-border/50 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/shark-logo-watermark.png')" }}
        />
        
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
            Resultados Shark Multi-Hedge
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6 relative z-10">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-muted/30 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-primary">{extractionPercent}%</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Extração Objetivo</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-emerald-400">R$ {bancaNecessaria.toFixed(2)}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {allLay ? "Banca Necessária" : allBack ? "Investimento Total" : "Banca/Investimento"}
              </p>
            </div>
          </div>
          
          {/* Tabela de Resultados */}
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[700px] sm:min-w-0">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-bold uppercase">Casa</th>
                  <th className="p-2 sm:p-3 text-center text-[10px] sm:text-xs font-bold uppercase">Tipo</th>
                  <th className="p-2 sm:p-3 text-center text-[10px] sm:text-xs font-bold uppercase">Odd</th>
                  <th className="p-2 sm:p-3 text-center text-[10px] sm:text-xs font-bold uppercase">Comissão</th>
                  <th className="p-2 sm:p-3 text-center text-[10px] sm:text-xs font-bold uppercase">Stake</th>
                  <th className="p-2 sm:p-3 text-center text-[10px] sm:text-xs font-bold uppercase">Risco</th>
                  <th className="p-2 sm:p-3 text-center text-[10px] sm:text-xs font-bold uppercase">
                    Lucro Hedge
                  </th>
                  <th className="p-2 sm:p-3 text-center text-[10px] sm:text-xs font-bold uppercase">Lucro Casa</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(numberOfBets)].map((_, index) => {
                  const lucroSeExchange = calculations[index]?.realProfit || 0;
                  const lucroSeCasa = index === numberOfBets - 1 
                    ? profitIfHouse 
                    : -(calculations[index]?.liability || 0);
                  const isLay = bets[index].hedgeType === "lay";
                  
                  return (
                    <tr key={index} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-2 sm:p-3 font-semibold text-xs sm:text-sm">
                        {bets[index].name || `Aposta ${index + 1}`}
                      </td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isLay ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {bets[index].hedgeType.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">{bets[index].odd.toFixed(2)}</td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">
                        {isLay ? `${bets[index].commission.toFixed(1)}%` : "-"}
                      </td>
                      <td className="p-2 sm:p-3 text-center font-semibold text-xs sm:text-sm">
                        R$ {calculations[index]?.stake.toFixed(2)}
                      </td>
                      <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">
                        R$ {calculations[index]?.liability.toFixed(2)}
                      </td>
                      <td className="p-2 sm:p-3 text-center text-emerald-400 font-bold text-xs sm:text-sm">
                        R$ {lucroSeExchange.toFixed(2)}
                      </td>
                      <td className={`p-2 sm:p-3 text-center font-bold text-xs sm:text-sm ${lucroSeCasa >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                        {lucroSeCasa >= 0 ? 'R$ ' : '-R$ '}{Math.abs(lucroSeCasa).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-muted/30 font-bold">
                  <td className="p-2 sm:p-3 text-xs sm:text-sm" colSpan={4}>TOTAIS</td>
                  <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">
                    R$ {calculations.reduce((sum, c) => sum + (c?.stake || 0), 0).toFixed(2)}
                  </td>
                  <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">
                    R$ {bancaNecessaria.toFixed(2)}
                  </td>
                  <td className="p-2 sm:p-3 text-center text-emerald-400 text-xs sm:text-sm">
                    R$ {profitIfExchange.toFixed(2)}
                  </td>
                  <td className={`p-2 sm:p-3 text-center text-xs sm:text-sm ${profitIfHouse >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                    {profitIfHouse >= 0 ? 'R$ ' : '-R$ '}{Math.abs(profitIfHouse).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação - Estilo ArbiPro */}
      <div className="flex justify-center gap-3 sm:gap-4 flex-wrap">
        <Button
          onClick={handleShare}
          disabled={isSharing}
          className="min-w-[160px] sm:min-w-[180px] bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold uppercase tracking-wide shadow-lg hover:shadow-emerald-500/25 transition-all"
        >
          {isSharing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Link className="w-4 h-4 mr-2" />
          )}
          Compartilhar
        </Button>
        
        <Button
          onClick={handleClear}
          disabled={isClearing}
          variant="outline"
          className="min-w-[160px] sm:min-w-[180px] border-2 border-border hover:border-primary font-bold uppercase tracking-wide transition-all"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Limpar Dados
        </Button>
      </div>
    </div>
  );
};
