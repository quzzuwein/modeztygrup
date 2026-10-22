import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { formatRupiah, exportFinanceToExcel, triggerPrintReport } from '../../../services/exportService';
import { FinancialEntry } from '../../../types';
import {
  BadgeDollarSign,
  PlusCircle,
  FileText,
  TrendingUp,
  TrendingDown,
  Percent,
  CheckCircle2,
  Calendar,
  Building,
  CreditCard,
  Receipt,
  Zap,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Download,
  Printer
} from 'lucide-react';

export const KeuanganView: React.FC = () => {
  const {
    currentProject,
    currentPT,
    financialEntries,
    purchaseOrders,
    wageRecords,
    addFinancialEntry,
    updateWageStatus,
    currentRoleInfo
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'jurnal' | 'antrean_otomatis' | 'pajak'>('jurnal');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  // Form states for manual input
  const [entryType, setEntryType] = useState<'masuk' | 'keluar'>('keluar');
  const [category, setCategory] = useState<FinancialEntry['category']>('beban_material');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(15000000);
  const [refDoc, setRefDoc] = useState('INV-2026-');
  const [payeeOrPayer, setPayeeOrPayer] = useState('');
  const [includePpn, setIncludePpn] = useState(true);
  const [pphFinalRate, setPphFinalRate] = useState<number>(2.65); // 2.65% standard PP 9/2022

  if (!currentProject) {
    return <div className="p-8 text-center text-slate-500">Pilih proyek terlebih dahulu.</div>;
  }

  const projectFinances = financialEntries.filter(f => f.projectId === currentProject.id);

  // Automatic pending items from operational modules
  const pendingPOs = purchaseOrders.filter(
    p => p.projectId === currentProject.id && p.status !== 'lunas' && p.status !== 'dibatalkan'
  );

  const pendingWages = wageRecords.filter(
    w => w.projectId === currentProject.id && (w.status === 'siap_bayar' || w.status === 'diverifikasi_sm')
  );

  const filteredEntries = projectFinances.filter(f => {
    if (filterCategory === 'all') return true;
    return f.category === filterCategory;
  });

  // Calculate totals
  const totalMasuk = projectFinances.filter(f => f.type === 'masuk').reduce((sum, f) => sum + f.amount, 0);
  const totalKeluar = projectFinances.filter(f => f.type === 'keluar').reduce((sum, f) => sum + f.amount, 0);
  const netCashFlow = totalMasuk - totalKeluar;

  const totalPPN = projectFinances.reduce((sum, f) => sum + (f.taxDetails?.ppnAmount || 0), 0);
  const totalPPhFinal = projectFinances.reduce((sum, f) => sum + (f.taxDetails?.pphFinalAmount || 0), 0);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();

    const ppnAmount = includePpn ? Math.round(amount * 0.11) : 0;
    const pphFinalAmount = entryType === 'masuk' ? Math.round(amount * (pphFinalRate / 100)) : 0;

    addFinancialEntry({
      ptId: currentProject.ptId,
      projectId: currentProject.id,
      date: new Date().toISOString().split('T')[0],
      code: `TX-${Date.now().toString().slice(-4)}`,
      category,
      description,
      amount,
      type: entryType,
      refDoc,
      payeeOrPayer,
      taxDetails: {
        ppnRate: includePpn ? 11 : undefined,
        ppnAmount: includePpn ? ppnAmount : undefined,
        pphFinalRate: entryType === 'masuk' ? pphFinalRate : undefined,
        pphFinalAmount: entryType === 'masuk' ? pphFinalAmount : undefined
      },
      status: 'diverifikasi'
    });

    setShowModal(false);
    alert('Transaksi keuangan proyek berhasil dibukukan ke jurnal kontraktor!');
  };

  const handleDisbursePO = (po: typeof purchaseOrders[0]) => {
    addFinancialEntry({
      ptId: po.ptId,
      projectId: po.projectId,
      date: new Date().toISOString().split('T')[0],
      code: `EXP-PO-${po.poNumber}`,
      category: 'beban_material',
      description: `Pelunasan Pembayaran Supplier ${po.supplierName} (${po.poNumber})`,
      amount: po.grandTotal,
      type: 'keluar',
      refDoc: po.poNumber,
      payeeOrPayer: po.supplierName,
      taxDetails: {
        ppnRate: po.ppnPercent,
        ppnAmount: po.ppnAmount
      },
      status: 'diverifikasi'
    });
    alert(`Pembayaran ${po.poNumber} senilai ${formatRupiah(po.grandTotal)} berhasil dicairkan dan dibukukan ke jurnal!`);
  };

  const handleDisburseWage = (wage: typeof wageRecords[0]) => {
    updateWageStatus(wage.id, 'lunas');
    addFinancialEntry({
      ptId: wage.ptId,
      projectId: wage.projectId,
      date: new Date().toISOString().split('T')[0],
      code: `EXP-UPH-${wage.recordNumber}`,
      category: 'beban_upah',
      description: `Pencairan Upah ${wage.mandorName} - ${wage.workDescription}`,
      amount: wage.netPayable,
      type: 'keluar',
      refDoc: wage.recordNumber,
      payeeOrPayer: wage.mandorName,
      taxDetails: {
        pphFinalRate: wage.pph21Percent,
        pphFinalAmount: wage.pph21Amount
      },
      status: 'diverifikasi'
    });
    alert(`Upah ${wage.mandorName} (${formatRupiah(wage.netPayable)}) berhasil dicairkan!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
              <BadgeDollarSign className="w-4 h-4" />
              <span>Standar Akuntansi Kontraktor & Perpajakan</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">
              Keuangan Proyek, Tagihan Termin, & Pajak
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Antrean tagihan otomatis dari PO & Upah, pencatatan termin klien, retensi 5%, PPN 11%, dan PPh Final Jasa Konstruksi (PP No. 9/2022).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportFinanceToExcel(projectFinances, currentProject.name)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow"
              title="Download Jurnal Keuangan & Kas ke Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel Keuangan</span>
            </button>

            <button
              onClick={() => triggerPrintReport()}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 transition"
              title="Cetak Jurnal & Pajak ke PDF"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Cetak PDF</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Transaksi Manual (Termin/Overhead)</span>
            </button>
          </div>
        </div>

        {/* Explainer Banner: Otomatis vs Input Manual */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-900 text-white text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-amber-400">Bagian Keuangan: Alur Otomatis vs Input Manual</span>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Tagihan PO supplier & klaim upah mandor <strong>mengalir otomatis</strong> ke antrean. Keuangan menginput <strong>Penerimaan Termin Klien</strong>, memvalidasi faktur pajak, dan mengeksekusi pencairan kas.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded font-mono text-[11px] font-bold border border-amber-500/30">
              {pendingPOs.length} PO + {pendingWages.length} Upah Siap Bayar
            </span>
          </div>
        </div>

        {/* 4 Financial Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200">
            <span className="text-[11px] text-emerald-700 font-semibold uppercase">Total Penerimaan Termin</span>
            <div className="text-base font-extrabold font-mono text-emerald-900 mt-0.5">
              {formatRupiah(totalMasuk)}
            </div>
            <span className="text-[10px] text-emerald-600">Termin DP & Kemajuan Fisik</span>
          </div>

          <div className="bg-rose-50/70 p-3 rounded-lg border border-rose-200">
            <span className="text-[11px] text-rose-700 font-semibold uppercase">Total Pengeluaran Kas</span>
            <div className="text-base font-extrabold font-mono text-rose-900 mt-0.5">
              {formatRupiah(totalKeluar)}
            </div>
            <span className="text-[10px] text-rose-600">Material, Upah & Operasional</span>
          </div>

          <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200">
            <span className="text-[11px] text-blue-700 font-semibold uppercase">Surplus Kas Proyek</span>
            <div className="text-base font-extrabold font-mono text-blue-900 mt-0.5">
              {formatRupiah(netCashFlow)}
            </div>
            <span className="text-[10px] text-blue-600">Net Arus Kas Operasional</span>
          </div>

          <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200">
            <span className="text-[11px] text-amber-700 font-semibold uppercase">PPh Final Jasa Konstruksi</span>
            <div className="text-base font-extrabold font-mono text-amber-900 mt-0.5">
              {formatRupiah(totalPPhFinal)}
            </div>
            <span className="text-[10px] text-amber-700">Tarif 2.65% PP 9/2022</span>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('jurnal')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === 'jurnal' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Jurnal Kas & Pembukuan Proyek ({projectFinances.length})
        </button>

        <button
          onClick={() => setActiveSubTab('antrean_otomatis')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeSubTab === 'antrean_otomatis' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Antrean Tagihan Otomatis ({pendingPOs.length + pendingWages.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pajak')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === 'pajak' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Rekapitulasi Pajak Kontraktor (PPN & PPh Final)
        </button>
      </div>

      {/* TAB 1: JURNAL PEMBUKUAN */}
      {activeSubTab === 'jurnal' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Filter Kategori:</span>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="p-1.5 border border-slate-300 rounded-lg text-slate-700 bg-white"
              >
                <option value="all">Semua Kategori</option>
                <option value="pendapatan_termin">Tagihan & Termin Klien</option>
                <option value="beban_material">Beban Pembelian Material</option>
                <option value="beban_upah">Beban Upah Mandor</option>
                <option value="overhead_proyek">Overhead & Operasional Proyek</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">No. Dokumen / Ref</th>
                  <th className="p-3">Kategori Akun</th>
                  <th className="p-3">Deskripsi Transaksi</th>
                  <th className="p-3">Pihak Terkait (Vendor/Klien)</th>
                  <th className="p-3 text-right text-emerald-700">Masuk (Debit)</th>
                  <th className="p-3 text-right text-rose-700">Keluar (Kredit)</th>
                  <th className="p-3 text-right">PPN 11%</th>
                  <th className="p-3 text-right">PPh Final</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50 font-medium">
                    <td className="p-3 font-mono text-slate-500">{entry.date}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{entry.refDoc}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {entry.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-slate-900 font-semibold">{entry.description}</td>
                    <td className="p-3 text-slate-600">{entry.payeeOrPayer}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-600">
                      {entry.type === 'masuk' ? formatRupiah(entry.amount) : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-rose-600">
                      {entry.type === 'keluar' ? formatRupiah(entry.amount) : '-'}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">
                      {entry.taxDetails?.ppnAmount ? formatRupiah(entry.taxDetails.ppnAmount) : '-'}
                    </td>
                    <td className="p-3 text-right font-mono text-amber-700 font-semibold">
                      {entry.taxDetails?.pphFinalAmount ? formatRupiah(entry.taxDetails.pphFinalAmount) : '-'}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ANTREAN TAGIHAN OTOMATIS */}
      {activeSubTab === 'antrean_otomatis' && (
        <div className="space-y-6">
          {/* Section A: Pending POs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Tagihan Otomatis PO Supplier (Dari Pengadaan & BAST)</span>
              </h3>
              <span className="text-xs text-slate-500">{pendingPOs.length} PO Menunggu Pencairan</span>
            </div>

            {pendingPOs.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                Tidak ada PO supplier yang tertunda. Semua pesanan telah lunas.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingPOs.map(po => (
                  <div key={po.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{po.poNumber}</span>
                        <span className="font-bold text-blue-800">{po.supplierName}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded bg-amber-100 text-amber-800 uppercase font-semibold">
                          {po.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-1">
                        Order: {po.orderDate} • Syarat Bayar: <strong>{po.paymentTerms}</strong> • Termasuk PPN: {formatRupiah(po.ppnAmount)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono font-extrabold text-sm text-slate-900">
                          {formatRupiah(po.grandTotal)}
                        </div>
                        <div className="text-[10px] text-slate-400">Total Tagihan (Inc PPN)</div>
                      </div>

                      <button
                        onClick={() => handleDisbursePO(po)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center gap-1"
                      >
                        <span>Cairkan Dana PO</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Pending Wages */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Tagihan Upah Mandor (Telah Diverifikasi Site Manager & PM)</span>
              </h3>
              <span className="text-xs text-slate-500">{pendingWages.length} Klaim Upah Siap Bayar</span>
            </div>

            {pendingWages.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                Tidak ada klaim upah mandor yang siap bayar saat ini.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingWages.map(wage => (
                  <div key={wage.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{wage.recordNumber}</span>
                        <span className="font-bold text-slate-800">{wage.mandorName}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded bg-blue-100 text-blue-800 uppercase font-semibold">
                          {wage.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-1">
                        Pekerjaan: <strong>{wage.workDescription}</strong> • Bruto: {formatRupiah(wage.grossAmount)} • Potongan PPh 21 (2%): -{formatRupiah(wage.pph21Amount)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono font-extrabold text-sm text-emerald-700">
                          {formatRupiah(wage.netPayable)}
                        </div>
                        <div className="text-[10px] text-slate-400">Net Diterima Mandor</div>
                      </div>

                      <button
                        onClick={() => handleDisburseWage(wage)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center gap-1"
                      >
                        <span>Bayar Upah</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: REKAP PAJAK KONTRAKTOR */}
      {activeSubTab === 'pajak' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">
              Rekapitulasi Kewajiban Pajak Kontraktor (PPN 11%, PPh 21, PPh Final PP 9/2022)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pajak dipotong secara otomatis pada setiap pencatatan termin klien dan pembayaran jasa mandor/vendor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">1. PPN 11% (Pajak Pertambahan Nilai)</span>
              <div className="text-xl font-extrabold font-mono text-slate-900">{formatRupiah(totalPPN)}</div>
              <p className="text-[11px] text-slate-500">
                Faktur Pajak Keluaran atas termin yang ditagihkan ke Klien dan Faktur Masukan dari supplier material.
              </p>
            </div>

            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-800 uppercase">2. PPh Final Jasa Konstruksi (PP 9/2022)</span>
              <div className="text-xl font-extrabold font-mono text-amber-900">{formatRupiah(totalPPhFinal)}</div>
              <p className="text-[11px] text-amber-800">
                Tarif 2.65% untuk Pelaksana Kualifikasi Menengah, langsung dipotong saat penerimaan kas dari Klien.
              </p>
            </div>

            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-2">
              <span className="text-xs font-bold text-blue-800 uppercase">3. PPh 21 Jasa Upah Mandor (2.0%)</span>
              <div className="text-xl font-extrabold font-mono text-blue-900">
                {formatRupiah(wageRecords.reduce((sum, w) => sum + w.pph21Amount, 0))}
              </div>
              <p className="text-[11px] text-blue-800">
                Dipotong otomatis dari nilai bruto SPK borongan mandor sebelum pencairan kas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Catat Transaksi Manual */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddEntry} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Input Manual Keuangan (Termin / Overhead)</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Tipe Aliran Kas</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEntryType('masuk');
                      setCategory('pendapatan_termin');
                    }}
                    className={`py-1.5 rounded-lg border font-bold text-center ${
                      entryType === 'masuk' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Uang Masuk (Termin)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEntryType('keluar');
                      setCategory('overhead_proyek');
                    }}
                    className={`py-1.5 rounded-lg border font-bold text-center ${
                      entryType === 'keluar' ? 'bg-rose-600 text-white border-rose-700' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Biaya Keluar (Overhead)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Kategori Akun</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                >
                  {entryType === 'masuk' ? (
                    <option value="pendapatan_termin">Penerimaan Pembayaran Termin Klien (DP / Opname)</option>
                  ) : (
                    <>
                      <option value="overhead_proyek">Biaya Operasional Lapangan & Kas Kecil (Petty Cash)</option>
                      <option value="beban_alat">Sewa Alat Tambahan / BBM Genset</option>
                      <option value="beban_subkon">Beban Spesialis / Subkontraktor</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Deskripsi Transaksi</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Penerimaan Pembayaran Termin I (Kemajuan 35%)"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Jumlah Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">No. Bukti / Invoice / BAPP</label>
                  <input
                    type="text"
                    value={refDoc}
                    onChange={e => setRefDoc(e.target.value)}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Pihak Klien / Vendor</label>
                  <input
                    type="text"
                    placeholder="Nama Klien atau PT"
                    value={payeeOrPayer}
                    onChange={e => setPayeeOrPayer(e.target.value)}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Tax settings */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includePpn}
                    onChange={e => setIncludePpn(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span className="font-semibold text-slate-700">Hitung PPN 11% ({formatRupiah(includePpn ? amount * 0.11 : 0)})</span>
                </label>

                {entryType === 'masuk' && (
                  <div>
                    <label className="font-semibold text-slate-700">Tarif PPh Final Jasa Konstruksi (PP 9/2022)</label>
                    <select
                      value={pphFinalRate}
                      onChange={e => setPphFinalRate(parseFloat(e.target.value))}
                      className="w-full mt-1 p-1.5 border border-slate-300 rounded text-xs"
                    >
                      <option value="2.65">2.65% (Kualifikasi Menengah - Standard)</option>
                      <option value="1.75">1.75% (Kualifikasi Usaha Kecil)</option>
                      <option value="4.0">4.00% (Tidak Memiliki Sertifikat Badan Usaha)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 rounded-lg border text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Posting Transaksi ke Jurnal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
