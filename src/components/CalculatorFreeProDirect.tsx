import { useEffect, useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Link, Trash2, Loader2, LayoutGrid, List, RefreshCw } from "lucide-react";
interface FreebetEntry {
  odd: string;
  commission: string;
  isLay: boolean;
  stake: string;
  stakeManual: boolean;
}
export const CalculatorFreeProDirect = () => {
  const [mode, setMode] = useState<"freebet" | "cashback">("freebet");
  const [numEntries, setNumEntries] = useState(3);
  const [rounding, setRounding] = useState(1.0);
  const [isSharing, setIsSharing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [fixedStakeIndex, setFixedStakeIndex] = useState<number | null>(null);

  // Nomes editáveis para os cards - expandido para 10 casas
  const [houseNames, setHouseNames] = useState<string[]>(["Casa Promo", ...Array(9).fill(null).map((_, i) => `Casa ${i + 2}`)]);
  const [editingName, setEditingName] = useState<number | null>(null);

  // Freebet fields
  const [houseOdd, setHouseOdd] = useState("");
  const [houseCommission, setHouseCommission] = useState("");
  const [qualifyingStake, setQualifyingStake] = useState("");
  const [freebetValue, setFreebetValue] = useState("");
  const [extractionRate, setExtractionRate] = useState("65");

  // Cashback fields
  const [cashbackOdd, setCashbackOdd] = useState("");
  const [cashbackCommission, setCashbackCommission] = useState("");
  const [cashbackStake, setCashbackStake] = useState("");
  const [cashbackRate, setCashbackRate] = useState("");

  // Coverage entries - expandido para 10 mercados
  const [entries, setEntries] = useState<FreebetEntry[]>(Array(9).fill(null).map(() => ({
    odd: "",
    commission: "",
    isLay: false,
    stake: "",
    stakeManual: false
  })));

  // Results
  const [totalStake, setTotalStake] = useState(0);
  const [roi, setRoi] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const parseFlex = (val: string): number => {
    if (!val) return 0;
    const cleaned = val.replace(/[^\d.,-]/g, "").replace(",", ".");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };
  const toNum = (val: string): number => {
    if (val === undefined || val === null) return NaN;
    const str = String(val).trim();
    if (!str) return NaN;
    if (str.indexOf(",") !== -1 && str.indexOf(".") !== -1) {
      return parseFloat(str.replace(/\.|\,/g, match => match === "," ? "." : ""));
    }
    if (str.indexOf(",") !== -1) return parseFloat(str.replace(",", "."));
    return parseFloat(str);
  };
  const formatBRL = (val: number): string => {
    return val.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  const roundStep = useCallback((v: number) => Math.round(v / rounding) * rounding, [rounding]);

  // Formatar stake como xx,xx
  const formatStakeValue = (value: string): string => {
    const num = parseFlex(value);
    if (isNaN(num) || num === 0) return "";
    return num.toFixed(2).replace(".", ",");
  };

  // Handler para formatação ao sair do campo
  const handleStakeBlur = (idx: number, value: string) => {
    const formatted = formatStakeValue(value);
    if (formatted) {
      updateEntry(idx, "stake", formatted);
    }
  };

  // Handler genérico para formatação de valores monetários
  const handleMoneyBlur = (setter: (value: string) => void, value: string) => {
    const formatted = formatStakeValue(value);
    if (formatted) {
      setter(formatted);
    }
  };

  // Função effOdd igual ao original
  const effOdd = (odd: number, comm: number) => {
    const cc = Number.isFinite(comm) && comm > 0 ? comm / 100 : 0;
    return 1 + (odd - 1) * (1 - cc);
  };
  const calculateFreebet = useCallback(() => {
    const o1 = toNum(houseOdd);
    const c1 = toNum(houseCommission);
    const s1 = toNum(qualifyingStake);
    const F = toNum(freebetValue);
    const r = toNum(extractionRate);

    // Validação
    if (!Number.isFinite(o1) || o1 <= 1 || !Number.isFinite(F) || F < 0 || !Number.isFinite(r) || r < 0 || r > 100 || !Number.isFinite(s1) || s1 <= 0) {
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
    const o1e = effOdd(o1, c1);
    const rF = r / 100 * F; // Valor efetivo do freebet

    // Calcular odds efetivas de cada cobertura
    const oddsOrig: number[] = [];
    const commFrac: number[] = [];
    const eBack: number[] = [];
    validEntries.forEach(entry => {
      const L = toNum(entry.odd);
      const comm = toNum(entry.commission);
      const cfrac = Number.isFinite(comm) && comm > 0 ? comm / 100 : 0;
      commFrac.push(cfrac);
      oddsOrig.push(L);
      if (entry.isLay) {
        const denom = L - 1;
        if (denom > 0) {
          const eLay = 1 + (1 - cfrac) / denom;
          eBack.push(eLay);
        } else {
          eBack.push(1);
        }
      } else {
        eBack.push(effOdd(L, comm));
      }
    });

    // LÓGICA DE EQUILÍBRIO CORRIGIDA
    // Objetivo: encontrar stakes que equilibrem o lucro em todos os cenários
    //
    // Lucro cenário 0 (casa promo vence): L0 = s1 * o1e - totalStake
    // Lucro cenário k (cobertura k vence): Lk = stakek * eBackk - totalStake + rF
    //
    // Para equilibrar: L0 = L1 = L2 = ... = Ln = L
    //
    // Resolvendo o sistema:
    // s1 * o1e - (s1 + sum(stakes)) = L
    // stakek * eBackk - (s1 + sum(stakes)) + rF = L
    //
    // Da primeira: sum(stakes) = s1 * o1e - s1 - L = s1 * (o1e - 1) - L
    // Da segunda: stakek * eBackk = L + s1 + sum(stakes) - rF
    //           = L + s1 + s1*(o1e-1) - L - rF = s1*o1e - rF
    // Então: stakek = (s1 * o1e - rF) / eBackk

    let stakes: number[] = [];
    const hasFixedStake = fixedStakeIndex !== null && fixedStakeIndex > 0 && fixedStakeIndex <= validEntries.length;
    
    // Primeiro, calcular as stakes "ideais" sem stake fixa (para referência)
    const A = s1 * o1e - rF;
    const idealStakes = validEntries.map((entry, idx) => {
      if (entry.isLay) {
        const L = oddsOrig[idx];
        const denom = L - 1;
        return A / eBack[idx] / denom;
      } else {
        return A / eBack[idx];
      }
    });
    
    if (hasFixedStake) {
      // ESCALONAMENTO PROPORCIONAL PARA STAKE FIXA
      // Quando uma stake é fixada, calculamos o fator de escala e aplicamos a todas
      // Isso mantém a PROPORÇÃO entre as stakes, preservando o equilíbrio entre coberturas
      const fixedIdx = fixedStakeIndex! - 1;
      const fixedEntry = validEntries[fixedIdx];
      const fixedStakeVal = toNum(fixedEntry.stake);
      
      if (Number.isFinite(fixedStakeVal) && fixedStakeVal > 0 && idealStakes[fixedIdx] > 0) {
        // Calcular fator de escala baseado na diferença entre stake ideal e stake fixada
        const idealFixed = idealStakes[fixedIdx];
        const scaleFactor = fixedStakeVal / idealFixed;
        
        // Aplicar o mesmo fator a TODAS as outras stakes para manter proporção
        validEntries.forEach((entry, idx) => {
          if (idx === fixedIdx) {
            // Stake fixada: usar valor EXATO do usuário
            stakes.push(fixedStakeVal);
          } else {
            // Outras stakes: escalar proporcionalmente
            stakes.push(idealStakes[idx] * scaleFactor);
          }
        });
      } else {
        // Stake fixada inválida ou ideal zero, usar cálculo padrão
        stakes = [...idealStakes];
      }
    } else {
      // Cálculo padrão de equilíbrio
      stakes = [...idealStakes];
    }

    // Arredondamento - NÃO arredondar stake que foi fixada manualmente
    const roundedStakes = stakes.map((s, idx) => {
      // Se esta stake foi fixada manualmente, preservar valor EXATO
      if (hasFixedStake && idx === fixedStakeIndex! - 1) {
        return Math.max(s, 0.5);
      }
      return Math.max(roundStep(s), 0.5);
    });

    // Liabilities para lay
    const liabilities = roundedStakes.map((stake, idx) => {
      return validEntries[idx].isLay ? (oddsOrig[idx] - 1) * stake : 0;
    });

    // Total investido
    const total = s1 + roundedStakes.reduce((acc, stake, idx) => {
      return acc + (validEntries[idx].isLay ? liabilities[idx] : stake);
    }, 0);

    // Lucro cenário 0 (casa promo vence)
    const net1 = s1 * o1e - total;

    // Lucros nos outros cenários
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
    const roiCalc = total > 0 ? lucroMedio / total * 100 : 0;
    setTotalStake(total);
    setRoi(roiCalc);

    // Atualizar stakes nos entries - só preservar a stake fixada pelo fixedStakeIndex
    const newEntries = [...entries];
    let hasStakeChange = false;
    roundedStakes.forEach((stake, idx) => {
      // Só preservar a stake se for exatamente a fixada pelo índice
      const isFixedStake = hasFixedStake && idx === fixedStakeIndex! - 1;
      if (!isFixedStake) {
        const newStakeStr = stake.toFixed(2);
        if (newEntries[idx].stake !== newStakeStr) {
          hasStakeChange = true;
          newEntries[idx] = {
            ...newEntries[idx],
            stake: newStakeStr,
            stakeManual: false // Limpar flag para stakes não fixadas
          };
        }
      }
    });
    if (hasStakeChange) {
      setEntries(newEntries);
    }
    const hasLay = validEntries.some(e => e.isLay);
    const resultsData = [{
      name: `1 vence (${houseNames[0]})`,
      odd: houseOdd && houseOdd.trim() ? houseOdd.replace(".", ",") : o1.toFixed(2).replace(".", ","),
      commission: (Number.isFinite(c1) ? c1 : 0).toFixed(2),
      stake: `R$ ${s1.toFixed(2).replace(".", ",")}`,
      deficit: "-",
      liability: hasLay ? "-" : undefined,
      profit: formatBRL(profits[0])
    }, ...validEntries.map((entry, idx) => ({
      name: `${idx + 2} vence (${houseNames[idx + 1]})`,
      odd: entry.odd && entry.odd.trim() ? entry.odd.replace(".", ",") : oddsOrig[idx].toFixed(2).replace(".", ","),
      commission: (Number.isFinite(toNum(entry.commission)) ? toNum(entry.commission) : 0).toFixed(2),
      stake: `R$ ${roundedStakes[idx].toFixed(2).replace(".", ",")}` + (entry.isLay ? " (LAY)" : ""),
      deficit: formatBRL(defs[idx]),
      liability: hasLay ? entry.isLay ? formatBRL(liabilities[idx]) : "-" : undefined,
      profit: formatBRL(profits[idx + 1])
    }))];
    setResults(resultsData);
  }, [houseOdd, houseCommission, qualifyingStake, freebetValue, extractionRate, entries, numEntries, rounding, fixedStakeIndex, houseNames, roundStep]);
  const calculateCashback = useCallback(() => {
    const odd = toNum(cashbackOdd);
    const stake = toNum(cashbackStake);
    const cbRate = toNum(cashbackRate);
    const mainComm = toNum(cashbackCommission);
    if (!Number.isFinite(odd) || odd <= 1 || !Number.isFinite(stake) || stake <= 0 || !Number.isFinite(cbRate) || cbRate < 0 || cbRate > 100) {
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
    const Oeff = effOdd(odd, mainComm);
    const commFrac: number[] = [];
    const eBack: number[] = [];
    const oddsOrig: number[] = [];
    validEntries.forEach(entry => {
      const L = toNum(entry.odd);
      const comm = toNum(entry.commission);
      const cfrac = Number.isFinite(comm) && comm > 0 ? comm / 100 : 0;
      commFrac.push(cfrac);
      oddsOrig.push(L);
      if (entry.isLay) {
        const denom = L - 1;
        eBack.push(1 + (1 - cfrac) / denom);
      } else {
        eBack.push(effOdd(L, comm));
      }
    });

    // Calcular H para verificar se é possível nivelar
    const H = eBack.reduce((a, e) => a + 1 / e, 0);
    let stakes: number[] = [];
    const hasFixedStake = fixedStakeIndex !== null && fixedStakeIndex > 0 && fixedStakeIndex <= validEntries.length;
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
      // Modo nivelado
      if (hasFixedStake) {
        const fixedIdx = fixedStakeIndex! - 1;
        const fixedStakeVal = toNum(validEntries[fixedIdx].stake);
        if (Number.isFinite(fixedStakeVal) && fixedStakeVal > 0) {
          const fixedReturn = fixedStakeVal * eBack[fixedIdx];
          validEntries.forEach((entry, idx) => {
            if (idx === fixedIdx) {
              stakes.push(fixedStakeVal);
            } else {
              stakes.push(fixedReturn / eBack[idx]);
            }
          });
        } else {
          // Cálculo padrão
          const P = stake;
          const C = cashbackAmount;
          const N = -P * (1 - Oeff + H * Oeff) + H * C;
          const S_total = P * Oeff - N;
          const numer = N + S_total - C;
          validEntries.forEach((entry, idx) => {
            if (entry.isLay) {
              const desiredLiability = numer / eBack[idx];
              const L = oddsOrig[idx];
              stakes.push(desiredLiability / (L - 1));
            } else {
              stakes.push(numer / eBack[idx]);
            }
          });
        }
      } else {
        const P = stake;
        const C = cashbackAmount;
        const N = -P * (1 - Oeff + H * Oeff) + H * C;
        const S_total = P * Oeff - N;
        const numer = N + S_total - C;
        validEntries.forEach((entry, idx) => {
          if (entry.isLay) {
            const desiredLiability = numer / eBack[idx];
            const L = oddsOrig[idx];
            stakes.push(desiredLiability / (L - 1));
          } else {
            stakes.push(numer / eBack[idx]);
          }
        });
      }
    }

    // Arredondamento
    stakes = stakes.map(s => Math.max(roundStep(s), 0.5));

    // Liabilities
    const liabilities = stakes.map((s, idx) => {
      return validEntries[idx].isLay ? (oddsOrig[idx] - 1) * s : 0;
    });

    // Total
    const total = stake + stakes.reduce((acc, s, idx) => {
      return acc + (validEntries[idx].isLay ? liabilities[idx] : s);
    }, 0);

    // Lucro se ganhar aposta principal
    const net1 = stake * Oeff - total;

    // Lucros nas coberturas
    const defs: number[] = [];
    const profits: number[] = [net1];
    for (let win = 0; win < stakes.length; win++) {
      let deficit;
      if (validEntries[win].isLay) {
        const ganhoLay = stakes[win] * (1 - commFrac[win]);
        const liab = liabilities[win];
        deficit = ganhoLay - (total - liab);
      } else {
        deficit = stakes[win] * eBack[win] - total;
      }
      defs.push(deficit);
      profits.push(deficit + cashbackAmount);
    }
    const lucroMedio = profits.reduce((a, b) => a + b, 0) / profits.length;
    const roiCalc = total > 0 ? lucroMedio / total * 100 : 0;
    setTotalStake(total);
    setRoi(roiCalc);

    // Atualizar stakes nos entries - só preservar a stake fixada pelo fixedStakeIndex
    const newEntries = [...entries];
    let hasStakeChange = false;
    stakes.forEach((stakeVal, idx) => {
      // Só preservar a stake se for exatamente a fixada pelo índice
      const isFixedStake = hasFixedStake && idx === fixedStakeIndex! - 1;
      if (!isFixedStake) {
        const newStakeStr = stakeVal.toFixed(2);
        if (newEntries[idx].stake !== newStakeStr) {
          hasStakeChange = true;
          newEntries[idx] = {
            ...newEntries[idx],
            stake: newStakeStr,
            stakeManual: false // Limpar flag para stakes não fixadas
          };
        }
      }
    });
    if (hasStakeChange) {
      setEntries(newEntries);
    }
    const hasLay = validEntries.some(e => e.isLay);
    const resultsData = [{
      name: `1 vence (${houseNames[0]})`,
      odd: cashbackOdd && cashbackOdd.trim() ? cashbackOdd.replace(".", ",") : odd.toFixed(2).replace(".", ","),
      commission: (Number.isFinite(mainComm) ? mainComm : 0).toFixed(2),
      stake: `R$ ${stake.toFixed(2).replace(".", ",")}`,
      deficit: "-",
      liability: hasLay ? "-" : undefined,
      profit: formatBRL(profits[0])
    }, ...validEntries.map((entry, idx) => ({
      name: `${idx + 2} vence (${houseNames[idx + 1]})`,
      odd: entry.odd && entry.odd.trim() ? entry.odd.replace(".", ",") : oddsOrig[idx].toFixed(2).replace(".", ","),
      commission: (Number.isFinite(toNum(entry.commission)) ? toNum(entry.commission) : 0).toFixed(2),
      stake: `R$ ${stakes[idx].toFixed(2).replace(".", ",")}` + (entry.isLay ? " (LAY)" : ""),
      deficit: formatBRL(defs[idx]),
      liability: hasLay ? entry.isLay ? formatBRL(liabilities[idx]) : "-" : undefined,
      profit: formatBRL(profits[idx + 1])
    }))];
    setResults(resultsData);
  }, [cashbackOdd, cashbackCommission, cashbackStake, cashbackRate, entries, numEntries, rounding, fixedStakeIndex, houseNames, roundStep]);
  useEffect(() => {
    if (mode === "freebet") {
      calculateFreebet();
    } else {
      calculateCashback();
    }
  }, [
    mode, 
    calculateFreebet, 
    calculateCashback,
    // Dependências diretas para garantir recálculo quando valores mudam
    houseOdd, 
    houseCommission, 
    qualifyingStake, 
    freebetValue, 
    extractionRate,
    cashbackOdd,
    cashbackCommission,
    cashbackStake,
    cashbackRate,
    entries, 
    numEntries, 
    rounding, 
    fixedStakeIndex
  ]);
  const updateEntry = (index: number, field: keyof FreebetEntry, value: any) => {
    const newEntries = [...entries];
    if (field === "stake") {
      // Ao editar stake manualmente: 
      // 1. Marcar APENAS esta entry como manual
      // 2. Limpar stakeManual de todas as outras e resetar stakes para forçar recálculo
      newEntries.forEach((entry, idx) => {
        if (idx === index) {
          newEntries[idx] = {
            ...entry,
            stake: value,
            stakeManual: true
          };
        } else {
          // Limpar flag manual e stake das outras para forçar recálculo
          newEntries[idx] = {
            ...entry,
            stakeManual: false
          };
        }
      });
      // Setar fixedStakeIndex para recalcular baseado nesta stake editada
      setFixedStakeIndex(index + 1);
    } else {
      newEntries[index] = {
        ...newEntries[index],
        [field]: value
      };
      // Se mudou odd ou commission, resetar stake manual
      if (field === "odd" || field === "commission" || field === "isLay") {
        newEntries[index].stakeManual = false;
      }
    }
    setEntries(newEntries);
  };
  const handleFixStake = (index: number) => {
    if (fixedStakeIndex === index + 1) {
      // Desfixar
      setFixedStakeIndex(null);
      // Resetar flag manual de todas as stakes
      const newEntries = entries.map(e => ({
        ...e,
        stakeManual: false
      }));
      setEntries(newEntries);
    } else {
      // Fixar esta stake
      setFixedStakeIndex(index + 1);
      // Marcar esta stake como manual
      const newEntries = [...entries];
      newEntries[index] = {
        ...newEntries[index],
        stakeManual: true
      };
      setEntries(newEntries);
    }
  };

  // Serializar estado para URL
  const serializeState = () => {
    const state: any = {
      mode,
      numEntries,
      rounding
    };
    if (mode === "freebet") {
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
    const validEntries = entries.slice(0, numEntries - 1).filter(e => e.odd || e.commission);
    if (validEntries.length > 0) {
      state.entries = validEntries.map(e => ({
        o: String(e.odd || ""),
        c: String(e.commission || ""),
        l: e.isLay ? 1 : 0,
        s: String(e.stake || ""),
        m: e.stakeManual ? 1 : 0
      }));
    }
    if (fixedStakeIndex !== null) {
      state.fsi = fixedStakeIndex;
    }
    return state;
  };

  // Deserializar URL para estado
  const deserializeState = (params: URLSearchParams) => {
    try {
      const modeParam = params.get("mode") as "freebet" | "cashback" || "freebet";
      setMode(modeParam);
      const numEntriesParam = parseInt(params.get("numEntries") || "3");
      setNumEntries(numEntriesParam);
      const roundingParam = parseFloat(params.get("rounding") || "1.00");
      setRounding(roundingParam);
      if (params.has("fsi")) {
        setFixedStakeIndex(parseInt(params.get("fsi")!));
      }
      if (modeParam === "freebet") {
        if (params.has("ho")) setHouseOdd(String(params.get("ho")!));
        if (params.has("hc")) setHouseCommission(String(params.get("hc")!));
        if (params.has("qs")) setQualifyingStake(String(params.get("qs")!));
        if (params.has("fv")) setFreebetValue(String(params.get("fv")!));
        if (params.has("er")) setExtractionRate(String(params.get("er")!));
      } else {
        if (params.has("co")) setCashbackOdd(String(params.get("co")!));
        if (params.has("cc")) setCashbackCommission(String(params.get("cc")!));
        if (params.has("cs")) setCashbackStake(String(params.get("cs")!));
        if (params.has("cr")) setCashbackRate(String(params.get("cr")!));
      }
      const entriesStr = params.get("entries");
      if (entriesStr) {
        try {
          const entriesData = JSON.parse(entriesStr);
          const newEntries = [...entries];
          entriesData.forEach((e: any, idx: number) => {
            if (idx < newEntries.length) {
              newEntries[idx] = {
                odd: String(e.o || ""),
                commission: String(e.c || ""),
                isLay: e.l === 1,
                stake: String(e.s || ""),
                stakeManual: e.m === 1
              };
            }
          });
          setEntries(newEntries);
        } catch (error) {
          console.error("Erro ao restaurar entries:", error);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados da URL:", error);
      toast({
        title: "Erro ao carregar",
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
        if (key === "entries") {
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
        title: "Link copiado!",
        description: "Compartilhe com outros usuários."
      });
    } catch (error) {
      toast({
        title: "Link gerado",
        description: "Copie o endereço da barra do navegador."
      });
      window.history.pushState({}, "", url);
    } finally {
      setTimeout(() => setIsSharing(false), 500);
    }
  };

  // Limpar todos os dados
  const handleClear = () => {
    setIsClearing(true);
    window.history.pushState({}, "", window.location.pathname + window.location.hash);
    setMode("freebet");
    setNumEntries(3);
    setRounding(1.0);
    setFixedStakeIndex(null);
    setHouseNames(["Casa Promo", ...Array(5).fill(null).map((_, i) => `Casa ${i + 2}`)]);
    setEditingName(null);
    setHouseOdd("");
    setHouseCommission("");
    setQualifyingStake("");
    setFreebetValue("");
    setExtractionRate("70");
    setCashbackOdd("");
    setCashbackCommission("");
    setCashbackStake("");
    setCashbackRate("");
    setEntries(Array(5).fill(null).map(() => ({
      odd: "",
      commission: "",
      isLay: false,
      stake: "",
      stakeManual: false
    })));
    setResults([]);
    setTotalStake(0);
    setRoi(0);
    toast({
      title: "Dados limpos",
      description: "Todos os campos foram limpos com sucesso."
    });
    setTimeout(() => setIsClearing(false), 500);
  };

  // Auto-balancear: remove stake manual e recalcula tudo
  const handleAutoBalance = () => {
    setFixedStakeIndex(null);
    setEntries(prev => prev.map(entry => ({
      ...entry,
      stake: "",
      stakeManual: false
    })));
    toast({
      title: "Auto-balanceado",
      description: "Stakes recalculadas para equilibrar todos os cenários."
    });
  };

  // Carregar estado da URL ao montar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("mode") || params.has("ho") || params.has("co")) {
      deserializeState(params);
    }
  }, []);
  return <div className="w-full">
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
            <button onClick={() => setMode("freebet")} className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all ${mode === "freebet" ? "bg-gradient-to-r from-[hsl(var(--shark-gradient-start))] to-[hsl(var(--shark-gradient-end))] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              Freebet
            </button>
            <button onClick={() => setMode("cashback")} className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all ${mode === "cashback" ? "bg-gradient-to-r from-[hsl(var(--shark-gradient-start))] to-[hsl(var(--shark-gradient-end))] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              Cashback
            </button>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Número de Entradas</div>
          <select value={numEntries} onChange={e => setNumEntries(parseInt(e.target.value))} className="form-select mt-3 w-full">
            <option value="2">2 Mercados</option>
            <option value="3">3 Mercados</option>
            <option value="4">4 Mercados</option>
            <option value="5">5 Mercados</option>
            <option value="6">6 Mercados</option>
            <option value="7">7 Mercados</option>
            <option value="8">8 Mercados</option>
            <option value="9">9 Mercados</option>
            <option value="10">10 Mercados</option>
          </select>
        </div>

        <div className="stat-card">
          <div className="stat-label">Arredondamento</div>
          <select value={rounding} onChange={e => setRounding(parseFloat(e.target.value))} className="form-select mt-3 w-full">
            <option value={0.01}>R$ 0,01</option>
            <option value={0.1}>R$ 0,10</option>
            <option value={0.5}>R$ 0,50</option>
            <option value={1.0}>R$ 1,00</option>
          </select>
        </div>

        <div className="stat-card">
          <div className="stat-label">Visualização</div>
          <div className="view-toggle mt-3">
            <button onClick={() => setViewMode("cards")} className={`btn-view ${viewMode === "cards" ? "active" : ""}`} title="Modo Cards">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("table")} className={`btn-view ${viewMode === "table" ? "active" : ""}`} title="Modo Tabela">
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Casa Promoção - Freebet */}
      {mode === "freebet" && <div className="card mb-6">
          {editingName === 0 ? <input type="text" value={houseNames[0]} onChange={e => {
        const newNames = [...houseNames];
        newNames[0] = e.target.value;
        setHouseNames(newNames);
      }} onBlur={() => setEditingName(null)} onKeyDown={e => {
        if (e.key === "Enter") {
          setEditingName(null);
        }
      }} autoFocus className="section-title bg-transparent border-b-2 border-[hsl(var(--shark-gradient-start))] outline-none w-full mb-4" /> : <div className="section-title cursor-pointer hover:opacity-80 transition-opacity mb-4" onClick={() => setEditingName(0)} title="Clique para editar o nome">
              {houseNames[0]} (Freebet)
            </div>}

          <div className="grid-2 mb-4">
            <div className="form-group">
              <label className="form-label">Odd da Casa</label>
              <input type="text" value={houseOdd} onChange={e => setHouseOdd(e.target.value)} className="form-input" placeholder="R$ 0,00" />
            </div>
            <div className="form-group">
              <label className="form-label">Comissão (%)</label>
              <input type="text" value={houseCommission} onChange={e => setHouseCommission(e.target.value)} placeholder="ex: 0" className="form-input" />
            </div>
          </div>

          <div className="grid-2 mb-4">
            <div className="form-group">
              <label className="form-label">Stake Qualificação</label>
              <input type="text" value={qualifyingStake} onChange={e => setQualifyingStake(e.target.value)} onBlur={e => handleMoneyBlur(setQualifyingStake, e.target.value)} placeholder="0,00" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Valor da Freebet</label>
              <input type="text" value={freebetValue} onChange={e => setFreebetValue(e.target.value)} onBlur={e => handleMoneyBlur(setFreebetValue, e.target.value)} placeholder="0,00" className="form-input" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Taxa de Extração (%)</label>
            <input type="text" value={extractionRate} onChange={e => setExtractionRate(e.target.value)} placeholder="ex: 70" className="form-input" />
          </div>
        </div>}

      {/* Casa Promoção - Cashback */}
      {mode === "cashback" && <div className="card mb-6">
          {editingName === 0 ? <input type="text" value={houseNames[0]} onChange={e => {
        const newNames = [...houseNames];
        newNames[0] = e.target.value;
        setHouseNames(newNames);
      }} onBlur={() => setEditingName(null)} onKeyDown={e => {
        if (e.key === "Enter") {
          setEditingName(null);
        }
      }} autoFocus className="section-title bg-transparent border-b-2 border-[hsl(var(--shark-gradient-start))] outline-none w-full mb-4" /> : <div className="section-title cursor-pointer hover:opacity-80 transition-opacity mb-4" onClick={() => setEditingName(0)} title="Clique para editar o nome">
              {houseNames[0]} (Cashback)
            </div>}

          <div className="grid-2 mb-4">
            <div className="form-group">
              <label className="form-label">Odd da Casa</label>
              <input type="text" value={cashbackOdd} onChange={e => setCashbackOdd(e.target.value)} placeholder="ex: 3.00" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Comissão (%)</label>
              <input type="text" value={cashbackCommission} onChange={e => setCashbackCommission(e.target.value)} placeholder="ex: 0" className="form-input" />
            </div>
          </div>

          <div className="grid-2 mb-4">
            <div className="form-group">
              <label className="form-label">Stake Qualificação</label>
              <input type="text" value={cashbackStake} onChange={e => setCashbackStake(e.target.value)} onBlur={e => handleMoneyBlur(setCashbackStake, e.target.value)} placeholder="0,00" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Taxa de Cashback (%)</label>
              <input type="text" value={cashbackRate} onChange={e => setCashbackRate(e.target.value)} placeholder="ex: 10" className="form-input" />
            </div>
          </div>
        </div>}

      {/* Coberturas */}
      <div className="card mb-6">
        <div className="section-title-wrapper">
          <div className="section-title-left">
            <span className="section-title" style={{
            marginBottom: 0,
            borderBottom: "none",
            paddingBottom: 0
          }}>
              Coberturas
            </span>
            <span className={`houses-counter ${entries.slice(0, numEntries - 1).filter(e => parseFlex(e.odd) > 0).length === numEntries - 1 && numEntries > 1 ? "complete" : ""}`}>
              {entries.slice(0, numEntries - 1).filter(e => parseFlex(e.odd) > 0).length}/{numEntries - 1} preenchidos
            </span>
          </div>
        </div>

        {viewMode === "cards" ? <div className="house-grid" key="cards-view">
            {entries.slice(0, numEntries - 1).map((entry, idx) => <div key={idx} className="house-card">
                {editingName === idx + 1 ? <input type="text" value={houseNames[idx + 1]} onChange={e => {
            const newNames = [...houseNames];
            newNames[idx + 1] = e.target.value;
            setHouseNames(newNames);
          }} onBlur={() => setEditingName(null)} onKeyDown={e => {
            if (e.key === "Enter") {
              setEditingName(null);
            }
          }} autoFocus className="house-title bg-transparent border-b-2 border-[hsl(var(--shark-gradient-start))] outline-none w-full mb-4" /> : <h3 className="house-title cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setEditingName(idx + 1)} title="Clique para editar o nome">
                    {houseNames[idx + 1]}
                  </h3>}

                <div className="grid-2 mb-4">
                  <div className="form-group">
                    <label className="form-label">Odd</label>
                    <input type="text" value={entry.odd} onChange={e => updateEntry(idx, "odd", e.target.value)} placeholder="ex: 2.50" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Comissão (%)</label>
                    <input type="text" value={entry.commission} onChange={e => updateEntry(idx, "commission", e.target.value)} placeholder="ex: 0" className="form-input" />
                  </div>
                </div>

                {/* Stake editável */}
                <div className="form-group mb-4">
                  <label className="form-label">Stake</label>
                  <div className="relative">
                    <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem" }}>R$</span>
                    <input type="text" value={entry.stake} onChange={e => updateEntry(idx, "stake", e.target.value)} placeholder="0,00" className="form-input" style={{ paddingLeft: "2.25rem" }} />
                  </div>
                </div>

                <button onClick={() => updateEntry(idx, "isLay", !entry.isLay)} className={`btn-toggle-backlay ${entry.isLay ? "active" : ""}`}>
                  {entry.isLay ? "LAY" : "BACK"}
                </button>
              </div>)}
          </div> : <div className="house-table-container" key="table-view">
            <table className="house-table">
              <thead>
                <tr>
                  <th className="col-casa">Casa</th>
                  <th className="col-odd">ODD</th>
                  <th className="col-commission">COMISSÃO</th>
                  <th className="col-stake">STAKE</th>
                  <th className="col-backlay">BACK/LAY</th>
                  <th className="col-deficit">DEFICIT</th>
                  <th className="col-lucro">LUCRO</th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(0, numEntries - 1).map((entry, idx) => <tr className="house-row" key={idx}>
                    <td>
                      {editingName === idx + 1 ? <input type="text" value={houseNames[idx + 1]} onChange={e => {
                  const newNames = [...houseNames];
                  newNames[idx + 1] = e.target.value;
                  setHouseNames(newNames);
                }} onBlur={() => setEditingName(null)} onKeyDown={e => {
                  if (e.key === "Enter") {
                    setEditingName(null);
                  }
                }} autoFocus className="table-input" /> : <span className="house-name-editable cursor-pointer hover:opacity-80" onClick={() => setEditingName(idx + 1)} title="Clique para editar">
                          {houseNames[idx + 1]}
                        </span>}
                    </td>
                    <td className="col-odd">
                      <input type="text" value={entry.odd} onChange={e => updateEntry(idx, "odd", e.target.value)} placeholder="2.50" className="table-input" style={{
                  background: "hsl(var(--background))"
                }} />
                    </td>
                    <td className="col-commission">
                      <input type="text" value={entry.commission} onChange={e => updateEntry(idx, "commission", e.target.value)} placeholder="0" className="table-input-mini" style={{
                  background: "hsl(var(--background))"
                }} />
                    </td>
                    <td className="col-stake">
                      <div className="table-stake-wrapper">
                        <span className="currency-prefix">R$</span>
                        <input type="text" value={entry.stake} onChange={e => updateEntry(idx, "stake", e.target.value)} onBlur={e => handleStakeBlur(idx, e.target.value)} placeholder="0,00" className="stake-input" style={{
                    background: "hsl(var(--background))"
                  }} />
                      </div>
                    </td>
                    <td className="col-backlay">
                      <button onClick={() => updateEntry(idx, "isLay", !entry.isLay)} className={`btn-toggle-mini ${entry.isLay ? "active" : ""}`}>
                        {entry.isLay ? "LAY" : "BACK"}
                      </button>
                    </td>
                    <td className="col-deficit">
                      {results[idx + 1] ? <span className={parseFlex(results[idx + 1].deficit?.replace?.(/[^\d.,-]/g, "") || "0") >= 0 ? "profit-positive" : "profit-negative"}>
                          {results[idx + 1].deficit || "-"}
                        </span> : "-"}
                    </td>
                    <td className="col-lucro profit-cell">
                      {results[idx + 1] ? <span className={parseFlex(results[idx + 1].profit?.replace?.(/[^\d.,-]/g, "") || "0") >= 0 ? "profit-positive" : "profit-negative"}>
                          {results[idx + 1].profit || "-"}
                        </span> : "-"}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>}
      </div>

      {/* Botões Ação */}
      <div className="flex justify-center gap-4 mb-6" style={{
      flexWrap: "wrap"
    }}>
        <button onClick={handleShare} disabled={isSharing} className="btn btn-primary flex items-center gap-2" style={{
        minWidth: "180px"
      }}>
          {isSharing ? <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Copiando...
            </> : <>
              <Link className="w-4 h-4" />
              Compartilhar
            </>}
        </button>
        <button onClick={handleClear} disabled={isClearing} className="btn btn-secondary flex items-center gap-2" style={{
        minWidth: "180px"
      }}>
          {isClearing ? <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Limpando...
            </> : <>
              <Trash2 className="w-4 h-4" />
              Limpar Dados
            </>}
        </button>

        {/* Botão Auto-Balancear - sempre visível, desabilitado quando não há stake fixa */}
        <button 
          onClick={handleAutoBalance} 
          disabled={fixedStakeIndex === null}
          className={`btn flex items-center gap-2 ${
            fixedStakeIndex !== null 
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600" 
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
          }`}
          style={{ minWidth: "180px" }}
          title={fixedStakeIndex === null ? "Edite uma stake manualmente para ativar" : "Recalcular todas as stakes automaticamente"}
        >
          <RefreshCw className="w-4 h-4" />
          Auto-balancear
        </button>
      </div>

      {/* Resultados */}
      {results.length > 0 && <div className="card card-with-watermark">
          <div className="section-title">Resultados Shark FreePro</div>

          <div className="stats-grid" style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem",
        marginBottom: "1.5rem"
      }}>
            <div className="stat-card">
              <div className="stat-value">{formatBRL(totalStake)}</div>
              <div className="stat-label">Stake Total</div>
            </div>

            <div className="stat-card">
              <div className={`stat-value ${roi >= 0 ? "profit-highlight" : "profit-negative"}`}>
                {roi >= 0 ? "+" : ""}
                {roi.toFixed(2)}%
              </div>
              <div className="stat-label">ROI</div>
            </div>
          </div>

          <div style={{
        overflowX: "auto"
      }}>
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
                {results.map((result, idx) => <tr key={idx}>
                    <td>
                      <strong>{result.name}</strong>
                    </td>
                    <td>{result.odd}</td>
                    <td>{result.commission}%</td>
                    <td>{result.stake}</td>
                    {result.liability !== undefined && <td>{result.liability}</td>}
                    <td className={parseFlex(result.deficit) >= 0 ? "profit-positive" : "profit-negative"} style={{
                color: parseFlex(result.deficit) >= 0 ? "hsl(160, 85%, 50%)" : "hsl(0, 85%, 60%)",
                fontWeight: 700
              }}>
                      <strong>{result.deficit}</strong>
                    </td>
                    <td className={parseFlex(result.profit) >= 0 ? "profit-positive" : "profit-negative"} style={{
                color: parseFlex(result.profit) >= 0 ? "hsl(160, 85%, 50%)" : "hsl(0, 85%, 60%)",
                fontWeight: 700
              }}>
                      <strong>{result.profit}</strong>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>}
    </div>;
};
