# 🔒 Configurações de Segurança

## ⚠️ IMPORTANTE - ALTERE AS CREDENCIAIS PADRÃO

O sistema vem com credenciais padrão que **DEVEM** ser alteradas em produção:

### Credenciais Padrão:
- **Usuário**: `admin`
- **Senha**: `admin`

## 🛡️ Como Proteger o Sistema

### 1. Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Configurações de Segurança
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_2024_altere_em_producao

# Credenciais do Administrador (ALTERE EM PRODUÇÃO)
ADMIN_USERNAME=seu_usuario_admin
ADMIN_PASSWORD=sua_senha_super_segura
```

### 2. Chave JWT Segura
Gere uma chave JWT segura:
```bash
# No terminal, gere uma chave aleatória
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Senha Forte
Use uma senha forte com:
- Mínimo 12 caracteres
- Letras maiúsculas e minúsculas
- Números
- Símbolos especiais

### 4. HTTPS em Produção
- Configure SSL/TLS
- Use certificados válidos
- Force HTTPS em todas as rotas

## 🔐 Funcionalidades de Segurança

### Autenticação JWT
- Tokens com expiração de 24 horas
- Verificação automática de validade
- Logout automático em caso de token inválido

### Proteção de Rotas
- Middleware de autenticação
- Redirecionamento automático para login
- Proteção de todas as rotas administrativas

### Logs de Segurança
- Registro de tentativas de login
- Logs de acesso administrativo
- Monitoramento de atividades suspeitas

## 🚨 Checklist de Segurança

- [ ] Alterar credenciais padrão
- [ ] Configurar JWT_SECRET seguro
- [ ] Usar HTTPS em produção
- [ ] Configurar firewall
- [ ] Fazer backup regular dos dados
- [ ] Monitorar logs de acesso
- [ ] Atualizar dependências regularmente

## 📞 Suporte
Em caso de problemas de segurança, entre em contato com a equipe de desenvolvimento.

