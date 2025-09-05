import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { usuarioId } = await request.json();
    const filaId = parseInt(params.id);

    if (!usuarioId || !filaId) {
      return NextResponse.json(
        { error: 'ID do usuário e da fila são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a fila existe e está ativa
    const fila = await query(
      'SELECT id, ativa FROM filas WHERE id = ?',
      [filaId]
    ) as any;

    if (!fila || fila.length === 0) {
      return NextResponse.json(
        { error: 'Fila não encontrada' },
        { status: 404 }
      );
    }

    if (!fila[0].ativa) {
      return NextResponse.json(
        { error: 'Fila não está ativa' },
        { status: 400 }
      );
    }

    // Verificar se o usuário já está nesta fila
    const usuarioExistente = await query(
      'SELECT id FROM usuarios_fila WHERE usuario_id = ? AND fila_id = ?',
      [usuarioId, filaId]
    ) as any;

    if (usuarioExistente && usuarioExistente.length > 0) {
      return NextResponse.json(
        { error: 'Usuário já está nesta fila' },
        { status: 400 }
      );
    }

    // Obter próxima posição na fila
    const maxPosicao = await query(
      'SELECT MAX(posicao) as max_pos FROM usuarios_fila WHERE fila_id = ?',
      [filaId]
    ) as any;
    
    const proximaPosicao = (maxPosicao[0]?.max_pos || 0) + 1;

    // Inserir usuário na fila
    await query(
      'INSERT INTO usuarios_fila (usuario_id, fila_id, status, posicao) VALUES (?, ?, "aguardando", ?)',
      [usuarioId, filaId, proximaPosicao]
    );

    return NextResponse.json({
      message: 'Usuário adicionado à fila com sucesso',
      posicao: proximaPosicao
    });

  } catch (error: any) {
    console.error('Error adding usuario to fila:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao adicionar usuário à fila' },
      { status: 500 }
    );
  }
}
