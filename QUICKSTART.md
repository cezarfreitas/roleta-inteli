# 🚀 Início Rápido - Sistema de Fila

## ⚡ Setup em 5 minutos

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar banco MySQL
- Crie um banco chamado `sistema_fila`
- Copie `env.example` para `.env.local`
- Ajuste as credenciais do banco

### 3. Executar migrações
```bash
npm run db:migrate
```

### 4. Inserir dados de exemplo (opcional)
```bash
npm run db:seed
```

### 5. Iniciar o sistema
```bash
npm run dev
```

## 🌐 Acessar o sistema
- **URL**: http://localhost:3000
- **Usuários de exemplo**: 5 usuários já cadastrados
- **Fila**: Posições 1-5 configuradas automaticamente

## 🔧 Primeiros passos
1. **Adicionar usuário**: Clique em "Novo Usuário"
2. **Gerenciar fila**: Use a aba "Fila" para chamar usuários
3. **Configurar webhooks**: Ajuste na aba "Configurações"
4. **Monitorar**: Acompanhe webhooks na aba "Webhooks"

## 📱 Funcionalidades principais
- ✅ Cadastro de usuários
- ✅ Sistema de fila automático
- ✅ Webhooks configuráveis
- ✅ Interface responsiva
- ✅ Atualizações em tempo real

## 🆘 Problemas comuns
- **Erro de conexão MySQL**: Verifique credenciais no `.env.local`
- **Tabelas não criadas**: Execute `npm run db:migrate`
- **Porta ocupada**: Mude a porta no `package.json`

## 📚 Documentação completa
Veja o `README.md` para informações detalhadas.
