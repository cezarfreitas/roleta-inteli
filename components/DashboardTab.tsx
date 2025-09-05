'use client';

import { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, XCircle, TrendingUp, Activity } from 'lucide-react';

interface Stats {
  totalUsuarios: number;
  aguardando: number;
  emProcessamento: number;
  finalizados: number;
  pulados: number;
}

export default function DashboardTab() {
  const [stats, setStats] = useState<Stats>({
    totalUsuarios: 0,
    aguardando: 0,
    emProcessamento: 0,
    finalizados: 0,
    pulados: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Atualizar a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/usuarios');
      const usuarios = await response.json();
      
      const stats = usuarios.reduce((acc: Stats, usuario: any) => {
        acc.totalUsuarios++;
        switch (usuario.status_fila) {
          case 'aguardando':
            acc.aguardando++;
            break;
          case 'em processamento':
            acc.emProcessamento++;
            break;
          case 'finalizado':
            acc.finalizados++;
            break;
          case 'pulado':
            acc.pulados++;
            break;
        }
        return acc;
      }, {
        totalUsuarios: 0,
        aguardando: 0,
        emProcessamento: 0,
        finalizados: 0,
        pulados: 0,
      });

      setStats(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total de Usuários',
      value: stats.totalUsuarios,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Aguardando',
      value: stats.aguardando,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Em Processamento',
      value: stats.emProcessamento,
      icon: Activity,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Finalizados',
      value: stats.finalizados,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pulados',
      value: stats.pulados,
      icon: XCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-lg p-6 border border-gray-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900">Adicionar Usuário</span>
          </button>
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Clock className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900">Chamar Próximo</span>
          </button>
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900">Ver Relatórios</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Sistema iniciado com sucesso</span>
            <span className="text-xs text-gray-400 ml-auto">Agora</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">5 usuários carregados</span>
            <span className="text-xs text-gray-400 ml-auto">2 min atrás</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Fila configurada</span>
            <span className="text-xs text-gray-400 ml-auto">5 min atrás</span>
          </div>
        </div>
      </div>
    </div>
  );
}
