// assets/js/main.js - Versão sem autenticação
// Controlador principal da aplicação

import { Theme } from './ui/theme.js';
import { TabSystem } from './ui/tabs.js';
import { ArbiPro } from './calculators/arbipro.js';
import { FreePro } from './calculators/freepro.js';

class App {
  constructor() {
    this.theme = new Theme();
    this.tabSystem = null;
    this.arbiPro = null;
    this.freePro = null;
  }

  async init() {
    try {
      console.log('Iniciando Calculadoras Shark 100% Green...');
      
      // Inicializa tema
      this.theme.init();
      
      // Carrega aplicação principal diretamente
      await this.loadMainApp();
      
      console.log('Calculadoras Shark 100% Green inicializadas com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar app:', error);
      this.showError('Erro ao inicializar aplicação');
    }
  }

  async loadMainApp() {
    try {
      console.log('Carregando calculadoras...');
      
      // Mostra loading inicial
      this.showLoadingScreen();
      
      // Simula carregamento de 2 segundos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const container = document.getElementById('app-container');

      // Template das calculadoras
      const html = `
        <div role="tablist" aria-label="Calculadoras" class="tabs-container">
          <button id="tabBtn1" role="tab" aria-selected="true" aria-controls="panel-1" class="tab" tabindex="0">
            Calculadora ArbiPro
          </button>
          <button id="tabBtn2" role="tab" aria-selected="false" aria-controls="panel-2" class="tab" tabindex="-1">
            Calculadora FreePro
          </button>
        </div>

        <section id="panel-1" role="tabpanel" aria-labelledby="tabBtn1">
          <div class="panel">
            <div id="app"></div>
          </div>
        </section>

        <section id="panel-2" role="tabpanel" aria-labelledby="tabBtn2" hidden>
          <div class="panel">
            <iframe id="calc2frame" title="Calculadora FreePro" 
              style="width: 100%; height: auto; border: none; border-radius: 16px; background: transparent; display: block; overflow: hidden;" 
              scrolling="no">
            </iframe>
          </div>
        </section>
      `;
      
      container.innerHTML = html;

      // Inicializa sistema de abas
      this.tabSystem = new TabSystem();
      this.tabSystem.init();

      // Inicializa calculadoras
      this.arbiPro = new ArbiPro();
      this.freePro = new FreePro();

      await this.arbiPro.init();
      this.freePro.init();
      
      console.log('Calculadoras carregadas com sucesso');
      
    } catch (error) {
      console.error('Erro ao carregar calculadoras:', error);
      this.showError('Erro ao carregar calculadoras');
    }
  }

  showLoadingScreen() {
    const container = document.getElementById('app-container');
    container.innerHTML = `
      <div class="post-login-loading">
        <div class="post-login-content">
          <div class="post-login-title"> Carregando Shark 100% Green</div>
          <div class="post-login-spinner"></div>
          <div class="post-login-message">Inicializando calculadoras profissionais...</div>
        </div>
      </div>
    `;
  }

  showError(message) {
    const container = document.getElementById('app-container');
    container.innerHTML = `
      <div class="container" style="text-align: center; margin-top: 2rem;">
        <div class="auth-container">
          <h2 style="color: var(--danger); margin-bottom: 1rem;">❌ Erro</h2>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">${message}</p>
          <button onclick="location.reload()" class="btn btn-primary">Recarregar Página</button>
        </div>
      </div>
    `;
  }

  // Métodos públicos para debug
  getModules() {
    return {
      theme: this.theme,
      tabSystem: this.tabSystem,
      arbiPro: this.arbiPro,
      freePro: this.freePro
    };
  }
}

// Inicializa app quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  window.SharkGreen = app; // Para debug global
  app.init();
});
