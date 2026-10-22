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
  DollarSign,
  FileSpreadsheet,
  PlusCircle,
  Truck,
  Printer,
  Download,
  Plus,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { CompanySettingsModal } from '../../common/CompanySettingsModal';
import { ClientManagementModal } from '../../common/ClientManagementModal';

interface DashboardViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenAddEntity?: (mode: 'pt' | 'project') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab, onOpenAddEntity }) => {
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

  if (!currentProject || !currentPT) {
    return <div className="p-8 text-center text-slate-500">Pilih proyek untuk melihat dashboard.</div>;
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
  const projectedProfitMargin = (projectedProfit / contractVal) * 100;
  
  // Cost & Schedule Variance (EVM / Manajemen Konstruksi)
  const sv = currentProject.actualProgressPercent - currentProject.plannedProgressPercent; // Schedule variance (%)
  const costBurnPercent = (realizedCost / rapBudget) * 100;
  
  // Warnings relevant to role
  const roleWarnings = warnings.filter(
    w => w.status === 'open' && (w.assignedRoles.includes(activeRole) || activeRole === 'direktur')
  );

  // Critical stock items for this project
  const criticalStocks = stockItems.filter(item => {
    const fieldStock = item.fieldStocks[currentProject.id] || 0;
    return fieldStock <= item.minFieldStock;
  });

  // Pending SPBs
  const pendingSPB = materialRequests.filter(s => s.status === 'diajukan' || s.status === 'diproses_gudang');
  // Pending wage payments
  const pendingWages = wageRecords.filter(w => w.status === 'siap_bayar' || w.status === 'diverifikasi_sm');

  return (
    <div className="space-y-6">
      {/* Top Welcome & Context Banner with Company Logo & Client Badge */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 border border-slate-700 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* PT Logo */}
            {currentPT.logoUrl ? (
              <img
                src={currentPT.logoUrl}
                alt={currentPT.code}
                className="w-14 h-14 rounded-xl object-contain bg-slate-950 p-1 border border-slate-700 shadow shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shrink-0">
                {currentPT.code.slice(0, 3)}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {currentPT.name} ({currentPT.code})
                </span>
                <span className="text-xs text-slate-400 font-mono">Kode: {currentProject.code}</span>
                {currentProject.shortCode && (
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                    {currentProject.shortCode}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-extrabold text-white mt-1">
                {currentProject.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-0.5">
                <span>Pemberi Tugas (Klien):</span>
                <span className="font-semibold text-white">{currentProject.clientName}</span>
                {clientData && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase font-bold">
                    {clientData.type}
                  </span>
                )}
                <span>•</span>
                <span>Lokasi: {currentProject.location}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCompanySettingsOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center gap-1.5 border border-slate-700"
              title="Kelola Logo dan Profil PT"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Logo PT</span>
            </button>
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center gap-1.5 border border-slate-700"
              title="Kelola Database Klien"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Data Klien</span>
            </button>
            <button
              onClick={() => onOpenAddEntity?.('project')}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Proyek Baru</span>
            </button>
            <button
              onClick={() => onOpenAddEntity?.('pt')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs transition flex items-center gap-1.5 border border-amber-500/30"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>+ PT Baru</span>
            </button>
            <button
              onClick={() => triggerPrintReport()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition flex items-center gap-1.5 border border-slate-700"
              title="Cetak Ringkasan Eksekutif (PDF)"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Cetak PDF</span>
            </button>
            <button
              onClick={() => {
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
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow"
              title="Download Seluruh Data Proyek ke Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Nilai Kontrak & Target Profit */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Nilai Kontrak Klien</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg font-extrabold text-slate-900 mt-1">
            {formatRupiah(contractVal)}
          </div>
          <div className="mt-2 text-xs flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-slate-500">Target Margin:</span>
            <span className="font-bold text-emerald-600">
              {currentProject.targetProfitPercent.toFixed(1)}% ({formatRupiah(currentProject.targetProfitNominal)})
            </span>
          </div>
        </div>

        {/* KPI 2: Progres Fisik vs Rencana (Schedule Variance) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Progres Fisik Aktual</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <LineChart className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {currentProject.actualProgressPercent.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400">
              Rencana: {currentProject.plannedProgressPercent.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-slate-500">Deviasi Jadwal:</span>
            <span
              className={`font-bold flex items-center gap-0.5 ${
                sv >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {sv >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {sv >= 0 ? `+${sv.toFixed(1)}% (Ahead)` : `${sv.toFixed(1)}% (Delay)`}
            </span>
          </div>
        </div>

        {/* KPI 3: Serapan Biaya RAP vs Realisasi */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Realisasi Biaya Lapangan</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg font-extrabold text-slate-900 mt-1">
            {formatRupiah(realizedCost)}
          </div>
          <div className="mt-2 text-xs flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-slate-500">Serapan RAP:</span>
            <span className="font-bold text-slate-800">
              {costBurnPercent.toFixed(1)}% dari RAP {formatRupiah(rapBudget)}
            </span>
          </div>
        </div>

        {/* KPI 4: Warning & Alert Aktif */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Peringatan Berisiko</span>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-rose-600 font-mono">
              {roleWarnings.length}
            </span>
            <span className="text-xs text-slate-500">isu butuh tindakan</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-slate-500">Stok Kritis:</span>
            <span className="font-bold text-amber-700">{criticalStocks.length} Material Menipis</span>
          </div>
        </div>
      </div>

      {/* Role-Specific Executive / Operational Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Kurva S & Progress S-Curve Visualization Preview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">
                Pemantauan Progres Fisik vs Serapan Anggaran (Kurva S Real-Time)
              </h2>
              <p className="text-xs text-slate-500">
                Sinkronisasi harian antara volume fisik di lapangan dan serapan biaya RAP
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('progres')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>Detail Kurva S</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Visual Kurva S Sederhana & Barometer */}
          <div className="space-y-4 pt-1">
            {/* Progress Bar: Rencana vs Aktual */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Progres Fisik Aktual</span>
                <span className="font-bold text-emerald-700">{currentProject.actualProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${currentProject.actualProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Jadwal Rencana Baseline</span>
                <span className="font-bold text-blue-700">{currentProject.plannedProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${currentProject.plannedProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Serapan Anggaran RAP (Cost Burn)</span>
                <span className="font-bold text-amber-700">{costBurnPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, costBurnPercent)}%` }}
                />
              </div>
            </div>

            {/* EVM Indicator Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Schedule Performance (SPI)</div>
                <div className={`text-base font-bold font-mono ${sv >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {(currentProject.actualProgressPercent / currentProject.plannedProgressPercent).toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400">{sv >= 0 ? 'Tepat Waktu' : 'Terlambat'}</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Cost Performance (CPI)</div>
                <div className="text-base font-bold font-mono text-emerald-600">
                  {((currentProject.actualProgressPercent / 100 * contractVal) / realizedCost).toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400">Efisien (Laba Aman)</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Kas Keluar (Paid)</div>
                <div className="text-xs font-bold font-mono text-slate-800 mt-1">
                  {formatRupiah(currentProject.totalPaidOut)}
                </div>
                <div className="text-[10px] text-slate-400">Total Pengeluaran</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Komitmen Belum Bayar</div>
                <div className="text-xs font-bold font-mono text-amber-700 mt-1">
                  {formatRupiah(currentProject.unpaidCommitments)}
                </div>
                <div className="text-[10px] text-slate-400">PO & SPK Berjalan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Role Alerts & Action Needed */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Peringatan Role Anda</span>
              </h2>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                {currentRoleInfo.title}
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {roleWarnings.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                  Tidak ada warning pending untuk role Anda.
                </div>
              ) : (
                roleWarnings.slice(0, 3).map(w => (
                  <div
                    key={w.id}
                    className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{w.title}</span>
                      <span className="text-[10px] text-amber-800 uppercase font-semibold">{w.severity}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-2">{w.message}</p>
                    <button
                      onClick={() => onNavigateTab(w.actionModule as ActiveTab)}
                      className="text-amber-800 hover:text-amber-900 font-bold text-[11px] flex items-center gap-1 pt-1"
                    >
                      <span>{w.actionLabel}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Operational Tasks */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase">
              Operasional Tertunda
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-500" />
                <span>SPB Material Menunggu Gudang:</span>
              </span>
              <span className="font-bold font-mono text-slate-900">{pendingSPB.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span>Klaim Upah Mandor Belum Bayar:</span>
              </span>
              <span className="font-bold font-mono text-amber-700">{pendingWages.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-PT Portfolio Overview (Especially for Direktur & Cross-PT roles) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-3">
          <div>
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Ringkasan Konsolidasi Seluruh Proyek & Multi-PT</span>
            </h2>
            <p className="text-xs text-slate-500">
              Portofolio aktif holding: pemantauan nilai kontrak, deviasi biaya, dan margin laba
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAddEntity?.('pt')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>+ Tambah PT</span>
            </button>
            <button
              onClick={() => onOpenAddEntity?.('project')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Daftarkan Proyek Baru</span>
            </button>
            <span className="text-xs text-slate-400 font-medium ml-2 hidden sm:inline">
              ({projects.length} Proyek)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-3">Kode & Proyek</th>
                <th className="p-3">Entitas PT & Logo</th>
                <th className="p-3">Pemberi Tugas (Klien)</th>
                <th className="p-3 text-right">Nilai Kontrak</th>
                <th className="p-3 text-right">Target Margin</th>
                <th className="p-3 text-center">Fisik vs Rencana</th>
                <th className="p-3 text-right">Realisasi Biaya</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map(proj => {
                const pt = pts.find(p => p.id === proj.ptId) || currentPT;
                const dev = proj.actualProgressPercent - proj.plannedProgressPercent;
                const client = clients.find(c => c.id === proj.clientId || c.name === proj.clientName);

                return (
                  <tr key={proj.id} className={`hover:bg-slate-50/70 transition ${currentProject.id === proj.id ? 'bg-amber-50/30 font-medium' : ''}`}>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{proj.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{proj.code} • {proj.location}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {pt.logoUrl ? (
                          <img
                            src={pt.logoUrl}
                            alt={pt.code}
                            className="w-6 h-6 rounded object-contain bg-slate-900 p-0.5 border border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {pt.code.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-800">{pt.code}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[100px]">{pt.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{proj.clientName}</div>
                      {client && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase font-bold">
                          {client.type}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(proj.contractValue)}
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-bold text-emerald-600 font-mono">
                        {proj.targetProfitPercent.toFixed(1)}%
                      </span>
                      <div className="text-[10px] text-slate-400">{formatRupiah(proj.targetProfitNominal)}</div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="font-bold font-mono">
                        {proj.actualProgressPercent}% <span className="text-slate-400">/ {proj.plannedProgressPercent}%</span>
                      </div>
                      <span className={`text-[10px] font-bold ${dev >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {dev >= 0 ? `+${dev.toFixed(1)}%` : `${dev.toFixed(1)}%`}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-700">
                      {formatRupiah(proj.totalCostRealized)}
                    </td>
                    <td className="p-3 text-center">
                      {currentProject.id === proj.id ? (
                        <span className="px-2 py-1 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-lg">
                          Aktif
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveProjectId(proj.id);
                            setActivePTId(proj.ptId);
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 mx-auto"
                        >
                          <span>Buka</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company Settings Modal */}
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
    </div>
  );
};
