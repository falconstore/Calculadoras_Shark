// PASSO 14 - assets/js/main.js
// Controlador principal da aplicação

import './config/firebase.js'; // Inicializa Firebase
import { Auth } from './auth/authentication.js';
import { Theme } from './ui/theme.js';
import { TabSystem } from './ui/tabs.js';
import { ArbiPro } from './calculators/arbipro.js';
import { FreePro } from './calculators/freepro.js';

class App {
  constructor() {
    this.auth = new Auth();
    this.theme = new Theme();
    this.tabSystem = null;
    this.arbiPro = null;
    this.freePro = null;
    this.currentScreen = null;
  }

  async init() {
    try {
      console.log('Iniciando aplicação FreePro...');
      
      // Aguarda Firebase estar pronto
      await this.waitForFirebase();
      
      // Inicializa tema
      this.theme.init();
      
      // Inicializa autenticação
      this.auth.init();
      
      // Escuta mudanças de estado da auth
      this.auth.onStateChange((user) => {
        this.handleAuthStateChange(user);
      });
      
      console.log('Aplicação FreePro inicializada com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar app:', error);
      this.showError('Erro ao inicializar aplicação');
    }
  }

  async waitForFirebase() {
    let attempts = 0;
    while (!window.firebaseDb && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    if (!window.firebaseDb) {
      throw new Error('Firebase não inicializou');
    }
    console.log('Firebase pronto');
  }

  handleAuthStateChange(user) {
    console.log('Mudança de estado da autenticação:', user ? 'logado' : 'deslogado');
    
    if (user && user.subscriptionValid) {
      this.loadMainApp();
    } else {
      this.loadAuthScreens();
    }
  }

  async loadMainApp() {
    try {
      console.log('Carregando aplicação principal...');
      
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
      
      this.currentScreen = 'main';
      console.log('Aplicação principal carregada');
      
    } catch (error) {
      console.error('Erro ao carregar app principal:', error);
      this.showError('Erro ao carregar calculadoras');
    }
  }

  async loadAuthScreens() {
    try {
      console.log('Carregando telas de autenticação...');
      
      const container = document.getElementById('app-container');
      
      // Template das telas de auth
      const html = `
        <!-- Tela de Login -->
        <div id="loginScreen" class="container">
          <div class="auth-container">
            <h2 class="auth-title">Acesso FreePro</h2>
            
            <form id="loginForm">
              <div class="form-group">
                <label class="form-label" for="loginEmail">E-mail</label>
                <input type="email" id="loginEmail" class="form-input" required placeholder="seu@email.com" />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="loginPassword">Senha</label>
                <input type="password" id="loginPassword" class="form-input" required placeholder="Sua senha" />
              </div>
              
              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                <span id="loginText">Entrar</span>
                <div id="loginSpinner" class="loading-spinner hidden" style="margin: 0 auto;"></div>
              </button>
            </form>
            
            <div style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border);">
              <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1rem;">
                Não tem acesso ainda?
              </p>
              <button id="showPlansBtn" class="btn btn-secondary">Ver Planos de Assinatura</button>
            </div>
          </div>
        </div>

        <!-- Tela de Assinatura Expirada -->
        <div id="expiredScreen" class="container hidden">
          <div class="auth-container">
            <h2 class="auth-title" style="color: var(--warning);">⚠️ Assinatura Expirada</h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem; text-align: center;">
              Sua assinatura FreePro expirou. Renove agora para continuar usando as calculadoras profissionais.
            </p>
            <button id="renewSubscriptionBtn" class="btn btn-primary" style="width: 100%;">Renovar Assinatura</button>
          </div>
        </div>

        <!-- Tela de Planos -->
        <div id="plansScreen" class="container hidden">
          <div style="text-align: center; margin: 2rem 0;">
            <h2 class="auth-title">Escolha seu Plano FreePro</h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">
              Acesso completo às calculadoras profissionais de arbitragem
            </p>
          </div>
          
          <div class="subscription-plans">
            <div class="plan-card" data-plan="monthly">
              <div class="plan-name">Mensal</div>
              <div class="plan-price">R$ 9,90</div>
              <div class="plan-period">por mês</div>
            </div>
            
            <div class="plan-card" data-plan="quarterly">
              <div class="plan-name">Trimestral</div>
              <div class="plan-price">R$ 26,90</div>
              <div class="plan-period">por 3 meses</div>
              <div class="plan-discount">10% desconto</div>
            </div>
            
            <div class="plan-card popular" data-plan="biannual">
              <div class="plan-name">Semestral</div>
              <div class="plan-price">R$ 47,90</div>
              <div class="plan-period">por 6 meses</div>
              <div class="plan-discount">20% desconto</div>
            </div>
            
            <div class="plan-card" data-plan="annual">
              <div class="plan-name">Anual</div>
              <div class="plan-price">R$ 79,90</div>
              <div class="plan-period">por ano</div>
              <div class="plan-discount">33% desconto</div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 2rem;">
            <button id="backToLoginBtn" class="btn btn-secondary">Voltar ao Login</button>
          </div>
        </div>
      `;
      
      container.innerHTML = html;
      
      // Re-bind events da auth após carregar HTML
      this.auth.bindEvents();
      
      this.currentScreen = 'auth';
      console.log('Telas de autenticação carregadas');
      
    } catch (error) {
      console.error('Erro ao carregar telas de auth:', error);
      this.showError('Erro ao carregar tela de login');
    }
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
  getCurrentScreen() {
    return this.currentScreen;
  }

  getModules() {
    return {
      auth: this.auth,
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
  window.FreePro = app; // Para debug global
  app.init();
});
