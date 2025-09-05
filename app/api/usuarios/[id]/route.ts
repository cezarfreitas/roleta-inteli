import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuario = await query(
      'SELECT * FROM usuarios WHERE id = ?',
      [params.id]
    );

    if (!usuario || (Array.isArray(usuario) && usuario.length === 0)) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json((usuario as any[])[0]);
  } catch (error) {
    console.error('Error fetching usuario:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
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
    const { nome, email, telefone, status } = body;

    if (!nome || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se email já existe em outro usuário
    const existingUser = await query(
      'SELECT id FROM usuarios WHERE email = ? AND id != ?',
      [email, params.id]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email já cadastrado para outro usuário' },
        { status: 400 }
      );
    }

    // Atualizar usuário
    await query(
      'UPDATE usuarios SET nome = ?, email = ?, telefone = ? WHERE id = ?',
      [nome, email, telefone, params.id]
    );

    // Se o status foi alterado, atualizar também na fila
    if (status) {
      await query(
        'UPDATE fila SET status = ? WHERE usuario_id = ?',
        [status, params.id]
      );
    }

    const usuarioAtualizado = await query(
      'SELECT * FROM usuarios WHERE id = ?',
      [params.id]
    );

    return NextResponse.json((usuarioAtualizado as any[])[0]);
  } catch (error) {
    console.error('Error updating usuario:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se usuário existe
    const usuario = await query(
      'SELECT id FROM usuarios WHERE id = ?',
      [params.id]
    );

    if (!usuario || (Array.isArray(usuario) && usuario.length === 0)) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Deletar usuário (a fila será deletada automaticamente devido à foreign key)
    await query('DELETE FROM usuarios WHERE id = ?', [params.id]);

    // Reorganizar posições da fila
    await query(`
      SET @pos := 0;
      UPDATE fila SET posicao = (@pos := @pos + 1) ORDER BY created_at ASC;
    `);

    return NextResponse.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Error deleting usuario:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar usuário' },
      { status: 500 }
    );
  }
}
