import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { parseExcelWorkbook, generateRABExcelTemplate, matchAHS, WorkbookParseResult, SheetParseResult } from '../../../services/aiRabParser';
import { formatRupiah, exportRABToExcel, triggerPrintReport } from '../../../services/exportService';
import { RABItem } from '../../../types';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  Plus,
  Check,
  X,
  Printer,
  Sliders,
  DollarSign,
  Lock,
  Edit2,
  Percent
} from 'lucide-react';

export const RABView: React.FC = () => {
  const {
    currentProject,
    currentPT,
    rabItems,
    masterAhs,
    importRABItems,
    updateRABItemStatus,
    mapRABtoAHS,
    currentRoleInfo,
    activeRole,
    updateRabItemTargetProfit
  } = useApp();

  const [activeTab, setActiveTab] = useState<'daftar' | 'import'>('daftar');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [workbookResult, setWorkbookResult] = useState<WorkbookParseResult | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('ALL');
  const [includeZeroPrice, setIncludeZeroPrice] = useState<boolean>(true);
  const [isParsing, setIsParsing] = useState(false);
  const [mappingModalItem, setMappingModalItem] = useState<RABItem | null>(null);

  // Target Profit per item edit modal state
  const [profitEditItem, setProfitEditItem] = useState<{
    item: RABItem;
    profitPercent: number;
    useDefault: boolean;
  } | null>(null);

  const canViewFinancials = ['direktur', 'pm_teknik', 'pm_lapangan', 'estimator', 'admin_keuangan'].includes(activeRole);

  if (!currentProject) {
    return <div className="p-8 text-center text-slate-500">Pilih proyek terlebih dahulu.</div>;
  }

  const projectRabItems = rabItems.filter(r => r.projectId === currentProject.id);

  // Filter sections
  const sections = Array.from(new Set(projectRabItems.map(r => r.section)));

  const filteredItems = projectRabItems.filter(item => {
    const matchSearch =
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.wbsCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSection = selectedSection === 'all' || item.section === selectedSection;
    return matchSearch && matchSection;
  });

  const totalRABValue = projectRabItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const mappedCount = projectRabItems.filter(r => r.hasAhsMapped).length;

  const defaultProfit = currentProject.defaultTargetProfitPercent ?? 25.0;
  const totalRabTargetCost = projectRabItems.reduce((sum, item) => {
    const profit = item.targetProfitPercent != null ? item.targetProfitPercent : defaultProfit;
    return sum + item.totalPrice * (1 - profit / 100);
  }, 0);
  const totalProjectedMargin = totalRABValue - totalRabTargetCost;
  const avgMarginPercent = totalRABValue > 0 ? (totalProjectedMargin / totalRABValue) * 100 : defaultProfit;

  // Active sheet data helper
  const currentSheetData: SheetParseResult | null = workbookResult
    ? selectedSheet === 'ALL'
      ? workbookResult.combinedResult
      : workbookResult.sheets[selectedSheet] || workbookResult.combinedResult
    : null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const result = parseExcelWorkbook(buffer, file.name, masterAhs);
        setWorkbookResult(result);
        setSelectedSheet('ALL');
        setActiveTab('import');
      } catch (err) {
        console.error('Excel parse error', err);
        alert('Gagal memproses file Excel: Pastikan format .xlsx atau .csv valid.');
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleApplyImport = () => {
    if (!currentSheetData || !workbookResult) return;

    const sourceRows = currentSheetData.rows;
    const itemsToImport: Omit<RABItem, 'id'>[] = sourceRows
      .filter(r => includeZeroPrice ? r.volume > 0 || r.totalPrice > 0 : r.errors.length === 0)
      .map(r => ({
        projectId: currentProject.id,
        wbsCode: r.wbsCode,
        section: r.sheetName ? `[${r.sheetName}] ${r.section}` : r.section,
        description: r.description,
        volume: r.volume > 0 ? r.volume : 1,
        unit: r.unit || 'ls',
        unitPrice: r.unitPrice,
        totalPrice: r.totalPrice,
        ahsCode: r.suggestedAhsCode,
        hasAhsMapped: Boolean(r.suggestedAhsCode),
        status: 'draft',
        notes: `Import Excel (${r.sheetName || workbookResult.fileName})`
      }));

    if (itemsToImport.length === 0) {
      alert('Tidak ada baris valid untuk diimpor. Periksa data pada sheet terpilih.');
      return;
    }

    importRABItems(itemsToImport);
    setWorkbookResult(null);
    setActiveTab('daftar');
  };

  const handleLoadSampleClientRAB = () => {
    const sampleItems: Omit<RABItem, 'id'>[] = [
      {
        projectId: currentProject.id,
        wbsCode: 'I.1',
        section: 'I. PEKERJAAN STRUKTUR BAWAH',
        description: 'Galian Tanah & Pondasi Batu Belah 1:4',
        volume: 240,
        unit: 'm3',
        unitPrice: 1150000,
        totalPrice: 276000000,
        ahsCode: 'A.4.1.1.25',
        hasAhsMapped: true,
        status: 'disetujui'
      },
      {
        projectId: currentProject.id,
        wbsCode: 'I.2',
        section: 'I. PEKERJAAN STRUKTUR BAWAH',
        description: 'Pengecoran Beton Pile Cap Mutu K-250',
        volume: 385,
        unit: 'm3',
        unitPrice: 2150000,
        totalPrice: 827750000,
        ahsCode: 'A.4.1.1.25',
        hasAhsMapped: true,
        status: 'disetujui'
      },
      {
        projectId: currentProject.id,
        wbsCode: 'I.3',
        section: 'I. PEKERJAAN STRUKTUR BAWAH',
        description: 'Pembesian Besi Ulir BJTD-40 Pondasi & Tie Beam',
        volume: 48500,
        unit: 'kg',
        unitPrice: 24500,
        totalPrice: 1188250000,
        ahsCode: 'A.4.1.1.17',
        hasAhsMapped: true,
        status: 'disetujui'
      },
      {
        projectId: currentProject.id,
        wbsCode: 'II.1',
        section: 'II. PEKERJAAN STRUKTUR ATAS',
        description: 'Pengecoran Beton Kolom & Balok Lt. 1 s/d Lt. 5 Mutu K-250',
        volume: 1420,
        unit: 'm3',
        unitPrice: 2180000,
        totalPrice: 3095600000,
        ahsCode: 'A.4.1.1.25',
        hasAhsMapped: true,
        status: 'disetujui'
      },
      {
        projectId: currentProject.id,
        wbsCode: 'II.2',
        section: 'II. PEKERJAAN STRUKTUR ATAS',
        description: 'Pekerjaan Pembesian Balok, Kolom, & Plat Lantai BJTD-40',
        volume: 182000,
        unit: 'kg',
        unitPrice: 24500,
        totalPrice: 4459000000,
        ahsCode: 'A.4.1.1.17',
        hasAhsMapped: true,
        status: 'disetujui'
      },
      {
        projectId: currentProject.id,
        wbsCode: 'II.3',
        section: 'II. PEKERJAAN STRUKTUR ATAS',
        description: 'Bekisting Balok & Plat Lantai Multiplek 12mm & Scaffolding',
        volume: 5800,
        unit: 'm2',
        unitPrice: 395000,
        totalPrice: 2291000000,
        ahsCode: 'A.4.1.1.21',
        hasAhsMapped: true,
        status: 'disetujui'
      },
      {
        projectId: currentProject.id,
        wbsCode: 'III.1',
        section: 'III. PEKERJAAN ARSITEKTUR & PASANGAN',
        description: 'Pasangan Dinding Bata Ringan Hebel t = 10 cm Mortar Instan',
        volume: 6400,
        unit: 'm2',
        unitPrice: 165000,
        totalPrice: 1056000000,
        ahsCode: 'A.4.4.1.9',
        hasAhsMapped: true,
        status: 'disetujui'
      },
      {
        projectId: currentProject.id,
        wbsCode: 'III.2',
        section: 'III. PEKERJAAN ARSITEKTUR & PASANGAN',
        description: 'Plesteran + Acian Dinding Mortar Instan',
        volume: 12800,
        unit: 'm2',
        unitPrice: 135000,
        totalPrice: 1728000000,
        ahsCode: 'A.4.4.2.4',
        hasAhsMapped: true,
        status: 'disetujui'
      },
      {
        projectId: currentProject.id,
        wbsCode: 'III.3',
        section: 'III. PEKERJAAN ARSITEKTUR & PASANGAN',
        description: 'Pengecatan Dinding Interior Acrylic Emulsion (2 Lapis)',
        volume: 11500,
        unit: 'm2',
        unitPrice: 55000,
        totalPrice: 632500000,
        ahsCode: 'A.4.7.1.10',
        hasAhsMapped: true,
        status: 'disetujui'
      }
    ];

    importRABItems(sampleItems);
    alert('Sampel RAB Tender Klien berhasil dimuat dengan analisa otomatis!');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Modul Teknik & Estimasi</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">
              RAB Kontrak & Import Excel AI
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola Rencana Anggaran Biaya, import file Excel dari klien/estimator, dan petakan ke Master AHS PUPR.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportRABToExcel(projectRabItems, currentProject.name)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
              title="Download Data RAB Kontrak ke Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel RAB</span>
            </button>

            <button
              onClick={() => triggerPrintReport()}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Cetak RAB ke PDF"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Cetak PDF</span>
            </button>

            <button
              onClick={() => generateRABExcelTemplate()}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>Unduh Template</span>
            </button>

            <button
              onClick={handleLoadSampleClientRAB}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Muat Sampel</span>
            </button>

            <label className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow transition">
              <Upload className="w-3.5 h-3.5" />
              <span>{isParsing ? 'Membaca Excel...' : 'Upload Excel (.xlsx)'}</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isParsing}
              />
            </label>
          </div>
        </div>

        {/* Summary Badges with Confidentiality Check */}
        {canViewFinancials ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">Total Nilai RAB Kontrak</span>
              <div className="text-base font-extrabold font-mono text-slate-900 mt-0.5">
                {formatRupiah(totalRABValue)}
              </div>
              <span className="text-[10px] text-slate-400">Pagu Kontrak Bersih</span>
            </div>

            <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200">
              <span className="text-[11px] text-emerald-800 font-medium">Target Profit Agregat</span>
              <div className="text-base font-extrabold font-mono text-emerald-700 mt-0.5 flex items-center gap-1.5">
                <span>{avgMarginPercent.toFixed(1)}%</span>
                <span className="text-xs text-slate-500 font-normal">({formatRupiah(totalProjectedMargin)})</span>
              </div>
              <span className="text-[10px] text-emerald-700">Rata-rata Margin per Item</span>
            </div>

            <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200">
              <span className="text-[11px] text-blue-800 font-medium">Plafon Target RAP</span>
              <div className="text-base font-extrabold font-mono text-blue-800 mt-0.5">
                {formatRupiah(totalRabTargetCost)}
              </div>
              <span className="text-[10px] text-blue-600">Maks. Real Belanja</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">Terhubung AHS PUPR</span>
              <div className="text-base font-extrabold font-mono text-amber-600 mt-0.5 flex items-center gap-1">
                <span>{mappedCount}</span>
                <span className="text-xs text-slate-400">/ {projectRabItems.length} ({projectRabItems.length > 0 ? Math.round((mappedCount / projectRabItems.length) * 100) : 0}%)</span>
              </div>
              <span className="text-[10px] text-slate-400">Standar Permen PUPR</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">Item Pekerjaan Lapangan</span>
              <div className="text-base font-extrabold font-mono text-slate-900 mt-0.5">
                {projectRabItems.length} Item
              </div>
              <span className="text-[10px] text-slate-400">Total WBS Terdaftar</span>
            </div>

            <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200">
              <span className="text-[11px] text-emerald-800 font-medium">Terhubung Standar AHS</span>
              <div className="text-base font-extrabold font-mono text-emerald-700 mt-0.5">
                {mappedCount} Item ({projectRabItems.length > 0 ? Math.round((mappedCount / projectRabItems.length) * 100) : 0}%)
              </div>
              <span className="text-[10px] text-emerald-700">Acuan Koefisien Bahan</span>
            </div>

            <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200">
              <span className="text-[11px] text-amber-800 font-medium">Belum Dipetakan AHS</span>
              <div className="text-base font-extrabold font-mono text-amber-700 mt-0.5">
                {projectRabItems.length - mappedCount} Item
              </div>
              <span className="text-[10px] text-amber-700">Perlu Mapping Teknik</span>
            </div>

            <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-400" />
              <div>
                <span className="text-[11px] font-bold text-slate-700">Keuangan Rahasia</span>
                <div className="text-[10px] text-slate-500">Nilai kontrak & margin diproteksi khusus Direksi & PM</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('daftar')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'daftar'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Daftar Item RAB ({projectRabItems.length})
        </button>

        {workbookResult && (
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              Hasil Pratinjau Excel ({currentSheetData?.validRows || 0} valid dari {workbookResult.sheetNames.length} Sheet)
            </span>
          </button>
        )}
      </div>

      {/* TAB 1: DAFTAR RAB TABLE */}
      {activeTab === 'daftar' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-4">
          {/* Filters & Search */}
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

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="p-3 w-14">No/WBS</th>
                  <th className="p-3">Uraian Pekerjaan & Bagian</th>
                  <th className="p-3 text-right">Volume</th>
                  <th className="p-3 text-center">Satuan</th>
                  {canViewFinancials ? (
                    <>
                      <th className="p-3 text-right">Harsat RAB (Rp)</th>
                      <th className="p-3 text-right">Total RAB (Rp)</th>
                      <th className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span>Target Profit</span>
                          <Percent className="w-3 h-3 text-amber-600" />
                        </div>
                      </th>
                      <th className="p-3 text-right text-blue-700">RAP Target (Rp)</th>
                    </>
                  ) : (
                    <th className="p-3 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Nilai Finansial</span>
                      </div>
                    </th>
                  )}
                  <th className="p-3">Analisa AHS PUPR</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={canViewFinancials ? 11 : 8} className="p-8 text-center text-slate-400">
                      Tidak ada item RAB yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => {
                    const defaultProfit = currentProject.defaultTargetProfitPercent ?? 25.0;
                    const effectiveProfit = item.targetProfitPercent != null ? item.targetProfitPercent : defaultProfit;
                    const isManual = item.targetProfitPercent != null;
                    const rapTargetPrice = Math.round(item.totalPrice * (1 - effectiveProfit / 100));

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3 font-mono font-bold text-slate-600">{item.wbsCode}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{item.description}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-tight">{item.section}</div>
                        </td>
                        <td className="p-3 text-right font-mono font-medium">{item.volume.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-center font-mono text-slate-500">{item.unit}</td>
                        {canViewFinancials ? (
                          <>
                            <td className="p-3 text-right font-mono">{formatRupiah(item.unitPrice)}</td>
                            <td className="p-3 text-right font-mono font-bold text-slate-900">
                              {formatRupiah(item.totalPrice)}
                            </td>
                            <td className="p-3 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <span className={`font-mono font-bold text-xs ${isManual ? 'text-amber-700' : 'text-slate-700'}`}>
                                  {effectiveProfit}%
                                </span>
                                <span
                                  className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                                    isManual
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                  title={isManual ? 'Target profit khusus item ini' : `Mengikuti default proyek (${defaultProfit}%)`}
                                >
                                  {isManual ? 'Manual' : 'Default'}
                                </span>
                                <button
                                  onClick={() =>
                                    setProfitEditItem({
                                      item,
                                      profitPercent: effectiveProfit,
                                      useDefault: !isManual
                                    })
                                  }
                                  className="text-slate-400 hover:text-amber-600 p-0.5 rounded transition"
                                  title="Ubah Target Profit Item"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-blue-700">
                              {formatRupiah(rapTargetPrice)}
                            </td>
                          </>
                        ) : (
                          <td className="p-3 text-center font-mono text-slate-400 text-[11px] italic">
                            *** (Dirahasiakan)
                          </td>
                        )}
                        <td className="p-3">
                          {item.hasAhsMapped && item.ahsCode ? (
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                                {item.ahsCode}
                              </span>
                              <button
                                onClick={() => setMappingModalItem(item)}
                                className="text-[10px] text-slate-400 hover:text-amber-600 underline"
                                title="Ganti AHS"
                              >
                                Ubah
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setMappingModalItem(item)}
                              className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-semibold flex items-center gap-1 transition"
                            >
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              <span>Hubungkan AHS</span>
                            </button>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.status === 'disetujui'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'diperiksa'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {currentRoleInfo.canApprove && item.status !== 'disetujui' && (
                            <button
                              onClick={() => updateRABItemStatus(item.id, 'disetujui')}
                              className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                              title="Setujui Item RAB"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PRATINJAU IMPORT EXCEL AI (MULTI-SHEET) */}
      {activeTab === 'import' && workbookResult && currentSheetData && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Hasil Analisa File Excel: <span className="font-mono text-amber-700">{workbookResult.fileName}</span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Terdeteksi {workbookResult.sheetNames.length} Sheet di dalam file Excel. Anda dapat memilih sheet tertentu atau langsung menggabungkan seluruh sheet ke RAB proyek.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setWorkbookResult(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleApplyImport}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
              >
                <Check className="w-4 h-4" />
                <span>
                  Simpan ke RAB Proyek ({includeZeroPrice ? currentSheetData.rows.length : currentSheetData.validRows} Baris)
                </span>
              </button>
            </div>
          </div>

          {/* Sheet Selector Bar */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Pilih Sheet Excel yang Ingin Ditampilkan / Diimpor:</span>
              </span>

              <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeZeroPrice}
                  onChange={e => setIncludeZeroPrice(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                />
                <span className="font-semibold text-slate-800">
                  Sertakan baris tanpa harga / Rp 0 (dapat dihubungkan ke AHS nanti)
                </span>
              </label>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedSheet('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedSheet === 'ALL'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>SEMUA SHEET (GABUNGKAN)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedSheet === 'ALL' ? 'bg-slate-950 text-amber-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {workbookResult.combinedResult.rows.length} Baris
                </span>
              </button>

              {workbookResult.sheetNames.map((name, i) => {
                const sheetData = workbookResult.sheets[name];
                const count = sheetData?.rows.length || 0;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedSheet(name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                      selectedSheet === name
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      selectedSheet === name ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Validation Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              <span className="text-[10px] text-emerald-700 font-bold uppercase">Baris Terdeteksi</span>
              <div className="text-base font-extrabold text-emerald-900 font-mono">
                {currentSheetData.validRows} / {currentSheetData.totalRows} Baris
              </div>
              <span className="text-[10px] text-emerald-700">
                {selectedSheet === 'ALL' ? 'Seluruh sheet Excel' : `Sheet: ${selectedSheet}`}
              </span>
            </div>

            <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              <span className="text-[10px] text-amber-700 font-bold uppercase">Terdeteksi AHS Otomatis</span>
              <div className="text-base font-extrabold text-amber-900 font-mono">
                {currentSheetData.rows.filter(r => r.suggestedAhsCode).length} Item
              </div>
              <span className="text-[10px] text-amber-700">Dicocokkan ke Permen PUPR</span>
            </div>

            <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 col-span-2">
              <span className="text-[10px] text-blue-700 font-bold uppercase">Total Nilai Perhitungan</span>
              <div className="text-base font-extrabold text-blue-900 font-mono">
                {formatRupiah(currentSheetData.calculatedGrandTotal)}
              </div>
              <span className="text-[10px] text-blue-700">Kalkulasi harga satuan × volume</span>
            </div>
          </div>

          {/* Preview Rows Table */}
          <div className="overflow-x-auto max-h-[480px] border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                <tr>
                  <th className="p-2.5">WBS</th>
                  {selectedSheet === 'ALL' && <th className="p-2.5">Sheet Asal</th>}
                  <th className="p-2.5">Uraian Pekerjaan & Kategori</th>
                  <th className="p-2.5 text-right">Volume</th>
                  <th className="p-2.5 text-center">Satuan</th>
                  <th className="p-2.5 text-right">Harga Satuan (Rp)</th>
                  <th className="p-2.5 text-right">Total (Rp)</th>
                  <th className="p-2.5">Saran AHS PUPR</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentSheetData.rows.map((r, idx) => (
                  <tr key={idx} className={r.errors.length > 0 && !includeZeroPrice ? 'bg-rose-50/60' : 'hover:bg-slate-50'}>
                    <td className="p-2.5 font-mono text-slate-600">{r.wbsCode}</td>
                    {selectedSheet === 'ALL' && (
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {r.sheetName}
                        </span>
                      </td>
                    )}
                    <td className="p-2.5">
                      <div className="font-semibold text-slate-900">{r.description}</div>
                      <div className="text-[10px] text-slate-400">{r.section}</div>
                    </td>
                    <td className="p-2.5 text-right font-mono font-medium">{r.volume}</td>
                    <td className="p-2.5 text-center font-mono">{r.unit}</td>
                    <td className="p-2.5 text-right font-mono">{formatRupiah(r.unitPrice)}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-950">{formatRupiah(r.totalPrice)}</td>
                    <td className="p-2.5">
                      {r.suggestedAhsCode ? (
                        <div>
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
                            {r.suggestedAhsCode}
                          </span>
                          <span className="text-[10px] text-slate-500 ml-1">({r.confidence}% akurasi)</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Perlu mapping manual</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      {r.errors.length === 0 ? (
                        <span className="inline-flex items-center text-emerald-600 font-bold text-[11px] gap-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>OK</span>
                        </span>
                      ) : includeZeroPrice ? (
                        <span className="inline-flex items-center text-amber-600 font-bold text-[10px] gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded">
                          <span>Perlu AHS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-rose-600 font-bold text-[11px] gap-0.5" title={r.errors.join(', ')}>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Error</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Map to AHS */}
      {mappingModalItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Hubungkan Item RAB ke Master AHS PUPR
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Item: <span className="font-semibold text-slate-800">{mappingModalItem.description}</span> ({mappingModalItem.volume} {mappingModalItem.unit})
                </p>
              </div>
              <button
                onClick={() => setMappingModalItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
              <div className="text-xs font-semibold text-slate-500 mb-2">
                Pilih Formula AHS Standar Nasional / PUPR:
              </div>
              {masterAhs.map(ahs => (
                <div
                  key={ahs.id}
                  onClick={() => {
                    mapRABtoAHS(mappingModalItem.id, ahs.code);
                    setMappingModalItem(null);
                  }}
                  className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer transition flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-900 text-amber-300 font-mono text-[10px] font-bold rounded">
                        {ahs.code}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">{ahs.category} • Satuan: {ahs.unit}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs mt-1">{ahs.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{ahs.version}</div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold font-mono text-slate-900">
                      {formatRupiah(ahs.totalUnitPrice)}
                    </div>
                    <div className="text-[10px] text-slate-400">per {ahs.unit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Atur Target Profit Per Item (Batch 9.75) */}
      {profitEditItem && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 text-amber-600 text-xs font-bold">
                  <Percent className="w-4 h-4" />
                  <span>PROKON Target Profit Per Item (Batch 9.75)</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mt-1">
                  Atur Target Margin Item RAB
                </h3>
                <p className="text-xs text-slate-500">
                  {profitEditItem.item.wbsCode} - {profitEditItem.item.description}
                </p>
              </div>
              <button
                onClick={() => setProfitEditItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checkbox: Use Default */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={profitEditItem.useDefault}
                  onChange={e => {
                    const isChecked = e.target.checked;
                    setProfitEditItem({
                      ...profitEditItem,
                      useDefault: isChecked,
                      profitPercent: isChecked ? defaultProfit : profitEditItem.profitPercent
                    });
                  }}
                  className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <span>Gunakan Target Default Proyek ({defaultProfit}%)</span>
              </label>

              {!profitEditItem.useDefault && (
                <div className="space-y-1 pt-1 border-t border-slate-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Target Profit Khusus Item Ini:</span>
                    <span className="font-mono font-bold text-amber-700 text-sm">
                      {profitEditItem.profitPercent}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="0.5"
                      value={profitEditItem.profitPercent}
                      onChange={e =>
                        setProfitEditItem({
                          ...profitEditItem,
                          profitPercent: parseFloat(e.target.value) || 0
                        })
                      }
                      className="w-full accent-amber-500"
                    />
                    <input
                      type="number"
                      min="0"
                      max="90"
                      step="0.5"
                      value={profitEditItem.profitPercent}
                      onChange={e =>
                        setProfitEditItem({
                          ...profitEditItem,
                          profitPercent: Math.max(0, Math.min(90, parseFloat(e.target.value) || 0))
                        })
                      }
                      className="w-16 p-1 border border-slate-300 rounded font-mono font-bold text-center text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Live Calculation Preview */}
            <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/30 text-xs space-y-2">
              <div className="font-bold text-amber-900 flex items-center justify-between">
                <span>Simulasi Anggaran RAP Item:</span>
                <span className="font-mono text-amber-800">
                  Vol: {profitEditItem.item.volume} {profitEditItem.item.unit}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-slate-500">Nilai RAB Item:</span>
                  <div className="font-mono font-bold text-slate-800">
                    {formatRupiah(profitEditItem.item.totalPrice)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Target Profit (Rp):</span>
                  <div className="font-mono font-bold text-emerald-700">
                    {formatRupiah(
                      Math.round(
                        profitEditItem.item.totalPrice * (profitEditItem.profitPercent / 100)
                      )
                    )}
                  </div>
                </div>
                <div className="col-span-2 pt-1 border-t border-amber-200">
                  <span className="text-slate-600 font-semibold">RAP Target Belanja Bersih:</span>
                  <div className="font-mono font-extrabold text-sm text-blue-900">
                    {formatRupiah(
                      Math.round(
                        profitEditItem.item.totalPrice * (1 - profitEditItem.profitPercent / 100)
                      )
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 italic">
                    Rumus: RAB Total × (1 − {profitEditItem.profitPercent}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProfitEditItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  updateRabItemTargetProfit(
                    profitEditItem.item.id,
                    profitEditItem.useDefault ? null : profitEditItem.profitPercent
                  );
                  setProfitEditItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow transition"
              >
                Simpan Target Profit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
