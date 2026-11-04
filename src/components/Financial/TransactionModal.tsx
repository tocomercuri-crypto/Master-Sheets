import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ArrowDownRight, ArrowUpRight, DollarSign } from 'lucide-react';
import {
  CashTransaction,
  TransactionType,
  TransactionCategory,
  PaymentMethod,
} from '../../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: CashTransaction) => void;
  initialTransaction?: CashTransaction | null;
}

const CATEGORIES_ENTRADA: TransactionCategory[] = [
  'Serviço de Bancada (OS)',
  'Venda de Peças',
  'Outras Receitas',
];

const CATEGORIES_SAIDA: TransactionCategory[] = [
  'Compra de Peças / Fornecedores',
  'Insumos de Laboratório (Líquido de Calibração, etc.)',
  'Ferramentas e Manutenção de Bancadas',
  'Salários e Comissões',
  'Aluguel e Infraestrutura',
  'Energia e Utilidades',
  'Impostos e Tributos',
  'Outras Despesas',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Pix',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Boleto Bancário',
  'Transferência/TED',
  'Dinheiro',
  'Faturado a Prazo',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTransaction,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<TransactionType>('entrada');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Serviço de Bancada (OS)');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [status, setStatus] = useState<'liquidado' | 'pendente'>('liquidado');
  const [serviceOrderId, setServiceOrderId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setDescription(initialTransaction.description);
      setCategory(initialTransaction.category);
      setAmount(initialTransaction.amount);
      setDate(initialTransaction.date);
      setDueDate(initialTransaction.dueDate || '');
      setPaymentMethod(initialTransaction.paymentMethod);
      setStatus(initialTransaction.status);
      setServiceOrderId(initialTransaction.serviceOrderId || '');
      setSupplierName(initialTransaction.supplierName || '');
      setNotes(initialTransaction.notes || '');
    } else {
      setType('entrada');
      setDescription('');
      setCategory('Serviço de Bancada (OS)');
      setAmount(0);
      setDate(new Date().toISOString().slice(0, 10));
      setDueDate('');
      setPaymentMethod('Pix');
      setStatus('liquidado');
      setServiceOrderId('');
      setSupplierName('');
      setNotes('');
    }
    setFormError(null);
  }, [initialTransaction, isOpen]);

  const [formError, setFormError] = useState<string | null>(null);

  // Handle type change and switch default category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'entrada') {
      setCategory('Serviço de Bancada (OS)');
    } else {
      setCategory('Compra de Peças / Fornecedores');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setFormError('Por favor, informe a descrição do lançamento.');
      return;
    }
    if (amount <= 0) {
      setFormError('O valor deve ser maior que zero.');
      return;
    }
    setFormError(null);

    const transactionData: CashTransaction = {
      id: initialTransaction ? initialTransaction.id : `tr-${Date.now()}`,
      type,
      description: description.trim(),
      category,
      amount: Number(amount),
      date,
      dueDate: dueDate || undefined,
      paymentMethod,
      status,
      serviceOrderId: serviceOrderId.trim() || undefined,
      supplierName: supplierName.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onSave(transactionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl my-6 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialTransaction ? 'Editar Lançamento Financeiro' : 'Novo Lançamento no Fluxo de Caixa'}
              </h2>
              <p className="text-xs text-slate-400">
                Master Diesel Center • Entradas & Saídas Financeiras
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="mx-6 mt-3 p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-sm font-semibold flex items-center justify-between">
            <span>{formError}</span>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-xs text-rose-600 hover:text-rose-900 underline font-bold cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Switch Type: Entrada vs Saída */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('entrada')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                type === 'entrada'
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>ENTRADA (Receitas / Vendas)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('saida')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                type === 'saida'
                  ? 'bg-rose-600 text-white border-rose-700 shadow-md shadow-rose-600/20'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>SAÍDA (Despesas / Compras)</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Descrição do Lançamento
            </label>
            <input
              type="text"
              required
              placeholder={
                type === 'entrada'
                  ? 'Ex: Recebimento OS-2024-00101 (Scania R440)'
                  : 'Ex: Compra de Tambor de Líquido de Calibração ISO 4113'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base font-black font-mono text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-500"
              >
                {(type === 'entrada' ? CATEGORIES_ENTRADA : CATEGORIES_SAIDA).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Data Competência</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Data Vencimento</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-500"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Situação / Status</label>
              <div className="flex items-center gap-3 mt-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'liquidado'}
                    onChange={() => setStatus('liquidado')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-emerald-700 font-bold">Liquidado / Pago</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'pendente'}
                    onChange={() => setStatus('pendente')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-amber-700 font-bold">Pendente / A Vencer</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                {type === 'entrada' ? 'Nº OS Vinculada' : 'Fornecedor / Credor'}
              </label>
              <input
                type="text"
                placeholder={type === 'entrada' ? 'Ex: OS-2024-00101' : 'Ex: Distribuidora Central Diesel'}
                value={type === 'entrada' ? serviceOrderId : supplierName}
                onChange={(e) =>
                  type === 'entrada' ? setServiceOrderId(e.target.value) : setSupplierName(e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Observações Adicionais</label>
            <input
              type="text"
              placeholder="Ex: Pago via Pix com comprovante arquivado."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Lançamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
