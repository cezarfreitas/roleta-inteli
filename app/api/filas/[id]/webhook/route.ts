import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const filaId = parseInt(params.id);
    const { searchParams } = request.nextUrl;
    const leadId = searchParams.get('lead');

    // Buscar usuário atual (primeira posição)
    const usuarioAtual = await query(`
      SELECT 
        u.id,
        u.nome,
        u.email,
        u.telefone,
        uf.posicao
      FROM usuarios_fila uf
      INNER JOIN usuarios u ON uf.usuario_id = u.id
      WHERE uf.fila_id = ? AND uf.posicao = 1 AND (uf.removido IS NULL OR uf.removido = FALSE)
      LIMIT 1
    `, [filaId]) as any;

    if (!usuarioAtual || usuarioAtual.length === 0) {
      return NextResponse.json(
        { error: 'Não há usuários na fila' },
        { status: 404 }
      );
    }

    const usuario = usuarioAtual[0];

    // Buscar configurações da API de leads
    const configuracoes = await query('SELECT chave, valor FROM configuracoes WHERE chave IN (?, ?)', ['lead_api_token', 'lead_api_id']) as any;
    const configMap = configuracoes.reduce((acc: any, config: any) => {
      acc[config.chave] = config.valor;
      return acc;
    }, {});
    
    const apiToken = configMap.lead_api_token || 'e24be9a5-c50d-44a6-8128-e21ab15e63af';
    const apiId = configMap.lead_api_id || 'grupointeli';

    // Buscar dados do lead na API externa
    let leadData = null;
    const leadIdToQuery = leadId || usuario.id; // Usar leadId da URL ou ID do usuário como fallback
    
    try {
      const leadResponse = await fetch(`https://sprinthub-api-master.sprinthub.app/leads/${leadIdToQuery}?allFields=1&apitoken=${apiToken}&i=${apiId}`);
      if (leadResponse.ok) {
        leadData = await leadResponse.json();
        
        // Atualizar userAccess adicionando o ID do vendedor da vez
        if (leadData?.data?.lead) {
          // Obter o userAccess atual do lead consultado
          const currentUserAccess = leadData.data.lead.userAccess || [];
          const currentOwner = leadData.data.lead.owner;
          const vendedorId = usuario.id; // ID do usuário da fila (vendedor da vez)
          
          // Preparar dados para atualização - sempre adicionar o vendedor atual
          let updatedUserAccess = [...currentUserAccess];
          
          // Verificar se o vendedor já está no userAccess
          if (!currentUserAccess.includes(vendedorId)) {
            // Adicionar o vendedor ao array existente
            updatedUserAccess.push(vendedorId);
          }
          
          // Fazer um único PUT para atualizar o userAccess e owner
                      try {
              const updateResponse = await fetch(`https://sprinthub-api-master.sprinthub.app/leads/${leadIdToQuery}?apitoken=${apiToken}&i=${apiId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userAccess: updatedUserAccess,
                owner: vendedorId
              })
            });
            
            if (updateResponse.ok) {
              // Atualizar os dados locais com o novo userAccess e owner
              leadData.data.lead.userAccess = updatedUserAccess;
              leadData.data.lead.owner = vendedorId;
              
              // Registrar log da ação
              await query(`
                INSERT INTO webhook_logs (
                  fila_id, usuario_id, lead_id, acao,
                  dados_antes, dados_depois,
                  user_access_antes, user_access_depois,
                  owner_antes, owner_depois,
                  status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
              `, [
                filaId,
                usuario.id,
                leadIdToQuery,
                'webhook_executado',
                JSON.stringify({
                  userAccess: currentUserAccess,
                  owner: currentOwner
                }),
                JSON.stringify({
                  userAccess: updatedUserAccess,
                  owner: vendedorId
                }),
                JSON.stringify(currentUserAccess),
                JSON.stringify(updatedUserAccess),
                currentOwner,
                vendedorId,
                'sucesso'
              ]);
            } else {
              // Registrar log de erro
              await query(`
                INSERT INTO webhook_logs (
                  fila_id, usuario_id, lead_id, acao,
                  dados_antes, status, erro, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
              `, [
                filaId,
                usuario.id,
                leadIdToQuery,
                'webhook_executado',
                JSON.stringify({
                  userAccess: currentUserAccess,
                  owner: currentOwner
                }),
                'erro',
                `Erro HTTP ${updateResponse.status}`
              ]);
            }
          } catch (updateError) {
            // Registrar log de erro
            await query(`
              INSERT INTO webhook_logs (
                fila_id, usuario_id, lead_id, acao,
                dados_antes, status, erro, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `, [
              filaId,
              usuario.id,
              leadIdToQuery,
              'webhook_executado',
              JSON.stringify({
                userAccess: currentUserAccess,
                owner: currentOwner
              }),
              'erro',
              (updateError as Error).message
            ]);
          }
        }
      }
    } catch (error) {
      // Erro ao consultar API do lead - continuar sem os dados
    }

    // Obter última posição da fila
    const ultimaPosicao = await query(
      'SELECT MAX(posicao) as max_pos FROM usuarios_fila WHERE fila_id = ?',
      [filaId]
    ) as any;
    
    const novaPosicao = (ultimaPosicao[0]?.max_pos || 0) + 1;

    // Mover usuário para o final da fila
    await query(
      'UPDATE usuarios_fila SET posicao = ?, updated_at = NOW() WHERE usuario_id = ? AND fila_id = ?',
      [novaPosicao, usuario.id, filaId]
    );

    // Registrar no log
    await query(`
      INSERT INTO log_fila (fila_id, usuario_id, acao, posicao_anterior, posicao_nova, created_at)
      VALUES (?, ?, 'movido', ?, ?, NOW())
    `, [filaId, usuario.id, 1, novaPosicao]);

    // Reordenar posições dos outros usuários
    await query(`
      UPDATE usuarios_fila 
      SET posicao = posicao - 1, updated_at = NOW()
      WHERE fila_id = ? AND posicao > 1
    `, [filaId]);

    // Retornar dados do usuário atual com informações do lead
    return NextResponse.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        posicao_anterior: 1,
        nova_posicao: novaPosicao
      },
      lead: leadData ? {
        id: leadData.data?.lead?.id,
        firstname: leadData.data?.lead?.firstname,
        lastname: leadData.data?.lead?.lastname,
        whatsapp: leadData.data?.lead?.whatsapp,
        phone: leadData.data?.lead?.phone,
        email: leadData.data?.lead?.email,
        company: leadData.data?.lead?.company,
        city: leadData.data?.lead?.city,
        state: leadData.data?.lead?.state,
        createDate: leadData.data?.lead?.createDate,
        lastActive: leadData.data?.lead?.lastActive,
        points: leadData.data?.lead?.points,
        star_score: leadData.data?.lead?.star_score,
        createdBy: leadData.data?.lead?.createdBy,
        createdByName: leadData.data?.lead?.createdByName,
        createdByType: leadData.data?.lead?.createdByType,
        owner: leadData.data?.lead?.owner,
        updatedBy: leadData.data?.lead?.updatedBy,
        updatedByName: leadData.data?.lead?.updatedByName,
        updatedDate: leadData.data?.lead?.updatedDate,
        userAccess: leadData.data?.lead?.userAccess
      } : null,
      lead_consultado: leadIdToQuery,
      vendedor_adicionado: usuario.id,
      fila_id: filaId,
      timestamp: new Date().toISOString(),
      message: leadId ? `Fila avançada via webhook com dados do lead ${leadId} e vendedor ${usuario.id} definido como owner e adicionado ao userAccess` : `Fila avançada automaticamente via webhook com vendedor ${usuario.id} definido como owner e adicionado ao userAccess`
    });

  } catch (error: any) {
    console.error('Error executing webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao executar webhook' },
      { status: 500 }
    );
  }
}
