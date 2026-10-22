import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Building2,
  HardHat,
  Bell,
  Smartphone,
  ChevronDown,
  Layers,
  Users,
  Image as ImageIcon,
  Plus,
  Share2,
  Shield,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Lock,
  Unlock,
  KeyRound,
  FileCheck2,
  UserCheck,
  RotateCcw,
  Settings,
  ChevronRight,
  Sparkles,
  Trash2,
  Edit2
} from 'lucide-react';
import { CompanySettingsModal } from './CompanySettingsModal';
import { ClientManagementModal } from './ClientManagementModal';
import { ShareLinkModal } from './ShareLinkModal';
import { ResetDataModal } from './ResetDataModal';

export const Navbar: React.FC<{
  onOpenWarnings?: () => void;
  onOpenRoleMatrix?: () => void;
  onOpenAddEntity?: (mode: 'pt' | 'project') => void;
  onOpenApprovalCenter?: () => void;
  onOpenRoleLimitConfig?: () => void;
  onOpenUserManagement?: () => void;
  onRoleChange?: (newRole: UserRole) => void;
}> = ({
  onOpenWarnings,
  onOpenRoleMatrix,
  onOpenAddEntity,
  onOpenApprovalCenter,
  onOpenRoleLimitConfig,
  onOpenUserManagement,
  onRoleChange
}) => {
  const {
    activeRole,
    currentRoleInfo,
    setActiveRole,
    roles,
    pts,
    activePTId,
    setActivePTId,
    projects,
    activeProjectId,
    setActiveProjectId,
    currentProject,
    currentPT,
    clients,
    isMobileFieldMode,
    setIsMobileFieldMode,
    warnings,
    materialRequests,
    purchaseOrders,
    wageRecords,
    adminSettings,
    verifyAdminPin,
    switchRoleAndGetDefaultTab
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isCompanySettingsOpen, setIsCompanySettingsOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Security Lock PIN verification modal state
  const [pendingTargetRole, setPendingTargetRole] = useState<UserRole | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Calculate pending approvals count for current role
  const pendingSPBsCount = materialRequests.filter(s => {
    if (activeRole === 'direktur') return s.status === 'diajukan' || s.status === 'diverifikasi_sm';
    if (activeRole === 'site_manager') return s.status === 'diajukan';
    if (activeRole === 'pm_teknik' || activeRole === 'pm_lapangan') return s.status === 'diverifikasi_sm' || s.status === 'diajukan';
    return false;
  }).length;

  const pendingPOsCount = purchaseOrders.filter(p => {
    if (activeRole === 'direktur') return p.status === 'diajukan' || p.status === 'diverifikasi_pm';
    if (activeRole === 'pm_teknik') return p.status === 'diajukan';
    return false;
  }).length;

  const pendingWagesCount = wageRecords.filter(w => {
    if (activeRole === 'direktur') return w.status === 'diajukan' || w.status === 'diverifikasi_sm' || w.status === 'siap_bayar';
    if (activeRole === 'site_manager') return w.status === 'diajukan';
    if (activeRole === 'pm_teknik' || activeRole === 'pm_lapangan') return w.status === 'diverifikasi_sm';
    if (activeRole === 'admin_keuangan') return w.status === 'siap_bayar';
    return false;
  }).length;

  const totalPendingApprovals = pendingSPBsCount + pendingPOsCount + pendingWagesCount;

  // Active warnings matching current role
  const relevantWarnings = warnings.filter(
    w => w.status === 'open' && (w.assignedRoles.includes(activeRole) || activeRole === 'direktur')
  );

  const totalNotifications = totalPendingApprovals + relevantWarnings.length;

  // Strictly filter projects by active PT
  const projectsInActivePT = projects.filter(p => p.ptId === activePTId);

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-sm notranslate" translate="no">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* ZONE 1: Brand & Project Selector (Zoom & Shrink resilient) */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 max-w-xl">
            {/* Wordmark */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-sm">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
              </div>
              <div className="hidden sm:block">
                <span translate="no" className="notranslate font-extrabold text-sm sm:text-base tracking-tight text-white whitespace-nowrap">
                  MODESTY <span className="text-amber-400 font-semibold text-xs tracking-normal">ERP</span>
                </span>
              </div>
            </div>

            <div className="hidden md:block h-5 w-px bg-slate-800 shrink-0" />

            {/* Unified Project & PT Selector */}
            <div className="relative min-w-0 flex-1 max-w-sm sm:max-w-md">
              <button
                onClick={() => {
                  setShowProjectSelector(!showProjectSelector);
                  setShowRoleMenu(false);
                  setShowSettingsMenu(false);
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 transition group w-full overflow-hidden"
              >
                {currentPT?.logoUrl ? (
                  <img
                    src={currentPT.logoUrl}
                    alt={currentPT.code}
                    className="w-4 h-4 rounded object-contain shrink-0"
                  />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
                
                <span className="font-semibold text-amber-300 truncate max-w-[70px] sm:max-w-[100px] shrink-0">
                  {currentPT?.code}
                </span>
                
                <span className="text-slate-500 shrink-0">/</span>
                
                <span className="font-medium text-slate-100 truncate min-w-0 flex-1 text-left">
                  {currentProject?.name || '(Belum ada proyek)'}
                </span>

                {currentProject ? (
                  <span className="hidden sm:inline font-mono text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-bold shrink-0">
                    {currentProject.actualProgressPercent}%
                  </span>
                ) : (
                  <span className="hidden sm:inline text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold shrink-0">
                    + Proyek
                  </span>
                )}

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition shrink-0 ml-0.5" />
              </button>

              {/* Selector Popover */}
              {showProjectSelector && (
                <div className="absolute left-0 mt-2 w-88 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 text-slate-200">
                  
                  {/* PT Selector Tabs */}
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Pilih Perusahaan (PT)</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowProjectSelector(false);
                          setIsCompanySettingsOpen(true);
                        }}
                        className="text-amber-400 hover:text-amber-300 normal-case flex items-center gap-1 font-bold text-[11px]"
                        title="Kelola Data dan Logo PT"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit PT</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProjectSelector(false);
                          onOpenAddEntity?.('pt');
                        }}
                        className="text-amber-400 hover:text-amber-300 normal-case flex items-center gap-1 font-bold text-[11px]"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Tambah PT</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 mb-3 max-h-36 overflow-y-auto">
                    {pts.map(pt => (
                      <button
                        key={pt.id}
                        onClick={() => setActivePTId(pt.id)}
                        className={`p-2 rounded-lg text-left text-xs transition border flex items-center justify-between ${
                          activePTId === pt.id
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-5 h-5 rounded bg-slate-950 flex items-center justify-center text-[10px] font-mono shrink-0">
                            {pt.code.slice(0, 2)}
                          </div>
                          <span className="truncate">{pt.code}</span>
                        </div>
                        <span className="text-[10px] opacity-70 font-mono">
                          {projects.filter(p => p.ptId === pt.id).length}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Projects under active PT */}
                  <div className="border-t border-slate-800 pt-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Proyek {currentPT?.code} ({projectsInActivePT.length})</span>
                      <button
                        onClick={() => {
                          setShowProjectSelector(false);
                          onOpenAddEntity?.('project');
                        }}
                        className="text-amber-400 hover:text-amber-300 normal-case flex items-center gap-1 font-bold text-[11px]"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Daftar Proyek Baru</span>
                      </button>
                    </div>

                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {projectsInActivePT.length === 0 ? (
                        <div className="p-4 text-center rounded-lg bg-slate-800/50 border border-dashed border-slate-700/80 my-1">
                          <p className="text-xs text-slate-400">Belum ada proyek terdaftar untuk {currentPT?.name || 'PT ini'}.</p>
                          <button
                            onClick={() => {
                              setShowProjectSelector(false);
                              onOpenAddEntity?.('project');
                            }}
                            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Daftarkan Proyek Pertama</span>
                          </button>
                        </div>
                      ) : (
                        projectsInActivePT.map(proj => (
                          <button
                            key={proj.id}
                            onClick={() => {
                              setActiveProjectId(proj.id);
                              setActivePTId(proj.ptId);
                              setShowProjectSelector(false);
                            }}
                            className={`w-full p-2 rounded-lg text-left text-xs transition flex items-center justify-between ${
                              activeProjectId === proj.id
                                ? 'bg-amber-500 text-slate-950 font-bold'
                                : 'hover:bg-slate-800 text-slate-200'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="truncate">{proj.name}</div>
                              <div className={`text-[10px] ${activeProjectId === proj.id ? 'text-slate-900' : 'text-slate-400'} flex items-center gap-1 mt-0.5`}>
                                <span className="font-mono">{proj.code}</span>
                                <span>•</span>
                                <span className="truncate">{proj.clientName}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-mono">{proj.actualProgressPercent}%</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ZONE 2: Clean Actions & Profile Controls (Strict Shrink & Truncation) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-2">
            
            {/* Share App Link */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition shrink-0 whitespace-nowrap"
              title="Bagikan Tautan Aplikasi untuk Tim & Lapangan"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Bagikan</span>
            </button>

            {/* Mobile Mode Quick Switcher */}
            <button
              onClick={() => setIsMobileFieldMode(!isMobileFieldMode)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border transition shrink-0 whitespace-nowrap ${
                isMobileFieldMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700/80'
              }`}
              title="Mode Input Mandor / Pelaksana Lapangan"
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">Mode Lapangan</span>
            </button>

            {/* Notification / Approvals Center */}
            <button
              onClick={() => {
                if (onOpenWarnings) {
                  onOpenWarnings();
                } else if (onOpenApprovalCenter) {
                  onOpenApprovalCenter();
                }
              }}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 transition shrink-0"
              title={`${totalPendingApprovals} Persetujuan Pending, ${relevantWarnings.length} Peringatan (Klik untuk Mitigasi / Hapus)`}
            >
              <Bell className="w-4 h-4 text-slate-300" />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalNotifications}
                </span>
              )}
            </button>

            {/* Settings & Configuration Popover */}
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  setShowSettingsMenu(!showSettingsMenu);
                  setShowRoleMenu(false);
                  setShowProjectSelector(false);
                }}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 transition"
                title="Pengaturan Perusahaan, Klien, dan Hak Akses"
              >
                <Settings className="w-4 h-4 text-slate-300" />
              </button>

              {showSettingsMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 text-slate-200 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Pengaturan & Tata Kelola
                  </div>
                  <div className="py-1 space-y-0.5 text-xs">
                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        setIsCompanySettingsOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2.5 transition text-slate-200"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Profil PT & Ganti Logo</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        setIsClientModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2.5 transition text-slate-200"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>Database Klien ({clients.length})</span>
                    </button>

                    {onOpenRoleMatrix && (
                      <button
                        onClick={() => {
                          setShowSettingsMenu(false);
                          onOpenRoleMatrix();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2.5 transition text-slate-200"
                      >
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Matriks Hak Akses (12 Role)</span>
                      </button>
                    )}

                    {onOpenRoleLimitConfig && (
                      <button
                        onClick={() => {
                          setShowSettingsMenu(false);
                          onOpenRoleLimitConfig();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2.5 transition text-slate-200"
                      >
                        <Sliders className="w-3.5 h-3.5 text-purple-400" />
                        <span>Atur Batas Limit Nominal</span>
                      </button>
                    )}

                    {onOpenUserManagement && (
                      <button
                        onClick={() => {
                          setShowSettingsMenu(false);
                          onOpenUserManagement();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2.5 transition text-slate-200"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        <span>Admin Keamanan & PIN</span>
                      </button>
                    )}

                    <div className="border-t border-slate-800 my-1" />

                    {/* Reset Application Modal Trigger */}
                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        setIsResetModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 flex items-center gap-2.5 transition text-xs font-semibold"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                      <span>Reset & Pembersihan Data</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Role Switcher */}
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  setShowRoleMenu(!showRoleMenu);
                  setShowProjectSelector(false);
                  setShowSettingsMenu(false);
                }}
                className="flex items-center gap-2 sm:gap-2.5 pl-2 pr-2.5 sm:pr-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/90 border border-slate-700/80 transition"
              >
                <div className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                  {currentRoleInfo.title.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white max-w-[100px] md:max-w-[120px] truncate leading-tight">
                    {currentRoleInfo.title}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-none mt-0.5">
                    {activeRole === 'direktur' ? 'Holding Executive' : 'Divisi Proyek'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Role Switcher Dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 text-slate-200">
                  <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Simulasi Peran Pengguna</div>
                      <div className="text-[11px] text-slate-400">Pilih dari 12 hak akses divisi</div>
                    </div>
                    {adminSettings.isSecurityLocked && (
                      <span className="text-rose-400 text-[10px] font-bold flex items-center gap-1 bg-rose-500/10 px-1.5 py-0.5 rounded">
                        <Lock className="w-3 h-3" />
                        <span>PIN Aktif</span>
                      </span>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto py-1 space-y-0.5">
                    {roles.map(r => (
                      <button
                        key={r.id}
                        onClick={() => {
                          if (adminSettings.isSecurityLocked && r.id !== activeRole) {
                            setPendingTargetRole(r.id);
                            setPinError(false);
                            setEnteredPin('');
                            setShowRoleMenu(false);
                          } else {
                            switchRoleAndGetDefaultTab(r.id);
                            onRoleChange?.(r.id);
                            setShowRoleMenu(false);
                          }
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-center gap-2.5 transition text-xs ${
                          activeRole === r.id
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full shrink-0 ${activeRole === r.id ? 'bg-slate-950' : 'bg-amber-400'}`} />
                        <div className="flex-1 truncate">
                          <span>{r.title}</span>
                        </div>
                        {r.crossPT && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                            activeRole === r.id ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            Lintas PT
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Super Admin Quick Reset Button */}
                  {activeRole === 'direktur' && (
                    <div className="border-t border-slate-800 pt-2 px-1">
                      <button
                        onClick={() => {
                          setShowRoleMenu(false);
                          setIsResetModalOpen(true);
                        }}
                        className="w-full py-1.5 px-2 bg-rose-600/15 hover:bg-rose-600/25 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                        <span>Reset Data Aplikasi (Super Admin)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Security PIN Modal */}
      {pendingTargetRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (verifyAdminPin(enteredPin)) {
                switchRoleAndGetDefaultTab(pendingTargetRole);
                onRoleChange?.(pendingTargetRole);
                setPendingTargetRole(null);
                setEnteredPin('');
                setPinError(false);
              } else {
                setPinError(true);
              }
            }}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-slate-900"
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Pergantian Peran Terkunci</h3>
              <p className="text-xs text-slate-500">
                Masukkan PIN Admin Keamanan untuk beralih ke peran ini. (Default: 1234)
              </p>
            </div>

            <div>
              <input
                type="password"
                maxLength={6}
                value={enteredPin}
                onChange={e => {
                  setEnteredPin(e.target.value);
                  setPinError(false);
                }}
                placeholder="Masukkan 4-digit PIN"
                className={`w-full text-center text-xl font-mono tracking-widest py-2.5 rounded-xl border ${
                  pinError ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                }`}
              />
              {pinError && (
                <div className="text-rose-600 font-bold text-xs text-center mt-1.5">
                  PIN Salah! Masukkan PIN yang benar.
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setPendingTargetRole(null);
                  setEnteredPin('');
                  setPinError(false);
                }}
                className="py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs"
              >
                Verifikasi PIN
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Company Profile & Logo Modal */}
      <CompanySettingsModal
        isOpen={isCompanySettingsOpen}
        onClose={() => setIsCompanySettingsOpen(false)}
        onOpenAddProject={() => onOpenAddEntity?.('project')}
        onOpenAddPT={() => onOpenAddEntity?.('pt')}
      />

      {/* Client Management Modal */}
      <ClientManagementModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
      />

      {/* Share Link & QR Code Modal */}
      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Reset Data & Pembersihan Modal */}
      <ResetDataModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
    </header>
  );
};
