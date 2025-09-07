// PASSO 8 - assets/js/ui/theme.js
// Sistema de temas claro/escuro

import { APP_CONFIG } from '../config/app.js';

export class Theme {
  constructor() {
    this.currentTheme = 'dark';
    this.themeToggle = null;
  }

  init() {
    this.themeToggle = document.getElementById('themeToggle');
    this.loadSavedTheme();
    this.bindEvents();
  }

  loadSavedTheme() {
    const savedTheme = localStorage.getItem(APP_CONFIG.storage.themeKey) || 'dark';
    this.setTheme(savedTheme);
  }

  bindEvents() {
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }

  setTheme(theme) {
    const body = document.body;
    this.currentTheme = theme;

    if (theme === 'light') {
      body.setAttribute('data-theme', 'light');
      if (this.themeToggle) {
        this.themeToggle.innerHTML = '☀️ Tema Claro';
      }
    } else {
      body.removeAttribute('data-theme');
      if (this.themeToggle) {
        this.themeToggle.innerHTML = '🌙 Tema Escuro';
      }
    }

    localStorage.setItem(APP_CONFIG.storage.themeKey, theme);
    
    // Notifica outros componentes sobre mudança de tema
    this.notifyThemeChange(theme);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  notifyThemeChange(theme) {
    // Dispara evento customizado para outros componentes
    const event = new CustomEvent('themeChanged', { 
      detail: { theme } 
    });
    document.dispatchEvent(event);
  }
}
