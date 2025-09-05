import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'server.idenegociosdigitais.com.br',
  port: 3322,
  user: 'inteli',
  password: 'e78b0bb7dba8d55d8826',
  database: 'inteli',
  waitForConnections: true,
  connectionLimit: 2,
  queueLimit: 0,
  idleTimeout: 300000,
  multipleStatements: false,
  charset: 'utf8mb4',
  timezone: '-03:00'
});

export const getConnection = () => pool;

export const query = async (sql: string, params?: any[]) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const closeConnection = async () => {
  await pool.end();
};
