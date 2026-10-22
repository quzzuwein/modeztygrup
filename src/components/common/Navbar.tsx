import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Building2,
  HardHat,
  Bell,
  Smartphone,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  Layers,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Users,
  Image as ImageIcon,
  Plus
} from 'lucide-react';
import { CompanySettingsModal } from './CompanySettingsModal';
import { ClientManagementModal } from './ClientManagementModal';

export const Navbar: React.FC<{
  onOpenWarnings?: () => void;
  onOpenRoleMatrix?: () => void;
  onOpenAddEntity?: (mode: 'pt' | 'project') => void;
}> = ({ onOpenWarnings, onOpenRoleMatrix, onOpenAddEntity }) => {
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
    resetAllData
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showPTMenu, setShowPTMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [isCompanySettingsOpen, setIsCompanySettingsOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // Active warnings matching current role
  const relevantWarnings = warnings.filter(
    w => w.status === 'open' && (w.assignedRoles.includes(activeRole) || activeRole === 'direktur')
  );

  // Filter projects by active PT (1 Perusahaan Multi-Proyek)
  const filteredProjects = activeRole === 'direktur' || currentRoleInfo.crossPT
    ? projects
    : projects.filter(p => p.ptId === activePTId);

  const ptProjects = projects.filter(p => p.ptId === activePTId);
  const ptClients = clients.filter(c => c.companyId === activePTId);

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-inner">
              <HardHat className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                  KONTRAKTOR PRO
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ERP MULTI-PT & MULTI-PROYEK
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Sistem Manajemen Konstruksi Terpadu (AHS PUPR, RAP, Prisma v2.2)
              </p>
            </div>
          </div>

          {/* Center: Context Selectors (PT & Proyek) */}
          <div className="hidden lg:flex items-center gap-2">
            {/* PT Selector with Company Logo */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowPTMenu(!showPTMenu);
                  setShowProjectMenu(false);
                  setShowRoleMenu(false);
                }}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-200 transition"
                title="Pilih Entitas PT & Kelola Logo"
              >
                {currentPT?.logoUrl ? (
                  <img
                    src={currentPT.logoUrl}
                    alt={currentPT.code}
                    className="w-5 h-5 rounded object-contain bg-slate-900 border border-slate-700 shrink-0"
                  />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
                <span className="font-bold max-w-[140px] truncate text-amber-300">
                  {currentPT?.code || 'Pilih PT'}
                </span>
                <span className="text-[10px] text-slate-400">
                  ({ptProjects.length} Proyek)
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showPTMenu && (
                <div className="absolute left-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700 flex items-center justify-between">
                    <span>Entitas Perusahaan (PT)</span>
                    <span className="text-amber-400 font-bold">{pts.length} PT Terdaftar</span>
                  </div>

                  <div className="space-y-1 my-1.5 max-h-56 overflow-y-auto">
                    {pts.map(pt => {
                      const childProjCount = projects.filter(p => p.ptId === pt.id).length;
                      return (
                        <button
                          key={pt.id}
                          onClick={() => {
                            setActivePTId(pt.id);
                            setShowPTMenu(false);
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-2.5 transition ${
                            activePTId === pt.id
                              ? 'bg-amber-500 text-slate-950 font-medium'
                              : 'hover:bg-slate-700/60 text-slate-200'
                          }`}
                        >
                          {pt.logoUrl ? (
                            <img
                              src={pt.logoUrl}
                              alt={pt.code}
                              className="w-7 h-7 rounded-lg object-contain bg-slate-900 p-0.5 border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                              {pt.code.slice(0, 2)}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="truncate">{pt.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                activePTId === pt.id ? 'bg-slate-900 text-amber-300' : 'bg-slate-900 text-slate-400'
                              }`}>
                                {pt.code}
                              </span>
                            </div>
                            <div className={`text-[10px] truncate ${activePTId === pt.id ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                              {childProjCount} Proyek Aktif • NPWP: {pt.npwp}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions inside PT dropdown */}
                  <div className="pt-2 border-t border-slate-700 space-y-1 text-xs">
                    <button
                      onClick={() => {
                        setShowPTMenu(false);
                        setIsCompanySettingsOpen(true);
                      }}
                      className="w-full py-1.5 px-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition text-[11px]"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Profil Perusahaan & Ganti Logo PT</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowPTMenu(false);
                        setIsClientModalOpen(true);
                      }}
                      className="w-full py-1.5 px-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition text-[11px]"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>Database Klien ({ptClients.length} Klien)</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowPTMenu(false);
                        onOpenAddEntity?.('pt');
                      }}
                      className="w-full py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold rounded-lg flex items-center justify-center gap-1.5 transition text-[11px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Tambah Perusahaan (PT Baru)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Project Selector (1 Perusahaan Multi-Proyek) */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProjectMenu(!showProjectMenu);
                  setShowPTMenu(false);
                  setShowRoleMenu(false);
                }}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-200 transition"
                title="Pilih Proyek Aktif"
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-medium max-w-[170px] truncate">{currentProject?.name || 'Pilih Proyek'}</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-mono">
                  {currentProject?.actualProgressPercent}%
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProjectMenu && (
                <div className="absolute left-0 mt-2 w-84 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700 flex justify-between">
                    <span>Proyek {currentPT?.code} (Multi-Proyek)</span>
                    <span>Progres</span>
                  </div>

                  <div className="space-y-1 my-1.5 max-h-60 overflow-y-auto">
                    {filteredProjects.map(proj => (
                      <button
                        key={proj.id}
                        onClick={() => {
                          setActiveProjectId(proj.id);
                          setActivePTId(proj.ptId);
                          setShowProjectMenu(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between transition ${
                          activeProjectId === proj.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-700/60 text-slate-200'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-semibold truncate">{proj.name}</div>
                          <div className="text-[10px] opacity-80 flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono bg-black/30 px-1 rounded">{proj.code}</span>
                            <span>•</span>
                            <span className="truncate">Klien: {proj.clientName}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-mono font-bold">{proj.actualProgressPercent}%</div>
                          <div className="text-[10px] opacity-70">Plan: {proj.plannedProgressPercent}%</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Add Project Button */}
                  <div className="pt-2 border-t border-slate-700">
                    <button
                      onClick={() => {
                        setShowProjectMenu(false);
                        onOpenAddEntity?.('project');
                      }}
                      className="w-full py-1.5 px-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Daftarkan Proyek Baru untuk {currentPT?.code}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Button: Data Klien */}
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700/80 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-200 transition"
              title="Kelola Data Klien & Pemberi Tugas"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden xl:inline">Data Klien</span>
              <span className="px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                {ptClients.length}
              </span>
            </button>
          </div>

          {/* Right Action: Mobile Mode, Matrix, Warnings, Role Switcher */}
          <div className="flex items-center gap-2">
            {/* Quick Logo / Company Profile Settings Button */}
            <button
              onClick={() => setIsCompanySettingsOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition shadow-xs"
              title="Profil Perusahaan & Logo Resmi"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Logo & Profil PT</span>
            </button>

            {/* Role Matrix Modal Button */}
            {onOpenRoleMatrix && (
              <button
                onClick={onOpenRoleMatrix}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition shadow-xs"
                title="Lihat Matriks Hak Akses & Pembagian Tugas 12 Role"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Matriks 12 Role</span>
              </button>
            )}

            {/* Quick Mobile Field Mode Toggle */}
            <button
              onClick={() => setIsMobileFieldMode(!isMobileFieldMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                isMobileFieldMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Beralih ke Tampilan Mandor / Pelaksana Lapangan (Mobile Mode)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mode Lapangan</span>
            </button>

            {/* Early Warning Trigger Button */}
            {onOpenWarnings && (
              <button
                onClick={onOpenWarnings}
                className="relative p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition"
                title="Peringatan Dini Deviasi & Risiko"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                {relevantWarnings.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {relevantWarnings.length}
                  </span>
                )}
              </button>
            )}

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleMenu(!showRoleMenu);
                  setShowPTMenu(false);
                  setShowProjectMenu(false);
                }}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow transition"
              >
                <span className="max-w-[130px] truncate">{currentRoleInfo.title}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-950" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700 flex justify-between items-center">
                    <span>Simulasi Peran Pengguna (12 Role)</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto py-1">
                    {roles.map(r => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setActiveRole(r.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-start gap-2.5 transition ${
                          activeRole === r.id ? 'bg-amber-500 text-slate-950' : 'hover:bg-slate-700/60 text-slate-200'
                        }`}
                      >
                        <div className={`mt-0.5 w-2 h-2 rounded-full ${activeRole === r.id ? 'bg-slate-950' : 'bg-amber-400'}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span>{r.title}</span>
                            {r.crossPT && (
                              <span className={`text-[9px] px-1 rounded ${activeRole === r.id ? 'bg-slate-900 text-amber-300' : 'bg-slate-700 text-slate-300'}`}>
                                Lintas PT
                              </span>
                            )}
                          </div>
                          <div className={`text-[10px] ${activeRole === r.id ? 'text-slate-900' : 'text-slate-400'}`}>
                            {r.department} • {r.canApprove ? `Approval s/d Rp ${(r.approvalLimit / 1_000_000).toLocaleString('id-ID')} Jt` : 'Tidak Ada Approval'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reset Data Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset semua data kembali ke default demo proyek?')) {
                  resetAllData();
                }
              }}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 border border-slate-700 transition"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

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
    </header>
  );
};
