import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Link, Trash2, Loader2 } from "lucide-react";

interface FreebetEntry {
  odd: string;
  commission: string;
  isLay: boolean;
}

export const CalculatorFreeProDirect = () => {
  const [mode, setMode] = useState<'freebet' | 'cashback'>('freebet');
  const [numEntries, setNumEntries] = useState(3);
  const [rounding, setRounding] = useState(1.00);
  const [isSharing, setIsSharing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  // Nomes editáveis para os cards
  const [houseNames, setHouseNames] = useState<string[]>([
    "Casa Promo",
    ...Array(5).fill(null).map((_, i) => `Casa ${i + 2}`)
  ]);
  const [editingName, setEditingName] = useState<number | null>(null);
  
  // Freebet fields
  const [houseOdd, setHouseOdd] = useState("");
  const [houseCommission, setHouseCommission] = useState("");
  const [qualifyingStake, setQualifyingStake] = useState("");
  const [freebetValue, setFreebetValue] = useState("");
  const [extractionRate, setExtractionRate] = useState("70");
  
  // Cashback fields
  const [cashbackOdd, setCashbackOdd] = useState("");
  const [cashbackCommission, setCashbackCommission] = useState("");
  const [cashbackStake, setCashbackStake] = useState("");
  const [cashbackRate, setCashbackRate] = useState("");
  
  // Coverage entries
  const [entries, setEntries] = useState<FreebetEntry[]>(
    Array(5).fill(null).map(() => ({ odd: "", commission: "", isLay: false }))
  );
  
  // Results
  const [totalStake, setTotalStake] = useState(0);
  const [roi, setRoi] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  const parseFlex = (val: string): number => {
    if (!val) return 0;
    const cleaned = val.replace(/[^\d.,-]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const toNum = (val: string): number => {
    if (val === undefined || val === null) return NaN;
    const str = String(val).trim();
    if (!str) return NaN;
    if (str.indexOf(',') !== -1 && str.indexOf('.') !== -1) {
      return parseFloat(str.replace(/\.|\,/g, (match) => match === ',' ? '.' : ''));
    }
    if (str.indexOf(',') !== -1) return parseFloat(str.replace(',', '.'));
    return parseFloat(str);
  };

  const formatBRL = (val: number): string => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const calculateFreebet = () => {
    const o1 = toNum(houseOdd);
    const c1 = toNum(houseCommission);
    const s1 = toNum(qualifyingStake);
    const F = toNum(freebetValue);
    const r = toNum(extractionRate);

    // Validação igual ao original - c1 pode ser NaN (vazio)
    if (!Number.isFinite(o1) || o1 <= 1 ||
        !Number.isFinite(F) || F < 0 ||
        !Number.isFinite(r) || r < 0 || r > 100 ||
        !Number.isFinite(s1) || s1 <= 0) {
      setResults([]);
      setTotalStake(0);
      setRoi(0);
      return;
    }

    const activeEntries = entries.slice(0, numEntries - 1);
    const validEntries = activeEntries.filter(e => {
      const oddVal = toNum(e.odd);
      return Number.isFinite(oddVal) && oddVal > 1;
    });
    
    if (validEntries.length !== numEntries - 1) {
      setResults([]);
      setTotalStake(0);
      setRoi(0);
      return;
    }

    // Função effOdd igual ao original
    const effOdd = (odd: number, comm: number) => {
      const cc = (Number.isFinite(comm) && comm > 0) ? comm / 100 : 0;
      return 1 + (odd - 1) * (1 - cc);
    };

    const o1e = effOdd(o1, c1);
    const rF = (r / 100) * F;
    const A = s1 * o1e - rF;

    const stakes: number[] = [];
    const eBack: number[] = [];
    const commFrac: number[] = [];
    const oddsOrig: number[] = [];

    validEntries.forEach((entry) => {
      const L = toNum(entry.odd);
      const comm = toNum(entry.commission);
      const cfrac = (Number.isFinite(comm) && comm > 0) ? comm / 100 : 0;
      commFrac.push(cfrac);
      oddsOrig.push(L);

      if (entry.isLay) {
        const denom = L - 1;
        if (!(denom > 0)) {
          setResults([]);
          setTotalStake(0);
          setRoi(0);
          return;
        }
        const eLay = 1 + (1 - cfrac) / denom;
        const equivStake = A / eLay;
        stakes.push(equivStake / denom);
        eBack.push(eLay);
      } else {
        const e = effOdd(L, comm);
        eBack.push(e);
        stakes.push(A / e);
      }
    });

    // Arredondamento igual ao original
    const roundStep = (v: number) => Math.round(v / rounding) * rounding;
    const roundedStakes = stakes.map(roundStep).map(s => Math.max(s, 0.50));

    // Liabilities - exatamente como no original
    const liabilities = roundedStakes.map((stake, idx) => {
      return validEntries[idx].isLay ? (oddsOrig[idx] - 1) * stake : 0;
    });

    // Total - exatamente como no original
    const total = s1 + roundedStakes.reduce((acc, stake, idx) => {
      return acc + (validEntries[idx].isLay ? (oddsOrig[idx] - 1) * stake : stake);
    }, 0);

    // Lucro cenário 1 (casa promo vence)
    const net1 = s1 * o1e - total;

    // Lucros nos outros cenários - exatamente como no original
    const defs: number[] = [];
    const profits: number[] = [net1];
    for (let win = 0; win < roundedStakes.length; win++) {
      let deficit;
      if (validEntries[win].isLay) {
        const ganhoLay = roundedStakes[win] * (1 - commFrac[win]);
        const liab = liabilities[win];
        deficit = ganhoLay - (total - liab);
      } else {
        deficit = roundedStakes[win] * eBack[win] - total;
      }
      defs.push(deficit);
      profits.push(deficit + rF);
    }

    const lucroMedio = profits.reduce((a, b) => a + b, 0) / profits.length;
    const roiCalc = total > 0 ? (lucroMedio / total) * 100 : 0;

    setTotalStake(total);
    setRoi(roiCalc);
    
    const hasLay = validEntries.some(e => e.isLay);
    
    const resultsData = [
      {
        name: `1 vence (${houseNames[0]})`,
        odd: houseOdd && houseOdd.trim() ? houseOdd.replace('.', ',') : o1.toFixed(2).replace('.', ','),
        commission: (Number.isFinite(c1) ? c1 : 0).toFixed(2),
        stake: s1.toFixed(2).replace('.', ','),
        deficit: '-',
        liability: hasLay ? '-' : undefined,
        profit: formatBRL(profits[0])
      },
      ...validEntries.map((entry, idx) => ({
        name: `${idx + 2} vence (${houseNames[idx + 1]})`,
        odd: entry.odd && entry.odd.trim() ? entry.odd.replace('.', ',') : oddsOrig[idx].toFixed(2).replace('.', ','),
        commission: (Number.isFinite(toNum(entry.commission)) ? toNum(entry.commission) : 0).toFixed(2),
        stake: roundedStakes[idx].toFixed(2).replace('.', ',') + (entry.isLay ? ' (LAY)' : ''),
        deficit: formatBRL(defs[idx]),
        liability: hasLay ? (entry.isLay ? formatBRL(liabilities[idx]) : '-') : undefined,
        profit: formatBRL(profits[idx + 1])
      }))
    ];
    
    setResults(resultsData);
  };

  const calculateCashback = () => {
    const odd = toNum(cashbackOdd);
    const stake = toNum(cashbackStake);
    const cbRate = toNum(cashbackRate);
    const mainComm = toNum(cashbackCommission);

    if (!Number.isFinite(odd) || odd <= 1 ||
        !Number.isFinite(stake) || stake <= 0 ||
        !Number.isFinite(cbRate) || cbRate < 0 || cbRate > 100) {
      setResults([]);
      setTotalStake(0);
      setRoi(0);
      return;
    }

    const activeEntries = entries.slice(0, numEntries - 1);
    const validEntries = activeEntries.filter(e => {
      const oddVal = toNum(e.odd);
      return Number.isFinite(oddVal) && oddVal > 1;
    });
    
    if (validEntries.length !== numEntries - 1) {
      setResults([]);
      setTotalStake(0);
      setRoi(0);
      return;
    }

    const cashbackAmount = stake * (cbRate / 100);

    const effOdd = (o: number, comm: number) => {
      const cc = (Number.isFinite(comm) && comm > 0) ? comm / 100 : 0;
      return 1 + (o - 1) * (1 - cc);
    };

    const Oeff = effOdd(odd, mainComm);
    const commFrac: number[] = [];
    const eBack: number[] = [];
    const oddsOrig: number[] = [];
    let stakes: number[] = [];

    // Calcular eBack para todas as entradas (incluindo lay)
    validEntries.forEach((entry) => {
      const L = toNum(entry.odd);
      const comm = toNum(entry.commission);
      const cfrac = (Number.isFinite(comm) && comm > 0) ? comm / 100 : 0;
      commFrac.push(cfrac);
      oddsOrig.push(L);

      if (entry.isLay) {
        // Para lay, calcular odd efetiva equivalente
        const denom = L - 1;
        eBack.push(1 + (1 - cfrac) / denom);
      } else {
        eBack.push(effOdd(L, comm));
      }
    });

    // Calcular H para verificar se é possível nivelar
    const H = eBack.reduce((a, e) => a + (1 / e), 0);

    if (H >= 1) {
      // Modo de cobertura (não consegue nivelar)
      const baseLoss = stake;
      validEntries.forEach((entry, idx) => {
        if (entry.isLay) {
          stakes.push(baseLoss / (1 - commFrac[idx]));
        } else {
          const util = eBack[idx] - 1;
          if (util <= 0) {
            setResults([]);
            setTotalStake(0);
            setRoi(0);
            return;
          }
          stakes.push(baseLoss / util);
        }
      });
    } else {
      // Modo nivelado (equilibra os lucros)
      const P = stake;
      const C = cashbackAmount;
      const N = -P * (1 - Oeff + H * Oeff) + H * C;
      const S_total = P * Oeff - N;
      const numer = N + S_total - C;
      
      validEntries.forEach((entry, idx) => {
        if (entry.isLay) {
          // Para lay no modo nivelado, calculamos a liability desejada
          const desiredLiability = numer / eBack[idx];
          // A stake do lay é liability / (odd - 1)
          const L = oddsOrig[idx];
          stakes.push(desiredLiability / (L - 1));
        } else {
          stakes.push(numer / eBack[idx]);
        }
      });
    }

    // Arredondamento igual ao original
    const roundStep = (v: number) => Math.round(v / rounding) * rounding;
    stakes = stakes.map(roundStep).map(v => Math.max(v, 0.50));

    // Liabilities - exatamente como no original
    const liabilities = stakes.map((s, idx) => {
      return validEntries[idx].isLay ? (oddsOrig[idx] - 1) * s : 0;
    });

    // Total - exatamente como no original (usando oddsOrig)
    const total = stake + stakes.reduce((acc, s, idx) => {
      return acc + (validEntries[idx].isLay ? (oddsOrig[idx] - 1) * s : s);
    }, 0);

    // Lucro se ganhar aposta principal
    const net1 = stake * Oeff - total;

    // Lucros nas coberturas - seguindo exatamente o código original
    const defs: number[] = [];
    const profits: number[] = [net1];
    for (let win = 0; win < stakes.length; win++) {
      let deficit;
      if (validEntries[win].isLay) {
        // Cálculo lay exatamente como no original
        const ganhoLay = stakes[win] * (1 - commFrac[win]);
        const liab = liabilities[win];
        deficit = ganhoLay - (total - liab);
      } else {
        // Cálculo back exatamente como no original
        deficit = stakes[win] * eBack[win] - total;
      }
      defs.push(deficit);
      profits.push(deficit + cashbackAmount);
    }

    const lucroMedio = profits.reduce((a, b) => a + b, 0) / profits.length;
    const roiCalc = total > 0 ? (lucroMedio / total) * 100 : 0;

    setTotalStake(total);
    setRoi(roiCalc);
    
    const hasLay = validEntries.some(e => e.isLay);
    
    const resultsData = [
      {
        name: `1 vence (${houseNames[0]})`,
        odd: cashbackOdd && cashbackOdd.trim() ? cashbackOdd.replace('.', ',') : odd.toFixed(2).replace('.', ','),
        commission: (Number.isFinite(mainComm) ? mainComm : 0).toFixed(2),
        stake: stake.toFixed(2).replace('.', ','),
        deficit: '-',
        liability: hasLay ? '-' : undefined,
        profit: formatBRL(profits[0])
      },
      ...validEntries.map((entry, idx) => ({
        name: `${idx + 2} vence (${houseNames[idx + 1]})`,
        odd: entry.odd && entry.odd.trim() ? entry.odd.replace('.', ',') : oddsOrig[idx].toFixed(2).replace('.', ','),
        commission: (Number.isFinite(toNum(entry.commission)) ? toNum(entry.commission) : 0).toFixed(2),
        stake: stakes[idx].toFixed(2).replace('.', ',') + (entry.isLay ? ' (LAY)' : ''),
        deficit: formatBRL(defs[idx]),
        liability: hasLay ? (entry.isLay ? formatBRL(liabilities[idx]) : '-') : undefined,
        profit: formatBRL(profits[idx + 1])
      }))
    ];
    
    setResults(resultsData);
  };

  useEffect(() => {
    if (mode === 'freebet') {
      calculateFreebet();
    } else {
      calculateCashback();
    }
  }, [houseOdd, houseCommission, qualifyingStake, freebetValue, extractionRate, 
      cashbackOdd, cashbackCommission, cashbackStake, cashbackRate,
      entries, numEntries, rounding, mode]);

  const updateEntry = (index: number, field: keyof FreebetEntry, value: any) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  // Serializar estado para URL - PRESERVAR VALORES EXATOS
  const serializeState = () => {
    const state: any = {
      mode,
      numEntries,
      rounding
    };

    if (mode === 'freebet') {
      // CRÍTICO: Preservar valores exatos como strings
      if (houseOdd) state.ho = String(houseOdd);
      if (houseCommission) state.hc = String(houseCommission);
      if (qualifyingStake) state.qs = String(qualifyingStake);
      if (freebetValue) state.fv = String(freebetValue);
      if (extractionRate) state.er = String(extractionRate);
    } else {
      if (cashbackOdd) state.co = String(cashbackOdd);
      if (cashbackCommission) state.cc = String(cashbackCommission);
      if (cashbackStake) state.cs = String(cashbackStake);
      if (cashbackRate) state.cr = String(cashbackRate);
    }

    // Adicionar entries com valores preenchidos - PRESERVAR VALORES EXATOS
    const validEntries = entries.slice(0, numEntries - 1).filter(e => e.odd || e.commission);
    if (validEntries.length > 0) {
      state.entries = validEntries.map(e => ({
        o: String(e.odd || ''),
        c: String(e.commission || ''),
        l: e.isLay ? 1 : 0
      }));
    }

    return state;
  };

  // Deserializar URL para estado - PRESERVAR VALORES EXATOS
  const deserializeState = (params: URLSearchParams) => {
    try {
      const mode = params.get('mode') as 'freebet' | 'cashback' || 'freebet';
      setMode(mode);

      const numEntries = parseInt(params.get('numEntries') || '3');
      setNumEntries(numEntries);

      const rounding = parseFloat(params.get('rounding') || '1.00');
      setRounding(rounding);

      if (mode === 'freebet') {
        // CRÍTICO: Restaurar valores exatos como strings
        if (params.has('ho')) setHouseOdd(String(params.get('ho')!));
        if (params.has('hc')) setHouseCommission(String(params.get('hc')!));
        if (params.has('qs')) setQualifyingStake(String(params.get('qs')!));
        if (params.has('fv')) setFreebetValue(String(params.get('fv')!));
        if (params.has('er')) setExtractionRate(String(params.get('er')!));
      } else {
        if (params.has('co')) setCashbackOdd(String(params.get('co')!));
        if (params.has('cc')) setCashbackCommission(String(params.get('cc')!));
        if (params.has('cs')) setCashbackStake(String(params.get('cs')!));
        if (params.has('cr')) setCashbackRate(String(params.get('cr')!));
      }

      // Restaurar entries - PRESERVAR VALORES EXATOS
      const entriesStr = params.get('entries');
      if (entriesStr) {
        try {
          const entriesData = JSON.parse(entriesStr);
          const newEntries = [...entries];
          entriesData.forEach((e: any, idx: number) => {
            if (idx < newEntries.length) {
              newEntries[idx] = {
                odd: String(e.o || ''),
                commission: String(e.c || ''),
                isLay: e.l === 1
              };
            }
          });
          setEntries(newEntries);
          console.log('✅ Dados FreePro carregados da URL com precisão total');
        } catch (error) {
          console.error('❌ Erro ao restaurar entries:', error);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados da URL:', error);
      toast({
        title: "❌ Erro ao carregar",
        description: "Erro ao carregar dados compartilhados.",
        variant: "destructive"
      });
    }
  };

  // Compartilhar calculadora
  const handleShare = async () => {
    setIsSharing(true);
    const state = serializeState();
    const params = new URLSearchParams();
    
    Object.entries(state).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'entries') {
          params.set(key, JSON.stringify(value));
        } else {
          params.set(key, String(value));
        }
      }
    });

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}#calculadoras`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "✅ Link copiado!",
        description: "Compartilhe com outros usuários.",
      });
    } catch (error) {
      toast({
        title: "✅ Link gerado",
        description: "Copie o endereço da barra do navegador.",
      });
      window.history.pushState({}, '', url);
    } finally {
      setTimeout(() => setIsSharing(false), 500);
    }
  };

  // Limpar todos os dados
  const handleClear = () => {
    setIsClearing(true);
    // Limpar URL
    window.history.pushState({}, '', window.location.pathname + window.location.hash);
    
    // Reset modo e configurações
    setMode('freebet');
    setNumEntries(3);
    setRounding(1.00);
    
    // Reset nomes
    setHouseNames([
      "Casa Promo",
      ...Array(5).fill(null).map((_, i) => `Casa ${i + 2}`)
    ]);
    setEditingName(null);
    
    // Reset campos Freebet
    setHouseOdd("");
    setHouseCommission("");
    setQualifyingStake("");
    setFreebetValue("");
    setExtractionRate("70");
    
    // Reset campos Cashback
    setCashbackOdd("");
    setCashbackCommission("");
    setCashbackStake("");
    setCashbackRate("");
    
    // Reset entries
    setEntries(Array(5).fill(null).map(() => ({ odd: "", commission: "", isLay: false })));
    
    // Reset resultados
    setResults([]);
    setTotalStake(0);
    setRoi(0);
    
    toast({
      title: "✅ Dados limpos",
      description: "Todos os campos foram limpos com sucesso.",
    });
    
    setTimeout(() => setIsClearing(false), 500);
  };

  // Carregar estado da URL ao montar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('mode') || params.has('ho') || params.has('co')) {
      deserializeState(params);
    }
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="calc-header mb-8">
        <h1 className="text-3xl md:text-4xl font-black mb-4">
          <span className="text-gradient">Calculadora FreePro</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Otimize seus lucros com freebets de apostas seguras e cashbacks - cálculo automático em tempo real
        </p>
      </div>

      {/* Configurações */}
      <div className="stats-grid mb-8">
        <div className="stat-card">
          <div className="stat-label">Modo de Cálculo</div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setMode('freebet')}
              className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                mode === 'freebet'
                  ? 'bg-gradient-to-r from-[hsl(var(--shark-gradient-start))] to-[hsl(var(--shark-gradient-end))] text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Freebet
            </button>
            <button
              onClick={() => setMode('cashback')}
              className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                mode === 'cashback'
                  ? 'bg-gradient-to-r from-[hsl(var(--shark-gradient-start))] to-[hsl(var(--shark-gradient-end))] text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Cashback
            </button>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Número de Entradas</div>
          <select
            value={numEntries}
            onChange={(e) => setNumEntries(parseInt(e.target.value))}
            className="form-select mt-3 w-full"
          >
            <option value="2">2 Mercados</option>
            <option value="3">3 Mercados</option>
            <option value="4">4 Mercados</option>
            <option value="5">5 Mercados</option>
            <option value="6">6 Mercados</option>
          </select>
        </div>

        <div className="stat-card">
          <div className="stat-label">Arredondamento</div>
          <select
            value={rounding}
            onChange={(e) => {
              const newRounding = parseFloat(e.target.value);
              console.log('Arredondamento alterado para:', newRounding);
              setRounding(newRounding);
            }}
            className="form-select mt-3 w-full"
          >
            <option value={0.01}>R$ 0,01</option>
            <option value={0.10}>R$ 0,10</option>
            <option value={0.50}>R$ 0,50</option>
            <option value={1.00}>R$ 1,00</option>
          </select>
        </div>
      </div>

      {/* Casa Promoção */}
      {mode === 'freebet' && (
        <div className="card mb-6">
          {editingName === 0 ? (
            <input
              type="text"
              value={houseNames[0]}
              onChange={(e) => {
                const newNames = [...houseNames];
                newNames[0] = e.target.value;
                setHouseNames(newNames);
              }}
              onBlur={() => setEditingName(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setEditingName(null);
                }
              }}
              autoFocus
              className="section-title bg-transparent border-b-2 border-[hsl(var(--shark-gradient-start))] outline-none w-full mb-4"
            />
          ) : (
            <div 
              className="section-title cursor-pointer hover:opacity-80 transition-opacity mb-4"
              onClick={() => setEditingName(0)}
              title="Clique para editar o nome"
            >
              {houseNames[0]} (Freebet)
            </div>
          )}
          
          <div className="grid-2 mb-4">
            <div className="form-group">
              <label className="form-label">Odd da Casa</label>
              <input
                type="text"
                value={houseOdd}
                onChange={(e) => setHouseOdd(e.target.value)}
                placeholder="ex: 3.00"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Comissão (%)</label>
              <input
                type="text"
                value={houseCommission}
                onChange={(e) => setHouseCommission(e.target.value)}
                placeholder="ex: 0"
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2 mb-4">
            <div className="form-group">
              <label className="form-label">Stake Qualificação</label>
              <input
                type="text"
                value={qualifyingStake}
                onChange={(e) => setQualifyingStake(e.target.value)}
                placeholder="ex: 50"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Valor da Freebet</label>
              <input
                type="text"
                value={freebetValue}
                onChange={(e) => setFreebetValue(e.target.value)}
                placeholder="ex: 50"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Taxa de Extração (%)</label>
            <input
              type="text"
              value={extractionRate}
              onChange={(e) => setExtractionRate(e.target.value)}
              placeholder="ex: 70"
              className="form-input"
            />
          </div>
        </div>
      )}

      {/* Casa Promoção - Cashback */}
      {mode === 'cashback' && (
        <div className="card mb-6">
          {editingName === 0 ? (
            <input
              type="text"
              value={houseNames[0]}
              onChange={(e) => {
                const newNames = [...houseNames];
                newNames[0] = e.target.value;
                setHouseNames(newNames);
              }}
              onBlur={() => setEditingName(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setEditingName(null);
                }
              }}
              autoFocus
              className="section-title bg-transparent border-b-2 border-[hsl(var(--shark-gradient-start))] outline-none w-full mb-4"
            />
          ) : (
            <div 
              className="section-title cursor-pointer hover:opacity-80 transition-opacity mb-4"
              onClick={() => setEditingName(0)}
              title="Clique para editar o nome"
            >
              {houseNames[0]} (Cashback)
            </div>
          )}
          
          <div className="grid-2 mb-4">
            <div className="form-group">
              <label className="form-label">Odd da Casa</label>
              <input
                type="text"
                value={cashbackOdd}
                onChange={(e) => setCashbackOdd(e.target.value)}
                placeholder="ex: 3.00"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Comissão (%)</label>
              <input
                type="text"
                value={cashbackCommission}
                onChange={(e) => setCashbackCommission(e.target.value)}
                placeholder="ex: 0"
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2 mb-4">
            <div className="form-group">
              <label className="form-label">Stake Qualificação</label>
              <input
                type="text"
                value={cashbackStake}
                onChange={(e) => setCashbackStake(e.target.value)}
                placeholder="ex: 100"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Taxa de Cashback (%)</label>
              <input
                type="text"
                value={cashbackRate}
                onChange={(e) => setCashbackRate(e.target.value)}
                placeholder="ex: 10"
                className="form-input"
              />
            </div>
          </div>
        </div>
      )}

      {/* Coberturas */}
      <div className="card mb-6">
        <div className="section-title">Coberturas</div>
        <div className="house-grid">
          {entries.slice(0, numEntries - 1).map((entry, idx) => (
            <div key={idx} className="house-card">
              {editingName === idx + 1 ? (
                <input
                  type="text"
                  value={houseNames[idx + 1]}
                  onChange={(e) => {
                    const newNames = [...houseNames];
                    newNames[idx + 1] = e.target.value;
                    setHouseNames(newNames);
                  }}
                  onBlur={() => setEditingName(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setEditingName(null);
                    }
                  }}
                  autoFocus
                  className="house-title bg-transparent border-b-2 border-[hsl(var(--shark-gradient-start))] outline-none w-full mb-4"
                />
              ) : (
                <h3 
                  className="house-title cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setEditingName(idx + 1)}
                  title="Clique para editar o nome"
                >
                  {houseNames[idx + 1]}
                </h3>
              )}
              
              <div className="grid-2 mb-4">
                <div className="form-group">
                  <label className="form-label">Odd</label>
                  <input
                    type="text"
                    value={entry.odd}
                    onChange={(e) => updateEntry(idx, 'odd', e.target.value)}
                    placeholder="ex: 2.50"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Comissão (%)</label>
                  <input
                    type="text"
                    value={entry.commission}
                    onChange={(e) => updateEntry(idx, 'commission', e.target.value)}
                    placeholder="ex: 0"
                    className="form-input"
                  />
                </div>
              </div>

              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={entry.isLay}
                  onChange={(e) => updateEntry(idx, 'isLay', e.target.checked)}
                />
                <span>Lay (Contra)</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Botões Ação */}
      <div className="flex justify-center gap-4 mb-6" style={{ flexWrap: 'wrap' }}>
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="btn btn-primary flex items-center gap-2"
          style={{ minWidth: '180px' }}
        >
          {isSharing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Copiando...
            </>
          ) : (
            <>
              <Link className="w-4 h-4" />
              Compartilhar
            </>
          )}
        </button>
        <button
          onClick={handleClear}
          disabled={isClearing}
          className="btn btn-secondary flex items-center gap-2"
          style={{ minWidth: '180px' }}
        >
          {isClearing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Limpando...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              Limpar Dados
            </>
          )}
        </button>
      </div>

      {/* Resultados */}
      {results.length > 0 && (
        <div className="card card-with-watermark">
          <div className="section-title">Resultados Shark FreePro</div>
          
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-value">{formatBRL(totalStake)}</div>
              <div className="stat-label">Stake Total</div>
            </div>

            <div className="stat-card">
              <div className={`stat-value ${roi >= 0 ? 'profit-highlight' : 'profit-negative'}`}>
                {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
              </div>
              <div className="stat-label">ROI</div>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Mercado</th>
                  <th>Odd</th>
                  <th>Comissão</th>
                  <th>Stake</th>
                  {results[0]?.liability !== undefined && <th>Responsabilidade</th>}
                  <th>Déficit</th>
                  <th>Lucro</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => (
                  <tr key={idx}>
                    <td><strong>{result.name}</strong></td>
                    <td>{result.odd}</td>
                    <td>{result.commission}%</td>
                    <td>{result.stake}</td>
                    {result.liability !== undefined && (
                      <td>{result.liability}</td>
                    )}
                    <td 
                      className={parseFlex(result.deficit) >= 0 ? 'profit-positive' : 'profit-negative'}
                      style={{ 
                        color: parseFlex(result.deficit) >= 0 ? 'hsl(160, 85%, 50%)' : 'hsl(0, 85%, 60%)',
                        fontWeight: 700 
                      }}
                    >
                      <strong>{result.deficit}</strong>
                    </td>
                    <td 
                      className={parseFlex(result.profit) >= 0 ? 'profit-positive' : 'profit-negative'}
                      style={{ 
                        color: parseFlex(result.profit) >= 0 ? 'hsl(160, 85%, 50%)' : 'hsl(0, 85%, 60%)',
                        fontWeight: 700 
                      }}
                    >
                      <strong>{result.profit}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
