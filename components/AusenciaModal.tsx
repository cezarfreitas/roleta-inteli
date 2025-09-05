'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Plus, Trash2, Edit } from 'lucide-react';

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

interface Ausencia {
  id: number;
  data_inicio: string;
  data_fim: string;
  motivo: string;
  ativa: boolean;
  created_at: string;
}

interface AusenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario;
}

export default function AusenciaModal({ isOpen, onClose, usuario }: AusenciaModalProps) {
  const [ausencias, setAusencias] = useState<Ausencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAusencia, setEditingAusencia] = useState<Ausencia | null>(null);
  const [formData, setFormData] = useState({
    data_inicio: '',
    data_fim: '',
    motivo: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchAusencias();
    }
  }, [isOpen, usuario.id]);

  const fetchAusencias = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/usuarios/${usuario.id}/ausencias`);
      if (response.ok) {
        const data = await response.json();
        setAusencias(data);
      }
    } catch (error) {
      console.error('Erro ao buscar ausências:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingAusencia 
        ? `/api/usuarios/${usuario.id}/ausencias`
        : `/api/usuarios/${usuario.id}/ausencias`;
      
      const method = editingAusencia ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...(editingAusencia && { ausenciaId: editingAusencia.id })
        })
      });

      if (response.ok) {
        fetchAusencias();
        resetForm();
      } else {
        const error = await response.json();
        alert('Erro: ' + (error.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao salvar ausência:', error);
      alert('Erro ao salvar ausência');
    }
  };

  const handleDelete = async (ausenciaId: number) => {
    if (!confirm('Tem certeza que deseja remover esta ausência?')) {
      return;
    }

    try {
      const response = await fetch(`/api/usuarios/${usuario.id}/ausencias`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ausenciaId })
      });

      if (response.ok) {
        fetchAusencias();
      } else {
        const error = await response.json();
        alert('Erro: ' + (error.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao remover ausência:', error);
      alert('Erro ao remover ausência');
    }
  };

  const handleToggleStatus = async (ausenciaId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/usuarios/${usuario.id}/ausencias`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ausenciaId,
          ativa: !currentStatus
        })
      });

      if (response.ok) {
        fetchAusencias();
      } else {
        const error = await response.json();
        alert('Erro: ' + (error.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao alterar status da ausência:', error);
      alert('Erro ao alterar status da ausência');
    }
  };

  const resetForm = () => {
    setFormData({
      data_inicio: '',
      data_fim: '',
      motivo: ''
    });
    setEditingAusencia(null);
    setShowForm(false);
  };

  const handleEdit = (ausencia: Ausencia) => {
    setEditingAusencia(ausencia);
    setFormData({
      data_inicio: ausencia.data_inicio,
      data_fim: ausencia.data_fim,
      motivo: ausencia.motivo
    });
    setShowForm(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Gerenciar Ausências
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Usuário: <span className="font-medium">{usuario.nome}</span> ({usuario.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add/Edit Form */}
          {showForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                {editingAusencia ? 'Editar Ausência' : 'Nova Ausência'}
              </h4>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Fim *
                    </label>
                    <input
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo *
                  </label>
                  <textarea
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingAusencia ? 'Atualizar' : 'Criar'} Ausência
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add Button */}
          {!showForm && (
            <div className="mb-6">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Nova Ausência</span>
              </button>
            </div>
          )}

          {/* Ausencias List */}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : ausencias.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma ausência registrada
              </h4>
              <p className="text-gray-600">
                Este usuário não possui períodos de ausência registrados
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {ausencias.map((ausencia) => (
                <div
                  key={ausencia.id}
                  className={`p-4 rounded-lg border-2 ${
                    ausencia.ativa 
                      ? 'border-orange-200 bg-orange-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ausencia.ativa 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ausencia.ativa ? 'Ativa' : 'Inativa'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(ausencia.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            <span className="font-medium">Início:</span> {new Date(ausencia.data_inicio).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            <span className="font-medium">Fim:</span> {new Date(ausencia.data_fim).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Motivo:</span> {ausencia.motivo}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleToggleStatus(ausencia.id, ausencia.ativa)}
                        className={`p-2 rounded-lg transition-colors ${
                          ausencia.ativa 
                            ? 'text-orange-600 hover:bg-orange-100' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        title={ausencia.ativa ? 'Desativar ausência' : 'Ativar ausência'}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleEdit(ausencia)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar ausência"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(ausencia.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Remover ausência"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
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
