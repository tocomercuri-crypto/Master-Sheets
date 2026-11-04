import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, User, Building, Truck, Phone, Mail, MapPin } from 'lucide-react';
import { Client } from '../../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  initialClient?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialClient,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [documentType, setDocumentType] = useState<'CPF' | 'CNPJ'>('CNPJ');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [address, setAddress] = useState('');
  const [fleetInfo, setFleetInfo] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialClient) {
      setName(initialClient.name);
      setContactPerson(initialClient.contactPerson || '');
      setDocumentType(initialClient.documentType);
      setDocument(initialClient.document);
      setPhone(initialClient.phone);
      setEmail(initialClient.email);
      setCity(initialClient.city);
      setState(initialClient.state);
      setAddress(initialClient.address);
      setFleetInfo(initialClient.fleetInfo || '');
      setNotes(initialClient.notes || '');
    } else {
      setName('');
      setContactPerson('');
      setDocumentType('CNPJ');
      setDocument('');
      setPhone('');
      setEmail('');
      setCity('');
      setState('SP');
      setAddress('');
      setFleetInfo('');
      setNotes('');
    }
    setFormError(null);
  }, [initialClient, isOpen]);

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Por favor, informe a Razão Social ou Nome do Cliente.');
      return;
    }
    setFormError(null);

    const clientData: Client = {
      id: initialClient ? initialClient.id : `cli-${Date.now()}`,
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      documentType,
      document: document.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      address: address.trim(),
      fleetInfo: fleetInfo.trim(),
      notes: notes.trim(),
      createdAt: initialClient ? initialClient.createdAt : new Date().toISOString().slice(0, 10),
    };

    onSave(clientData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-6 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialClient ? `Editar Cliente: ${initialClient.name}` : 'Cadastrar Novo Cliente / Frotista'}
              </h2>
              <p className="text-xs text-slate-400">Master Diesel Center • Cadastro de Clientes e Frotas</p>
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
          <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <span className="text-slate-600">Tipo de Pessoa:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="docType"
                checked={documentType === 'CNPJ'}
                onChange={() => setDocumentType('CNPJ')}
                className="text-amber-500 focus:ring-amber-500"
              />
              <span>Pessoa Jurídica (Empresa/Transportadora/Agro)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="docType"
                checked={documentType === 'CPF'}
                onChange={() => setDocumentType('CPF')}
                className="text-amber-500 focus:ring-amber-500"
              />
              <span>Pessoa Física (Particular/Autônomo)</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                {documentType === 'CNPJ' ? 'Razão Social / Nome da Empresa' : 'Nome Completo do Cliente'}
              </label>
              <input
                type="text"
                required
                placeholder={documentType === 'CNPJ' ? 'Ex: Transportadora Rota do Sol Ltda' : 'Ex: Roberto Silveira'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                {documentType === 'CNPJ' ? 'CNPJ' : 'CPF'}
              </label>
              <input
                type="text"
                placeholder={documentType === 'CNPJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Contato / Responsável</label>
              <input
                type="text"
                placeholder="Ex: Carlos (Gerente Frota)"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                placeholder="(11) 98765-4321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                placeholder="financeiro@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Endereço / Logradouro</label>
              <input
                type="text"
                placeholder="Av. dos Estados, 4500 - Galpão 3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Cidade</label>
              <input
                type="text"
                placeholder="São Paulo"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">UF (Estado)</label>
              <input
                type="text"
                maxLength={2}
                placeholder="SP"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase text-center font-bold focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Fleet info */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              Veículos Cadastrados / Detalhes da Frota
            </label>
            <input
              type="text"
              placeholder="Ex: 8 Caminhões Scania R440, 4 Ford Cargo 2428, 2 Toyota Hilux 2.8"
              value={fleetInfo}
              onChange={(e) => setFleetInfo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Observações Comerciais / Condições Especiais
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Pagamento faturado para 28 dias após emissão da NF. Exige laudo da bancada anexado."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
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
              <span>Salvar Cliente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
