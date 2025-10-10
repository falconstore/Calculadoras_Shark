import { BookOpen } from "lucide-react";

interface HandicapResult {
  label: string;
  value: string;
  type: 'win' | 'draw' | 'lose';
}

interface HandicapItem {
  value: string;
  results: HandicapResult[];
}

const HandicapBox = ({ item }: { item: HandicapItem }) => (
  <div className="bg-card border border-border/50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <div className="bg-gradient-to-r from-[hsl(var(--shark-gradient-start))] to-[hsl(var(--shark-gradient-end))] px-4 py-3">
      <span className="text-white font-bold text-lg">{item.value}</span>
    </div>
    <div className="p-4 space-y-2">
      {item.results.map((result, idx) => (
        <div key={idx} className="flex justify-between items-center py-1.5">
          <span className="text-sm text-foreground/90">{result.label}</span>
          <span className={`font-semibold text-sm px-3 py-1 rounded ${
            result.type === 'win' ? 'text-success bg-success/10' :
            result.type === 'draw' ? 'text-info bg-info/10' :
            'text-destructive bg-destructive/10'
          }`}>
            {result.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const negativeHandicaps: HandicapItem[] = [
  { value: "-1", results: [
    { label: "Venceu por 2 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 1", value: "Empate", type: "draw" },
    { label: "Empatou/Perdeu", value: "Perde", type: "lose" }
  ]},
  { value: "-2", results: [
    { label: "Venceu por 3 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 2", value: "Empate", type: "draw" },
    { label: "Venceu por 1 ou menos", value: "Perde", type: "lose" }
  ]},
  { value: "-3", results: [
    { label: "Venceu por 4 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 3", value: "Empate", type: "draw" },
    { label: "Venceu por 2 ou menos", value: "Perde", type: "lose" }
  ]},
  { value: "-4", results: [
    { label: "Venceu por 5 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 4", value: "Empate", type: "draw" },
    { label: "Venceu por 3 ou menos", value: "Perde", type: "lose" }
  ]},
  { value: "-5", results: [
    { label: "Venceu por 6 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 5", value: "Empate", type: "draw" },
    { label: "Venceu por 4 ou menos", value: "Perde", type: "lose" }
  ]}
];

const positiveHandicaps: HandicapItem[] = [
  { value: "+1", results: [
    { label: "Venceu/Empatou", value: "Ganha", type: "win" },
    { label: "Perdeu por 1", value: "Empate", type: "draw" },
    { label: "Perdeu por 2 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+2", results: [
    { label: "Perdeu por 1 ou menos", value: "Ganha", type: "win" },
    { label: "Perdeu por 2", value: "Empate", type: "draw" },
    { label: "Perdeu por 3 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+3", results: [
    { label: "Perdeu por 2 ou menos", value: "Ganha", type: "win" },
    { label: "Perdeu por 3", value: "Empate", type: "draw" },
    { label: "Perdeu por 4 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+4", results: [
    { label: "Perdeu por 3 ou menos", value: "Ganha", type: "win" },
    { label: "Perdeu por 4", value: "Empate", type: "draw" },
    { label: "Perdeu por 5 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+5", results: [
    { label: "Perdeu por 4 ou menos", value: "Ganha", type: "win" },
    { label: "Perdeu por 5", value: "Empate", type: "draw" },
    { label: "Perdeu por 6 ou +", value: "Perde", type: "lose" }
  ]}
];

export const HandicapEuropeanTable = () => {
  return (
    <div className="w-full animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-black mb-2">
          Entenda o <span className="text-gradient">Handicap Europeu</span>
        </h2>
        <p className="text-lg text-muted-foreground font-semibold">NEGATIVO x POSITIVO</p>
      </div>

      {/* Grid responsivo: mostra pares alinhados */}
      <div className="space-y-4 mb-8">
        {negativeHandicaps.map((negItem, idx) => {
          const posItem = positiveHandicaps[idx];
          return (
            <div key={idx} className="grid md:grid-cols-2 gap-4">
              <HandicapBox item={negItem} />
              {posItem && <HandicapBox item={posItem} />}
            </div>
          );
        })}
      </div>

      {/* Handicap 0 */}
      <div className="max-w-md mx-auto mb-8">
        <HandicapBox item={{
          value: "0",
          results: [
            { label: "Venceu", value: "Ganha", type: "win" },
            { label: "Empatou", value: "Empate", type: "draw" },
            { label: "Perdeu", value: "Perde", type: "lose" }
          ]
        }} />
      </div>

      {/* Legenda */}
      <div className="bg-card border border-border/50 rounded-lg p-6 max-w-3xl mx-auto">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          LEGENDA:
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <span className="text-success font-bold">●</span>
            <div>
              <span className="font-semibold text-success">GANHA:</span>
              <span className="text-muted-foreground ml-2">Você ganha sua aposta multiplicada pelo valor das odds.</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-info font-bold">●</span>
            <div>
              <span className="font-semibold text-info">EMPATE:</span>
              <span className="text-muted-foreground ml-2">A aposta é considerada empate (nem ganha nem perde) e sua aposta é devolvida.</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-destructive font-bold">●</span>
            <div>
              <span className="font-semibold text-destructive">PERDE:</span>
              <span className="text-muted-foreground ml-2">Você perde toda a sua aposta.</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-bold mb-2 text-foreground">⚠️ Diferença entre Handicap Europeu e Asiático:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• <strong>Europeu:</strong> Apenas números inteiros (-1, -2, +1, +2, etc.) e sempre 3 resultados possíveis (Ganha/Empate/Perde)</li>
            <li>• <strong>Asiático:</strong> Permite meio gols (.5) e quartos (.25, .75), com possibilidade de ganho/perda parcial</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
