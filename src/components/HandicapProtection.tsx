import { useState } from "react";
import { Target, Info } from "lucide-react";

interface Scenario {
  description: string;
  result: string;
  resultClass: 'win' | 'lose';
  betOrProtection: 'Aposta' | 'Proteção';
}
export const HandicapProtection = () => {
  const [betType, setBetType] = useState("");
  const [customGoals, setCustomGoals] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [handicap, setHandicap] = useState(0);
  const [goalDiff, setGoalDiff] = useState(0);

  const betMap: Record<string, number> = {
    'win1': 1,
    'win2': 2,
    'win3': 3,
    'win4': 4,
    'win5': 5
  };

  const handleBetTypeChange = (value: string) => {
    setBetType(value);
    if (value === 'custom') {
      setShowResult(false);
    } else if (value !== '') {
      calculateHandicap(value);
    } else {
      setShowResult(false);
    }
  };

  const handleCustomGoalsChange = (value: string) => {
    setCustomGoals(value);
    const numValue = parseInt(value);
    if (numValue && numValue > 0) {
      calculateHandicap('custom', numValue);
    }
  };

  const calculateHandicap = (type: string, customValue?: number) => {
    let diff: number;
    
    if (type === 'custom' && customValue) {
      diff = customValue;
    } else {
      diff = betMap[type];
    }
    
    if (!diff) return;
    
    // Handicap Asiático: diff - 0.5
    const calculatedHandicap = diff - 0.5;
    setHandicap(calculatedHandicap);
    setGoalDiff(diff);
    setShowResult(true);
  };

  const selectBet = (type: string) => {
    setBetType(type);
    calculateHandicap(type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateScenarios = (): Scenario[] => {
    const scenarios: Scenario[] = [];
    
    // Cenários para Handicap Asiático
    if (goalDiff === 1) {
      scenarios.push({
        description: 'Vence por 1+ gol (ex: 1x0, 2x1, 3x0)',
        result: '✓ GANHA',
        resultClass: 'win',
        betOrProtection: 'Aposta'
      });
    } else {
      scenarios.push({
        description: `Vence por ${goalDiff}+ gols (ex: ${goalDiff}x0, ${goalDiff+1}x1)`,
        result: '✓ GANHA',
        resultClass: 'win',
        betOrProtection: 'Aposta'
      });
    }
    
    if (goalDiff > 1) {
      const examples: string[] = [];
      for (let i = 1; i < goalDiff; i++) {
        examples.push(`${i}x0`);
        if (i > 1) examples.push(`${i}x${i-1}`);
      }
      scenarios.push({
        description: `Vence por menos de ${goalDiff} gols (ex: ${examples.slice(0, 2).join(', ')})`,
        result: '✗ PERDE',
        resultClass: 'lose',
        betOrProtection: 'Proteção'
      });
    }
    
    scenarios.push({
      description: 'Empate (ex: 0x0, 1x1, 2x2)',
      result: '✗ PERDE',
      resultClass: 'lose',
      betOrProtection: 'Proteção'
    });
    
    scenarios.push({
      description: 'Time perde (ex: 0x1, 1x2)',
      result: '✗ PERDE',
      resultClass: 'lose',
      betOrProtection: 'Proteção'
    });
    
    return scenarios;
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-black mb-3">
          <span className="text-gradient">Proteção de Handicap</span>
        </h2>
        <p className="text-lg text-muted-foreground font-semibold">
          Descubra qual handicap usar para proteger sua aposta de vitória por X gols
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Info Box */}
        <div className="bg-info/10 border-l-4 border-info rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
            <div className="text-sm text-foreground">
              <strong>Como funciona:</strong> Quando você aposta em "Time ganhar por 2 ou mais gols", pode proteger essa aposta usando o Handicap Asiático correspondente. Esta ferramenta mostra exatamente qual handicap usar!
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-card border border-border/50 rounded-lg p-6 space-y-5">
          <div className="space-y-3">
            <label className="block font-bold text-foreground">
              Tipo de Aposta:
            </label>
            <select
              value={betType}
              onChange={(e) => handleBetTypeChange(e.target.value)}
              className="w-full px-4 py-3 text-base border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">-- Selecione o tipo de aposta --</option>
              <option value="win1">Time ganhar por 1 gol ou mais</option>
              <option value="win2">Time ganhar por 2 gols ou mais</option>
              <option value="win3">Time ganhar por 3 gols ou mais</option>
              <option value="win4">Time ganhar por 4 gols ou mais</option>
              <option value="win5">Time ganhar por 5 gols ou mais</option>
              <option value="custom">Personalizado (digite a diferença)</option>
            </select>
          </div>

          {betType === 'custom' && (
            <div className="space-y-3">
              <label className="block font-bold text-foreground">
                Diferença de gols mínima:
              </label>
              <input
                type="number"
                value={customGoals}
                onChange={(e) => handleCustomGoalsChange(e.target.value)}
                min="1"
                max="10"
                placeholder="Ex: 2"
                className="w-full px-4 py-3 text-base border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}
        </div>

        {/* Result Section */}
        {showResult && (
          <div className="bg-card border-2 border-success rounded-lg p-6 space-y-5 animate-fade-in">
            <div className="text-center">
              <div className="text-xl font-bold text-success mb-4 flex items-center justify-center gap-2">
                <Target className="w-6 h-6" />
                HANDICAP RECOMENDADO
              </div>
              
              <div className="bg-background border-2 border-success rounded-lg p-6 mb-5">
                <div className="text-5xl font-black text-success mb-2">
                  -{handicap.toFixed(1)}
                </div>
                <div className="text-lg text-muted-foreground">
                  Handicap Asiático -{handicap.toFixed(1)}
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-warning/10 border-l-4 border-warning rounded-lg p-4 text-left">
                <div className="font-bold text-foreground mb-2">
                  📋 Por que este handicap?
                </div>
                <div className="text-sm text-foreground leading-relaxed">
                  Para proteger uma aposta de "<strong>ganhar por {goalDiff} ou mais gols</strong>", você deve usar o <strong>Handicap Asiático -{handicap.toFixed(1)}</strong>.<br/><br/>
                  <strong>Como funciona:</strong> O time precisa vencer com {goalDiff}+ gols de diferença para você ganhar a aposta. Se ganhar com menos gols ou empatar/perder, você perde a aposta.
                </div>
              </div>
            </div>

            {/* Scenarios */}
            <div className="bg-background rounded-lg p-5 space-y-3">
              <div className="font-bold text-foreground mb-3">
                📊 Cenários possíveis:
              </div>
              <div className="space-y-2">
                {generateScenarios().map((scenario, idx) => (
                  <div 
                    key={idx}
                    className="grid grid-cols-[1fr_auto_auto] gap-3 items-center py-2.5 border-b border-border last:border-b-0"
                  >
                    <span className="text-sm text-foreground/90">{scenario.description}</span>
                    <span className={`font-semibold text-xs px-2 py-1 rounded whitespace-nowrap ${
                      scenario.betOrProtection === 'Aposta'
                        ? 'text-success bg-success/10 border border-success/20'
                        : 'text-info bg-info/10 border border-info/20'
                    }`}>
                      {scenario.betOrProtection}
                    </span>
                    <span className={`font-semibold text-sm px-3 py-1 rounded whitespace-nowrap ${
                      scenario.resultClass === 'win' 
                        ? 'text-success bg-success/10' 
                        : 'text-destructive bg-destructive/10'
                    }`}>
                      {scenario.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
