import { NextResponse } from 'next/server';
import { buscarWebhooks } from '@/lib/webhook';

export async function GET() {
  try {
    const webhooks = await buscarWebhooks();
    return NextResponse.json(webhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar webhooks' },
      { status: 500 }
    );
  }
}
