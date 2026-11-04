import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  Wrench,
  ShieldCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { ServiceOrder } from '../../types';

interface OrderPrintModalProps {
  order: ServiceOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderPrintModal: React.FC<OrderPrintModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const [copied, setCopied] = useState(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);

  const partsList = order.parts || [];
  const laborList = order.labor || [];
  const partsTotal = order.partsTotal ?? 0;
  const laborTotal = order.laborTotal ?? 0;
  const discount = order.discount ?? 0;
  const totalAmount = order.totalAmount ?? 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'orcamento':
        return 'ORÇAMENTO';
      case 'teste_bancada':
        return 'EM TESTE DE BANCADA';
      case 'aguardando_pecas':
        return 'AGUARDANDO PEÇAS';
      case 'em_execucao':
        return 'EM EXECUÇÃO / MONTAGEM';
      case 'concluida':
        return 'CONCLUÍDA';
      case 'faturada':
        return 'FATURADA / PAGA';
      default:
        return status ? status.toUpperCase() : 'PENDENTE';
    }
  };

  // Safe window.print with iframe sandbox fallback
  const handlePrint = () => {
    try {
      setPrintNotice(null);
      window.print();
    } catch (e: any) {
      console.warn('window.print() falhou ou foi bloqueado no iframe:', e);
      setPrintNotice(
        'A impressão direta foi limitada pelo navegador no ambiente de preview. Utilize o botão "Baixar Arquivo Imprimível" abaixo para abrir e imprimir normalmente.'
      );
      handleDownloadHTML();
    }
  };

  // Standalone printable HTML file download
  const handleDownloadHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${order.orderNumber} - Master Diesel Center</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 30px; color: #0f172a; line-height: 1.4; background: #ffffff; }
    .header { border-bottom: 3px solid #0f172a; padding-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-start; }
    .company-title { font-size: 24px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin: 0; }
    .company-sub { font-size: 13px; color: #334155; font-weight: 600; margin: 4px 0; }
    .company-info { font-size: 11px; color: #64748b; margin: 2px 0; }
    .os-badge { background: #0f172a; color: #f59e0b; padding: 4px 10px; font-weight: bold; font-size: 11px; border-radius: 4px; display: inline-block; margin-top: 4px; }
    .os-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; text-align: right; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 16px 0; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 12px; }
    .card h3 { margin-top: 0; font-size: 11px; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; }
    .section-title { background: #fef3c7; border-left: 4px solid #d97706; padding: 8px 12px; font-size: 12px; font-weight: 900; text-transform: uppercase; margin-top: 20px; margin-bottom: 8px; color: #78350f; display: flex; justify-content: space-between; }
    .section-labor { background: #eff6ff; border-left-color: #2563eb; color: #1e3a8a; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 12px; }
    th { background: #f1f5f9; padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; border: 1px solid #cbd5e1; color: #334155; }
    td { padding: 6px 8px; border: 1px solid #e2e8f0; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-mono { font-family: monospace; }
    .totals-box { background: #0f172a; color: white; border-radius: 8px; padding: 16px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
    .total-amount { font-size: 26px; font-weight: 900; color: #f59e0b; font-family: monospace; }
    .warranty { font-size: 11px; color: #475569; margin-top: 24px; border-top: 1px solid #cbd5e1; padding-top: 12px; text-align: justify; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; text-align: center; font-size: 11px; }
    .sig-line { border-top: 1px solid #64748b; padding-top: 6px; font-weight: bold; }
    .bench-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-top: 14px; font-size: 11px; }
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background: #e2e8f0; padding: 12px 18px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-size: 13px; font-weight: bold; color: #1e293b;">Master Diesel Center • Via de Impressão da OS ${order.orderNumber}</span>
    <button onclick="window.print()" style="background: #f59e0b; color: #0f172a; font-weight: 900; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 13px;">
      🖨️ IMPRIMIR / SALVAR EM PDF
    </button>
  </div>

  <div class="header">
    <div>
      <h1 class="company-title">MASTER DIESEL CENTER</h1>
      <div class="company-sub">Laboratório Especializado em Sistemas de Injeção Diesel Common Rail & Bombas</div>
      <div class="company-info">CNPJ: 18.922.341/0001-90 • Inscr. Estadual: 114.908.212 • Tel/WhatsApp: (11) 98765-4321</div>
      <div class="company-info">Av. Industrial dos Motores Diesel, 1200 - Distrito Mecânico - São Paulo/SP</div>
    </div>
    <div class="os-box">
      <div style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">ORDEM DE SERVIÇO</div>
      <div style="font-size: 22px; font-weight: 900; font-family: monospace; color: #0f172a;">${order.orderNumber}</div>
      <div class="os-badge">${getStatusBadge(order.status)}</div>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 10px 0; border-bottom: 1px solid #cbd5e1; font-size: 11px;">
    <div><strong>Data Entrada:</strong> ${order.date}</div>
    <div><strong>Previsão Entrega:</strong> ${order.deliveryDate || 'Conforme bancada'}</div>
    <div><strong>Forma Pagamento:</strong> ${order.paymentMethod || 'A combinar'}</div>
    <div><strong>Garantia:</strong> <span style="color: #b45309; font-weight: bold;">${order.warrantyPeriod || '90 dias'}</span></div>
  </div>

  <div class="grid">
    <div class="card">
      <h3>👤 DADOS DO CLIENTE</h3>
      <p><strong>Cliente:</strong> ${order.clientName}</p>
      <p><strong>Telefone/WhatsApp:</strong> ${order.clientPhone || 'Não informado'}</p>
    </div>
    <div class="card">
      <h3>🚚 VEÍCULO & EQUIPAMENTO</h3>
      <p><strong>Veículo:</strong> ${order.vehicleModel} - Placa: <strong>${order.vehiclePlate || 'S/P'}</strong></p>
      <p><strong>Componente:</strong> ${order.componentType} ${order.componentCode ? `(${order.componentCode})` : ''}</p>
    </div>
  </div>

  ${order.complaintNotes ? `<div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px; font-size: 11px; margin-bottom: 14px;"><strong>Sintomas Relatados:</strong> <em>${order.complaintNotes}</em></div>` : ''}

  <div class="section-title">
    <span>1. DISCRIMINAÇÃO DE PEÇAS & COMPONENTES APLICADOS</span>
    <span>Subtotal: R$ ${partsTotal.toFixed(2)}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Código</th>
        <th>Descrição</th>
        <th>Marca</th>
        <th class="text-center">Qtd</th>
        <th class="text-right">Unitário</th>
        <th class="text-right">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${partsList.map((p) => `<tr>
        <td class="font-mono">${p.code}</td>
        <td>${p.description}</td>
        <td>${p.manufacturer}</td>
        <td class="text-center"><strong>${p.quantity}</strong></td>
        <td class="text-right font-mono">R$ ${p.unitPrice.toFixed(2)}</td>
        <td class="text-right font-mono font-semibold">R$ ${p.subtotal.toFixed(2)}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <div class="section-title section-labor">
    <span>2. DISCRIMINAÇÃO DE MÃO DE OBRA & SERVIÇOS DE BANCADA</span>
    <span>Subtotal: R$ ${laborTotal.toFixed(2)}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Serviço Técnico Realizado</th>
        <th>Técnico Responsável</th>
        <th class="text-center">Horas/Qtd</th>
        <th class="text-right">Valor Un.</th>
        <th class="text-right">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${laborList.map((l) => `<tr>
        <td><strong>${l.serviceName}</strong></td>
        <td>${l.technician}</td>
        <td class="text-center"><strong>${l.hoursOrQty}</strong></td>
        <td class="text-right font-mono">R$ ${l.unitPrice.toFixed(2)}</td>
        <td class="text-right font-mono font-semibold">R$ ${l.subtotal.toFixed(2)}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  ${order.benchTest ? `
  <div class="bench-box">
    <strong>PARÂMETROS DE TESTE EM BANCADA COMPUTADORIZADA (${order.benchTest.benchModel || 'EPS 205'}):</strong>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 6px; font-family: monospace;">
      <div>Pré-Injeção: ${order.benchTest.preInjection || 'Normal'}</div>
      <div>Débito Princ.: ${order.benchTest.mainInjection || 'Normal'}</div>
      <div>Retorno: ${order.benchTest.returnFlow || 'Normal'}</div>
      <div>Estanqueidade: <strong>${order.benchTest.leakTest || 'Aprovado'}</strong></div>
    </div>
    ${order.benchTest.technicianNotes ? `<div style="margin-top: 6px; font-style: italic;">Observação: ${order.benchTest.technicianNotes}</div>` : ''}
  </div>` : ''}

  <div class="totals-box">
    <div style="font-size: 12px;">
      <div>Subtotal Peças: <strong>R$ ${partsTotal.toFixed(2)}</strong></div>
      <div>Subtotal Mão de Obra: <strong>R$ ${laborTotal.toFixed(2)}</strong></div>
      ${discount > 0 ? `<div style="color: #fca5a5;">Desconto: - R$ ${discount.toFixed(2)}</div>` : ''}
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; text-transform: uppercase; color: #f59e0b; font-weight: bold;">VALOR TOTAL LÍQUIDO DA O.S.</div>
      <div class="total-amount">R$ ${totalAmount.toFixed(2)}</div>
      <div style="font-size: 11px; color: #94a3b8;">Status: ${order.isPaid ? 'LIQUIDADO' : 'PENDENTE'} • ${order.paymentMethod || 'A combinar'}</div>
    </div>
  </div>

  <div class="warranty">
    <strong>Termos de Garantia:</strong> A Master Diesel Center oferece garantia legal de ${order.warrantyPeriod || '90 dias'} sobre as peças substituídas e serviços executados, condicionada à utilização de diesel limpo e troca regular dos filtros de combustível.
  </div>

  <div class="signatures">
    <div>
      <div class="sig-line">Técnico Responsável / Bancada</div>
      <span style="font-size: 10px; color: #64748b;">Master Diesel Center</span>
    </div>
    <div>
      <div class="sig-line">${order.clientName}</div>
      <span style="font-size: 10px; color: #64748b;">Assinatura do Cliente / Aceite</span>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${order.orderNumber}_Master_Diesel.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy plain text summary to clipboard
  const handleCopySummary = () => {
    const text = `MASTER DIESEL CENTER - ORDEM DE SERVIÇO ${order.orderNumber}
Cliente: ${order.clientName} (${order.clientPhone || 'S/ Tel'})
Veículo: ${order.vehicleModel} - Placa: ${order.vehiclePlate || 'S/P'}
Componente: ${order.componentType} ${order.componentCode ? `[${order.componentCode}]` : ''}

1. PEÇAS: R$ ${partsTotal.toFixed(2)}
${partsList.map((p) => ` - ${p.quantity}x ${p.description} (${p.code}) = R$ ${p.subtotal.toFixed(2)}`).join('\n')}

2. MÃO DE OBRA / BANCADA: R$ ${laborTotal.toFixed(2)}
${laborList.map((l) => ` - ${l.serviceName} (${l.technician}) = R$ ${l.subtotal.toFixed(2)}`).join('\n')}

Desconto: R$ ${discount.toFixed(2)}
VALOR TOTAL: R$ ${totalAmount.toFixed(2)}
Condição: ${order.paymentMethod || 'A combinar'} | Garantia: ${order.warrantyPeriod || '90 dias'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      {/* Top Modal Control Bar */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-6 z-50 flex items-center gap-2 print:hidden bg-slate-900/95 p-2 rounded-xl shadow-2xl border border-slate-700">
        <button
          onClick={handlePrint}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 transition-transform hover:scale-105"
          title="Imprimir documento diretamente"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir</span>
        </button>

        <button
          onClick={handleDownloadHTML}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 transition-transform hover:scale-105"
          title="Baixar arquivo da OS para abrir e salvar como PDF"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Baixar Arquivo Imprimível</span>
        </button>

        <button
          onClick={handleCopySummary}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          title="Copiar resumo formatado para colar no WhatsApp ou E-mail"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copiado!' : 'Copiar'}</span>
        </button>

        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
          title="Fechar visualização"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Printable Sheet */}
      <div
        id="printable-service-order"
        className="bg-white text-slate-900 rounded-xl shadow-2xl w-full max-w-4xl p-6 sm:p-8 my-8 border border-slate-300 print:shadow-none print:border-none print:m-0 print:p-4 print:w-full print:max-w-none font-sans"
      >
        {/* Helper notice if printed inside iframe */}
        {printNotice && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-start gap-2 print:hidden">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{printNotice}</p>
            </div>
          </div>
        )}

        {/* Company Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-900 text-amber-500 flex items-center justify-center font-black">
              <Wrench className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-wider text-slate-900 uppercase">
                MASTER DIESEL CENTER
              </h1>
              <p className="text-xs text-slate-700 font-semibold">
                Laboratório Especializado em Sistemas de Injeção Diesel Common Rail & Bombas
              </p>
              <p className="text-[11px] text-slate-500">
                CNPJ: 18.922.341/0001-90 • Inscr. Estadual: 114.908.212 • Tel/WhatsApp: (11) 98765-4321
              </p>
              <p className="text-[11px] text-slate-500">
                Av. Industrial dos Motores Diesel, 1200 - Distrito Mecânico - São Paulo/SP
              </p>
            </div>
          </div>

          <div className="text-right sm:self-center bg-slate-100 p-3 rounded-lg border border-slate-300">
            <div className="text-xs font-bold uppercase text-slate-500">ORDEM DE SERVIÇO</div>
            <div className="text-xl font-black text-slate-900 font-mono">{order.orderNumber}</div>
            <div className="inline-block mt-1 px-2 py-0.5 text-[10px] font-black uppercase rounded bg-slate-900 text-amber-400">
              {getStatusBadge(order.status)}
            </div>
          </div>
        </div>

        {/* OS General Details Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block uppercase font-bold text-[10px]">Data de Entrada</span>
            <span className="font-semibold text-slate-900">{order.date}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-bold text-[10px]">Previsão de Entrega</span>
            <span className="font-semibold text-slate-900">{order.deliveryDate || 'Conforme testes'}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-bold text-[10px]">Forma de Pagamento</span>
            <span className="font-semibold text-slate-900">{order.paymentMethod || 'A combinar'}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-bold text-[10px]">Garantia Técnica</span>
            <span className="font-bold text-amber-700">{order.warrantyPeriod || '90 dias'}</span>
          </div>
        </div>

        {/* Client & Equipment Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <h3 className="font-black text-slate-900 uppercase text-[11px] mb-1.5 flex items-center gap-1">
              <span>👤</span> DADOS DO CLIENTE
            </h3>
            <div className="space-y-0.5">
              <p><strong className="text-slate-700">Cliente / Razão:</strong> {order.clientName}</p>
              <p><strong className="text-slate-700">Telefone/WhatsApp:</strong> {order.clientPhone || 'Não informado'}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <h3 className="font-black text-slate-900 uppercase text-[11px] mb-1.5 flex items-center gap-1">
              <span>🚚</span> VEÍCULO & COMPONENTE DIESEL
            </h3>
            <div className="space-y-0.5">
              <p><strong className="text-slate-700">Veículo/Máquina:</strong> {order.vehicleModel} - Placa: <strong className="font-mono">{order.vehiclePlate || 'S/P'}</strong></p>
              <p><strong className="text-slate-700">Km / Horímetro:</strong> {order.vehicleMileage || 'Não anotado'}</p>
              <p><strong className="text-slate-700">Componente:</strong> {order.componentType}</p>
              {order.componentCode && (
                <p><strong className="text-slate-700">Cód. Peça/Bomba:</strong> <span className="font-mono font-semibold">{order.componentCode}</span></p>
              )}
            </div>
          </div>
        </div>

        {/* Complaint */}
        {order.complaintNotes && (
          <div className="py-2.5 border-b border-slate-200 text-xs">
            <span className="font-bold uppercase text-[10px] text-slate-500 block">Sintomas Relatados / Diagnóstico:</span>
            <p className="text-slate-800 italic">{order.complaintNotes}</p>
          </div>
        )}

        {/* DISCRIMINAÇÃO RIGOROSA 1: PEÇAS E COMPONENTES */}
        <div className="mt-4">
          <div className="flex items-center justify-between bg-amber-50 border-l-4 border-amber-600 px-3 py-1.5 mb-2">
            <h2 className="text-xs font-black uppercase text-amber-950 tracking-wider">
              1. DISCRIMINAÇÃO DE PEÇAS & COMPONENTES APLICADOS
            </h2>
            <span className="text-xs font-black text-amber-950 font-mono">
              Subtotal: R$ {partsTotal.toFixed(2)}
            </span>
          </div>

          {partsList.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">Nenhuma peça cobrada nesta ordem de serviço.</p>
          ) : (
            <table className="w-full text-left text-xs mb-3 border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-1.5">Cód.</th>
                  <th className="p-1.5">Descrição da Peça</th>
                  <th className="p-1.5">Fabricante</th>
                  <th className="p-1.5 text-center">Qtd</th>
                  <th className="p-1.5 text-right">Unitário (R$)</th>
                  <th className="p-1.5 text-right">Subtotal (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {partsList.map((p) => (
                  <tr key={p.id}>
                    <td className="p-1.5 font-mono text-slate-600">{p.code}</td>
                    <td className="p-1.5 font-medium text-slate-900">{p.description}</td>
                    <td className="p-1.5 text-slate-600">{p.manufacturer}</td>
                    <td className="p-1.5 text-center font-bold">{p.quantity}</td>
                    <td className="p-1.5 text-right font-mono">R$ {p.unitPrice.toFixed(2)}</td>
                    <td className="p-1.5 text-right font-mono font-semibold text-slate-900">
                      R$ {p.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* DISCRIMINAÇÃO RIGOROSA 2: MÃO DE OBRA E SERVIÇOS */}
        <div className="mt-3">
          <div className="flex items-center justify-between bg-blue-50 border-l-4 border-blue-600 px-3 py-1.5 mb-2">
            <h2 className="text-xs font-black uppercase text-blue-950 tracking-wider">
              2. DISCRIMINAÇÃO DE MÃO DE OBRA & SERVIÇOS DE BANCADA
            </h2>
            <span className="text-xs font-black text-blue-950 font-mono">
              Subtotal: R$ {laborTotal.toFixed(2)}
            </span>
          </div>

          {laborList.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">Nenhum serviço de mão de obra registrado.</p>
          ) : (
            <table className="w-full text-left text-xs mb-3 border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-1.5">Serviço Técnico / Operação de Laboratório</th>
                  <th className="p-1.5">Técnico / Especialista</th>
                  <th className="p-1.5 text-center">Horas/Qtd</th>
                  <th className="p-1.5 text-right">Valor Un (R$)</th>
                  <th className="p-1.5 text-right">Subtotal (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {laborList.map((l) => (
                  <tr key={l.id}>
                    <td className="p-1.5 font-medium text-slate-900">{l.serviceName}</td>
                    <td className="p-1.5 text-slate-600">{l.technician}</td>
                    <td className="p-1.5 text-center font-bold">{l.hoursOrQty}</td>
                    <td className="p-1.5 text-right font-mono">R$ {l.unitPrice.toFixed(2)}</td>
                    <td className="p-1.5 text-right font-mono font-semibold text-slate-900">
                      R$ {l.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Bench Diagnostics Test Box */}
        {order.benchTest && (
          <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
            <h3 className="font-bold uppercase text-[10px] text-slate-700 mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              PARÂMETROS DE TESTE EM BANCADA COMPUTADORIZADA ({order.benchTest.benchModel || 'EPS 205'})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div><strong>Pré-Injeção:</strong> {order.benchTest.preInjection || 'Normal'}</div>
              <div><strong>Débito Princ.:</strong> {order.benchTest.mainInjection || 'Normal'}</div>
              <div><strong>Retorno:</strong> {order.benchTest.returnFlow || 'Normal'}</div>
              <div><strong>Estanqueidade:</strong> <span className="font-bold text-emerald-700">{order.benchTest.leakTest || 'Aprovado'}</span></div>
            </div>
            {order.benchTest.technicianNotes && (
              <p className="mt-1 text-[11px] text-slate-600 italic">
                <strong>Observação do Técnico:</strong> {order.benchTest.technicianNotes}
              </p>
            )}
          </div>
        )}

        {/* Financial Summary Calculation Card */}
        <div className="mt-4 p-3 bg-slate-900 text-white rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs space-y-1">
            <div>Total Peças: <strong className="font-mono">R$ {partsTotal.toFixed(2)}</strong></div>
            <div>Total Mão de Obra: <strong className="font-mono">R$ {laborTotal.toFixed(2)}</strong></div>
            {discount > 0 && (
              <div className="text-amber-400">Desconto Concedido: <strong className="font-mono">- R$ {discount.toFixed(2)}</strong></div>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-widest">
              VALOR TOTAL LÍQUIDO DA O.S.
            </span>
            <span className="text-2xl font-black font-mono text-white">
              R$ {totalAmount.toFixed(2)}
            </span>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Condição: {order.paymentMethod || 'À vista'} • Status: {order.isPaid ? 'LIQUIDADO' : 'PENDENTE'}
            </div>
          </div>
        </div>

        {/* Warranty & Signatures */}
        <div className="mt-8 pt-4 border-t border-slate-300 text-[11px] text-slate-600 space-y-4">
          <p className="text-justify leading-relaxed">
            <strong>Termos de Garantia:</strong> A Master Diesel Center oferece garantia legal e contratual de{' '}
            {order.warrantyPeriod || '90 dias'} sobre as peças substituídas e serviços executados, condicionada à utilização de
            combustível de qualidade, troca rigorosa dos filtros de diesel na quilometragem indicada e limpeza preventiva do tanque.
            Não nos responsabilizamos por contaminações por água ou solventes após a entrega.
          </p>

          <div className="grid grid-cols-2 gap-8 pt-6">
            <div className="border-t border-slate-400 pt-1 text-center">
              <span className="font-bold text-slate-900 block">Técnico Responsável / Laboratório</span>
              <span className="text-[10px] text-slate-500">Master Diesel Center</span>
            </div>
            <div className="border-t border-slate-400 pt-1 text-center">
              <span className="font-bold text-slate-900 block">{order.clientName}</span>
              <span className="text-[10px] text-slate-500">Assinatura do Cliente / Aceite do Serviço</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
