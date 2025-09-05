-- Script de inicialização do banco de dados
-- Execute este script após criar o banco de dados

-- Criar tabela de configurações se não existir
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

-- Criar tabela de logs de webhook se não existir
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

-- Criar tabela de filas se não existir
CREATE TABLE IF NOT EXISTS filas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  ativa BOOLEAN DEFAULT TRUE,
  cor VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar tabela de usuários se não existir
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  telefone VARCHAR(20),
  whatsapp VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar tabela de usuários_fila se não existir
CREATE TABLE IF NOT EXISTS usuarios_fila (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  fila_id INT NOT NULL,
  posicao INT NOT NULL,
  removido BOOLEAN DEFAULT FALSE,
  data_remocao TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_usuario_fila (usuario_id, fila_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (fila_id) REFERENCES filas(id) ON DELETE CASCADE
);

-- Criar tabela de ausências se não existir
CREATE TABLE IF NOT EXISTS ausencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  fila_id INT,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  motivo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (fila_id) REFERENCES filas(id) ON DELETE SET NULL
);

-- Criar tabela de log_fila se não existir
CREATE TABLE IF NOT EXISTS log_fila (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fila_id INT NOT NULL,
  usuario_id INT NOT NULL,
  acao VARCHAR(100) NOT NULL,
  posicao_nova INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fila_id) REFERENCES filas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Inserir fila padrão se não existir
INSERT INTO filas (id, nome, descricao, ativa, cor) VALUES
(1, 'Fila Padrão', 'Fila principal do sistema', TRUE, '#3B82F6')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_fila_fila_id ON usuarios_fila(fila_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_fila_usuario_id ON usuarios_fila(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_fila_removido ON usuarios_fila(removido);
CREATE INDEX IF NOT EXISTS idx_ausencias_usuario_id ON ausencias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ausencias_fila_id ON ausencias(fila_id);
CREATE INDEX IF NOT EXISTS idx_log_fila_fila_id ON log_fila(fila_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_fila_id ON webhook_logs(fila_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);
