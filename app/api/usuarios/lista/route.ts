import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Buscar todos os usuários para seleção
    const usuarios = await query(`
      SELECT 
        id,
        nome,
        email
      FROM usuarios
      ORDER BY nome ASC
    `) as any[];

    return NextResponse.json(usuarios);

  } catch (error: any) {
    console.error('Error fetching usuarios lista:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar lista de usuários' },
      { status: 500 }
    );
  }
}
