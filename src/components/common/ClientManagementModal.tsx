import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Client, ClientType } from '../../types';
import { formatRupiah } from '../../services/exportService';
import {
  Users,
  Building,
  Plus,
  X,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle2,
  Briefcase,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface ClientManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClientForNewProject?: (client: Client) => void;
}

export const ClientManagementModal: React.FC<ClientManagementModalProps> = ({
  isOpen,
  onClose,
  onSelectClientForNewProject
}) => {
  const { clients, activePTId, currentPT, addClient, updateClient, projects, pts } = useApp();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isAdding, setIsAdding] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  // New Client Form state
  const [clientCode, setClientCode] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientType, setClientType] = useState<ClientType>('SWASTA');
  const [taxId, setTaxId] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [targetCompanyId, setTargetCompanyId] = useState(activePTId);

  if (!isOpen) return null;

  // Filter clients by selected PT or all
  const ptClients = clients.filter(c => c.companyId === targetCompanyId);

  const filteredClients = ptClients.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === 'ALL' || c.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientCode) {
      alert('Kode dan Nama Klien wajib diisi!');
      return;
    }

    addClient({
      companyId: targetCompanyId,
      code: clientCode.toUpperCase().trim(),
      name: clientName.trim(),
      type: clientType,
      taxId: taxId.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      notes: notes.trim()
    });

    setIsAdding(false);
    // Reset form
    setClientCode('');
    setClientName('');
    setTaxId('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
  };

  const getTypeBadgeClass = (type: ClientType) => {
    switch (type) {
      case 'PEMERINTAH':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'BUMN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SWASTA':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PERORANGAN':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  Database Master Klien & Pemberi Tugas
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Prisma Client Model v2.2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Data pemilik proyek (Owner / Bowheer) per entitas perusahaan kontraktor.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Company filter tabs */}
        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Entitas PT:</span>
            {pts.map(p => (
              <button
                key={p.id}
                onClick={() => setTargetCompanyId(p.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  targetCompanyId === p.id
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
              >
                {p.name} ({p.code})
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Batal Tambah' : 'Tambah Klien Baru'}</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Add Client Form */}
          {isAdding && (
            <form
              onSubmit={handleCreateClient}
              className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3 animate-in fade-in"
            >
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  <span>Pendaftaran Klien Baru untuk {pts.find(p => p.id === targetCompanyId)?.name}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Kode Klien (Singkatan) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="misal: CLI-PUPR-01"
                    value={clientCode}
                    onChange={(e) => setClientCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg uppercase font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">
                    Nama Klien / Perusahaan Pemberi Tugas *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="misal: Dinas Perumahan & Kawasan Permukiman"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Jenis Klien (Tipe Instansi) *
                  </label>
                  <select
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value as ClientType)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="SWASTA">Swasta (Private Corporation)</option>
                    <option value="PEMERINTAH">Pemerintah (APBN / APBD)</option>
                    <option value="BUMN">BUMN / BUMD</option>
                    <option value="PERORANGAN">Perorangan / Pribadi</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    NPWP Klien
                  </label>
                  <input
                    type="text"
                    placeholder="01.234.567.8-000.000"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Contact Person (PIC / Direktur)
                  </label>
                  <input
                    type="text"
                    placeholder="Nama PIC / PPK / Manajer"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="(021) 123-4567 / 0812..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Email Resmi Klien
                  </label>
                  <input
                    type="email"
                    placeholder="kontrak@klien.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Catatan Pembayaran / Khusus
                  </label>
                  <input
                    type="text"
                    placeholder="misal: Termin 30 hari, BAPP bertahap"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-slate-700 font-bold mb-1">
                    Alamat Lengkap Klien
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Alamat kantor pemberi kerja untuk dokumen kontrak & penagihan"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-amber-200/60">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg text-xs shadow-sm"
                >
                  Simpan Klien Baru
                </button>
              </div>
            </form>
          )}

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari klien berdasarkan nama, kode, atau PIC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {['ALL', 'SWASTA', 'PEMERINTAH', 'BUMN', 'PERORANGAN'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    filterType === t
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t === 'ALL' ? 'Semua Tipe' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Client List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredClients.length === 0 ? (
              <div className="col-span-2 p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                Tidak ada data klien yang cocok dengan kriteria pencarian.
              </div>
            ) : (
              filteredClients.map((client) => {
                const clientProjects = projects.filter(
                  p => p.clientId === client.id || p.clientName.toLowerCase() === client.name.toLowerCase()
                );
                const totalProjValue = clientProjects.reduce((s, p) => s + p.contractValue, 0);

                return (
                  <div
                    key={client.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-amber-400 hover:shadow-md transition space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">
                            {client.code}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getTypeBadgeClass(
                              client.type
                            )}`}
                          >
                            {client.type}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                          {client.name}
                        </h4>
                      </div>

                      {onSelectClientForNewProject && (
                        <button
                          onClick={() => {
                            onSelectClientForNewProject(client);
                            onClose();
                          }}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] shrink-0"
                        >
                          Pilih Klien
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 text-slate-600 text-[11px]">
                      {client.contactPerson && (
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>PIC: <strong>{client.contactPerson}</strong></span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="truncate">{client.address}</span>
                        </div>
                      )}
                      {client.taxId && (
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono">NPWP: {client.taxId}</span>
                        </div>
                      )}
                    </div>

                    {/* Associated Projects */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        Proyek Berjalan: <strong className="text-slate-800">{clientProjects.length} Proyek</strong>
                      </span>
                      {totalProjValue > 0 && (
                        <span className="font-extrabold text-amber-600">
                          {formatRupiah(totalProjValue)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs shrink-0">
          <span className="text-slate-500 text-[11px]">
            Total {ptClients.length} Klien terdaftar untuk entitas {pts.find(p => p.id === targetCompanyId)?.code}.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
