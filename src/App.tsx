import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  ServiceOrder,
  Part,
  Client,
  CashTransaction,
  OrderStatus,
} from './types';
import {
  loadData,
  saveData,
  resetToDemoData,
} from './services/storage';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/firebase';
import { syncToGoogleSheets } from './services/googleSheets';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { OrderList } from './components/ServiceOrders/OrderList';
import { OrderModal } from './components/ServiceOrders/OrderModal';
import { OrderPrintModal } from './components/ServiceOrders/OrderPrintModal';
import { InventoryList } from './components/Inventory/InventoryList';
import { PartModal } from './components/Inventory/PartModal';
import { StockMovementModal } from './components/Inventory/StockMovementModal';
import { ClientList } from './components/Clients/ClientList';
import { ClientModal } from './components/Clients/ClientModal';
import { FinancialDashboard } from './components/Financial/FinancialDashboard';
import { TransactionModal } from './components/Financial/TransactionModal';
import { MonthlyReports } from './components/Reports/MonthlyReports';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import {
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  HelpCircle,
  Wrench,
  AlertCircle,
  X,
} from 'lucide-react';

export default function App() {
  // App state
  const [data, setData] = useState(() => loadData());
  const [activeTab, setActiveTab] = useState<NavTab>('orders');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  // Google Auth states
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const [printingOrder, setPrintingOrder] = useState<ServiceOrder | null>(null);

  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [movementPart, setMovementPart] = useState<Part | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<CashTransaction | null>(null);

  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);

  // Real-time Google Sheets Sync states
  const [connectedSpreadsheetId, setConnectedSpreadsheetId] = useState<string>(
    () => localStorage.getItem('master_diesel_sheet_id') || ''
  );
  const [connectedSpreadsheetUrl, setConnectedSpreadsheetUrl] = useState<string | null>(
    () => localStorage.getItem('master_diesel_sheet_url') || null
  );
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(
    () => localStorage.getItem('master_diesel_autosync') === 'true'
  );
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Handler for setting connected spreadsheet
  const handleSetConnectedSpreadsheet = (id: string, url: string) => {
    setConnectedSpreadsheetId(id);
    setConnectedSpreadsheetUrl(url);
    localStorage.setItem('master_diesel_sheet_id', id);
    localStorage.setItem('master_diesel_sheet_url', url);
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    setAutoSyncEnabled(enabled);
    localStorage.setItem('master_diesel_autosync', enabled ? 'true' : 'false');
  };

  // Debounced Real-Time Synchronization Effect
  useEffect(() => {
    if (!autoSyncEnabled || !connectedSpreadsheetId || !accessToken) return;

    const timer = setTimeout(async () => {
      setIsSyncing(true);
      try {
        await syncToGoogleSheets(accessToken, connectedSpreadsheetId, data);
        setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));
      } catch (err) {
        console.warn('Sincronização em tempo real falhou:', err);
      } finally {
        setIsSyncing(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [data, autoSyncEnabled, connectedSpreadsheetId, accessToken]);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    saveData(data);
  }, [data]);

  // Auth Handlers
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        showToast('Conectado à Conta Google com sucesso!', 'success');
      }
    } catch (err: any) {
      console.error('Falha no login Google:', err);
      if (err?.code === 'auth/unauthorized-domain') {
        showToast(
          `Domínio "${window.location.hostname}" não autorizado no Firebase. Adicione-o em Firebase Console > Authentication > Settings > Authorized domains.`,
          'error'
        );
      } else if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        showToast('Login cancelado.', 'error');
      } else if (err?.code === 'auth/popup-blocked') {
        showToast('O navegador bloqueou a janela de login. Permita pop-ups para este site e tente novamente.', 'error');
      } else {
        showToast('Não foi possível conectar com o Google: ' + (err.message || 'Tente novamente.'), 'error');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    showToast('Desconectado da Conta Google.', 'info');
  };

  // --- SERVICE ORDERS HANDLERS ---
  const handleSaveOrder = (order: ServiceOrder, deductStock: boolean) => {
    setData((prev) => {
      const existingIndex = prev.orders.findIndex((o) => o.id === order.id);
      let updatedOrders = [...prev.orders];

      if (existingIndex >= 0) {
        updatedOrders[existingIndex] = order;
      } else {
        updatedOrders = [order, ...updatedOrders];
      }

      // Stock deduction logic if requested
      let updatedParts = [...prev.parts];
      if (deductStock && order.parts && order.parts.length > 0) {
        order.parts.forEach((pItem) => {
          if (pItem.partId) {
            const pIdx = updatedParts.findIndex((p) => p.id === pItem.partId);
            if (pIdx >= 0) {
              const currentStock = updatedParts[pIdx].stockQty;
              updatedParts[pIdx] = {
                ...updatedParts[pIdx],
                stockQty: Math.max(0, currentStock - pItem.quantity),
              };
            }
          }
        });
      }

      // Auto financial sync: If order is paid or faturada, ensure there's a cash transaction
      let updatedTransactions = [...prev.transactions];
      const existingTxIdx = updatedTransactions.findIndex((t) => t.serviceOrderId === order.orderNumber);

      if (order.isPaid || order.status === 'faturada') {
        const txData: CashTransaction = {
          id: existingTxIdx >= 0 ? updatedTransactions[existingTxIdx].id : `tr-os-${order.id}`,
          date: order.date,
          type: 'entrada',
          description: `Recebimento ${order.orderNumber} (${order.vehicleModel} - ${order.clientName})`,
          category: 'Serviço de Bancada (OS)',
          amount: order.totalAmount,
          paymentMethod: order.paymentMethod || 'Pix',
          status: order.isPaid ? 'liquidado' : 'pendente',
          serviceOrderId: order.orderNumber,
          notes: `Total Peças: R$ ${order.partsTotal.toFixed(2)} | Total Mão de Obra: R$ ${order.laborTotal.toFixed(2)}`,
        };

        if (existingTxIdx >= 0) {
          updatedTransactions[existingTxIdx] = txData;
        } else {
          updatedTransactions = [txData, ...updatedTransactions];
        }
      }

      return {
        ...prev,
        orders: updatedOrders,
        parts: updatedParts,
        transactions: updatedTransactions,
      };
    });

    showToast(`Ordem de Serviço ${order.orderNumber} salva com sucesso!`, 'success');
  };

  const handleDeleteOrder = (orderId: string) => {
    setData((prev) => ({
      ...prev,
      orders: prev.orders.filter((o) => o.id !== orderId),
    }));
    showToast('Ordem de serviço removida.', 'info');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setData((prev) => {
      const updatedOrders = prev.orders.map((o) => {
        if (o.id === orderId) {
          const isNowPaid = newStatus === 'faturada' ? true : o.isPaid;
          return { ...o, status: newStatus, isPaid: isNowPaid };
        }
        return o;
      });
      return { ...prev, orders: updatedOrders };
    });
  };

  // --- PARTS INVENTORY HANDLERS ---
  const handleSavePart = (part: Part) => {
    setData((prev) => {
      const existingIndex = prev.parts.findIndex((p) => p.id === part.id);
      let updatedParts = [...prev.parts];
      if (existingIndex >= 0) {
        updatedParts[existingIndex] = part;
      } else {
        updatedParts = [part, ...updatedParts];
      }
      return { ...prev, parts: updatedParts };
    });
    showToast(`Peça ${part.code} salva com sucesso!`, 'success');
  };

  const handleDeletePart = (partId: string) => {
    setData((prev) => ({
      ...prev,
      parts: prev.parts.filter((p) => p.id !== partId),
    }));
    showToast('Peça removida do estoque.', 'info');
  };

  const handleStockMovement = (
    partId: string,
    type: 'entrada' | 'saida',
    quantity: number,
    createFinancialEntry: boolean,
    totalCost: number,
    notes: string
  ) => {
    setData((prev) => {
      const partIdx = prev.parts.findIndex((p) => p.id === partId);
      if (partIdx < 0) return prev;

      const part = prev.parts[partIdx];
      const newQty =
        type === 'entrada' ? part.stockQty + quantity : Math.max(0, part.stockQty - quantity);

      const updatedParts = [...prev.parts];
      updatedParts[partIdx] = { ...part, stockQty: newQty };

      let updatedTransactions = [...prev.transactions];
      if (createFinancialEntry && totalCost > 0) {
        const newTx: CashTransaction = {
          id: `tr-stock-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          type: 'saida',
          description: `Compra / Reposição de Estoque: ${quantity}x ${part.code} (${part.description})`,
          category: 'Compra de Peças / Fornecedores',
          amount: totalCost,
          paymentMethod: 'Boleto Bancário',
          status: 'liquidado',
          supplierName: notes || part.manufacturer,
          notes: `Entrada física no estoque (${quantity} ${part.unit})`,
        };
        updatedTransactions = [newTx, ...updatedTransactions];
      }

      return {
        ...prev,
        parts: updatedParts,
        transactions: updatedTransactions,
      };
    });
    showToast(
      type === 'entrada'
        ? `Entrada de ${quantity} un. realizada com sucesso!`
        : `Saída de ${quantity} un. registrada no estoque.`,
      'success'
    );
  };

  // --- CLIENTS HANDLERS ---
  const handleSaveClient = (client: Client) => {
    setData((prev) => {
      const existingIndex = prev.clients.findIndex((c) => c.id === client.id);
      let updatedClients = [...prev.clients];
      if (existingIndex >= 0) {
        updatedClients[existingIndex] = client;
      } else {
        updatedClients = [client, ...updatedClients];
      }
      return { ...prev, clients: updatedClients };
    });
    showToast(`Cliente ${client.name} salvo com sucesso!`, 'success');
  };

  const handleDeleteClient = (clientId: string) => {
    setData((prev) => ({
      ...prev,
      clients: prev.clients.filter((c) => c.id !== clientId),
    }));
    showToast('Cliente removido.', 'info');
  };

  // --- TRANSACTIONS (CASH FLOW) HANDLERS ---
  const handleSaveTransaction = (transaction: CashTransaction) => {
    setData((prev) => {
      const existingIndex = prev.transactions.findIndex((t) => t.id === transaction.id);
      let updatedTransactions = [...prev.transactions];
      if (existingIndex >= 0) {
        updatedTransactions[existingIndex] = transaction;
      } else {
        updatedTransactions = [transaction, ...updatedTransactions];
      }
      return { ...prev, transactions: updatedTransactions };
    });
    showToast('Lançamento financeiro salvo com sucesso!', 'success');
  };

  const handleDeleteTransaction = (id: string) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
    showToast('Lançamento financeiro removido.', 'info');
  };

  const handleToggleTransactionStatus = (id: string) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'liquidado' ? 'pendente' : 'liquidado' }
          : t
      ),
    }));
    showToast('Status do lançamento atualizado.', 'info');
  };

  // --- BACKUP & DEMO RESET HANDLERS ---
  const handleResetDemo = () => {
    const reset = resetToDemoData();
    setData(reset);
    showToast('Dados restaurados para o padrão Master Diesel!', 'info');
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Master_Diesel_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Download do backup realizado.', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.orders && parsed.parts && parsed.clients && parsed.transactions) {
          setData(parsed);
          showToast('Backup importado com sucesso!', 'success');
        } else {
          showToast('Arquivo de backup inválido.', 'error');
        }
      } catch (err) {
        showToast('Erro ao processar arquivo JSON.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Quick stats for Header & Badges
  const activeOrdersCount = data.orders.filter(
    (o) => o.status !== 'concluida' && o.status !== 'faturada' && o.status !== 'cancelada'
  ).length;

  const lowStockCount = data.parts.filter((p) => p.stockQty <= p.minStockQty).length;

  const currentBalance = data.transactions
    .filter((t) => t.status === 'liquidado')
    .reduce((acc, t) => acc + (t.type === 'entrada' ? t.amount : -t.amount), 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Main Header */}
      <Header
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        onOpenNewOrder={() => {
          setEditingOrder(null);
          setIsOrderModalOpen(true);
        }}
        onOpenNewTransaction={() => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        onOpenGoogleSheetsModal={() => setIsGoogleSheetsModalOpen(true)}
        activeOrdersCount={activeOrdersCount}
        lowStockCount={lowStockCount}
        currentBalance={currentBalance}
        autoSyncEnabled={autoSyncEnabled}
        isSyncing={isSyncing}
        connectedSpreadsheetUrl={connectedSpreadsheetUrl}
      />

      {/* Tabs Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        ordersBadge={activeOrdersCount > 0 ? activeOrdersCount : undefined}
        inventoryAlertBadge={lowStockCount > 0 ? lowStockCount : undefined}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'orders' && (
          <OrderList
            orders={data.orders}
            onOpenNewOrder={() => {
              setEditingOrder(null);
              setIsOrderModalOpen(true);
            }}
            onEditOrder={(order) => {
              setEditingOrder(order);
              setIsOrderModalOpen(true);
            }}
            onDeleteOrder={handleDeleteOrder}
            onPrintOrder={(order) => setPrintingOrder(order)}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryList
            parts={data.parts}
            onOpenNewPart={() => {
              setEditingPart(null);
              setIsPartModalOpen(true);
            }}
            onEditPart={(part) => {
              setEditingPart(part);
              setIsPartModalOpen(true);
            }}
            onDeletePart={handleDeletePart}
            onOpenMovement={(part) => setMovementPart(part)}
          />
        )}

        {activeTab === 'clients' && (
          <ClientList
            clients={data.clients}
            orders={data.orders}
            onOpenNewClient={() => {
              setEditingClient(null);
              setIsClientModalOpen(true);
            }}
            onEditClient={(client) => {
              setEditingClient(client);
              setIsClientModalOpen(true);
            }}
            onDeleteClient={handleDeleteClient}
            onViewClientOrders={() => setActiveTab('orders')}
          />
        )}

        {activeTab === 'financial' && (
          <FinancialDashboard
            transactions={data.transactions}
            onOpenNewTransaction={() => {
              setEditingTransaction(null);
              setIsTransactionModalOpen(true);
            }}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsTransactionModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onToggleStatus={handleToggleTransactionStatus}
          />
        )}

        {activeTab === 'reports' && (
          <MonthlyReports
            orders={data.orders}
            parts={data.parts}
            clients={data.clients}
            transactions={data.transactions}
            onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
          />
        )}
      </main>

      {/* Footer with System Utilities */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wider">MASTER DIESEL CENTER</span>
            <span className="text-slate-600">•</span>
            <span>Sistema Especializado para Laboratório Diesel & Bancadas de Teste</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={handleResetDemo}
              className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors"
              title="Restaurar dados de exemplo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Dados Demo</span>
            </button>

            <span className="text-slate-700">|</span>

            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
              title="Baixar cópia de segurança em JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Backup</span>
            </button>

            <span className="text-slate-700">|</span>

            <label className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Importar Backup</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSave={handleSaveOrder}
        initialOrder={editingOrder}
        clients={data.clients}
        partsInventory={data.parts}
      />

      <OrderPrintModal
        order={printingOrder}
        isOpen={!!printingOrder}
        onClose={() => setPrintingOrder(null)}
      />

      <PartModal
        isOpen={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        onSave={handleSavePart}
        initialPart={editingPart}
      />

      <StockMovementModal
        part={movementPart}
        isOpen={!!movementPart}
        onClose={() => setMovementPart(null)}
        onConfirm={handleStockMovement}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
        initialClient={editingClient}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
        initialTransaction={editingTransaction}
      />

      <GoogleSheetsModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        user={user}
        onLogin={handleLogin}
        isLoggingIn={isLoggingIn}
        accessToken={accessToken}
        orders={data.orders}
        parts={data.parts}
        transactions={data.transactions}
        connectedSpreadsheetId={connectedSpreadsheetId}
        onSetConnectedSpreadsheetId={handleSetConnectedSpreadsheet}
        autoSyncEnabled={autoSyncEnabled}
        onToggleAutoSync={handleToggleAutoSync}
        lastSyncTime={lastSyncTime}
        isSyncing={isSyncing}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce-in shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
          <div
            className={`p-4 flex items-center justify-between gap-3 text-sm font-semibold text-white ${
              toast.type === 'success'
                ? 'bg-emerald-600'
                : toast.type === 'error'
                ? 'bg-rose-600'
                : 'bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 text-white" />}
              {toast.type === 'info' && <Wrench className="w-5 h-5 shrink-0 text-amber-400" />}
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="p-1 rounded-lg hover:bg-black/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
