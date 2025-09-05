import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { acao } = await request.json();
    const filaId = parseInt(params.id);

    if (!acao) {
      return NextResponse.json(
        { error: 'Ação é obrigatória' },
        { status: 400 }
      );
    }

    if (acao === 'chamar_proximo') {
      // Buscar usuário atual (primeira posição)
      const usuarioAtual = await query(`
        SELECT uf.id, uf.usuario_id, uf.posicao, u.nome
        FROM usuarios_fila uf
        INNER JOIN usuarios u ON uf.usuario_id = u.id
        WHERE uf.fila_id = ? AND uf.posicao = 1
        LIMIT 1
      `, [filaId]) as any;

      if (!usuarioAtual || usuarioAtual.length === 0) {
        return NextResponse.json(
          { error: 'Não há usuários na fila' },
          { status: 400 }
        );
      }

      // Obter última posição da fila
      const ultimaPosicao = await query(
        'SELECT MAX(posicao) as max_pos FROM usuarios_fila WHERE fila_id = ?',
        [filaId]
      ) as any;
      
      const novaPosicao = (ultimaPosicao[0]?.max_pos || 0) + 1;

      // Mover usuário para o final da fila
      await query(
        'UPDATE usuarios_fila SET posicao = ?, updated_at = NOW() WHERE id = ?',
        [novaPosicao, usuarioAtual[0].id]
      );

      // Registrar no log
      await query(`
        INSERT INTO log_fila (fila_id, usuario_id, acao, posicao_anterior, posicao_nova, created_at)
        VALUES (?, ?, 'movido', ?, ?, NOW())
      `, [filaId, usuarioAtual[0].usuario_id, 1, novaPosicao]);

      // Reordenar posições dos outros usuários
      await query(`
        UPDATE usuarios_fila 
        SET posicao = posicao - 1, updated_at = NOW()
        WHERE fila_id = ? AND posicao > 1
      `, [filaId]);

      return NextResponse.json({
        message: 'Próximo usuário chamado com sucesso',
        usuario: usuarioAtual[0].nome,
        nova_posicao: novaPosicao
      });
    }

    return NextResponse.json(
      { error: 'Ação não reconhecida' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Error executing fila action:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao executar ação na fila' },
      { status: 500 }
    );
  }
}
