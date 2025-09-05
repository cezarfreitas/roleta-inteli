import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    const configuracoes = await query('SELECT * FROM configuracoes ORDER BY chave');
    return NextResponse.json(configuracoes);
  } catch (error) {
    console.error('Error fetching configuracoes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { chave, valor } = body;

    if (!chave || valor === undefined) {
      return NextResponse.json(
        { error: 'Chave e valor são obrigatórios' },
        { status: 400 }
      );
    }

    await query(
      'UPDATE configuracoes SET valor = ? WHERE chave = ?',
      [valor, chave]
    );

    const configAtualizada = await query(
      'SELECT * FROM configuracoes WHERE chave = ?',
      [chave]
    ) as any[];

    return NextResponse.json(configAtualizada[0]);
  } catch (error) {
    console.error('Error updating configuracao:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar configuração' },
      { status: 500 }
    );
  }
}
