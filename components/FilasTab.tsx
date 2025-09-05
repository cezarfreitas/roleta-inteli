'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import FilaCard from './FilaCard';

interface Fila {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  ativa: boolean;
  total_usuarios: number;
  aguardando: number;
  em_processamento: number;
}

export default function FilasTab() {
  const [filas, setFilas] = useState<Fila[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFila, setEditingFila] = useState<Fila | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cor: '#3B82F6'
  });

  useEffect(() => {
    fetchFilas();
  }, []);

  const fetchFilas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/filas');
      if (response.ok) {
        const data = await response.json();
        setFilas(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erro ao buscar filas:', error);
      setFilas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingFila 
        ? `/api/filas/${editingFila.id}`
        : '/api/filas';
      
      const method = editingFila ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchFilas();
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao salvar fila');
      }
    } catch (error) {
      console.error('Erro ao salvar fila:', error);
      alert('Erro ao salvar fila');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta fila?')) return;

    try {
      const response = await fetch(`/api/filas/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchFilas();
      } else {
        alert('Erro ao excluir fila');
      }
    } catch (error) {
      console.error('Erro ao excluir fila:', error);
      alert('Erro ao excluir fila');
    }
  };

  const handleEdit = (fila: Fila) => {
    setEditingFila(fila);
    setFormData({
      nome: fila.nome,
      descricao: fila.descricao,
      cor: fila.cor
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      cor: '#3B82F6'
    });
    setEditingFila(null);
    setShowAddModal(false);
  };

  const filteredFilas = filas.filter(fila =>
    fila.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fila.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Filas</h2>
          <p className="text-gray-600">Gerencie as filas do sistema</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Fila</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar filas por nome ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filas Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredFilas.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma fila encontrada</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Tente ajustar os termos de busca' : 'Comece criando sua primeira fila'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFilas.map((fila) => (
            <FilaCard
              key={fila.id}
              fila={fila}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingFila ? 'Editar Fila' : 'Nova Fila'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor
                  </label>
                  <input
                    type="color"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingFila ? 'Atualizar' : 'Criar'} Fila
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
