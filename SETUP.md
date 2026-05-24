# Box-ChatIA - Setup e Funcionamento

## 🎯 Arquitetura Reconectada

O projeto foi reestruturado para funcionar de **ponta a ponta** com uma arquitetura modular e limpa:

### Fluxo de Funcionamento

```
Frontend (ChatPage.tsx)
    ↓
    └─→ trpc.chat.sendMessage()
        ↓
        └─→ Backend (server/routers/chat.ts)
            ↓
            └─→ Groq/Llama (server/groq.ts)
                ↓
                └─→ Resposta salva no banco de dados
                    ↓
                    └─→ Retorna ao frontend
```

### Componentes Principais

| Arquivo | Responsabilidade |
|---------|------------------|
| `client/src/pages/ChatPage.tsx` | Interface Dark/Glassmorphism, entrada do usuário |
| `server/routers/chat.ts` | Endpoints tRPC para envio de mensagens |
| `server/groq.ts` | Integração com Groq/Llama |
| `server/db.ts` | Persistência de histórico de chat |
| `server/_core/index.ts` | Servidor Express + tRPC |

## 🚀 Setup Inicial

### 1. Clonar o Repositório
```bash
git clone https://github.com/detiillimichel-max/Box-ChatIA.git
cd Box-ChatIA
```

### 2. Instalar Dependências
```bash
pnpm install
```

### 3. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:

```env
# Obtenha em https://console.groq.com/
GROQ_API_KEY=your_groq_api_key_here

# Banco de dados MySQL
DATABASE_URL=mysql://user:password@localhost:3306/box_chatia

# OAuth (Manus)
VITE_APP_ID=your_app_id_here
OAUTH_SERVER_URL=https://oauth.manus.im
JWT_SECRET=seu_jwt_secret_aleatorio

# Opcional: ElevenLabs para áudio
# ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

### 4. Configurar Banco de Dados
```bash
pnpm run db:push
```

### 5. Iniciar o Servidor
```bash
pnpm run dev
```

O servidor estará disponível em `http://localhost:3000`

## 🔄 Fluxo de Autenticação

1. Usuário clica em "Login"
2. Redireciona para OAuth (Manus)
3. Retorna com `code` para `/api/oauth/callback`
4. Cria sessão JWT em cookie
5. Frontend carrega `useAuth()` e acessa `trpc.chat.*`

## 💬 Fluxo de Chat

1. **Usuário digita mensagem** → `ChatPage.tsx`
2. **Frontend envia** → `trpc.chat.sendMessage()`
3. **Backend processa** → `server/routers/chat.ts`
4. **Groq/Llama responde** → `server/groq.ts`
5. **Salva no banco** → `server/db.ts`
6. **Retorna ao frontend** → Exibe na tela

## 🎨 Interface Dark/Glassmorphism

A interface usa:
- **Gradientes**: `from-background via-background to-background/80`
- **Glassmorphism**: `bg-card/30 backdrop-blur-xl`
- **Borders**: `border-white/10`
- **Animações**: Transições suaves com `transition-all`

## 🧪 Testes

```bash
# Rodar testes
pnpm run test

# Type checking
pnpm run check

# Formatar código
pnpm run format
```

## 📦 Build para Produção

```bash
pnpm run build
pnpm run start
```

## 🐛 Troubleshooting

### "GROQ_API_KEY não configurada"
- Verifique se `.env` contém `GROQ_API_KEY`
- Obtenha em https://console.groq.com/

### "Erro de autenticação"
- Certifique-se que `OAUTH_SERVER_URL` está correto
- Verifique se `VITE_APP_ID` é válido

### "Erro ao conectar com banco de dados"
- Verifique se MySQL está rodando
- Confirme `DATABASE_URL` em `.env`

## 📝 Estrutura de Pastas Mantida

```
Box-ChatIA/
├── client/                 # Frontend React
│   └── src/
│       ├── pages/         # Páginas (ChatPage)
│       ├── components/    # Componentes UI
│       └── hooks/         # Hooks customizados
├── server/                # Backend Express
│   ├── _core/            # Núcleo (auth, context, etc)
│   ├── routers/          # Endpoints tRPC
│   ├── groq.ts           # Integração Groq/Llama
│   └── db.ts             # Acesso ao banco
├── shared/               # Código compartilhado
├── drizzle/              # Migrações do banco
└── CSS/                  # Estilos globais
```

## ✅ Verificação de Funcionamento

1. Acesse `http://localhost:3000`
2. Faça login via OAuth
3. Digite uma mensagem
4. Verifique se a resposta vem do Groq/Llama
5. Confirme que o histórico é salvo no banco

---

**Tudo está conectado. Nada de arquivos vazios. Apenas código que funciona.** ✨
