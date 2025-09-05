import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Credenciais do administrador (em produção, use variáveis de ambiente)
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin'
};

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_aqui_2024';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    console.log('🔍 Tentativa de login:', { username, timestamp: new Date().toISOString() });

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar credenciais
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Gerar token JWT
      const token = jwt.sign(
        { 
          username: username,
          role: 'admin',
          iat: Math.floor(Date.now() / 1000)
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('✅ Login bem-sucedido para:', username);

      return NextResponse.json({
        message: 'Login realizado com sucesso',
        token,
        username,
        role: 'admin'
      });
    } else {
      console.log('❌ Login falhou para:', username);
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

  } catch (error: any) {
    console.error('❌ Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
