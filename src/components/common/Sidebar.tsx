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
  Smartphone,
  ShieldCheck,
  Lock,
  Unlock,
  ChevronRight
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
    { id: 'dashboard', label: 'Ringkasan & Warning', icon: LayoutDashboard, badge: relevantWarningsCount, group: 'Utama' },
    { id: 'ahs', label: 'Master AHS PUPR', icon: BookOpen, group: 'Teknik & Estimasi' },
    { id: 'rab', label: 'RAB & Impor Excel', icon: FileSpreadsheet, group: 'Teknik & Estimasi' },
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
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-full">
      {/* Role Profile & Access Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Hak Akses Aktif
          </span>
          <button
            onClick={() => setStrictScope(!strictScope)}
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 transition ${
              strictScope ? 'bg-slate-200/80 text-slate-700' : 'bg-amber-100 text-amber-800'
            }`}
            title="Beralih Pembatasan Menu (Ketat / Bebas)"
          >
            {strictScope ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
            <span>{strictScope ? 'Ketat (RBAC)' : 'Bebas'}</span>
          </button>
        </div>

        <div className="font-bold text-sm text-slate-900 leading-tight">
          {currentRoleInfo.title}
        </div>
        <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
          <span>{currentRoleInfo.department}</span>
          <span className="font-mono text-[11px] font-semibold text-slate-700">
            {currentRoleInfo.canApprove
              ? currentRoleInfo.approvalLimit >= 1_000_000_000
                ? `Limit: Rp ${(currentRoleInfo.approvalLimit / 1_000_000_000).toFixed(0)} M`
                : `Limit: Rp ${(currentRoleInfo.approvalLimit / 1_000_000).toFixed(0)} Jt`
              : 'Draft Only'}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {groups.map(group => (
          <div key={group} className="space-y-0.5">
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 ? (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-amber-400 text-slate-950' : 'bg-rose-500 text-white'
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

      {/* Bottom PWA Field Launch */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={() => setIsMobileFieldMode(true)}
          className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
            isMobileFieldMode
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
          }`}
        >
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <span>Mode Lapangan (PWA)</span>
        </button>
      </div>
    </aside>
  );
};
