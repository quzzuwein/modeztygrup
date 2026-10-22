import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppUser, UserRole } from '../../types';
import { formatRupiah } from '../../services/exportService';
import {
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  KeyRound,
  Plus,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Layers,
  Sliders,
  Mail,
  Phone
} from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLimitConfig?: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  onOpenLimitConfig
}) => {
  const {
    users,
    adminSettings,
    addUser,
    updateUser,
    deleteUser,
    updateAdminSettings,
    roles,
    pts,
    projects,
    activeRole
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'security'>('users');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form states for new/edit user
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedRole, setAssignedRole] = useState<UserRole>('pelaksana');
  const [companyId, setCompanyId] = useState(pts[0]?.id || 'pt-1');
  const [projectId, setProjectId] = useState(projects[0]?.id || 'prj-1');

  // Security settings state
  const [ownerName, setOwnerName] = useState(adminSettings.ownerName);
  const [ownerEmail, setOwnerEmail] = useState(adminSettings.ownerEmail);
  const [adminPin, setAdminPin] = useState(adminSettings.adminPin);
  const [isSecurityLocked, setIsSecurityLocked] = useState(adminSettings.isSecurityLocked);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setOwnerName(adminSettings.ownerName);
      setOwnerEmail(adminSettings.ownerEmail);
      setAdminPin(adminSettings.adminPin);
      setIsSecurityLocked(adminSettings.isSecurityLocked);
    }
  }, [isOpen, adminSettings]);

  if (!isOpen) return null;

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      alert('Nama dan Email pengguna wajib diisi!');
      return;
    }

    if (editingUserId) {
      updateUser(editingUserId, {
        fullName,
        email,
        phone,
        assignedRole,
        companyId,
        projectId
      });
      setEditingUserId(null);
      alert(`Data staf ${fullName} berhasil diperbarui!`);
    } else {
      addUser({
        fullName,
        email,
        phone,
        assignedRole,
        companyId,
        projectId,
        isActive: true,
        lastLogin: '-'
      });
      alert(`Staf baru ${fullName} dengan role ${roles.find(r => r.id === assignedRole)?.title} berhasil didaftarkan!`);
    }

    // Reset form
    setFullName('');
    setEmail('');
    setPhone('');
    setShowAddForm(false);
  };

  const startEditUser = (user: AppUser) => {
    setEditingUserId(user.id);
    setFullName(user.fullName);
    setEmail(user.email);
    setPhone(user.phone || '');
    setAssignedRole(user.assignedRole);
    setCompanyId(user.companyId);
    setProjectId(user.projectId || projects[0]?.id || '');
    setShowAddForm(true);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPin || adminPin.length < 4) {
      alert('PIN Keamanan Admin minimal 4 digit!');
      return;
    }

    updateAdminSettings({
      ownerName: ownerName.trim(),
      ownerEmail: ownerEmail.trim(),
      adminPin: adminPin.trim(),
      isSecurityLocked
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  Super Administrator & Manajemen Akses Pengguna
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold uppercase">
                  Single Owner Registered
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Terdaftar resmi atas nama: <strong className="text-amber-300">{adminSettings.ownerName}</strong> ({adminSettings.ownerEmail}). Hanya pemilik akun ini yang berhak mengatur role & wewenang.
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

        {/* Status Mode Banner */}
        <div className="p-3.5 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${adminSettings.isSecurityLocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'}`}>
              {adminSettings.isSecurityLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-bold text-slate-900">
                Status Keamanan: {adminSettings.isSecurityLocked ? 'Terkunci Ketat (Strict Security Locked)' : 'Mode Terbuka / Simulasi Bebas'}
              </div>
              <div className="text-[11px] text-slate-500">
                {adminSettings.isSecurityLocked
                  ? 'Perpindahan role memerlukan otorisasi Master PIN Admin. Hanya akun terdaftar yang boleh beroperasi.'
                  : 'Siapapun dapat beralih role secara bebas untuk keperluan simulasi & demo fitur.'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenLimitConfig && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLimitConfig();
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                <span>Atur Limit Nominal Role</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                updateAdminSettings({ isSecurityLocked: !adminSettings.isSecurityLocked });
              }}
              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 shadow-xs ${
                adminSettings.isSecurityLocked
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-rose-600 text-white hover:bg-rose-500'
              }`}
            >
              {adminSettings.isSecurityLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{adminSettings.isSecurityLocked ? 'Buka Kunci Bebas' : 'Kunci Role Switcher'}</span>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex gap-2 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Daftar Staf Terdaftar ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'security' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Pengaturan Akun Pemilik & PIN Keamanan</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan akun pemilik dan PIN keamanan berhasil diperbarui!</span>
            </div>
          )}

          {/* TAB 1: USERS DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Pengendalian Staf & Penetapan Role Pengguna
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Setiap staf terikat pada 1 role resmi, entitas PT, dan limit persetujuan.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingUserId(null);
                    setFullName('');
                    setEmail('');
                    setPhone('');
                    setShowAddForm(!showAddForm);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddForm ? 'Batal' : 'Tambah Staf Baru'}</span>
                </button>
              </div>

              {/* Add / Edit Form */}
              {showAddForm && (
                <form
                  onSubmit={handleCreateUser}
                  className="p-4 bg-amber-50/50 border border-amber-300 rounded-2xl space-y-3 text-xs animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <span className="font-bold text-amber-950">
                      {editingUserId ? 'Edit Akun Staf' : 'Pendaftaran Staf & Hak Akses Baru'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Budi Santoso"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Email Resmi *</label>
                      <input
                        type="email"
                        required
                        placeholder="budi@kontraktor.co.id"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">No. WhatsApp / HP</label>
                      <input
                        type="text"
                        placeholder="0812-..."
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Tugaskan Role Jabatan *</label>
                      <select
                        value={assignedRole}
                        onChange={e => setAssignedRole(e.target.value as UserRole)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                      >
                        {roles.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.title} ({r.department})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Entitas Perusahaan (PT)</label>
                      <select
                        value={companyId}
                        onChange={e => setCompanyId(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                      >
                        {pts.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Proyek Penugasan</label>
                      <select
                        value={projectId}
                        onChange={e => setProjectId(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                      >
                        {projects.map(pr => (
                          <option key={pr.id} value={pr.id}>{pr.name} ({pr.code})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-xs"
                    >
                      {editingUserId ? 'Simpan Perubahan' : 'Daftarkan Staf'}
                    </button>
                  </div>
                </form>
              )}

              {/* Users Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Nama & Email Staf</th>
                      <th className="p-3">Role Ditugaskan</th>
                      <th className="p-3">Entitas PT & Proyek</th>
                      <th className="p-3 text-right">Limit Approval Role</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Aksi Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {users.map(u => {
                      const roleMeta = roles.find(r => r.id === u.assignedRole);
                      const ptMeta = pts.find(p => p.id === u.companyId);
                      const projMeta = projects.find(p => p.id === u.projectId);

                      return (
                        <tr key={u.id} className="hover:bg-slate-50 transition">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {u.isSuperAdmin && (
                                <span className="text-[9px] bg-slate-900 text-amber-300 font-bold px-1.5 py-0.2 rounded">
                                  SUPER ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{u.email}</span>
                              {u.phone && <span>· {u.phone}</span>}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-800">
                              {roleMeta?.title || u.assignedRole}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              {roleMeta?.department}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800">{ptMeta?.code || '-'}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                              {projMeta?.code || 'Seluruh Proyek PT'}
                            </div>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-800">
                            {formatRupiah(roleMeta?.approvalLimit || 0)}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {u.isActive ? 'Aktif' : 'Non-aktif'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => startEditUser(u)}
                                className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                                title="Edit Role & Penugasan"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {!u.isSuperAdmin && (
                                <>
                                  <button
                                    onClick={() => {
                                      updateUser(u.id, { isActive: !u.isActive });
                                    }}
                                    className={`p-1 rounded ${u.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                    title={u.isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                                  >
                                    {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Hapus akun staf ${u.fullName}?`)) {
                                        deleteUser(u.id);
                                      }
                                    }}
                                    className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                    title="Hapus Pengguna"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY & OWNER PIN */}
          {activeTab === 'security' && (
            <form onSubmit={handleSaveSecurity} className="max-w-xl mx-auto space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Identitas Pemilik Sistem & Master Otorisasi</span>
                </h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Aplikasi ini didaftarkan di bawah kendali 1 orang pemilik utama. Pemilik berhak mengunci pergantian role dan hanya mengizinkan pengubahan via verifikasi PIN Admin.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Nama Pemilik Utama (Super Administrator)</label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Email Resmi Pemilik (Primary Account)</label>
                    <input
                      type="email"
                      required
                      value={ownerEmail}
                      onChange={e => setOwnerEmail(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Master PIN Keamanan (Untuk Otorisasi & Buka Kunci Role) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={adminPin}
                      onChange={e => setAdminPin(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-black text-center text-base tracking-widest text-amber-700"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Default PIN awal: <strong>1234</strong> (Dapat diubah bebas oleh pemilik).
                    </span>
                  </div>
                </div>

                {/* Lock Switch */}
                <div className="pt-3 border-t border-slate-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSecurityLocked}
                      onChange={e => setIsSecurityLocked(e.target.checked)}
                      className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <span className="font-extrabold text-slate-900 block">
                        Aktifkan Mode Penguncian Ketat (Strict Security Locked)
                      </span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        Bila dicentang, pengguna biasa di browser tidak dapat bebas beralih role tanpa memasukkan Master PIN yang benar.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs shadow transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Pengaturan Keamanan Pemilik</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs shrink-0">
          <span className="text-slate-500 text-[11px]">
            Master Control Governance   KontraktorPro Enterprise
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
