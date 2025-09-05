'use client';

import { 
  Users, 
  Clock, 
  Settings, 
  Menu, 
  X,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
}

export default function Sidebar({ activeTab, onTabChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  const menuItems = [
    { id: 'filas', label: 'Filas', icon: Clock },
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 fixed left-0 top-0 h-full z-40 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">Sistema Fila</h1>
            </div>
          )}
          <button
            onClick={() => onToggleCollapse(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <Menu className="h-6 w-6 text-gray-600" />
            ) : (
              <X className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'} ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Sistema Fila Admin v1.0
          </div>
        </div>
      )}
    </div>
  );
}
