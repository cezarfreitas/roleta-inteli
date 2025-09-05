import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface UsuarioImportado {
  id?: number;
  name: string;
  email: string;
  telephone?: string;
  whatsapp?: string | string[];
  whatsapp_automation?: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Iniciando importação de usuários para o sistema...');

    // Fazer requisição para a API externa
    const response = await fetch(
      'https://sprinthub-api-master.sprinthub.app/user?apitoken=e24be9a5-c50d-44a6-8128-e21ab15e63af&i=grupointeli',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro na API externa: ${response.status}`);
    }

    const usuariosExternos: UsuarioImportado[] = await response.json();

    if (!Array.isArray(usuariosExternos)) {
      return NextResponse.json(
        { error: 'Formato de dados inválido da API externa' },
        { status: 400 }
      );
    }

    let importados = 0;
    let ignorados = 0;
    const erros: string[] = [];

    for (const usuarioExterno of usuariosExternos) {
      try {
        // Validar dados obrigatórios
        if (!usuarioExterno.name || !usuarioExterno.email) {
          erros.push(`Usuário sem nome ou email: ${JSON.stringify(usuarioExterno)}`);
          ignorados++;
          continue;
        }

        // Verificar se usuário já existe no sistema (por ID ou email)
        const existingUser = await query(
          'SELECT id FROM usuarios WHERE id = ? OR email = ?',
          [usuarioExterno.id, usuarioExterno.email]
        );

        if (Array.isArray(existingUser) && existingUser.length > 0) {
          ignorados++;
          continue;
        }

        // Extrair WhatsApp (priorizar whatsapp_automation, depois whatsapp, depois telephone)
        let whatsapp = null;
        if (usuarioExterno.whatsapp_automation) {
          whatsapp = usuarioExterno.whatsapp_automation;
        } else if (usuarioExterno.whatsapp) {
          // Se whatsapp é array, pegar o primeiro elemento
          whatsapp = Array.isArray(usuarioExterno.whatsapp) 
            ? usuarioExterno.whatsapp[0] 
            : usuarioExterno.whatsapp;
        } else if (usuarioExterno.telephone) {
          whatsapp = usuarioExterno.telephone;
        }

        // Garantir que todos os valores sejam null em vez de undefined
        const telefone = usuarioExterno.telephone || null;
        const whatsappFinal = whatsapp || null;

        // Inserir usuário no sistema com ID da API externa e WhatsApp
        await query(
          'INSERT INTO usuarios (id, nome, email, telefone, whatsapp) VALUES (?, ?, ?, ?, ?)',
          [
            usuarioExterno.id,
            usuarioExterno.name,
            usuarioExterno.email,
            telefone,
            whatsappFinal
          ]
        );

        importados++;
      } catch (error: any) {
        erros.push(`Erro ao importar ${usuarioExterno.name}: ${error.message}`);
        ignorados++;
      }
    }

    return NextResponse.json({
      message: 'Usuários importados com sucesso para o sistema',
      importados,
      ignorados,
      total: usuariosExternos.length,
      erros: erros.slice(0, 10) // Limitar a 10 erros para não sobrecarregar a resposta
    });

  } catch (error: any) {
    console.error('Error importing usuarios:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao importar usuários' },
      { status: 500 }
    );
  }
}
