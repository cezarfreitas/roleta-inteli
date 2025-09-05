'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Webhook {
  id: number;
  usuario_id: number;
  usuario_nome: string;
  usuario_email: string;
  url_destino: string;
  payload: string;
  resposta: string;
  status: string;
  codigo_resposta: number;
  data_envio: string;
  data_resposta: string;
}

export default function WebhooksTab() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebhooks();
    const interval = setInterval(fetchWebhooks, 10000); // Atualizar a cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/webhooks');
      const data = await response.json();
      setWebhooks(data);
    } catch (error) {
      console.error('Erro ao buscar webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async (webhookId: number) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}/reenviar`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchWebhooks();
        alert('Webhook reenviado com sucesso');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao reenviar webhook');
      }
    } catch (error) {
      console.error('Erro ao reenviar webhook:', error);
      alert('Erro ao reenviar webhook');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sucesso':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'falha':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      enviado: { label: 'Enviado', class: 'bg-yellow-100 text-yellow-800' },
      sucesso: { label: 'Sucesso', class: 'bg-green-100 text-green-800' },
      falha: { label: 'Falha', class: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.enviado;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
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
          <h2 className="text-lg font-medium text-gray-900">Histórico de Webhooks</h2>
          <button
            onClick={fetchWebhooks}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>URL Destino</th>
              <th>Status</th>
              <th>Código Resposta</th>
              <th>Data Envio</th>
              <th>Data Resposta</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {webhooks.map((webhook) => (
              <tr key={webhook.id} className="hover:bg-gray-50">
                <td>
                  <div>
                    <p className="font-medium text-gray-900">{webhook.usuario_nome}</p>
                    <p className="text-sm text-gray-600">{webhook.usuario_email}</p>
                  </div>
                </td>
                <td className="max-w-xs truncate" title={webhook.url_destino}>
                  {webhook.url_destino}
                </td>
                <td>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(webhook.status)}
                    {getStatusBadge(webhook.status)}
                  </div>
                </td>
                <td className="text-center">
                  {webhook.codigo_resposta ? (
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      webhook.codigo_resposta >= 200 && webhook.codigo_resposta < 300
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {webhook.codigo_resposta}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="text-sm text-gray-600">
                  {formatDate(webhook.data_envio)}
                </td>
                <td className="text-sm text-gray-600">
                  {webhook.data_resposta ? formatDate(webhook.data_resposta) : '-'}
                </td>
                <td>
                  <div className="flex space-x-2">
                    {webhook.status === 'falha' && (
                      <button
                        onClick={() => handleReenviar(webhook.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        title="Reenviar"
                      >
                        Reenviar
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const details = `
                          Payload: ${webhook.payload}
                          Resposta: ${webhook.resposta || 'N/A'}
                        `;
                        alert(details);
                      }}
                      className="text-gray-600 hover:text-gray-800 text-sm"
                      title="Ver Detalhes"
                    >
                      Detalhes
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {webhooks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum webhook registrado.
        </div>
      )}

      {/* Estatísticas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sucessos</p>
              <p className="text-2xl font-bold text-gray-900">
                {webhooks.filter(w => w.status === 'sucesso').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Falhas</p>
              <p className="text-2xl font-bold text-gray-900">
                {webhooks.filter(w => w.status === 'falha').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{webhooks.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
