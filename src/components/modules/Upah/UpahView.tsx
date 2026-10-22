import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { formatRupiah, exportWagesToExcel, triggerPrintReport } from '../../../services/exportService';
import { WageRecord } from '../../../types';
import {
  Users2,
  PlusCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck,
  CreditCard,
  Building,
  Filter,
  Search,
  Download,
  Printer
} from 'lucide-react';

export const UpahView: React.FC = () => {
  const {
    currentProject,
    wageRecords,
    rabItems,
    rapItems,
    addWageRecord,
    updateWageStatus,
    currentRoleInfo,
    activeRole
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'borongan' | 'harian'>('all');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [wageType, setWageType] = useState<'borongan' | 'harian'>('borongan');
  const [mandorName, setMandorName] = useState('Mandor Sukarno (Tim Besi & Cor)');
  const [wbsCode, setWbsCode] = useState('II.1');
  const [workDesc, setWorkDesc] = useState('Pengecoran Balok & Kolom Lantai 2');
  const [workerCount, setWorkerCount] = useState(14);
  const [volumeDone, setVolumeDone] = useState(120);
  const [unitRate, setUnitRate] = useState(165000);
  const [unit, setUnit] = useState('m3');
  const [mandays, setMandays] = useState(36);
  const [dailyRate, setDailyRate] = useState(150000);

  if (!currentProject) {
    return <div className="p-8 text-center text-slate-500">Pilih proyek terlebih dahulu.</div>;
  }

  const projectWages = wageRecords.filter(w => w.projectId === currentProject.id);

  const filteredWages = projectWages.filter(w => {
    if (filterType === 'all') return true;
    return w.wageType === filterType;
  });

  // Totals
  const totalGross = projectWages.reduce((sum, w) => sum + w.grossAmount, 0);
  const totalNet = projectWages.reduce((sum, w) => sum + w.netPayable, 0);
  const totalPaid = projectWages.filter(w => w.status === 'lunas').reduce((sum, w) => sum + w.netPayable, 0);
  const totalPending = totalNet - totalPaid;

  const handleSubmitWage = (e: React.FormEvent) => {
    e.preventDefault();

    let gross = 0;
    if (wageType === 'borongan') {
      gross = volumeDone * unitRate;
    } else {
      gross = mandays * dailyRate;
    }

    const pph21 = Math.round(gross * 0.02);
    const net = gross - pph21;

    addWageRecord({
      projectId: currentProject.id,
      ptId: currentProject.ptId,
      wbsCode,
      workDescription: workDesc,
      wageType,
      periodStart: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
      periodEnd: new Date().toISOString().split('T')[0],
      mandorName,
      workerCount,
      volumeDone: wageType === 'borongan' ? volumeDone : undefined,
      unitRate: wageType === 'borongan' ? unitRate : undefined,
      unit: wageType === 'borongan' ? unit : undefined,
      mandaysTotal: wageType === 'harian' ? mandays : undefined,
      dailyRateAvg: wageType === 'harian' ? dailyRate : undefined,
      grossAmount: gross,
      pph21Percent: 2.0,
      pph21Amount: pph21,
      netPayable: net,
      status: 'diajukan',
      submittedBy: `${currentRoleInfo.title}`,
      paymentMethod: 'Transfer Bank'
    });

    setShowModal(false);
    alert('Pengajuan upah mandor berhasil dicatat!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
              <Users2 className="w-4 h-4" />
              <span>Manajemen Mandor & Upah Lapangan</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">
              Kontrol Upah (Harian, Borongan, & Pajak PPh 21)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Acuan bayar upah borong berdasarkan opname fisik, upah harian mandays, potongan PPh 21 (2%), dan audit verifikasi berjenjang.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportWagesToExcel(projectWages, currentProject.name)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow"
              title="Download Rekapitulasi Upah ke Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel Upah</span>
            </button>

            <button
              onClick={() => triggerPrintReport()}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 transition"
              title="Cetak Laporan Upah ke PDF"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Cetak PDF</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Input Klaim Upah Lapangan</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Total Akumulasi Upah</span>
            <div className="text-base font-extrabold font-mono text-slate-900 mt-0.5">
              {formatRupiah(totalGross)}
            </div>
          </div>

          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <span className="text-[11px] text-emerald-700 font-medium">Upah Lunas Terbayar</span>
            <div className="text-base font-extrabold font-mono text-emerald-900 mt-0.5">
              {formatRupiah(totalPaid)}
            </div>
          </div>

          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <span className="text-[11px] text-amber-700 font-medium">Kewajiban Belum Bayar</span>
            <div className="text-base font-extrabold font-mono text-amber-900 mt-0.5">
              {formatRupiah(totalPending)}
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <span className="text-[11px] text-blue-700 font-medium">Potongan Pajak PPh 21 (2%)</span>
            <div className="text-base font-extrabold font-mono text-blue-900 mt-0.5">
              {formatRupiah(Math.round(totalGross * 0.02))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            filterType === 'all' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Semua Dokumen Upah ({projectWages.length})
        </button>

        <button
          onClick={() => setFilterType('borongan')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            filterType === 'borongan' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Upah Borongan (Opname Fisik)
        </button>

        <button
          onClick={() => setFilterType('harian')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            filterType === 'harian' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Upah Harian (Absensi Mandays)
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">No. Dokumen</th>
                <th className="p-3">Metode & Mandor</th>
                <th className="p-3">Item Pekerjaan</th>
                <th className="p-3 text-right">Volume / Mandays</th>
                <th className="p-3 text-right">Tarif Dasar</th>
                <th className="p-3 text-right">Nilai Bruto</th>
                <th className="p-3 text-right text-rose-600">PPh 21 (2%)</th>
                <th className="p-3 text-right font-bold text-slate-900">Netto Diterima</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWages.map(w => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-700">{w.recordNumber}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{w.mandorName}</div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      Metode: <span className="font-semibold text-slate-700">{w.wageType}</span> ({w.workerCount} pekerja)
                    </div>
                  </td>
                  <td className="p-3 font-medium text-slate-800">
                    <div>{w.workDescription}</div>
                    <div className="text-[10px] text-slate-400">WBS: {w.wbsCode}</div>
                  </td>
                  <td className="p-3 text-right font-mono font-medium">
                    {w.wageType === 'borongan' ? `${w.volumeDone} ${w.unit}` : `${w.mandaysTotal} mandays`}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-600">
                    {formatRupiah(w.wageType === 'borongan' ? w.unitRate || 0 : w.dailyRateAvg || 0)}
                  </td>
                  <td className="p-3 text-right font-mono font-semibold text-slate-800">
                    {formatRupiah(w.grossAmount)}
                  </td>
                  <td className="p-3 text-right font-mono text-rose-600">
                    -{formatRupiah(w.pph21Amount)}
                  </td>
                  <td className="p-3 text-right font-mono font-extrabold text-emerald-700">
                    {formatRupiah(w.netPayable)}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      w.status === 'lunas'
                        ? 'bg-emerald-100 text-emerald-800'
                        : w.status === 'siap_bayar'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {w.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {w.status === 'diajukan' && (activeRole === 'site_manager' || activeRole === 'direktur') && (
                      <button
                        onClick={() => updateWageStatus(w.id, 'diverifikasi_sm')}
                        className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-500"
                      >
                        Verifikasi SM
                      </button>
                    )}
                    {w.status === 'diverifikasi_sm' && (activeRole === 'pm_teknik' || activeRole === 'direktur') && (
                      <button
                        onClick={() => updateWageStatus(w.id, 'siap_bayar')}
                        className="px-2 py-1 bg-amber-500 text-slate-950 text-[10px] font-bold rounded hover:bg-amber-400"
                      >
                        Approval PM
                      </button>
                    )}
                    {w.status === 'siap_bayar' && (activeRole === 'admin_keuangan' || activeRole === 'direktur') && (
                      <button
                        onClick={() => updateWageStatus(w.id, 'lunas')}
                        className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded hover:bg-emerald-500 shadow"
                      >
                        Cairkan Upah
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Wage */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmitWage} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Input Klaim Realisasi Upah Mandor</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Metode Perhitungan Upah</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setWageType('borongan')}
                    className={`py-1.5 rounded-lg border font-bold text-center ${
                      wageType === 'borongan' ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Borongan (Opname)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWageType('harian')}
                    className={`py-1.5 rounded-lg border font-bold text-center ${
                      wageType === 'harian' ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Harian (Mandays)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Nama Mandor / Tim</label>
                <input
                  type="text"
                  value={mandorName}
                  onChange={e => setMandorName(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Uraian Pekerjaan</label>
                <input
                  type="text"
                  value={workDesc}
                  onChange={e => setWorkDesc(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>

              {wageType === 'borongan' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700">Volume Capaian ({unit})</label>
                    <input
                      type="number"
                      value={volumeDone}
                      onChange={e => setVolumeDone(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700">Harga Satuan Borong (Rp)</label>
                    <input
                      type="number"
                      value={unitRate}
                      onChange={e => setUnitRate(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700">Total Mandays (OH)</label>
                    <input
                      type="number"
                      value={mandays}
                      onChange={e => setMandays(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700">Tarif Rata2 per Hari (Rp)</label>
                    <input
                      type="number"
                      value={dailyRate}
                      onChange={e => setDailyRate(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              )}
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
                Simpan Klaim Upah
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
