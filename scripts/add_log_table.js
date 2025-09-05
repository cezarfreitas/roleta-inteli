require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function addLogTable() {
  let connection;
  
  try {
    // Connect to MySQL server
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'inteli'
    });

    console.log('Connected to MySQL server');

    // Create log_fila table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS log_fila (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fila_id INT NOT NULL,
        usuario_id INT NOT NULL,
        acao ENUM('chamado', 'movido') NOT NULL,
        posicao_anterior INT,
        posicao_nova INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fila_id) REFERENCES filas(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    console.log('Table "log_fila" created or already exists');

    console.log('Log table added successfully!');

  } catch (error) {
    console.error('Failed to add log table:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addLogTable();


