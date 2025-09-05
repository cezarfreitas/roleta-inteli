require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function migrate() {
  let connection;
  
  try {
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS inteli`);
    console.log('Database "inteli" created or already exists');

    // Use the database
    await connection.query(`USE inteli`);
    console.log('Using database "inteli"');

    // Create filas table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS filas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        cor VARCHAR(7) DEFAULT '#3B82F6',
        ativa BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "filas" created or already exists');

    // Drop old tables first (in correct order due to foreign keys)
    await connection.query(`DROP TABLE IF EXISTS webhooks`);
    console.log('Dropped webhooks table');
    
    await connection.query(`DROP TABLE IF EXISTS fila`);
    console.log('Dropped old fila table');
    
    await connection.query(`DROP TABLE IF EXISTS usuarios`);
    console.log('Dropped existing usuarios table');
    
    await connection.query(`
      CREATE TABLE usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telefone VARCHAR(20),
        fila_id INT NOT NULL,
        status ENUM('aguardando', 'em processamento', 'finalizado', 'pulado') DEFAULT 'aguardando',
        posicao INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (fila_id) REFERENCES filas(id) ON DELETE CASCADE,
        UNIQUE KEY unique_email_per_queue (email, fila_id)
      )
    `);
    console.log('Table "usuarios" created');

    // Create webhooks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS webhooks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        url_destino VARCHAR(500) NOT NULL,
        payload TEXT NOT NULL,
        status ENUM('sucesso', 'falha') NOT NULL,
        codigo_resposta INT,
        resposta_servidor TEXT,
        tentativas INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    console.log('Table "webhooks" created or already exists');

    // Create configuracoes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS configuracoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chave VARCHAR(100) UNIQUE NOT NULL,
        valor TEXT NOT NULL,
        descricao TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "configuracoes" created or already exists');

    // Insert default configurations
    await connection.execute(`
      INSERT IGNORE INTO configuracoes (chave, valor, descricao) VALUES
      ('webhook_url', 'https://webhook.site/your-unique-url', 'URL do webhook para notificações'),
      ('webhook_timeout', '5000', 'Timeout em ms para webhooks'),
      ('max_tentativas_webhook', '3', 'Número máximo de tentativas para webhooks')
    `);
    console.log('Default configurations inserted');

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrate();
