'use client';

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Filter, Calendar, User, Database, AlertCircle, CheckCircle } from 'lucide-react';

interface WebhookLog {
  id: number;
  fila_id: number;
  usuario_id: number;
  lead_id: number;
  acao: string;
  dados_antes: any;
  dados_depois: any;
  user_access_antes: number[];
  user_access_depois: number[];
  owner_antes: number;
  owner_depois: number;
  status: string;
  erro: string;
  created_at: string;
  usuario_nome?: string;
  usuario_email?: string;
  fila_nome?: string;
}

interface WebhookLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  filaId?: number;
  leadId?: number;
}

export default function WebhookLogsModal({ isOpen, onClose, filaId, leadId }: WebhookLogsModalProps) {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  });

  const fetchLogs = async (offset = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: offset.toString()
      });

      if (filaId) params.append('fila_id', filaId.toString());
      if (leadId) params.append('lead_id', leadId.toString());

      const response = await fetch(`/api/webhook-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(offset === 0 ? data.logs : [...logs, ...data.logs]);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs(0);
    }
  }, [isOpen, filaId, leadId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusIcon = (status: string) => {
    return status === 'sucesso' ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'sucesso' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Logs de Webhook
            </h2>
            {filaId && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                Fila: {filaId}
              </span>
            )}
            {leadId && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                Lead: {leadId}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchLogs(0)}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum log encontrado</p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(log.status)}
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {log.acao.replace('_', ' ').toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {log.usuario_nome} • {log.fila_nome}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(log.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Antes:</h4>
                        <div className="bg-gray-50 p-3 rounded">
                          <p><strong>Owner:</strong> {log.owner_antes || 'N/A'}</p>
                          <p><strong>UserAccess:</strong> {log.user_access_antes ? JSON.stringify(log.user_access_antes) : 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Depois:</h4>
                        <div className="bg-gray-50 p-3 rounded">
                          <p><strong>Owner:</strong> {log.owner_depois || 'N/A'}</p>
                          <p><strong>UserAccess:</strong> {log.user_access_depois ? JSON.stringify(log.user_access_depois) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {log.erro && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">
                          <strong>Erro:</strong> {log.erro}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {pagination.hasMore && (
          <div className="border-t p-4">
            <button
              onClick={() => fetchLogs(pagination.offset + pagination.limit)}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Carregar Mais'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
