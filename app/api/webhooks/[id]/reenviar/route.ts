import { NextRequest, NextResponse } from 'next/server';
import { reenviarWebhook } from '@/lib/webhook';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resultado = await reenviarWebhook(parseInt(params.id));
    
    return NextResponse.json({
      message: 'Webhook reenviado com sucesso',
      resultado
    });
  } catch (error: any) {
    console.error('Error resending webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao reenviar webhook' },
      { status: 500 }
    );
  }
}
