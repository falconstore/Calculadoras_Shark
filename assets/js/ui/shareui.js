// assets/js/ui/shareui.js
// Share UI — compatível com main.js (expondo handleShareClick), robusto para ArbiPro e FreePro.

import { ShareSystem } from '../utils/share.js';

function $(root, sel) {
  try { return (root || document).querySelector(sel) || null; } catch { return null; }
}
function qsa(root, sel) {
  try { return Array.from((root || document).querySelectorAll(sel)); } catch { return []; }
}
function val(input) {
  if (!input) return '';
  const v = (input.value ?? '').toString().trim();
  return v;
}
function num(input, fallback = null) {
  const v = val(input);
  if (v === '') return fallback;
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}
function bool(el) {
  if (!el) return false;
  if ('checked' in el) return !!el.checked;
  return !!el.value;
}
function any(...xs) {
  for (const x of xs) {
    if (!x) continue;
    if (typeof x === 'string') {
      const el = document.querySelector(x);
      if (el) return el;
    } else if (Array.isArray(x) && x.length === 2 && x[0] && x[1]) {
      try {
        const el = x[0].querySelector(x[1]);
        if (el) return el;
      } catch {}
    }
  }
  return null;
}

const SEL = {
  arbipro: {
    rounding: '#roundStep, #rounding, [data-field="rounding"]',
    houseRow: (i) => `#house-${i}, [data-house-index="${i}"]`,
    odd:   (i) => `#odd-${i},   [data-input="odd"][data-idx="${i}"],   input[name="odd-${i}"]`,
    stake: (i) => `#stake-${i}, [data-input="stake"][data-idx="${i}"], input[name="stake-${i}"]`,
    comm:  (i) => `#comm-${i},  [data-input="commission"][data-idx="${i}"], input[name="comm-${i}"]`,
    freebet:(i)=> `#freebet-${i},[data-input="freebet"][data-idx="${i}"], input[name="freebet-${i}"]`,
    increase:(i)=>`#increase-${i},[data-input="increase"][data-idx="${i}"], input[name="increase-${i}"]`,
    lay:   (i) => `#lay-${i},   [data-input="lay"][data-idx="${i}"],   input[name="lay-${i}"]`,
    fixed: (i) => `#fixedStake-${i}, [data-input="fixedStake"][data-idx="${i}"], input[name="fixedStake-${i}"]`,
  },
  freepro: {
    iframe: '#calc2frame, #freepro-frame, iframe#calc-freepro',
    numEntradas: '#numEntradas, [data-field="numEntradas"]',
    roundStep:   '#roundStep, #rounding, [data-field="roundStep"]',
    // modo cashback: por classe no body ou presença de campo cashbackRate
    modeCashbackFlag: (doc) => doc?.body?.classList?.contains('mode-cashback'),
    // casa promoção
    promoOdd:      '#promoOdd, #oddPromo, [name="promoOdd"], [data-input="promoOdd"]',
    promoComm:     '#promoComm, #commPromo, [name="promoComm"], [data-input="promoComm"]',
    promoStake:    '#promoStake, #stakePromo, [name="promoStake"], [data-input="promoStake"]',
    freebetValue:  '#freebetValue, #valorFreebet, [name="freebetValue"], [data-input="freebetValue"]',
    extractionRate:'#extractionRate, #taxaExtracao, [name="extractionRate"], [data-input="extractionRate"]',
    cashbackRate:  '#cashbackRate, [data-input="cashbackRate"]',
    // coberturas i>=2
    covOdd:  (i) => `#odd-${i},  [data-input="odd"][data-idx="${i}"],  input[name="odd-${i}"]`,
    covComm: (i) => `#comm-${i}, [data-input="comm"][data-idx="${i}"], input[name="comm-${i}"]`,
    covLay:  (i) => `#lay-${i},  [data-input="lay"][data-idx="${i}"],  input[name="lay-${i}"]`,
  },
};

export class ShareUI {
  constructor() {
    this.initialized = false;
    this.shareSystem = null;

    // 🔧 Compat API esperada pelo main.js
    this.handleShareClick = this.handleShareClick.bind(this);
  }

  async init() {
    try {
      this.shareSystem = new ShareSystem();
      this.initialized = true;
      console.log('✅ ShareUI inicializado');
    } catch (e) {
      console.error('❌ Falha ao inicializar ShareUI:', e);
      this.initialized = false;
    }
  }

  /**
   * Compat com main.js — pode ser usado direto no addEventListener.
   * Detecta automaticamente qual calculadora chamar.
   */
  handleShareClick(evOrCalc) {
  try {
    // 1) Se veio string direta do main.js, use-a como calculadora
    if (typeof evOrCalc === 'string') {
      const calc = /freepro/i.test(evOrCalc) ? 'freepro' : 'arbipro';
      this.openShareModal(calc);
      return;
    }

    // 2) Se veio um evento (click), previne e tenta deduzir pelo alvo
    const ev = evOrCalc;
    if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();

    const el = ev?.currentTarget || ev?.target || null;

    // tenta ler pelos data-attributes / id / texto / ancestrais
    let calc = this._guessCalculatorFromElement(el);

    // fallback — se não conseguir deduzir, assume arbipro
    if (!calc) calc = 'arbipro';

    this.openShareModal(calc);
  } catch (err) {
    console.error('Erro em handleShareClick:', err);
    alert('Não foi possível iniciar o compartilhamento. Veja o console.');
  }
}

  _guessCalculatorFromElement(el) {
    if (!el) return null;

    // Preferência por data-attributes
    const ds = el.dataset || {};
    const hinted =
      ds.calc || ds.shareCalc || ds.calculator || ds.share || null;
    if (hinted && /freepro/i.test(hinted)) return 'freepro';
    if (hinted && /arbi/i.test(hinted))   return 'arbipro';

    // Por id ou texto
    const id = (el.id || '').toLowerCase();
    if (id.includes('freepro')) return 'freepro';
    if (id.includes('arbipro') || id.includes('arbi')) return 'arbipro';

    const txt = (el.textContent || '').toLowerCase();
    if (txt.includes('freepro')) return 'freepro';
    if (txt.includes('arbipro') || txt.includes('arbi')) return 'arbipro';

    // Checa ancestrais com data-calc
    const withData = el.closest?.('[data-calc],[data-share],[data-calculator]');
    if (withData) {
      const ds2 = withData.dataset || {};
      const hinted2 = ds2.calc || ds2.share || ds2.calculator || null;
      if (hinted2 && /freepro/i.test(hinted2)) return 'freepro';
      if (hinted2 && /arbi/i.test(hinted2))    return 'arbipro';
    }

    return null;
  }

  async openShareModal(calculator = 'arbipro') {
    console.log('=== INICIANDO COMPARTILHAMENTO ===');
    console.log('Calculadora:', calculator);

    if (!this.shareSystem) {
      alert('Sistema de compartilhamento não disponível');
      return;
    }

    try {
      let data = null;

      if (calculator === 'arbipro') {
        data = this.getArbiProData();
      } else if (calculator === 'freepro') {
        data = this.getFreeProData();
      }

      console.log('Dados capturados:', data);

      if (!data || !this.hasValidData(data, calculator)) {
        alert('Preencha os dados da calculadora antes de compartilhar');
        return;
      }

      const shareLink =
        calculator === 'arbipro'
          ? this.shareSystem.generateArbiProLink(data)
          : this.shareSystem.generateFreeProLink(data);

      console.log('Link gerado:', shareLink);
      this.showShareModal(shareLink);
    } catch (error) {
      console.error('❌ Erro ao compartilhar:', error);
      alert('Erro ao gerar link de compartilhamento: ' + error.message);
    }
  }

  hasValidData(data, calculator) {
    if (!data) return false;

    if (calculator === 'arbipro') {
      return Array.isArray(data.houses) && data.houses.some(h => h && h.o);
    }

    if (calculator === 'freepro') {
      if (!data.p) return false;
      if (data.mode !== 'cashback') {
        return !!(data.p.o || data.p.s || data.p.f);
      }
      return !!(data.p.o || data.p.s || data.p.r);
    }

    return false;
  }

  // -------- Captura ArbiPro --------
  getArbiProData() {
    console.log('Capturando dados ArbiPro...');
    try {
      const data = { numHouses: 2, rounding: 0.01, houses: [] };

      const roundingEl = any(SEL.arbipro.rounding);
      const rounding = num(roundingEl, 0.01);
      data.rounding = Number.isFinite(rounding) ? rounding : 0.01;

      let i = 1;
      while (true) {
        const row = any(SEL.arbipro.houseRow(i));
        if (!row && i > 4) break;
        if (row) {
          const o = num(any(row, SEL.arbipro.odd(i)), null);
          const s = num(any(row, SEL.arbipro.stake(i)), null);
          const c = num(any(row, SEL.arbipro.comm(i)), null);
          const f = bool(any(row, SEL.arbipro.freebet(i)));
          const inc= num(any(row, SEL.arbipro.increase(i)), null);
          const l = bool(any(row, SEL.arbipro.lay(i)));
          const x = bool(any(row, SEL.arbipro.fixed(i)));

          data.houses.push({
            o: o ?? '',
            s: s ?? '',
            c: c ?? null,
            f,
            i: inc,
            l,
            x,
          });
        }
        i++;
      }
      data.numHouses = Math.max(2, data.houses.length || 2);

      console.log('Dados ArbiPro finais:', data);
      return data;
    } catch (error) {
      console.error('Erro ao capturar dados ArbiPro:', error);
      return null;
    }
  }

  // -------- Captura FreePro --------
  getFreeProData() {
    console.log('Capturando dados FreePro...');
    try {
      const iframe = any(SEL.freepro.iframe);
      const frame = typeof iframe?.contentDocument !== 'undefined' ? iframe : null;
      if (!frame) {
        console.error('Iframe FreePro não encontrado');
        return null;
      }

      const doc = frame.contentDocument;
      const isCashback =
        SEL.freepro.modeCashbackFlag(doc) || !!$(doc, SEL.freepro.cashbackRate);

      const n = Math.max(2, parseInt(val($(doc, SEL.freepro.numEntradas)) || '3', 10) || 3);
      const r = num($(doc, SEL.freepro.roundStep), 1.0) ?? 1.0;

      const p = {
        o: num($(doc, SEL.freepro.promoOdd), '') ?? '',
        c: num($(doc, SEL.freepro.promoComm), '') ?? '',
        s: num($(doc, SEL.freepro.promoStake), '') ?? '',
        f: isCashback ? '' : (num($(doc, SEL.freepro.freebetValue), '') ?? ''),
        e: isCashback ? '' : (num($(doc, SEL.freepro.extractionRate), 70) ?? 70),
        r: isCashback ? (num($(doc, SEL.freepro.cashbackRate), '') ?? '') : '',
      };

      const cov = [];
      for (let i = 2; i <= n; i++) {
        const cOdd  = num($(doc, SEL.freepro.covOdd(i)),  '');
        const cComm = num($(doc, SEL.freepro.covComm(i)), '');
        const cLay  = bool($(doc, SEL.freepro.covLay(i)));

        cov.push({
          odd:  cOdd  === '' ? '' : cOdd,
          comm: cComm === '' ? '' : cComm,
          lay:  cLay,
        });
      }

      const data = { n, r, p, cov, mode: isCashback ? 'cashback' : 'normal' };
      console.log('Dados FreePro finais:', data);
      return data;
    } catch (error) {
      console.error('Erro ao capturar dados FreePro:', error);
      return null;
    }
  }

  // -------- Modal simples --------
  showShareModal(url) {
    try {
      let overlay = document.getElementById('shareOverlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'shareOverlay';
        overlay.style.cssText = `
          position: fixed; inset: 0; z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.6);
        `;
        document.body.appendChild(overlay);
      }

      overlay.innerHTML = `
        <div id="shareCard" style="
          width: min(560px, 92vw);
          background: #0f172a;
          border: 1px solid #1f2a36;
          color: #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.45);
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Arial;
        ">
          <div style="display:flex; align-items:center; gap:.75rem; margin-bottom: 12px;">
            <span style="font-size: 22px;">🔗</span>
            <h3 style="margin:0; font-size: 18px;">Link de Compartilhamento</h3>
          </div>
          <p style="margin: 0 0 12px; color: #94a3b8;">Copie o link abaixo para compartilhar suas configurações.</p>
          <textarea id="shareUrlText" readonly style="
            width:100%; height: 112px; resize: none; padding: 12px;
            border-radius: 12px; background: #0b1220; border: 1px solid #1f2a36;
            color:#93c5fd; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            word-break: break-all;
          ">${url}</textarea>
          <div style="display:flex; gap: 12px; margin-top: 14px;">
            <button id="copyBtn" style="
              flex:1; padding: 10px 14px; border: none; border-radius: 10px;
              background: linear-gradient(135deg, #3b82f6, #22c55e); color:white; font-weight: 600;
            ">Copiar Link</button>
            <button id="closeBtn" style="
              padding: 10px 14px; border: 1px solid #334155; border-radius: 10px;
              background: #0b1220; color: #cbd5e1;
            ">Fechar</button>
          </div>
        </div>
      `;

      const ta = $('#shareCard', '#shareUrlText') || document.getElementById('shareUrlText');
      const copyBtn = $('#shareCard', '#copyBtn') || document.getElementById('copyBtn');
      const closeBtn = $('#shareCard', '#closeBtn') || document.getElementById('closeBtn');

      if (copyBtn && ta) {
        copyBtn.onclick = async () => {
          try {
            ta.select();
            await navigator.clipboard.writeText(ta.value);
            copyBtn.textContent = 'Copiado!';
            setTimeout(() => (copyBtn.textContent = 'Copiar Link'), 1600);
          } catch {
            try {
              document.execCommand('copy');
              copyBtn.textContent = 'Copiado!';
              setTimeout(() => (copyBtn.textContent = 'Copiar Link'), 1600);
            } catch {
              alert('Não foi possível copiar automaticamente. Copie manualmente.');
            }
          }
        };
      }
      if (closeBtn) {
        closeBtn.onclick = () => overlay.remove();
      }
    } catch (e) {
      console.error('Erro ao exibir modal de compartilhamento:', e);
      alert('Falha ao exibir o link. Veja o console.');
    }
  }

  /**
   * Fallback opcional: ele mesmo faz o binding se você quiser.
   */
  bindButtons(selectors = { arbipro: '#btnShareArbiPro', freepro: '#btnShareFreePro' }) {
    const tryBind = (sel, fn) => {
      let tries = 0;
      const MAX = 20;
      const iv = setInterval(() => {
        const el = document.querySelector(sel);
        if (el) {
          clearInterval(iv);
          el.addEventListener('click', fn, { passive: true });
          console.log(`✅ Botão vinculado: ${sel}`);
          return;
        }
        tries++;
        if (tries >= MAX) {
          clearInterval(iv);
          console.warn(`⚠️ Não foi possível vincular: ${sel} após ${MAX} tentativas`);
        }
      }, 250);
    };

    if (selectors.arbipro) tryBind(selectors.arbipro, this.handleShareClick);
    if (selectors.freepro) tryBind(selectors.freepro, this.handleShareClick);
  }
}

export default ShareUI;
