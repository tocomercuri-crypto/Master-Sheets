import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Part } from '../../types';

interface StockMovementModalProps {
  part: Part | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    partId: string,
    type: 'entrada' | 'saida',
    quantity: number,
    createFinancialEntry: boolean,
    totalCost: number,
    notes: string
  ) => void;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  part,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !part) return null;

  const [type, setType] = useState<'entrada' | 'saida'>('entrada');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(part.costPrice);
  const [createFinancialEntry, setCreateFinancialEntry] = useState<boolean>(true);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const totalCost = (quantity || 0) * (unitCost || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setFormError('A quantidade deve ser maior que zero.');
      return;
    }
    if (type === 'saida' && quantity > part.stockQty) {
      setFormError(`Quantidade insuficiente em estoque. Disponível: ${part.stockQty}`);
      return;
    }
    setFormError(null);

    onConfirm(part.id, type, quantity, createFinancialEntry && type === 'entrada', totalCost, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Movimentar Estoque</h3>
            <p className="text-xs text-slate-500 font-mono">
              {part.code} • {part.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs font-semibold flex items-center justify-between">
            <span>{formError}</span>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-rose-600 hover:text-rose-900 underline font-bold cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('entrada')}
              className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                type === 'entrada'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-emerald-600" />
              <span>Entrada (Compra/NF)</span>
            </button>

            <button
              type="button"
              onClick={() => setType('saida')}
              className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                type === 'saida'
                  ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              <span>Saída (Ajuste/Baixa)</span>
            </button>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs flex justify-between">
            <span className="text-slate-600">Estoque Atual:</span>
            <span className="font-bold font-mono text-slate-900">{part.stockQty} {part.unit}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Quantidade</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold font-mono focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {type === 'entrada' && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Custo Un. (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitCost}
                  onChange={(e) => setUnitCost(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
          </div>

          {type === 'entrada' && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-900">Total da Nota/Compra:</span>
                <span className="font-mono text-amber-950 text-sm">R$ {totalCost.toFixed(2)}</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-amber-900">
                <input
                  type="checkbox"
                  checked={createFinancialEntry}
                  onChange={(e) => setCreateFinancialEntry(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Lançar saída de caixa automaticamente em Contas a Pagar</span>
              </label>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Motivo / Fornecedor / NF</label>
            <input
              type="text"
              placeholder="Ex: NF 14592 - Distribuidora Diesel Brasil"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg shadow-sm flex items-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Movimentação</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
