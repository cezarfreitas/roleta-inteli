'use client';

import { useState, useEffect } from 'react';
import { X, Clock, User } from 'lucide-react';

interface LogEntry {
  id: number;
  acao: string;
  posicao_anterior: number;
  posicao_nova: number;
  created_at: string;
  usuario_nome: string;
  usuario_email: string;
}

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  filaId: number;
}

export default function LogModal({ isOpen, onClose, filaId }: LogModalProps) {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchLog();
    }
  }, [isOpen, filaId]);

  const fetchLog = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/filas/${filaId}/log?limit=100`);
      if (response.ok) {
        const data = await response.json();
        setLog(data);
      }
    } catch (error) {
      console.error('Erro ao buscar log:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Log de Atendimentos
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Histórico de usuários que passaram pela fila
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Log List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : log.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum atendimento registrado
              </h4>
              <p className="text-gray-600">
                Ainda não há registros de usuários passando por esta fila
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {log.map((entry) => {
                const { date, time } = formatDateTime(entry.created_at);
                return (
                  <div
                    key={entry.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {entry.usuario_nome}
                          </div>
                          <div className="text-sm text-gray-600">
                            {entry.usuario_email}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">Ação:</span> {entry.acao}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="font-medium">{date}</div>
                        <div>{time}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Total de {log.length} registro(s)
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
