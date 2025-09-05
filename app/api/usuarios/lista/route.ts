import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filaId = searchParams.get('fila_id');

    let query_sql = '';
    let params: any[] = [];

    if (filaId) {
      // Buscar apenas usuários da fila específica
      query_sql = `
        SELECT DISTINCT
          u.id,
          u.nome,
          u.email
        FROM usuarios u
        INNER JOIN usuarios_fila uf ON u.id = uf.usuario_id
        WHERE uf.fila_id = ? AND uf.removido = FALSE
        ORDER BY u.nome ASC
      `;
      params = [filaId];
    } else {
      // Buscar todos os usuários (fallback)
      query_sql = `
        SELECT 
          id,
          nome,
          email
        FROM usuarios
        ORDER BY nome ASC
      `;
    }

    const usuarios = await query(query_sql, params) as any[];

    return NextResponse.json(usuarios);

  } catch (error: any) {
    console.error('Error fetching usuarios lista:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar lista de usuários' },
      { status: 500 }
    );
  }
}
