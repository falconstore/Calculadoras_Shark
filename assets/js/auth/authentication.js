// PASSO 10 - assets/js/auth/authentication.js
// Sistema completo de autenticação

import { APP_CONFIG } from '../config/app.js';

export class Auth {
  constructor() {
    this.currentUser = null;
    this.stateChangeCallbacks = [];
  }

  init() {
    this.bindEvents();
    this.autoLogin();
  }

  bindEvents() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail')?.value?.trim();
        const password = document.getElementById('loginPassword')?.value;
        this.loginUser(email, password);
      });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // Navigation buttons
    this.bindNavigationButtons();
    this.bindPlanButtons();
  }

  bindNavigationButtons() {
    const buttons = [
      { id: 'showPlansBtn', screen: 'plans' },
      { id: 'backToLoginBtn', screen: 'login' },
      { id: 'renewSubscriptionBtn', action: 'renewSubscription' }
    ];

    buttons.forEach(({ id, screen, action }) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          if (action === 'renewSubscription') {
            this.openRenewalPage();
          } else {
            this.showScreen(screen);
          }
        });
      }
    });
  }

  bindPlanButtons() {
    document.querySelectorAll('.plan-card').forEach(card => {
      card.addEventListener('click', () => {
        const plan = card.dataset.plan;
        const url = APP_CONFIG.subscriptionUrls[plan];
        if (url) {
          const userEmail = this.currentUser?.email;
          const finalUrl = userEmail ? `${url}?email=${encodeURIComponent(userEmail)}` : url;
          window.open(finalUrl, '_blank');
        }
      });
    });
  }

  async loginUser(email, password) {
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');
    
    try {
      if (loginText) loginText.classList.add('hidden');
      if (loginSpinner) loginSpinner.classList.remove('hidden');

      if (!email) throw new Error(APP_CONFIG.errorMessages.auth.emailRequired);
      if (!password || password.length < 6) {
        throw new Error(APP_CONFIG.errorMessages.auth.passwordTooShort);
      }

      // Aguarda Firebase estar pronto
      if (!window.firebaseDb) {
        throw new Error(APP_CONFIG.errorMessages.auth.firebaseNotReady);
      }

      // Busca usuário no Firestore
      const docRef = window.firebaseDoc(window.firebaseDb, 'users', email);
      const snap = await window.firebaseGetDoc(docRef);

      if (!snap.exists()) {
        throw new Error(APP_CONFIG.errorMessages.auth.userNotFound);
      }

      const userData = snap.data();

      // Valida senha
      if (!('password' in userData) || String(userData.password) !== String(password)) {
        throw new Error(APP_CONFIG.errorMessages.auth.incorrectPassword);
      }

      // Verifica assinatura
      const subscriptionCheck = await this.checkSubscription(email);
      if (!subscriptionCheck.valid) {
        if (subscriptionCheck.reason === 'expired') {
          this.currentUser = { email, ...subscriptionCheck.userData };
          localStorage.setItem(APP_CONFIG.storage.userKey, JSON.stringify(this.currentUser));
          this.showScreen('expired');
          this.updateUserInfo();
          this.notifyStateChange();
          return;
        }
        if (subscriptionCheck.reason === 'inactive') {
          throw new Error(APP_CONFIG.errorMessages.auth.subscriptionInactive);
        }
        throw new Error('Erro na verificação da assinatura: ' + subscriptionCheck.reason);
      }

      // Login bem-sucedido
      this.currentUser = { email, ...subscriptionCheck.userData, subscriptionValid: true };
      localStorage.setItem(APP_CONFIG.storage.userKey, JSON.stringify(this.currentUser));
      
      this.updateUserInfo();
      this.notifyStateChange();
      
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro no login: ' + error.message);
    } finally {
      if (loginText) loginText.classList.remove('hidden');
      if (loginSpinner) loginSpinner.classList.add('hidden');
    }
  }

  async checkSubscription(email) {
    try {
      const docRef = window.firebaseDoc(window.firebaseDb, 'users', email);
      const docSnap = await window.firebaseGetDoc(docRef);

      if (!docSnap.exists()) {
        return { valid: false, reason: 'user_not_found' };
      }

      const userData = docSnap.data();

      if (userData.status !== 'active') {
        return { valid: false, reason: 'inactive', userData };
      }

      // Verifica data de expiração
      const now = new Date();
      let expiresAt = null;

      if (userData.expiresAt) {
        if (typeof userData.expiresAt === 'string') {
          expiresAt = new Date(userData.expiresAt);
        } else if (userData.expiresAt.toDate) {
          expiresAt = userData.expiresAt.toDate();
        }
      }

      if (!expiresAt || isNaN(expiresAt.getTime())) {
        return { valid: false, reason: 'invalid_date', userData };
      }

      if (expiresAt <= now) {
        return { valid: false, reason: 'expired', userData };
      }

      return { valid: true, userData };
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      return { valid: false, reason: 'error', error: error.message };
    }
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(APP_CONFIG.storage.userKey);
    this.showScreen('login');
    this.updateUserInfo();
    this.notifyStateChange();
  }

  async autoLogin() {
    const savedUser = localStorage.getItem(APP_CONFIG.storage.userKey);
    if (!savedUser) {
      this.showScreen('login');
      this.notifyStateChange();
      return;
    }

    try {
      const userData = JSON.parse(savedUser);
      const subscriptionCheck = await this.checkSubscription(userData.email);

      if (subscriptionCheck.valid) {
        this.currentUser = { ...userData, ...subscriptionCheck.userData, subscriptionValid: true };
        localStorage.setItem(APP_CONFIG.storage.userKey, JSON.stringify(this.currentUser));
        this.updateUserInfo();
        this.notifyStateChange();
      } else if (subscriptionCheck.reason === 'expired') {
        this.currentUser = { ...userData, ...subscriptionCheck.userData };
        localStorage.setItem(APP_CONFIG.storage.userKey, JSON.stringify(this.currentUser));
        this.showScreen('expired');
        this.updateUserInfo();
        this.notifyStateChange();
      } else {
        this.logout();
      }
    } catch (error) {
      console.error('Erro no auto-login:', error);
      this.logout();
    }
  }

  showScreen(screen) {
    const screens = {
      login: 'loginScreen',
      expired: 'expiredScreen',
      plans: 'plansScreen'
    };

    Object.values(screens).forEach(id => {
      const element = document.getElementById(id);
      if (element) element.classList.add('hidden');
    });

    const targetScreen = document.getElementById(screens[screen]);
    if (targetScreen) {
      targetScreen.classList.remove('hidden');
    }
  }

  updateUserInfo() {
    const userInfo = document.getElementById('userInfo');
    const userEmail = document.getElementById('userEmail');
    const userStatus = document.getElementById('userStatus');
    const userExpires = document.getElementById('userExpires');

    if (this.currentUser) {
      if (userInfo) userInfo.classList.remove('hidden');
      if (userEmail) userEmail.textContent = this.currentUser.email;
      if (userStatus) {
        userStatus.textContent = this.currentUser.status === 'active' ? 'Ativa' : 'Expirada';
        userStatus.style.color = this.currentUser.status === 'active' ? 'var(--success)' : 'var(--warning)';
      }
      if (userExpires) {
        userExpires.textContent = `Expira em: ${this.formatDate(this.currentUser.expiresAt)}`;
      }
    } else {
      if (userInfo) userInfo.classList.add('hidden');
    }
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'N/A';
    }
  }

  openRenewalPage() {
    window.open(APP_CONFIG.subscriptionUrls.biannual, '_blank');
  }

  // Sistema de callbacks para mudanças de estado
  onStateChange(callback) {
    this.stateChangeCallbacks.push(callback);
  }

  notifyStateChange() {
    this.stateChangeCallbacks.forEach(callback => {
      try {
        callback(this.currentUser);
      } catch (error) {
        console.error('Erro no callback de mudança de estado:', error);
      }
    });
  }
}
