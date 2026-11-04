import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  PlusCircle,
  Calendar,
  Filter,
  Search,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  PieChart,
  Trash2,
  Edit,
} from 'lucide-react';
import { CashTransaction, TransactionType } from '../../types';

interface FinancialDashboardProps {
  transactions: CashTransaction[];
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: CashTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  transactions,
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onToggleStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'entrada' | 'saida'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'liquidado' | 'pendente'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Available months list
  const availableMonths = Array.from(
    new Set(transactions.map((t) => t.date.slice(0, 7)))
  ).sort((a, b) => b.localeCompare(a));

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.supplierName && t.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.serviceOrderId && t.serviceOrderId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesMonth = selectedMonth === 'all' || t.date.startsWith(selectedMonth);

    return matchesSearch && matchesType && matchesStatus && matchesMonth;
  });

  // Calculate KPIs based on the filtered month (or all)
  const monthTransactions = transactions.filter(
    (t) => selectedMonth === 'all' || t.date.startsWith(selectedMonth)
  );

  const totalInflowSettled = monthTransactions
    .filter((t) => t.type === 'entrada' && t.status === 'liquidado')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalOutflowSettled = monthTransactions
    .filter((t) => t.type === 'saida' && t.status === 'liquidado')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalInflowSettled - totalOutflowSettled;

  const totalPendingReceivables = monthTransactions
    .filter((t) => t.type === 'entrada' && t.status === 'pendente')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalPendingPayables = monthTransactions
    .filter((t) => t.type === 'saida' && t.status === 'pendente')
    .reduce((acc, t) => acc + t.amount, 0);

  // Group by category for visual distribution
  const categorySummary = monthTransactions
    .filter((t) => t.status === 'liquidado')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + (t.type === 'entrada' ? t.amount : -t.amount);
      return acc;
    }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Month Selector & New Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-amber-600" />
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Fluxo de Caixa & Livro Caixa Detalhado
            </h2>
            <p className="text-xs text-slate-500">
              Acompanhamento de todas as entradas, saídas e previsões financeiras
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-slate-50 text-slate-800"
          >
            <option value="all">Todo o Histórico</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                Mês: {m}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenNewTransaction}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Lançar Entrada/Saída</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Saldo Líquido em Caixa */}
        <div className="col-span-2 sm:col-span-1 bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Saldo Atual Realizado
          </span>
          <div
            className={`text-2xl font-black font-mono mt-1 ${
              netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            R$ {netBalance.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Entradas - Saídas Liquidadas
          </span>
        </div>

        {/* Total Entradas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-bold uppercase text-slate-600">Entradas (Receitas)</span>
            <ArrowDownRight className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-emerald-600 font-mono">
            R$ {totalInflowSettled.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500">Valores já recebidos</span>
        </div>

        {/* Total Saídas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-xs font-bold uppercase text-slate-600">Saídas (Despesas)</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-rose-600 font-mono">
            R$ {totalOutflowSettled.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500">Valores já pagos</span>
        </div>

        {/* A Receber (Pendentes) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-xs font-bold uppercase text-slate-600">A Receber</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black text-blue-600 font-mono">
            R$ {totalPendingReceivables.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500">OS faturadas / boletos</span>
        </div>

        {/* A Pagar (Pendentes) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-bold uppercase text-slate-600">A Pagar</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 font-mono">
            R$ {totalPendingPayables.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500">Fornecedores / tributos</span>
        </div>
      </div>

      {/* Filter and Search Bar for Transactions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar lançamentos por descrição, categoria, fornecedor ou OS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-700"
          >
            <option value="all">Todas as Operações</option>
            <option value="entrada">🟢 Apenas Entradas (+)</option>
            <option value="saida">🔴 Apenas Saídas (-)</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-700"
          >
            <option value="all">Todos os Status</option>
            <option value="liquidado">✔ Liquidadas / Pagas</option>
            <option value="pendente">⏳ Pendentes / A Vencer</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Descrição da Movimentação</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Forma Pagto</th>
                <th className="p-3 text-right">Valor (R$)</th>
                <th className="p-3 text-center">Situação</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    Nenhum lançamento financeiro localizado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isEntrada = tx.type === 'entrada';
                  const isSettled = tx.status === 'liquidado';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                        {tx.date}
                        {tx.dueDate && tx.dueDate !== tx.date && (
                          <span className="block text-[10px] text-slate-400">
                            Venc: {tx.dueDate}
                          </span>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isEntrada
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isEntrada ? (
                            <>
                              <ArrowDownRight className="w-3 h-3" /> ENTRADA
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3" /> SAÍDA
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-900 block">{tx.description}</span>
                        {(tx.serviceOrderId || tx.supplierName) && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            {tx.serviceOrderId ? `OS: ${tx.serviceOrderId} ` : ''}
                            {tx.supplierName ? `Fornec: ${tx.supplierName}` : ''}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-700 font-medium whitespace-nowrap">{tx.category}</td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">{tx.paymentMethod}</td>
                      <td className="p-3 text-right font-mono font-bold whitespace-nowrap">
                        <span className={isEntrada ? 'text-emerald-600' : 'text-rose-600'}>
                          {isEntrada ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => onToggleStatus(tx.id)}
                          title="Clique para alternar entre Liquidado e Pendente"
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase cursor-pointer border transition-transform hover:scale-105 ${
                            isSettled
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                          }`}
                        >
                          {isSettled ? '✔ Liquidado' : '⏳ Pendente'}
                        </button>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Editar Lançamento"
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            title="Excluir Lançamento"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
