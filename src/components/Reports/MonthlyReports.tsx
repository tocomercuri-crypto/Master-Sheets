import React, { useState } from 'react';
import {
  Calendar,
  FileSpreadsheet,
  Download,
  TrendingUp,
  Package,
  Wrench,
  Users,
  Award,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ServiceOrder, Part, Client, CashTransaction } from '../../types';

interface MonthlyReportsProps {
  orders: ServiceOrder[];
  parts: Part[];
  clients: Client[];
  transactions: CashTransaction[];
  onOpenGoogleSheets: () => void;
}

export const MonthlyReports: React.FC<MonthlyReportsProps> = ({
  orders,
  parts,
  clients,
  transactions,
  onOpenGoogleSheets,
}) => {
  // Extract all available months from orders and transactions
  const allMonths = Array.from(
    new Set([
      ...orders.map((o) => o.date.slice(0, 7)),
      ...transactions.map((t) => t.date.slice(0, 7)),
    ])
  ).sort((a, b) => b.localeCompare(a));

  const currentMonthDefault = allMonths[0] || new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthDefault);

  // Filter orders of selected month (excluding cancelled)
  const monthOrders = orders.filter(
    (o) => o.date.startsWith(selectedMonth) && o.status !== 'cancelada'
  );

  // Month transactions
  const monthTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));

  // Discrimination calculations
  const totalPartsRevenue = monthOrders.reduce((acc, o) => acc + o.partsTotal, 0);
  const totalLaborRevenue = monthOrders.reduce((acc, o) => acc + o.laborTotal, 0);
  const totalDiscounts = monthOrders.reduce((acc, o) => acc + o.discount, 0);
  const totalBilled = monthOrders.reduce((acc, o) => acc + o.totalAmount, 0);

  const partsPercentage =
    totalBilled > 0 ? ((totalPartsRevenue / (totalPartsRevenue + totalLaborRevenue)) * 100).toFixed(1) : '0';
  const laborPercentage =
    totalBilled > 0 ? ((totalLaborRevenue / (totalPartsRevenue + totalLaborRevenue)) * 100).toFixed(1) : '0';

  const averageTicket = monthOrders.length > 0 ? totalBilled / monthOrders.length : 0;

  // Cash flow in month
  const cashIn = monthTransactions
    .filter((t) => t.type === 'entrada' && t.status === 'liquidado')
    .reduce((acc, t) => acc + t.amount, 0);
  const cashOut = monthTransactions
    .filter((t) => t.type === 'saida' && t.status === 'liquidado')
    .reduce((acc, t) => acc + t.amount, 0);
  const netCash = cashIn - cashOut;

  // Top Clients in month
  const clientSpendingMap = new Map<string, { name: string; total: number; count: number }>();
  monthOrders.forEach((o) => {
    const cur = clientSpendingMap.get(o.clientName) || { name: o.clientName, total: 0, count: 0 };
    cur.total += o.totalAmount;
    cur.count += 1;
    clientSpendingMap.set(o.clientName, cur);
  });
  const topClients = Array.from(clientSpendingMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Top Parts consumed in month
  const partsUsageMap = new Map<string, { code: string; desc: string; qty: number; total: number }>();
  monthOrders.forEach((o) => {
    o.parts?.forEach((p) => {
      const cur = partsUsageMap.get(p.code) || {
        code: p.code,
        desc: p.description,
        qty: 0,
        total: 0,
      };
      cur.qty += p.quantity;
      cur.total += p.subtotal;
      partsUsageMap.set(p.code, cur);
    });
  });
  const topParts = Array.from(partsUsageMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Top Labor services in month
  const laborUsageMap = new Map<string, { name: string; qty: number; total: number }>();
  monthOrders.forEach((o) => {
    o.labor?.forEach((l) => {
      const cur = laborUsageMap.get(l.serviceName) || { name: l.serviceName, qty: 0, total: 0 };
      cur.qty += l.hoursOrQty;
      cur.total += l.subtotal;
      laborUsageMap.set(l.serviceName, cur);
    });
  });
  const topLabor = Array.from(laborUsageMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // CSV Export utility
  const handleExportCSV = () => {
    const headers = [
      'OS',
      'Data',
      'Cliente',
      'Veículo',
      'Placa',
      'Componente',
      'Total Peças (R$)',
      'Total Mão de Obra (R$)',
      'Desconto (R$)',
      'Total Líquido (R$)',
      'Status',
    ];
    const rows = monthOrders.map((o) => [
      o.orderNumber,
      o.date,
      `"${o.clientName.replace(/"/g, '""')}"`,
      `"${o.vehicleModel.replace(/"/g, '""')}"`,
      o.vehiclePlate,
      `"${o.componentType}"`,
      o.partsTotal.toFixed(2),
      o.laborTotal.toFixed(2),
      o.discount.toFixed(2),
      o.totalAmount.toFixed(2),
      o.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Master_Diesel_Vendas_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatMonthName = (mStr: string) => {
    if (!mStr) return '';
    const [year, month] = mStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Month Selector Bar & Export Triggers */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-amber-600" />
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase">
              Relatório Mensal de Vendas & Faturamento
            </h2>
            <p className="text-xs text-slate-500 capitalize">
              Período selecionado: <strong>{formatMonthName(selectedMonth)}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-slate-50 text-slate-800"
          >
            {allMonths.map((m) => (
              <option key={m} value={m}>
                {m} ({formatMonthName(m)})
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors"
            title="Baixar planilha em formato CSV"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={onOpenGoogleSheets}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            title="Sincronizar relatório no Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google Sheets</span>
          </button>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Faturado */}
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
            Faturamento Bruto em OS
          </span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            R$ {totalBilled.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {monthOrders.length} ordens de serviço faturadas/ativas
          </span>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-600 block">Ticket Médio por OS</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            R$ {averageTicket.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Média por equipamento atendido</span>
        </div>

        {/* Faturamento com Peças */}
        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-900">
            <span className="text-xs font-bold uppercase">Total em Peças ({partsPercentage}%)</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-950 font-mono mt-1">
            R$ {totalPartsRevenue.toFixed(2)}
          </div>
          <span className="text-[10px] text-amber-800">Componentes e reparos vendidos</span>
        </div>

        {/* Faturamento com Mão de Obra */}
        <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-900">
            <span className="text-xs font-bold uppercase">Total em Mão de Obra ({laborPercentage}%)</span>
            <Wrench className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-blue-950 font-mono mt-1">
            R$ {totalLaborRevenue.toFixed(2)}
          </div>
          <span className="text-[10px] text-blue-800">Serviços técnicos de bancada</span>
        </div>
      </div>

      {/* DISCRIMINAÇÃO VISUAL: Peças vs Mão de Obra Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Composição do Faturamento Mensal (Discriminação Peças x Serviços)
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Total Combinado: R$ {(totalPartsRevenue + totalLaborRevenue).toFixed(2)}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-7 bg-slate-100 rounded-lg overflow-hidden flex shadow-inner border border-slate-200">
          <div
            style={{ width: `${partsPercentage}%` }}
            className="bg-amber-500 flex items-center justify-center text-slate-950 text-xs font-black transition-all duration-500"
            title={`Peças: R$ ${totalPartsRevenue.toFixed(2)} (${partsPercentage}%)`}
          >
            {Number(partsPercentage) > 15 ? `Peças ${partsPercentage}%` : ''}
          </div>
          <div
            style={{ width: `${laborPercentage}%` }}
            className="bg-blue-600 flex items-center justify-center text-white text-xs font-black transition-all duration-500"
            title={`Mão de Obra: R$ ${totalLaborRevenue.toFixed(2)} (${laborPercentage}%)`}
          >
            {Number(laborPercentage) > 15 ? `Mão de Obra ${laborPercentage}%` : ''}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs pt-1">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-amber-500"></div>
            <span className="text-slate-700">
              <strong>Peças:</strong> R$ {totalPartsRevenue.toFixed(2)} ({partsPercentage}%)
            </span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <div className="w-3.5 h-3.5 rounded bg-blue-600"></div>
            <span className="text-slate-700">
              <strong>Mão de Obra de Bancada:</strong> R$ {totalLaborRevenue.toFixed(2)} ({laborPercentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* Top Rankings Grid: Clients, Parts, and Labor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Clients */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <span className="text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-600" />
                Top Clientes do Mês
              </span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>

            {topClients.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">Sem dados no período.</p>
            ) : (
              <div className="space-y-2.5">
                {topClients.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-slate-900 truncate" title={c.name}>
                        {c.name}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 whitespace-nowrap ml-2">
                      R$ {c.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Parts Consumed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <span className="text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-600" />
                Peças Mais Utilizadas
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Volume</span>
            </div>

            {topParts.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">Sem peças no período.</p>
            ) : (
              <div className="space-y-2.5">
                {topParts.map((p, i) => (
                  <div key={p.code} className="flex items-center justify-between text-xs">
                    <div className="truncate">
                      <span className="font-bold text-slate-900 font-mono text-[11px] mr-1">{p.code}</span>
                      <span className="text-slate-600 truncate text-[11px]" title={p.desc}>
                        {p.desc}
                      </span>
                    </div>
                    <div className="text-right whitespace-nowrap ml-2">
                      <span className="font-bold text-slate-900 block font-mono">{p.qty} un</span>
                      <span className="text-[10px] text-slate-400">R$ {p.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Labor Services */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <span className="text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-blue-600" />
                Serviços de Bancada Mais Executados
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Faturamento</span>
            </div>

            {topLabor.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">Sem serviços no período.</p>
            ) : (
              <div className="space-y-2.5">
                {topLabor.map((l, i) => (
                  <div key={l.name} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 truncate mr-2" title={l.name}>
                      {l.name}
                    </span>
                    <div className="text-right whitespace-nowrap">
                      <span className="font-mono font-bold text-blue-900 block">
                        R$ {l.total.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400">{l.qty} op.</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
