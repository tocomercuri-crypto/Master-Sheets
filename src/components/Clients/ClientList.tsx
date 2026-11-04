import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  Building,
  User,
  Phone,
  Mail,
  Truck,
  Edit,
  Trash2,
  MessageCircle,
  FileText,
  MapPin,
} from 'lucide-react';
import { Client, ServiceOrder } from '../../types';

interface ClientListProps {
  clients: Client[];
  orders: ServiceOrder[];
  onOpenNewClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onViewClientOrders: (clientId: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  orders,
  onOpenNewClient,
  onEditClient,
  onDeleteClient,
  onViewClientOrders,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.document.includes(searchTerm) ||
      c.phone.includes(searchTerm) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.fleetInfo && c.fleetInfo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Search & Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, CNPJ/CPF, frota, cidade ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <button
          onClick={onOpenNewClient}
          className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* Clients Cards Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhum cliente encontrado</h3>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre transportadoras, frotistas e clientes particulares para vincular às ordens de serviço.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClients.map((client) => {
            const clientOrders = orders.filter(
              (o) => o.clientId === client.id || o.clientName.toLowerCase() === client.name.toLowerCase()
            );
            const totalSpent = clientOrders
              .filter((o) => o.status !== 'cancelada')
              .reduce((acc, curr) => acc + curr.totalAmount, 0);

            const cleanPhone = client.phone.replace(/\D/g, '');

            return (
              <div
                key={client.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-amber-400/80 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top: Name, Badge PF/PJ & Actions */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                        {client.documentType === 'CNPJ' ? (
                          <Building className="w-5 h-5 text-amber-600" />
                        ) : (
                          <User className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{client.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                            {client.documentType}: {client.document || 'Não informado'}
                          </span>
                          {client.contactPerson && (
                            <span className="text-[11px] text-slate-500">
                              Resp: {client.contactPerson}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {cleanPhone && (
                        <a
                          href={`https://wa.me/55${cleanPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Conversar no WhatsApp"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => onEditClient(client)}
                        title="Editar Cliente"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteClient(client.id)}
                        title="Excluir Cliente"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact & Location Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-3 text-xs text-slate-600 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{client.phone || 'Sem telefone'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{client.email || 'Sem e-mail'}</span>
                    </div>

                    {(client.city || client.address) && (
                      <div className="sm:col-span-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>
                          {client.address ? `${client.address}, ` : ''}
                          {client.city}
                          {client.state ? `/${client.state}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Fleet Information if present */}
                  {client.fleetInfo && (
                    <div className="py-2.5 text-xs bg-slate-50 rounded-lg p-2.5 mt-2 border border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-0.5">
                        <Truck className="w-3 h-3 text-amber-600" />
                        Frota / Veículos:
                      </span>
                      <p className="text-slate-800 text-[11px]">{client.fleetInfo}</p>
                    </div>
                  )}
                </div>

                {/* Bottom stats: OS Count and Total Spent */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      <strong>{clientOrders.length}</strong> ordens de serviço
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Faturamento Total</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      R$ {totalSpent.toFixed(2)}
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
