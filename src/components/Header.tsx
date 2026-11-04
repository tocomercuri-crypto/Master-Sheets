import React from 'react';
import {
  Wrench,
  FileSpreadsheet,
  PlusCircle,
  TrendingUp,
  AlertTriangle,
  User as UserIcon,
  LogOut,
  Layers,
  DollarSign,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  onOpenNewOrder: () => void;
  onOpenNewTransaction: () => void;
  onOpenGoogleSheetsModal: () => void;
  activeOrdersCount: number;
  lowStockCount: number;
  currentBalance: number;
  autoSyncEnabled?: boolean;
  isSyncing?: boolean;
  connectedSpreadsheetUrl?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  onOpenNewOrder,
  onOpenNewTransaction,
  onOpenGoogleSheetsModal,
  activeOrdersCount,
  lowStockCount,
  currentBalance,
  autoSyncEnabled,
  isSyncing,
  connectedSpreadsheetUrl,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Company Title */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md shadow-amber-500/20 flex-shrink-0">
              <Wrench className="w-7 h-7 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-wider text-white">MASTER DIESEL</span>
                <span className="px-2 py-0.5 text-xs font-bold tracking-widest uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                  CENTER
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate hidden sm:block">
                Laboratório Especializado em Sistemas de Injeção Common Rail & Bombas
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">OS em Aberto</span>
                <span className="font-bold text-white text-sm">{activeOrdersCount}</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Alerta Estoque</span>
                <span className={`font-bold text-sm ${lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {lowStockCount} {lowStockCount === 1 ? 'item' : 'itens'}
                </span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Saldo em Caixa</span>
                <span className="font-bold text-white text-sm">
                  {currentBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons & Google Sheets Auth */}
          <div className="flex items-center gap-2.5">
            {/* Real-Time Auto-Sync Live Badge */}
            {autoSyncEnabled && connectedSpreadsheetUrl && (
              <a
                href={connectedSpreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  isSyncing
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
                title="Planilha conectada e sincronizando alterações em tempo real. Clique para abrir."
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isSyncing ? 'animate-ping bg-amber-400' : 'animate-ping bg-emerald-400'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isSyncing ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                  ></span>
                </span>
                <span>{isSyncing ? 'Sincronizando...' : 'Tempo Real'}</span>
              </a>
            )}

            {/* Google Sheets Action Button */}
            <button
              onClick={onOpenGoogleSheetsModal}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
              title="Configurar integração e sincronização com Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden md:inline">Google Sheets</span>
            </button>

            {/* Quick Nova OS Button */}
            <button
              onClick={onOpenNewOrder}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm shadow-amber-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nova OS</span>
            </button>

            {/* Google Auth Status / User Pill */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    className="w-8 h-8 rounded-full border border-amber-500/50"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-amber-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <button
                  onClick={onLogout}
                  title="Desconectar do Google"
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-md hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="gsi-material-button text-xs"
                title="Conectar com conta Google para exportar planilhas"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents hidden sm:inline">Conectar Google</span>
                  <span className="gsi-material-button-contents sm:hidden">Google</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
