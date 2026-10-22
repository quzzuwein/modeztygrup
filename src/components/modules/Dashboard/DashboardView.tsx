import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { ActiveTab } from '../../common/Sidebar';
import { formatRupiah, exportComprehensiveExcel, triggerPrintReport } from '../../../services/exportService';
import {
  TrendingUp,
  AlertTriangle,
  Building2,
  Boxes,
  Users,
  LineChart,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  DollarSign,
  FileSpreadsheet,
  PlusCircle,
  Truck,
  Printer,
  Download,
  Plus,
  Image as ImageIcon,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { CompanySettingsModal } from '../../common/CompanySettingsModal';
import { ClientManagementModal } from '../../common/ClientManagementModal';

interface DashboardViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenAddEntity?: (mode: 'pt' | 'project') => void;
  onOpenApprovalCenter?: () => void;
  onOpenRoleLimitConfig?: () => void;
  onOpenUserManagement?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenAddEntity,
  onOpenApprovalCenter,
  onOpenRoleLimitConfig,
  onOpenUserManagement
}) => {
  const {
    currentProject,
    currentPT,
    pts,
    clients,
    projects,
    activeRole,
    currentRoleInfo,
    warnings,
    stockItems,
    wageRecords,
    materialRequests,
    rabItems,
    rapItems,
    financialEntries,
    setActiveProjectId,
    setActivePTId
  } = useApp();

  const [isCompanySettingsOpen, setIsCompanySettingsOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  if (!currentProject) {
    const activePT = currentPT || pts[0];
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {activePT?.logoUrl ? (
                <img
                  src={activePT.logoUrl}
                  alt={activePT.code}
                  className="w-12 h-12 rounded-xl object-contain bg-slate-900 p-1 border border-slate-200 shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg">
                  <Building2 className="w-6 h-6" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-950">{activePT?.name || 'Perusahaan'}</h1>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-800 border border-amber-300">
                    {activePT?.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activePT?.address || (activePT?.npwp ? `NPWP: ${activePT.npwp}` : 'Entitas Terdaftar')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCompanySettingsOpen(true)}
                className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>Profil & Logo PT</span>
              </button>
              <button
                onClick={() => onOpenAddEntity?.('project')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Daftarkan Proyek Baru</span>
              </button>
            </div>
          </div>

          <div className="py-12 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3 text-amber-600">
              <Boxes className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base mb-1">
              Belum Ada Proyek Aktif untuk {activePT?.code}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Perusahaan ini belum memiliki proyek konstruksi yang terdaftar. Daftarkan proyek baru dengan nilai kontrak dan target margin laba untuk mulai memantau Kurva S, RAB, RAP, dan Keuangan.
            </p>
            <button
              onClick={() => onOpenAddEntity?.('project')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Daftarkan Proyek Pertama untuk {activePT?.code}</span>
            </button>
          </div>
        </div>

        {/* Modal mounts */}
        <CompanySettingsModal
          isOpen={isCompanySettingsOpen}
          onClose={() => setIsCompanySettingsOpen(false)}
          onOpenAddProject={() => onOpenAddEntity?.('project')}
          onOpenAddPT={() => onOpenAddEntity?.('pt')}
        />
      </div>
    );
  }

  // Find client info
  const clientData = clients.find(
    c => c.id === currentProject.clientId || c.name.toLowerCase() === currentProject.clientName.toLowerCase()
  );

  // Financial calculations
  const contractVal = currentProject.contractValue;
  const rapBudget = currentProject.totalRapBudget;
  const realizedCost = currentProject.totalCostRealized;
  const projectedProfit = contractVal - (realizedCost + (rapBudget - realizedCost) * 0.95);
  
  // Cost & Schedule Variance (EVM)
  const sv = currentProject.actualProgressPercent - currentProject.plannedProgressPercent;
  const costBurnPercent = rapBudget > 0 ? (realizedCost / rapBudget) * 100 : 0;
  
  // Warnings relevant to role
  const roleWarnings = warnings.filter(
    w => w.status === 'open' && (w.assignedRoles.includes(activeRole) || activeRole === 'direktur')
  );

  // Critical stock items for this project
  const criticalStocks = stockItems.filter(item => {
    const fieldStock = item.fieldStocks[currentProject.id] || 0;
    return fieldStock <= item.minFieldStock;
  });

  return (
    <div className="space-y-6">
      
      {/* Executive Project Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Project Details & Metadata */}
          <div className="flex items-start gap-4">
            {currentPT.logoUrl ? (
              <img
                src={currentPT.logoUrl}
                alt={currentPT.code}
                className="w-14 h-14 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200 shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-lg shrink-0 shadow-2xs">
                {currentPT.code.slice(0, 3)}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 mb-1">
                <span className="font-semibold text-slate-900">{currentPT.name}</span>
                <span className="text-slate-300">·</span>
                <span className="font-mono text-slate-600">Kode: {currentProject.code}</span>
                <span className="text-slate-300">·</span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                  Aktif Berjalan
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight truncate">
                {currentProject.name}
              </h1>

              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 mt-1.5">
                <span>Pemberi Tugas: <strong className="text-slate-800">{currentProject.clientName}</strong></span>
                <span className="text-slate-300">·</span>
                <span>Lokasi: {currentProject.location}</span>
                {clientData && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600 font-medium">Sektor {clientData.type}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Button Cluster */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            
            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition flex items-center gap-1.5 border border-slate-200"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Ekspor & Cetak</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-20 animate-in fade-in zoom-in-95 text-slate-800 text-xs">
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      triggerPrintReport();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 transition"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>Cetak PDF Ringkasan</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      exportComprehensiveExcel({
                        project: currentProject,
                        pt: currentPT,
                        rabItems: rabItems.filter(r => r.projectId === currentProject.id),
                        rapItems: rapItems.filter(r => r.projectId === currentProject.id),
                        stockItems,
                        wageRecords: wageRecords.filter(w => w.projectId === currentProject.id),
                        financialEntries: financialEntries.filter(f => f.projectId === currentProject.id)
                      });
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 transition text-emerald-700 font-medium"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Download Excel Lengkap</span>
                  </button>
                </div>
              )}
            </div>

            {/* New Project Primary CTA */}
            <button
              onClick={() => onOpenAddEntity?.('project')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>+ Proyek Baru</span>
            </button>
          </div>

        </div>
      </div>

      {/* Role Context Strip */}
      <div className="bg-slate-100/70 rounded-xl px-4 py-3 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
            {currentRoleInfo.title.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-slate-900">{currentRoleInfo.title}</span>
            <span className="text-slate-400 mx-1.5">·</span>
            <span className="text-slate-600">{currentRoleInfo.department}</span>
            <span className="text-slate-400 mx-1.5">·</span>
            <span className="font-mono text-slate-700">
              {currentRoleInfo.canApprove ? `Plafon Wewenang: ${formatRupiah(currentRoleInfo.approvalLimit)}` : 'Hanya Input/Draft'}
            </span>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {currentRoleInfo.quickActions?.slice(0, 3).map((qa, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (qa.actionId === 'config_limits') {
                  onOpenRoleLimitConfig?.();
                } else if (qa.actionId === 'open_mobile') {
                  onNavigateTab('progres');
                } else {
                  onNavigateTab(qa.targetTab);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200/60 text-slate-700 font-medium text-[11px] border border-slate-200 flex items-center gap-1 transition shadow-2xs"
            >
              <span>{qa.label}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Nilai Kontrak */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Nilai Kontrak Klien</div>
            <div className="text-xl font-bold text-slate-950 font-mono tracking-tight tabular-nums">
              {formatRupiah(contractVal)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Target Margin</span>
            <span className="font-semibold text-emerald-700">
              {currentProject.targetProfitPercent.toFixed(1)}% ({formatRupiah(Math.round((contractVal * currentProject.targetProfitPercent) / 100))})
            </span>
          </div>
        </div>

        {/* KPI 2: Progres Fisik vs Rencana */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Progres Fisik Lapangan</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-950 font-mono tabular-nums">
                {currentProject.actualProgressPercent.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Rencana: {currentProject.plannedProgressPercent.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Deviasi Jadwal</span>
            <span className={`font-semibold flex items-center gap-1 ${sv >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {sv >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{sv >= 0 ? `+${sv.toFixed(1)}% (Ahead)` : `${sv.toFixed(1)}% (Delay)`}</span>
            </span>
          </div>
        </div>

        {/* KPI 3: Realisasi Biaya Lapangan */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Realisasi Biaya Lapangan</div>
            <div className="text-xl font-bold text-slate-950 font-mono tracking-tight tabular-nums">
              {formatRupiah(realizedCost)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Serapan RAP</span>
            <span className="font-semibold text-slate-800">
              {costBurnPercent.toFixed(1)}% dari RAP
            </span>
          </div>
        </div>

        {/* KPI 4: Peringatan & Risiko */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Peringatan & Risiko</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-950 font-mono tabular-nums">
                {roleWarnings.length}
              </span>
              <span className="text-xs text-slate-500">isu butuh mitigasi</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Material Kritis</span>
            <span className="font-semibold text-amber-700">
              {criticalStocks.length} Stok Menipis
            </span>
          </div>
        </div>

      </div>

      {/* Main Monitoring & Risk Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Kurva S & Performance Barometer */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-bold text-slate-950 text-sm tracking-tight">
                Pemantauan Progres Fisik vs Serapan Anggaran (Kurva S Real-Time)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sinkronisasi harian volume fisik pekerjaan dan realisasi biaya RAP
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('progres')}
              className="text-xs font-semibold text-slate-900 hover:text-amber-600 flex items-center gap-1 transition"
            >
              <span>Detail Kurva S</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Indicators */}
          <div className="space-y-4">
            {/* Aktual */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Progres Fisik Aktual</span>
                <span className="font-mono font-bold text-slate-900">{currentProject.actualProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-slate-900 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${currentProject.actualProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Baseline */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Jadwal Rencana Baseline</span>
                <span className="font-mono font-bold text-slate-700">{currentProject.plannedProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-slate-400 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${currentProject.plannedProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Cost Burn */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Serapan Anggaran RAP (Cost Burn)</span>
                <span className="font-mono font-bold text-amber-700">{costBurnPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, costBurnPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* EVM Metric Indices */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-[11px] text-slate-500 font-medium">SPI (Schedule)</div>
              <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {(currentProject.actualProgressPercent / (currentProject.plannedProgressPercent || 1)).toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Indeks Waktu</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-[11px] text-slate-500 font-medium">CPI (Cost)</div>
              <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">
                {(currentProject.actualProgressPercent / (costBurnPercent || 1)).toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Efisiensi Biaya</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-[11px] text-slate-500 font-medium">Total Terbayar</div>
              <div className="text-xs font-bold font-mono text-slate-900 mt-1 truncate">
                {formatRupiah(realizedCost * 0.9)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Kas Keluar</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-[11px] text-slate-500 font-medium">Komitmen PO</div>
              <div className="text-xs font-bold font-mono text-amber-700 mt-1 truncate">
                {formatRupiah(realizedCost * 0.15)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">PO & SPK Berjalan</div>
            </div>
          </div>
        </div>

        {/* Right Col: Priority Action Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-950 text-sm">Peringatan Role Anda</h2>
              <p className="text-xs text-slate-500">{currentRoleInfo.title}</p>
            </div>
            <span className="text-[11px] font-mono font-semibold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full">
              {roleWarnings.length} Isu
            </span>
          </div>

          <div className="space-y-3">
            {roleWarnings.slice(0, 3).map((w) => (
              <div
                key={w.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 truncate pr-2">{w.title}</span>
                  <span className={`text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded ${
                    w.severity === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {w.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {w.message}
                </p>
                <button
                  onClick={() => onNavigateTab(w.actionModule as ActiveTab)}
                  className="text-xs font-semibold text-slate-900 hover:text-amber-600 flex items-center gap-1 pt-1 transition"
                >
                  <span>{w.actionLabel || 'Tindak Lanjuti'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}

            {roleWarnings.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                Tidak ada peringatan aktif untuk peran ini. Semua sistem nominal & berjalan normal.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modals */}
      <CompanySettingsModal
        isOpen={isCompanySettingsOpen}
        onClose={() => setIsCompanySettingsOpen(false)}
        onOpenAddProject={() => onOpenAddEntity?.('project')}
        onOpenAddPT={() => onOpenAddEntity?.('pt')}
      />

      <ClientManagementModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
      />
    </div>
  );
};
