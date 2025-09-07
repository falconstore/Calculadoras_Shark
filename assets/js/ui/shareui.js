// assets/js/ui/shareui.js
// Sistema de Interface para Compartilhamento - VERSÃO UNIFICADA

export class ShareUI {
  constructor() {
    this.initialized = false;
    this.shareSystem = null;
  }

  init() {
    this.initialized = true;
    this.initShareSystem();
    console.log('ShareUI inicializado');
  }

  async initShareSystem() {
    try {
      // Tenta carregar o sistema de compartilhamento se disponível
      const { ShareSystem } = await import('../utils/share.js');
      this.shareSystem = new ShareSystem();
      console.log('ShareSystem carregado com sucesso');
    } catch (error) {
      console.warn('ShareSystem não disponível:', error.message);
      // Continua sem sistema de compartilhamento
    }
  }

  // Método placeholder para compatibilidade
  addShareButtons() {
    if (this.shareSystem) {
      console.log('ShareUI: addShareButtons called with ShareSystem');
      // Implementar lógica real se ShareSystem estiver disponível
    } else {
      console.log('ShareUI: addShareButtons called - ShareSystem not available');
    }
  }

  // Cria botão de compartilhamento
  createShareButton(calculator) {
    if (!this.shareSystem) {
      console.warn('ShareSystem não disponível para criar botão');
      return null;
    }

    const button = document.createElement('button');
    button.className = 'btn btn-share';
    button.innerHTML = '🔗 Compartilhar';
    button.style.background = 'linear-gradient(135deg, #8b5cf6, #3b82f6)';
    button.style.color = 'white';
    
    button.addEventListener('click', () => {
      this.handleShareClick(calculator);
    });
    
    return button;
  }

  // Manipula clique de compartilhamento
  async handleShareClick(calculator) {
    if (!this.shareSystem) {
      alert('Sistema de compartilhamento não disponível');
      return;
    }

    try {
      let data;
      
      if (calculator === 'arbipro') {
        data = this.getArbiProData();
      } else if (calculator === 'freepro') {
        data = this.getFreeProData();
      }
      
      if (data) {
        const shareLink = calculator === 'arbipro' 
          ? this.shareSystem.generateArbiProLink(data)
          : this.shareSystem.generateFreeProLink(data);
        
        if (shareLink) {
          await this.showShareModal(shareLink);
        }
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      alert('Erro ao gerar link de compartilhamento');
    }
  }

  // Obtém dados do ArbiPro
  getArbiProData() {
    try {
      if (window.SharkGreen && window.SharkGreen.arbiPro) {
        const arbiPro = window.SharkGreen.arbiPro;
        return {
          numHouses: arbiPro.numHouses,
          rounding: arbiPro.roundingValue,
          houses: arbiPro.houses
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter dados ArbiPro:', error);
      return null;
    }
  }

  // Obtém dados do FreePro
  getFreeProData() {
    try {
      // Tenta obter dados do iframe FreePro
      const iframe = document.getElementById('calc2frame');
      if (iframe && iframe.contentDocument) {
        const doc = iframe.contentDocument;
        
        return {
          numEntradas: parseInt(doc.getElementById('numEntradas')?.value || '3'),
          roundStep: parseFloat(doc.getElementById('round_step')?.value || '1.00'),
          promoOdd: doc.getElementById('o1')?.value || '',
          promoComm: doc.getElementById('c1')?.value || '',
          promoStake: doc.getElementById('s1')?.value || '',
          freebetValue: doc.getElementById('F')?.value || '',
          extractionRate: doc.getElementById('r')?.value || '',
          coverages: this.extractCoverageData(doc)
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter dados FreePro:', error);
      return null;
    }
  }

  // Extrai dados de cobertura do FreePro
  extractCoverageData(doc) {
    try {
      const coverages = [];
      const oddInputs = doc.querySelectorAll('#oddsContainer input[data-type="odd"]');
      const commInputs = doc.querySelectorAll('#oddsContainer input[data-type="comm"]');
      const layInputs = doc.querySelectorAll('#oddsContainer input[data-type="lay"]');
      
      for (let i = 0; i < oddInputs.length; i++) {
        coverages.push({
          odd: oddInputs[i]?.value || '',
          comm: commInputs[i]?.value || '',
          lay: layInputs[i]?.checked || false
        });
      }
      
      return coverages;
    } catch (error) {
      console.error('Erro ao extrair dados de cobertura:', error);
      return [];
    }
  }

  // Mostra modal de compartilhamento
  async showShareModal(shareLink) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    modal.innerHTML = `
      <div style="
        background: var(--bg-card);
        border-radius: 16px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        text-align: center;
        border: 1px solid var(--border);
      ">
        <h3 style="color: var(--text-primary); margin-bottom: 1rem;">
          🔗 Link de Compartilhamento
        </h3>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
          Copie o link abaixo para compartilhar suas configurações
        </p>
        <div style="
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          word-break: break-all;
          font-family: monospace;
          color: var(--text-primary);
        ">
          ${shareLink.shortUrl || shareLink.fullUrl}
        </div>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button id="copyBtn" class="btn btn-primary">Copiar Link</button>
          <button id="closeBtn" class="btn btn-secondary">Fechar</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('#copyBtn').addEventListener('click', async () => {
      try {
        const url = shareLink.shortUrl || shareLink.fullUrl;
        await this.shareSystem.copyToClipboard(url);
        alert('Link copiado com sucesso!');
      } catch (error) {
        console.error('Erro ao copiar:', error);
        alert('Erro ao copiar link');
      }
    });
    
    modal.querySelector('#closeBtn').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  // Carrega configuração compartilhada na inicialização
  loadSharedConfig() {
    if (!this.shareSystem) return;
    
    try {
      const config = this.shareSystem.loadFromUrl();
      if (config && this.shareSystem.validateConfig(config)) {
        this.applyConfig(config);
        // Limpa URL após carregar
        this.shareSystem.cleanUrl();
      }
    } catch (error) {
      console.error('Erro ao carregar configuração compartilhada:', error);
    }
  }

  // Aplica configuração carregada
  applyConfig(config) {
    console.log('Aplicando configuração compartilhada:', config);
    
    if (config.t === 'arbipro') {
      this.applyArbiProConfig(config);
    } else if (config.t === 'freepro') {
      this.applyFreeProConfig(config);
    }
  }

  // Aplica configuração do ArbiPro
  applyArbiProConfig(config) {
    setTimeout(() => {
      if (window.SharkGreen?.arbiPro) {
        const arbiPro = window.SharkGreen.arbiPro;
        
        // Aplica configurações básicas
        arbiPro.numHouses = config.n || 2;
        arbiPro.roundingValue = config.r || 0.01;
        
        // Aplica dados das casas
        if (config.h && Array.isArray(config.h)) {
          config.h.forEach((house, idx) => {
            if (arbiPro.houses[idx]) {
              arbiPro.houses[idx] = { ...arbiPro.houses[idx], ...house };
            }
          });
        }
        
        // Força renderização
        arbiPro.renderHouses();
        arbiPro.scheduleUpdate();
        
        console.log('Configuração ArbiPro aplicada com sucesso');
      }
    }, 1000);
  }

  // Aplica configuração do FreePro
  applyFreeProConfig(config) {
    setTimeout(() => {
      const iframe = document.getElementById('calc2frame');
      if (iframe && iframe.contentDocument) {
        const doc = iframe.contentDocument;
        
        // Aplica configurações básicas
        if (doc.getElementById('numEntradas')) {
          doc.getElementById('numEntradas').value = config.n || 3;
        }
        if (doc.getElementById('round_step')) {
          doc.getElementById('round_step').value = config.r || 1.00;
        }
        
        // Aplica dados da promoção
        if (config.p) {
          if (doc.getElementById('o1')) doc.getElementById('o1').value = config.p.o || '';
          if (doc.getElementById('c1')) doc.getElementById('c1').value = config.p.c || '';
          if (doc.getElementById('s1')) doc.getElementById('s1').value = config.p.s || '';
          if (doc.getElementById('F')) doc.getElementById('F').value = config.p.f || '';
          if (doc.getElementById('r')) doc.getElementById('r').value = config.p.e || '';
        }
        
        console.log('Configuração FreePro aplicada com sucesso');
      }
    }, 2000);
  }
}
