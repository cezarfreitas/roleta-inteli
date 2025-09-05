import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; usuarioId: string } }
) {
  try {
    const filaId = parseInt(params.id);
    const usuarioId = parseInt(params.usuarioId);

    if (isNaN(filaId) || isNaN(usuarioId)) {
      return NextResponse.json({ error: 'IDs inválidos' }, { status: 400 });
    }

    // Verificar se o usuário está na fila
    const usuarioNaFila = await query(
      'SELECT * FROM usuarios_fila WHERE fila_id = ? AND usuario_id = ?',
      [filaId, usuarioId]
    ) as any[];

    if (usuarioNaFila.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado nesta fila' }, { status: 404 });
    }

    // Remover o usuário da fila (soft delete - marcar como removido)
    await query(
      'UPDATE usuarios_fila SET removido = TRUE, data_remocao = NOW() WHERE fila_id = ? AND usuario_id = ?',
      [filaId, usuarioId]
    );

    // Registrar no log da fila (opcional - não falha se der erro)
    try {
      await query(
        'INSERT INTO log_fila (fila_id, usuario_id, acao, posicao_nova, created_at) VALUES (?, ?, ?, ?, NOW())',
        [filaId, usuarioId, 'remocao', 0]
      );
    } catch (logError) {
      // Log é opcional, não falha a operação principal
      console.warn('Não foi possível registrar log:', logError.message);
    }

    return NextResponse.json({ 
      message: 'Usuário removido da fila com sucesso',
      usuarioId,
      filaId
    });

  } catch (error) {
    console.error('Erro ao remover usuário da fila:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
