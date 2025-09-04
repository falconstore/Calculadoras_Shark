// PASSO 13 - assets/js/calculators/freepro.js
// Controlador da calculadora FreePro

export class FreePro {
  constructor() {
    this.iframe = null;
    this.initialized = false;
  }

  init() {
    // A calculadora FreePro é carregada sob demanda via TabSystem
    this.initialized = true;
    
    // Escuta eventos de mudança de aba
    document.addEventListener('tabChanged', (e) => {
      if (e.detail.tabName === 'freepro') {
        this.onTabActivated();
      }
    });

    console.log('FreePro controller inicializado');
  }

  onTabActivated() {
    // Executado quando a aba FreePro é ativada
    this.iframe = document.getElementById('calc2frame');
    
    if (this.iframe && !this.iframe.dataset.loaded) {
      console.log('FreePro tab ativada - carregamento será feito pelo TabSystem');
    }
  }

  // Métodos para comunicação com o iframe (se necessário no futuro)
  sendMessage(message) {
    if (this.iframe && this.iframe.contentWindow) {
      try {
        this.iframe.contentWindow.postMessage(message, '*');
      } catch (error) {
        console.warn('Erro ao enviar mensagem para FreePro iframe:', error);
      }
    }
  }

  // Método para recarregar a calculadora
  reload() {
    if (this.iframe) {
      this.iframe.dataset.loaded = "";
      // Força recarregamento removendo e readicionando o iframe
      const parent = this.iframe.parentNode;
      const newIframe = this.iframe.cloneNode(false);
      parent.removeChild(this.iframe);
      parent.appendChild(newIframe);
      this.iframe = newIframe;
    }
  }

  // Método para obter dados da calculadora (futuro)
  getData() {
    return new Promise((resolve, reject) => {
      if (!this.iframe || !this.iframe.contentWindow) {
        reject(new Error('Iframe não disponível'));
        return;
      }

      // Implementar comunicação com iframe se necessário
      // Por enquanto retorna vazio
      resolve({
        numEntradas: 3,
        houseOdd: null,
        stake: null,
        freebetValue: null,
        extractionRate: 70
      });
    });
  }

  // Método para definir dados na calculadora (futuro)
  setData(data) {
    this.sendMessage({
      type: 'setData',
      data: data
    });
  }

  // Método para limpar os dados da calculadora
  clearData() {
    this.sendMessage({
      type: 'clearData'
    });
  }

  // Método para verificar se a calculadora está carregada
  isLoaded() {
    return this.iframe && this.iframe.dataset.loaded === "1";
  }

  // Método para aguardar o carregamento da calculadora
  waitForLoad(timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkLoaded = () => {
        if (this.isLoaded()) {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout aguardando carregamento do FreePro'));
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      
      checkLoaded();
    });
  }

  // Método para executar cálculo (se necessário comunicar com iframe)
  calculate() {
    this.sendMessage({
      type: 'calculate'
    });
  }

  // Método para obter resultados (futuro)
  getResults() {
    return new Promise((resolve) => {
      // Implementar comunicação com iframe se necessário
      resolve({
        totalStake: 0,
        scenarios: []
      });
    });
  }
}
