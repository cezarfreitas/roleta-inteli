import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, id } = await request.json();

    console.log('🔍 API Auth: Tentativa de login:', { email, id });

    if (!email || !id) {
      return NextResponse.json(
        { error: 'Email e ID são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe com email e ID correspondentes e buscar sua fila
    const usuarios = await query(`
      SELECT 
        u.id, 
        u.nome, 
        u.email, 
        u.telefone, 
        u.whatsapp,
        uf.fila_id
      FROM usuarios u
      LEFT JOIN usuarios_fila uf ON u.id = uf.usuario_id AND uf.removido = FALSE
      WHERE u.email = ? AND u.id = ?
      LIMIT 1
    `, [email, parseInt(id)]) as any[];

    console.log('📋 API Auth: Resultado da consulta:', usuarios);

    if (usuarios.length === 0) {
      console.log('❌ API Auth: Usuário não encontrado');
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    const usuario = usuarios[0];
    console.log('✅ API Auth: Login bem-sucedido para:', usuario.nome);

    return NextResponse.json({
      message: 'Login realizado com sucesso',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        whatsapp: usuario.whatsapp,
        fila_id: usuario.fila_id
      }
    });

  } catch (error: any) {
    console.error('❌ API Auth: Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
