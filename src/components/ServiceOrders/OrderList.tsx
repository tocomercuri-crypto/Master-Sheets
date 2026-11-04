import React, { useState } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Printer,
  Edit3,
  Trash2,
  MessageCircle,
  Wrench,
  Package,
  Layers,
  CheckCircle,
  Calendar,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { ServiceOrder, OrderStatus } from '../../types';

interface OrderListProps {
  orders: ServiceOrder[];
  onOpenNewOrder: () => void;
  onEditOrder: (order: ServiceOrder) => void;
  onDeleteOrder: (orderId: string) => void;
  onPrintOrder: (order: ServiceOrder) => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  onOpenNewOrder,
  onEditOrder,
  onDeleteOrder,
  onPrintOrder,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.componentCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'orcamento':
        return {
          label: 'Orçamento',
          classes: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 'teste_bancada':
        return {
          label: 'Em Teste de Bancada',
          classes: 'bg-purple-100 text-purple-800 border-purple-300',
        };
      case 'aguardando_pecas':
        return {
          label: 'Aguardando Peças',
          classes: 'bg-orange-100 text-orange-800 border-orange-300',
        };
      case 'em_execucao':
        return {
          label: 'Em Execução / Montagem',
          classes: 'bg-blue-100 text-blue-800 border-blue-300',
        };
      case 'concluida':
        return {
          label: 'Concluída / Retirada',
          classes: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'faturada':
        return {
          label: 'Faturada & Paga',
          classes: 'bg-teal-100 text-teal-800 border-teal-300',
        };
      case 'cancelada':
        return {
          label: 'Cancelada',
          classes: 'bg-rose-100 text-rose-800 border-rose-300',
        };
    }
  };

  const getWhatsAppUrl = (o: ServiceOrder) => {
    const cleanPhone = (o.clientPhone || '').replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá ${o.clientName}! Aqui é da *Master Diesel Center* sobre a sua Ordem de Serviço *${o.orderNumber}* (${o.vehicleModel} - ${o.vehiclePlate}):\n\n` +
      `Componente: ${o.componentType}\n` +
      `Peças: R$ ${(o.partsTotal || 0).toFixed(2)}\n` +
      `Mão de Obra de Bancada: R$ ${(o.laborTotal || 0).toFixed(2)}\n` +
      `*Total Líquido: R$ ${(o.totalAmount || 0).toFixed(2)}*\n` +
      `Status: ${getStatusBadge(o.status).label}\n\n` +
      `Qualquer dúvida estamos à disposição!`
    );
    return cleanPhone ? `https://wa.me/55${cleanPhone}?text=${message}` : `https://wa.me/?text=${message}`;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por OS, cliente, placa, veículo ou código Bosch/Denso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-700"
          >
            <option value="all">Todos os Status ({orders.length})</option>
            <option value="orcamento">🟡 Orçamento</option>
            <option value="teste_bancada">🟣 Em Teste de Bancada</option>
            <option value="aguardando_pecas">🟠 Aguardando Peças</option>
            <option value="em_execucao">🔵 Em Execução</option>
            <option value="concluida">🟢 Concluída</option>
            <option value="faturada">💰 Faturada</option>
            <option value="cancelada">🔴 Cancelada</option>
          </select>

          <button
            onClick={onOpenNewOrder}
            className="flex-shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova OS</span>
          </button>
        </div>
      </div>

      {/* Orders List Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhuma ordem de serviço encontrada</h3>
          <p className="text-xs text-slate-500 mt-1">
            Tente ajustar os filtros ou clique em "Nova OS" para abrir uma ordem de bancada.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusBadge(order.status);
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-amber-400/80 transition-all p-4 sm:p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  {/* Left: OS number, date, vehicle, client */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="font-mono text-base font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-md border border-slate-300">
                      {order.orderNumber}
                    </span>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold border inline-block ${statusInfo.classes}`}
                    >
                      {statusInfo.label}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{order.date}</span>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status quick changer */}
                    <select
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                      className="text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-700"
                    >
                      <option value="orcamento">Orçamento</option>
                      <option value="teste_bancada">Em Bancada</option>
                      <option value="aguardando_pecas">Aguardando Peças</option>
                      <option value="em_execucao">Em Execução</option>
                      <option value="concluida">Concluída</option>
                      <option value="faturada">Faturada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>

                    <a
                      href={getWhatsAppUrl(order)}
                      target="_blank"
                      rel="noreferrer"
                      title="Enviar via WhatsApp"
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200 inline-flex items-center"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => onPrintOrder(order)}
                      title="Visualizar, Imprimir e Salvar PDF"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
                    >
                      <Printer className="w-4 h-4 text-amber-600" />
                      <span>Imprimir / PDF</span>
                    </button>

                    <button
                      onClick={() => onEditOrder(order)}
                      title="Editar Ordem de Serviço"
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteOrder(order.id)}
                      title="Excluir OS"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Middle details: Client & Equipment */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-3 text-xs">
                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[10px]">Cliente / Contato</span>
                    <span className="font-bold text-slate-900 text-sm">{order.clientName}</span>
                    <span className="text-slate-500 block">{order.clientPhone || 'Sem telefone'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[10px]">Veículo & Placa</span>
                    <span className="font-semibold text-slate-800">{order.vehicleModel}</span>
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-700 ml-1.5 font-bold">
                      {order.vehiclePlate || 'S/P'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[10px]">Componente Diesel</span>
                    <span className="font-medium text-slate-800">{order.componentType}</span>
                    {order.componentCode && (
                      <span className="block font-mono text-amber-700 font-semibold">{order.componentCode}</span>
                    )}
                  </div>
                </div>

                {/* DISCRIMINATION SUMMARY BAR: Peças vs Mão de Obra */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Peças Breakdown */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">
                          Peças ({order.parts?.length || 0} itens)
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          R$ {order.partsTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <span className="text-slate-300 hidden sm:inline">|</span>

                    {/* Mão de Obra Breakdown */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-blue-600/20 text-blue-700 flex items-center justify-center font-bold">
                        <Wrench className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">
                          Mão de Obra ({order.labor?.length || 0} serv.)
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          R$ {order.laborTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {order.discount > 0 && (
                      <>
                        <span className="text-slate-300 hidden sm:inline">|</span>
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase font-bold block">Desconto</span>
                          <span className="font-mono font-bold text-rose-600 text-xs">
                            - R$ {order.discount.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Total Amount */}
                  <div className="text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Líquido da OS</span>
                    <span className="text-lg font-black font-mono text-slate-900">
                      R$ {order.totalAmount.toFixed(2)}
                    </span>
                    <span className={`block text-[10px] font-bold ${order.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {order.isPaid ? '✔ PAGO' : '⏳ A RECEBER'} • {order.paymentMethod || 'A combinar'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
