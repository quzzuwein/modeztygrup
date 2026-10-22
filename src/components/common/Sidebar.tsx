import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Calculator,
  BookOpen,
  Boxes,
  Users2,
  LineChart,
  BadgeDollarSign,
  FileText,
  History,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Lock,
  Unlock
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'ahs'
  | 'rab'
  | 'rap'
  | 'logistik'
  | 'upah'
  | 'progres'
  | 'keuangan'
  | 'laporan'
  | 'audit';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenRoleMatrix?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenRoleMatrix }) => {
  const {
    currentRoleInfo,
    warnings,
    activeRole,
    isMobileFieldMode,
    setIsMobileFieldMode,
    materialRequests,
    purchaseOrders,
    wageRecords
  } = useApp();
  const [strictScope, setStrictScope] = useState(true);

  const relevantWarningsCount = warnings.filter(
    w => w.status === 'open' && (w.assignedRoles.includes(activeRole) || activeRole === 'direktur')
  ).length;

  const pendingLogistikCount = materialRequests.filter(s => s.status === 'diajukan' || s.status === 'diverifikasi_sm').length;
  const pendingUpahCount = wageRecords.filter(w => w.status === 'diajukan' || w.status === 'diverifikasi_sm').length;
  const pendingKeuanganCount = wageRecords.filter(w => w.status === 'siap_bayar').length + purchaseOrders.filter(p => p.status === 'diterima_lengkap').length;

  const allMenuItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; group: string }[] = [
    { id: 'dashboard', label: 'Dashboard & Warning', icon: LayoutDashboard, badge: relevantWarningsCount, group: 'Utama' },
    { id: 'ahs', label: 'Master AHS PUPR', icon: BookOpen, group: 'Teknik & Estimasi' },
    { id: 'rab', label: 'RAB & Import Excel AI', icon: FileSpreadsheet, group: 'Teknik & Estimasi' },
    { id: 'rap', label: 'RAP & Target Profit', icon: Calculator, group: 'Teknik & Estimasi' },
    { id: 'logistik', label: 'Logistik & Gudang', icon: Boxes, badge: pendingLogistikCount > 0 ? pendingLogistikCount : undefined, group: 'Operasional Lapangan' },
    { id: 'upah', label: 'Kontrol Upah & Mandor', icon: Users2, badge: pendingUpahCount > 0 ? pendingUpahCount : undefined, group: 'Operasional Lapangan' },
    { id: 'progres', label: 'Progres & Kurva S', icon: LineChart, group: 'Operasional Lapangan' },
    { id: 'keuangan', label: 'Keuangan & Pajak', icon: BadgeDollarSign, badge: pendingKeuanganCount > 0 ? pendingKeuanganCount : undefined, group: 'Akuntansi & Keuangan' },
    { id: 'laporan', label: 'Laporan & Ekspor', icon: FileText, group: 'Manajerial' },
    { id: 'audit', label: 'Audit Trail & Log', icon: History, group: 'Manajerial' }
  ];

  // Filter menu items if strict mode is ON
  const menuItems = strictScope
    ? allMenuItems.filter(item => currentRoleInfo.allowedTabs?.includes(item.id) || activeRole === 'direktur')
    : allMenuItems;

  // Group items
  const groups = Array.from(new Set(menuItems.map(m => m.group)));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 shadow-sm">
      {/* Role Banner in Sidebar */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
            AKSES ROLE SAAT INI
          </span>
          <button
            onClick={() => setStrictScope(!strictScope)}
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 transition ${
              strictScope ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-200 text-slate-700'
            }`}
            title="Beralih antara Pembatasan Menu Ketat (Strict RBAC) atau Buka Semua Menu"
          >
            {strictScope ? <Lock className="w-2.5 h-2.5 text-amber-700" /> : <Unlock className="w-2.5 h-2.5 text-slate-500" />}
            <span>{strictScope ? 'Ketat' : 'Bebas'}</span>
          </button>
        </div>
        <div className="font-extrabold text-sm text-slate-800 leading-tight">
          {currentRoleInfo.title}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">
          {currentRoleInfo.department}
        </div>
        
        {/* Approval limit badge */}
        <div className="mt-2 text-[10px] font-mono font-bold bg-slate-200/80 text-slate-800 px-2 py-0.5 rounded flex items-center justify-between">
          <span>Limit Approval:</span>
          <span className={currentRoleInfo.canApprove ? 'text-emerald-700' : 'text-slate-500'}>
            {currentRoleInfo.canApprove
              ? currentRoleInfo.approvalLimit >= 1_000_000_000
                ? `Rp ${(currentRoleInfo.approvalLimit / 1_000_000_000).toFixed(0)} M`
                : `Rp ${(currentRoleInfo.approvalLimit / 1_000_000).toFixed(0)} Jt`
              : 'Rp 0 (Draft)'}
          </span>
        </div>

        {/* View Matrix Button */}
        {onOpenRoleMatrix && (
          <button
            onClick={onOpenRoleMatrix}
            className="w-full mt-2.5 py-1.5 px-2 rounded-lg bg-slate-900 text-amber-300 hover:bg-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Matriks Hak Akses & Alur</span>
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {groups.map(group => (
          <div key={group} className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {group}
            </div>
            {menuItems
              .filter(m => m.group === group)
              .map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id && !isMobileFieldMode;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileFieldMode(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 ? (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-slate-950 text-amber-400' : 'bg-rose-500 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
          </div>
        ))}
      </div>

      {/* Field Mode Banner on Bottom */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <button
          onClick={() => setIsMobileFieldMode(true)}
          className={`w-full p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition ${
            isMobileFieldMode
              ? 'bg-emerald-600 text-white border-emerald-700 shadow'
              : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Buka Mode Lapangan (PWA)</span>
        </button>
      </div>
    </aside>
  );
};
