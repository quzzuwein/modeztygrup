import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { exportComprehensiveExcel, triggerPrintReport, formatRupiah } from '../../../services/exportService';
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Download,
  Building2,
  CheckCircle2,
  Calendar,
  Layers,
  Award
} from 'lucide-react';

export const LaporanView: React.FC = () => {
  const {
    currentProject,
    currentPT,
    rabItems,
    rapItems,
    stockItems,
    wageRecords,
    financialEntries
  } = useApp();

  const [reportType, setReportType] = useState<'bapp' | 'rap_summary' | 'logistik' | 'keuangan'>('bapp');

  if (!currentProject || !currentPT) {
    return <div className="p-8 text-center text-slate-500">Pilih proyek terlebih dahulu.</div>;
  }

  const handleExportExcel = () => {
    exportComprehensiveExcel({
      project: currentProject,
      pt: currentPT,
      rabItems,
      rapItems,
      stockItems,
      wageRecords,
      financialEntries
    });
  };

  const projectRab = rabItems.filter(r => r.projectId === currentProject.id);
  const projectRap = rapItems.filter(r => r.projectId === currentProject.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
              <FileText className="w-4 h-4" />
              <span>Pusat Laporan & Ekspor Manajerial</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">
              Laporan Eksekutif, Ekspor Excel Multi-Sheet & Cetak PDF
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cetak dokumen resmi proyek (BAPP, Lembar Kendali RAP, Rekap Stok, Slip Upah) dan download data ke spreadsheet Excel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor Excel Lengkap (.xlsx)</span>
            </button>

            <button
              onClick={triggerPrintReport}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center gap-2 shadow transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF Dokumen</span>
            </button>
          </div>
        </div>

        {/* Report Selector Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
          <button
            onClick={() => setReportType('bapp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              reportType === 'bapp' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Berita Acara Pembayaran Progres (BAPP)
          </button>

          <button
            onClick={() => setReportType('rap_summary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              reportType === 'rap_summary' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Lembar Kendali Anggaran RAP vs Realisasi
          </button>

          <button
            onClick={() => setReportType('logistik')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              reportType === 'logistik' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Rekap Logistik & Saldo Gudang
          </button>
        </div>
      </div>

      {/* Official Printable Report Document Body */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 max-w-4xl mx-auto space-y-6 text-slate-900">
        {/* Corporate Header / KOP SURAT with Company Logo */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {currentPT.logoUrl && (
              <img
                src={currentPT.logoUrl}
                alt={currentPT.code}
                className="w-16 h-16 object-contain rounded-xl border border-slate-300 p-1 bg-white shrink-0"
              />
            )}
            <div className="space-y-0.5">
              <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                {currentPT.legalName || currentPT.name}
              </h2>
              <p className="text-xs text-slate-600">
                {currentPT.address} • Telp: {currentPT.phone}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                NPWP: {currentPT.npwp} {currentPT.email ? `• Email: ${currentPT.email}` : ''}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs font-mono font-bold text-slate-900 px-2.5 py-1 bg-slate-100 rounded inline-block">
              {currentPT.code} - {currentProject.code}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Tanggal: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center space-y-1">
          <h3 className="text-base font-extrabold uppercase tracking-wide text-slate-900 underline">
            {reportType === 'bapp' && 'BERITA ACARA KEMAJUAN FISIK & KEUANGAN PEKERJAAN (BAPP)'}
            {reportType === 'rap_summary' && 'LEMBAR KENDALI ANGGARAN & REALISASI BIAYA PROYEK'}
            {reportType === 'logistik' && 'LAPORAN REKAPITULASI STOK MATERIAL GUDANG KANTOR & LAPANGAN'}
          </h3>
          <p className="text-xs text-slate-500">
            Nomor: BAPP/{currentProject.code}/{new Date().getFullYear()}/04
          </p>
        </div>

        {/* Project Meta Info Box */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <div className="text-slate-500">Nama Proyek:</div>
            <div className="font-bold text-slate-900">{currentProject.name}</div>
          </div>
          <div>
            <div className="text-slate-500">Pemberi Tugas (Klien):</div>
            <div className="font-bold text-slate-900">{currentProject.clientName}</div>
          </div>
          <div>
            <div className="text-slate-500">Lokasi Proyek:</div>
            <div className="font-semibold text-slate-800">{currentProject.location}</div>
          </div>
          <div>
            <div className="text-slate-500">Nilai Kontrak:</div>
            <div className="font-extrabold text-slate-900 font-mono">{formatRupiah(currentProject.contractValue)}</div>
          </div>
        </div>

        {/* Content based on selected report */}
        {reportType === 'bapp' && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-700 leading-relaxed">
              Berdasarkan hasil pemeriksaan opname bersama di lapangan antara Manajemen Konstruksi dan Kontraktor Pelaksana, dengan ini disepakati bobot kemajuan fisik proyek adalah sebagai berikut:
            </p>

            <table className="w-full text-left border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Uraian Kemajuan</th>
                  <th className="p-2.5 text-right">Rencana Baseline</th>
                  <th className="p-2.5 text-right">Realisasi Aktual</th>
                  <th className="p-2.5 text-right">Deviasi (+/-)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="p-2.5 font-medium">Progres Fisik Kumulatif (%)</td>
                  <td className="p-2.5 text-right text-blue-700">{currentProject.plannedProgressPercent}%</td>
                  <td className="p-2.5 text-right text-emerald-700 font-bold">{currentProject.actualProgressPercent}%</td>
                  <td className="p-2.5 text-right font-bold">
                    {(currentProject.actualProgressPercent - currentProject.plannedProgressPercent).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Nilai Ekuivalen Progres (Rp)</td>
                  <td className="p-2.5 text-right">{formatRupiah((currentProject.contractValue * currentProject.plannedProgressPercent) / 100)}</td>
                  <td className="p-2.5 text-right font-bold text-slate-900">{formatRupiah((currentProject.contractValue * currentProject.actualProgressPercent) / 100)}</td>
                  <td className="p-2.5 text-right font-semibold">
                    {formatRupiah((currentProject.contractValue * (currentProject.actualProgressPercent - currentProject.plannedProgressPercent)) / 100)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'rap_summary' && (
          <div className="space-y-3 text-xs">
            <table className="w-full text-left border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">WBS</th>
                  <th className="p-2.5">Item Pekerjaan</th>
                  <th className="p-2.5 text-right">Volume</th>
                  <th className="p-2.5 text-right">Anggaran RAP</th>
                  <th className="p-2.5 text-right">Realisasi Biaya</th>
                  <th className="p-2.5 text-right">Sisa Anggaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projectRap.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 font-mono">
                    <td className="p-2.5 font-bold">{r.wbsCode}</td>
                    <td className="p-2.5 font-sans font-medium">{r.description}</td>
                    <td className="p-2.5 text-right">{r.volume} {r.unit}</td>
                    <td className="p-2.5 text-right font-semibold">{formatRupiah(r.rapTotalPrice)}</td>
                    <td className="p-2.5 text-right text-amber-800">{formatRupiah(r.totalCostRealized)}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">{formatRupiah(r.rapTotalPrice - r.totalCostRealized)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'logistik' && (
          <div className="space-y-3 text-xs">
            <table className="w-full text-left border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Material</th>
                  <th className="p-2.5">Kategori</th>
                  <th className="p-2.5 text-center">Satuan</th>
                  <th className="p-2.5 text-right">Gudang Kantor</th>
                  <th className="p-2.5 text-right">Gudang Lapangan</th>
                  <th className="p-2.5 text-right">Harga Beli Rata2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockItems.map(s => (
                  <tr key={s.id} className="font-mono">
                    <td className="p-2.5 font-sans font-bold">{s.name}</td>
                    <td className="p-2.5 font-sans">{s.category}</td>
                    <td className="p-2.5 text-center">{s.unit}</td>
                    <td className="p-2.5 text-right">{s.officeStock}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-800">{s.fieldStocks[currentProject.id] || 0}</td>
                    <td className="p-2.5 text-right">{formatRupiah(s.avgBuyPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3 Signature Blocks */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs">
          <div className="space-y-12">
            <div className="font-bold text-slate-600">Dibuat Oleh,</div>
            <div>
              <div className="font-bold underline text-slate-900">{currentProject.siteManagerName}</div>
              <div className="text-[11px] text-slate-500">Site Manager Lapangan</div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="font-bold text-slate-600">Diperiksa Oleh,</div>
            <div>
              <div className="font-bold underline text-slate-900">{currentProject.pmName}</div>
              <div className="text-[11px] text-slate-500">Project Manager Teknik</div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="font-bold text-slate-600">Disetujui Oleh,</div>
            <div>
              <div className="font-bold underline text-slate-900">{currentPT.directorName}</div>
              <div className="text-[11px] text-slate-500">Direktur Utama PT</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
