'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import FilasTab from '@/components/FilasTab';
import UsuariosTab from '@/components/UsuariosTab';
import ConfiguracoesTab from '@/components/ConfiguracoesTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState('filas');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'filas':
        return 'Filas';
      case 'usuarios':
        return 'Usuários';
      case 'configuracoes':
        return 'Configurações';
      default:
        return 'Filas';
    }
  };

  const getTabSubtitle = () => {
    switch (activeTab) {
      case 'filas':
        return 'Gerencie suas filas de atendimento';
      case 'usuarios':
        return 'Gerencie todos os usuários do sistema';
      case 'configuracoes':
        return 'Configurações do sistema';
      default:
        return '';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'filas':
        return <FilasTab />;
      case 'usuarios':
        return <UsuariosTab />;
      case 'configuracoes':
        return <ConfiguracoesTab />;
      default:
        return <FilasTab />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
      />
      
      {/* Main Content */}
      <div className={`main-content transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header */}
        <Header title={getTabTitle()} subtitle={getTabSubtitle()} />
        
        {/* Page Content */}
        <main className="content-area bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
}