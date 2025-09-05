import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filaId = searchParams.get('fila_id');
    
    let query_sql = 'SELECT * FROM webhook_logs';
    let params: any[] = [];
    
    if (filaId) {
      query_sql += ' WHERE fila_id = ?';
      params.push(filaId);
    }
    
    query_sql += ' ORDER BY created_at DESC LIMIT 50';
    
    const logs = await query(query_sql, params) as any;
    
    return NextResponse.json({
      logs,
      pagination: {
        total: logs.length,
        limit: 50,
        offset: 0,
        hasMore: false
      }
    });

  } catch (error: any) {
    console.error('Error fetching webhook logs:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar logs de webhook: ' + error.message },
      { status: 500 }
    );
  }
}
