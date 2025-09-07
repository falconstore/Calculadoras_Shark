# FreePro - Calculadoras Profissionais

Sistema profissional para otimização de apostas esportivas com calculadoras de arbitragem e freebets.

## 🚀 Funcionalidades

- **ArbiPro**: Calculadora de arbitragem para garantir lucro em qualquer resultado
- **FreePro**: Otimização de freebets e estratégias de apostas seguras
- **Sistema de Autenticação**: Login seguro com Firebase
- **Assinaturas**: Controle de acesso com diferentes planos
- **Interface Responsiva**: Funciona perfeitamente em desktop e mobile
- **Tema Claro/Escuro**: Alternância de temas para melhor experiência

## 📁 Estrutura do Projeto

```
freepro/
├── index.html              # Página principal
├── assets/
│   ├── css/                # Estilos CSS modulares
│   │   ├── base.css        # Estilos base e variáveis
│   │   ├── components.css  # Componentes UI
│   │   ├── themes.css      # Sistema de temas
│   │   └── responsive.css  # Design responsivo
│   └── js/                 # Scripts JavaScript
│       ├── config/         # Configurações (Firebase)
│       ├── auth/          # Sistema de autenticação
│       ├── calculators/   # Lógica das calculadoras
│       ├── ui/            # Interface e temas
│       └── main.js        # Controlador principal
├── components/            # Templates HTML
│   ├── auth/             # Telas de login/planos
│   └── calculators/      # Interface das calculadoras
└── docs/                 # Documentação
```

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Firebase Firestore
- **Build**: Módulos ES6 nativos
- **Hosting**: GitHub Pages / Netlify
- **Design**: CSS Grid, Flexbox, CSS Variables

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/freepro.git
cd freepro
```

2. Configure o Firebase:
   - Crie um projeto no Firebase Console
   - Configure o Firestore
   - Atualize as credenciais em `assets/js/config/firebase.js`

3. Sirva os arquivos através de um servidor HTTP:
```bash
# Usando Python
python -m http.server 8000

# Usando Node.js live-server
npx live-server

# Usando PHP
php -S localhost:8000
```

## 🔧 Configuração

### Firebase Setup

1. Crie uma coleção `users` no Firestore
2. Estrutura de documento do usuário:
```json
{
  "email": "usuario@email.com",
  "password": "senha_hash",
  "status": "active",
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "plan": "monthly"
}
```

### Variáveis de Ambiente

Configure as credenciais do Firebase em `assets/js/config/firebase.js`

## 📱 Uso

1. **Login**: Acesse com email e senha cadastrados
2. **Calculadora ArbiPro**: 
   - Insira as odds das casas de apostas
   - Configure comissões e freebets
   - Visualize a distribuição de stakes otimizada
3. **Calculadora FreePro**:
   - Defina parâmetros da promoção
   - Configure mercados de cobertura
   - Obtenha estratégias de maximização de lucro

## 🚀 Deploy

### GitHub Pages
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### Netlify
- Conecte o repositório GitHub
- Configure build command: (nenhum)
- Diretório de publicação: `/` (raiz)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- Email: suporte@freepro.com
- Discord: [FreePro Community](https://discord.gg/freepro)
- Issues: [GitHub Issues](https://github.com/seu-usuario/freepro/issues)

## 🔄 Changelog

### v2.0.0 (2025-01-15)
- Refatoração completa para arquitetura modular
- Separação em módulos ES6
- Melhor organização de código
- Performance aprimorada

### v1.0.0 (2024-12-01)
- Versão inicial com calculadoras integradas
- Sistema de autenticação
- Interface responsiva
