import axios from 'axios';
import { query } from './database';

export async function enviarWebhook(data: any, usuarioId: number) {
  try {
    // Buscar configuração da URL do webhook
    const config = await query(
      'SELECT valor FROM configuracoes WHERE chave = ?',
      ['webhook_url']
    ) as any;

    if (!config || config.length === 0) {
      throw new Error('URL do webhook não configurada');
    }

    const webhookUrl = config[0].valor;
    const timeout = parseInt(process.env.WEBHOOK_TIMEOUT || '5000');

    // Enviar webhook
    const response = await axios.post(webhookUrl, data, {
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Sistema-Fila-Admin/1.0'
      }
    });

    // Registrar webhook no banco
    await query(`
      INSERT INTO webhooks (
        usuario_id, 
        url_destino, 
        payload, 
        status, 
        codigo_resposta, 
        resposta_servidor
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      usuarioId,
      webhookUrl,
      JSON.stringify(data),
      'sucesso',
      response.status,
      JSON.stringify(response.data)
    ]);

    return {
      success: true,
      status: response.status,
      data: response.data
    };

  } catch (error: any) {
    console.error('Erro ao enviar webhook:', error);

    // Registrar falha no banco
    try {
      await query(`
        INSERT INTO webhooks (
          usuario_id, 
          url_destino, 
          payload, 
          status, 
          codigo_resposta,
          resposta_servidor
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        usuarioId,
        data.url_destino || 'N/A',
        JSON.stringify(data),
        'falha',
        error.response?.status || 0,
        error.message || 'Erro desconhecido'
      ]);
    } catch (dbError) {
      console.error('Erro ao registrar falha do webhook no banco:', dbError);
    }

    throw error;
  }
}

export async function buscarWebhooks() {
  try {
    const webhooks = await query(`
      SELECT 
        w.*,
        u.nome as usuario_nome,
        u.email as usuario_email
      FROM webhooks w
      JOIN usuarios u ON w.usuario_id = u.id
      ORDER BY w.created_at DESC
      LIMIT 100
    `);

    return webhooks;
  } catch (error) {
    console.error('Erro ao buscar webhooks:', error);
    throw error;
  }
}

export async function reenviarWebhook(webhookId: number) {
  try {
    // Buscar webhook
    const webhook = await query(
      'SELECT * FROM webhooks WHERE id = ?',
      [webhookId]
    ) as any;

    if (!webhook || webhook.length === 0) {
      throw new Error('Webhook não encontrado');
    }

    const webhookData = webhook[0];

    // Tentar reenviar
    const resultado = await enviarWebhook(
      JSON.parse(webhookData.payload),
      webhookData.usuario_id
    );

    return resultado;
  } catch (error) {
    console.error('Erro ao reenviar webhook:', error);
    throw error;
  }
}
