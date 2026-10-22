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
  Download
} from 'lucide-react';

export const RAPView: React.FC = () => {
  const {
    currentProject,
    rapItems,
    updateProjectTargetProfit,
    currentRoleInfo
  } = useApp();

  const [marginInput, setMarginInput] = useState<number>(currentProject?.targetProfitPercent || 18);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  if (!currentProject) {
    return <div className="p-8 text-center text-slate-500">Pilih proyek terlebih dahulu.</div>;
  }

  const projectRap = rapItems.filter(r => r.projectId === currentProject.id);
  const sections = Array.from(new Set(projectRap.map(r => r.section)));

  const filteredRap = projectRap.filter(item => {
    const matchSearch =
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.wbsCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSection = selectedSection === 'all' || item.section === selectedSection;
    return matchSearch && matchSection;
  });

  // Totals
  const contractTotal = currentProject.contractValue;
  const targetProfitNominal = (contractTotal * marginInput) / 100;
  const allowableRapCeiling = contractTotal - targetProfitNominal;
  const calculatedTotalRap = projectRap.reduce((sum, item) => sum + item.rapTotalPrice, 0);
  const actualProjectedProfit = contractTotal - calculatedTotalRap;
  const actualProfitMargin = (actualProjectedProfit / contractTotal) * 100;
  
  const isOverBudget = calculatedTotalRap > allowableRapCeiling;
  const marginDelta = actualProfitMargin - marginInput;

  const handleSaveMargin = () => {
    updateProjectTargetProfit(currentProject.id, marginInput);
    alert(`Target margin laba proyek berhasil diperbarui menjadi ${marginInput}%! Plafon RAP disesuaikan.`);
  };

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

            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Target Margin</div>
                <div className="text-xs font-extrabold text-slate-900 font-mono flex items-center gap-1 justify-end">
                  <span className="text-emerald-600">{currentProject.targetProfitPercent.toFixed(1)}%</span>
                  <span className="text-slate-400 font-normal">({formatRupiah(currentProject.targetProfitNominal)})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Target Profit Interactive Simulator */}
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
                <th className="p-3 text-right">Harsat Kontrak</th>
                <th className="p-3 text-right">Harsat RAP</th>
                <th className="p-3 text-right text-blue-700">Angg. Material</th>
                <th className="p-3 text-right text-emerald-700">Angg. Upah</th>
                <th className="p-3 text-right">Total RAP</th>
                <th className="p-3 text-right text-amber-700">Realisasi Saat Ini</th>
                <th className="p-3 text-right">Estimasi Laba</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRap.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-400">
                    Belum ada item RAP terhubung untuk proyek ini.
                  </td>
                </tr>
              ) : (
                filteredRap.map(item => {
                  const matTotal = item.budgetMaterialUnit * item.volume;
                  const upahTotal = item.budgetLaborUnit * item.volume;
                  const isExceeded = item.totalCostRealized > item.rapTotalPrice;

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
                      <td className="p-3 text-right font-mono">
                        <span className="font-bold text-emerald-600">
                          {formatRupiah(item.projectedProfit)}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {item.projectedProfitPercent.toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
