# 🎸 Underground Wiki API

Uma API REST para uma Wikipedia colaborativa dedicada a artistas underground e independentes. Qualquer pessoa pode ler sobre os artistas, mas para contribuir com artigos é necessário criar uma conta.

## 🛠 Tecnologias

- **Node.js** + **Express** — servidor HTTP
- **Prisma** — ORM
- **MySQL** — banco de dados relacional
- **bcryptjs** — hash de senhas
- **jsonwebtoken** — autenticação JWT
- **dotenv** — variáveis de ambiente
- **Nodemon** — reinício automático em desenvolvimento
- **cors** — liberação de origens para o futuro frontend

---

## 📦 Como instalar e rodar localmente

### Pré-requisitos
- Node.js 18+
- MySQL rodando localmente (ou Docker)

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/underground-wiki-api.git
cd underground-wiki-api

# 2. Instale as dependências
npm install

# 3. Configure o ambiente
cp .env.example .env
# Edite o .env com suas credenciais do MySQL e um JWT_SECRET seguro

# 4. Crie o banco de dados no MySQL
# (via MySQL Workbench, DBeaver, ou terminal)
# CREATE DATABASE underground_wiki;

# 5. Rode as migrations do Prisma
npm run db:migrate

# 6. Inicie o servidor em modo desenvolvimento
npm run dev
```

O servidor estará rodando em `http://localhost:3333`

---

## 🗂 Estrutura do projeto

```
underground-wiki/
├── prisma/
│   └── schema.prisma          # Modelos e relações do banco
├── src/
│   ├── server.js              # Entrada da aplicação
│   ├── lib/
│   │   └── prisma.js          # Instância do Prisma Client
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── artist.routes.js
│   │   ├── article.routes.js
│   │   └── user.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── artist.controller.js
│   │   ├── article.controller.js
│   │   └── user.controller.js
│   └── middlewares/
│       └── auth.middleware.js  # Validação do JWT
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🔗 Endpoints

### 🔐 Autenticação — `/api/auth`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/register` | ❌ | Cria uma nova conta |
| POST | `/api/auth/login` | ❌ | Faz login e retorna token JWT |
| GET | `/api/auth/me` | ✅ | Retorna o usuário logado |

**Exemplo — Register:**
```json
POST /api/auth/register
{
  "username": "joaorock",
  "email": "joao@email.com",
  "password": "senha123"
}
```

---

### 🎵 Artistas — `/api/artists`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/artists` | ❌ | Lista artistas (paginado, filtrável por `search` e `genre`) |
| GET | `/api/artists/:slug` | ❌ | Retorna um artista com seus artigos |
| POST | `/api/artists` | ✅ | Cria um novo artista |
| PUT | `/api/artists/:slug` | ✅ | Atualiza dados de um artista |
| DELETE | `/api/artists/:slug` | ✅ | Remove um artista |

**Query params em GET /api/artists:**
- `search` — busca por nome ou bio
- `genre` — filtra por gênero
- `page` — número da página (padrão: 1)
- `limit` — itens por página (padrão: 20)

**Exemplo — Criar artista:**
```json
POST /api/artists
Authorization: Bearer <token>
{
  "name": "The Microphones",
  "genre": "Lo-fi / Folk",
  "origin": "Olympia, WA, EUA",
  "formedYear": 1996,
  "bio": "Projeto solo de Phil Elverum..."
}
```

---

### 📝 Artigos — `/api/articles`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/articles` | ❌ | Lista artigos publicados (filtrável por `artistId`) |
| GET | `/api/articles/:id` | ❌ | Retorna um artigo com histórico de edições |
| POST | `/api/articles` | ✅ | Cria um novo artigo sobre um artista |
| PUT | `/api/articles/:id` | ✅ | Edita um artigo (somente o autor) |
| DELETE | `/api/articles/:id` | ✅ | Remove (soft delete) um artigo (somente o autor) |

---

### 👤 Usuários — `/api/users`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/users/:username` | ❌ | Perfil público de um usuário com seus artigos |
| PUT | `/api/users/me/profile` | ✅ | Atualiza username, email ou senha |
| DELETE | `/api/users/me/account` | ✅ | Deleta a própria conta (requer senha) |

---

## 🔒 Autenticação

Rotas protegidas requerem o header:
```
Authorization: Bearer <seu_token_jwt>
```

O token é retornado no body do `/register` e do `/login`.

---

## 🗃 Modelos do banco

- **User** — `id, username, email, password, createdAt`
- **Artist** — `id, name, slug, genre, origin, formedYear, bio, imageUrl`
- **Article** — `id, title, content, published, authorId, artistId, createdAt`
- **Edit** — `id, summary, editorId, articleId, createdAt` *(histórico de edições)*
