import React from 'react';
import {
  ClipboardList,
  PackageCheck,
  Users,
  BadgeDollarSign,
  BarChart3,
  Settings,
} from 'lucide-react';

export type NavTab = 'orders' | 'inventory' | 'clients' | 'financial' | 'reports';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  ordersBadge?: number;
  inventoryAlertBadge?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  ordersBadge,
  inventoryAlertBadge,
}) => {
  const tabs = [
    {
      id: 'orders' as NavTab,
      label: 'Ordens de Serviço (OS)',
      icon: ClipboardList,
      badge: ordersBadge,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    {
      id: 'inventory' as NavTab,
      label: 'Estoque de Peças',
      icon: PackageCheck,
      badge: inventoryAlertBadge && inventoryAlertBadge > 0 ? inventoryAlertBadge : undefined,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
    },
    {
      id: 'clients' as NavTab,
      label: 'Clientes & Frotas',
      icon: Users,
    },
    {
      id: 'financial' as NavTab,
      label: 'Fluxo de Caixa (Entradas & Saídas)',
      icon: BadgeDollarSign,
    },
    {
      id: 'reports' as NavTab,
      label: 'Relatórios Mensais de Venda',
      icon: BarChart3,
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-20 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-amber-400 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 text-[11px] font-extrabold rounded-full ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
