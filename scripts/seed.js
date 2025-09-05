require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function seed() {
  let connection;
  
  try {
    // Connect to the database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'inteli',
    });

    console.log('Connected to database');

    // Insert sample queues
    const filas = [
      { nome: 'Atendimento Geral', descricao: 'Fila principal para atendimento geral', cor: '#3B82F6' },
      { nome: 'Suporte Técnico', descricao: 'Fila para suporte técnico especializado', cor: '#10B981' },
      { nome: 'Vendas', descricao: 'Fila para consultas de vendas', cor: '#F59E0B' },
      { nome: 'Financeiro', descricao: 'Fila para questões financeiras', cor: '#EF4444' },
    ];

    for (const fila of filas) {
      await connection.execute(
        'INSERT IGNORE INTO filas (nome, descricao, cor) VALUES (?, ?, ?)',
        [fila.nome, fila.descricao, fila.cor]
      );
    }
    console.log('Sample queues inserted');

    // Get queue IDs
    const [filaRows] = await connection.execute('SELECT id FROM filas ORDER BY id');
    
    // Insert sample users for each queue
    const usuarios = [
      { nome: 'João Silva', email: 'joao@exemplo.com', telefone: '(11) 99999-1111' },
      { nome: 'Maria Santos', email: 'maria@exemplo.com', telefone: '(11) 99999-2222' },
      { nome: 'Pedro Costa', email: 'pedro@exemplo.com', telefone: '(11) 99999-3333' },
      { nome: 'Ana Oliveira', email: 'ana@exemplo.com', telefone: '(11) 99999-4444' },
      { nome: 'Carlos Lima', email: 'carlos@exemplo.com', telefone: '(11) 99999-5555' },
    ];

    for (let i = 0; i < usuarios.length; i++) {
      const usuario = usuarios[i];
      const filaId = filaRows[i % filaRows.length].id; // Distribute users across queues
      
      // Get next position in this queue
      const [maxPos] = await connection.execute(
        'SELECT MAX(posicao) as max_pos FROM usuarios WHERE fila_id = ?',
        [filaId]
      );
      const proximaPosicao = (maxPos[0]?.max_pos || 0) + 1;

      await connection.execute(
        'INSERT IGNORE INTO usuarios (nome, email, telefone, fila_id, status, posicao) VALUES (?, ?, ?, ?, ?, ?)',
        [usuario.nome, usuario.email, usuario.telefone, filaId, 'aguardando', proximaPosicao]
      );
    }
    console.log('Sample users inserted with queue assignments');

    console.log('Seeding completed successfully!');

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seed();
