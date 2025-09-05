'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';

interface Configuracao {
  id: number;
  chave: string;
  valor: string;
  data_atualizacao: string;
}

export default function ConfiguracoesTab() {
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  const fetchConfiguracoes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/configuracoes');
      const data = await response.json();
      
      // Verificar se data é um array ou tem a propriedade value
      const configuracoesArray = Array.isArray(data) ? data : (data.value || []);
      
      if (Array.isArray(configuracoesArray)) {
        setConfiguracoes(configuracoesArray);
        
        // Inicializar valores de edição
        const initialValues: Record<string, string> = {};
        configuracoesArray.forEach((config: Configuracao) => {
          initialValues[config.chave] = config.valor;
        });
        setEditingValues(initialValues);
      } else {
        console.error('Dados de configurações não são um array:', data);
        setConfiguracoes([]);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      setConfiguracoes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (chave: string) => {
    try {
      setSaving(true);
      const response = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chave,
          valor: editingValues[chave]
        }),
      });

      if (response.ok) {
        await fetchConfiguracoes();
        alert('Configuração salva com sucesso');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      alert('Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (chave: string, valor: string) => {
    setEditingValues(prev => ({
      ...prev,
      [chave]: valor
    }));
  };

  const getConfigLabel = (chave: string) => {
    const labels: Record<string, string> = {
      webhook_url: 'URL do Webhook',
      webhook_timeout: 'Timeout do Webhook (ms)',
      max_tentativas_webhook: 'Máximo de Tentativas',
      lead_api_id: 'ID da API de Leads',
      lead_api_token: 'Token da API de Leads'
    };
    return labels[chave] || chave;
  };

  const getConfigDescription = (chave: string) => {
    const descriptions: Record<string, string> = {
      webhook_url: 'URL para onde os webhooks serão enviados quando um usuário for chamado',
      webhook_timeout: 'Tempo limite em milissegundos para aguardar resposta do webhook',
      max_tentativas_webhook: 'Número máximo de tentativas para reenviar webhooks falhados',
      lead_api_id: 'ID usado para consultar dados de leads na API externa (parâmetro "i")',
      lead_api_token: 'Token de autenticação para acessar a API de leads externa'
    };
    return descriptions[chave] || '';
  };

  const getConfigType = (chave: string) => {
    if (chave.includes('timeout') || chave.includes('tentativas')) {
      return 'number';
    }
    if (chave.includes('token')) {
      return 'password';
    }
    return 'text';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Configurações do Sistema</h2>
          <button
            onClick={fetchConfiguracoes}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Atualizar</span>
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Configure as principais funcionalidades do sistema de fila e webhooks.
        </p>
      </div>

      <div className="space-y-6">
        {Array.isArray(configuracoes) && configuracoes.map((config) => (
          <div key={config.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {getConfigLabel(config.chave)}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {getConfigDescription(config.chave)}
                </p>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type={getConfigType(config.chave)}
                      value={editingValues[config.chave] || ''}
                      onChange={(e) => handleChange(config.chave, e.target.value)}
                      className="input"
                      placeholder={`Digite o valor para ${getConfigLabel(config.chave)}`}
                    />
                  </div>
                  
                  <button
                    onClick={() => handleSave(config.chave)}
                    disabled={saving}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Salvando...' : 'Salvar'}</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Última atualização: {new Date(config.data_atualizacao).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Informações Adicionais */}
      <div className="mt-8 card bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-3">Informações sobre Webhooks e API de Leads</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>URL do Webhook:</strong> Configure a URL para onde o sistema enviará notificações 
            quando um usuário for chamado da fila. O sistema enviará um POST com os dados do usuário.
          </p>
          <p>
            <strong>Timeout:</strong> Define quanto tempo o sistema aguardará por uma resposta 
            do servidor de destino antes de considerar o webhook como falhado.
          </p>
          <p>
            <strong>Tentativas:</strong> Número máximo de vezes que o sistema tentará reenviar 
            um webhook que falhou.
          </p>
          <p>
            <strong>ID da API de Leads:</strong> Identificador usado no parâmetro "i" para consultar 
            dados de leads na API externa (ex: "grupointeli").
          </p>
          <p>
            <strong>Token da API de Leads:</strong> Token de autenticação necessário para acessar 
            a API externa de leads e atualizar informações como userAccess e owner.
          </p>
        </div>
      </div>

      {/* Exemplo de Payload */}
      <div className="mt-6 card bg-gray-50 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Exemplo de Payload do Webhook</h3>
        <div className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">
{`{
  "usuario": {
    "id": 223,
    "nome": "Cristiane",
    "email": "atendimento@scoutdoor.com.br",
    "telefone": "5547996400117",
    "posicao_anterior": 1,
    "nova_posicao": 5
  },
  "lead": {
    "id": 62075,
    "firstname": "Ezequias",
    "lastname": "Lima",
    "whatsapp": "559188223795",
    "owner": 223,
    "userAccess": [243, 223]
  },
  "lead_consultado": "62075",
  "vendedor_adicionado": 223,
  "fila_id": 2,
  "timestamp": "2025-09-05T02:45:12.207Z",
  "message": "Fila avançada via webhook com dados do lead 62075 e vendedor 223 definido como owner e adicionado ao userAccess"
}`}
          </pre>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Este payload será enviado automaticamente sempre que um usuário for chamado da fila, 
          incluindo dados do lead consultado na API externa e informações sobre atualizações realizadas.
        </p>
      </div>
    </div>
  );
}
