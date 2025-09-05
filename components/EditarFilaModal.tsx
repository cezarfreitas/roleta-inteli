'use client';

import { useState, useEffect } from 'react';
import { X, Palette } from 'lucide-react';

interface Fila {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  ativa: boolean;
}

interface EditarFilaModalProps {
  fila: Fila;
  onClose: () => void;
  onSuccess: () => void;
}

const cores = [
  { nome: 'Azul', valor: '#3B82F6' },
  { nome: 'Verde', valor: '#10B981' },
  { nome: 'Amarelo', valor: '#F59E0B' },
  { nome: 'Vermelho', valor: '#EF4444' },
  { nome: 'Roxo', valor: '#8B5CF6' },
  { nome: 'Rosa', valor: '#EC4899' },
  { nome: 'Indigo', valor: '#6366F1' },
  { nome: 'Teal', valor: '#14B8A6' },
];

export default function EditarFilaModal({ fila, onClose, onSuccess }: EditarFilaModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cor: '#3B82F6',
    ativa: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      nome: fila.nome,
      descricao: fila.descricao || '',
      cor: fila.cor,
      ativa: fila.ativa
    });
  }, [fila]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/filas/${fila.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao atualizar fila');
      }
    } catch (error) {
      console.error('Erro ao atualizar fila:', error);
      alert('Erro ao atualizar fila');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Editar Fila</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Fila *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="input"
              placeholder="Ex: Atendimento Geral"
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
              className="input"
              rows={3}
              placeholder="Descreva o propósito desta fila..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor da Fila
            </label>
            <div className="grid grid-cols-4 gap-2">
              {cores.map((cor) => (
                <button
                  key={cor.valor}
                  type="button"
                  onClick={() => setFormData({ ...formData, cor: cor.valor })}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center ${
                    formData.cor === cor.valor
                      ? 'border-gray-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: cor.valor }}
                  title={cor.nome}
                >
                  {formData.cor === cor.valor && (
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <Palette className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Cor selecionada: {formData.cor}
              </span>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.ativa}
                onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Fila ativa
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Filas inativas não aparecerão na lista principal
            </p>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div 
              className="p-4 rounded-lg text-white"
              style={{ backgroundColor: formData.cor }}
            >
              <h3 className="font-semibold">
                {formData.nome || 'Nome da Fila'}
              </h3>
              <p className="text-sm opacity-90">
                {formData.descricao || 'Descrição da fila...'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.nome.trim()}
              className="flex-1 btn btn-primary disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
