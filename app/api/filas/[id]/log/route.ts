import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const filaId = parseInt(params.id);
    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get('limit') || '50');

    // Buscar log da fila com informações do usuário
    const logs = await query(`
      SELECT 
        l.id,
        l.usuario_id,
        u.nome as usuario_nome,
        u.email as usuario_email,
        l.acao,
        l.posicao_anterior,
        l.posicao_nova,
        l.created_at
      FROM log_fila l
      INNER JOIN usuarios u ON l.usuario_id = u.id
      WHERE l.fila_id = ?
      ORDER BY l.created_at DESC
      LIMIT ${limit}
    `, [filaId]) as any;

    return NextResponse.json(logs);

  } catch (error: any) {
    console.error('Error fetching log:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar log da fila' },
      { status: 500 }
    );
  }
}
