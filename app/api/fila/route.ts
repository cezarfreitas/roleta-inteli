import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { enviarWebhook } from '@/lib/webhook';

export async function GET() {
  try {
    const fila = await query(`
      SELECT 
        f.id,
        f.posicao,
        f.status,
        f.created_at,
        f.updated_at,
        u.id as usuario_id,
        u.nome,
        u.email,
        u.telefone
      FROM fila f
      JOIN usuarios u ON f.usuario_id = u.id
      ORDER BY f.posicao ASC
    `);
    
    return NextResponse.json(fila);
  } catch (error) {
    console.error('Error fetching fila:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar fila' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { acao, usuario_id } = body;

    if (!acao || !usuario_id) {
      return NextResponse.json(
        { error: 'Ação e ID do usuário são obrigatórios' },
        { status: 400 }
      );
    }

    let resultado;
    let webhookData;

    switch (acao) {
      case 'chamar_proximo':
        // Buscar próximo usuário na fila
        const proximoUsuario = await query(`
          SELECT 
            f.id as fila_id,
            f.usuario_id,
            u.nome,
            u.email,
            u.telefone
          FROM fila f
          JOIN usuarios u ON f.usuario_id = u.id
          WHERE f.status = 'aguardando'
          ORDER BY f.posicao ASC
          LIMIT 1
        `) as any;

        if (!proximoUsuario || proximoUsuario.length === 0) {
          return NextResponse.json(
            { error: 'Não há usuários aguardando na fila' },
            { status: 404 }
          );
        }

        const usuario = proximoUsuario[0];

        // Atualizar status para 'em processamento'
        await query(
          'UPDATE fila SET status = ? WHERE id = ?',
          ['em processamento', usuario.fila_id]
        );

        // Preparar dados para webhook
        webhookData = {
          tipo: 'usuario_chamado',
          usuario: {
            id: usuario.usuario_id,
            nome: usuario.nome,
            email: usuario.email,
            telefone: usuario.telefone
          },
          timestamp: new Date().toISOString()
        };

        resultado = {
          message: 'Usuário chamado com sucesso',
          usuario: usuario,
          webhook_enviado: false
        };
        break;

      case 'finalizar':
        // Marcar usuário como finalizado
        await query(
          'UPDATE fila SET status = ? WHERE usuario_id = ?',
          ['finalizado', usuario_id]
        );

        resultado = { message: 'Usuário finalizado com sucesso' };
        break;

      case 'pular':
        // Marcar usuário como pulado
        await query(
          'UPDATE fila SET status = ? WHERE usuario_id = ?',
          ['pulado', usuario_id]
        );

        resultado = { message: 'Usuário pulado com sucesso' };
        break;

      default:
        return NextResponse.json(
          { error: 'Ação inválida' },
          { status: 400 }
        );
    }

    // Enviar webhook se necessário
    if (webhookData) {
      try {
        await enviarWebhook(webhookData, usuario.usuario_id);
        resultado.webhook_enviado = true;
      } catch (webhookError) {
        console.error('Erro ao enviar webhook:', webhookError);
        resultado.webhook_enviado = false;
        resultado.webhook_error = 'Erro ao enviar webhook';
      }
    }

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error managing fila:', error);
    return NextResponse.json(
      { error: 'Erro ao gerenciar fila' },
      { status: 500 }
    );
  }
}
