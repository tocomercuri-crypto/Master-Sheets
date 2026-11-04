export type OrderStatus =
  | 'orcamento'
  | 'teste_bancada'
  | 'aguardando_pecas'
  | 'em_execucao'
  | 'concluida'
  | 'faturada'
  | 'cancelada';

export type ComponentType =
  | 'Bicos Injetores Common Rail'
  | 'Bomba de Alta Pressão (CP1/CP3/CP4)'
  | 'Bomba Injetora Rotativa (VE/DPA)'
  | 'Bomba Injetora em Linha (P/A/MW)'
  | 'Unidade Injetora (EUI/PDE)'
  | 'Válvula Reguladora/Dosadora'
  | 'Turbocompressor'
  | 'Sistema Completo de Injeção'
  | 'Outro';

export interface OrderPartItem {
  id: string;
  partId?: string;
  code: string;
  description: string;
  manufacturer: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderLaborItem {
  id: string;
  serviceName: string;
  technician: string;
  hoursOrQty: number;
  unitPrice: number;
  subtotal: number;
}

export interface BenchTestReport {
  benchModel: string; // Ex: Bosch EPS 205 / Hartridge Cri-PC
  preInjection: string; // ex: 2.1 mm³/H
  mainInjection: string; // ex: 48.5 mm³/H
  returnFlow: string; // ex: 22.0 ml/min
  leakTest: 'Aprovado' | 'Reprovado' | 'Não Realizado';
  openingPressure: string; // ex: 1600 bar
  technicianNotes: string;
}

export interface ServiceOrder {
  id: string;
  orderNumber: string; // ex: OS-2024-00104
  date: string;
  deliveryDate?: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  vehicleModel: string; // ex: Toyota Hilux 2.8 D-4D
  vehiclePlate: string; // ex: BRA-2E19
  vehicleMileage?: string; // ex: 185.000 km
  componentType: ComponentType;
  componentCode: string; // ex: Bosch 0445110369
  complaintNotes: string; // O que o cliente relatou: Fumaça preta, perda de potência, falha em alta
  status: OrderStatus;
  
  // Discrimination between parts and labor
  parts: OrderPartItem[];
  partsTotal: number;
  
  labor: OrderLaborItem[];
  laborTotal: number;
  
  discount: number;
  totalAmount: number;
  
  benchTest?: BenchTestReport;
  paymentMethod?: PaymentMethod;
  isPaid: boolean;
  warrantyPeriod: string; // ex: "90 dias" ou "6 meses"
  observations?: string;
}

export interface Part {
  id: string;
  code: string; // Código Interno
  mfgCode: string; // Código Fabricante (Bosch, Delphi, Denso, etc.)
  description: string;
  category: string; // ex: Ponteiras, Válvulas, Reparos, Injetores, Sensores
  manufacturer: string; // Bosch, Delphi, Denso, Stanadyne, Mahle, VDO
  unit: string; // UN, JG, KT, PAR
  costPrice: number;
  sellingPrice: number;
  stockQty: number;
  minStockQty: number;
  location: string; // Prateleira A-02, Gaveta 14
}

export interface Client {
  id: string;
  name: string; // Razão Social / Nome
  contactPerson?: string; // Responsável / Motorista
  document: string; // CPF ou CNPJ
  documentType: 'CPF' | 'CNPJ';
  phone: string; // WhatsApp
  email: string;
  city: string;
  state: string;
  address: string;
  fleetInfo?: string; // Ex: 5 caminhões Scania / Fazenda Boa Vista
  notes?: string;
  createdAt: string;
}

export type TransactionType = 'entrada' | 'saida';

export type PaymentMethod =
  | 'Pix'
  | 'Cartão de Crédito'
  | 'Cartão de Débito'
  | 'Dinheiro'
  | 'Boleto Bancário'
  | 'Transferência/TED'
  | 'Faturado a Prazo';

export type TransactionCategory =
  | 'Serviço de Bancada (OS)'
  | 'Venda de Peças'
  | 'Compra de Peças / Fornecedores'
  | 'Insumos de Laboratório (Líquido de Calibração, etc.)'
  | 'Ferramentas e Manutenção de Bancadas'
  | 'Salários e Comissões'
  | 'Aluguel e Infraestrutura'
  | 'Energia e Utilidades'
  | 'Impostos e Tributos'
  | 'Outras Receitas'
  | 'Outras Despesas';

export interface CashTransaction {
  id: string;
  date: string;
  dueDate?: string;
  type: TransactionType;
  description: string;
  category: TransactionCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  status: 'liquidado' | 'pendente';
  serviceOrderId?: string;
  clientId?: string;
  supplierName?: string;
  notes?: string;
}

export interface MonthlyFinancialSummary {
  monthYear: string; // ex: "2024-11"
  totalInflow: number;
  totalOutflow: number;
  netProfit: number;
  totalPartsSales: number;
  totalLaborSales: number;
  ordersCompletedCount: number;
  averageTicket: number;
}
