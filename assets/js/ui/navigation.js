// assets/js/ui/navigation.js - VERSÃO ATUALIZADA
// Sistema de navegação completo - COM CASAS REGULAMENTADAS

export class Navigation {
  constructor() {
    this.currentPage = 'calculadoras';
    this.pages = ['calculadoras', 'casasregulamentadas', 'sobre', 'contato'];
    this.casasRegulamentadas = null; // Referência será definida pelo main.js
  }

  init() {
    console.log('Navigation inicializando...');
    this.bindEvents();
    console.log('Navigation inicializado');
  }

  bindEvents() {
    // Aguarda DOM estar pronto e tenta múltiplas vezes
    const bindEvents = () => {
      const navButtons = document.querySelectorAll('.nav-tab');
      console.log('Botões encontrados:', navButtons.length);
      
      if (navButtons.length === 0) {
        console.warn('Nenhum botão de navegação encontrado');
        return false;
      }
      
      navButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('Clique em:', e.target.id);
          
          const page = e.target.id.replace('nav', '').toLowerCase();
          this.navigateTo(page);
        });
      });
      
      return true;
    };

    // Tenta imediatamente
    if (!bindEvents()) {
      // Tenta após delay
      setTimeout(() => {
        if (!bindEvents()) {
          // Última tentativa
          setTimeout(bindEvents, 2000);
        }
      }, 500);
    }
  }

  navigateTo(page) {
    console.log('Navegando para:', page);
    
    // Atualiza botões
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const activeBtn = document.getElementById(`nav${page.charAt(0).toUpperCase() + page.slice(1)}`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    // Atualiza conteúdo
    this.hideAllPages();
    
    switch(page) {
      case 'calculadoras':
        this.showCalculadoras();
        break;
      case 'casasregulamentadas':
        this.showCasasRegulamentadas();
        break;
      case 'sobre':
        this.showSobre();
        break;
      case 'contato':
        this.showContato();
        break;
    }
    
    this.currentPage = page;
  }

  hideAllPages() {
    const calculadoras = document.getElementById('calculadoras-content');
    const casasRegulamentadas = document.getElementById('casas-regulamentadas-content');
    const sobre = document.getElementById('sobre-content');
    const contato = document.getElementById('contato-content');
    
    if (calculadoras) calculadoras.classList.add('hidden');
    if (casasRegulamentadas) casasRegulamentadas.classList.add('hidden');
    if (sobre) sobre.classList.add('hidden');
    if (contato) contato.classList.add('hidden');
  }

  showCalculadoras() {
    const content = document.getElementById('calculadoras-content');
    if (content) {
      content.classList.remove('hidden');
    }
  }

  showCasasRegulamentadas() {
    const content = document.getElementById('casas-regulamentadas-content');
    if (content) {
      content.classList.remove('hidden');
      this.renderCasasRegulamentadas();
    }
  }

  showSobre() {
    const content = document.getElementById('sobre-content');
    if (content) {
      content.classList.remove('hidden');
      this.renderSobre();
    }
  }

  showContato() {
    const content = document.getElementById('contato-content');
    if (content) {
      content.classList.remove('hidden');
      this.renderContato();
    }
  }

  renderCasasRegulamentadas() {
    const container = document.getElementById('casas-regulamentadas-content');
    if (!container) return;

    container.innerHTML = `
      <div class="container">
        <div id="casas-content"></div>
      </div>
    `;

    // Inicializa o conteúdo da página
    if (this.casasRegulamentadas) {
      setTimeout(() => {
        this.casasRegulamentadas.onPageActivated();
      }, 100);
    }
  }

  renderSobre() {
    const container = document.getElementById('sobre-content');
    if (!container) return;

    container.innerHTML = `
      <div class="container">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-content">
            <h1 class="hero-title">Shark 100% Green</h1>
            <p class="hero-subtitle">
              Sistema profissional de calculadoras matemáticas para otimização de apostas esportivas e arbitragem
            </p>
            
            <div class="hero-stats">
              <div class="stat-item">
                <div class="stat-number">100%</div>
                <div class="stat-label">Precisão Matemática</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">2</div>
                <div class="stat-label">Calculadoras Avançadas</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">2500+</div>
                <div class="stat-label">Usuários Ativos</div>
              </div>
            </div>
          </div>
        </div>

        <!-- O que é o Shark Green -->
        <section class="about-section">
          <h2 class="section-title">🦈 O que é o Shark 100% Green?</h2>
          <div class="about-content">
            <p>
              É o grupo que te mostra, de forma <strong>100% mastigada</strong>, como lucrar com apostas esportivas 
              e promoções de casas de aposta — mesmo sem entender nada!
            </p>
            
            <div class="features-grid">
              <div class="feature-card">
                <div class="feature-icon">🎯</div>
                <h3>Cashback</h3>
                <p>Maximize seus retornos</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">🔥</div>
                <h3>Super Odds</h3>
                <p>Aproveite as melhores cotações</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">🎁</div>
                <h3>Apostas Grátis</h3>
                <p>Otimize seus freebets</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">🎰</div>
                <h3>Giros Grátis</h3>
                <p>Aproveite promoções de casino</p>
              </div>
            </div>
          </div>
        </section>

        <!-- O que oferecemos -->
        <section class="offerings-section">
          <h2 class="section-title">📚 O que a gente te dá:</h2>
          <div class="offerings-grid">
            <div class="offering-card">
              <div class="offering-icon">📄</div>
              <h3>Instruções passo a passo</h3>
              <p>Guias detalhados e fáceis de seguir</p>
            </div>
            <div class="offering-card">
              <div class="offering-icon">🖼</div>
              <h3>Imagens explicativas</h3>
              <p>Tutoriais visuais para melhor compreensão</p>
            </div>
            <div class="offering-card">
              <div class="offering-icon">🔗</div>
              <h3>Links diretos</h3>
              <p>Acesso direto para cada promoção</p>
            </div>
            <div class="offering-card">
              <div class="offering-icon">📽</div>
              <h3>Vídeos tutoriais</h3>
              <p>Explicações simples em vídeo</p>
            </div>
            <div class="offering-card">
              <div class="offering-icon">🧑‍💻</div>
              <h3>Suporte rápido</h3>
              <p>Resposta rápida para tirar dúvidas</p>
            </div>
          </div>
        </section>

        <!-- Requisitos -->
        <section class="requirements-section">
          <h2 class="section-title">✅ Você só precisa de 3 coisas:</h2>
          <div class="requirements-grid">
            <div class="requirement-card">
              <div class="requirement-number">1</div>
              <h3>Um celular com internet</h3>
              <p>Simples assim, só isso</p>
            </div>
            <div class="requirement-card">
              <div class="requirement-number">2</div>
              <h3>Saber copiar e colar</h3>
              <p>Básico de tecnologia</p>
            </div>
            <div class="requirement-card">
              <div class="requirement-number">3</div>
              <h3>Vontade de mudar de vida</h3>
              <p>O mais importante de tudo</p>
            </div>
          </div>
        </section>

        <!-- Calculadoras -->
        <section class="calculators-section">
          <h2 class="section-title">🧮 Nossas Calculadoras</h2>
          <div class="calculators-grid">
            <div class="calculator-card">
              <h3>ArbiPro</h3>
              <p>Calculadora profissional de arbitragem para garantir lucro em qualquer resultado</p>
              <ul>
                <li>Suporte para até 6 casas</li>
                <li>Cálculo de comissões</li>
                <li>Otimização de stakes</li>
                <li>Suporte a lay bets</li>
              </ul>
            </div>
            <div class="calculator-card">
              <h3>FreePro</h3>
              <p>Especializada em otimização de freebets e promoções específicas</p>
              <ul>
                <li>Maximização de freebets</li>
                <li>Cálculo de extrações</li>
                <li>Estratégias de cobertura</li>
                <li>Análise de cenários</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- CTA -->
        <div class="cta-section">
          <h2>💥 Se você seguir o que a gente ensina, o lucro vem. Ponto final.</h2>
          <p>Comece agora mesmo com nossas calculadoras profissionais</p>
          <button class="btn btn-primary btn-cta" onclick="window.SharkGreen.navigation?.navigateTo('calculadoras')">
            Usar Calculadoras Agora
          </button>
        </div>
      </div>
    `;
  }

  renderContato() {
    const container = document.getElementById('contato-content');
    if (!container) return;

    container.innerHTML = `
      <div class="container">
        <!-- Hero -->
        <div class="contact-hero">
          <div class="hero-content">
            <h1 class="hero-title">📞 Entre em Contato</h1>
            <p class="hero-subtitle">
              O único grupo VIP do Brasil que realmente entrega lucro consistente em arbitragem de bônus. Suporte personalizado e resultados comprovados.
            </p>
          </div>
        </div>

        <!-- Canais Principais -->
        <section class="contact-channels">
          <h2 class="section-title">🌟 Canais Principais</h2>
          <div class="channels-grid">
            
            <!-- Telegram -->
            <div class="channel-card telegram">
              <div class="channel-icon">
                <img src="assets/images/telegrama.png" alt="Telegram" width="48" height="48">
              </div>
              <div class="channel-content">
                <h3>Grupo Telegram FREE</h3>
                <p>Comunidade ativa com +2500 membros</p>
                <div class="channel-benefits">
                  <span>✅ Estratégias gratuitas</span>
                  <span>✅ Comunidade ativa</span>
                  <span>✅ Suporte da equipe</span>
                </div>
                <a href="https://t.me/+M1SY4YU6T-pjYWQx" target="_blank" class="channel-btn">
                  Entrar no Grupo
                </a>
              </div>
            </div>

            <!-- Instagram -->
            <div class="channel-card instagram">
              <div class="channel-icon">
                <img src="assets/images/instagram.png" alt="Instagram" width="48" height="48">
              </div>
              <div class="channel-content">
                <h3>Instagram Oficial</h3>
                <p>Conteúdo exclusivo e novidades</p>
                <div class="channel-benefits">
                  <span>✅ Conteúdo visual</span>
                  <span>✅ Stories diárias</span>
                  <span>✅ Dicas rápidas</span>
                </div>
                <a href="https://www.instagram.com/_sharkgreen" target="_blank" class="channel-btn">
                  Seguir @_sharkgreen
                </a>
              </div>
            </div>

            <!-- YouTube -->
            <div class="channel-card youtube">
              <div class="channel-icon">
                <img src="assets/images/youtube.png" alt="YouTube" width="48" height="48">
              </div>
              <div class="channel-content">
                <h3>Canal YouTube</h3>
                <p>Tutoriais em vídeo e conteúdo exclusivo</p>
                <div class="channel-benefits">
                  <span>✅ Vídeos tutoriais</span>
                  <span>✅ Estratégias visuais</span>
                  <span>✅ Lives exclusivas</span>
                </div>
                <a href="https://www.youtube.com/@sharkuniverse" target="_blank" class="channel-btn">
                  Assistir Canal
                </a>
              </div>
            </div>

          </div>
        </section>

        <!-- Suporte Especializado -->
        <section class="support-section">
          <h2 class="section-title">🛠️ Suporte Especializado</h2>
          <div class="support-grid">
            
            <div class="support-card">
              <div class="support-icon">📋</div>
              <div class="support-content">
                <h3>Suporte Procedimentos</h3>
                <p>Dúvidas sobre estratégias e procedimentos</p>
                <div class="support-features">
                  <span>⏱️ Resposta em até 5 minutos</span>
                  <span>🎯 Especialistas em arbitragem</span>
                  <span>📚 atendimento personalizado</span>
                </div>
                <a href="https://t.me/SuporteSharkGreen_procedimentos" target="_blank" class="support-btn">
                  Abrir Suporte
                </a>
              </div>
            </div>

            <div class="support-card">
              <div class="support-icon">💰</div>
              <div class="support-content">
                <h3>Suporte Financeiro</h3>
                <p>Questões sobre pagamentos e assinaturas</p>
                <div class="support-features">
                  <span>💳 Pagamentos</span>
                  <span>🔄 Renovações e upgrades</span>
                  <span>📊 Planos e preços</span>
                </div>
                <a href="https://t.me/SuporteSharkGreen_financeiro" target="_blank" class="support-btn">
                  Abrir Suporte
                </a>
              </div>
            </div>

          </div>
        </section>

        <!-- Email Direto -->
        <section class="email-contact">
          <div class="email-card">
            <div class="email-icon">📧</div>
            <div class="email-content">
              <h3>Contato Direto por E-mail</h3>
              <p>Para questões específicas ou parcerias comerciais</p>
              <a href="mailto:sharkgreenvip@hotmail.com" class="email-link">
                sharkgreenvip@hotmail.com
              </a>
            </div>
          </div>
        </section>

        <!-- CTA Final -->
        <div class="cta-section">
          <h2>🚀 Pronto para começar?</h2>
          <p>Acesse nossas calculadoras profissionais agora mesmo</p>
          <button class="btn btn-primary btn-cta" onclick="window.SharkGreen.navigation?.navigateTo('calculadoras')">
            Usar Calculadoras
          </button>
        </div>
      </div>
    `;
  }
}
