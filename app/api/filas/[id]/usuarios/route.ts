import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 API: Buscando usuários para fila ID:', params.id);
    
    const filaId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('📋 Parâmetros:', { filaId, limit });

    // Buscar usuários da fila com informações de ausência e estatísticas
    const usuarios = await query(`
      SELECT 
        u.id,
        u.nome,
        u.email,
        u.telefone,
        uf.posicao,
        uf.created_at as entrada_fila,
        uf.updated_at,
        CASE 
          WHEN a.id IS NOT NULL THEN 'ausente'
          ELSE 'aguardando'
        END as status_atual,
        COALESCE(atendimentos.total_atendimentos, 0) as total_atendimentos,
        CASE 
          WHEN total_fila.total_usuarios > 0 
          THEN ROUND((COALESCE(atendimentos.total_atendimentos, 0) / total_fila.total_usuarios) * 100, 1)
          ELSE 0
        END as percentual_atendimentos
      FROM usuarios_fila uf
      INNER JOIN usuarios u ON uf.usuario_id = u.id
      INNER JOIN filas f ON uf.fila_id = f.id
      LEFT JOIN (
        SELECT 
          usuario_id,
          COUNT(*) as total_atendimentos
        FROM log_fila 
        WHERE fila_id = ? AND acao = 'movido' AND posicao_anterior = 1
        GROUP BY usuario_id
      ) atendimentos ON uf.usuario_id = atendimentos.usuario_id
      LEFT JOIN (
        SELECT 
          fila_id,
          COUNT(*) as total_usuarios
        FROM usuarios_fila 
        WHERE fila_id = ?
        GROUP BY fila_id
      ) total_fila ON uf.fila_id = total_fila.fila_id
      LEFT JOIN ausencias a ON (
        uf.usuario_id = a.usuario_id 
        AND a.data_inicio <= CURDATE() 
        AND a.data_fim >= CURDATE()
        AND a.ativa = true
      )
      WHERE uf.fila_id = ? AND (uf.removido IS NULL OR uf.removido = FALSE)
      ORDER BY 
        CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END,
        uf.posicao ASC
      LIMIT ${limit}
    `, [filaId, filaId, filaId]) as any;

    console.log('✅ Usuários encontrados:', usuarios.length);
    console.log('📊 Primeiro usuário:', usuarios[0] ? `${usuarios[0].nome} (${usuarios[0].email})` : 'Nenhum');

    return NextResponse.json(usuarios);

  } catch (error: any) {
    console.error('❌ Error fetching usuarios da fila:', error);
    console.error('🔍 Stack trace:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar usuários da fila' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { usuarioId } = body;

    if (!usuarioId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se usuário já está nesta fila (não removido)
    const existingUser = await query(
      'SELECT id FROM usuarios_fila WHERE usuario_id = ? AND fila_id = ? AND (removido IS NULL OR removido = FALSE)',
      [usuarioId, params.id]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Usuário já está nesta fila' },
        { status: 400 }
      );
    }

    // Verificar se usuário foi removido anteriormente (soft-deleted)
    const removedUser = await query(
      'SELECT id FROM usuarios_fila WHERE usuario_id = ? AND fila_id = ? AND removido = TRUE',
      [usuarioId, params.id]
    );

    // Obter próxima posição na fila (apenas usuários não removidos)
    const maxPosicao = await query(
      'SELECT MAX(posicao) as max_pos FROM usuarios_fila WHERE fila_id = ? AND (removido IS NULL OR removido = FALSE)',
      [params.id]
    ) as any;
    const proximaPosicao = (maxPosicao[0]?.max_pos || 0) + 1;

    let result;
    if (Array.isArray(removedUser) && removedUser.length > 0) {
      // Se usuário foi removido anteriormente, reativar o registro existente
      result = await query(
        'UPDATE usuarios_fila SET removido = FALSE, data_remocao = NULL, posicao = ?, updated_at = NOW() WHERE usuario_id = ? AND fila_id = ?',
        [proximaPosicao, usuarioId, params.id]
      );
    } else {
              // Inserir novo usuário na fila
        result = await query(
          'INSERT INTO usuarios_fila (usuario_id, fila_id, posicao) VALUES (?, ?, ?)',
          [usuarioId, params.id, proximaPosicao]
        );
    }

    return NextResponse.json({ message: 'Usuário adicionado à fila com sucesso' }, { status: 201 });
  } catch (error) {
    console.error('Error adding usuario na fila:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar usuário na fila' },
      { status: 500 }
    );
  }
}
