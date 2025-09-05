import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const filaId = parseInt(params.id);
    console.log('🔍 API Estatísticas: Buscando para fila ID:', filaId);

    // Estatísticas simplificadas baseadas no log_fila
    const atendimentosHoje = await query(`
      SELECT COUNT(*) as total
      FROM log_fila 
      WHERE fila_id = ? 
      AND acao = 'movido' 
      AND posicao_anterior = 1
      AND DATE(created_at) = CURDATE()
    `, [filaId]) as any;

    const atendimentosOntem = await query(`
      SELECT COUNT(*) as total
      FROM log_fila 
      WHERE fila_id = ? 
      AND acao = 'movido' 
      AND posicao_anterior = 1
      AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
    `, [filaId]) as any;

    const ultimoAtendimento = await query(`
      SELECT created_at
      FROM log_fila 
      WHERE fila_id = ? 
      AND acao = 'movido' 
      AND posicao_anterior = 1
      ORDER BY created_at DESC
      LIMIT 1
    `, [filaId]) as any;

    // Calcular tempo sem atendimento
    let tempoSemAtendimento = 0;
    if (ultimoAtendimento && ultimoAtendimento.length > 0) {
      const ultimo = new Date(ultimoAtendimento[0].created_at);
      const agora = new Date();
      const diffMs = agora.getTime() - ultimo.getTime();
      tempoSemAtendimento = Math.max(0, Math.round(diffMs / (1000 * 60))); // em minutos
    }

    // Calcular tempo médio entre atendimentos
    const temposEntreAtendimentos = await query(`
      SELECT created_at
      FROM log_fila 
      WHERE fila_id = ? 
      AND acao = 'movido' 
      AND posicao_anterior = 1
      ORDER BY created_at DESC
      LIMIT 10
    `, [filaId]) as any;

    let tempoMedioEntre = 0;
    if (temposEntreAtendimentos.length > 1) {
      let totalMinutos = 0;
      let contador = 0;
      
      for (let i = 0; i < temposEntreAtendimentos.length - 1; i++) {
        const tempo1 = new Date(temposEntreAtendimentos[i].created_at);
        const tempo2 = new Date(temposEntreAtendimentos[i + 1].created_at);
        const diffMs = tempo1.getTime() - tempo2.getTime();
        const diffMinutos = Math.round(diffMs / (1000 * 60));
        totalMinutos += diffMinutos;
        contador++;
      }
      
      tempoMedioEntre = contador > 0 ? Math.round(totalMinutos / contador) : 0;
    }

    const resultado = {
      atendimentos_hoje: atendimentosHoje[0]?.total || 0,
      atendimentos_ontem: atendimentosOntem[0]?.total || 0,
      tempo_entre_atendimentos: tempoMedioEntre,
      tempo_sem_atendimento: tempoSemAtendimento
    };

    console.log('✅ Estatísticas finais:', resultado);
    return NextResponse.json(resultado);

  } catch (error: any) {
    console.error('❌ Error fetching estatisticas:', error);
    console.error('🔍 Stack trace:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
