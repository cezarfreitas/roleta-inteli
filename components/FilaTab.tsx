'use client';

import { useState, useEffect } from 'react';
import { Play, Check, SkipForward, Clock, User } from 'lucide-react';

interface FilaItem {
  id: number;
  posicao: number;
  status: string;
  data_entrada: string;
  usuario_id: number;
  nome: string;
  email: string;
  telefone: string;
}

interface FilaTabProps {
  onRefresh?: () => void;
}

export default function FilaTab({ onRefresh }: FilaTabProps) {
  const [fila, setFila] = useState<FilaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FilaItem | null>(null);

  useEffect(() => {
    fetchFila();
    const interval = setInterval(fetchFila, 5000); // Atualizar a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchFila = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fila');
      const data = await response.json();
      setFila(data);
      
      // Encontrar usuário atual (em processamento)
      const emProcessamento = data.find((item: FilaItem) => item.status === 'em_processamento');
      setCurrentUser(emProcessamento || null);
    } catch (error) {
      console.error('Erro ao buscar fila:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChamarProximo = async () => {
    try {
      const response = await fetch('/api/fila', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acao: 'chamar_proximo',
          usuario_id: 0 // Não é necessário para chamar próximo
        }),
      });

      if (response.ok) {
        await fetchFila();
        onRefresh?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao chamar próximo usuário');
      }
    } catch (error) {
      console.error('Erro ao chamar próximo usuário:', error);
      alert('Erro ao chamar próximo usuário');
    }
  };

  const handleFinalizar = async (usuarioId: number) => {
    try {
      const response = await fetch('/api/fila', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acao: 'finalizar',
          usuario_id: usuarioId
        }),
      });

      if (response.ok) {
        await fetchFila();
        onRefresh?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao finalizar usuário');
      }
    } catch (error) {
      console.error('Erro ao finalizar usuário:', error);
      alert('Erro ao finalizar usuário');
    }
  };

  const handlePular = async (usuarioId: number) => {
    try {
      const response = await fetch('/api/fila', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acao: 'pular',
          usuario_id: usuarioId
        }),
      });

      if (response.ok) {
        await fetchFila();
        onRefresh?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao pular usuário');
      }
    } catch (error) {
      console.error('Erro ao pular usuário:', error);
      alert('Erro ao pular usuário');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aguardando: { label: 'Aguardando', class: 'bg-yellow-100 text-yellow-800' },
      em_processamento: { label: 'Em Processamento', class: 'bg-blue-100 text-blue-800' },
      finalizado: { label: 'Finalizado', class: 'bg-green-100 text-green-800' },
      pulado: { label: 'Pulado', class: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.aguardando;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const aguardando = fila.filter(item => item.status === 'aguardando');
  const emProcessamento = fila.filter(item => item.status === 'em_processamento');
  const finalizados = fila.filter(item => item.status === 'finalizado');
  const pulados = fila.filter(item => item.status === 'pulado');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles da Fila */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-blue-900">Controles da Fila</h3>
            <p className="text-sm text-blue-700">
              {aguardando.length} usuário(s) aguardando
            </p>
          </div>
          <button
            onClick={handleChamarProximo}
            disabled={aguardando.length === 0}
            className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            <span>Chamar Próximo</span>
          </button>
        </div>
      </div>

      {/* Usuário Atual */}
      {currentUser && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-green-900">Usuário Atual</h3>
              <div className="mt-2">
                <p className="font-medium text-green-800">{currentUser.nome}</p>
                <p className="text-sm text-green-700">{currentUser.email}</p>
                <p className="text-sm text-green-700">Posição: {currentUser.posicao}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFinalizar(currentUser.usuario_id)}
                className="btn btn-success flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Finalizar</span>
              </button>
              <button
                onClick={() => handlePular(currentUser.usuario_id)}
                className="btn btn-warning flex items-center space-x-2"
              >
                <SkipForward className="w-4 h-4" />
                <span>Pular</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista da Fila */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Situação da Fila</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Aguardando */}
          <div className="card">
            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-yellow-600" />
              Aguardando ({aguardando.length})
            </h4>
            <div className="space-y-2">
              {aguardando.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-800 font-medium text-sm">
                      {item.posicao}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.nome}</p>
                      <p className="text-sm text-gray-600">{item.email}</p>
                    </div>
                  </div>
                </div>
              ))}
              {aguardando.length === 0 && (
                <p className="text-gray-500 text-center py-4">Nenhum usuário aguardando</p>
              )}
            </div>
          </div>

          {/* Em Processamento */}
          <div className="card">
            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <User className="w-4 h-4 mr-2 text-blue-600" />
              Em Processamento ({emProcessamento.length})
            </h4>
            <div className="space-y-2">
              {emProcessamento.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-medium text-sm">
                      {item.posicao}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.nome}</p>
                      <p className="text-sm text-gray-600">{item.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleFinalizar(item.usuario_id)}
                      className="btn btn-success text-sm px-3 py-1"
                    >
                      Finalizar
                    </button>
                    <button
                      onClick={() => handlePular(item.usuario_id)}
                      className="btn btn-warning text-sm px-3 py-1"
                    >
                      Pular
                    </button>
                  </div>
                </div>
              ))}
              {emProcessamento.length === 0 && (
                <p className="text-gray-500 text-center py-4">Nenhum usuário em processamento</p>
              )}
            </div>
          </div>
        </div>

        {/* Finalizados e Pulados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="card">
            <h4 className="text-md font-medium text-gray-900 mb-3">Finalizados ({finalizados.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {finalizados.map((item) => (
                <div key={item.id} className="p-2 bg-green-50 rounded text-sm">
                  <p className="font-medium text-gray-900">{item.nome}</p>
                  <p className="text-gray-600">Posição: {item.posicao}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h4 className="text-md font-medium text-gray-900 mb-3">Pulados ({pulados.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {pulados.map((item) => (
                <div key={item.id} className="p-2 bg-red-50 rounded text-sm">
                  <p className="font-medium text-gray-900">{item.nome}</p>
                  <p className="text-gray-600">Posição: {item.posicao}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
