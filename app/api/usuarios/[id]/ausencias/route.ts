import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuarioId = parseInt(params.id);

    // Buscar ausências do usuário com nome da fila
    const ausencias = await query(`
      SELECT 
        a.id,
        a.data_inicio,
        a.data_fim,
        a.motivo,
        a.ativa,
        a.created_at,
        f.nome as fila_nome
      FROM ausencias a
      LEFT JOIN filas f ON a.fila_id = f.id
      WHERE a.usuario_id = ?
      ORDER BY a.data_inicio DESC
    `, [usuarioId]) as any;

    return NextResponse.json(ausencias);

  } catch (error: any) {
    console.error('Error fetching ausencias:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar ausências' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuarioId = parseInt(params.id);
    const { data_inicio, data_fim, motivo, fila_id } = await request.json();

    if (!data_inicio || !data_fim || !motivo) {
      return NextResponse.json(
        { error: 'Data início, data fim e motivo são obrigatórios' },
        { status: 400 }
      );
    }

    // Se fila_id não for fornecido, usar a primeira fila ativa disponível
    let filaId = fila_id;
    if (!filaId) {
      const filas = await query('SELECT id FROM filas WHERE ativa = true LIMIT 1') as any[];
      if (filas.length > 0) {
        filaId = filas[0].id;
      } else {
        return NextResponse.json(
          { error: 'Nenhuma fila ativa encontrada' },
          { status: 400 }
        );
      }
    } else {
      // Verificar se a fila fornecida está ativa
      const fila = await query('SELECT id FROM filas WHERE id = ? AND ativa = true', [filaId]) as any[];
      if (fila.length === 0) {
        return NextResponse.json(
          { error: 'Fila especificada não está ativa ou não existe' },
          { status: 400 }
        );
      }
    }

    // Inserir nova ausência
    const result = await query(`
      INSERT INTO ausencias (usuario_id, fila_id, data_inicio, data_fim, motivo, ativa)
      VALUES (?, ?, ?, ?, ?, true)
    `, [usuarioId, filaId, data_inicio, data_fim, motivo]);

    return NextResponse.json({
      message: 'Ausência registrada com sucesso',
      id: result.insertId
    });

  } catch (error: any) {
    console.error('Error creating ausencia:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar ausência' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { ausenciaId, ...updates } = await request.json();
    const usuarioId = parseInt(params.id);

    if (!ausenciaId) {
      return NextResponse.json(
        { error: 'ID da ausência é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a ausência pertence ao usuário
    const ausencia = await query(
      'SELECT id FROM ausencias WHERE id = ? AND usuario_id = ?',
      [ausenciaId, usuarioId]
    ) as any;

    if (!ausencia || ausencia.length === 0) {
      return NextResponse.json(
        { error: 'Ausência não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar ausência
    const campos = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const valores = Object.values(updates);
    
    await query(
      `UPDATE ausencias SET ${campos} WHERE id = ?`,
      [...valores, ausenciaId]
    );

    return NextResponse.json({
      message: 'Ausência atualizada com sucesso'
    });

  } catch (error: any) {
    console.error('Error updating ausencia:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar ausência' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { ausenciaId } = await request.json();
    const usuarioId = parseInt(params.id);

    if (!ausenciaId) {
      return NextResponse.json(
        { error: 'ID da ausência é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a ausência pertence ao usuário
    const ausencia = await query(
      'SELECT id FROM ausencias WHERE id = ? AND usuario_id = ?',
      [ausenciaId, usuarioId]
    ) as any;

    if (!ausencia || ausencia.length === 0) {
      return NextResponse.json(
        { error: 'Ausência não encontrada' },
        { status: 404 }
      );
    }

    // Deletar ausência
    await query('DELETE FROM ausencias WHERE id = ?', [ausenciaId]);

    return NextResponse.json({
      message: 'Ausência removida com sucesso'
    });

  } catch (error: any) {
    console.error('Error deleting ausencia:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao remover ausência' },
      { status: 500 }
    );
  }
}
