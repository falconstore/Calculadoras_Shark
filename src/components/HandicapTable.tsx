import { BookOpen } from "lucide-react";

interface HandicapResult {
  label: string;
  value: string;
  type: 'win' | 'partial' | 'lose';
}

interface HandicapItem {
  value: string;
  subtitle?: string;
  results: HandicapResult[];
}

const HandicapBox = ({ item }: { item: HandicapItem }) => (
  <div className="bg-card border border-border/50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <div className="bg-gradient-to-r from-[hsl(var(--shark-gradient-start))] to-[hsl(var(--shark-gradient-end))] px-4 py-3">
      <span className="text-white font-bold text-lg">{item.value}</span>
      {item.subtitle && <span className="text-white/80 ml-2 text-sm">({item.subtitle})</span>}
    </div>
    <div className="p-4 space-y-2">
      {item.results.map((result, idx) => (
        <div key={idx} className="flex justify-between items-center py-1.5">
          <span className="text-sm text-foreground/90">{result.label}</span>
          <span className={`font-semibold text-sm px-3 py-1 rounded ${
            result.type === 'win' ? 'text-success bg-success/10' :
            result.type === 'partial' ? 'text-info bg-info/10' :
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
  { value: "0.0/-0.5", subtitle: "-0.25", results: [
    { label: "Venceu", value: "Ganha", type: "win" },
    { label: "Empatou", value: "1/2 Perdida", type: "partial" },
    { label: "Perdeu", value: "Perde", type: "lose" }
  ]},
  { value: "-0.5", results: [
    { label: "Venceu", value: "Ganha", type: "win" },
    { label: "Empatou/Perdeu", value: "Perde", type: "lose" }
  ]},
  { value: "-0.5/-1", subtitle: "-0.75", results: [
    { label: "Venceu por 2 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 1", value: "1/2 Ganha", type: "partial" },
    { label: "Perdeu/Empatou", value: "Perde", type: "lose" }
  ]},
  { value: "-1", results: [
    { label: "Venceu por 2 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 1", value: "Devolvida", type: "partial" },
    { label: "Perdeu/Empatou", value: "Perde", type: "lose" }
  ]},
  { value: "-1.0/-1.5", subtitle: "-1.25", results: [
    { label: "Venceu por 2 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 1", value: "1/2 Perdida", type: "partial" },
    { label: "Perdeu/Empatou", value: "Perde", type: "lose" }
  ]},
  { value: "-1.5", results: [
    { label: "Venceu por 2 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 1", value: "Perde", type: "lose" },
    { label: "Perdeu/Empatou", value: "Perde", type: "lose" }
  ]},
  { value: "-1.5/-2.0", subtitle: "-1.75", results: [
    { label: "Venceu por 3 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 2", value: "1/2 Ganha", type: "partial" },
    { label: "Venceu por 1", value: "Perde", type: "lose" },
    { label: "Perdeu/Empatou", value: "Perde", type: "lose" }
  ]},
  { value: "-2.0", results: [
    { label: "Venceu por 3 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 2", value: "Devolvida", type: "partial" },
    { label: "Venceu por 1", value: "Perde", type: "lose" },
    { label: "Perdeu/Empatou", value: "Perde", type: "lose" }
  ]},
  { value: "-2.0/-2.5", subtitle: "-2.25", results: [
    { label: "Venceu por 3 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 2", value: "1/2 Perdida", type: "partial" },
    { label: "Venceu por 1", value: "Perde", type: "lose" },
    { label: "Perdeu/Empatou", value: "Perde", type: "lose" }
  ]},
  { value: "-2.5", results: [
    { label: "Venceu por 3 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 2 ou menos", value: "Perde", type: "lose" }
  ]},
  { value: "-2.5/-3.0", subtitle: "-2.75", results: [
    { label: "Venceu por 4 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 3", value: "1/2 Ganha", type: "partial" },
    { label: "Venceu por 2 ou menos", value: "Perde", type: "lose" }
  ]},
  { value: "-3.0", results: [
    { label: "Venceu por 4 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 3", value: "Devolvida", type: "partial" },
    { label: "Venceu por 2 ou menos", value: "Perde", type: "lose" }
  ]},
  { value: "-3.0/-3.5", subtitle: "-3.25", results: [
    { label: "Venceu por 4 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 3", value: "1/2 Perdida", type: "partial" },
    { label: "Venceu por 2 ou menos", value: "Perde", type: "lose" }
  ]},
  { value: "-3.5", results: [
    { label: "Venceu por 4 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 3 ou menos", value: "Perde", type: "lose" }
  ]},
  { value: "-3.5/-4.0", subtitle: "-3.75", results: [
    { label: "Venceu por 5 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 4", value: "1/2 Ganha", type: "partial" },
    { label: "Venceu por 3 ou menos", value: "Perde", type: "lose" }
  ]},
  { value: "-4.0", results: [
    { label: "Venceu por 5 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 4", value: "Devolvida", type: "partial" },
    { label: "Venceu por 3 ou menos", value: "Perde", type: "lose" }
  ]},
  { value: "-4.0/-4.5", subtitle: "-4.25", results: [
    { label: "Venceu por 5 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 4", value: "1/2 Perdida", type: "partial" },
    { label: "Venceu por 3 ou menos", value: "Perde", type: "lose" }
  ]},
  { value: "-4.5", results: [
    { label: "Venceu por 5 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 4 ou menos", value: "Perde", type: "lose" }
  ]},
  { value: "-4.5/-5.0", subtitle: "-4.75", results: [
    { label: "Venceu por 6 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 5", value: "1/2 Ganha", type: "partial" },
    { label: "Venceu por 4 ou menos", value: "Perde", type: "lose" }
  ]},
  { value: "-5.0", results: [
    { label: "Venceu por 6 ou +", value: "Ganha", type: "win" },
    { label: "Venceu por 5", value: "Devolvida", type: "partial" },
    { label: "Venceu por 4 ou menos", value: "Perde", type: "lose" }
  ]}
];

const positiveHandicaps: HandicapItem[] = [
  { value: "0.0/+0.5", subtitle: "+0.25", results: [
    { label: "Venceu", value: "Ganha", type: "win" },
    { label: "Empatou", value: "1/2 Ganha", type: "partial" },
    { label: "Perdeu", value: "Perde", type: "lose" }
  ]},
  { value: "+0.5", results: [
    { label: "Venceu/Empatou", value: "Ganha", type: "win" },
    { label: "Perdeu", value: "Perde", type: "lose" }
  ]},
  { value: "+0.5/+1", subtitle: "+0.75", results: [
    { label: "Venceu/Empatou", value: "Ganha", type: "win" },
    { label: "Perdeu por 1", value: "1/2 Perdida", type: "partial" },
    { label: "Perdeu por 2 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+1", results: [
    { label: "Venceu/Empatou", value: "Ganha", type: "win" },
    { label: "Perdeu por 1", value: "Devolvida", type: "partial" },
    { label: "Perdeu por 2 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+1.0/+1.5", subtitle: "+1.25", results: [
    { label: "Venceu/Empatou", value: "Ganha", type: "win" },
    { label: "Perdeu por 1", value: "1/2 Ganha", type: "partial" },
    { label: "Perdeu por 2 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+1.5", results: [
    { label: "Venceu/Empatou", value: "Ganha", type: "win" },
    { label: "Perdeu por 1", value: "Ganha", type: "win" },
    { label: "Perdeu por 2 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+1.5/+2.0", subtitle: "+1.75", results: [
    { label: "Venceu/Empatou", value: "Ganha", type: "win" },
    { label: "Perdeu por 1", value: "Ganha", type: "win" },
    { label: "Perdeu por 2", value: "1/2 Perdida", type: "partial" },
    { label: "Perdeu por 3 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+2.0", results: [
    { label: "Venceu/Empatou", value: "Ganha", type: "win" },
    { label: "Perdeu por 1", value: "Ganha", type: "win" },
    { label: "Perdeu por 2", value: "Devolvida", type: "partial" },
    { label: "Perdeu por 3 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+2.0/+2.5", subtitle: "+2.25", results: [
    { label: "Venceu/Empatou", value: "Ganha", type: "win" },
    { label: "Perdeu por 1", value: "Ganha", type: "win" },
    { label: "Perdeu por 2", value: "1/2 Ganha", type: "partial" },
    { label: "Perdeu por 3 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+2.5", results: [
    { label: "Perdeu por 2 ou menos", value: "Ganha", type: "win" },
    { label: "Perdeu por 3 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+2.5/+3.0", subtitle: "+2.75", results: [
    { label: "Perdeu por 2 ou menos", value: "Ganha", type: "win" },
    { label: "Perdeu por 3", value: "1/2 Perdida", type: "partial" },
    { label: "Perdeu por 4 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+3.0", results: [
    { label: "Perdeu por 2 ou menos", value: "Ganha", type: "win" },
    { label: "Perdeu por 3", value: "Devolvida", type: "partial" },
    { label: "Perdeu por 4 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+3.0/+3.5", subtitle: "+3.25", results: [
    { label: "Perdeu por 2 ou menos", value: "Ganha", type: "win" },
    { label: "Perdeu por 3", value: "1/2 Ganha", type: "partial" },
    { label: "Perdeu por 4 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+3.5", results: [
    { label: "Perdeu por 3 ou menos", value: "Ganha", type: "win" },
    { label: "Perdeu por 4 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+3.5/+4.0", subtitle: "+3.75", results: [
    { label: "Perdeu por 3 ou menos", value: "Ganha", type: "win" },
    { label: "Perdeu por 4", value: "1/2 Perdida", type: "partial" },
    { label: "Perdeu por 5 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+4.0", results: [
    { label: "Perdeu por 3 ou menos", value: "Ganha", type: "win" },
    { label: "Perdeu por 4", value: "Devolvida", type: "partial" },
    { label: "Perdeu por 5 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+4.0/+4.5", subtitle: "+4.25", results: [
    { label: "Perdeu por 3 ou menos", value: "Ganha", type: "win" },
    { label: "Perdeu por 4", value: "1/2 Ganha", type: "partial" },
    { label: "Perdeu por 5 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+4.5", results: [
    { label: "Perdeu por 4 ou menos", value: "Ganha", type: "win" },
    { label: "Perdeu por 5 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+4.5/+5.0", subtitle: "+4.75", results: [
    { label: "Perdeu por 4 ou menos", value: "Ganha", type: "win" },
    { label: "Perdeu por 5", value: "1/2 Perdida", type: "partial" },
    { label: "Perdeu por 6 ou +", value: "Perde", type: "lose" }
  ]},
  { value: "+5.0", results: [
    { label: "Perdeu por 4 ou menos", value: "Ganha", type: "win" },
    { label: "Perdeu por 5", value: "Devolvida", type: "partial" },
    { label: "Perdeu por 6 ou +", value: "Perde", type: "lose" }
  ]}
];

export const HandicapTable = () => {
  return (
    <div className="w-full animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-black mb-2">
          Entenda o <span className="text-gradient">Handicap Asiático</span>
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
            { label: "Empatou", value: "Devolvida", type: "partial" },
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
              <span className="font-semibold text-info">1/2 GANHA:</span>
              <span className="text-muted-foreground ml-2">Metade da sua aposta é devolvida e a outra é multiplicada pelo valor das odds.</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-info font-bold">●</span>
            <div>
              <span className="font-semibold text-info">DEVOLVIDA:</span>
              <span className="text-muted-foreground ml-2">A bet é anulada e sua aposta é devolvida.</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-info font-bold">●</span>
            <div>
              <span className="font-semibold text-info">1/2 PERDIDA:</span>
              <span className="text-muted-foreground ml-2">Metade da sua aposta é perdida e a outra é devolvida.</span>
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
      </div>
    </div>
  );
};
