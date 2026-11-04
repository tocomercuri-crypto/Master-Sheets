import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Wrench,
  Package,
  Layers,
  Gauge,
  CheckCircle2,
  Calendar,
  User,
  Car,
  AlertCircle,
  FileText,
} from 'lucide-react';
import {
  ServiceOrder,
  OrderStatus,
  ComponentType,
  OrderPartItem,
  OrderLaborItem,
  Client,
  Part,
  PaymentMethod,
} from '../../types';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: ServiceOrder, deductStock: boolean) => void;
  initialOrder?: ServiceOrder | null;
  clients: Client[];
  partsInventory: Part[];
}

const COMPONENT_OPTIONS: ComponentType[] = [
  'Bicos Injetores Common Rail',
  'Bomba de Alta Pressão (CP1/CP3/CP4)',
  'Bomba Injetora Rotativa (VE/DPA)',
  'Bomba Injetora em Linha (P/A/MW)',
  'Unidade Injetora (EUI/PDE)',
  'Válvula Reguladora/Dosadora',
  'Turbocompressor',
  'Sistema Completo de Injeção',
  'Outro',
];

const PREDEFINED_SERVICES = [
  { name: 'Teste Computadorizado em Bancada EPS 205 / CRI-PC', defaultPrice: 120 },
  { name: 'Calibração Micrométrica e Equalização de Débito', defaultPrice: 150 },
  { name: 'Desmontagem e Limpeza Ultrassônica em Cuba Aquecida', defaultPrice: 180 },
  { name: 'Revisão Completa e Regulagem de Bomba Injetora em Bancada', defaultPrice: 580 },
  { name: 'Substituição de Válvula de Controle e Montagem', defaultPrice: 140 },
  { name: 'Substituição de Ponteiras e Ajuste de Pré-Injeção', defaultPrice: 160 },
  { name: 'Diagnóstico Eletrônico e Apagamento de Códigos DTC', defaultPrice: 150 },
];

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialOrder,
  clients,
  partsInventory,
}) => {
  if (!isOpen) return null;

  // Form states
  const [orderNumber, setOrderNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [deliveryDate, setDeliveryDate] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleMileage, setVehicleMileage] = useState('');
  const [componentType, setComponentType] = useState<ComponentType>('Bicos Injetores Common Rail');
  const [componentCode, setComponentCode] = useState('');
  const [complaintNotes, setComplaintNotes] = useState('');
  const [status, setStatus] = useState<OrderStatus>('orcamento');
  const [warrantyPeriod, setWarrantyPeriod] = useState('90 dias');
  const [observations, setObservations] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [isPaid, setIsPaid] = useState(false);
  const [discount, setDiscount] = useState<number>(0);
  const [deductStock, setDeductStock] = useState(true);

  // Bench Test States
  const [benchModel, setBenchModel] = useState('Bosch EPS 205');
  const [preInjection, setPreInjection] = useState('');
  const [mainInjection, setMainInjection] = useState('');
  const [returnFlow, setReturnFlow] = useState('');
  const [leakTest, setLeakTest] = useState<'Aprovado' | 'Reprovado' | 'Não Realizado'>('Aprovado');
  const [openingPressure, setOpeningPressure] = useState('1600 bar');
  const [technicianNotes, setTechnicianNotes] = useState('');

  // Discrimination: Parts & Labor lists
  const [parts, setParts] = useState<OrderPartItem[]>([]);
  const [labor, setLabor] = useState<OrderLaborItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFormError(null);
    if (initialOrder) {
      setOrderNumber(initialOrder.orderNumber);
      setDate(initialOrder.date);
      setDeliveryDate(initialOrder.deliveryDate || '');
      setClientId(initialOrder.clientId);
      setClientName(initialOrder.clientName);
      setClientPhone(initialOrder.clientPhone);
      setVehicleModel(initialOrder.vehicleModel);
      setVehiclePlate(initialOrder.vehiclePlate);
      setVehicleMileage(initialOrder.vehicleMileage || '');
      setComponentType(initialOrder.componentType);
      setComponentCode(initialOrder.componentCode);
      setComplaintNotes(initialOrder.complaintNotes);
      setStatus(initialOrder.status);
      setParts(initialOrder.parts || []);
      setLabor(initialOrder.labor || []);
      setDiscount(initialOrder.discount || 0);
      setPaymentMethod(initialOrder.paymentMethod || 'Pix');
      setIsPaid(initialOrder.isPaid || false);
      setWarrantyPeriod(initialOrder.warrantyPeriod || '90 dias');
      setObservations(initialOrder.observations || '');

      if (initialOrder.benchTest) {
        setBenchModel(initialOrder.benchTest.benchModel || 'Bosch EPS 205');
        setPreInjection(initialOrder.benchTest.preInjection || '');
        setMainInjection(initialOrder.benchTest.mainInjection || '');
        setReturnFlow(initialOrder.benchTest.returnFlow || '');
        setLeakTest(initialOrder.benchTest.leakTest || 'Aprovado');
        setOpeningPressure(initialOrder.benchTest.openingPressure || '1600 bar');
        setTechnicianNotes(initialOrder.benchTest.technicianNotes || '');
      }
    } else {
      // New Order defaults
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setOrderNumber(`OS-${new Date().getFullYear()}-${randomNum}`);
      setDate(new Date().toISOString().slice(0, 10));
      setDeliveryDate('');
      setClientId('');
      setClientName('');
      setClientPhone('');
      setVehicleModel('');
      setVehiclePlate('');
      setVehicleMileage('');
      setComponentType('Bicos Injetores Common Rail');
      setComponentCode('');
      setComplaintNotes('');
      setStatus('orcamento');
      setParts([]);
      setLabor([
        {
          id: 'lab-1',
          serviceName: 'Teste Computadorizado em Bancada EPS 205 / CRI-PC',
          technician: 'Marcio Silva (Especialista Diesel)',
          hoursOrQty: 1,
          unitPrice: 120,
          subtotal: 120,
        },
      ]);
      setDiscount(0);
      setPaymentMethod('Pix');
      setIsPaid(false);
      setWarrantyPeriod('90 dias');
      setObservations('');
      setBenchModel('Bosch EPS 205');
      setPreInjection('');
      setMainInjection('');
      setReturnFlow('');
      setLeakTest('Aprovado');
      setOpeningPressure('1600 bar');
      setTechnicianNotes('');
    }
  }, [initialOrder, isOpen]);

  // Handle client selection
  const handleClientSelect = (selectedId: string) => {
    setClientId(selectedId);
    const found = clients.find((c) => c.id === selectedId);
    if (found) {
      setClientName(found.name);
      setClientPhone(found.phone);
      if (found.fleetInfo && !vehicleModel) {
        setVehicleModel(found.fleetInfo);
      }
    }
  };

  // Parts helpers
  const handleAddPartFromStock = (partId: string) => {
    if (!partId) return;
    const invPart = partsInventory.find((p) => p.id === partId);
    if (!invPart) return;

    const newItem: OrderPartItem = {
      id: `part-${Date.now()}-${Math.random()}`,
      partId: invPart.id,
      code: invPart.code,
      description: invPart.description,
      manufacturer: invPart.manufacturer,
      quantity: 1,
      unitPrice: invPart.sellingPrice,
      subtotal: invPart.sellingPrice,
    };
    setParts((prev) => [...prev, newItem]);
  };

  const handleAddCustomPart = () => {
    const newItem: OrderPartItem = {
      id: `part-${Date.now()}-${Math.random()}`,
      code: 'DIV-01',
      description: 'Peça ou Reparo Avulso',
      manufacturer: 'Bosch',
      quantity: 1,
      unitPrice: 0,
      subtotal: 0,
    };
    setParts((prev) => [...prev, newItem]);
  };

  const updatePartItem = (index: number, field: keyof OrderPartItem, value: any) => {
    setParts((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = field === 'quantity' ? Number(value) || 0 : current.quantity;
        const price = field === 'unitPrice' ? Number(value) || 0 : current.unitPrice;
        current.subtotal = qty * price;
      }
      updated[index] = current;
      return updated;
    });
  };

  const removePartItem = (index: number) => {
    setParts((prev) => prev.filter((_, i) => i !== index));
  };

  // Labor helpers
  const handleAddPredefinedLabor = (name: string, price: number) => {
    const newItem: OrderLaborItem = {
      id: `labor-${Date.now()}-${Math.random()}`,
      serviceName: name,
      technician: 'Marcio Silva (Especialista Diesel)',
      hoursOrQty: 1,
      unitPrice: price,
      subtotal: price,
    };
    setLabor((prev) => [...prev, newItem]);
  };

  const handleAddCustomLabor = () => {
    const newItem: OrderLaborItem = {
      id: `labor-${Date.now()}-${Math.random()}`,
      serviceName: 'Serviço de Bancada Especializado',
      technician: 'Técnico de Bancada',
      hoursOrQty: 1,
      unitPrice: 150,
      subtotal: 150,
    };
    setLabor((prev) => [...prev, newItem]);
  };

  const updateLaborItem = (index: number, field: keyof OrderLaborItem, value: any) => {
    setLabor((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };
      if (field === 'hoursOrQty' || field === 'unitPrice') {
        const qty = field === 'hoursOrQty' ? Number(value) || 0 : current.hoursOrQty;
        const price = field === 'unitPrice' ? Number(value) || 0 : current.unitPrice;
        current.subtotal = qty * price;
      }
      updated[index] = current;
      return updated;
    });
  };

  const removeLaborItem = (index: number) => {
    setLabor((prev) => prev.filter((_, i) => i !== index));
  };

  // Subtotals and totals calculation
  const partsTotal = parts.reduce((acc, curr) => acc + curr.subtotal, 0);
  const laborTotal = labor.reduce((acc, curr) => acc + curr.subtotal, 0);
  const grossTotal = partsTotal + laborTotal;
  const totalAmount = Math.max(0, grossTotal - (discount || 0));

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!clientName.trim()) {
      setFormError('Por favor, informe o Nome ou Razão Social do cliente.');
      return;
    }

    setFormError(null);
    const finalVehicleModel = vehicleModel.trim() || `${componentType} (Bancada Avulsa)`;

    const orderData: ServiceOrder = {
      id: initialOrder ? initialOrder.id : `os-${Date.now()}`,
      orderNumber: orderNumber.trim() || `OS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: date || new Date().toISOString().slice(0, 10),
      deliveryDate: deliveryDate || undefined,
      clientId: clientId || `cli-temp-${Date.now()}`,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      vehicleModel: finalVehicleModel,
      vehiclePlate: vehiclePlate.trim().toUpperCase() || 'BANCADA',
      vehicleMileage: vehicleMileage.trim() || undefined,
      componentType,
      componentCode: componentCode.trim(),
      complaintNotes: complaintNotes.trim(),
      status,
      parts,
      partsTotal,
      labor,
      laborTotal,
      discount: Number(discount) || 0,
      totalAmount,
      paymentMethod,
      isPaid,
      warrantyPeriod: warrantyPeriod || '90 dias',
      observations: observations.trim(),
      benchTest: {
        benchModel,
        preInjection,
        mainInjection,
        returnFlow,
        leakTest,
        openingPressure,
        technicianNotes,
      },
    };

    onSave(orderData, deductStock && (status === 'em_execucao' || status === 'concluida' || status === 'faturada'));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-6 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialOrder ? `Editar Ordem de Serviço: ${orderNumber}` : 'Nova Ordem de Serviço (OS)'}
              </h2>
              <p className="text-xs text-slate-400">
                Master Diesel Center • Discriminação rigorosa de Peças & Mão de Obra de Bancada
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inline Error Banner */}
        {formError && (
          <div className="mx-6 mt-3 p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between text-rose-800 text-sm font-semibold shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-xs text-rose-600 hover:text-rose-900 font-bold underline cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Modal Body & Footer wrapped in Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Top Row: OS Details, Dates, Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Número da OS</label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Data Entrada</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Previsão Entrega</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status da OS</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
              >
                <option value="orcamento">🟡 Orçamento</option>
                <option value="teste_bancada">🟣 Em Teste de Bancada</option>
                <option value="aguardando_pecas">🟠 Aguardando Peças</option>
                <option value="em_execucao">🔵 Em Execução / Montagem</option>
                <option value="concluida">🟢 Concluída / Aguarda Retirada</option>
                <option value="faturada">💰 Faturada & Paga</option>
                <option value="cancelada">🔴 Cancelada</option>
              </select>
            </div>
          </div>

          {/* Section: Customer & Vehicle / Component info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Box */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-600" />
                  Dados do Cliente
                </span>
                {clients.length > 0 && (
                  <select
                    onChange={(e) => handleClientSelect(e.target.value)}
                    value={clientId}
                    className="text-xs px-2 py-1 bg-amber-50 border border-amber-200 rounded text-amber-900 font-medium"
                  >
                    <option value="">Selecionar cliente cadastrado...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.document})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-xs text-slate-700 font-bold">Nome / Razão Social do Cliente *</label>
                  {formError && !clientName.trim() && (
                    <span className="text-[11px] text-rose-600 font-bold">Campo obrigatório</span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Ex: Transportadora Rota do Sol Ltda"
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 transition-all ${
                    formError && !clientName.trim()
                      ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-200'
                      : 'border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-0.5 font-medium">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Vehicle & Equipment Box */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-blue-600" />
                  Veículo & Componente Diesel
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-600 mb-0.5 font-medium">
                    Veículo / Máquina (ou Bancada)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Scania R440 ou Bancada"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-0.5 font-medium">Placa / Identificador</label>
                  <input
                    type="text"
                    placeholder="Ex: BRA2E19"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold uppercase focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-600 mb-0.5 font-medium">Tipo do Componente</label>
                  <select
                    value={componentType}
                    onChange={(e) => setComponentType(e.target.value as ComponentType)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500"
                  >
                    {COMPONENT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-0.5 font-medium">Código do Componente</label>
                  <input
                    type="text"
                    placeholder="Ex: Bosch 0445110369"
                    value={componentCode}
                    onChange={(e) => setComponentCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Problem / Complaint */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Reclamação do Cliente / Diagnóstico Inicial
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Fumaça preta em aceleração, falha de injeção no 3º cilindro, lâmpada de injeção acesa..."
              value={complaintNotes}
              onChange={(e) => setComplaintNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* CRITICAL SECTION 1: DISCRIMINAÇÃO DE PEÇAS */}
          <div className="bg-amber-50/50 rounded-xl border border-amber-200/80 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                    1. Peças & Componentes Substituídos
                  </h3>
                  <p className="text-xs text-slate-600">
                    Discriminação individual das peças utilizadas com baixa no estoque
                  </p>
                </div>
              </div>

              {/* Add part triggers */}
              <div className="flex items-center gap-2">
                {partsInventory.length > 0 && (
                  <select
                    onChange={(e) => {
                      handleAddPartFromStock(e.target.value);
                      e.target.value = '';
                    }}
                    className="text-xs px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-800 font-medium shadow-xs"
                  >
                    <option value="">+ Inserir Peça do Estoque...</option>
                    {partsInventory.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.description} (Disp: {p.stockQty}) - R$ {p.sellingPrice.toFixed(2)}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  onClick={handleAddCustomPart}
                  className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Peça Avulsa</span>
                </button>
              </div>
            </div>

            {/* Parts Table */}
            {parts.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2 text-center bg-white/70 rounded-lg border border-dashed border-amber-300">
                Nenhuma peça incluída nesta OS ainda. Utilize os botões acima para adicionar peças do estoque ou avulsas.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs bg-white rounded-lg border border-amber-200">
                  <thead className="bg-amber-100/70 text-slate-800 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="p-2">Cód. Peça</th>
                      <th className="p-2">Descrição</th>
                      <th className="p-2">Marca</th>
                      <th className="p-2 w-20 text-center">Qtd</th>
                      <th className="p-2 w-28 text-right">Unitário (R$)</th>
                      <th className="p-2 w-28 text-right">Subtotal (R$)</th>
                      <th className="p-2 w-10 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {parts.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-amber-50/50">
                        <td className="p-2">
                          <input
                            type="text"
                            value={p.code}
                            onChange={(e) => updatePartItem(idx, 'code', e.target.value)}
                            className="w-24 px-1.5 py-1 font-mono text-xs border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={p.description}
                            onChange={(e) => updatePartItem(idx, 'description', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={p.manufacturer}
                            onChange={(e) => updatePartItem(idx, 'manufacturer', e.target.value)}
                            className="w-20 px-1.5 py-1 text-xs border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={p.quantity}
                            onChange={(e) => updatePartItem(idx, 'quantity', e.target.value)}
                            className="w-16 px-1.5 py-1 text-xs text-center border border-slate-200 rounded font-semibold"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={p.unitPrice}
                            onChange={(e) => updatePartItem(idx, 'unitPrice', e.target.value)}
                            className="w-24 px-1.5 py-1 text-xs text-right border border-slate-200 rounded font-mono"
                          />
                        </td>
                        <td className="p-2 text-right font-bold text-slate-900 font-mono">
                          R$ {p.subtotal.toFixed(2)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removePartItem(idx)}
                            className="text-slate-400 hover:text-red-500 p-1"
                            title="Remover peça"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-amber-100/50 font-bold text-slate-900">
                      <td colSpan={5} className="p-2.5 text-right uppercase text-[11px]">
                        Subtotal de Peças:
                      </td>
                      <td className="p-2.5 text-right font-black font-mono text-sm text-amber-950">
                        R$ {partsTotal.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* CRITICAL SECTION 2: DISCRIMINAÇÃO DE MÃO DE OBRA / SERVIÇOS */}
          <div className="bg-blue-50/50 rounded-xl border border-blue-200/80 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                    2. Mão de Obra & Serviços Técnicos de Bancada
                  </h3>
                  <p className="text-xs text-slate-600">
                    Discriminação dos serviços executados por técnicos e horas de bancada
                  </p>
                </div>
              </div>

              {/* Add labor triggers */}
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => {
                    const item = PREDEFINED_SERVICES.find((s) => s.name === e.target.value);
                    if (item) handleAddPredefinedLabor(item.name, item.defaultPrice);
                    e.target.value = '';
                  }}
                  className="text-xs px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-slate-800 font-medium shadow-xs"
                >
                  <option value="">+ Selecionar Serviço Padrão...</option>
                  {PREDEFINED_SERVICES.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} (R$ {s.defaultPrice.toFixed(2)})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddCustomLabor}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Serviço Avulso</span>
                </button>
              </div>
            </div>

            {/* Labor Table */}
            {labor.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2 text-center bg-white/70 rounded-lg border border-dashed border-blue-300">
                Nenhum serviço de mão de obra inserido. Adicione serviços pelo menu acima.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs bg-white rounded-lg border border-blue-200">
                  <thead className="bg-blue-100/70 text-slate-800 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="p-2">Descrição do Serviço</th>
                      <th className="p-2">Técnico Responsável</th>
                      <th className="p-2 w-20 text-center">Horas/Qtd</th>
                      <th className="p-2 w-28 text-right">Valor Un (R$)</th>
                      <th className="p-2 w-28 text-right">Subtotal (R$)</th>
                      <th className="p-2 w-10 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {labor.map((l, idx) => (
                      <tr key={l.id} className="hover:bg-blue-50/50">
                        <td className="p-2">
                          <input
                            type="text"
                            value={l.serviceName}
                            onChange={(e) => updateLaborItem(idx, 'serviceName', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={l.technician}
                            onChange={(e) => updateLaborItem(idx, 'technician', e.target.value)}
                            className="w-48 px-2 py-1 text-xs border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            value={l.hoursOrQty}
                            onChange={(e) => updateLaborItem(idx, 'hoursOrQty', e.target.value)}
                            className="w-16 px-1.5 py-1 text-xs text-center border border-slate-200 rounded font-semibold"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={l.unitPrice}
                            onChange={(e) => updateLaborItem(idx, 'unitPrice', e.target.value)}
                            className="w-24 px-1.5 py-1 text-xs text-right border border-slate-200 rounded font-mono"
                          />
                        </td>
                        <td className="p-2 text-right font-bold text-slate-900 font-mono">
                          R$ {l.subtotal.toFixed(2)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeLaborItem(idx)}
                            className="text-slate-400 hover:text-red-500 p-1"
                            title="Remover serviço"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-blue-100/50 font-bold text-slate-900">
                      <td colSpan={4} className="p-2.5 text-right uppercase text-[11px]">
                        Subtotal de Mão de Obra:
                      </td>
                      <td className="p-2.5 text-right font-black font-mono text-sm text-blue-950">
                        R$ {laborTotal.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Section: Bench Test Report (Laudo de Bancada) */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-purple-600" />
              Laudo Técnico de Bancada de Injeção Diesel
            </span>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Bancada Utilizada</label>
                <input
                  type="text"
                  value={benchModel}
                  onChange={(e) => setBenchModel(e.target.value)}
                  placeholder="Bosch EPS 205"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Pré-Injeção</label>
                <input
                  type="text"
                  value={preInjection}
                  onChange={(e) => setPreInjection(e.target.value)}
                  placeholder="2.2 mm³/st"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Débito Principal</label>
                <input
                  type="text"
                  value={mainInjection}
                  onChange={(e) => setMainInjection(e.target.value)}
                  placeholder="51.5 mm³/st"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Vazão de Retorno</label>
                <input
                  type="text"
                  value={returnFlow}
                  onChange={(e) => setReturnFlow(e.target.value)}
                  placeholder="18.5 ml/min"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Teste de Estanqueidade</label>
                <select
                  value={leakTest}
                  onChange={(e) => setLeakTest(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold"
                >
                  <option value="Aprovado">✅ Aprovado (Zero vazamento)</option>
                  <option value="Reprovado">❌ Reprovado</option>
                  <option value="Não Realizado">⚪ Não Realizado</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Pressão de Teste (Rail)</label>
                <input
                  type="text"
                  value={openingPressure}
                  onChange={(e) => setOpeningPressure(e.target.value)}
                  placeholder="1600 bar"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Parecer Técnico da Bancada</label>
                <input
                  type="text"
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  placeholder="Ex: Todos os injetores calibrados dentro da tolerância do fabricante..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Section: Totals, Discounts & Payment */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Forma de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-semibold text-white focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Pix">Pix (Imediato)</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Boleto Bancário">Boleto Bancário</option>
                  <option value="Transferência/TED">Transferência Bancária</option>
                  <option value="Faturado a Prazo">Faturado a Prazo (28/30 dias)</option>
                  <option value="Dinheiro">Dinheiro Espécie</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Status Pagamento</label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span className={`text-xs font-bold ${isPaid ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {isPaid ? 'PAGO / LIQUIDADO' : 'PENDENTE / A RECEBER'}
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Desconto (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-mono text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Total Display */}
              <div className="bg-slate-800/90 rounded-lg p-3 border border-slate-700 text-right">
                <div className="text-[11px] text-slate-400 uppercase font-semibold flex justify-between">
                  <span>Peças: R$ {partsTotal.toFixed(2)}</span>
                  <span>Mão de Obra: R$ {laborTotal.toFixed(2)}</span>
                </div>
                <div className="mt-1">
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">
                    Valor Total Líquido
                  </span>
                  <span className="text-2xl font-black text-white font-mono">
                    R$ {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-slate-400 mr-2">Garantia:</span>
                  <input
                    type="text"
                    value={warrantyPeriod}
                    onChange={(e) => setWarrantyPeriod(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200"
                    placeholder="90 dias"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={deductStock}
                    onChange={(e) => setDeductStock(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-amber-500"
                  />
                  <span>Dar baixa automática das peças no estoque físico</span>
                </label>
              </div>
            </div>
          </div>
        </div>

          {/* Modal Footer inside Form */}
          <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-3">
              {formError && (
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1.5 bg-rose-100/80 px-2.5 py-1 rounded-md">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  {formError}
                </span>
              )}
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black text-sm rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar Ordem de Serviço</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
