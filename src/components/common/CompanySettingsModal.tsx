import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../services/exportService';
import {
  Building2,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  MapPin,
  Phone,
  Mail,
  FileText,
  User,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Trash2,
  Edit2
} from 'lucide-react';

interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddProject?: () => void;
  onOpenAddPT?: () => void;
}

const PRESET_LOGOS = [
  {
    id: 'gold-steel',
    name: 'Gold & Steel (WKPM)',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%230f172a"/><path d="M22 68L38 32L52 68L66 32L80 68" stroke="%23f59e0b" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="51" cy="22" r="5" fill="%2338bdf8"/><text x="50" y="90" fill="%23cbd5e1" font-size="10" font-family="sans-serif" font-weight="bold" text-anchor="middle">WKPM</text></svg>'
  },
  {
    id: 'emerald-tower',
    name: 'Emerald Perkasa (CGP)',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%23064e3b"/><path d="M50 20L78 38V72L50 85L22 72V38L50 20Z" stroke="%2334d399" stroke-width="6" stroke-linejoin="round"/><path d="M50 20V85" stroke="%2334d399" stroke-width="4"/><circle cx="50" cy="48" r="9" fill="%23f59e0b"/><text x="50" y="94" fill="%23a7f3d0" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle">CGP</text></svg>'
  },
  {
    id: 'blue-crest',
    name: 'Blue Infrastructure',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%231e293b"/><polygon points="50,18 82,36 82,64 50,82 18,64 18,36" stroke="%2338bdf8" stroke-width="5" fill="none"/><line x1="50" y1="18" x2="50" y2="82" stroke="%2338bdf8" stroke-width="4"/><line x1="18" y1="36" x2="82" y2="64" stroke="%23f59e0b" stroke-width="3"/><text x="50" y="93" fill="%2394a3b8" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle">CORP</text></svg>'
  },
  {
    id: 'crimson-arch',
    name: 'Crimson Konstruksi',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%23450a0a"/><path d="M25 78L50 24L75 78H62L50 50L38 78H25Z" fill="%23f87171"/><circle cx="50" cy="35" r="4" fill="%23fef08a"/><text x="50" y="92" fill="%23fecaca" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle">BUILD</text></svg>'
  }
];

export const CompanySettingsModal: React.FC<CompanySettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenAddProject,
  onOpenAddPT
}) => {
  const { pts, activePTId, setActivePTId, currentPT, updatePT, deletePT, projects, setActiveProjectId, updateProject, deleteProject } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'logo' | 'projects'>('profile');
  const [selectedPtId, setSelectedPtId] = useState(activePTId);

  // Form states
  const targetPT = pts.find(p => p.id === selectedPtId) || currentPT || pts[0];

  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [code, setCode] = useState('');
  const [npwp, setNpwp] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [directorName, setDirectorName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // State for editing a project from the projects tab
  const [editingProject, setEditingProject] = useState<{
    id: string;
    name: string;
    contractValue: number;
    targetProfitPercent: number;
    location: string;
    pmName: string;
  } | null>(null);

  // Sync state when target PT changes
  React.useEffect(() => {
    if (targetPT) {
      setName(targetPT.name || '');
      setLegalName(targetPT.legalName || targetPT.name || '');
      setCode(targetPT.code || '');
      setNpwp(targetPT.npwp || '');
      setAddress(targetPT.address || '');
      setPhone(targetPT.phone || '');
      setEmail(targetPT.email || '');
      setDirectorName(targetPT.directorName || '');
      setLogoUrl(targetPT.logoUrl || '');
    }
  }, [targetPT, selectedPtId, isOpen]);

  if (!isOpen || !targetPT) return null;

  const ptProjects = projects.filter(p => p.ptId === targetPT.id);
  const totalContract = ptProjects.reduce((sum, p) => sum + p.contractValue, 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2 MB!');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultStr = event.target.result as string;
          setLogoUrl(resultStr);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePT(targetPT.id, {
      name: name.trim(),
      legalName: legalName.trim(),
      code: code.trim().toUpperCase(),
      npwp: npwp.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      directorName: directorName.trim(),
      logoUrl: logoUrl.trim()
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            {targetPT.logoUrl ? (
              <img
                src={targetPT.logoUrl}
                alt={targetPT.code}
                className="w-11 h-11 rounded-xl object-contain bg-slate-800 p-1 border border-slate-700 shadow-inner"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  Profil Perusahaan & Pengaturan Logo (Multi-PT)
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {targetPT.code}
                </span>
                {targetPT.isMain && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                    Holding Utama
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Kelola identitas legal, logo perusahaan resmi, serta daftar proyek aktif di bawah PT ini.
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

        {/* PT Selector bar if multiple PTs exist */}
        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Entitas PT yang dikelola:</span>
            <div className="flex gap-1.5">
              {pts.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPtId(p.id);
                    setActivePTId(p.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    selectedPtId === p.id
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-700/70 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <span>{p.code}</span>
                  <span className="text-[10px] opacity-80">({projects.filter(pr => pr.ptId === p.id).length} Proyek)</span>
                </button>
              ))}
            </div>
          </div>

          {onOpenAddPT && (
            <button
              onClick={() => {
                onClose();
                onOpenAddPT();
              }}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:underline"
            >
              + Tambah PT Baru
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'profile'
                ? 'border-amber-500 text-slate-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Identitas & Legalitas PT</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logo')}
            className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'logo'
                ? 'border-amber-500 text-slate-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>Upload & Pilih Logo Perusahaan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'projects'
                ? 'border-amber-500 text-slate-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Multi-Proyek PT ({ptProjects.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
          {isSaved && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Data profil dan logo <strong>{name}</strong> berhasil diperbarui dan tersimpan!</span>
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nama Komersial Perusahaan (PT) *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Kode Singkatan PT (Unique) *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 uppercase font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">
                    Nama Badan Hukum Lengkap (Sesuai Akta Pendirian & Kemenkumham)
                  </label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Contoh: PT Wijaya Karya Prima Mandiri Kontraktor Tbk"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    NPWP Badan Perusahaan (16 Digit) *
                  </label>
                  <input
                    type="text"
                    required
                    value={npwp}
                    onChange={(e) => setNpwp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono"
                    placeholder="01.234.567.8-901.000"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nama Direktur Utama / Penanggung Jawab *
                  </label>
                  <input
                    type="text"
                    required
                    value={directorName}
                    onChange={(e) => setDirectorName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nomor Telepon Kantor
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="(021) 789-5432"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Email Resmi Perusahaan
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="corporate@kontraktor.co.id"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">
                    Alamat Domisili Kantor Pusat / Operasional
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Gedung, Jalan, Kelurahan, Kecamatan, Kota & Kode Pos"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  {!targetPT.isMain && pts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const count = projects.filter(p => p.ptId === targetPT.id).length;
                        if (confirm(`Yakin ingin menghapus perusahaan "${targetPT.name}" (${targetPT.code})? ${count > 0 ? `PERINGATAN: ${count} proyek terkait juga akan ikut dihapus!` : ''}`)) {
                          const res = deletePT(targetPT.id);
                          if (res.success) {
                            alert(res.message);
                            const remaining = pts.filter(p => p.id !== targetPT.id);
                            if (remaining.length > 0) {
                              setSelectedPtId(remaining[0].id);
                              setActivePTId(remaining[0].id);
                            } else {
                              onClose();
                            }
                          }
                        }
                      }}
                      className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl font-bold flex items-center gap-1.5 transition text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Perusahaan (PT Ini)</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow-sm transition"
                  >
                    Simpan Perubahan Identitas PT
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'logo' && (
            <div className="space-y-6 text-xs">
              {/* Current Logo Preview */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-24 rounded-2xl bg-white p-2 border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span className="text-[10px]">Belum ada logo</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-extrabold text-sm text-slate-800">
                    Logo Resmi {targetPT.name}
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Logo ini otomatis digunakan pada kop surat BAPP, SPB material, PO logistik, laporan kemajuan fisik PDF, dan navbar aplikasi.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <label className="cursor-pointer px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg inline-flex items-center gap-1.5 transition">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload File Logo (PNG/JPG/SVG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg"
                      >
                        Hapus Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold">
                  Atau Masukkan Tautan / URL Gambar Logo:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://... atau data:image/..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      updatePT(targetPT.id, { logoUrl });
                      setIsSaved(true);
                      setTimeout(() => setIsSaved(false), 2000);
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg"
                  >
                    Terapkan
                  </button>
                </div>
              </div>

              {/* Preset Logos */}
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pilih dari Preset Emblem Konstruksi Profesional:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_LOGOS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setLogoUrl(preset.url)}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-2 ${
                        logoUrl === preset.url
                          ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-12 h-12 object-contain"
                      />
                      <span className="text-[11px] font-semibold text-slate-700 truncate w-full">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updatePT(targetPT.id, { logoUrl });
                    setIsSaved(true);
                    setTimeout(() => setIsSaved(false), 2500);
                  }}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow-sm transition"
                >
                  Simpan Logo ke Database PT
                </button>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-xl">
                <div>
                  <h4 className="font-extrabold text-blue-950">
                    Arsitektur 1 Perusahaan Multi-Proyek
                  </h4>
                  <p className="text-blue-800 text-[11px]">
                    {targetPT.name} mengelola {ptProjects.length} proyek aktif dengan total portofolio {formatRupiah(totalContract)}.
                  </p>
                </div>
                {onOpenAddProject && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAddProject();
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shrink-0"
                  >
                    + Tambah Proyek untuk PT ini
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {ptProjects.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    Belum ada proyek terdaftar untuk {targetPT.name}.
                  </div>
                ) : (
                  ptProjects.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 bg-white hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">
                            {p.code}
                          </span>
                          {p.shortCode && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
                              {p.shortCode}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                            {p.status}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-800">{p.name}</h5>
                        <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
                          <span>Klien: <strong className="text-slate-700">{p.clientName}</strong></span>
                          <span>•</span>
                          <span>Lokasi: {p.location}</span>
                          <span>•</span>
                          <span>PM: {p.pmName}</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">
                            Nilai Kontrak
                          </div>
                          <div className="font-extrabold text-amber-600">
                            {formatRupiah(p.contractValue)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right hidden sm:block">
                            <span className="text-[10px] text-slate-500">Progres: </span>
                            <span className="font-bold text-blue-600">{p.actualProgressPercent}%</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProject({
                                id: p.id,
                                name: p.name,
                                contractValue: p.contractValue,
                                targetProfitPercent: p.targetProfitPercent,
                                location: p.location,
                                pmName: p.pmName
                              });
                            }}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit Proyek</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveProjectId(p.id);
                              setActivePTId(p.ptId);
                              onClose();
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1"
                          >
                            <span>Buka</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested Modal: Edit Project Parameters */}
      {editingProject && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Edit Data & Nilai Kontrak Proyek
                </h3>
                <p className="text-[11px] text-slate-500">
                  Ubah nominal kontrak (bulat ratusan ribu) dan target margin laba bersih proyek.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProject(editingProject.id, {
                  name: editingProject.name.trim(),
                  contractValue: editingProject.contractValue,
                  targetProfitPercent: editingProject.targetProfitPercent,
                  location: editingProject.location.trim(),
                  pmName: editingProject.pmName.trim()
                });
                alert(`Data proyek "${editingProject.name}" berhasil diperbarui!`);
                setEditingProject(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="font-bold text-slate-800 block mb-1">Nama Lengkap Proyek *</label>
                <input
                  type="text"
                  required
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/70 border border-amber-300 rounded-xl">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-amber-950">Nilai Kontrak (IDR) *</label>
                    <span className="text-[10px] text-amber-800 font-semibold">Rp 100.000</span>
                  </div>
                  <input
                    type="number"
                    required
                    min="100000"
                    step="100000"
                    value={editingProject.contractValue}
                    onChange={(e) => setEditingProject({ ...editingProject, contractValue: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-full p-2 border border-amber-400 bg-white rounded-lg font-mono font-extrabold text-slate-900 text-sm"
                  />
                  <div className="text-[10px] text-slate-900 font-mono font-bold mt-1">
                    {formatRupiah(editingProject.contractValue)}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingProject(prev => prev ? ({ ...prev, contractValue: prev.contractValue + 100000000 }) : null)}
                      className="px-1.5 py-0.5 rounded bg-white hover:bg-amber-100 border border-amber-300 text-[10px] font-mono font-bold text-amber-900"
                    >
                      +100 Jt
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProject(prev => prev ? ({ ...prev, contractValue: prev.contractValue + 10000000 }) : null)}
                      className="px-1.5 py-0.5 rounded bg-white hover:bg-amber-100 border border-amber-300 text-[10px] font-mono font-bold text-amber-900"
                    >
                      +10 Jt
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProject(prev => prev ? ({ ...prev, contractValue: prev.contractValue + 100000 }) : null)}
                      className="px-1.5 py-0.5 rounded bg-white hover:bg-amber-100 border border-amber-300 text-[10px] font-mono font-bold text-amber-900"
                    >
                      +100 Rb
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-amber-950">Target Margin (%) *</label>
                    <span className="text-[10px] text-emerald-800 font-semibold">Bebas</span>
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={editingProject.targetProfitPercent}
                    onChange={(e) => setEditingProject({ ...editingProject, targetProfitPercent: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-full p-2 border border-amber-400 bg-white rounded-lg font-mono font-extrabold text-slate-900 text-sm"
                  />
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                    Profit: {formatRupiah(Math.round((editingProject.contractValue * editingProject.targetProfitPercent) / 100))}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {[10, 15, 18, 20, 25, 30, 45, 50].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setEditingProject(prev => prev ? ({ ...prev, targetProfitPercent: pct }) : null)}
                        className="px-1.5 py-0.5 rounded bg-white hover:bg-amber-100 border border-amber-300 text-[10px] font-mono text-amber-900 font-semibold"
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Project Manager (PM)</label>
                  <input
                    type="text"
                    value={editingProject.pmName}
                    onChange={(e) => setEditingProject({ ...editingProject, pmName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lokasi Proyek</label>
                  <input
                    type="text"
                    value={editingProject.location}
                    onChange={(e) => setEditingProject({ ...editingProject, location: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Yakin ingin menghapus proyek "${editingProject.name}"?`)) {
                      deleteProject(editingProject.id);
                      setEditingProject(null);
                    }
                  }}
                  className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Proyek</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-extrabold shadow-sm transition"
                  >
                    Simpan Perubahan Proyek
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
