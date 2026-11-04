import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Loader2,
  Lock,
  Zap,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { ServiceOrder, Part, CashTransaction } from '../types';
import { exportAllToGoogleSheets, GoogleSheetsExportResult } from '../services/googleSheets';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogin: () => void;
  isLoggingIn: boolean;
  accessToken: string | null;
  orders: ServiceOrder[];
  parts: Part[];
  transactions: CashTransaction[];
  connectedSpreadsheetId: string;
  onSetConnectedSpreadsheetId: (id: string, url: string) => void;
  autoSyncEnabled: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
  lastSyncTime: string | null;
  isSyncing: boolean;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogin,
  isLoggingIn,
  accessToken,
  orders,
  parts,
  transactions,
  connectedSpreadsheetId,
  onSetConnectedSpreadsheetId,
  autoSyncEnabled,
  onToggleAutoSync,
  lastSyncTime,
  isSyncing,
}) => {
  if (!isOpen) return null;

  const [existingId, setExistingId] = useState(connectedSpreadsheetId || '');
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<GoogleSheetsExportResult | null>(
    connectedSpreadsheetId
      ? {
          spreadsheetId: connectedSpreadsheetId,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${connectedSpreadsheetId}/edit`,
        }
      : null
  );
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'export' | 'enableAutoSync'>('export');

  const handleStartExport = () => {
    setError(null);
    setConfirmAction('export');
    setShowConfirm(true);
  };

  const handlePromptAutoSync = (checked: boolean) => {
    if (checked) {
      setError(null);
      setConfirmAction('enableAutoSync');
      setShowConfirm(true);
    } else {
      onToggleAutoSync(false);
    }
  };

  const handleExecuteConfirmedAction = async () => {
    setShowConfirm(false);

    if (confirmAction === 'enableAutoSync') {
      onToggleAutoSync(true);
      return;
    }

    if (!accessToken) {
      setError('Sessão Google expirada ou não autenticada. Por favor, conecte-se com sua conta Google primeiro.');
      return;
    }

    setIsExporting(true);
    setError(null);
    try {
      const res = await exportAllToGoogleSheets(
        accessToken,
        {
          orders,
          parts,
          transactions,
        },
        existingId.trim() || undefined
      );
      setResult(res);
      onSetConnectedSpreadsheetId(res.spreadsheetId, res.spreadsheetUrl);
    } catch (err: any) {
      console.error('Erro ao exportar para o Google Sheets:', err);
      setError(err.message || 'Falha ao sincronizar com Google Sheets. Verifique suas permissões.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl my-6 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Google Sheets • Tempo Real</h2>
              <p className="text-xs text-slate-400">
                Master Diesel Center • Sincronização Automática em Tempo Real
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {!user ? (
            /* User not logged in */
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Conecte sua Conta Google</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                  Conecte-se para habilitar a <strong>sincronização em tempo real</strong>. Cada alteração de OS, entrada/saída de caixa ou movimentação de peças será enviada instantaneamente para a sua planilha Google Sheets.
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <button onClick={onLogin} disabled={isLoggingIn} className="gsi-material-button shadow-md">
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
                    <span className="gsi-material-button-contents">
                      {isLoggingIn ? 'Conectando ao Google...' : 'Sign in with Google'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* User authenticated */
            <div className="space-y-4">
              {/* User Pill */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    className="w-10 h-10 rounded-full border border-emerald-500/40"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    G
                  </div>
                )}
                <div className="truncate">
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {user.displayName || 'Usuário Google'}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">{user.email}</span>
                </div>
                <div className="ml-auto">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Conectado
                  </span>
                </div>
              </div>

              {/* REAL-TIME AUTO-SYNC SWITCH (Core Feature) */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-300/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase text-emerald-950 tracking-wide">
                        Sincronização em Tempo Real (Auto-Sync)
                      </h3>
                      <p className="text-[11px] text-emerald-800">
                        Grava novas OS, estoque e caixa automaticamente na planilha Google Sheets
                      </p>
                    </div>
                  </div>

                  {/* Toggle Checkbox */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSyncEnabled}
                      onChange={(e) => handlePromptAutoSync(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] pt-1 text-emerald-900 border-t border-emerald-200">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span
                        className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          autoSyncEnabled ? (isSyncing ? 'animate-ping bg-amber-400' : 'bg-emerald-500') : 'bg-slate-400'
                        }`}
                      ></span>
                      <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${
                          autoSyncEnabled ? (isSyncing ? 'bg-amber-400' : 'bg-emerald-600') : 'bg-slate-400'
                        }`}
                      ></span>
                    </span>
                    <span className="font-bold">
                      {autoSyncEnabled
                        ? isSyncing
                          ? 'Sincronizando dados agora...'
                          : 'Tempo Real Ativado (Pronto)'
                        : 'Tempo Real Desativado'}
                    </span>
                  </div>

                  {lastSyncTime && (
                    <div className="flex items-center gap-1 text-slate-600 font-mono text-[10px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Última atualização: {lastSyncTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* What is synchronized */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-800 uppercase text-[11px] block">
                  Abas mantidas sincronizadas em tempo real:
                </span>
                <ul className="grid grid-cols-2 gap-2 text-slate-700">
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✔</span>
                    <span>1. Ordens de Serviço ({orders.length} OS)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✔</span>
                    <span>2. Estoque de Peças ({parts.length} itens)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✔</span>
                    <span>3. Fluxo de Caixa ({transactions.length} reg.)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✔</span>
                    <span>4. Resumo Mensal de Vendas</span>
                  </li>
                </ul>
              </div>

              {/* Connected Spreadsheet Info */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  ID da Planilha Conectada
                </label>
                <input
                  type="text"
                  placeholder="Deixe em branco para criar uma NOVA planilha no seu Google Drive"
                  value={existingId}
                  onChange={(e) => setExistingId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Confirmation Dialog as per Skill rules */}
              {showConfirm && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-900 text-xs uppercase">
                        {confirmAction === 'enableAutoSync'
                          ? 'Confirmar Ativação do Tempo Real?'
                          : 'Confirmar Sincronização de Dados?'}
                      </h4>
                      <p className="text-xs text-amber-800 mt-1">
                        {confirmAction === 'enableAutoSync'
                          ? 'Ao ativar a sincronização em tempo real, qualquer nova OS, baixa de peça ou entrada/saída financeira salvará e atualizará automaticamente as abas da sua planilha do Google Sheets em segundo plano.'
                          : existingId
                          ? `As abas da planilha existente ID '${existingId}' serão atualizadas com todas as ordens de serviço, estoque e caixa.`
                          : 'Uma nova planilha será criada e vinculada em seu Google Drive com todas as abas estruturadas.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
                    <button
                      type="button"
                      onClick={() => setShowConfirm(false)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-amber-100 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteConfirmedAction}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm"
                    >
                      {confirmAction === 'enableAutoSync' ? 'Sim, Ativar Tempo Real' : 'Confirmar e Sincronizar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Success Result or Connected Link */}
              {result && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Planilha vinculada e sincronizada no Google Sheets!</span>
                  </div>
                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href={result.spreadsheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-sm"
                    >
                      <span>Abrir Planilha no Google Sheets</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Manual export button */}
              {!showConfirm && (
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-[11px] text-slate-500">
                    {autoSyncEnabled ? 'Auto-sync ativo em segundo plano' : 'Deseja sincronizar manualmente?'}
                  </span>
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={handleStartExport}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sincronizando...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Sincronizar Agora</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3.5 rounded-b-2xl border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium">Master Diesel Center • Google Sheets Real-Time Sync</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-lg"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
