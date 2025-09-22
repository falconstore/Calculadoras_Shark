// PASSO 9 - assets/js/ui/tabs.js
// Sistema de navegação entre calculadoras (ArbiPro e FreePro)

export class TabSystem {
  constructor() {
    this.tabs = [];
    this.panels = [];
    this.activeIndex = 0;
  }

  init() {
    this.bindElements();
    this.bindEvents();
    this.setActive(0); // ArbiPro como padrão
  }

  bindElements() {
  this.tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  this.panels = [
    document.getElementById('panel-1'),
    document.getElementById('panel-2'),
    document.getElementById('panel-3') // ← NOVA LINHA
  ];
}

  bindEvents() {
    // Click nos tabs
    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => this.setActive(index));
    });

    // Navegação por teclado (acessibilidade)
    const tablist = document.querySelector('[role="tablist"]');
    if (tablist) {
      tablist.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
    }
  }

  handleKeyNavigation(e) {
    const current = this.tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
    let next = current;

    switch (e.key) {
      case 'ArrowRight':
        next = (current + 1) % this.tabs.length;
        break;
      case 'ArrowLeft':
        next = (current - 1 + this.tabs.length) % this.tabs.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = this.tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    this.setActive(next);
  }

  setActive(index) {
  if (index < 0 || index >= this.tabs.length) return;

  // Atualiza tabs
  this.tabs.forEach((tab, i) => {
    const isSelected = i === index;
    tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    tab.tabIndex = isSelected ? 0 : -1;
    
    if (isSelected) tab.focus();
  });

  // Atualiza panels
  this.panels.forEach((panel, i) => {
    if (panel) {
      panel.hidden = i !== index;
    }
  });

  this.activeIndex = index;

  // Carrega calculadora FreePro quando necessário
  if (index === 1) {
    this.loadFreePro();
  }

  // Dispara evento para outros componentes
  this.notifyTabChange(index);
}

  loadFreePro() {
    const iframe = document.getElementById('calc2frame');
    if (!iframe || iframe.dataset.loaded) return;

    // Carrega conteúdo do FreePro
    import('../calculators/freepro-content.js')
      .then(module => {
        const html = module.getFreeProfHTML();
        this.setupIframe(iframe, html);
        iframe.dataset.loaded = "1";
      })
      .catch(error => {
        console.error('Erro ao carregar FreePro:', error);
        iframe.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-muted);">Erro ao carregar calculadora FreePro</p>';
      });
  }

  setupIframe(iframe, html) {
    const doc = (iframe.contentDocument || iframe.contentWindow.document);
    doc.open();
    doc.write(html);
    doc.close();

    // Auto-resize do iframe
    const resizeIframe = () => {
      try {
        const body = doc.body;
        const html = doc.documentElement;
        
        const height = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
        );
        
        iframe.style.height = (height + 20) + 'px';
      } catch (e) {
        iframe.style.height = '800px';
      }
    };

    setTimeout(resizeIframe, 100);

    // Observer para mudanças de conteúdo
    if (doc.body) {
      const observer = new MutationObserver(() => {
        setTimeout(resizeIframe, 50);
      });
      observer.observe(doc.body, {
        childList: true,
        subtree: true,
        attributes: true
      });
    }

    // Sincronização de tema com iframe
    this.syncThemeWithIframe(doc);
  }

  syncThemeWithIframe(iframeDoc) {
    const syncTheme = () => {
      try {
        const parentTheme = document.body.getAttribute('data-theme');
        if (parentTheme === 'light') {
          iframeDoc.body.setAttribute('data-theme', 'light');
        } else {
          iframeDoc.body.removeAttribute('data-theme');
        }
      } catch (e) {
        console.warn('Não foi possível sincronizar tema com iframe');
      }
    };

    // Sincroniza tema inicial
    syncTheme();

    // Observa mudanças no tema do parent
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  notifyTabChange(index) {
  const tabNames = ['arbipro', 'freepro', 'casas-regulamentadas']; // ← ATUALIZADA
  const event = new CustomEvent('tabChanged', {
    detail: { index, tabName: tabNames[index] || 'unknown' }
  });
  document.dispatchEvent(event);
}

  getCurrentTab() {
    return this.activeIndex;
  }
}
