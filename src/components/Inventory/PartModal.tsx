import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Package, Tag, Layers, MapPin } from 'lucide-react';
import { Part } from '../../types';

interface PartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (part: Part) => void;
  initialPart?: Part | null;
}

const CATEGORIES = [
  'Injetores',
  'Ponteiras',
  'Válvulas',
  'Kits Reparo',
  'Calibração',
  'Bombas de Alta Pressão',
  'Sensores',
  'Filtros',
  'Outros',
];

const MANUFACTURERS = ['Bosch', 'Delphi', 'Denso', 'Stanadyne', 'Continental/VDO', 'Mahle', 'Master Diesel'];

export const PartModal: React.FC<PartModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPart,
}) => {
  if (!isOpen) return null;

  const [code, setCode] = useState('');
  const [mfgCode, setMfgCode] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Injetores');
  const [manufacturer, setManufacturer] = useState('Bosch');
  const [unit, setUnit] = useState('UN');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [stockQty, setStockQty] = useState<number>(0);
  const [minStockQty, setMinStockQty] = useState<number>(5);
  const [location, setLocation] = useState('Prateleira A-01');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFormError(null);
    if (initialPart) {
      setCode(initialPart.code);
      setMfgCode(initialPart.mfgCode);
      setDescription(initialPart.description);
      setCategory(initialPart.category);
      setManufacturer(initialPart.manufacturer);
      setUnit(initialPart.unit);
      setCostPrice(initialPart.costPrice);
      setSellingPrice(initialPart.sellingPrice);
      setStockQty(initialPart.stockQty);
      setMinStockQty(initialPart.minStockQty);
      setLocation(initialPart.location);
    } else {
      setCode('');
      setMfgCode('');
      setDescription('');
      setCategory('Injetores');
      setManufacturer('Bosch');
      setUnit('UN');
      setCostPrice(0);
      setSellingPrice(0);
      setStockQty(0);
      setMinStockQty(4);
      setLocation('Prateleira A-01');
    }
  }, [initialPart, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setFormError('Por favor, informe a descrição da peça.');
      return;
    }
    setFormError(null);

    const partData: Part = {
      id: initialPart ? initialPart.id : `part-${Date.now()}`,
      code: code.trim() || `P-${Date.now().toString().slice(-4)}`,
      mfgCode: mfgCode.trim() || 'N/A',
      description: description.trim(),
      category,
      manufacturer,
      unit,
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      stockQty: Number(stockQty) || 0,
      minStockQty: Number(minStockQty) || 0,
      location: location.trim() || 'Almoxarifado',
    };

    onSave(partData);
    onClose();
  };

  const margin = sellingPrice - costPrice;
  const marginPercent = costPrice > 0 ? ((margin / costPrice) * 100).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialPart ? `Editar Peça: ${initialPart.code}` : 'Cadastrar Nova Peça no Estoque'}
              </h2>
              <p className="text-xs text-slate-400">
                Master Diesel Center • Almoxarifado de Peças e Insumos Diesel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Código Interno da Peça
              </label>
              <input
                type="text"
                placeholder="Ex: INJ-B0369"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Código Fabricante (Bosch / Delphi / Denso)
              </label>
              <input
                type="text"
                placeholder="Ex: 0445110369 ou 28231014"
                value={mfgCode}
                onChange={(e) => setMfgCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Descrição Completa da Peça
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Bico Injetor Common Rail Toyota Hilux 3.0 1KD-FTV"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Fabricante</label>
              <select
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                {MANUFACTURERS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Unidade</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="UN">UN (Unidade)</option>
                <option value="JG">JG (Jogo)</option>
                <option value="KT">KT (Kit)</option>
                <option value="PAR">PAR (Par)</option>
                <option value="L">L (Litro)</option>
              </select>
            </div>
          </div>

          {/* Pricing and Margins */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block mb-3">
              Valores & Margem de Lucro
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-600 font-medium mb-1">Preço de Custo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 font-medium mb-1">Preço de Venda (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col justify-center text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500">Margem Bruta Estimada</span>
                <span className="text-sm font-black text-emerald-600 font-mono">
                  R$ {margin.toFixed(2)} ({marginPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Stock Quantities & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Qtd Atual Estoque</label>
              <input
                type="number"
                min="0"
                value={stockQty}
                onChange={(e) => setStockQty(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold font-mono focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Estoque Mínimo (Alerta)</label>
              <input
                type="number"
                min="0"
                value={minStockQty}
                onChange={(e) => setMinStockQty(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-amber-700 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Localização no Galpão</label>
              <input
                type="text"
                placeholder="Ex: Prateleira B-03"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
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
              <span>Salvar Peça</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
