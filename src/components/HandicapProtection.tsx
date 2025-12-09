import { useState } from "react";
import { Target, Info, ShieldCheck } from "lucide-react";

interface Scenario {
  description: string;
  resultAposta: string;
  resultProtecao: string;
  resultClassAposta: 'win' | 'lose';
  resultClassProtecao: 'win' | 'lose';
}

export const HandicapProtection = () => {
  const [betType, setBetType] = useState("");
  const [customGoals, setCustomGoals] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [handicap, setHandicap] = useState(0);
  const [goalDiff, setGoalDiff] = useState(0);

  // Mapeamento: aposta em "ganhar por X gols" → proteção com handicap +X-0.5 no adversário
  const betMap: Record<string, number> = {
    'win1': 1,   // Ganhar por qualquer placar → +0.5
    'win2': 2,   // Ganhar por 2+ gols → +1.5
    'win3': 3,   // Ganhar por 3+ gols → +2.5
    'win4': 4,   // Ganhar por 4+ gols → +3.5
    'win5': 5    // Ganhar por 5+ gols → +4.5
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
    
    // Handicap positivo para proteção no time adversário: diff - 0.5
    const calculatedHandicap = diff - 0.5;
    setHandicap(calculatedHandicap);
    setGoalDiff(diff);
    setShowResult(true);
  };

  const generateScenarios = (): Scenario[] => {
    const scenarios: Scenario[] = [];
    
    if (goalDiff === 1) {
      // Ganhar por qualquer placar
      scenarios.push({
        description: 'Time vence (ex: 1x0, 2x1, 3x0)',
        resultAposta: '✓ GANHA',
        resultProtecao: '✗ PERDE',
        resultClassAposta: 'win',
        resultClassProtecao: 'lose'
      });
      scenarios.push({
        description: 'Empate (ex: 0x0, 1x1, 2x2)',
        resultAposta: '✗ PERDE',
        resultProtecao: '✓ GANHA',
        resultClassAposta: 'lose',
        resultClassProtecao: 'win'
      });
      scenarios.push({
        description: 'Time perde (ex: 0x1, 1x2)',
        resultAposta: '✗ PERDE',
        resultProtecao: '✓ GANHA',
        resultClassAposta: 'lose',
        resultClassProtecao: 'win'
      });
    } else {
      // Ganhar por X+ gols
      scenarios.push({
        description: `Time vence por ${goalDiff}+ gols (ex: ${goalDiff}x0, ${goalDiff+1}x1)`,
        resultAposta: '✓ GANHA',
        resultProtecao: '✗ PERDE',
        resultClassAposta: 'win',
        resultClassProtecao: 'lose'
      });
      
      // Vitória por menos gols
      const examples: string[] = [];
      for (let i = 1; i < goalDiff; i++) {
        examples.push(`${i}x0`);
      }
      scenarios.push({
        description: `Time vence por menos de ${goalDiff} gols (ex: ${examples.slice(0, 2).join(', ')})`,
        resultAposta: '✗ PERDE',
        resultProtecao: '✓ GANHA',
        resultClassAposta: 'lose',
        resultClassProtecao: 'win'
      });
      
      scenarios.push({
        description: 'Empate (ex: 0x0, 1x1, 2x2)',
        resultAposta: '✗ PERDE',
        resultProtecao: '✓ GANHA',
        resultClassAposta: 'lose',
        resultClassProtecao: 'win'
      });
      
      scenarios.push({
        description: 'Time perde (ex: 0x1, 1x2)',
        resultAposta: '✗ PERDE',
        resultProtecao: '✓ GANHA',
        resultClassAposta: 'lose',
        resultClassProtecao: 'win'
      });
    }
    
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
              <strong>Como funciona:</strong> Quando você aposta em "Time ganhar por X gols ou mais", pode proteger essa aposta apostando no <strong>time adversário com Handicap Asiático positivo</strong>. Se sua aposta principal perder, a proteção ganha!
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-card border border-border/50 rounded-lg p-6 space-y-5">
          <div className="space-y-3">
            <label className="block font-bold text-foreground">
              Sua Aposta Principal:
            </label>
            <select
              value={betType}
              onChange={(e) => handleBetTypeChange(e.target.value)}
              className="w-full px-4 py-3 text-base border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">-- Selecione o tipo de aposta --</option>
              <option value="win1">Time ganhar o jogo (por qualquer placar)</option>
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
                <ShieldCheck className="w-6 h-6" />
                PROTEÇÃO RECOMENDADA
              </div>
              
              <div className="bg-background border-2 border-success rounded-lg p-6 mb-5">
                <div className="text-sm text-muted-foreground mb-2">
                  Aposte no TIME ADVERSÁRIO com:
                </div>
                <div className="text-5xl font-black text-success mb-2">
                  +{handicap.toFixed(1)}
                </div>
                <div className="text-lg text-muted-foreground">
                  Handicap Asiático +{handicap.toFixed(1)}
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-warning/10 border-l-4 border-warning rounded-lg p-4 text-left">
                <div className="font-bold text-foreground mb-2">
                  📋 Como proteger sua aposta:
                </div>
                <div className="text-sm text-foreground leading-relaxed">
                  <strong>Aposta principal:</strong> Time ganhar por {goalDiff === 1 ? 'qualquer placar' : `${goalDiff}+ gols`}<br/>
                  <strong>Proteção:</strong> Aposte no <strong>time adversário</strong> com <strong>Handicap +{handicap.toFixed(1)}</strong><br/><br/>
                  <strong>Resultado:</strong> Se o time não vencer por {goalDiff === 1 ? 'qualquer placar' : `${goalDiff}+ gols`}, sua proteção ganha!
                </div>
              </div>
            </div>

            {/* Scenarios Table */}
            <div className="bg-background rounded-lg p-5 space-y-3">
              <div className="font-bold text-foreground mb-3">
                📊 Cenários possíveis:
              </div>
              
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center py-2 border-b-2 border-border font-bold text-sm">
                <span className="text-muted-foreground">Resultado</span>
                <span className="text-center px-3 text-primary">Aposta</span>
                <span className="text-center px-3 text-secondary">Proteção</span>
              </div>
              
              {/* Table Body */}
              <div className="space-y-0">
                {generateScenarios().map((scenario, idx) => (
                  <div 
                    key={idx}
                    className="grid grid-cols-[1fr_auto_auto] gap-3 items-center py-3 border-b border-border/50 last:border-b-0"
                  >
                    <span className="text-sm text-foreground/90">{scenario.description}</span>
                    <span className={`font-semibold text-xs px-3 py-1 rounded whitespace-nowrap text-center min-w-[80px] ${
                      scenario.resultClassAposta === 'win' 
                        ? 'text-success bg-success/10' 
                        : 'text-destructive bg-destructive/10'
                    }`}>
                      {scenario.resultAposta}
                    </span>
                    <span className={`font-semibold text-xs px-3 py-1 rounded whitespace-nowrap text-center min-w-[80px] ${
                      scenario.resultClassProtecao === 'win' 
                        ? 'text-success bg-success/10' 
                        : 'text-destructive bg-destructive/10'
                    }`}>
                      {scenario.resultProtecao}
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
