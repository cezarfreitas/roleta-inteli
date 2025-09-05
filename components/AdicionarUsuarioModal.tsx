'use client';

import { useState, useEffect } from 'react';
import { X, Search, UserPlus, UserMinus, Users } from 'lucide-react';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

interface UsuarioNaFila {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  status_atual: string;
  posicao: number;
}

interface AdicionarUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  filaId: number;
  onUsuarioAdicionado: () => void;
}

export default function AdicionarUsuarioModal({ isOpen, onClose, filaId, onUsuarioAdicionado }: AdicionarUsuarioModalProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosNaFila, setUsuariosNaFila] = useState<UsuarioNaFila[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsuarios, setSelectedUsuarios] = useState<number[]>([]);
  const [selectedUsuariosParaRemover, setSelectedUsuariosParaRemover] = useState<number[]>([]);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsuariosDisponiveis();
      fetchUsuariosNaFila();
    }
  }, [isOpen]);

  const fetchUsuariosDisponiveis = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/usuarios/disponiveis');
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao buscar usuários disponíveis:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuariosNaFila = async () => {
    try {
      const response = await fetch(`/api/filas/${filaId}/usuarios`);
      if (response.ok) {
        const data = await response.json();
        setUsuariosNaFila(data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários na fila:', error);
    }
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsuariosNaFila = usuariosNaFila.filter(usuario =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleUsuario = (usuarioId: number) => {
    setSelectedUsuarios(prev => 
      prev.includes(usuarioId) 
        ? prev.filter(id => id !== usuarioId)
        : [...prev, usuarioId]
    );
  };

  const handleToggleUsuarioParaRemover = (usuarioId: number) => {
    setSelectedUsuariosParaRemover(prev => 
      prev.includes(usuarioId) 
        ? prev.filter(id => id !== usuarioId)
        : [...prev, usuarioId]
    );
  };

  const handleAdicionarUsuarios = async () => {
    if (selectedUsuarios.length === 0) return;

    setAdding(true);
    try {
      // Adicionar usuários um por vez
      for (const usuarioId of selectedUsuarios) {
        const response = await fetch(`/api/filas/${filaId}/usuarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuarioId })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao adicionar usuário');
        }
      }

      onUsuarioAdicionado();
      onClose();
      setSelectedUsuarios([]);
    } catch (error: any) {
      console.error('Erro ao adicionar usuários:', error);
      alert(error.message || 'Erro ao adicionar usuários');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoverUsuarios = async () => {
    if (selectedUsuariosParaRemover.length === 0) return;

    setRemoving(true);
    try {
      // Remover usuários um por vez
      for (const usuarioId of selectedUsuariosParaRemover) {
        const response = await fetch(`/api/filas/${filaId}/usuarios/${usuarioId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao remover usuário');
        }
      }

      onUsuarioAdicionado();
      onClose();
      setSelectedUsuariosParaRemover([]);
    } catch (error: any) {
      console.error('Erro ao remover usuários:', error);
      alert(error.message || 'Erro ao remover usuários');
    } finally {
      setRemoving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Gerenciar Usuários da Fila
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Adicione ou remova usuários da fila
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuários por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Main Content - Horizontal Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Adicionar Usuários */}
          <div className="flex-1 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <h4 className="text-lg font-semibold text-blue-900">Adicionar Usuários</h4>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Selecione usuários disponíveis para adicionar à fila
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredUsuarios.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum usuário disponível
                  </h4>
                  <p className="text-gray-600">
                    Todos os usuários já estão em filas ativas
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsuarios.map((usuario) => (
                    <div
                      key={usuario.id}
                      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedUsuarios.includes(usuario.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleToggleUsuario(usuario.id)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{usuario.nome}</div>
                        <div className="text-sm text-gray-600">{usuario.email}</div>
                        {usuario.telefone && (
                          <div className="text-sm text-gray-500">{usuario.telefone}</div>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedUsuarios.includes(usuario.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedUsuarios.includes(usuario.id) && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Remover Usuários */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-red-50">
              <div className="flex items-center space-x-2">
                <UserMinus className="h-5 w-5 text-red-600" />
                <h4 className="text-lg font-semibold text-red-900">Remover Usuários</h4>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Selecione usuários na fila para remover
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {filteredUsuariosNaFila.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum usuário na fila
                  </h4>
                  <p className="text-gray-600">
                    Não há usuários para remover desta fila
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsuariosNaFila.map((usuario) => (
                    <div
                      key={usuario.id}
                      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedUsuariosParaRemover.includes(usuario.id)
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleToggleUsuarioParaRemover(usuario.id)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{usuario.nome}</div>
                        <div className="text-sm text-gray-600">{usuario.email}</div>
                        <div className="text-sm text-gray-500">
                          Posição: {usuario.posicao} • Status: {usuario.status_atual}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedUsuariosParaRemover.includes(usuario.id)
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedUsuariosParaRemover.includes(usuario.id) && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="text-blue-600 font-medium">{selectedUsuarios.length}</span> usuário(s) para adicionar • 
              <span className="text-red-600 font-medium ml-1">{selectedUsuariosParaRemover.length}</span> usuário(s) para remover
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionarUsuarios}
                disabled={selectedUsuarios.length === 0 || adding}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>{adding ? 'Adicionando...' : `Adicionar (${selectedUsuarios.length})`}</span>
              </button>
              <button
                onClick={handleRemoverUsuarios}
                disabled={selectedUsuariosParaRemover.length === 0 || removing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <UserMinus className="h-4 w-4" />
                <span>{removing ? 'Removendo...' : `Remover (${selectedUsuariosParaRemover.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
