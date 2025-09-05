import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Buscar usuários que não estão em filas ativas OU que foram removidos (soft-deleted)
    const usuarios = await query(`
      SELECT u.id, u.nome, u.email, u.telefone, u.whatsapp
      FROM usuarios u
      WHERE u.id NOT IN (
        SELECT DISTINCT uf.usuario_id 
        FROM usuarios_fila uf 
        INNER JOIN filas f ON uf.fila_id = f.id 
        WHERE f.ativa = true 
        AND (uf.removido IS NULL OR uf.removido = FALSE)
      )
      ORDER BY u.nome
    `) as any;

    return NextResponse.json(usuarios);

  } catch (error: any) {
    console.error('Error fetching available usuarios:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar usuários disponíveis' },
      { status: 500 }
    );
  }
}
