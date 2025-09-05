'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Plus, 
  History, 
  Copy, 
  Edit,
  Trash2, 
  UserX,
  Users,
  Clock,
  Calendar,
  TrendingUp,
  Database
} from 'lucide-react';
import AdicionarUsuarioModal from './AdicionarUsuarioModal';
import LogModal from './LogModal';
import WebhookLogsModal from './WebhookLogsModal';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  posicao: number;
  status_atual: string;
  total_atendimentos: number;
  percentual_atendimentos: number;
}

interface Estatisticas {
  atendimentos_hoje: number;
  atendimentos_ontem: number;
  tempo_entre_atendimentos: number;
  tempo_sem_atendimento: number;
}

interface FilaCardProps {
  fila: {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  total_usuarios: number;
  aguardando: number;
  em_processamento: number;
  };
  onDelete: (id: number) => void;
  onEdit: (fila: any) => void;
}

export default function FilaCard({ fila, onDelete, onEdit }: FilaCardProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [showAdicionarModal, setShowAdicionarModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showWebhookLogsModal, setShowWebhookLogsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      fetchUsuarios();
    fetchEstatisticas();
  }, [fila.id]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/filas/${fila.id}/usuarios`);
      if (response.ok) {
      const data = await response.json();
      setUsuarios(data);
      } else {
        setError('Erro ao carregar usuários');
      }
    } catch (error) {
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const fetchEstatisticas = async () => {
    try {
      const response = await fetch(`/api/filas/${fila.id}/estatisticas`);
      if (response.ok) {
        const data = await response.json();
        setEstatisticas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleChamarProximo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/filas/${fila.id}/acoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'chamar_proximo' })
      });

      if (response.ok) {
        await fetchUsuarios();
        await fetchEstatisticas();
      } else {
        const error = await response.json();
        setError(error.error || 'Erro ao avançar fila');
      }
    } catch (error) {
      setError('Erro ao avançar fila');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyWebhook = async () => {
    const webhookUrl = `${window.location.origin}/api/filas/${fila.id}/webhook`;
    try {
      await navigator.clipboard.writeText(webhookUrl);
      // Mostrar feedback visual (pode ser um toast)
      alert('Webhook copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar webhook:', error);
    }
  };

  const handleUsuarioAdicionado = () => {
          fetchUsuarios();
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? mins + 'm' : ''}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
      <div 
              className="w-4 h-4 rounded-full"
        style={{ backgroundColor: fila.cor }}
            />
          <div>
              <h3 className="text-lg font-semibold text-gray-900">{fila.nome}</h3>
              {fila.descricao && (
                <p className="text-sm text-gray-600">{fila.descricao}</p>
              )}
          </div>
        </div>

                     {/* Ações */}
           <div className="flex items-center space-x-2">
            <button
               onClick={handleChamarProximo}
               disabled={loading || usuarios.length === 0}
               className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
               title="Chamar próximo"
             >
               <Play className="h-3.5 w-3.5" />
            </button>
             
            <button
              onClick={() => setShowAdicionarModal(true)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Gerenciar usuários"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
             
          <button
               onClick={() => setShowLogModal(true)}
               className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
               title="Ver log"
             >
               <History className="h-3.5 w-3.5" />
          </button>
          
          <button
               onClick={() => setShowWebhookLogsModal(true)}
               className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
               title="Ver logs de webhook"
             >
               <Database className="h-3.5 w-3.5" />
          </button>
             
          <button
               onClick={handleCopyWebhook}
               className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
               title="Copiar webhook"
          >
               <Copy className="h-3.5 w-3.5" />
          </button>

        <button
               onClick={() => onEdit(fila)}
               className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
               title="Editar fila"
        >
               <Edit className="h-3.5 w-3.5" />
        </button>
             
              <button
               onClick={() => onDelete(fila.id)}
               className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
               title="Excluir fila"
             >
               <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
        </div>
      </div>

      {/* Estatísticas */}
      {estatisticas && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 relative flex items-center justify-center" title="Atendimentos de hoje">
              <Calendar className="h-3 w-3 text-blue-600 absolute top-2 right-2" />
              <div className="text-2xl font-bold text-blue-900 text-center">{estatisticas.atendimentos_hoje}</div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg border border-green-200 relative flex items-center justify-center" title="Atendimentos de ontem">
              <Calendar className="h-3 w-3 text-green-600 absolute top-2 right-2" />
              <div className="text-2xl font-bold text-green-900 text-center">{estatisticas.atendimentos_ontem}</div>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 relative flex items-center justify-center" title="Tempo entre atendimentos">
              <Clock className="h-3 w-3 text-purple-600 absolute top-2 right-2" />
              <div className="text-2xl font-bold text-purple-900 text-center">{formatTime(estatisticas.tempo_entre_atendimentos)}</div>
            </div>
            
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 relative flex items-center justify-center" title="Tempo sem atendimento">
              <TrendingUp className="h-3 w-3 text-orange-600 absolute top-2 right-2" />
              <div className="text-2xl font-bold text-orange-900 text-center">{formatTime(estatisticas.tempo_sem_atendimento)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Usuários */}
      <div className="p-4">
          {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-600">{error}</div>
        ) : usuarios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhum usuário na fila</p>
            </div>
          ) : (
          <div className="space-y-2">
            {usuarios.map((usuario, index) => (
              <div
                key={usuario.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  usuario.status_atual === 'ausente' 
                    ? 'bg-orange-50 border-orange-200' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Avatar com inicial */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                    usuario.status_atual === 'ausente' 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {usuario.nome.charAt(0).toUpperCase()}
                    </div>
                  
                  {/* Nome e status */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 truncate">{usuario.nome}</span>
                      {usuario.status_atual === 'ausente' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 flex-shrink-0">
                          Ausente
                        </span>
                      )}
                      </div>
                    </div>
                  </div>
                
                {/* Informações do usuário */}
                <div className="flex items-center space-x-4 text-sm text-gray-600 flex-shrink-0">
                  <span>{usuario.total_atendimentos} atend.</span>
                  <span className="text-gray-500">{usuario.percentual_atendimentos}%</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                      </div>
                  </div>
                </div>
              ))}
                </div>
              )}
            </div>

      {/* Modais */}
      <AdicionarUsuarioModal
        isOpen={showAdicionarModal}
        onClose={() => setShowAdicionarModal(false)}
        filaId={fila.id}
        onUsuarioAdicionado={handleUsuarioAdicionado}
      />

      <LogModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        filaId={fila.id}
      />

      <WebhookLogsModal
        isOpen={showWebhookLogsModal}
        onClose={() => setShowWebhookLogsModal(false)}
        filaId={fila.id}
      />
    </div>
  );
}

