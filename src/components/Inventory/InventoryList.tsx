import React, { useState } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  AlertTriangle,
  ArrowUpDown,
  Edit,
  Trash2,
  Package,
  Boxes,
  DollarSign,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { Part } from '../../types';

interface InventoryListProps {
  parts: Part[];
  onOpenNewPart: () => void;
  onEditPart: (part: Part) => void;
  onDeletePart: (partId: string) => void;
  onOpenMovement: (part: Part) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  parts,
  onOpenNewPart,
  onEditPart,
  onDeletePart,
  onOpenMovement,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);

  const categories = Array.from(new Set(parts.map((p) => p.category)));

  const lowStockParts = parts.filter((p) => p.stockQty <= p.minStockQty);

  const filteredParts = parts.filter((p) => {
    const matchesSearch =
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mfgCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesLowStock = !showOnlyLowStock || p.stockQty <= p.minStockQty;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Inventory Totals
  const totalPhysicalUnits = parts.reduce((acc, p) => acc + p.stockQty, 0);
  const totalCostValue = parts.reduce((acc, p) => acc + p.stockQty * p.costPrice, 0);
  const totalSellingValue = parts.reduce((acc, p) => acc + p.stockQty * p.sellingPrice, 0);
  const potentialProfit = totalSellingValue - totalCostValue;

  return (
    <div className="space-y-6">
      {/* Top Inventory Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Itens Cadastrados</span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{parts.length}</div>
          <span className="text-[11px] text-slate-500">{totalPhysicalUnits} unidades físicas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Valor em Custo</span>
            <DollarSign className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            R$ {totalCostValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500">Capital imobilizado</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Valor de Venda</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            R$ {totalSellingValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">
            Lucro est.: R$ {potentialProfit.toFixed(2)}
          </span>
        </div>

        <div
          onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
          className={`p-4 rounded-xl border cursor-pointer transition-all shadow-xs ${
            lowStockParts.length > 0
              ? 'bg-amber-50/60 border-amber-300 hover:bg-amber-50'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-bold uppercase">Estoque Crítico</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockParts.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className="text-2xl font-black text-amber-900">{lowStockParts.length}</div>
          <span className="text-[11px] font-bold text-amber-700 underline">
            {showOnlyLowStock ? 'Mostrar todos os itens' : 'Filtrar itens abaixo do mínimo'}
          </span>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockParts.length > 0 && !showOnlyLowStock && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">
                Atenção: Há {lowStockParts.length} {lowStockParts.length === 1 ? 'peça' : 'peças'} atingindo o estoque mínimo no laboratório!
              </p>
              <p className="text-[11px] text-amber-700">
                Componentes como {lowStockParts.slice(0, 3).map((p) => p.code).join(', ')} precisam de reposição para evitar paradas nas bancadas.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowOnlyLowStock(true)}
            className="text-xs font-bold px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-500 whitespace-nowrap self-start sm:self-center"
          >
            Ver Peças Críticas
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código Bosch/Denso, descrição, prateleira..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-700"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {showOnlyLowStock && (
            <button
              onClick={() => setShowOnlyLowStock(false)}
              className="px-3 py-2 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold"
            >
              Remover Filtro Crítico ✕
            </button>
          )}

          <button
            onClick={onOpenNewPart}
            className="flex-shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar Peça</span>
          </button>
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="p-3">Código Interno</th>
                <th className="p-3">Cód. Fabricante</th>
                <th className="p-3">Descrição da Peça</th>
                <th className="p-3">Marca / Categoria</th>
                <th className="p-3">Localização</th>
                <th className="p-3 text-center">Estoque Atual</th>
                <th className="p-3 text-right">Custo (R$)</th>
                <th className="p-3 text-right">Venda (R$)</th>
                <th className="p-3 text-right">Margem</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 italic">
                    Nenhuma peça localizada com os critérios aplicados.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => {
                  const isLow = part.stockQty <= part.minStockQty;
                  const marginValue = part.sellingPrice - part.costPrice;
                  const marginPct =
                    part.costPrice > 0 ? ((marginValue / part.costPrice) * 100).toFixed(0) : '0';

                  return (
                    <tr
                      key={part.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isLow ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-slate-900">{part.code}</td>
                      <td className="p-3 font-mono text-slate-600">{part.mfgCode}</td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-900 block">{part.description}</span>
                      </td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 mr-1">
                          {part.manufacturer}
                        </span>
                        <span className="text-slate-500 text-[11px]">{part.category}</span>
                      </td>
                      <td className="p-3">
                        <span className="flex items-center gap-1 text-slate-600 font-medium text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {part.location}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`font-mono font-black text-sm px-2 py-0.5 rounded ${
                              isLow
                                ? 'bg-rose-100 text-rose-800 border border-rose-300 font-black'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {part.stockQty} {part.unit}
                          </span>
                          {isLow && (
                            <span
                              title={`Abaixo do mínimo de ${part.minStockQty}`}
                              className="text-[10px] font-bold text-rose-600"
                            >
                              (Mín: {part.minStockQty})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600">
                        R$ {part.costPrice.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        R$ {part.sellingPrice.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono text-[11px] text-emerald-700 font-semibold">
                        +{marginPct}% (R$ {marginValue.toFixed(2)})
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenMovement(part)}
                            title="Movimentar estoque (Entrada/Saída)"
                            className="p-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded border border-amber-300 transition-colors"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditPart(part)}
                            title="Editar Peça"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeletePart(part.id)}
                            title="Excluir Peça"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
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
