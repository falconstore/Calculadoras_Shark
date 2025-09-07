// assets/js/main.js - VERSÃO SIMPLES E FUNCIONAL
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
    this.navigation = null;
    this.shareUI = null;
  }

  async init() {
    try {
      console.log('Iniciando Calculadoras Shark 100% Green...');
      
      // Inicializa tema
      this.theme.init();
      
      // Carrega módulos opcionais de forma segura
      await this.loadOptionalModules();
      
      // Carrega aplicação principal
      await this.loadMainApp();
      
      console.log('Calculadoras Shark 100% Green inicializadas com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar app:', error);
      this.showError('Erro ao inicializar aplicação: ' + error.message);
    }
  }

  async loadOptionalModules() {
    // Carrega Navigation de forma segura
    try {
      const { Navigation } = await import('./ui/navigation.js');
      this.navigation = new Navigation();
      this.navigation.init();
      console.log('✅ Navigation carregado');
    } catch (e) {
      console.warn('⚠️ Navigation não disponível:', e.message);
    }

    // Carrega ShareUI de forma segura
    try {
      const { ShareUI } = await import('./ui/shareui.js');
      this.shareUI = new ShareUI();
      this.shareUI.init();
      console.log('✅ ShareUI carregado');
    } catch (e) {
      console.warn('⚠️ ShareUI não disponível:', e.message);
    }
  }

  async loadMainApp() {
    try {
      console.log('Carregando calculadoras...');
      
      // Mostra loading
      this.showLoadingScreen();
      
      // Aguarda um pouco para mostrar loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const container = document.getElementById('app-container');
      if (!container) {
        throw new Error('Container app-container não encontrado');
      }

      // Template com navegação condicional
      const navigationTabs = this.navigation ? `
        <div class="main-navigation">
          <div class="nav-tabs">
            <button id="navCalculadoras" class="nav-tab active">Calculadoras</button>
            <button id="navSobre" class="nav-tab">Sobre</button>
            <button id="navContato" class="nav-tab">Contato</button>
          </div>
        </div>
      ` : '';

      const html = `
        ${navigationTabs}
        
        <div id="calculadoras-content">
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
        </div>
        
        <div id="sobre-content" class="page-content hidden"></div>
        <div id="contato-content" class="page-content hidden"></div>
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
      
      // Carrega configuração compartilhada se disponível
      if (this.shareUI && this.shareUI.loadSharedConfig) {
        setTimeout(() => {
          this.shareUI.loadSharedConfig();
        }, 1500);
      }
      
      // Adiciona botões de compartilhamento se disponível
      if (this.shareUI && this.shareUI.createShareButton) {
        setTimeout(() => {
          this.addShareButtons();
        }, 2000);
      }
      
      console.log('Calculadoras carregadas com sucesso');
      
    } catch (error) {
      console.error('Erro ao carregar calculadoras:', error);
      this.showError('Erro ao carregar calculadoras: ' + error.message);
    }
  }

  addShareButtons() {
    if (!this.shareUI || !this.shareUI.createShareButton) return;
    
    try {
      // Conecta o botão existente do ArbiPro ao sistema de compartilhamento
      const shareBtn = document.getElementById('shareBtn');
      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          if (this.shareUI.handleShareClick) {
            this.shareUI.handleShareClick('arbipro');
          }
        });
        console.log('✅ Botão ArbiPro conectado ao sistema de compartilhamento');
      }

      // Adiciona botão no FreePro (dentro do iframe)
      this.setupFreeProShareButton();

    } catch (error) {
      console.warn('Erro ao configurar botões de compartilhamento:', error);
    }
  }

  setupFreeProShareButton() {
    if (!this.shareUI) return;
    
    let attempts = 0;
    const maxAttempts = 10;
    
    const tryAddButton = () => {
      attempts++;
      
      try {
        const iframe = document.getElementById('calc2frame');
        if (iframe && iframe.contentDocument) {
          const doc = iframe.contentDocument;
          const actions = doc.querySelector('.actions');
          
          if (actions && !doc.querySelector('.btn-share')) {
            const shareBtn = doc.createElement('button');
            shareBtn.className = 'btn btn-share';
            shareBtn.innerHTML = '🔗 Compartilhar';
            shareBtn.style.cssText = `
              background: linear-gradient(135deg, #8b5cf6, #3b82f6) !important;
              color: white !important;
              margin-top: 0.75rem !important;
              border: none !important;
              border-radius: 8px !important;
              padding: 0.75rem 1rem !important;
              font-size: 0.875rem !important;
              font-weight: 600 !important;
              cursor: pointer !important;
              transition: all 0.2s ease !important;
            `;
            
            shareBtn.addEventListener('click', () => {
              if (this.shareUI.handleShareClick) {
                this.shareUI.handleShareClick('freepro');
              }
            });
            
            actions.appendChild(shareBtn);
            console.log('✅ Botão FreePro adicionado');
            return;
          }
        }
      } catch (e) {
        // Ignora erros de acesso ao iframe
      }
      
      if (attempts < maxAttempts) {
        setTimeout(tryAddButton, 500);
      }
    };
    
    tryAddButton();
  }

  showLoadingScreen() {
    const container = document.getElementById('app-container');
    if (container) {
      container.innerHTML = `
        <div class="post-login-loading">
          <div class="post-login-content">
            <div class="post-login-title">Carregando Shark 100% Green</div>
            <div class="post-login-spinner"></div>
            <div class="post-login-message">Inicializando calculadoras profissionais...</div>
          </div>
        </div>
      `;
    }
  }

  showError(message) {
    const container = document.getElementById('app-container');
    if (container) {
      container.innerHTML = `
        <div class="container" style="text-align: center; margin-top: 2rem;">
          <div class="card" style="max-width: 500px; margin: 0 auto; padding: 2rem;">
            <h2 style="color: var(--danger); margin-bottom: 1rem;">⚠️ Erro</h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">${message}</p>
            <button onclick="location.reload()" class="btn btn-primary">Recarregar Página</button>
          </div>
        </div>
      `;
    }
  }

  // Métodos públicos para debug
  getModules() {
    return {
      theme: this.theme,
      navigation: this.navigation,
      tabSystem: this.tabSystem,
      arbiPro: this.arbiPro,
      freePro: this.freePro,
      shareUI: this.shareUI
    };
  }
}

// Inicializa app quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  try {
    const app = new App();
    window.SharkGreen = app; // Para debug global
    app.init();
  } catch (error) {
    console.error('Erro crítico ao inicializar:', error);
    document.body.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #dc2626;">
        <h1>Erro Crítico</h1>
        <p>Não foi possível inicializar a aplicação.</p>
        <p>Erro: ${error.message}</p>
        <button onclick="location.reload()" style="padding: 1rem 2rem; margin-top: 1rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Recarregar
        </button>
      </div>
    `;
  }
});

// Exporta classe
export { App };
