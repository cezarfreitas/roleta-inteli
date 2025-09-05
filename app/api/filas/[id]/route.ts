import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fila = await query(`
      SELECT 
        f.*,
        COUNT(u.id) as total_usuarios,
        COUNT(CASE WHEN u.status = 'aguardando' THEN 1 END) as aguardando,
        COUNT(CASE WHEN u.status = 'em processamento' THEN 1 END) as em_processamento,
        COUNT(CASE WHEN u.status = 'finalizado' THEN 1 END) as finalizados,
        COUNT(CASE WHEN u.status = 'pulado' THEN 1 END) as pulados
      FROM filas f
      LEFT JOIN usuarios u ON f.id = u.fila_id
      WHERE f.id = ? AND f.ativa = TRUE
      GROUP BY f.id
    `, [params.id]) as any;

    if (!fila || (Array.isArray(fila) && fila.length === 0)) {
      return NextResponse.json(
        { error: 'Fila não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(fila[0]);
  } catch (error) {
    console.error('Error fetching fila:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar fila' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nome, descricao, cor, ativa } = body;

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome da fila é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se já existe outra fila com o mesmo nome
    const existingFila = await query(
      'SELECT id FROM filas WHERE nome = ? AND id != ? AND ativa = TRUE',
      [nome, params.id]
    );

    if (Array.isArray(existingFila) && existingFila.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma fila com este nome' },
        { status: 400 }
      );
    }

    // Atualizar fila
    await query(
      'UPDATE filas SET nome = ?, descricao = ?, cor = ?, ativa = ? WHERE id = ?',
      [nome, descricao || '', cor || '#3B82F6', ativa !== false, params.id]
    );

    const filaAtualizada = await query(
      'SELECT * FROM filas WHERE id = ?',
      [params.id]
    ) as any;

    return NextResponse.json(filaAtualizada[0]);
  } catch (error) {
    console.error('Error updating fila:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar fila' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se a fila existe
    const fila = await query(
      'SELECT id FROM filas WHERE id = ?',
      [params.id]
    ) as any;

    if (!fila || (Array.isArray(fila) && fila.length === 0)) {
      return NextResponse.json(
        { error: 'Fila não encontrada' },
        { status: 404 }
      );
    }

    // Remover usuários da fila primeiro
    await query(
      'DELETE FROM usuarios_fila WHERE fila_id = ?',
      [params.id]
    );

    // Remover logs da fila
    await query(
      'DELETE FROM log_fila WHERE fila_id = ?',
      [params.id]
    );

    // Remover ausências relacionadas à fila (se houver)
    await query(
      'DELETE FROM ausencias WHERE fila_id = ?',
      [params.id]
    );

    // Marcar fila como inativa (soft delete)
    await query(
      'UPDATE filas SET ativa = FALSE WHERE id = ?',
      [params.id]
    );

    return NextResponse.json({ message: 'Fila removida com sucesso' });
  } catch (error) {
    console.error('Error deleting fila:', error);
    return NextResponse.json(
      { error: 'Erro ao remover fila' },
      { status: 500 }
    );
  }
}
