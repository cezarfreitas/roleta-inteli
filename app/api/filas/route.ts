import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Buscar filas ativas com contadores baseados na nova estrutura
    const filas = await query(`
      SELECT 
        f.id,
        f.nome,
        f.descricao,
        f.cor,
        f.ativa,
        COALESCE(uf.total_usuarios, 0) as total_usuarios,
        COALESCE(uf.aguardando, 0) as aguardando,
        COALESCE(uf.em_processamento, 0) as em_processamento
      FROM filas f
      LEFT JOIN (
        SELECT 
          fila_id,
          COUNT(*) as total_usuarios,
          COUNT(*) as aguardando,
          0 as em_processamento
        FROM usuarios_fila
        WHERE (removido IS NULL OR removido = FALSE)
        GROUP BY fila_id
      ) uf ON f.id = uf.fila_id
      WHERE f.ativa = TRUE
      ORDER BY f.nome
    `) as any;

    return NextResponse.json(filas);

  } catch (error: any) {
    console.error('Error fetching filas:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar filas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, descricao, cor } = body;

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome da fila é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se já existe uma fila com o mesmo nome
    const existingFila = await query(
      'SELECT id FROM filas WHERE nome = ? AND ativa = TRUE',
      [nome]
    );

    if (Array.isArray(existingFila) && existingFila.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma fila com este nome' },
        { status: 400 }
      );
    }

    // Criar nova fila
    const result = await query(
      'INSERT INTO filas (nome, descricao, cor, ativa) VALUES (?, ?, ?, TRUE)',
      [nome, descricao || '', cor || '#3B82F6']
    ) as any;

    const novaFila = await query(
      'SELECT * FROM filas WHERE id = ?',
      [result.insertId]
    ) as any;

    return NextResponse.json(novaFila[0], { status: 201 });
  } catch (error) {
    console.error('Error creating fila:', error);
    return NextResponse.json(
      { error: 'Erro ao criar fila' },
      { status: 500 }
    );
  }
}
