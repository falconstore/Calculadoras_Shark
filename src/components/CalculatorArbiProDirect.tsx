import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Link, Trash2, Loader2 } from "lucide-react";
import sharkWatermark from "@/assets/shark-watermark.png";

interface House {
  odd: string;
  increase: string | null;
  finalOdd: number;
  stake: string;
  commission: string | null;
  freebet: boolean;
  fixedStake: boolean;
  lay: boolean;
  responsibility: string;
}

const MAX_HOUSES = 6;

export const CalculatorArbiProDirect = () => {
  const [numHouses, setNumHouses] = useState(3);
  const [rounding, setRounding] = useState(1.00);
  const [isSharing, setIsSharing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  // Nomes editáveis para os cards
  const [houseNames, setHouseNames] = useState<string[]>(
    Array(MAX_HOUSES).fill(null).map((_, i) => `Casa ${i + 1}`)
  );
  const [editingName, setEditingName] = useState<number | null>(null);
  
  const [houses, setHouses] = useState<House[]>(
    Array(MAX_HOUSES).fill(null).map((_, index) => ({
      odd: "",
      increase: null,
      finalOdd: 0,
      stake: index === 0 ? "100" : "0",
      commission: null,
      freebet: false,
      fixedStake: index === 0,
      lay: false,
      responsibility: ""
    }))
  );

  const [manualOverrides, setManualOverrides] = useState<{[key: number]: {stake?: boolean; responsibility?: boolean}}>({});
  const [results, setResults] = useState<{profits: number[], totalStake: number, roi: number}>({
    profits: [],
    totalStake: 0,
    roi: 0
  });

  const parseFlex = (val: string | number): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleaned = String(val).replace(/[^\d.,-]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const formatDecimal = (num: number): string => {
    if (!Number.isFinite(num)) return "0";
    return num.toFixed(2);
  };

  const formatBRL = (val: number): string => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const activeHouses = () => houses.slice(0, numHouses);

  const smartRoundStake = (value: number): string => {
    const num = parseFlex(value);
    if (!Number.isFinite(num)) return formatDecimal(num);
    
    const step = rounding;
    const rounded = Math.round(num / step) * step;
    
    return formatDecimal(rounded);
  };

  const calculateResults = () => {
    const active = activeHouses();
    let totalStake = 0;
    const profits = new Array(active.length).fill(0);

    active.forEach(h => {
      const stake = parseFlex(h.stake) || 0;
      const resp = parseFlex(h.responsibility) || 0;
      if (!h.freebet) totalStake += h.lay ? resp : stake;
    });

    active.forEach((h, idx) => {
      const stake = parseFlex(h.stake) || 0;
      const odd = h.finalOdd || 0;
      const commission = parseFlex(h.commission) || 0;
      
      if (h.lay) {
        const resp = parseFlex(h.responsibility) || 0;
        profits[idx] = stake * (1 - commission / 100) - (totalStake - resp);
      } else if (h.freebet) {
        const gross = stake * odd - totalStake;
        const comm = gross > 0 ? (commission / 100) * gross : 0;
        profits[idx] = gross - comm;
      } else {
        const grossReturn = stake * odd;
        const grossProfit = grossReturn - stake;
        const commissionAmount = grossProfit * (commission / 100);
        const netReturn = grossReturn - commissionAmount;
        profits[idx] = netReturn - totalStake;
      }
    });

    const minProfit = profits.length ? Math.min(...profits) : 0;
    const denom = active.some(h => h.freebet)
      ? active.reduce((s, h) => s + (h.freebet ? (parseFlex(h.stake) || 0) : 0), 0) || 1
      : (active.reduce((s, h) => s + (h.freebet ? 0 : (h.lay ? (parseFlex(h.responsibility) || 0) : (parseFlex(h.stake) || 0))), 0) || 1);
    
    const roi = (minProfit / denom) * 100;
    
    setResults({ profits, totalStake, roi });
  };

  const recalcStakeDistribution = () => {
    const active = activeHouses();
    const fixedIndex = active.findIndex(h => h.fixedStake);
    if (fixedIndex === -1) return;

    const fixed = active[fixedIndex];
    const fixedStake = parseFlex(fixed.stake) || 0;
    const fixedOdd = fixed.finalOdd;
    if (!(fixedStake > 0 && fixedOdd > 0)) return;

    const newHouses = [...houses];

    active.forEach((h, idx) => {
      const overrides = manualOverrides[idx] || {};
      const oddVal = parseFlex(h.odd) || 0;
      const stakeVal = parseFlex(h.stake) || 0;

      if (h.lay && !overrides.responsibility && oddVal > 1 && stakeVal > 0) {
        const responsibility = stakeVal * (oddVal - 1);
        newHouses[idx] = { ...newHouses[idx], responsibility: formatDecimal(responsibility) };
      }

      if (idx !== fixedIndex && h.finalOdd > 0 && !overrides.stake) {
        const fixedCommission = parseFlex(fixed.commission) || 0;
        const houseCommission = parseFlex(h.commission) || 0;
        
        const fixedGrossReturn = fixedStake * fixedOdd;
        const fixedGrossProfit = fixedGrossReturn - fixedStake;
        const fixedCommAmount = fixedGrossProfit * (fixedCommission / 100);
        const fixedNetReturn = fixedGrossReturn - fixedCommAmount;
        
        let calcStake;
        
        if (h.lay) {
          calcStake = fixedNetReturn / (h.finalOdd - houseCommission / 100);
        } else {
          const factor = h.finalOdd * (1 - houseCommission / 100) + (houseCommission / 100);
          calcStake = fixedNetReturn / factor;
        }
        
        const finalStakeStr = smartRoundStake(calcStake);
        const finalStakeNum = parseFlex(finalStakeStr) || 0;
        
        if (h.lay) {
          const resp = finalStakeNum * Math.max(oddVal - 1, 0);
          newHouses[idx] = { 
            ...newHouses[idx], 
            stake: finalStakeStr, 
            responsibility: formatDecimal(resp), 
            fixedStake: false 
          };
        } else {
          newHouses[idx] = { 
            ...newHouses[idx], 
            stake: finalStakeStr, 
            fixedStake: false 
          };
        }
      }
    });

    setHouses(newHouses);
  };

  const updateHouse = (index: number, updates: Partial<House>, overrideFields?: string[]) => {
    const newHouses = [...houses];
    newHouses[index] = { ...newHouses[index], ...updates };
    
    if (overrideFields) {
      const newOverrides = { ...manualOverrides };
      if (!newOverrides[index]) newOverrides[index] = {};
      overrideFields.forEach(field => {
        newOverrides[index][field as 'stake' | 'responsibility'] = true;
      });
      setManualOverrides(newOverrides);
    }
    
    const oddVal = parseFlex(newHouses[index].odd) || 0;
    const increaseVal = parseFlex(newHouses[index].increase) || 0;
    newHouses[index].finalOdd = oddVal * (1 + increaseVal / 100);
    
    setHouses(newHouses);
  };

  useEffect(() => {
    recalcStakeDistribution();
    calculateResults();
  }, [houses, numHouses, rounding]);

  const handleShare = async () => {
    setIsSharing(true);
    const state: any = {
      numHouses,
      rounding,
      houses: activeHouses().map(h => ({
        o: h.odd,
        s: h.stake,
        c: h.commission,
        i: h.increase,
        f: h.freebet ? 1 : 0,
        l: h.lay ? 1 : 0,
        fix: h.fixedStake ? 1 : 0
      })),
      names: houseNames.slice(0, numHouses)
    };

    const params = new URLSearchParams();
    Object.entries(state).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, JSON.stringify(value));
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

  const handleClear = () => {
    setIsClearing(true);
    window.history.pushState({}, '', window.location.pathname + window.location.hash);
    
    setNumHouses(3);
    setRounding(1.00);
    setHouseNames(Array(MAX_HOUSES).fill(null).map((_, i) => `Casa ${i + 1}`));
    setEditingName(null);
    setHouses(
      Array(MAX_HOUSES).fill(null).map((_, index) => ({
        odd: "",
        increase: null,
        finalOdd: 0,
        stake: index === 0 ? "100" : "0",
        commission: null,
        freebet: false,
        fixedStake: index === 0,
        lay: false,
        responsibility: ""
      }))
    );
    setManualOverrides({});
    setResults({ profits: [], totalStake: 0, roi: 0 });
    
    toast({
      title: "✅ Dados limpos",
      description: "Todos os campos foram limpos com sucesso.",
    });
    
    setTimeout(() => setIsClearing(false), 500);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('numHouses')) {
      try {
        const numHousesVal = JSON.parse(params.get('numHouses')!);
        setNumHouses(numHousesVal);
        
        if (params.has('rounding')) {
          setRounding(JSON.parse(params.get('rounding')!));
        }
        
        if (params.has('houses')) {
          const housesData = JSON.parse(params.get('houses')!);
          const newHouses = [...houses];
          housesData.forEach((h: any, idx: number) => {
            if (idx < newHouses.length) {
              newHouses[idx] = {
                odd: h.o || "",
                stake: h.s || "0",
                commission: h.c,
                increase: h.i,
                freebet: h.f === 1,
                lay: h.l === 1,
                fixedStake: h.fix === 1,
                finalOdd: 0,
                responsibility: ""
              };
            }
          });
          setHouses(newHouses);
        }
        
        if (params.has('names')) {
          const names = JSON.parse(params.get('names')!);
          setHouseNames([...names, ...houseNames.slice(names.length)]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da URL:', error);
      }
    }
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="calc-header mb-8">
        <h1 className="text-3xl md:text-4xl font-black mb-4">
          <span className="text-gradient">Calculadora ArbiPro</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Calcule stakes otimizados para garantir lucro em qualquer resultado, usando freebet ou não
        </p>
      </div>

      {/* Configurações */}
      <div className="stats-grid mb-8">
        <div className="stat-card">
          <div className="stat-label">Configurações</div>
          <select
            value={numHouses}
            onChange={(e) => setNumHouses(parseInt(e.target.value))}
            className="form-select mt-3 w-full"
          >
            <option value="2">2 Casas</option>
            <option value="3">3 Casas</option>
            <option value="4">4 Casas</option>
            <option value="5">5 Casas</option>
            <option value="6">6 Casas</option>
          </select>
        </div>

        <div className="stat-card">
          <div className="stat-label">Arredondamento</div>
          <select
            value={rounding}
            onChange={(e) => setRounding(parseFloat(e.target.value))}
            className="form-select mt-3 w-full"
          >
            <option value={0.01}>R$ 0,01</option>
            <option value={0.10}>R$ 0,10</option>
            <option value={0.50}>R$ 0,50</option>
            <option value={1.00}>R$ 1,00</option>
          </select>
        </div>
      </div>

      {/* Casas */}
      <div className="card mb-6">
        <div className="section-title">Casas de Apostas</div>
        <div className="house-grid">
          {activeHouses().map((house, idx) => (
            <div key={idx} className="house-card">
              {editingName === idx ? (
                <input
                  type="text"
                  value={houseNames[idx]}
                  onChange={(e) => {
                    const newNames = [...houseNames];
                    newNames[idx] = e.target.value;
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
                  onClick={() => setEditingName(idx)}
                  title="Clique para editar o nome"
                >
                  {houseNames[idx]}
                </h3>
              )}
              
              <div className="grid-2 mb-4">
                <div className="form-group">
                  <label className="form-label">Odd</label>
                  <input
                    type="text"
                    value={house.odd}
                    onChange={(e) => {
                      const newOverrides = { ...manualOverrides };
                      if (newOverrides[idx]) {
                        delete newOverrides[idx].stake;
                        if (Object.keys(newOverrides[idx]).length === 0) {
                          delete newOverrides[idx];
                        }
                      }
                      setManualOverrides(newOverrides);
                      updateHouse(idx, { odd: e.target.value });
                    }}
                    placeholder="ex: 3.00"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Odd Final</label>
                  <div className="form-input bg-muted/40 font-mono">
                    {house.finalOdd.toFixed(2).replace('.', ',')}
                  </div>
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Stake</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xs">R$</span>
                    <input
                      type="text"
                      value={house.stake}
                      onChange={(e) => updateHouse(idx, { stake: e.target.value }, ['stake'])}
                      className="form-input pl-9 font-mono"
                    />
                  </div>
                  <button
                    onClick={() => updateHouse(idx, { lay: !house.lay })}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      house.lay
                        ? 'bg-gradient-to-r from-[hsl(var(--shark-gradient-start))] to-[hsl(var(--shark-gradient-end))] text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {house.lay ? 'LAY' : 'BACK'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mb-4 flex-wrap">
                <label className="checkbox-group">
                  <input
                    type="checkbox"
                    checked={house.commission !== null}
                    onChange={(e) => updateHouse(idx, { commission: e.target.checked ? "0" : null })}
                  />
                  <span>Comissão</span>
                </label>
                <label className="checkbox-group">
                  <input
                    type="checkbox"
                    checked={house.freebet}
                    onChange={(e) => updateHouse(idx, { freebet: e.target.checked })}
                  />
                  <span>Freebet</span>
                </label>
                <label className="checkbox-group">
                  <input
                    type="checkbox"
                    checked={house.increase !== null}
                    onChange={(e) => updateHouse(idx, { increase: e.target.checked ? "0" : null })}
                  />
                  <span>Aumento de Odd</span>
                </label>
              </div>

              {house.commission !== null && (
                <div className="form-group mb-4">
                  <label className="form-label">Comissão (%)</label>
                  <input
                    type="text"
                    value={house.commission || ""}
                    onChange={(e) => updateHouse(idx, { commission: e.target.value })}
                    placeholder="ex: 5"
                    className="form-input"
                  />
                </div>
              )}

              {house.increase !== null && (
                <div className="form-group mb-4">
                  <label className="form-label">Aumento de Odd (%)</label>
                  <input
                    type="text"
                    value={house.increase || ""}
                    onChange={(e) => updateHouse(idx, { increase: e.target.value })}
                    placeholder="ex: 10"
                    className="form-input"
                  />
                </div>
              )}

              {house.lay && (
                <div className="form-group mb-4">
                  <label className="form-label">Responsabilidade</label>
                  <input
                    type="text"
                    value={house.responsibility}
                    onChange={(e) => updateHouse(idx, { responsibility: e.target.value }, ['responsibility'])}
                    className="form-input"
                  />
                </div>
              )}

              <button
                onClick={() => {
                  const newHouses = [...houses];
                  newHouses.forEach((h, i) => {
                    newHouses[i].fixedStake = i === idx;
                  });
                  setHouses(newHouses);
                }}
                className={house.fixedStake ? 'btn btn-primary w-full' : 'btn btn-secondary w-full'}
              >
                {house.fixedStake ? 'Stake Fixada' : 'Fixar Stake'}
              </button>
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
      {results.profits.length > 0 && (
        <div className="card relative">
          {/* Marca d'água */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
            style={{ zIndex: 1 }}
          >
            <img 
              src={sharkWatermark} 
              alt="Shark Watermark" 
              className="opacity-[0.15] max-w-[70%] max-h-[70%] object-contain"
            />
          </div>
          
          <div className="relative" style={{ zIndex: 2 }}>
            <div className="section-title">Resultados Shark ArbiPro</div>
          
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-value">{formatBRL(results.totalStake)}</div>
              <div className="stat-label">Total Investido</div>
            </div>

            <div className="stat-card">
              <div className={`stat-value ${results.roi >= 0 ? 'profit-highlight' : 'profit-negative'}`}>
                {results.roi >= 0 ? '+' : ''}{results.roi.toFixed(2)}%
              </div>
              <div className="stat-label">ROI Médio</div>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Casa</th>
                  <th>Odd Final</th>
                  <th>Comissão</th>
                  <th>Stake</th>
                  <th>Lucro</th>
                </tr>
              </thead>
              <tbody>
                {activeHouses().map((house, idx) => (
                  <tr key={idx}>
                    <td><strong>{houseNames[idx]}</strong></td>
                    <td>{house.finalOdd.toFixed(2).replace('.', ',')}</td>
                    <td>{(parseFlex(house.commission) || 0).toFixed(2)}%</td>
                    <td>
                      {parseFlex(house.stake).toFixed(2).replace('.', ',')}
                      {house.lay ? ' (LAY)' : ''}
                    </td>
                    <td 
                      className={results.profits[idx] >= 0 ? 'profit-positive' : 'profit-negative'}
                      style={{ 
                        color: results.profits[idx] >= 0 ? 'hsl(160, 85%, 50%)' : 'hsl(0, 85%, 60%)',
                        fontWeight: 700 
                      }}
                    >
                      <strong>{formatBRL(results.profits[idx])}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};
