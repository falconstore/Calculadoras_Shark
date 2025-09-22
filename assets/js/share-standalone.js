// assets/js/share-standalone.js - Sistema completo em um arquivo só

class ShareSystem {
  constructor() {
    this.baseUrl = window.location.origin + window.location.pathname;
  }

  generateArbiProLink(data) {
    const params = new URLSearchParams();
    
    params.set('t', 'arbipro');
    params.set('n', data.numHouses || 2);
    params.set('r', data.rounding || 0.01);
    
    if (data.houses) {
      data.houses.forEach((house, index) => {
        const prefix = `casa${index}`;
        
        if (house.odd) params.set(`${prefix}_odd`, house.odd);
        if (house.stake) params.set(`${prefix}_stake`, house.stake);
        if (house.commission) params.set(`${prefix}_comissao`, house.commission);
        if (house.increase) params.set(`${prefix}_aumento`, house.increase);
        if (house.freebet) params.set(`${prefix}_freebet`, '1');
        if (house.lay) params.set(`${prefix}_lay`, '1');
        if (house.fixedStake) params.set(`${prefix}_fixado`, '1');
      });
    }
    
    return `${this.baseUrl}?${params.toString()}`;
  }

  generateFreeProLink(data) {
    const params = new URLSearchParams();
    
    params.set('t', 'freepro');
    params.set('n', data.numEntradas || 3);
    params.set('r', data.roundStep || 1.00);
    params.set('m', data.mode || 'freebet');
    
    if (data.promoOdd) params.set('promo_odd', data.promoOdd);
    if (data.promoStake) params.set('promo_stake', data.promoStake);
    
    if (data.mode === 'cashback') {
      if (data.cashbackRate) params.set('cashback_rate', data.cashbackRate);
    } else {
      if (data.promoComm) params.set('promo_comm', data.promoComm);
      if (data.freebetValue) params.set('freebet_value', data.freebetValue);
      if (data.extractionRate) params.set('extraction_rate', data.extractionRate);
    }
    
    if (data.coverages) {
      data.coverages.forEach((cov, index) => {
        const prefix = `cov${index}`;
        if (cov.odd) params.set(`${prefix}_odd`, cov.odd);
        if (cov.comm) params.set(`${prefix}_comm`, cov.comm);
        if (cov.lay) params.set(`${prefix}_lay`, '1');
      });
    }
    
    return `${this.baseUrl}?${params.toString()}`;
  }

  loadFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('t');
    
    if (!type) return null;
    
    if (type === 'arbipro') {
      return this.parseArbiPro(params);
    } else if (type === 'freepro') {
      return this.parseFreePro(params);
    }
    
    return null;
  }

  parseArbiPro(params) {
    const config = {
      type: 'arbipro',
      numHouses: parseInt(params.get('n')) || 2,
      rounding: parseFloat(params.get('r')) || 0.01,
      houses: []
    };

    for (let i = 0; i < config.numHouses; i++) {
      const prefix = `casa${i}`;
      config.houses.push({
        odd: params.get(`${prefix}_odd`) || '',
        stake: params.get(`${prefix}_stake`) || '',
        commission: params.get(`${prefix}_comissao`) || '',
        increase: params.get(`${prefix}_aumento`) || '',
        freebet: params.get(`${prefix}_freebet`) === '1',
        lay: params.get(`${prefix}_lay`) === '1',
        fixedStake: params.get(`${prefix}_fixado`) === '1'
      });
    }

    return config;
  }

  parseFreePro(params) {
    const config = {
      type: 'freepro',
      numEntradas: parseInt(params.get('n')) || 3,
      rounding: parseFloat(params.get('r')) || 1.00,
      mode: params.get('m') || 'freebet',
      promoOdd: params.get('promo_odd') || '',
      promoStake: params.get('promo_stake') || '',
      coverages: []
    };

    if (config.mode === 'cashback') {
      config.cashbackRate = params.get('cashback_rate') || '';
    } else {
      config.promoComm = params.get('promo_comm') || '';
      config.freebetValue = params.get('freebet_value') || '';
      config.extractionRate = params.get('extraction_rate') || '';
    }

    for (let i = 0; i < config.numEntradas - 1; i++) {
      const prefix = `cov${i}`;
      config.coverages.push({
        odd: params.get(`${prefix}_odd`) || '',
        comm: params.get(`${prefix}_comm`) || '',
        lay: params.get(`${prefix}_lay`) === '1'
      });
    }

    return config;
  }

  cleanUrl() {
    const url = new URL(window.location);
    Array.from(url.searchParams.keys()).forEach(key => {
      url.searchParams.delete(key);
    });
    window.history.replaceState({}, document.title, url.toString());
  }

  async copyToClipboard(text) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
      }
    } catch (error) {
      console.error('Erro ao copiar:', error);
      return false;
    }
  }

  async shortenUrl(url) {
    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        return await response.text();
      }
      throw new Error('Falha ao encurtar');
    } catch (error) {
      console.error('Erro ao encurtar URL:', error);
      return url;
    }
  }
}

class ShareUI {
  constructor() {
    this.shareSystem = new ShareSystem();
    this.modal = null;
  }

  init() {
    this.createModal();
    this.loadSharedConfig();
    this.setupButtons();
    console.log('ShareUI inicializado');
  }

  createModal() {
    if (document.getElementById('shareModal')) return;

    const modal = document.createElement('div');
    modal.id = 'shareModal';
    modal.innerHTML = `
      <div id="shareModalContent" style="
        display: none;
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
      ">
        <div style="
          background: var(--bg-card);
          margin: 10% auto;
          padding: 2rem;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          border: 1px solid var(--border);
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="color: var(--text-primary); margin: 0;">🔗 Compartilhar Configuração</h3>
            <button id="closeShareModal" style="background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer;">&times;</button>
          </div>
          
          <div style="margin-bottom: 1rem;">
            <input 
              id="shareUrlInput" 
              type="text" 
              readonly 
              style="
                width: 100%;
                padding: 0.75rem;
                border: 2px solid var(--border);
                border-radius: 8px;
                background: var(--bg-secondary);
                color: var(--text-primary);
                font-family: monospace;
                margin-bottom: 1rem;
                box-sizing: border-box;
              "
              placeholder="Gerando link..."
            />
            <div style="display: flex; gap: 0.75rem;">
              <button id="copyShareBtn" style="
                flex: 1;
                padding: 0.75rem;
                background: var(--primary);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
              ">Copiar</button>
              <button id="shortenShareBtn" style="
                flex: 1;
                padding: 0.75rem;
                background: var(--secondary);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
              ">Encurtar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modal = document.getElementById('shareModalContent');
    this.bindModalEvents();
  }

  bindModalEvents() {
    const closeBtn = document.getElementById('closeShareModal');
    const copyBtn = document.getElementById('copyShareBtn');
    const shortenBtn = document.getElementById('shortenShareBtn');

    closeBtn.onclick = () => this.hideModal();
    copyBtn.onclick = () => this.copyUrl();
    shortenBtn.onclick = () => this.shortenUrl();

    this.modal.onclick = (e) => {
      if (e.target === this.modal) this.hideModal();
    };
  }

  setupButtons() {
    // ArbiPro
    this.setupArbiProButton();
    
    // FreePro  
    this.setupFreeProButton();
  }

  setupArbiProButton() {
    let attempts = 0;
    const maxAttempts = 10;
    
    const setup = () => {
      attempts++;
      
      const btn = document.getElementById('shareBtn');
      if (btn) {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('ArbiPro share clicado');
          this.share('arbipro');
        });
        
        console.log('✅ Botão ArbiPro configurado');
        return true;
      }
      
      if (attempts < maxAttempts) {
        setTimeout(setup, 500);
        return false;
      }
      
      return false;
    };
    
    setTimeout(setup, 1000);
  }

  setupFreeProButton() {
    let attempts = 0;
    const maxAttempts = 15;
    
    const setup = () => {
      attempts++;
      
      try {
        const iframe = document.getElementById('calc2frame');
        if (iframe?.contentDocument) {
          const btn = iframe.contentDocument.getElementById('shareBtn');
          
          if (btn) {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
              e.preventDefault();
              console.log('FreePro share clicado');
              
              if (window.SharkShareUI) {
                window.SharkShareUI.share('freepro');
              }
            });
            
            console.log('✅ Botão FreePro configurado');
            return true;
          }
        }
      } catch (e) {
        // Normal durante carregamento
      }
      
      if (attempts < maxAttempts) {
        setTimeout(setup, 1000);
        return false;
      }
      
      return false;
    };
    
    setTimeout(setup, 3000);
  }

  showModal(url) {
    const input = document.getElementById('shareUrlInput');
    input.value = url;
    this.modal.style.display = 'block';
    
    setTimeout(() => {
      input.focus();
      input.select();
    }, 100);
  }

  hideModal() {
    this.modal.style.display = 'none';
  }

  async copyUrl() {
    const input = document.getElementById('shareUrlInput');
    const btn = document.getElementById('copyShareBtn');
    
    const success = await this.shareSystem.copyToClipboard(input.value);
    
    if (success) {
      btn.textContent = '✅ Copiado!';
      setTimeout(() => {
        btn.textContent = 'Copiar';
      }, 2000);
    } else {
      alert('Erro ao copiar');
    }
  }

  async shortenUrl() {
    const input = document.getElementById('shareUrlInput');
    const btn = document.getElementById('shortenShareBtn');
    
    btn.textContent = 'Encurtando...';
    btn.disabled = true;
    
    const shortUrl = await this.shareSystem.shortenUrl(input.value);
    input.value = shortUrl;
    
    btn.textContent = 'Encurtar';
    btn.disabled = false;
  }

  async share(type) {
    try {
      let data, url;

      if (type === 'arbipro') {
        data = this.getArbiProData();
        url = this.shareSystem.generateArbiProLink(data);
      } else if (type === 'freepro') {
        data = this.getFreeProData();
        url = this.shareSystem.generateFreeProLink(data);
      } else {
        throw new Error('Tipo inválido');
      }

      console.log('URL gerada:', url);
      this.showModal(url);
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      alert('Erro: ' + error.message);
    }
  }

  getArbiProData() {
    const app = window.SharkGreen;
    
    if (!app?.arbiPro) {
      throw new Error('ArbiPro não encontrado');
    }

    return {
      numHouses: app.arbiPro.numHouses || 2,
      rounding: app.arbiPro.roundingValue || 0.01,
      houses: app.arbiPro.houses.slice(0, app.arbiPro.numHouses || 2)
    };
  }

  getFreeProData() {
    const iframe = document.getElementById('calc2frame');
    
    if (!iframe?.contentDocument) {
      throw new Error('FreePro não encontrado');
    }

    const doc = iframe.contentDocument;
    const $ = (id) => doc.getElementById(id);

    const mode = doc.body.classList.contains('mode-cashback') ? 'cashback' : 'freebet';
    
    const data = {
      numEntradas: parseInt($('numEntradas')?.value || '3'),
      roundStep: parseFloat($('round_step')?.value || '1.00'),
      mode: mode,
      promoOdd: $('o1')?.value || $('cashback_odd')?.value || '',
      promoStake: $('s1')?.value || $('cashback_stake')?.value || '',
      coverages: []
    };

    if (mode === 'cashback') {
      data.cashbackRate = $('cashback_rate')?.value || '';
    } else {
      data.promoComm = $('c1')?.value || '';
      data.freebetValue = $('F')?.value || '';
      data.extractionRate = $('r')?.value || '';
    }

    const cards = doc.querySelectorAll('#oddsContainer > div');
    cards.forEach(card => {
      const odd = card.querySelector('input[data-type="odd"]')?.value || '';
      const comm = card.querySelector('input[data-type="comm"]')?.value || '';
      const lay = card.querySelector('input[data-type="lay"]')?.checked || false;
      
      data.coverages.push({ odd, comm, lay });
    });

    return data;
  }

  loadSharedConfig() {
    const config = this.shareSystem.loadFromUrl();
    if (!config) return;

    console.log('Carregando configuração:', config);

    if (config.type === 'arbipro') {
      this.loadArbiPro(config);
    } else if (config.type === 'freepro') {
      this.loadFreePro(config);
    }

    this.shareSystem.cleanUrl();
  }

  loadArbiPro(config) {
    setTimeout(() => {
      const app = window.SharkGreen;
      if (!app?.arbiPro) return;

      const numSelect = document.getElementById('numHouses');
      if (numSelect) {
        numSelect.value = config.numHouses;
        numSelect.dispatchEvent(new Event('change'));
      }

      const roundSelect = document.getElementById('rounding');
      if (roundSelect) {
        roundSelect.value = config.rounding;
        roundSelect.dispatchEvent(new Event('change'));
      }

      setTimeout(() => {
        config.houses.forEach((house, index) => {
          const oddInput = document.getElementById(`odd-${index}`);
          const stakeInput = document.getElementById(`stake-${index}`);

          if (oddInput && house.odd) {
            oddInput.value = house.odd;
            oddInput.dispatchEvent(new Event('input'));
          }

          if (stakeInput && house.stake) {
            stakeInput.value = house.stake;
            stakeInput.dispatchEvent(new Event('input'));
          }

          if (house.commission) {
            const commCheck = document.querySelector(`input[data-action="toggleCommission"][data-idx="${index}"]`);
            if (commCheck) {
              commCheck.checked = true;
              commCheck.dispatchEvent(new Event('change'));
              
              setTimeout(() => {
                const commInput = document.getElementById(`commission-${index}`);
                if (commInput) {
                  commInput.value = house.commission;
                  commInput.dispatchEvent(new Event('input'));
                }
              }, 100);
            }
          }

          if (house.freebet) {
            const fbCheck = document.querySelector(`input[data-action="toggleFreebet"][data-idx="${index}"]`);
            if (fbCheck) {
              fbCheck.checked = true;
              fbCheck.dispatchEvent(new Event('change'));
            }
          }

          if (house.lay) {
            const layBtn = document.querySelector(`button[data-action="toggleLay"][data-idx="${index}"]`);
            if (layBtn) layBtn.click();
          }

          if (house.fixedStake) {
            const fixBtn = document.querySelector(`button[data-action="fixStake"][data-idx="${index}"]`);
            if (fixBtn) fixBtn.click();
          }
        });

        app.arbiPro.scheduleUpdate();
      }, 500);
    }, 1500);
  }

  loadFreePro(config) {
    setTimeout(() => {
      const iframe = document.getElementById('calc2frame');
      if (!iframe?.contentDocument) return;

      const doc = iframe.contentDocument;
      const $ = (id) => doc.getElementById(id);

      if (config.mode === 'cashback') {
        doc.body.classList.add('mode-cashback');
        $('modeCashbackBtn')?.classList.add('active');
        $('modeFreebetBtn')?.classList.remove('active');
      }

      if ($('numEntradas')) {
        $('numEntradas').value = config.numEntradas;
        $('numEntradas').dispatchEvent(new Event('change'));
      }

      if ($('round_step')) {
        $('round_step').value = config.rounding;
      }

      setTimeout(() => {
        if (config.mode === 'cashback') {
          if ($('cashback_odd')) $('cashback_odd').value = config.promoOdd;
          if ($('cashback_stake')) $('cashback_stake').value = config.promoStake;
          if ($('cashback_rate')) $('cashback_rate').value = config.cashbackRate;
        } else {
          if ($('o1')) $('o1').value = config.promoOdd;
          if ($('c1')) $('c1').value = config.promoComm;
          if ($('s1')) $('s1').value = config.promoStake;
          if ($('F')) $('F').value = config.freebetValue;
          if ($('r')) $('r').value = config.extractionRate;
        }

        setTimeout(() => {
          const cards = doc.querySelectorAll('#oddsContainer > div');
          config.coverages.forEach((cov, index) => {
            if (index < cards.length) {
              const card = cards[index];
              const oddInput = card.querySelector('input[data-type="odd"]');
              const commInput = card.querySelector('input[data-type="comm"]');
              const layInput = card.querySelector('input[data-type="lay"]');

              if (oddInput) oddInput.value = cov.odd;
              if (commInput) commInput.value = cov.comm;
              if (layInput) layInput.checked = cov.lay;
            }
          });

          const autoCalc = doc.querySelector('.auto-calc');
          if (autoCalc) autoCalc.dispatchEvent(new Event('input'));
        }, 300);
      }, 300);
    }, 2500);
  }
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.SharkShareUI = new ShareUI();
    window.SharkShareUI.init();
    console.log('✅ ShareUI standalone carregado');
  }, 2000);
});

// Função de teste global
window.testShare = function() {
  if (window.SharkShareUI) {
    window.SharkShareUI.share('arbipro');
  } else {
    console.error('ShareUI não carregado');
  }
};
