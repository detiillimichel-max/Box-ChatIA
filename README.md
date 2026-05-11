# 🚀 Multimodal AI App - Glassmorphism Edition

Este é um aplicativo PWA (Progressive Web App) Full Stack avançado, projetado para oferecer uma experiência de chat multimodal (texto e voz) com inteligência artificial, utilizando os modelos mais recentes do Google Gemini.

O projeto foca em uma interface limpa, modular e com estética profissional baseada no design **Glassmorphism**, otimizado para uso e desenvolvimento diretamente em dispositivos móveis.

---

## 🛠️ Stack Tecnológico

O projeto foi estruturado de forma modular, separando o cliente (front-end) e o servidor (back-end).

### 🖥️ Front-end (Client)
- **Framework:** [React](https://reactjs.org/) com [Vite](https://vitejs.dev/) (para alto desempenho).
- **Linguagem:** TypeScript.
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com suporte nativo a componentes Glassmorphism.
- **Multimodalidade:** Integração com Web Speech API (Voz) e Google Gemini API.

### ⚙️ Back-end (Server)
- **Runtime:** Node.js.
- **Banco de Dados:** PostgreSQL.
- **ORM (Object-Relational Mapping):** [Drizzle ORM](https://orm.drizzle.team/) (para manipulação segura e modular de dados).
- **Segurança:** Autenticação local integrada via banco de dados.

---

## 📂 Estrutura do Projeto

A arquitetura modular garante que o código seja organizado e fácil de manter.

```text
/
├── client/          # Todo o código do front-end (React)
│   ├── src/
│   │   ├── components/ # Componentes de interface (UI)
│   │   ├── services/   # Funções de chamada de API (Gemini, Voice)
│   │   └── hooks/      # Lógica de estado reutilizável
├── server/          # Código do back-end (API, DB)
│   ├── db/          # Configurações do banco e esquemas (Drizzle)
│   └── routes/      # Rotas da API
├── drizzle/         # Arquivos de migração do banco de dados
└── README.md        # Documentação principal

