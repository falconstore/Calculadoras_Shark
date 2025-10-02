# 📦 Como Baixar e Fazer Deploy no GitHub

## 🔽 Baixar o Projeto

### Opção 1: Via Lovable (Recomendado)

1. **Clique no botão GitHub** no canto superior direito do editor Lovable
2. **Conecte sua conta GitHub** (se ainda não conectou)
3. **Clique em "Push to GitHub"** ou "Create Repository"
4. O Lovable vai criar automaticamente um repositório no seu GitHub

### Opção 2: Download Manual

1. **No Lovable:**
   - Clique no menu "Project"
   - Selecione "Export Code"
   - Baixe o arquivo ZIP

2. **No seu computador:**
   ```bash
   # Extraia o ZIP
   unzip shark-calculadoras.zip
   cd shark-calculadoras
   
   # Instale as dependências
   npm install
   
   # Teste localmente
   npm run dev
   ```

## 📤 Subir para o GitHub

### Se já tem repositório local:

```bash
# Inicialize o Git (se necessário)
git init

# Adicione o remote do seu repositório
git remote add origin https://github.com/falconstore/sharkdev.git

# Ou renomeie para novo repositório
git remote set-url origin https://github.com/seu-usuario/shark-calculadoras.git

# Adicione todos os arquivos
git add .

# Faça o commit
git commit -m "Redesign visual Shark Calculadoras v2.0"

# Envie para o GitHub
git push -u origin main
```

### Se está criando novo repositório:

1. **No GitHub:**
   - Vá em: https://github.com/new
   - Nome: `shark-calculadoras`
   - Descrição: "Calculadoras profissionais para apostas esportivas"
   - Público/Privado: conforme preferir
   - Clique em "Create repository"

2. **No terminal:**
   ```bash
   cd shark-calculadoras
   git init
   git add .
   git commit -m "Initial commit - Redesign visual v2.0"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/shark-calculadoras.git
   git push -u origin main
   ```

## 🚀 Deploy no Vercel

### Opção 1: Via GitHub (Automático)

1. Acesse: https://vercel.com/new
2. Importe seu repositório GitHub
3. Configure:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Clique em **Deploy**
5. Pronto! Seu site estará no ar em ~1 minuto

### Opção 2: Via Lovable (Se conectado ao GitHub)

1. No Lovable, clique em **"Publish"** (canto superior direito)
2. Selecione **"Vercel"**
3. Siga as instruções de autenticação
4. Deploy automático!

## 🔗 Configurar Domínio Personalizado

### No Vercel:

1. Vá em: Project Settings > Domains
2. Adicione seu domínio: `calculadoras.seusite.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: calculadoras
   Value: cname.vercel-dns.com
   ```

### Para manter sharkdev.vercel.app:

No seu projeto Vercel:
1. Settings > Domains
2. Adicione: `sharkdev.vercel.app`

## ⚙️ Variáveis de Ambiente (Se necessário)

Se você usar APIs ou Firebase:

```bash
# .env.local
VITE_API_URL=sua-api-url
VITE_FIREBASE_API_KEY=sua-chave
```

No Vercel:
1. Settings > Environment Variables
2. Adicione as variáveis
3. Redeploy o projeto

## 📋 Checklist Antes do Deploy

- [ ] Testar localmente com `npm run dev`
- [ ] Verificar se não há erros de build: `npm run build`
- [ ] Atualizar README.md com informações do projeto
- [ ] Adicionar .env.example (se usar variáveis de ambiente)
- [ ] Testar em diferentes navegadores
- [ ] Testar em dispositivos móveis
- [ ] Verificar meta tags SEO no index.html

## 🔄 Atualizações Futuras

### Workflow Recomendado:

```bash
# 1. Faça suas alterações localmente
# 2. Teste
npm run dev

# 3. Commit
git add .
git commit -m "Descrição da alteração"

# 4. Push para GitHub
git push

# 5. Vercel fará deploy automático!
```

## 📁 Estrutura do Repositório

```
shark-calculadoras/
├── src/
│   ├── components/          # Seus componentes React
│   ├── pages/               # Páginas da aplicação
│   ├── hooks/               # Custom hooks
│   └── lib/                 # Utilitários
├── public/                  # Assets estáticos
├── INTEGRATION_GUIDE.md     # Guia de integração da lógica
├── DESIGN_SYSTEM.md         # Documentação do design
├── DOWNLOAD_AND_DEPLOY.md   # Este arquivo
├── package.json
└── README.md

```

## 🆘 Solução de Problemas

### Build falha no Vercel:

```bash
# Teste localmente primeiro:
npm run build

# Se der erro, verifique:
- TypeScript errors
- Import paths
- Dependencies no package.json
```

### Site não atualiza:

```bash
# Limpe o cache:
git push
# No Vercel: Settings > Clear Cache and Redeploy
```

### Erros no deploy:

1. Verifique os logs do Vercel
2. Compare com build local
3. Verifique variáveis de ambiente

## 📧 Suporte

Se tiver problemas:
1. Verifique os arquivos de documentação
2. Consulte a documentação oficial do Vercel
3. Abra uma issue no GitHub

---

**Boa sorte com o deploy! 🚀**
