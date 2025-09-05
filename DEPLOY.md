# Deploy no EasyPanel

Este guia explica como fazer o deploy do Sistema de Filas de Atendimento no EasyPanel usando Docker.

## 📋 Pré-requisitos

- Conta no EasyPanel
- Repositório GitHub configurado
- Banco de dados MySQL disponível

## 🚀 Deploy no EasyPanel

### 1. Configurar o Projeto

1. Acesse o EasyPanel
2. Clique em "New Project"
3. Selecione "Git Repository"
4. Cole a URL do repositório: `https://github.com/cezarfreitas/roleta-inteli.git`
5. Escolha a branch `master`

### 2. Configurar o Build

- **Build Context**: `/` (raiz do projeto)
- **Dockerfile**: `Dockerfile`
- **Build Command**: (deixe vazio, o Dockerfile já tem tudo configurado)

### 3. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente no EasyPanel:

```bash
# Banco de Dados
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=sistema_fila

# Autenticação JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password

# API de Leads (SprintHub)
LEAD_API_ID=grupointeli
LEAD_API_TOKEN=your-lead-api-token

# Next.js
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
```

### 4. Configurar Porta

- **Port**: `3000`
- **Protocol**: `HTTP`

### 5. Configurar Domínio (Opcional)

- Adicione seu domínio personalizado se desejar
- Configure SSL/TLS se necessário

## 🗄️ Configuração do Banco de Dados

### Opção 1: MySQL Externo

Se você já tem um MySQL externo:

1. Configure as variáveis `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
2. Execute os scripts de inicialização do banco manualmente

### Opção 2: MySQL no EasyPanel

1. Crie um novo projeto MySQL no EasyPanel
2. Configure as variáveis de ambiente para apontar para o MySQL
3. Execute os scripts de inicialização

### Scripts de Inicialização do Banco

Execute os seguintes comandos SQL no seu banco MySQL:

```sql
-- Criar tabela de configurações
CREATE TABLE IF NOT EXISTS configuracoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT,
  descricao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir configurações iniciais
INSERT INTO configuracoes (chave, valor, descricao) VALUES
('lead_api_id', 'grupointeli', 'ID da API de leads'),
('lead_api_token', 'e24be9a5-c50d-44a6-8128-e21ab15e63af', 'Token da API de leads')
ON DUPLICATE KEY UPDATE valor = VALUES(valor);

-- Criar tabela de logs de webhook
CREATE TABLE IF NOT EXISTS webhook_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fila_id INT,
  usuario_id INT,
  lead_id INT,
  acao VARCHAR(100),
  dados_antes JSON,
  dados_depois JSON,
  user_access_antes JSON,
  user_access_depois JSON,
  owner_antes VARCHAR(100),
  owner_depois VARCHAR(100),
  status VARCHAR(50),
  erro TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configurações Avançadas

### Health Check

O EasyPanel pode configurar health checks automáticos:
- **Path**: `/api/health` (se implementado)
- **Interval**: 30s
- **Timeout**: 10s

### Recursos

- **CPU**: Mínimo 0.5 vCPU
- **RAM**: Mínimo 512MB
- **Storage**: Mínimo 1GB

### Auto Deploy

Configure auto deploy para:
- Branch: `master`
- Trigger: Push events

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verifique as variáveis de ambiente do banco
   - Confirme se o banco está acessível

2. **Build falha**
   - Verifique se o Dockerfile está na raiz
   - Confirme se todas as dependências estão no package.json

3. **Aplicação não inicia**
   - Verifique os logs no EasyPanel
   - Confirme se a porta 3000 está configurada

### Logs

Acesse os logs no EasyPanel em:
- **Project** → **Logs**
- Filtre por nível (Error, Warning, Info)

## 📞 Suporte

Para problemas específicos do EasyPanel, consulte:
- [Documentação do EasyPanel](https://easypanel.io/docs)
- [Suporte do EasyPanel](https://easypanel.io/support)

## 🔄 Atualizações

Para atualizar a aplicação:

1. Faça push das alterações para o GitHub
2. O EasyPanel fará auto deploy (se configurado)
3. Ou faça deploy manual no painel

## 📊 Monitoramento

Configure monitoramento básico:
- **Uptime**: Verificação de disponibilidade
- **Performance**: Tempo de resposta
- **Logs**: Análise de erros e warnings
