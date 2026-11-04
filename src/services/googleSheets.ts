import { ServiceOrder, Part, CashTransaction } from '../types';

export interface GoogleSheetsExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export function formatSheetsPayload(data: {
  orders: ServiceOrder[];
  parts: Part[];
  transactions: CashTransaction[];
}) {
  // 1. Format Service Orders Tab
  const ordersHeaders = [
    'Número OS',
    'Data Entrada',
    'Cliente',
    'Telefone/WhatsApp',
    'Veículo/Placa',
    'Componente Diesel',
    'Código Componente',
    'Status',
    'Total Peças (R$)',
    'Total Mão de Obra (R$)',
    'Desconto (R$)',
    'Valor Total (R$)',
    'Forma Pagamento',
    'Pago?',
    'Garantia',
    'Peças Discriminadas',
    'Serviços Discriminados',
  ];

  const ordersRows = data.orders.map((o) => [
    o.orderNumber,
    o.date,
    o.clientName,
    o.clientPhone || '',
    `${o.vehicleModel} (${o.vehiclePlate || 'S/P'})`,
    o.componentType,
    o.componentCode || '',
    (o.status || '').toUpperCase(),
    (o.partsTotal || 0).toFixed(2),
    (o.laborTotal || 0).toFixed(2),
    (o.discount || 0).toFixed(2),
    (o.totalAmount || 0).toFixed(2),
    o.paymentMethod || 'A combinar',
    o.isPaid ? 'SIM' : 'NÃO',
    o.warrantyPeriod || '90 dias',
    (o.parts || []).map((p) => `${p.quantity}x ${p.description} [${p.code}] - R$ ${p.subtotal.toFixed(2)}`).join(' | '),
    (o.labor || []).map((l) => `${l.serviceName} (${l.technician}) - R$ ${l.subtotal.toFixed(2)}`).join(' | '),
  ]);

  // 2. Format Parts Tab
  const partsHeaders = [
    'Cód. Interno',
    'Cód. Fabricante',
    'Descrição da Peça',
    'Fabricante',
    'Categoria',
    'Unidade',
    'Qtd Estoque',
    'Estoque Mínimo',
    'Status Estoque',
    'Preço Custo (R$)',
    'Preço Venda (R$)',
    'Margem Bruta (R$)',
    'Localização Almoxarifado',
  ];

  const partsRows = data.parts.map((p) => {
    const isLow = p.stockQty <= p.minStockQty;
    const margin = p.sellingPrice - p.costPrice;
    return [
      p.code,
      p.mfgCode,
      p.description,
      p.manufacturer,
      p.category,
      p.unit,
      p.stockQty,
      p.minStockQty,
      isLow ? 'REPOR URGENTE' : 'OK',
      p.costPrice.toFixed(2),
      p.sellingPrice.toFixed(2),
      margin.toFixed(2),
      p.location,
    ];
  });

  // 3. Format Cash Flow Tab
  const cashHeaders = [
    'Data',
    'Tipo (Entrada/Saída)',
    'Descrição',
    'Categoria',
    'Valor (R$)',
    'Forma de Pagamento',
    'Status',
    'Vencimento',
    'Nº OS Vinculada',
    'Fornecedor / Observações',
  ];

  const cashRows = data.transactions.map((t) => [
    t.date,
    t.type === 'entrada' ? 'ENTRADA (+)' : 'SAÍDA (-)',
    t.description,
    t.category,
    t.amount.toFixed(2),
    t.paymentMethod,
    (t.status || '').toUpperCase(),
    t.dueDate || t.date,
    t.serviceOrderId || '-',
    t.supplierName || t.notes || '',
  ]);

  // 4. Monthly Summary
  const monthsMap = new Map<
    string,
    { partsRevenue: number; laborRevenue: number; totalIn: number; totalOut: number; countOS: number }
  >();

  data.orders.forEach((o) => {
    const monthKey = o.date.slice(0, 7);
    const current = monthsMap.get(monthKey) || {
      partsRevenue: 0,
      laborRevenue: 0,
      totalIn: 0,
      totalOut: 0,
      countOS: 0,
    };
    if (o.status !== 'cancelada') {
      current.partsRevenue += o.partsTotal || 0;
      current.laborRevenue += o.laborTotal || 0;
      current.countOS += 1;
    }
    monthsMap.set(monthKey, current);
  });

  data.transactions.forEach((t) => {
    if (t.status === 'liquidado') {
      const monthKey = t.date.slice(0, 7);
      const current = monthsMap.get(monthKey) || {
        partsRevenue: 0,
        laborRevenue: 0,
        totalIn: 0,
        totalOut: 0,
        countOS: 0,
      };
      if (t.type === 'entrada') current.totalIn += t.amount;
      if (t.type === 'saida') current.totalOut += t.amount;
      monthsMap.set(monthKey, current);
    }
  });

  const summaryHeaders = [
    'Mês/Ano',
    'Qtd OS Ativas/Concluídas',
    'Vendas Peças (R$)',
    'Mão de Obra de Bancada (R$)',
    'Total Entradas Caixa (R$)',
    'Total Saídas Caixa (R$)',
    'Resultado Líquido (R$)',
  ];

  const summaryRows = Array.from(monthsMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([m, val]) => [
      m,
      val.countOS,
      val.partsRevenue.toFixed(2),
      val.laborRevenue.toFixed(2),
      val.totalIn.toFixed(2),
      val.totalOut.toFixed(2),
      (val.totalIn - val.totalOut).toFixed(2),
    ]);

  return {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: "'Ordens de Serviço'!A1",
        values: [ordersHeaders, ...ordersRows],
      },
      {
        range: "'Estoque de Peças'!A1",
        values: [partsHeaders, ...partsRows],
      },
      {
        range: "'Fluxo de Caixa'!A1",
        values: [cashHeaders, ...cashRows],
      },
      {
        range: "'Resumo Mensal'!A1",
        values: [summaryHeaders, ...summaryRows],
      },
    ],
  };
}

// Write or update existing spreadsheet
export async function syncToGoogleSheets(
  accessToken: string,
  spreadsheetId: string,
  data: {
    orders: ServiceOrder[];
    parts: Part[];
    transactions: CashTransaction[];
  }
): Promise<GoogleSheetsExportResult> {
  const payload = formatSheetsPayload(data);

  // Clear existing ranges to avoid old leftover rows
  try {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ranges: [
            "'Ordens de Serviço'!A:Z",
            "'Estoque de Peças'!A:Z",
            "'Fluxo de Caixa'!A:Z",
            "'Resumo Mensal'!A:Z",
          ],
        }),
      }
    );
  } catch (e) {
    // ignore clear failure if sheet names are newly created
  }

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json();
    throw new Error(err.error?.message || 'Falha ao atualizar planilha no Google Sheets');
  }

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

export async function exportAllToGoogleSheets(
  accessToken: string,
  data: {
    orders: ServiceOrder[];
    parts: Part[];
    transactions: CashTransaction[];
  },
  existingSpreadsheetId?: string
): Promise<GoogleSheetsExportResult> {
  let spreadsheetId = existingSpreadsheetId?.trim();
  let spreadsheetUrl = '';

  // 1. Create a new spreadsheet if not provided
  if (!spreadsheetId) {
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: `Master Diesel Center - Gestão em Tempo Real (${new Date().toLocaleDateString('pt-BR')})`,
        },
        sheets: [
          { properties: { title: 'Ordens de Serviço' } },
          { properties: { title: 'Estoque de Peças' } },
          { properties: { title: 'Fluxo de Caixa' } },
          { properties: { title: 'Resumo Mensal' } },
        ],
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.error?.message || 'Falha ao criar planilha no Google Sheets');
    }

    const createdData = await createRes.json();
    spreadsheetId = createdData.spreadsheetId;
    spreadsheetUrl = createdData.spreadsheetUrl;
  } else {
    spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
  }

  if (!spreadsheetId) {
    throw new Error('Identificador da planilha inválido ou não gerado');
  }

  return await syncToGoogleSheets(accessToken, spreadsheetId, data);
}
