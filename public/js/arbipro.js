// assets/js/calculators/arbipro.js - VERSÃO COMPLETA ATUALIZADA
// Calculadora de Arbitragem completa

// Importar dependências usando ES6 modules
import { Utils } from './helpers.js';
import { APP_CONFIG } from './app-config.js';

export class ArbiPro {
  constructor() {
    this.MAX_HOUSES = APP_CONFIG.calculators.arbipro.maxHouses;
    this.numHouses = APP_CONFIG.calculators.arbipro.defaultHouses;
    this.roundingValue = APP_CONFIG.calculators.arbipro.defaultRounding;
    this.displayRounding = APP_CONFIG.calculators.arbipro.defaultRounding.toFixed(2);
    this.manualOverrides = {};
    this.pending = false;
    this.viewMode = "cards"; // 'cards' ou 'table'
    this.showCommission = false; // Toggle global para mostrar coluna Comissão
    this.showIncrease = false;   // Toggle global para mostrar coluna Aumento
    
    this.houses = Array.from({ length: this.MAX_HOUSES }).map((_, index) => ({
      odd: "",
      increase: null,
      finalOdd: 0,
      effectiveOdd: 0, // Odd que considera comissão para cálculos
      stake: "0",
      commission: null,
      freebet: false,
      fixedStake: index === 0,
      lay: false,
      responsibility: "",
      name: "",
      distribution: true
    }));

    this.results = { profits: [], totalStake: 0, roi: 0 };
  }

  init() {
    const appContainer = document.querySelector('#panel-1 #app');
    if (!appContainer || appContainer.innerHTML.trim()) return;
    
    this.render();
    this.bindEvents();
    this.loadFromURL();
    this.scheduleUpdate();
  }

  activeHouses() {
    return this.houses.slice(0, this.numHouses);
  }

  scheduleUpdate() {
    if (this.pending) return;
    this.pending = true;
    requestAnimationFrame(() => {
      this.pending = false;
      this.recalcStakeDistribution();
      this.calculateResults();
      this.updateAllHouseUIs();
      this.updateResultsUI();
    });
  }

  // Cálculos principais
  calculateResults() {
    const active = this.activeHouses();
    let totalStake = 0;
    const profits = new Array(active.length).fill(0);

    active.forEach(h => {
      const stake = Utils.parseFlex(h.stake) || 0;
      const resp = Utils.parseFlex(h.responsibility) || 0;
      if (!h.freebet) totalStake += h.lay ? resp : stake;
    });

    active.forEach((h, idx) => {
      const stake = Utils.parseFlex(h.stake) || 0;
      const commission = h.commission || 0;
      
      if (h.lay) {
        const resp = Utils.parseFlex(h.responsibility) || 0;
        // Lay: ganho = stake × (1 - comissão), perdemos o totalStake menos responsabilidade
        profits[idx] = stake * (1 - commission / 100) - (totalStake - resp);
      } else if (h.freebet) {
        // Freebet: usa effectiveOdd que já considera comissão
        // Retorno líquido = stake × effectiveOdd
        profits[idx] = stake * h.effectiveOdd - totalStake;
      } else {
        // BACK normal: usa effectiveOdd que já considera comissão
        // Retorno líquido = stake × effectiveOdd
        // Lucro = retorno líquido - totalStake
        profits[idx] = stake * h.effectiveOdd - totalStake;
      }
    });

    const minProfit = profits.length ? Math.min(...profits) : 0;
    const denom = active.some(h => h.freebet)
      ? active.reduce((s, h) => s + (h.freebet ? (Utils.parseFlex(h.stake) || 0) : 0), 0) || 1
      : (active.reduce((s, h) => s + (h.freebet ? 0 : (h.lay ? (Utils.parseFlex(h.responsibility) || 0) : (Utils.parseFlex(h.stake) || 0))), 0) || 1);
    
    const roi = (minProfit / denom) * 100;
    
    this.results = { profits, totalStake, roi };
  }

  recalcStakeDistribution() {
    const active = this.activeHouses();
    const fixedIndex = active.findIndex(h => h.fixedStake);
    if (fixedIndex === -1) return;

    const fixed = active[fixedIndex];
    const fixedStake = Utils.parseFlex(fixed.stake) || 0;
    const fixedOdd = fixed.finalOdd;
    const fixedCommission = fixed.commission || 0;
    if (!(fixedStake > 0 && fixedOdd > 0)) return;

    let changed = false;
    const newHouses = [...this.houses];

    // Calcular responsabilidades LAY primeiro
    active.forEach((h, idx) => {
      const overrides = this.manualOverrides[idx] || {};
      const oddVal = Utils.parseFlex(h.odd) || 0;
      const stakeVal = Utils.parseFlex(h.stake) || 0;

      if (h.lay && !overrides.responsibility && oddVal > 1 && stakeVal > 0) {
        const responsibility = stakeVal * (oddVal - 1);
        const current = Utils.parseFlex(h.responsibility) || 0;
        if (Math.abs(current - responsibility) > 1e-6) {
          changed = true;
          newHouses[idx] = { ...newHouses[idx], responsibility: Utils.formatDecimal(responsibility) };
        }
      }
    });

    // Calcular retorno líquido da casa fixa usando effectiveOdd
    let fixedNetReturn;
    if (fixed.freebet) {
      // Freebet: retorno = stake × effectiveOdd (já com comissão)
      fixedNetReturn = fixedStake * fixed.effectiveOdd;
    } else if (fixed.lay) {
      // Lay fixo: retorno alvo = stake × (oddLay - comissão)
      // Equaliza: stake_back × odd_back = stake_lay × (odd_lay - comm)
      const oddLay = fixed.finalOdd;
      const commissionDecimal = fixedCommission / 100;
      fixedNetReturn = fixedStake * (oddLay - commissionDecimal);
    } else {
      // BACK: retorno líquido = stake × effectiveOdd
      fixedNetReturn = fixedStake * fixed.effectiveOdd;
    }

    // Identificar casas por categoria
    const otherHouses = active.map((h, idx) => ({ house: h, idx }))
      .filter(item => item.idx !== fixedIndex && item.house.finalOdd > 0);
    
    // Casas participantes (distribution=true) e casas zeradas (distribution=false)
    const participating = otherHouses.filter(item => item.house.distribution);
    const zeroing = otherHouses.filter(item => !item.house.distribution);

    // Se há casas com "Zerar Lucro", precisamos resolver sistema de equações
    // Para zerar: stake_z × odd_z = totalStake (lucro = 0)
    // Para participantes: stake_p × odd_p = fixedNetReturn (lucros iguais)
    // totalStake = fixedStake + Σstake_z + Σstake_p
    
    // Substituindo stake_z = totalStake / odd_z:
    // totalStake = fixedStake + Σ(totalStake/odd_z) + Σstake_p
    // totalStake × (1 - Σ(1/odd_z)) = fixedStake + Σstake_p
    // totalStake = (fixedStake + Σstake_p) / (1 - Σ(1/odd_z))

    // Calcular soma dos inversos das odds EFETIVAS das casas zeradas
    let sumInverseZeroing = 0;
    zeroing.forEach(item => {
      const h = item.house;
      // Usar effectiveOdd para considerar comissão corretamente
      sumInverseZeroing += 1 / h.effectiveOdd;
    });

    // Calcular stakes das casas participantes (baseado em fixedNetReturn)
    let sumParticipatingStakes = 0;
    const participatingStakes = {};
    
    participating.forEach(item => {
      const h = item.house;
      let calcStake;
      
      if (h.lay) {
        const houseCommission = h.commission || 0;
        const oddLay = h.finalOdd; // Odd do Lay
        const commissionDecimal = houseCommission / 100;
        
        // Fórmula correta para Freebet + Lay:
        // Stake_Lay = Retorno_FB / (Odd_Lay - comissão_decimal)
        calcStake = fixedNetReturn / (oddLay - commissionDecimal);
      } else {
        // BACK e Freebet: usar effectiveOdd (já considera comissão)
        // stake × effectiveOdd = fixedNetReturn
        calcStake = h.effectiveOdd > 0 ? fixedNetReturn / h.effectiveOdd : 0;
      }
      
      participatingStakes[item.idx] = calcStake;
      
      // Para o totalStake, considerar freebet não entra
      if (!h.freebet) {
        if (h.lay) {
          const oddVal = Utils.parseFlex(h.odd) || 0;
          sumParticipatingStakes += calcStake * Math.max(oddVal - 1, 0); // responsibility
        } else {
          sumParticipatingStakes += calcStake;
        }
      }
    });

    // Calcular contribuição do stake fixo para totalStake
    let fixedContribution = 0;
    if (!fixed.freebet) {
      if (fixed.lay) {
        fixedContribution = Utils.parseFlex(fixed.responsibility) || (fixedStake * (Utils.parseFlex(fixed.odd) - 1));
      } else {
        fixedContribution = fixedStake;
      }
    }

    // Resolver para totalStake
    const denominator = 1 - sumInverseZeroing;
    let totalStake;
    
    if (denominator <= 0.001) {
      // Não é possível resolver (muitas casas zeradas)
      totalStake = fixedContribution + sumParticipatingStakes;
    } else {
      totalStake = (fixedContribution + sumParticipatingStakes) / denominator;
    }

    // Agora calcular stake de cada casa
    active.forEach((h, idx) => {
      if (idx === fixedIndex) return;
      const overrides = this.manualOverrides[idx] || {};
      if (overrides.stake) return;
      if (h.finalOdd <= 0) return;
      
      let calcStake;
      
      if (!h.distribution) {
        // ZERAR LUCRO: stake × effectiveOdd = totalStake
        // stake = totalStake / effectiveOdd
        calcStake = totalStake / h.effectiveOdd;
      } else {
        // PARTICIPANTE: usa o valor pré-calculado
        calcStake = participatingStakes[idx] || (h.effectiveOdd > 0 ? fixedNetReturn / h.effectiveOdd : 0);
      }
      
      const finalStakeStr = this.smartRoundStake(calcStake, fixedNetReturn, h.finalOdd, h.commission || 0);
      const finalStakeNum = Utils.parseFlex(finalStakeStr) || 0;
      const cur = Utils.parseFlex(h.stake) || 0;
      
      if (Math.abs(cur - finalStakeNum) > 1e-6) {
        changed = true;
        const oddVal = Utils.parseFlex(h.odd) || 0;
        if (h.lay) {
          const resp = finalStakeNum * Math.max(oddVal - 1, 0);
          newHouses[idx] = { 
            ...newHouses[idx], 
            stake: finalStakeStr, 
            responsibility: Utils.formatDecimal(resp), 
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

    if (changed) {
      this.houses = newHouses;
      this.updateAllHouseUIs();
    }
  }

  smartRoundStake(value, targetProfit, odd, commission = 0) {
    const num = Utils.parseFlex(value);
    if (!Number.isFinite(num)) return Utils.formatDecimal(num);
    
    const step = this.roundingValue;
    // Arredondamento padrão: até 0.49 para baixo, 0.50+ para cima
    const rounded = Math.round(num / step) * step;
    
    return Utils.formatDecimal(rounded);
  }

  // Interface
  render() {
    const app = document.querySelector('#panel-1 #app');
    if (!app) return;

    app.innerHTML = `
      <div class="calc-header">
        <h1 style="font-size: 2.25rem; font-weight: 900; background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary))); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem; text-align: center;">Calculadora ArbiPro</h1>
        <p style="color: hsl(var(--muted-foreground)); font-size: 1.125rem; text-align: center;">Calcule stakes otimizados para garantir lucro em qualquer resultado, usando freebet ou nao</p>
      </div>

      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
        <div class="stat-card">
          <div class="stat-label">Configurações</div>
          <div class="form-group" style="margin: 0.75rem 0 0 0;">
            <select id="numHouses" class="form-select" style="font-size: 0.75rem; padding: 0.5rem;">
              <option value="2" ${this.numHouses===2?'selected':''}>2 Casas</option>
              <option value="3" ${this.numHouses===3?'selected':''}>3 Casas</option>
              <option value="4" ${this.numHouses===4?'selected':''}>4 Casas</option>
              <option value="5" ${this.numHouses===5?'selected':''}>5 Casas</option>
              <option value="6" ${this.numHouses===6?'selected':''}>6 Casas</option>
              <option value="7" ${this.numHouses===7?'selected':''}>7 Casas</option>
              <option value="8" ${this.numHouses===8?'selected':''}>8 Casas</option>
              <option value="9" ${this.numHouses===9?'selected':''}>9 Casas</option>
              <option value="10" ${this.numHouses===10?'selected':''}>10 Casas</option>
            </select>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Arredondamento</div>
          <div class="form-group" style="margin: 0.75rem 0 0 0;">
            <select id="rounding" class="form-select" style="font-size: 0.75rem; padding: 0.5rem;">
              <option value="0.01" ${this.displayRounding==="0.01"?'selected':''}>R$ 0,01</option>
              <option value="0.10" ${this.displayRounding==="0.10"?'selected':''}>R$ 0,10</option>
              <option value="0.50" ${this.displayRounding==="0.50"?'selected':''}>R$ 0,50</option>
              <option value="1.00" ${this.displayRounding==="1.00"?'selected':''}>R$ 1,00</option>
            </select>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Visualização</div>
          <div class="view-toggle" style="margin: 0.75rem 0 0 0; display: flex; gap: 0.5rem;">
            <button id="viewCards" class="btn-view ${this.viewMode === 'cards' ? 'active' : ''}" title="Visualização em Cards">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              </svg>
            </button>
            <button id="viewTable" class="btn-view ${this.viewMode === 'table' ? 'active' : ''}" title="Visualização em Tabela">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="section-title-wrapper">
          <div class="section-title-left">
            <span class="section-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">Casas de Apostas</span>
            <span id="housesCounter" class="houses-counter">0/${this.numHouses} preenchidas</span>
          </div>
          <div class="global-toggles" style="${this.viewMode === 'cards' ? 'display: none;' : ''}">
            <label class="global-toggle" title="Comissão da Exchange (ex: Betfair cobra ~5% sobre lucros LAY)">
              <input type="checkbox" id="globalCommission" ${this.showCommission ? 'checked' : ''} />
              <span>Comissão</span>
            </label>
            <label class="global-toggle" title="Usar para aumentos de odd promocionais (ex: Bet365 oferece +20% na odd)">
              <input type="checkbox" id="globalIncrease" ${this.showIncrease ? 'checked' : ''} />
              <span>Aumento</span>
            </label>
          </div>
        </div>
        <div id="houses" class="${this.viewMode === 'cards' ? 'house-grid' : 'house-table-container'}"></div>
      </div>

      <div class="card card-with-watermark" style="margin-top: 1.5rem;">
        <div class="section-title">Resultados Shark ArbiPro</div>
        
        <div class="stats-grid" style="grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
          <div class="stat-card">
            <div class="stat-value" id="totalStake">R$ 0,00</div>
            <div class="stat-label">Total Investido</div>
          </div>

          <div class="stat-card">
            <div class="stat-value profit-highlight" id="roi">0,00%</div>
            <div class="stat-label">ROI Médio</div>
          </div>
        </div>
        
        <div style="overflow-x: auto;">
          <table class="results-table">
            <thead>
              <tr>
                <th>Casa</th>
                <th>Odd Final</th>
                <th>Comissão</th>
                <th>Stake</th>
                <th>Lucro</th>
              </tr>
            </thead>
            <tbody id="resultsRows"></tbody>
          </table>
        </div>
      </div>

      <div class="actions" style="display: flex; justify-content: center; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap;">
        <button id="shareArbiBtn" class="btn btn-primary" style="min-width: 180px;">
          🔗 Compartilhar
        </button>
        <button id="clearArbiBtn" class="btn btn-secondary" style="min-width: 180px;">
          🗑️ Limpar Dados
        </button>
      </div>
    `;

    this.renderHouses();
  }

  renderHouses() {
    const housesContainer = document.getElementById("houses");
    if (!housesContainer) return;
    
    if (this.viewMode === 'table') {
      housesContainer.className = 'house-table-container';
      housesContainer.innerHTML = this.renderHousesTable();
    } else {
      housesContainer.className = 'house-grid';
      housesContainer.innerHTML = this.activeHouses()
        .map((h, idx) => this.cardHTML(idx, h))
        .join("");
    }
  }

  renderHousesTable() {
    const active = this.activeHouses();
    
    return `
      <div class="house-table-wrapper">
        <table class="house-table">
          <thead>
            <tr>
              <th class="col-casa">Casa</th>
              <th class="col-odd">Odd</th>
              ${this.showCommission ? '<th class="col-commission">COMISSÃO</th>' : ''}
              ${this.showIncrease ? '<th class="col-increase">AUMENTO</th>' : ''}
              <th class="col-oddfinal">Odd Final</th>
              <th class="col-stake">Stake</th>
              <th class="col-backlay">Back/Lay</th>
              <th class="col-opcoes">Opções</th>
              <th class="col-fixar">Fixar</th>
              <th class="col-lucro">Lucro</th>
            </tr>
          </thead>
          <tbody>
            ${active.map((h, idx) => this.tableRowHTML(idx, h)).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  tableRowHTML(idx, h) {
    const oddDisplay = (h.finalOdd || 0).toFixed(2).replace('.', ',');
    const houseName = h.name || `Casa ${idx + 1}`;
    const profit = this.results.profits[idx] || 0;
    const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
    const profitDisplay = Utils.formatDecimal(Math.abs(profit));
    
    return `
      <tr class="house-row" data-idx="${idx}">
        <td class="col-casa">
          <span class="house-name-editable" contenteditable="true" data-idx="${idx}" data-action="editHouseName" spellcheck="false">${houseName}</span>
        </td>
        <td class="col-odd">
          <input data-action="odd" data-idx="${idx}" type="text" inputmode="decimal" value="${h.odd}"
            class="table-input" placeholder="0.00" />
        </td>
        ${this.showCommission ? `
          <td class="col-commission">
            <input data-action="commissionValue" data-idx="${idx}" type="text" inputmode="decimal" 
              value="${h.commission || ''}" class="table-input-mini" placeholder="%" />
          </td>
        ` : ''}
        ${this.showIncrease ? `
          <td class="col-increase">
            <input data-action="increaseValue" data-idx="${idx}" type="text" inputmode="decimal" 
              value="${h.increase || ''}" class="table-input-mini" placeholder="%" />
          </td>
        ` : ''}
        <td class="col-oddfinal odd-final">${oddDisplay}</td>
        <td class="col-stake">
          <div class="table-stake-wrapper">
            <span class="currency-prefix">R$</span>
            <input data-action="stake" data-idx="${idx}" type="text" inputmode="decimal" value="${h.stake || ''}"
              class="table-input stake-input" />
          </div>
          ${h.lay ? `
            <div class="table-responsibility-wrapper">
              <span class="responsibility-label">RESP.</span>
              <input data-action="responsibility" data-idx="${idx}" type="text" inputmode="decimal" 
                value="${h.responsibility || ''}" class="table-input-small responsibility-inline" />
            </div>
          ` : ''}
        </td>
        <td class="col-backlay">
          <button data-action="toggleLay" data-idx="${idx}" class="btn-toggle-mini ${h.lay ? 'active' : ''}">${h.lay ? 'LAY' : 'BACK'}</button>
        </td>
        <td class="col-opcoes">
          <div class="table-options">
            <label class="option-mini" title="Zerar Lucro">
              <input type="checkbox" ${!h.distribution ? 'checked' : ''} data-action="toggleDistribution" data-idx="${idx}" />
              <span>Zerar</span>
            </label>
            <label class="option-mini" title="Freebet">
              <input type="checkbox" ${h.freebet ? 'checked' : ''} data-action="toggleFreebet" data-idx="${idx}" />
              <span>Freebet</span>
            </label>
          </div>
        </td>
        <td class="col-fixar">
          <button data-action="fixStake" data-idx="${idx}" class="btn-fix ${h.fixedStake ? 'active' : ''}" title="${h.fixedStake ? 'Stake Fixada' : 'Fixar Stake'}">
            ${h.fixedStake ? '📌' : '📍'}
          </button>
        </td>
        <td class="col-lucro profit-cell">
          <span class="${profitClass}">${profit >= 0 ? '' : '-'}R$ ${profitDisplay}</span>
        </td>
      </tr>
    `;
  }

  cardHTML(idx, h) {
    const oddDisplay = (h.finalOdd || 0).toFixed(2).replace('.', ',');
    const houseName = h.name || `Casa ${idx + 1}`;
    return `
      <div id="card-${idx}" class="house-card">
        <h3 class="house-title" contenteditable="true" data-idx="${idx}" data-action="editHouseName" spellcheck="false">${houseName}</h3>
        <div class="grid-2" style="margin-bottom: 0.75rem;">
          <div class="form-group">
            <label class="form-label" for="odd-${idx}">Odd</label>
            <input id="odd-${idx}" data-action="odd" data-idx="${idx}" type="text" inputmode="decimal" value="${h.odd}"
              class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Odd Final</label>
            <div id="finalOdd-${idx}" class="form-input" style="display: flex; align-items: center; background: rgba(17, 24, 39, 0.4); font-family: ui-monospace, monospace;">${oddDisplay}</div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="stake-${idx}">Stake</label>
          <div style="display: flex; gap: 0.5rem;">
            <div style="position: relative; flex: 1;">
              <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-weight: 600; font-size: 0.75rem;">R$</span>
              <input id="stake-${idx}" data-action="stake" data-idx="${idx}" type="text" inputmode="decimal" value="${h.stake || ''}"
                class="form-input" style="padding-left: 2.25rem; font-family: ui-monospace, monospace;" />
            </div>
            <button data-action="toggleLay" data-idx="${idx}" class="btn-toggle ${h.lay ? 'active' : ''}">${h.lay ? 'LAY' : 'BACK'}</button>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; margin: 0.75rem 0; flex-wrap: wrap;">
          <label class="checkbox-group" title="Quando ativado, o lucro desta casa será zerado e redistribuído para as outras casas participantes">
            <input type="checkbox" ${!h.distribution ? 'checked' : ''} data-action="toggleDistribution" data-idx="${idx}" />
            <span>Zerar</span>
          </label>
          <label class="checkbox-group">
            <input type="checkbox" ${h.commission !== null ? 'checked' : ''} data-action="toggleCommission" data-idx="${idx}" />
            <span>Comissão</span>
          </label>
          <label class="checkbox-group">
            <input type="checkbox" ${h.freebet ? 'checked' : ''} data-action="toggleFreebet" data-idx="${idx}" />
            <span>Freebet</span>
          </label>
          <label class="checkbox-group">
            <input type="checkbox" ${h.increase !== null ? 'checked' : ''} data-action="toggleIncrease" data-idx="${idx}" />
            <span>Aumento de Odd</span>
          </label>
        </div>

        ${this.renderConditionalFields(idx, h)}

        <button data-action="fixStake" data-idx="${idx}" class="${h.fixedStake ? 'btn btn-primary' : 'btn btn-secondary'}" style="width: 100%;">
          ${h.fixedStake ? 'Stake Fixada' : 'Fixar Stake'}
        </button>
      </div>
    `;
  }

  renderConditionalFields(idx, h) {
    let html = '';
    
    if (h.commission !== null) {
      html += `
        <div class="form-group commission-field">
          <label class="form-label" for="commission-${idx}">Comissão (%)</label>
          <input id="commission-${idx}" data-action="commissionValue" data-idx="${idx}" type="text" inputmode="decimal" 
            value="${h.commission || ''}" class="form-input" />
        </div>`;
    }
    
    if (h.increase !== null) {
      html += `
        <div class="form-group increase-field">
          <label class="form-label" for="increase-${idx}">Aumento de Odd (%)</label>
          <input id="increase-${idx}" data-action="increaseValue" data-idx="${idx}" type="text" inputmode="decimal" 
            value="${h.increase || ''}" class="form-input" />
        </div>`;
    }
    
    if (h.lay) {
      html += `
        <div class="form-group responsibility-field">
          <label class="form-label" for="responsibility-${idx}">Responsabilidade</label>
          <input id="responsibility-${idx}" data-action="responsibility" data-idx="${idx}" type="text" inputmode="decimal" 
            value="${h.responsibility || ''}" class="form-input" />
        </div>`;
    }
    
    return html;
  }

  bindEvents() {
    // Configurações principais
    const numHousesSelect = document.getElementById("numHouses");
    if (numHousesSelect) {
      numHousesSelect.addEventListener("change", (e) => {
        this.numHouses = parseInt(e.target.value, 10);
        this.renderHouses();
        this.scheduleUpdate();
      });
    }

    const roundingSelect = document.getElementById("rounding");
    if (roundingSelect) {
      roundingSelect.addEventListener("change", (e) => {
        this.displayRounding = e.target.value;
        this.roundingValue = parseFloat(e.target.value);
        console.log('Arredondamento alterado para:', this.roundingValue);
        this.scheduleUpdate();
      });
    }

    // Toggle de visualização
    const viewCardsBtn = document.getElementById("viewCards");
    const viewTableBtn = document.getElementById("viewTable");
    
    if (viewCardsBtn) {
      viewCardsBtn.addEventListener("click", () => {
        this.viewMode = 'cards';
        viewCardsBtn.classList.add('active');
        viewTableBtn?.classList.remove('active');
        // Esconder toggles globais no modo cards
        const togglesDiv = document.querySelector('.global-toggles');
        if (togglesDiv) togglesDiv.style.display = 'none';
        this.renderHouses();
        this.scheduleUpdate();
      });
    }
    
    if (viewTableBtn) {
      viewTableBtn.addEventListener("click", () => {
        this.viewMode = 'table';
        viewTableBtn.classList.add('active');
        viewCardsBtn?.classList.remove('active');
        // Mostrar toggles globais no modo tabela
        const togglesDiv = document.querySelector('.global-toggles');
        if (togglesDiv) togglesDiv.style.display = 'flex';
        this.renderHouses();
        this.scheduleUpdate();
      });
    }

    // Toggles globais de Comissão e Aumento
    const globalCommission = document.getElementById('globalCommission');
    const globalIncrease = document.getElementById('globalIncrease');
    
    if (globalCommission) {
      globalCommission.addEventListener('change', (e) => {
        this.showCommission = e.target.checked;
        // Quando ativado, define commission como 0 para todas as casas; quando desativado, define como null
        this.houses = this.houses.map(h => ({
          ...h,
          commission: e.target.checked ? (h.commission !== null ? h.commission : 0) : null
        }));
        this.renderHouses();
        this.scheduleUpdate();
      });
    }
    
    if (globalIncrease) {
      globalIncrease.addEventListener('change', (e) => {
        this.showIncrease = e.target.checked;
        // Quando ativado, define increase como 0 para todas as casas; quando desativado, define como null
        this.houses = this.houses.map(h => ({
          ...h,
          increase: e.target.checked ? (h.increase !== null ? h.increase : 0) : null
        }));
        this.renderHouses();
        this.scheduleUpdate();
      });
    }

    // Events das casas
    this.bindHouseEvents();
    
    // Botão Compartilhar
    const shareBtn = document.getElementById('shareArbiBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareCalculator());
    }

    // Botão Limpar
    const clearBtn = document.getElementById('clearArbiBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearAll());
    }
  }

  bindHouseEvents() {
    const container = document.getElementById("houses");
    if (!container) return;

    container.addEventListener("input", (e) => this.handleInput(e));
    container.addEventListener("change", (e) => this.handleChange(e));
    container.addEventListener("click", (e) => this.handleClick(e));
    container.addEventListener("keydown", (e) => this.handleKeyDown(e));
    container.addEventListener("blur", (e) => this.handleBlur(e), true);
  }

  handleBlur(e) {
    const t = e.target;
    const action = t.getAttribute("data-action");
    const idx = parseInt(t.getAttribute("data-idx") || "-1", 10);
    
    if (action === "stake" && idx >= 0) {
      const val = Utils.parseFlex(t.value);
      if (val > 0) {
        t.value = val.toFixed(2).replace('.', ',');
        this.setHouse(idx, { stake: t.value });
      }
    }
  }

  handleKeyDown(e) {
    const t = e.target;
    const action = t.getAttribute("data-action");
    
    if (action === "editHouseName" && e.key === "Enter") {
      e.preventDefault();
      t.blur();
    }
  }

  handleInput(e) {
    const t = e.target;
    
    if (t.getAttribute && t.getAttribute("inputmode") === "decimal") {
      t.value = Utils.keepNumeric(t.value);
    }

    const action = t.getAttribute("data-action");
    const idx = parseInt(t.getAttribute("data-idx") || "-1", 10);
    if (!action || idx < 0) return;

    switch (action) {
      case "editHouseName":
        this.setHouse(idx, { name: t.textContent.trim() });
        break;
      case "odd":
        // Quando a odd é alterada, limpar o override de stake para recalcular automaticamente
        if (this.manualOverrides[idx]) {
          delete this.manualOverrides[idx].stake;
          // Se não sobrou nenhum override, limpar o objeto todo
          if (Object.keys(this.manualOverrides[idx]).length === 0) {
            delete this.manualOverrides[idx];
          }
        }
        this.setHouse(idx, { odd: t.value });
        this.validateOddField(idx, t);
        break;
      case "stake":
        this.setHouse(idx, { stake: t.value }, ["stake"]);
        break;
      case "responsibility":
        this.setHouse(idx, { responsibility: t.value }, ["responsibility"]);
        break;
      case "commissionValue":
        const commVal = Utils.parseFlex(t.value);
        // Limpar override de stake quando comissão é alterada
        if (this.manualOverrides[idx]) {
          delete this.manualOverrides[idx].stake;
          if (Object.keys(this.manualOverrides[idx]).length === 0) {
            delete this.manualOverrides[idx];
          }
        }
        this.setHouse(idx, { commission: Number.isFinite(commVal) ? commVal : 0 });
        break;
      case "increaseValue":
        const incVal = Utils.parseFlex(t.value);
        // Limpar override de stake quando aumento de odd é alterado
        if (this.manualOverrides[idx]) {
          delete this.manualOverrides[idx].stake;
          if (Object.keys(this.manualOverrides[idx]).length === 0) {
            delete this.manualOverrides[idx];
          }
        }
        this.setHouse(idx, { increase: Number.isFinite(incVal) ? incVal : 0 });
        break;
    }
    
    this.scheduleUpdate();
  }

  handleChange(e) {
    const el = e.target;
    if (el.type !== 'checkbox') return;
    
    const action = el.getAttribute("data-action");
    const idx = parseInt(el.getAttribute("data-idx") || "-1", 10);
    if (!action || idx < 0) return;

    switch (action) {
      case "toggleDistribution":
        // Checkbox marcado = zerar lucro (distribution: false)
        this.setHouse(idx, { distribution: !el.checked });
        this.scheduleUpdate();
        break;
      case "toggleCommission":
        this.setHouse(idx, { commission: el.checked ? 0 : null });
        this.renderHouses();
        this.scheduleUpdate();
        break;
      case "toggleFreebet":
        this.setHouse(idx, { freebet: el.checked });
        this.scheduleUpdate();
        break;
      case "toggleIncrease":
        this.setHouse(idx, { increase: el.checked ? 0 : null });
        this.renderHouses();
        this.scheduleUpdate();
        break;
    }
  }

  handleClick(e) {
    if (e.target.type === 'checkbox') return;

    let el = e.target.closest("[data-action]");
    if (!el) return;
    
    const action = el.getAttribute("data-action");
    const idx = parseInt(el.getAttribute("data-idx") || "-1", 10);
    if (idx < 0) return;

    if (action === "toggleLay" || action === "fixStake") {
      e.preventDefault();
    }

    switch (action) {
      case "toggleLay":
        this.setHouse(idx, { lay: !this.houses[idx].lay });
        this.renderHouses();
        this.scheduleUpdate();
        break;
      case "fixStake":
        this.houses = this.houses.map((h, i) => ({ 
          ...h, 
          fixedStake: i === idx ? !h.fixedStake : false 
        }));
        this.renderHouses();
        this.scheduleUpdate();
        break;
    }
  }

  setHouse(idx, patch, setOverrideKeys = []) {
    const prev = this.houses[idx];
    const h = { ...prev, ...patch };

    const oddVal = Utils.parseFlex(h.odd) || 0;
    const incVal = Utils.parseFlex(h.increase) || 0;
    
    let calculatedOdd = oddVal;
    if (h.increase !== null && incVal > 0 && oddVal > 1) {
      calculatedOdd = oddVal + (oddVal - 1) * (incVal / 100);
    }
    
    h.finalOdd = h.freebet ? Math.max(calculatedOdd - 1, 0) : calculatedOdd;

    // CALCULAR ODD EFETIVA (considera comissão)
    // Fórmula: Odd_efetiva = 1 + (Odd - 1) × (1 - Comissão/100)
    const commissionVal = Utils.parseFlex(h.commission) || 0;
    if (h.freebet) {
      // Freebet: retorno = stake × finalOdd, comissão sobre o retorno total
      h.effectiveOdd = h.finalOdd * (1 - commissionVal / 100);
    } else if (h.lay) {
      // Lay: o ganho é o stake, comissão sobre o stake
      h.effectiveOdd = h.finalOdd; // Lay usa cálculo diferente
    } else {
      // BACK normal: Odd_efetiva = 1 + (odd - 1) × (1 - comissão/100)
      // Isso representa o retorno líquido real por unidade apostada
      h.effectiveOdd = 1 + (h.finalOdd - 1) * (1 - commissionVal / 100);
    }

    if (h.lay && !(this.manualOverrides[idx] && this.manualOverrides[idx].responsibility)) {
      const stakeVal = Utils.parseFlex(h.stake) || 0;
      if (stakeVal > 0 && oddVal > 1) h.responsibility = Utils.formatDecimal(stakeVal * (oddVal - 1));
      else h.responsibility = "";
    }

    this.houses[idx] = h;

    if (setOverrideKeys.length) {
      this.manualOverrides[idx] = this.manualOverrides[idx] || {};
      setOverrideKeys.forEach(k => this.manualOverrides[idx][k] = true);
    }
  }

  updateAllHouseUIs() {
    this.activeHouses().forEach((_, i) => this.updateCardComputed(i));
    this.updateHousesCounter();
  }

  getFilledHousesCount() {
    return this.activeHouses().filter(h => Utils.parseFlex(h.odd) > 0).length;
  }

  updateHousesCounter() {
    const counter = document.getElementById('housesCounter');
    if (!counter) return;
    
    const filled = this.getFilledHousesCount();
    const total = this.numHouses;
    counter.textContent = `${filled}/${total} preenchidas`;
    counter.classList.toggle('complete', filled === total && total > 0);
  }

  updateCardComputed(idx) {
    const h = this.houses[idx];
    
    // Atualizar Odd Final (cards)
    const oddEl = document.getElementById(`finalOdd-${idx}`);
    if (oddEl) oddEl.textContent = (h.finalOdd || 0).toFixed(2).replace('.', ',');
    
    // Atualizar Odd Final (tabela)
    const oddTableEl = document.querySelector(`.house-row[data-idx="${idx}"] .odd-final`);
    if (oddTableEl) oddTableEl.textContent = (h.finalOdd || 0).toFixed(2).replace('.', ',');
    
    // Atualizar stake (se não houver override manual)
    if (!(this.manualOverrides[idx] && this.manualOverrides[idx].stake)) {
      // Cards - busca por ID
      const sEl = document.getElementById(`stake-${idx}`);
      if (sEl) sEl.value = h.stake || "";
      
      // Tabela - busca por data-attributes
      const sTableEl = document.querySelector(`input[data-action="stake"][data-idx="${idx}"]`);
      if (sTableEl) sTableEl.value = h.stake || "";
    }
    
    // Atualizar responsabilidade para apostas LAY (se não houver override manual)
    if (h.lay && !(this.manualOverrides[idx] && this.manualOverrides[idx].responsibility)) {
      // Cards - busca por ID
      const respCardEl = document.getElementById(`responsibility-${idx}`);
      if (respCardEl) respCardEl.value = h.responsibility || "";
      
      // Tabela - busca por data-attributes
      const respTableEl = document.querySelector(`input[data-action="responsibility"][data-idx="${idx}"]`);
      if (respTableEl) respTableEl.value = h.responsibility || "";
    }
    
    // Atualizar coluna LUCRO na tabela de "Casas de Apostas"
    const profit = this.results.profits[idx] || 0;
    const profitCell = document.querySelector(`.house-row[data-idx="${idx}"] .profit-cell span`);
    if (profitCell) {
      const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
      const profitDisplay = Utils.formatDecimal(Math.abs(profit));
      profitCell.className = profitClass;
      profitCell.textContent = `${profit >= 0 ? '' : '-'}R$ ${profitDisplay}`;
    }
  }

  // Validação visual para odds inválidas
  validateOddField(idx, inputEl = null) {
    const h = this.houses[idx];
    const oddValue = Utils.parseFlex(h.odd);
    const isValid = !h.odd || oddValue >= 1.01;
    
    // Se o input foi passado diretamente, usar ele
    if (inputEl) {
      inputEl.classList.toggle('input-invalid', !isValid);
    }
    
    // Buscar e atualizar todos os elementos de input de odd para este índice
    const oddCardEl = document.getElementById(`odd-${idx}`);
    const oddTableEl = document.querySelector(`input[data-action="odd"][data-idx="${idx}"]`);
    
    if (oddCardEl) oddCardEl.classList.toggle('input-invalid', !isValid);
    if (oddTableEl) oddTableEl.classList.toggle('input-invalid', !isValid);
    
    return isValid;
  }

  updateResultsUI() {
    const totalStakeEl = document.getElementById("totalStake");
    if (totalStakeEl) {
      totalStakeEl.textContent = Utils.formatBRL(this.results.totalStake);
    }

    const roiEl = document.getElementById("roi");
    if (roiEl) {
      roiEl.textContent = (this.results.roi >= 0 ? "+" : "") + this.results.roi.toFixed(2) + "%";
      roiEl.className = "stat-value " + (this.results.roi >= 0 ? "profit-highlight" : "profit-negative");
    }

    this.updateResultsTable();
  }

  updateResultsTable() {
    const active = this.activeHouses();
    const hasLayBets = active.some(h => h.lay);
    const hasOddIncrease = active.some(h => h.increase !== null);
    
    const headerHTML = `
      <tr>
        <th>Casa</th>
        <th>Odd</th>
        ${hasOddIncrease ? '<th>Odd Final</th>' : ''}
        <th>Comissão</th>
        <th>Stake</th>
        ${hasLayBets ? '<th>Responsabilidade</th>' : ''}
        <th>Lucro</th>
      </tr>
    `;
    
    const rowsHTML = active.map((h, idx) => {
      const oddOriginal = Utils.parseFlex(h.odd) || 0;
      // Preservar odd original como digitado
      const oddText = h.odd && String(h.odd).trim() ? String(h.odd).replace('.', ',') : oddOriginal.toFixed(2).replace('.', ',');
      const oddFinalText = hasOddIncrease ? 
        `<td>${h.finalOdd > 0 ? h.finalOdd.toFixed(2).replace('.', ',') : oddText}</td>` : '';
      const commissionValue = Utils.parseFlex(h.commission);
      const commissionText = (h.commission === null || h.commission === undefined) ? '—' : (Number.isFinite(commissionValue) ? commissionValue : 0).toFixed(2) + '%';
      const stakeValue = Utils.parseFlex(h.stake) || 0;
      // Stake sempre com 2 casas decimais
      const stakeText = stakeValue.toFixed(2).replace('.', ',');
      const profit = this.results.profits[idx] || 0;
      const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
      const profitValue = Utils.formatBRL(profit);
      const responsibilityCell = hasLayBets ? 
        `<td>${h.lay ? '<strong>R$ ' + (h.responsibility || '0,00') + '</strong>' : '—'}</td>` : '';
      const houseName = h.name || `Casa ${idx + 1}`;
      const distributionBadge = h.distribution ? '' : '<br><span class="text-small text-muted" style="color: hsl(var(--muted-foreground));">(Zerado)</span>';
      
      return `
        <tr>
          <td><strong>${houseName}</strong></td>
          <td>${oddText}</td>
          ${oddFinalText}
          <td>${commissionText}</td>
          <td><strong>R$ ${stakeText}</strong>${h.freebet ? '<br><span class="text-small">(Freebet)</span>' : ''}${h.lay ? '<br><span class="text-small">(LAY)</span>' : ''}</td>
          ${responsibilityCell}
          <td class="${profitClass}" style="${!h.distribution ? 'opacity: 0.5;' : ''}"><strong>${profitValue}</strong>${distributionBadge}</td>
        </tr>
      `;
    }).join("");

    const thead = document.querySelector('#panel-1 .results-table thead');
    const tbody = document.getElementById("resultsRows");
    
    if (thead) thead.innerHTML = headerHTML;
    if (tbody) tbody.innerHTML = rowsHTML;
  }

  serializeState() {
    const state = {
      n: this.numHouses,
      r: this.roundingValue,
      sc: this.showCommission ? 1 : 0,
      si: this.showIncrease ? 1 : 0,
      h: []
    };

    // Serializar casas com dados preenchidos - PRESERVAR VALORES EXATOS
    const active = this.activeHouses();
    active.forEach((house, idx) => {
      const h = {};
      // CRÍTICO: Preservar strings exatas dos inputs, não converter
      if (house.odd) h.o = String(house.odd);
      if (house.stake && house.stake !== "0") h.s = String(house.stake);
      if (house.commission !== null) h.c = String(house.commission);
      if (house.increase !== null) h.i = String(house.increase);
      if (house.freebet) h.f = 1;
      if (house.lay) h.l = 1;
      if (house.fixedStake) h.fs = 1;
      if (house.responsibility) h.re = String(house.responsibility);
      if (house.name) h.n = house.name;
      if (!house.distribution) h.d = 0;
      
      // Só adicionar se tiver algum dado
      if (Object.keys(h).length > 0) {
        state.h.push(h);
      }
    });

    return state;
  }

  loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    if (!params.has('n') && !params.has('h')) return;

    try {
      // Restaurar configurações
      if (params.has('n')) {
        this.numHouses = parseInt(params.get('n')) || 2;
        const select = document.getElementById('numHouses');
        if (select) select.value = String(this.numHouses);
      }

      if (params.has('r')) {
        this.roundingValue = parseFloat(params.get('r')) || 0.01;
        this.displayRounding = String(this.roundingValue);
        const select = document.getElementById('rounding');
        if (select) select.value = this.displayRounding;
      }

      // Restaurar toggles globais
      if (params.has('sc')) {
        this.showCommission = params.get('sc') === '1';
        const checkbox = document.getElementById('globalCommission');
        if (checkbox) checkbox.checked = this.showCommission;
      }

      if (params.has('si')) {
        this.showIncrease = params.get('si') === '1';
        const checkbox = document.getElementById('globalIncrease');
        if (checkbox) checkbox.checked = this.showIncrease;
      }

      // Restaurar casas - PRESERVAR VALORES EXATOS
      if (params.has('h')) {
        const housesData = JSON.parse(params.get('h'));
        housesData.forEach((h, idx) => {
          if (idx >= this.MAX_HOUSES) return;
          
          const houseUpdate = {};
          // CRÍTICO: Preservar como string, não converter
          if (h.o !== undefined) houseUpdate.odd = String(h.o);
          if (h.s !== undefined) houseUpdate.stake = String(h.s);
          if (h.c !== undefined) houseUpdate.commission = String(h.c);
          if (h.i !== undefined) houseUpdate.increase = String(h.i);
      if (h.f) houseUpdate.freebet = true;
      if (h.l) houseUpdate.lay = true;
      if (h.fs) houseUpdate.fixedStake = true;
      if (h.re !== undefined) houseUpdate.responsibility = String(h.re);
      if (h.n !== undefined) houseUpdate.name = h.n;
      if (h.d !== undefined) houseUpdate.distribution = h.d === 1;
          
          // Usar setHouse para garantir que finalOdd seja calculado corretamente
          this.setHouse(idx, houseUpdate);
        });
      }

      // Renderizar e recalcular
      this.renderHouses();
      this.scheduleUpdate();
      console.log('✅ Dados carregados da URL com precisão total');
    } catch (error) {
      console.error('❌ Erro ao carregar dados da URL:', error);
      alert('Erro ao carregar dados compartilhados. Verifique o link.');
    }
  }

  async shareCalculator() {
    const state = this.serializeState();
    const params = new URLSearchParams();
    
    params.set('n', String(state.n));
    params.set('r', String(state.r));
    if (state.sc) params.set('sc', '1');
    if (state.si) params.set('si', '1');
    if (state.h.length > 0) {
      params.set('h', JSON.stringify(state.h));
    }

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}#calculadoras`;
    
    try {
      await navigator.clipboard.writeText(url);
      alert('✅ Link copiado! Compartilhe com outros usuários.');
    } catch (error) {
      window.history.pushState({}, '', url);
      alert('✅ Link gerado! Copie o endereço da barra do navegador.');
    }
  }

  clearAll() {
    console.log('Limpando todos os dados do ArbiPro...');
    
    // Limpar URL
    window.history.pushState({}, '', window.location.pathname + window.location.hash);
    
    // Reset configurações
    const numHousesSelect = document.getElementById('numHouses');
    if (numHousesSelect) {
      numHousesSelect.value = '2';
      this.numHouses = 2;
    }
    
    const roundSelect = document.getElementById('rounding');
    const defaultRound = APP_CONFIG.calculators.arbipro.defaultRounding;
    if (roundSelect) {
      roundSelect.value = defaultRound.toFixed(2);
      this.roundingValue = defaultRound;
      this.displayRounding = defaultRound.toFixed(2);
    }

    // Reset toggles globais
    this.showCommission = false;
    this.showIncrease = false;
    const globalCommission = document.getElementById('globalCommission');
    const globalIncrease = document.getElementById('globalIncrease');
    if (globalCommission) globalCommission.checked = false;
    if (globalIncrease) globalIncrease.checked = false;
    
    // Reset houses data
    this.houses = Array.from({ length: this.MAX_HOUSES }).map((_, index) => ({
      odd: "",
      increase: null,
      finalOdd: 0,
      effectiveOdd: 0,
      stake: "0",
      commission: null,
      freebet: false,
      fixedStake: index === 0,
      lay: false,
      responsibility: "",
      distribution: true
    }));
    
    // Reset manual overrides
    this.manualOverrides = {};
    
    // Reset results
    this.results = { profits: [], totalStake: 0, roi: 0 };
    
    // Re-render interface
    this.renderHouses();
    this.updateAllHouseUIs();
    this.updateResultsUI();
    
    console.log('✅ Dados limpos com sucesso');
  }
}

// Expor globalmente
window.ArbiPro = ArbiPro;
