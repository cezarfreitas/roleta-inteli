# Sistema de Fila Administrativo

Sistema web completo para gerenciamento de filas com webhooks, construído em Next.js e MySQL.

## 🚀 Funcionalidades

- **Gestão de Usuários**: Cadastro, edição e remoção de usuários
- **Sistema de Fila**: Controle automático de posições e status
- **Webhooks**: Notificações automáticas para sistemas externos
- **Painel Administrativo**: Interface moderna e responsiva
- **Histórico Completo**: Logs de todas as operações e webhooks
- **Tempo Real**: Atualizações automáticas da fila

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Banco de Dados**: MySQL
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React
- **HTTP Client**: Axios

## 📋 Pré-requisitos

- Node.js 18+ 
- MySQL 8.0+
- npm ou yarn

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd sistema-fila-admin
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados
Crie um arquivo `.env.local` na raiz do projeto:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=sistema_fila
WEBHOOK_URL=http://localhost:3001/webhook
```

### 4. Execute as migrações
```bash
npm run db:migrate
```

### 5. (Opcional) Insira dados de exemplo
```bash
npm run db:seed
```

### 6. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3000`

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **usuarios**: Cadastro de usuários
- **fila**: Controle de posições e status
- **webhooks**: Histórico de webhooks enviados
- **configuracoes**: Configurações do sistema

### Status da Fila

- `aguardando`: Usuário aguardando ser chamado
- `em_processamento`: Usuário sendo atendido
- `finalizado`: Usuário finalizado
- `pulado`: Usuário pulado da fila

## 🔧 Uso do Sistema

### 1. Cadastrar Usuários
- Clique em "Novo Usuário" no header
- Preencha nome, email e telefone (opcional)
- O usuário é automaticamente inserido na fila

### 2. Gerenciar a Fila
- **Chamar Próximo**: Chama o próximo usuário aguardando
- **Finalizar**: Marca usuário como finalizado
- **Pular**: Pula o usuário atual

### 3. Configurar Webhooks
- Acesse a aba "Configurações"
- Configure a URL do webhook
- Ajuste timeout e tentativas

### 4. Monitorar Webhooks
- Visualize histórico na aba "Webhooks"
- Reenvie webhooks falhados
- Acompanhe estatísticas de sucesso/falha

## 📡 Sistema de Webhooks

### Payload Enviado
```json
{
  "tipo": "usuario_chamado",
  "usuario": {
    "id": 123,
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "(11) 99999-1111"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Configurações
- **URL do Webhook**: Endpoint para receber notificações
- **Timeout**: Tempo limite para resposta (ms)
- **Tentativas**: Máximo de tentativas para reenvio

## 🏗️ Estrutura do Projeto

```
sistema-fila-admin/
├── app/                    # Next.js App Router
│   ├── api/               # APIs do backend
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── UsuariosTab.tsx    # Aba de usuários
│   ├── FilaTab.tsx        # Aba de fila
│   ├── WebhooksTab.tsx    # Aba de webhooks
│   ├── ConfiguracoesTab.tsx # Aba de configurações
│   ├── NovoUsuarioModal.tsx  # Modal novo usuário
│   └── EditarUsuarioModal.tsx # Modal editar usuário
├── lib/                   # Bibliotecas e utilitários
│   ├── database.ts        # Conexão MySQL
│   └── webhook.ts         # Gerenciamento de webhooks
├── scripts/               # Scripts de banco
│   ├── migrate.js         # Criação das tabelas
│   └── seed.js            # Dados de exemplo
├── package.json           # Dependências
├── tailwind.config.js     # Configuração Tailwind
└── README.md              # Este arquivo
```

## 🔄 Scripts Disponíveis

- `são singronizados npm run dev`: Servidor de desenvolvimento
- `npm run build`: Build de produção
- `npm run start`: Servidor de produção
- `npm run db:migrate`: Executar migrações
- `npm run db:seed`: Inserir dados de exemplo

## 🌐 APIs Disponíveis

### Usuários
- `GET /api/usuarios` - Listar usuários
- `POST /api/usuarios` - Criar usuário
- `GET /api/usuarios/[id]` - Buscar usuário
- `PUT /api/usuarios/[id]` - Atualizar usuário
- `DELETE /api/usuarios/[id]` - Deletar usuário

### Fila
- `GET /api/fila` - Listar fila
- `POST /api/fila` - Gerenciar fila (chamar, finalizar, pular)

### Webhooks
- `GET /api/webhooks` - Listar webhooks
- `POST /api/webhooks/[id]/reenviar` - Reenviar webhook

### Configurações
- `GET /api/configuracoes` - Listar configurações
- `PUT /api/configuracoes` - Atualizar configuração

## 🚀 Deploy

### Build de Produção
```bash
npm run build
npm run start
```

### Variáveis de Ambiente para Produção
```env
NODE_ENV=production
DB_HOST=seu_host_mysql
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=sistema_fila
WEBHOOK_URL=https://seu-dominio.com/webhook
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Confirme a conexão com o MySQL
3. Verifique as configurações de webhook
4. Abra uma issue no repositório

## 🔮 Próximas Funcionalidades

- [ ] Autenticação de usuários
- [ ] Múltiplas filas
- [ ] Notificações push
- [ ] Relatórios e estatísticas
- [ ] API para integração externa
- [ ] Sistema de permissões
