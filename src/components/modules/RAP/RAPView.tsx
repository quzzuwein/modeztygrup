import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { formatRupiah, exportRAPToExcel, triggerPrintReport } from '../../../services/exportService';
import {
  Calculator,
  Percent,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Search,
  Sliders,
  DollarSign,
  Layers,
  Printer,
  Download,
  Sparkles,
  RefreshCw,
  X,
  FileSpreadsheet,
  Check
} from 'lucide-react';

export const RAPView: React.FC = () => {
  const {
    currentProject,
    rapItems,
    updateProjectTargetProfit,
    currentRoleInfo,
    activeRole,
    previewRAPMargin,
    generateRapFromRabWithTargetProfit
  } = useApp();

  const [marginInput, setMarginInput] = useState<number>(currentProject?.targetProfitPercent || 18);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [isPreviewMarginOpen, setIsPreviewMarginOpen] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  if (!currentProject) {
    return <div className="p-8 text-center text-slate-500">Pilih proyek terlebih dahulu.</div>;
  }

  const canViewFinancials = ['direktur', 'pm_teknik', 'pm_lapangan', 'estimator', 'admin_keuangan'].includes(activeRole);

  const projectRap = rapItems.filter(r => r.projectId === currentProject.id);
  const sections = Array.from(new Set(projectRap.map(r => r.section)));

  const filteredRap = projectRap.filter(item => {
    const matchSearch =
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.wbsCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSection = selectedSection === 'all' || item.section === selectedSection;
    return matchSearch && matchSection;
  });

  // Totals & Plafons
  const contractTotal = currentProject.contractValue;
  const targetProfitNominal = (contractTotal * marginInput) / 100;
  const allowableRapCeiling = contractTotal - targetProfitNominal;
  const calculatedTotalRap = projectRap.reduce((sum, item) => sum + item.rapTotalPrice, 0);
  const actualProjectedProfit = contractTotal - calculatedTotalRap;
  const actualProfitMargin = contractTotal > 0 ? (actualProjectedProfit / contractTotal) * 100 : 0;
  
  const isOverBudget = calculatedTotalRap > allowableRapCeiling;
  const isExceedingContract = calculatedTotalRap > contractTotal;

  const handleSaveMargin = () => {
    updateProjectTargetProfit(currentProject.id, marginInput);
    alert(`Target margin laba proyek berhasil diperbarui menjadi ${marginInput}%! Plafon RAP disesuaikan.`);
  };

  const handleGenerateRapFromTargetMargin = () => {
    if (!window.confirm(`Hitung ulang seluruh item RAP ${currentProject.name} berdasarkan target profit per item RAB? Realisasi biaya yang sudah berjalan akan tetap dipertahankan.`)) {
      return;
    }
    setIsRecalculating(true);
    setTimeout(() => {
      const result = generateRapFromRabWithTargetProfit(currentProject.id);
      setIsRecalculating(false);
      setIsPreviewMarginOpen(false);
      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message || 'Gagal menghitung RAP.');
      }
    }, 300);
  };

  // Preview data for modal
  const previewData = previewRAPMargin(currentProject.id);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
              <Calculator className="w-4 h-4" />
              <span>Modul Anggaran Internal & Profitabilitas</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">
              Rencana Anggaran Pelaksanaan (RAP) & Target Profit
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Turunan dari RAB & AHS PUPR: Rincian kebutuhan real belanja material, acuan upah borong/harian, dan margin laba perusahaan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canViewFinancials && (
              <>
                <button
                  onClick={() => setIsPreviewMarginOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                  title="Lihat Pratinjau Target Profit per Item (Batch 9.75)"
                >
                  <Percent className="w-3.5 h-3.5 text-amber-700" />
                  <span>Preview Target Margin</span>
                </button>

                <button
                  onClick={handleGenerateRapFromTargetMargin}
                  disabled={isRecalculating}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition shadow"
                  title="Hitung Ulang RAP dari Target Profit per Item RAB"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
                  <span>{isRecalculating ? 'Menghitung...' : 'Hitung Ulang RAP'}</span>
                </button>
              </>
            )}

            <button
              onClick={() => exportRAPToExcel(filteredRap, currentProject.name)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
              title="Download Data RAP ke Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel RAP</span>
            </button>

            <button
              onClick={() => triggerPrintReport()}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Cetak RAP ke PDF"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Cetak PDF</span>
            </button>

            {canViewFinancials && (
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Target Margin</div>
                  <div className="text-xs font-extrabold text-slate-900 font-mono flex items-center gap-1 justify-end">
                    <span className="text-emerald-600">{currentProject.targetProfitPercent.toFixed(1)}%</span>
                    <span className="text-slate-400 font-normal">({formatRupiah(currentProject.targetProfitNominal)})</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Validation Error Banner: RAP > Contract Value */}
        {isExceedingContract && canViewFinancials && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-extrabold">Validasi Kritis Gagal: Total RAP Melebihi Nilai Kontrak!</span>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Total RAP terkalkulasi ({formatRupiah(calculatedTotalRap)}) lebih besar daripada Nilai Kontrak ({formatRupiah(contractTotal)}). Proyek ini berisiko rugi sebelum pelaksanaan. Silakan sesuaikan target profit di RAB atau kurangi koefisien belanja AHS.
              </p>
            </div>
          </div>
        )}

        {/* Target Profit Interactive Simulator (Only visible to Authorized Financial Roles) */}
        {canViewFinancials ? (
          <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Simulasi Margin Laba Otomatis Proyek
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Ubah persentase target margin untuk menghitung batas maksimal belanja pelaksanaan (RAP Ceiling).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-inner">
                  <input
                    type="number"
                    min="5"
                    max="40"
                    step="0.5"
                    value={marginInput}
                    onChange={e => setMarginInput(parseFloat(e.target.value) || 0)}
                    className="w-16 text-center font-mono font-bold text-sm text-slate-900 focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>

                {currentRoleInfo.canApprove && (
                  <button
                    onClick={handleSaveMargin}
                    className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow"
                  >
                    Terapkan Target Laba
                  </button>
                )}
              </div>
            </div>

            {/* 4 Financial Gauge Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-amber-500/20">
              <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Nilai Kontrak Klien</span>
                <div className="text-xs font-extrabold font-mono text-slate-900 mt-0.5">
                  {formatRupiah(contractTotal)}
                </div>
              </div>

              <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Plafon Maksimal RAP</span>
                <div className="text-xs font-extrabold font-mono text-slate-900 mt-0.5">
                  {formatRupiah(allowableRapCeiling)}
                </div>
              </div>

              <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Total RAP Terkalkulasi</span>
                <div className="text-xs font-extrabold font-mono text-amber-700 mt-0.5">
                  {formatRupiah(calculatedTotalRap)}
                </div>
              </div>

              <div className={`p-2.5 rounded-lg border ${isOverBudget ? 'bg-rose-50 border-rose-300' : 'bg-emerald-50 border-emerald-300'}`}>
                <span className="text-[10px] font-semibold uppercase text-slate-600">Status Margin Laba</span>
                <div className={`text-xs font-extrabold font-mono mt-0.5 ${isOverBudget ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {actualProfitMargin.toFixed(1)}% ({formatRupiah(actualProjectedProfit)})
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs flex items-center gap-2 text-slate-600">
            <Lock className="w-4 h-4 text-slate-500" />
            <span>
              <strong>Kerahasiaan Anggaran:</strong> Rencana belanja plafon & persentase margin laba perusahaan diproteksi khusus Direksi & PM. Anda dapat melihat alokasi volume fisik material dan upah kerja di bawah.
            </span>
          </div>
        )}
      </div>

      {/* RAP Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari uraian atau WBS..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">Semua Bagian Pekerjaan</option>
              {sections.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table with Breakdown: Material, Upah, Overhead */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-14">WBS</th>
                <th className="p-3">Uraian Pekerjaan & AHS</th>
                <th className="p-3 text-right">Vol</th>
                <th className="p-3 text-center">Sat</th>
                {canViewFinancials ? (
                  <>
                    <th className="p-3 text-right">Harsat Kontrak</th>
                    <th className="p-3 text-right">Harsat RAP</th>
                    <th className="p-3 text-right text-blue-700">Angg. Material</th>
                    <th className="p-3 text-right text-emerald-700">Angg. Upah</th>
                    <th className="p-3 text-right">Total RAP</th>
                    <th className="p-3 text-right text-amber-700">Realisasi Saat Ini</th>
                    <th className="p-3 text-center">Target Profit</th>
                    <th className="p-3 text-right">Estimasi Laba</th>
                  </>
                ) : (
                  <>
                    <th className="p-3 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Alokasi Finansial</span>
                      </div>
                    </th>
                    <th className="p-3 text-center">Status Teknis</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRap.length === 0 ? (
                <tr>
                  <td colSpan={canViewFinancials ? 12 : 6} className="p-8 text-center text-slate-400">
                    Belum ada item RAP terhubung untuk proyek ini.
                  </td>
                </tr>
              ) : (
                filteredRap.map(item => {
                  const matTotal = item.budgetMaterialUnit * item.volume;
                  const upahTotal = item.budgetLaborUnit * item.volume;
                  const isExceeded = item.totalCostRealized > item.rapTotalPrice;
                  const targetProfit = item.targetProfitPercent ?? currentProject.defaultTargetProfitPercent ?? 25.0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-mono font-bold text-slate-600">{item.wbsCode}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{item.description}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono bg-slate-100 px-1 rounded">{item.ahsCode}</span>
                          <span>• {item.section}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono font-medium">{item.volume.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-center font-mono text-slate-500">{item.unit}</td>

                      {canViewFinancials ? (
                        <>
                          <td className="p-3 text-right font-mono text-slate-500">
                            {formatRupiah(item.contractUnitPrice)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-800">
                            {formatRupiah(item.rapUnitPrice)}
                          </td>
                          <td className="p-3 text-right font-mono text-blue-700">
                            {formatRupiah(matTotal)}
                          </td>
                          <td className="p-3 text-right font-mono text-emerald-700">
                            {formatRupiah(upahTotal)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            {formatRupiah(item.rapTotalPrice)}
                          </td>
                          <td className={`p-3 text-right font-mono font-bold ${isExceeded ? 'text-rose-600' : 'text-slate-700'}`}>
                            {formatRupiah(item.totalCostRealized)}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-amber-700">
                            <span className="bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                              {targetProfit}%
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono">
                            <span className="font-bold text-emerald-600">
                              {formatRupiah(item.projectedProfit)}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              {item.projectedProfitPercent.toFixed(1)}%
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3 text-center text-slate-400 font-mono text-[11px] italic">
                            *** (Dirahasiakan)
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Siap Kerja
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: PREVIEW TARGET MARGIN PER ITEM (PROKON BATCH 9.75) */}
      {isPreviewMarginOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wide">
                  <Percent className="w-4 h-4 text-amber-600" />
                  <span>PROKON Target Profit Per Item — Batch 9.75 (RAB → RAP)</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 mt-1">
                  Pratinjau Target Profit & Penurunan RAP: {currentProject.name}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Setiap item RAB memiliki target profit tersendiri (default {currentProject.defaultTargetProfitPercent ?? 25}% atau manual). RAP dihitung via formula: <code>RAP Target = RAB × (1 − Target Profit%)</code>.
                </p>
              </div>
              <button
                onClick={() => setIsPreviewMarginOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Summary Badges */}
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Total Nilai RAB Kontrak</span>
                <div className="text-base font-extrabold font-mono text-slate-900 mt-0.5">
                  {formatRupiah(previewData.rabTotal)}
                </div>
                <span className="text-[10px] text-slate-400">{previewData.items.length} Item Pekerjaan</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Total RAP Terkalkulasi</span>
                <div className="text-base font-extrabold font-mono text-blue-900 mt-0.5">
                  {formatRupiah(previewData.rapTotal)}
                </div>
                <span className="text-[10px] text-blue-600">Plafon Belanja Bersih</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Margin Proyek Bersih</span>
                <div className="text-base font-extrabold font-mono text-emerald-700 mt-0.5">
                  {formatRupiah(previewData.marginAmount)}
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">{previewData.marginPercent}% dari RAB</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Target Margin Agregat</span>
                <div className="text-base font-extrabold font-mono text-amber-800 mt-0.5">
                  {previewData.targetProfitAvgPercent}%
                </div>
                <div className="flex items-center gap-1.5 text-[9px] mt-0.5">
                  <span className="text-emerald-700 font-bold">{previewData.itemsAboveTarget} Di Atas</span>
                  <span>•</span>
                  <span className="text-blue-700 font-bold">{previewData.itemsAtTarget} Pas</span>
                  <span>•</span>
                  <span className="text-rose-700 font-bold">{previewData.itemsBelowTarget} Di Bawah</span>
                </div>
              </div>
            </div>

            {/* Drill-Down Table */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-14">WBS</th>
                      <th className="p-3">Uraian Pekerjaan</th>
                      <th className="p-3 text-right">Vol & Sat</th>
                      <th className="p-3 text-right">Harsat RAB</th>
                      <th className="p-3 text-right">Total RAB</th>
                      <th className="p-3 text-center">Target Profit</th>
                      <th className="p-3 text-right text-blue-700">RAP Target</th>
                      <th className="p-3 text-right text-emerald-700">Margin (Rp)</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.items.map(item => (
                      <tr key={item.rabItemId} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 font-mono font-bold text-slate-600">{item.code}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{item.name}</td>
                        <td className="p-2.5 text-right font-mono">
                          {item.volume.toLocaleString('id-ID')} <span className="text-slate-400">{item.unit}</span>
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-600">
                          {formatRupiah(item.rabUnitPrice)}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                          {formatRupiah(item.rabTotalPrice)}
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="inline-flex items-center gap-1">
                            <span className="font-mono font-bold text-amber-700">{item.targetProfitPercent}%</span>
                            <span className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                              item.source === 'MANUAL'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {item.source === 'MANUAL' ? 'Manual' : 'Default'}
                            </span>
                          </div>
                        </td>
                        <td className="p-2.5 text-right font-mono font-extrabold text-blue-700">
                          {formatRupiah(item.targetTotalCost)}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-600">
                          {formatRupiah(item.marginAmount)}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'SEHAT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'TERTEKAN'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Validasi: Total RAP ({formatRupiah(previewData.rapTotal)}) ≤ Total RAB ({formatRupiah(previewData.rabTotal)}). Margin aman.</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreviewMarginOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
                >
                  Tutup
                </button>
                <button
                  onClick={handleGenerateRapFromTargetMargin}
                  disabled={isRecalculating}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
                  <span>{isRecalculating ? 'Memproses...' : 'Terapkan & Generate RAP Sekarang'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
