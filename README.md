# 📦 Backend do Projeto Integrador (UNISAL)

Este repositório contém o código-fonte do backend para o Projeto Integrador, desenvolvido com **NestJS**. Atualmente, já oferece funcionalidades de autenticação de usuários, gerenciamento de contatos e um sistema de alertas de queda que se integra com o **WhatsApp** para notificar contatos de emergência.

---

## 🧭 Visão Geral

O backend aqui é responsável por fazer toda a lógica que será tratada posteriormente

### 🔧 Tecnologias Utilizadas

- **NestJS** – Framework para aplicações Node.js
- **Prisma ORM** – Acesso ao banco de dados com TypeScript
- **JWT** – Autenticação segura com JSON Web Tokens
- **WhatsApp Web.js** – Integração com WhatsApp
- **GraphQL (Apollo Server)** – API flexível via GraphQL
- **OpenCage Geocoding API** – Geolocalização reversa

---

## 📁 Estrutura do Projeto

```text
.
├── src/
│   ├── alerts/              # Alertas de queda
│   ├── auth/                # Autenticação (registro, login)
│   ├── baileys/             # Serviço WhatsApp
│   ├── contacts/            # Contatos de emergência
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── main.ts
│   └── prisma.service.ts
├── test/                    # Testes end-to-end
├── .env.example             # Variáveis de ambiente (exemplo)
├── .gitignore
├── eslint.config.mjs
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```


# 🚀 Primeiros Passos

## ✅ Requisitos

- Node.js `v20+`
- Yarn ou npm
- PostgreSQL ou outro banco compatível
- Conta ativa no WhatsApp
- Chave da API OpenCage

---

## 📥 Clonando o Repositório

```bash
git clone https://github.com/gabrieldiassantiago/backend-projeto-integrador.git
cd backend-projeto-integrador
```

# 📦 Instalando Dependências

```bash
# Com Yarn
yarn install

# Com npm
npm install
```


---

# ⚙️ Configurando Ambiente
Crie um arquivo `.env` com base no `.env.example`:

```markdown


DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"
JWT_SECRET="sua-chave-secreta-jwt"
PORT=3000
OPENCAGE_API_KEY="sua-chave-api-opencage"
```

ℹ️ A chave da OpenCage está atualmente no código (alerts.service.ts). Ainda vamos manter ela lá...

# ▶️ Rodando o Projeto

## Modo Desenvolvimento

```bash
yarn start:dev
# ou
npm run start:dev
```


# 🤳 Conectar ao WhatsApp

Para iniciar o backend (o serviço de conexão), você deverá ler o Qrcode que será gerado no terminal, após isso, a sessão será salva em /auth



---

# 🔐 Endpoints de Autenticação

Algumas coisas ainda vão ser refatoradas.. caso alguém tiver sugestões, pode deixar também

```markdown

| Método | Rota             | Descrição            |
|--------|------------------|---------------------|
| POST   | `/auth/register` | Cria novo usuário    |
| POST   | `/auth/login`    | Autentica usuário    |
| GET    | `/auth/profile`  | Retorna usuário logado|
```

# 🚨 Endpoints de Alertas
```markdown
| Método | Rota                  | Descrição                         |
|--------|-----------------------|----------------------------------|
| POST   | `/alerts`             | Cria e envia alerta de queda     |
| GET    | `/alerts/testar-fila` | Testa fila com múltiplos alertas (dev) |
```
Aviso: a rota testar-fila pode dar bug se colocar um valor alto demais (pode até perder o zap zap)

## 🔌 Endpoint GraphQL

Além dos endpoints REST, o backend agora expõe um endpoint GraphQL disponível em `/graphql`.
Você pode acessar o playground para testar consultas e mutações.

Exemplo de consulta:

```graphql
query {
  hello
}
```

# 📌 Observações Importantes

- `reverseGeocode()` está lenta → precisa de otimização.  
- O parâmetro `confidence` ainda não está sendo usado corretamente.  
- Expiração do JWT está em 24h → precisa ser ajustado pois o idoso não consegue fazer a autenticação por conta própria
- Minha intenção é alterar o serviço de WhatsApp para o `Baileys`, mas sem sucesso ainda, preciso estudar mais a documentação deles, é bem abstrata...

# 🤝 Contribuição

Para poder usar o mesmo repo que o meu, você pode abrir um Pull e enviar para poder contribuir com o código

- Abrir uma issue  
- Enviar um Pull Request  
- Sugerir melhorias  
