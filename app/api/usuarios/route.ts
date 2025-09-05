import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search');

    let sql = `
      SELECT 
        u.id,
        u.nome,
        u.email,
        u.telefone,
        u.whatsapp,
        u.created_at,
        u.updated_at,
        GROUP_CONCAT(DISTINCT f.nome) as filas_ativas,
        GROUP_CONCAT(DISTINCT f.cor) as cores_filas,
        GROUP_CONCAT(DISTINCT f.id) as filas_ids
      FROM usuarios u
      LEFT JOIN usuarios_fila uf ON u.id = uf.usuario_id
      LEFT JOIN filas f ON uf.fila_id = f.id AND f.ativa = true
      GROUP BY u.id, u.nome, u.email, u.telefone, u.whatsapp, u.created_at, u.updated_at
    `;
    
    const params: any[] = [];

    if (search) {
      sql += ' HAVING (u.nome LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY u.nome ASC';

    const usuarios = await query(sql, params);
    
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, email, telefone } = body;

    if (!nome || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingUser = await query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email já cadastrado no sistema' },
        { status: 400 }
      );
    }

    // Inserir usuário (apenas dados básicos)
    const result = await query(
      'INSERT INTO usuarios (nome, email, telefone) VALUES (?, ?, ?)',
      [nome, email, telefone || null]
    ) as any;

    const novoUsuario = await query(
      'SELECT * FROM usuarios WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json((novoUsuario as any[])[0], { status: 201 });
  } catch (error) {
    console.error('Error creating usuario:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}