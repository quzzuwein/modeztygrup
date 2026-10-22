import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../services/exportService';
import { Client, ClientType } from '../../types';
import {
  Building2,
  Layers,
  PlusCircle,
  X,
  DollarSign,
  Calendar,
  MapPin,
  User,
  Phone,
  FileText,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Users,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface AddEntityModalProps {
  isOpen: boolean;
  initialMode?: 'pt' | 'project';
  onClose: () => void;
}

const PRESET_LOGOS = [
  {
    id: 'gold-steel',
    name: 'Gold & Steel',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%230f172a"/><path d="M22 68L38 32L52 68L66 32L80 68" stroke="%23f59e0b" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="51" cy="22" r="5" fill="%2338bdf8"/></svg>'
  },
  {
    id: 'emerald-tower',
    name: 'Emerald Perkasa',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%23064e3b"/><path d="M50 20L78 38V72L50 85L22 72V38L50 20Z" stroke="%2334d399" stroke-width="6" stroke-linejoin="round"/><path d="M50 20V85" stroke="%2334d399" stroke-width="4"/><circle cx="50" cy="48" r="9" fill="%23f59e0b"/></svg>'
  },
  {
    id: 'blue-crest',
    name: 'Blue Infrastructure',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%231e293b"/><polygon points="50,18 82,36 82,64 50,82 18,64 18,36" stroke="%2338bdf8" stroke-width="5" fill="none"/><line x1="50" y1="18" x2="50" y2="82" stroke="%2338bdf8" stroke-width="4"/><circle cx="50" cy="50" r="8" fill="%23f59e0b"/></svg>'
  }
];

export const AddEntityModal: React.FC<AddEntityModalProps> = ({
  isOpen,
  initialMode = 'project',
  onClose
}) => {
  const { pts, clients, activePTId, addPT, addProject, addClient } = useApp();
  const [mode, setMode] = useState<'pt' | 'project'>(initialMode);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Form states: New PT
  const [ptCode, setPtCode] = useState('BPN');
  const [ptName, setPtName] = useState('PT Bangun Persada Nusantara');
  const [ptLegalName, setPtLegalName] = useState('PT Bangun Persada Nusantara Kontraktor');
  const [ptNpwp, setPtNpwp] = useState('03.111.222.3-444.000');
  const [ptAddress, setPtAddress] = useState('Jl. Gatot Subroto Kav. 18, Jakarta Selatan');
  const [ptPhone, setPtPhone] = useState('(021) 520-8899');
  const [ptEmail, setPtEmail] = useState('info@bangunpersada.co.id');
  const [directorName, setDirectorName] = useState('Ir. Dedi Sulaeman, M.Eng.');
  const [logoUrl, setLogoUrl] = useState(PRESET_LOGOS[0].url);

  // Form states: New Project
  const [selectedPtId, setSelectedPtId] = useState(activePTId || pts[0]?.id || '');
  const [projectCode, setProjectCode] = useState(`PRJ-2026-00${pts.length + 2}`);
  const [shortCode, setShortCode] = useState('FLY-TNG');
  const [projectName, setProjectName] = useState('Pembangunan Flyover & Akses Interchange');
  const [location, setLocation] = useState('Ruas Tol Lingkar Luar KM 24, Tangerang');
  const [contractValue, setContractValue] = useState<number>(14500000000);
  const [targetMargin, setTargetMargin] = useState<number>(18.5);
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-12-15');
  const [pmName, setPmName] = useState('Ir. H. Gunawan Wibowo, S.T.');
  const [smName, setSmName] = useState('Rudi Hartono, S.T.');

  // Client Selection / Quick Add
  const availableClients = clients.filter(c => c.companyId === selectedPtId);
  const [selectedClientId, setSelectedClientId] = useState<string>(availableClients[0]?.id || '');
  const [showQuickAddClient, setShowQuickAddClient] = useState(false);
  const [quickClientName, setQuickClientName] = useState('');
  const [quickClientCode, setQuickClientCode] = useState('');
  const [quickClientType, setQuickClientType] = useState<ClientType>('SWASTA');

  // Tax toggles
  const [isTaxable, setIsTaxable] = useState(true);
  const [ppnEnabled, setPpnEnabled] = useState(true);
  const [pphFinalEnabled, setPphFinalEnabled] = useState(true);

  // Sync selectedClientId when selectedPtId changes
  React.useEffect(() => {
    const clientsForPT = clients.filter(c => c.companyId === selectedPtId);
    if (clientsForPT.length > 0 && (!selectedClientId || !clientsForPT.some(c => c.id === selectedClientId))) {
      setSelectedClientId(clientsForPT[0].id);
    }
  }, [selectedPtId, clients]);

  if (!isOpen) return null;

  const targetProfitNominal = (contractValue * targetMargin) / 100;
  const rapPlafon = contractValue - targetProfitNominal;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file logo maksimal 2 MB!');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePT = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ptName || !ptCode) {
      alert('Nama dan Kode PT wajib diisi!');
      return;
    }

    const trimmedCode = ptCode.toUpperCase().trim();
    const trimmedName = ptName.trim().toLowerCase();
    const isDup = pts.some(
      p => p.code.toUpperCase().trim() === trimmedCode ||
           p.name.trim().toLowerCase() === trimmedName
    );
    if (isDup) {
      alert(`Pendaftaran Ditolak: Perusahaan dengan kode "${trimmedCode}" atau nama "${ptName}" sudah terdaftar dalam sistem! Harap gunakan kode atau nama yang berbeda.`);
      return;
    }

    const res = addPT({
      code: trimmedCode,
      name: ptName.trim(),
      legalName: ptLegalName.trim(),
      npwp: ptNpwp.trim(),
      address: ptAddress.trim(),
      phone: ptPhone.trim(),
      email: ptEmail.trim(),
      directorName: directorName.trim(),
      logoUrl: logoUrl.trim()
    });

    if (!res.success) {
      alert(res.message);
      return;
    }

    alert(`Perusahaan baru "${ptName}" (${trimmedCode}) dengan logo resmi berhasil didaftarkan dan langsung aktif!`);
    onClose();
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !projectCode || contractValue <= 0) {
      alert('Nama, Kode Proyek, dan Nilai Kontrak wajib diisi!');
      return;
    }

    let finalClientId = selectedClientId;
    let finalClientName = '';

    if (showQuickAddClient && quickClientName) {
      const code = quickClientCode || `CLI-${Date.now().toString().slice(-4)}`;
      const newClientId = `cl-${Date.now()}`;
      addClient({
        companyId: selectedPtId,
        code: code.toUpperCase(),
        name: quickClientName.trim(),
        type: quickClientType
      });
      finalClientId = newClientId;
      finalClientName = quickClientName.trim();
    } else {
      const chosenClient = availableClients.find(c => c.id === selectedClientId);
      finalClientName = chosenClient ? chosenClient.name : 'Klien Eksternal';
    }

    addProject({
      ptId: selectedPtId,
      clientId: finalClientId,
      clientName: finalClientName,
      code: projectCode.toUpperCase().trim(),
      shortCode: shortCode.trim().toUpperCase(),
      name: projectName.trim(),
      location: location.trim(),
      contractValue,
      currency: 'IDR',
      targetProfitPercent: targetMargin,
      startDate,
      endDate,
      status: 'berjalan',
      pmName: pmName.trim(),
      siteManagerName: smName.trim(),
      isTaxable,
      ppnEnabled,
      ppnPercent: 11,
      pphFinalEnabled,
      pphFinalPercent: 2.65,
      taxNotes: 'PPh Final Pelaksanaan Konstruksi PP 9/2022'
    });

    alert(`Proyek baru "${projectName}" (${projectCode}) senilai ${formatRupiah(contractValue)} untuk ${finalClientName} berhasil didaftarkan!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">
                Pusat Pendaftaran Entitas & Proyek (Prisma Schema v2.2)
              </h2>
              <p className="text-[11px] text-slate-400">
                Multi-PT, Multi-Proyek, Logo Perusahaan Resmi, & Database Klien.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 grid grid-cols-2 gap-2 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setMode('project')}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
              mode === 'project'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>+ Daftarkan Proyek Baru</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('pt')}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
              mode === 'pt'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>+ Tambah Perusahaan (PT & Logo)</span>
          </button>
        </div>

        {/* Form Body: New Project */}
        {mode === 'project' && (
          <form onSubmit={handleCreateProject} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
            {/* PT Selection */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Pilih Entitas Perusahaan Pemilik Proyek (1 PT Multi-Proyek) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPtId(p.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
                      selectedPtId === p.id
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/30'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {p.logoUrl ? (
                      <img
                        src={p.logoUrl}
                        alt={p.code}
                        className="w-8 h-8 rounded-lg object-contain bg-slate-900 p-0.5 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                        {p.code.slice(0, 2)}
                      </div>
                    )}
                    <div className="truncate">
                      <div className="font-bold text-slate-900 truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{p.code} • {clients.filter(c => c.companyId === p.id).length} Klien</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Client Selection (Data Klien) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Data Pemberi Tugas (Klien Proyek) *</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowQuickAddClient(!showQuickAddClient)}
                  className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{showQuickAddClient ? 'Pilih dari Database' : 'Klien Baru Cepat'}</span>
                </button>
              </div>

              {!showQuickAddClient ? (
                <div>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                  >
                    {availableClients.length === 0 ? (
                      <option value="">Belum ada klien di PT ini (Gunakan Tambah Klien Cepat)</option>
                    ) : (
                      availableClients.map((cl) => (
                        <option key={cl.id} value={cl.id}>
                          {cl.name} [{cl.type}] — PIC: {cl.contactPerson || '-'}
                        </option>
                      ))
                    )}
                  </select>
                  {selectedClientId && (
                    <div className="mt-1.5 text-[11px] text-slate-500 flex gap-2">
                      <span>NPWP: {availableClients.find(c => c.id === selectedClientId)?.taxId || '-'}</span>
                      <span>•</span>
                      <span>Alamat: {availableClients.find(c => c.id === selectedClientId)?.address || '-'}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 animate-in fade-in">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Nama Lengkap Klien / Owner"
                      value={quickClientName}
                      onChange={(e) => setQuickClientName(e.target.value)}
                      className="w-full p-2 bg-white border border-blue-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <select
                      value={quickClientType}
                      onChange={(e) => setQuickClientType(e.target.value as ClientType)}
                      className="w-full p-2 bg-white border border-blue-300 rounded-lg font-semibold"
                    >
                      <option value="SWASTA">SWASTA</option>
                      <option value="PEMERINTAH">PEMERINTAH</option>
                      <option value="BUMN">BUMN</option>
                      <option value="PERORANGAN">PERORANGAN</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Project Code & Name */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="font-semibold text-slate-700">Kode Proyek *</label>
                <input
                  type="text"
                  required
                  value={projectCode}
                  onChange={e => setProjectCode(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Kode Singkat (Shortcode)</label>
                <input
                  type="text"
                  value={shortCode}
                  onChange={e => setShortCode(e.target.value)}
                  placeholder="e.g. FLY-TNG"
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Lokasi Proyek</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="col-span-3">
                <label className="font-semibold text-slate-700">Nama Lengkap Pekerjaan Proyek *</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Financial Parameters (Nilai Kontrak Ratusan Ribu & Target Margin Bebas) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-300">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-amber-950 text-xs">Nilai Kontrak Klien (IDR) *</label>
                  <span className="text-[10px] text-amber-700 font-semibold">Kelipatan Rp 100.000</span>
                </div>
                <input
                  type="number"
                  required
                  min="100000"
                  step="100000"
                  value={contractValue}
                  onChange={e => setContractValue(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full p-2 border border-amber-400 bg-white rounded-lg font-mono font-extrabold text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="Contoh: 5680500000"
                />
                <div className="text-[11px] text-slate-900 mt-1 font-mono font-bold flex items-center justify-between">
                  <span>{formatRupiah(contractValue)}</span>
                </div>

                {/* Quick Add Increment Pills */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setContractValue(prev => (prev || 0) + 100000000)}
                    className="px-1.5 py-0.5 rounded bg-white hover:bg-amber-100 border border-amber-300 text-[10px] font-mono font-bold text-amber-900"
                  >
                    +100 Jt
                  </button>
                  <button
                    type="button"
                    onClick={() => setContractValue(prev => (prev || 0) + 10000000)}
                    className="px-1.5 py-0.5 rounded bg-white hover:bg-amber-100 border border-amber-300 text-[10px] font-mono font-bold text-amber-900"
                  >
                    +10 Jt
                  </button>
                  <button
                    type="button"
                    onClick={() => setContractValue(prev => (prev || 0) + 1000000)}
                    className="px-1.5 py-0.5 rounded bg-white hover:bg-amber-100 border border-amber-300 text-[10px] font-mono font-bold text-amber-900"
                  >
                    +1 Jt
                  </button>
                  <button
                    type="button"
                    onClick={() => setContractValue(prev => (prev || 0) + 100000)}
                    className="px-1.5 py-0.5 rounded bg-white hover:bg-amber-100 border border-amber-300 text-[10px] font-mono font-bold text-amber-900"
                  >
                    +100 Rb
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-amber-950 text-xs">Target Margin Laba Bersih (%) *</label>
                  <span className="text-[10px] text-emerald-700 font-semibold">Bebas (Tanpa Batas 40%)</span>
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={targetMargin}
                  onChange={e => setTargetMargin(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full p-2 border border-amber-400 bg-white rounded-lg font-mono font-extrabold text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="Contoh: 18.5"
                />
                <div className="text-[11px] text-emerald-800 mt-1 font-semibold flex items-center justify-between">
                  <span>Target Profit:</span>
                  <span className="font-mono font-bold">{formatRupiah(targetProfitNominal)}</span>
                </div>

                {/* Quick Margin Presets */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[10, 15, 18, 20, 25, 30, 45, 50].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTargetMargin(pct)}
                      className={`px-1.5 py-0.5 rounded border text-[10px] font-mono font-semibold transition ${
                        targetMargin === pct
                          ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold'
                          : 'bg-white hover:bg-amber-100 border-amber-300 text-amber-900'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-1 sm:col-span-2 text-xs text-slate-700 pt-2 border-t border-amber-200 flex items-center justify-between">
                <span>Plafon Maksimal Belanja Operasional (RAP Plafon):</span>
                <span className="font-mono font-extrabold text-slate-950 text-sm">{formatRupiah(rapPlafon)}</span>
              </div>
            </div>

            {/* Tax Settings (Batch 9.6 Schema) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-800 text-[11px] block">
                Pengaturan Perpajakan Proyek (Prisma Tax Settings v2.2)
              </span>
              <div className="flex flex-wrap gap-4 text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ppnEnabled}
                    onChange={(e) => setPpnEnabled(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>Faktur Pajak PPN 11% Aktif</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pphFinalEnabled}
                    onChange={(e) => setPphFinalEnabled(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>PPh Final Konstruksi 2.65% (PP 9/2022)</span>
                </label>
              </div>
            </div>

            {/* Schedule & Managers */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-semibold text-slate-700">Tanggal Mulai SPK</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Target Serah Terima (BAST)</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Project Manager (PM)</label>
                <input
                  type="text"
                  required
                  value={pmName}
                  onChange={e => setPmName(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Site Manager (SM)</label>
                <input
                  type="text"
                  required
                  value={smName}
                  onChange={e => setSmName(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow transition"
              >
                Simpan & Aktifkan Proyek
              </button>
            </div>
          </form>
        )}

        {/* Form Body: New Company (PT & Logo) */}
        {mode === 'pt' && (
          <form onSubmit={handleCreatePT} className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
            {/* Logo Section */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <label className="font-bold text-slate-800 flex items-center justify-between">
                <span>Logo Resmi Perusahaan (logoUrl)</span>
                <span className="text-[10px] text-slate-500 font-normal">Tampil di kop surat, BAPP, PO & Navbar</span>
              </label>

              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg inline-flex items-center gap-1.5 transition">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    {PRESET_LOGOS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setLogoUrl(p.url)}
                        className={`px-2 py-1 rounded text-[10px] font-semibold border ${
                          logoUrl === p.url ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-2">
                <label className="font-semibold text-slate-700">Nama Perusahaan (Komersial) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PT Bangun Persada Nusantara"
                  value={ptName}
                  onChange={e => setPtName(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Kode Singkat (Unique) *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="BPN"
                  value={ptCode}
                  onChange={e => setPtCode(e.target.value.toUpperCase())}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-mono font-bold text-center text-amber-700 uppercase"
                />
              </div>

              <div className="col-span-3">
                <label className="font-semibold text-slate-700">Nama Legal Badan Hukum (Akta Kemenkumham)</label>
                <input
                  type="text"
                  placeholder="PT Bangun Persada Nusantara Kontraktor"
                  value={ptLegalName}
                  onChange={e => setPtLegalName(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-semibold text-slate-700">NPWP Badan (16 Digit) *</label>
                <input
                  type="text"
                  required
                  placeholder="00.000.000.0-000.000"
                  value={ptNpwp}
                  onChange={e => setPtNpwp(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Email Resmi Kantor</label>
                <input
                  type="email"
                  placeholder="info@pt.co.id"
                  value={ptEmail}
                  onChange={e => setPtEmail(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700">Alamat Kantor Pusat</label>
              <textarea
                rows={2}
                required
                value={ptAddress}
                onChange={e => setPtAddress(e.target.value)}
                className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-semibold text-slate-700">Nomor Telepon Kantor</label>
                <input
                  type="text"
                  required
                  value={ptPhone}
                  onChange={e => setPtPhone(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Nama Direktur Utama</label>
                <input
                  type="text"
                  required
                  value={directorName}
                  onChange={e => setDirectorName(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 text-[11px] leading-relaxed">
              Setelah PT baru didaftarkan, logo dan identitasnya langsung terintegrasi ke sistem multi-perusahaan, dan Anda dapat mendaftarkan beberapa proyek konstruksi sekaligus (Multi-Proyek).
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow transition"
              >
                Tambah Perusahaan (PT & Logo)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
