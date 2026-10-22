import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { parseExcelFile, generateRABExcelTemplate, matchAHS, ParseResult } from '../../../services/aiRabParser';
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
  Printer
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
    currentRoleInfo
  } = useApp();

  const [activeTab, setActiveTab] = useState<'daftar' | 'import'>('daftar');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [mappingModalItem, setMappingModalItem] = useState<RABItem | null>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const result = parseExcelFile(buffer, file.name, masterAhs);
        setParseResult(result);
        setActiveTab('import');
      } catch (err) {
        alert('Gagal memproses file Excel: Pastikan format .xlsx atau .csv valid.');
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleApplyImport = () => {
    if (!parseResult) return;

    const itemsToImport: Omit<RABItem, 'id'>[] = parseResult.rows
      .filter(r => r.errors.length === 0)
      .map(r => ({
        projectId: currentProject.id,
        wbsCode: r.wbsCode,
        section: r.section,
        description: r.description,
        volume: r.volume,
        unit: r.unit,
        unitPrice: r.unitPrice,
        totalPrice: r.totalPrice,
        ahsCode: r.suggestedAhsCode,
        hasAhsMapped: Boolean(r.suggestedAhsCode),
        status: 'draft',
        notes: `Import AI dari ${parseResult.fileName}`
      }));

    if (itemsToImport.length === 0) {
      alert('Tidak ada baris valid untuk diimpor.');
      return;
    }

    importRABItems(itemsToImport);
    setParseResult(null);
    setActiveTab('daftar');
    alert(`Berhasil mengimpor ${itemsToImport.length} item pekerjaan RAB ke ${currentProject.name}!`);
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

        {/* Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Total Nilai RAB Kontrak</span>
            <div className="text-base font-extrabold font-mono text-slate-900 mt-0.5">
              {formatRupiah(totalRABValue)}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Jumlah Item Pekerjaan</span>
            <div className="text-base font-extrabold font-mono text-slate-900 mt-0.5">
              {projectRabItems.length} Item
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Terhubung AHS PUPR</span>
            <div className="text-base font-extrabold font-mono text-emerald-600 mt-0.5 flex items-center gap-1">
              <span>{mappedCount}</span>
              <span className="text-xs text-slate-400">/ {projectRabItems.length} ({projectRabItems.length > 0 ? Math.round((mappedCount / projectRabItems.length) * 100) : 0}%)</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Belum Dipetakan AHS</span>
            <div className="text-base font-extrabold font-mono text-amber-600 mt-0.5">
              {projectRabItems.length - mappedCount} Item
            </div>
          </div>
        </div>
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

        {parseResult && (
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Hasil Pratinjau Excel ({parseResult.validRows} valid)</span>
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
                  <th className="p-3 text-right">Harga Satuan (Rp)</th>
                  <th className="p-3 text-right">Total Kontrak (Rp)</th>
                  <th className="p-3">Analisa AHS PUPR</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      Tidak ada item RAB yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-mono font-bold text-slate-600">{item.wbsCode}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{item.description}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-tight">{item.section}</div>
                      </td>
                      <td className="p-3 text-right font-mono font-medium">{item.volume.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-center font-mono text-slate-500">{item.unit}</td>
                      <td className="p-3 text-right font-mono">{formatRupiah(item.unitPrice)}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {formatRupiah(item.totalPrice)}
                      </td>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PRATINJAU IMPORT EXCEL AI */}
      {activeTab === 'import' && parseResult && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Hasil Analisa File Excel: {parseResult.fileName}
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Sistem secara otomatis mendeteksi kolom, menghitung total, dan mencocokkan uraian pekerjaan ke standar Permen PUPR.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setParseResult(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleApplyImport}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
              >
                <Check className="w-4 h-4" />
                <span>Simpan ke RAB Proyek ({parseResult.validRows} Baris)</span>
              </button>
            </div>
          </div>

          {/* Validation Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              <span className="text-[10px] text-emerald-700 font-bold uppercase">Baris Valid</span>
              <div className="text-base font-extrabold text-emerald-900 font-mono">
                {parseResult.validRows} / {parseResult.totalRows}
              </div>
            </div>

            <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              <span className="text-[10px] text-amber-700 font-bold uppercase">Terdeteksi AHS Otomatis</span>
              <div className="text-base font-extrabold text-amber-900 font-mono">
                {parseResult.rows.filter(r => r.suggestedAhsCode).length} Item
              </div>
            </div>

            <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 col-span-2">
              <span className="text-[10px] text-blue-700 font-bold uppercase">Total Nilai Hasil Perhitungan</span>
              <div className="text-base font-extrabold text-blue-900 font-mono">
                {formatRupiah(parseResult.calculatedGrandTotal)}
              </div>
            </div>
          </div>

          {/* Preview Rows Table */}
          <div className="overflow-x-auto max-h-[450px] border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                <tr>
                  <th className="p-2.5">WBS</th>
                  <th className="p-2.5">Uraian Pekerjaan</th>
                  <th className="p-2.5 text-right">Volume</th>
                  <th className="p-2.5 text-center">Satuan</th>
                  <th className="p-2.5 text-right">Harga Satuan (Rp)</th>
                  <th className="p-2.5 text-right">Total (Rp)</th>
                  <th className="p-2.5">Saran AHS PUPR</th>
                  <th className="p-2.5 text-center">Validasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parseResult.rows.map((r, idx) => (
                  <tr key={idx} className={r.errors.length > 0 ? 'bg-rose-50/60' : 'hover:bg-slate-50'}>
                    <td className="p-2.5 font-mono text-slate-600">{r.wbsCode}</td>
                    <td className="p-2.5">
                      <div className="font-semibold text-slate-900">{r.description}</div>
                      <div className="text-[10px] text-slate-400">{r.section}</div>
                    </td>
                    <td className="p-2.5 text-right font-mono">{r.volume}</td>
                    <td className="p-2.5 text-center font-mono">{r.unit}</td>
                    <td className="p-2.5 text-right font-mono">{formatRupiah(r.unitPrice)}</td>
                    <td className="p-2.5 text-right font-mono font-bold">{formatRupiah(r.totalPrice)}</td>
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
    </div>
  );
};
