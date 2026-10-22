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
  Printer,
  Lock,
  Layers,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  FileSpreadsheet,
  Calculator
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
    currentRoleInfo,
    activeRole,
    revenueRecognitions,
    previewPSAK72,
    recognizeRevenue,
    reverseRevenueRecognition
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'jurnal' | 'antrean_otomatis' | 'psak72' | 'pajak' | 'psak1'>('jurnal');
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
  const [isTaxable, setIsTaxable] = useState(true);

  // PSAK 72 state
  const [periodYear, setPeriodYear] = useState<number>(2026);
  const [periodMonth, setPeriodMonth] = useState<number>(10);
  const [psakNotes, setPsakNotes] = useState('');

  // PSAK 1 / Pajak Tahunan DJP state
  const [taxReportMode, setTaxReportMode] = useState<'fiscal' | 'internal'>('fiscal');

  if (!currentProject) {
    return <div className="p-8 text-center text-slate-500">Pilih proyek terlebih dahulu.</div>;
  }

  // Strict RBAC Financial confidentiality check
  const canViewFinancials = ['direktur', 'pm_teknik', 'pm_lapangan', 'estimator', 'admin_keuangan'].includes(activeRole);

  if (!canViewFinancials) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-2xl mx-auto my-12 text-center space-y-4">
        <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900">
          Modul Keuangan & Pembukuan Terproteksi
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          Sesuai kebijakan RBAC KontraktorPro, akses ke <strong>Jurnal Kas, PSAK 72 (Pengakuan Pendapatan), dan Laporan Pajak DJP</strong> hanya diperuntukkan bagi <strong>Direktur, PM, Estimator, dan Admin Keuangan</strong>.
        </p>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium max-w-md mx-auto">
          Peran Anda saat ini: <span className="font-bold text-amber-700">{currentRoleInfo.title}</span>. Silakan buka modul <strong>Logistik</strong>, <strong>Kontrol Upah</strong>, atau <strong>Progres Kurva S</strong> untuk mengelola pekerjaan fisik lapangan.
        </div>
      </div>
    );
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

  // PSAK 72 Live Preview
  const psakPreview = previewPSAK72(currentProject.id, periodYear, periodMonth);
  const projectRecognitions = revenueRecognitions.filter(r => r.projectId === currentProject.id);

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
      isTaxable,
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
      isTaxable: true,
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
      isTaxable: true,
      taxDetails: {
        pphFinalRate: wage.pph21Percent,
        pphFinalAmount: wage.pph21Amount
      },
      status: 'diverifikasi'
    });
    alert(`Upah ${wage.mandorName} (${formatRupiah(wage.netPayable)}) berhasil dicairkan!`);
  };

  const handlePostPSAK72 = () => {
    if (psakPreview.revenueThisMonth <= 0) {
      alert('Tidak ada revenue baru yang perlu diakui pada periode ini (nilai kumulatif telah diakui penuh).');
      return;
    }
    const noteText = psakNotes.trim() || `Pengakuan pendapatan PSAK 72 Periode ${periodYear}-${String(periodMonth).padStart(2, '0')} (${psakPreview.progressPercent}%)`;
    const res = recognizeRevenue(currentProject.id, periodYear, periodMonth, noteText);
    if (res.success) {
      alert(`Berhasil posting jurnal PSAK 72 senilai ${formatRupiah(res.record?.revenueThisMonth || 0)} ke buku besar!`);
      setPsakNotes('');
    } else {
      alert(res.message);
    }
  };

  const handleReversePSAK72 = (id: string, no: string) => {
    const reason = prompt(`Masukkan alasan pembalikan (reversal) jurnal PSAK 72 ${no}:`, 'Koreksi opname / penyesuaian progres lapangan');
    if (!reason) return;
    const res = reverseRevenueRecognition(id, reason);
    if (res.success) {
      alert(`Jurnal PSAK 72 ${no} berhasil dibalik (reversed) dan saldo piutang kontrak telah disesuaikan.`);
    } else {
      alert(res.message);
    }
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
              Keuangan Proyek, PSAK 72 & Pajak DJP
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Antrean tagihan otomatis dari PO & Upah, pengakuan pendapatan proporsional progres fisik (PSAK 72), PPh Final Jasa Konstruksi (PP No. 9/2022), dan PSAK 1.
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
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('jurnal')}
          className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition ${
            activeSubTab === 'jurnal' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Jurnal Kas & Pembukuan ({projectFinances.length})
        </button>

        <button
          onClick={() => setActiveSubTab('antrean_otomatis')}
          className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
            activeSubTab === 'antrean_otomatis' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Antrean Tagihan Otomatis ({pendingPOs.length + pendingWages.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('psak72')}
          className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
            activeSubTab === 'psak72' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>PSAK 72: Pengakuan Pendapatan</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pajak')}
          className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition ${
            activeSubTab === 'pajak' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Rekapitulasi Pajak (PPN & PPh Final)
        </button>

        <button
          onClick={() => setActiveSubTab('psak1')}
          className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
            activeSubTab === 'psak1' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
          <span>Laporan Pajak Tahunan & DJP (PSAK 1)</span>
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
                        <span>Cairkan Kas</span>
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
                <span>Klaim Upah Mandor Siap Bayar (Tervalidasi Lapangan)</span>
              </h3>
              <span className="text-xs text-slate-500">{pendingWages.length} Mandor Menunggu Upah</span>
            </div>

            {pendingWages.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                Tidak ada klaim upah mandor yang tertunda.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingWages.map(wage => (
                  <div key={wage.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{wage.recordNumber}</span>
                        <span className="font-bold text-emerald-800">{wage.mandorName}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-100 text-emerald-800 uppercase font-semibold">
                          {wage.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-1">
                        Pekerjaan: <strong>{wage.workDescription}</strong> • Periode: {wage.periodStart} s/d {wage.periodEnd} • Potongan PPh 21: {formatRupiah(wage.pph21Amount)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono font-extrabold text-sm text-slate-900">
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

      {/* TAB 3: PSAK 72 PENGAKUAN PENDAPATAN (BATCH 9.5) */}
      {activeSubTab === 'psak72' && (
        <div className="space-y-6">
          {/* PSAK 72 Theory & Concept Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 p-5 rounded-xl border border-amber-500/30 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Standar Akuntansi Keuangan: PSAK 72 (Pendapatan dari Kontrak dengan Pelanggan)</span>
                </div>
                <h2 className="text-lg font-black text-white mt-1">
                  Pengakuan Pendapatan Berdasarkan Progres Fisik Terverifikasi
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Prinsip utama: <strong>Revenue diakui proporsional dengan progress fisik lapangan</strong> — bukan saat invoice/termin terbit.
                  Formula: <code>Revenue to Date = Progress Fisik (%) × Nilai Kontrak</code>, dan <code>Revenue Bulan Ini = max(0, Revenue to Date − Revenue Sudah Diakui)</code>.
                </p>
              </div>

              {/* Period Selectors */}
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 flex items-center gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block font-semibold">Tahun Buku</label>
                  <select
                    value={periodYear}
                    onChange={e => setPeriodYear(parseInt(e.target.value))}
                    className="bg-slate-900 text-amber-300 font-bold p-1.5 rounded border border-slate-700"
                  >
                    <option value={2026}>2026</option>
                    <option value={2025}>2025</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block font-semibold">Bulan Pengakuan</label>
                  <select
                    value={periodMonth}
                    onChange={e => setPeriodMonth(parseInt(e.target.value))}
                    className="bg-slate-900 text-amber-300 font-bold p-1.5 rounded border border-slate-700"
                  >
                    {[
                      { m: 1, name: 'Januari' },
                      { m: 2, name: 'Februari' },
                      { m: 3, name: 'Maret' },
                      { m: 4, name: 'April' },
                      { m: 5, name: 'Mei' },
                      { m: 6, name: 'Juni' },
                      { m: 7, name: 'Juli' },
                      { m: 8, name: 'Agustus' },
                      { m: 9, name: 'September' },
                      { m: 10, name: 'Oktober' },
                      { m: 11, name: 'November' },
                      { m: 12, name: 'Desember' }
                    ].map(item => (
                      <option key={item.m} value={item.m}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-600" />
                  <span>Kalkulasi Revenue PSAK 72 — Periode {periodYear}/{String(periodMonth).padStart(2, '0')}</span>
                </h3>
                <span className="text-xs text-slate-500">
                  Proyek: <strong>{currentProject.name}</strong> ({currentProject.code})
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                psakPreview.revenueThisMonth > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {psakPreview.revenueThisMonth > 0 ? 'Siap Posting Jurnal' : 'Revenue Sudah Penuh Diakui'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Nilai Kontrak Klien</span>
                <div className="text-sm font-extrabold font-mono text-slate-900 mt-1">
                  {formatRupiah(psakPreview.contractValue)}
                </div>
                <span className="text-[10px] text-slate-400">Total Pagu SPK</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Progres Fisik Opname</span>
                <div className="text-sm font-extrabold font-mono text-blue-700 mt-1">
                  {psakPreview.progressPercent}%
                </div>
                <span className="text-[10px] text-blue-600">Terverifikasi Pengawas</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Revenue To Date</span>
                <div className="text-sm font-extrabold font-mono text-slate-800 mt-1">
                  {formatRupiah(psakPreview.revenueToDate)}
                </div>
                <span className="text-[10px] text-slate-400">Kumulatif Progres</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Sudah Diakui s/d Lalu</span>
                <div className="text-sm font-extrabold font-mono text-slate-600 mt-1">
                  {formatRupiah(psakPreview.revenueRecognized)}
                </div>
                <span className="text-[10px] text-slate-400">Saldo Pembukuan</span>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-300 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-emerald-800 font-black uppercase">Revenue Bulan Ini</span>
                <div className="text-sm font-black font-mono text-emerald-900 mt-1">
                  {formatRupiah(psakPreview.revenueThisMonth)}
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold">PSAK 72 Diakui</span>
              </div>
            </div>

            {/* Auto-Journal Preview Box */}
            <div className="bg-slate-900 text-white rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-bold text-[11px] border-b border-slate-800 pb-1.5">
                <span>Auto-Jurnal Akuntansi PSAK 72:</span>
                <span className="font-mono text-amber-400">NO REF: PSAK72-{periodYear}{String(periodMonth).padStart(2, '0')}-AUTO</span>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between items-center text-emerald-400">
                  <span>(Dr) 1500 - Piutang Kontrak Belum Ditagih (Unbilled Receivable)</span>
                  <span className="font-bold">{formatRupiah(psakPreview.revenueThisMonth)}</span>
                </div>
                <div className="flex justify-between items-center text-amber-300 pl-4">
                  <span>(Cr) 4100 - Pendapatan Proyek Berdasarkan Progress (PSAK 72)</span>
                  <span className="font-bold">{formatRupiah(psakPreview.revenueThisMonth)}</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <input
                type="text"
                placeholder="Catatan tambahan untuk posting jurnal (opsional)..."
                value={psakNotes}
                onChange={e => setPsakNotes(e.target.value)}
                className="w-full sm:w-96 text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
              />

              <button
                onClick={handlePostPSAK72}
                disabled={psakPreview.revenueThisMonth <= 0}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs shadow flex items-center justify-center gap-2 transition ${
                  psakPreview.revenueThisMonth > 0
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Posting Jurnal PSAK 72 ({formatRupiah(psakPreview.revenueThisMonth)})</span>
              </button>
            </div>
          </div>

          {/* Table: Riwayat Pengakuan Pendapatan PSAK 72 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                Riwayat Jurnal Pengakuan Pendapatan PSAK 72 Terposting ({projectRecognitions.length})
              </h3>
              <span className="text-xs text-slate-400">Tersinkronisasi otomatis dengan buku besar</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">No. Pengakuan</th>
                    <th className="p-3">Periode</th>
                    <th className="p-3 text-right">Progress Fisik</th>
                    <th className="p-3 text-right">Revenue to Date</th>
                    <th className="p-3 text-right">Sudah Diakui</th>
                    <th className="p-3 text-right text-emerald-700">Diakui Bulan Ini</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Diposting Oleh</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projectRecognitions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        Belum ada pengakuan pendapatan PSAK 72 untuk proyek ini.
                      </td>
                    </tr>
                  ) : (
                    projectRecognitions.map(rec => (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-800">{rec.recognitionNo}</td>
                        <td className="p-3 font-semibold text-slate-700">
                          {rec.periodYear}-{String(rec.periodMonth).padStart(2, '0')}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-blue-700">{rec.progressPercent}%</td>
                        <td className="p-3 text-right font-mono">{formatRupiah(rec.revenueToDate)}</td>
                        <td className="p-3 text-right font-mono text-slate-500">{formatRupiah(rec.revenueRecognized)}</td>
                        <td className="p-3 text-right font-mono font-extrabold text-emerald-700">
                          {formatRupiah(rec.revenueThisMonth)}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            rec.status === 'POSTED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'REVERSED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 text-[11px]">
                          {rec.postedAt ? rec.postedAt.substring(0, 10) : '-'}
                        </td>
                        <td className="p-3 text-center">
                          {rec.status === 'POSTED' && currentRoleInfo.canApprove && (
                            <button
                              onClick={() => handleReversePSAK72(rec.id, rec.recognitionNo)}
                              className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1 transition"
                              title="Batalkan dan Balik Jurnal PSAK 72"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reverse</span>
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
        </div>
      )}

      {/* TAB 4: REKAP PAJAK KONTRAKTOR */}
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

      {/* TAB 5: LAPORAN PAJAK TAHUNAN & DJP (PSAK 1 - BATCH 9.6) */}
      {activeSubTab === 'psak1' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase">
                <FileSpreadsheet className="w-4 h-4" />
                <span>PSAK 1 & Format SPT Tahunan Badan Kontraktor</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mt-0.5">
                Laporan Keuangan Fiskal DJP vs Laporan Komersial Internal
              </h3>
              <p className="text-xs text-slate-500">
                Laporan resmi sesuai Formulir 1771-IV Lampiran III DJP (Penghasilan yang Dikenakan PPh Final Pasal 4 Ayat 2).
              </p>
            </div>

            {/* Toggle Fiscal vs Internal */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-300 text-xs">
              <button
                onClick={() => setTaxReportMode('fiscal')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  taxReportMode === 'fiscal' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Laporan Fiskal DJP (Resmi Pajak)
              </button>
              <button
                onClick={() => setTaxReportMode('internal')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  taxReportMode === 'internal' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Laporan Internal Direksi
              </button>
            </div>
          </div>

          {/* Tariffs Breakdown PP 9/2022 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Tarif Resmi PPh Final Jasa Konstruksi (PP No. 9 Tahun 2022)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-amber-600 font-mono font-bold text-lg">1.75%</div>
                <div className="font-bold text-slate-800 mt-1">Pekerjaan Konstruksi (Kualifikasi Kecil)</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Memiliki Sertifikat Badan Usaha (SBU) Kualifikasi Kecil.</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-blue-300 bg-blue-50/30">
                <div className="text-blue-700 font-mono font-bold text-lg">2.65%</div>
                <div className="font-bold text-slate-800 mt-1">Pekerjaan Konstruksi (Menengah & Besar)</div>
                <p className="text-[11px] text-slate-500 mt-0.5">SBU Menengah / Besar (Standard KontraktorPro).</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-rose-600 font-mono font-bold text-lg">4.00%</div>
                <div className="font-bold text-slate-800 mt-1">Tanpa Sertifikat Badan Usaha</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Penyedia jasa yang tidak memiliki sertifikasi resmi.</p>
              </div>
            </div>
          </div>

          {/* Lampiran 1771-IV Form Preview */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-800 text-white p-3 font-mono font-bold flex justify-between items-center">
              <span>FORMULIR 1771-IV (BAGIAN A: PENGHASILAN DIKENAKAN PPH FINAL)</span>
              <span className="text-amber-400">NPWP PT: {currentPT?.npwp || '-'}</span>
            </div>

            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-10">No</th>
                  <th className="p-3">Jenis Penghasilan</th>
                  <th className="p-3 text-right">Dasar Pengenaan Pajak (DPP / Bruto)</th>
                  <th className="p-3 text-center">Tarif</th>
                  <th className="p-3 text-right text-amber-800 font-bold">PPh Terutang Final (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-mono">1</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">Pelaksanaan Konstruksi ({currentProject.name})</div>
                    <div className="text-[11px] text-slate-500">Pekerjaan Jasa Pelaksanaan Konstruksi Kualifikasi Menengah</div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    {formatRupiah(totalMasuk)}
                  </td>
                  <td className="p-3 text-center font-mono font-bold">2.65%</td>
                  <td className="p-3 text-right font-mono font-bold text-amber-800">
                    {formatRupiah(Math.round(totalMasuk * 0.0265))}
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={2} className="p-3 text-right uppercase">Total Penghasilan & Pajak Final Terutang:</td>
                  <td className="p-3 text-right font-mono text-slate-900">{formatRupiah(totalMasuk)}</td>
                  <td className="p-3 text-center">-</td>
                  <td className="p-3 text-right font-mono text-amber-900">{formatRupiah(Math.round(totalMasuk * 0.0265))}</td>
                </tr>
              </tbody>
            </table>
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
                    checked={isTaxable}
                    onChange={e => setIsTaxable(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">Transaksi Resmi Fiskal DJP (Faktur Pajak)</span>
                </label>

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
