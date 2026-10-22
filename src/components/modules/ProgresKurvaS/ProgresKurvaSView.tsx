import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { formatRupiah, triggerPrintReport, exportComprehensiveExcel } from '../../../services/exportService';
import {
  LineChart,
  Calendar,
  CloudSun,
  Users,
  Wrench,
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  Printer,
  Download
} from 'lucide-react';

export const ProgresKurvaSView: React.FC = () => {
  const {
    currentProject,
    currentPT,
    dailyReports,
    rabItems,
    rapItems,
    stockItems,
    wageRecords,
    financialEntries,
    submitDailyReport,
    currentRoleInfo
  } = useApp();

  const [activeTab, setActiveTab] = useState<'kurvas' | 'harian'>('kurvas');
  const [showModal, setShowModal] = useState(false);

  // Form states for Daily Report
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [weatherPagi, setWeatherPagi] = useState<'Cerah' | 'Berawan' | 'Hujan Ringan' | 'Hujan Lebat'>('Cerah');
  const [weatherSiang, setWeatherSiang] = useState<'Cerah' | 'Berawan' | 'Hujan Ringan' | 'Hujan Lebat'>('Berawan');
  const [weatherSore, setWeatherSore] = useState<'Cerah' | 'Berawan' | 'Hujan Ringan' | 'Hujan Lebat'>('Hujan Ringan');
  const [workersCount, setWorkersCount] = useState({ pekerja: 24, tukang: 18, kepalaTukang: 3, mandor: 2, operator: 2 });
  const [todayVolume, setTodayVolume] = useState<number>(15.0);
  const [obstacles, setObstacles] = useState('Pengecoran selesai tepat waktu sebelum hujan sore.');
  const [instructions, setInstructions] = useState('Lakukan perawatan curing basah (sprinkle air) pada plat lantai beton.');

  if (!currentProject || !currentPT) {
    return <div className="p-8 text-center text-slate-500">Pilih proyek dan entitas PT terlebih dahulu.</div>;
  }

  const projectReports = dailyReports.filter(d => d.projectId === currentProject.id);

  // Generate 12-week S-Curve points for visualization
  const sCurvePoints = [
    { week: 'M-1', plan: 2.0, actual: 2.1, costBurn: 1.8 },
    { week: 'M-2', plan: 5.5, actual: 5.8, costBurn: 4.9 },
    { week: 'M-4', plan: 12.0, actual: 12.4, costBurn: 11.2 },
    { week: 'M-6', plan: 20.5, actual: 20.0, costBurn: 18.5 },
    { week: 'M-8', plan: 29.0, actual: 27.5, costBurn: 25.8 },
    { week: 'M-10', plan: 38.0, actual: 35.2, costBurn: 33.4 },
    { week: 'M-12 (Saat Ini)', plan: currentProject.plannedProgressPercent, actual: currentProject.actualProgressPercent, costBurn: (currentProject.totalCostRealized / currentProject.totalRapBudget) * 100 },
    { week: 'M-14 (Proyeksi)', plan: 52.0, actual: null, costBurn: null },
    { week: 'M-18 (Proyeksi)', plan: 68.0, actual: null, costBurn: null },
    { week: 'M-24 (Proyeksi)', plan: 85.0, actual: null, costBurn: null },
    { week: 'M-30 (Selesai)', plan: 100.0, actual: null, costBurn: null }
  ];

  const handleAddDailyReport = (e: React.FormEvent) => {
    e.preventDefault();
    const rabItem = rabItems.find(r => r.projectId === currentProject.id) || rabItems[0];

    submitDailyReport({
      projectId: currentProject.id,
      ptId: currentProject.ptId,
      date: reportDate,
      dayNumber: 280,
      weather: {
        pagi: weatherPagi,
        siang: weatherSiang,
        sore: weatherSore
      },
      manpower: workersCount,
      heavyEquipments: [
        { name: 'Tower Crane 45m', qty: 1, hoursOperated: 8.0, status: 'Operasional' },
        { name: 'Concrete Vibrator', qty: 2, hoursOperated: 6.0, status: 'Operasional' }
      ],
      workProgress: [
        {
          rabItemId: rabItem?.id || 'rab-1',
          wbsCode: rabItem?.wbsCode || 'II.1',
          description: rabItem?.description || 'Pekerjaan Struktur',
          volumeToday: todayVolume,
          unit: rabItem?.unit || 'm3',
          cumulativeVolume: 580,
          totalPlanVolume: 1420,
          percentComplete: Math.min(100, currentProject.actualProgressPercent + 0.3)
        }
      ],
      materialUsages: [
        { materialId: 'mat-1', materialName: 'Semen PC', qty: 60, unit: 'sak', wbsCode: 'II.1' }
      ],
      obstacles,
      instructions,
      photoNotes: ['Dokumentasi pengujian slump test beton', 'Pemasangan rambu K3 area cor'],
      submittedBy: `${currentRoleInfo.title}`,
      status: 'submitted'
    });

    setShowModal(false);
    alert('Laporan Harian Proyek (LHR) berhasil dikirim dan disinkronisasi ke progres fisik!');
  };

  const deviasi = currentProject.actualProgressPercent - currentProject.plannedProgressPercent;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
              <LineChart className="w-4 h-4" />
              <span>Monitoring Real-Time Kurva S & Lapangan</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">
              Pemantauan Progres Fisik Berbanding Serapan Anggaran
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Integrasi Kurva S (Earned Value Management) antara bobot rencana baseline, progres fisik aktual lapangan, dan serapan kas RAP.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow"
              title="Download Seluruh Rekap Progres & Biaya ke Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel Progres</span>
            </button>

            <button
              onClick={() => triggerPrintReport()}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 transition"
              title="Cetak Kurva S & Progres ke PDF"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Cetak PDF</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Input Laporan Harian (LHR)</span>
            </button>
          </div>
        </div>

        {/* 4 Performance Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200">
            <span className="text-[11px] text-blue-700 font-semibold uppercase">Jadwal Rencana (PV)</span>
            <div className="text-xl font-extrabold font-mono text-blue-900 mt-0.5">
              {currentProject.plannedProgressPercent.toFixed(1)}%
            </div>
            <span className="text-[10px] text-blue-600">Schedule Baseline</span>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200">
            <span className="text-[11px] text-emerald-700 font-semibold uppercase">Fisik Aktual (EV)</span>
            <div className="text-xl font-extrabold font-mono text-emerald-900 mt-0.5">
              {currentProject.actualProgressPercent.toFixed(1)}%
            </div>
            <span className="text-[10px] text-emerald-600">Realisasi Opname Lapangan</span>
          </div>

          <div className={`p-3 rounded-lg border ${deviasi >= 0 ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800' : 'bg-rose-50/70 border-rose-200 text-rose-800'}`}>
            <span className="text-[11px] font-semibold uppercase">Deviasi Jadwal (SV)</span>
            <div className="text-xl font-extrabold font-mono mt-0.5 flex items-center gap-1">
              {deviasi >= 0 ? <ArrowUpRight className="w-5 h-5 text-emerald-600" /> : <ArrowDownRight className="w-5 h-5 text-rose-600" />}
              <span>{deviasi >= 0 ? `+${deviasi.toFixed(1)}%` : `${deviasi.toFixed(1)}%`}</span>
            </div>
            <span className="text-[10px]">{deviasi >= 0 ? 'Proyek Maju (Ahead)' : 'Terlambat (Need Action)'}</span>
          </div>

          <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200">
            <span className="text-[11px] text-amber-700 font-semibold uppercase">Serapan Biaya RAP (AC)</span>
            <div className="text-xl font-extrabold font-mono text-amber-900 mt-0.5">
              {((currentProject.totalCostRealized / currentProject.totalRapBudget) * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-amber-700">Cost Burn Rate RAP</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('kurvas')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'kurvas' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Visualisasi & Tabel Kurva S
        </button>

        <button
          onClick={() => setActiveTab('harian')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'harian' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Laporan Harian Proyek ({projectReports.length} Dokumen)
        </button>
      </div>

      {/* TAB 1: KURVA S VISUALIZATION & TABLE */}
      {activeTab === 'kurvas' && (
        <div className="space-y-6">
          {/* Visual Graph Representation */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Grafik Kurva S Kumulatif: Rencana vs Aktual vs Serapan Anggaran
                </h3>
                <p className="text-xs text-slate-500">
                  Garis biru menunjukkan rencana kontrak; Hijau menunjukkan progres fisik aktual; Amber menunjukkan serapan anggaran RAP.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-blue-700">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Rencana Baseline (%)</span>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Fisik Aktual (%)</span>
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Serapan Biaya (%)</span>
                </span>
              </div>
            </div>

            {/* Simulated S-Curve Bars & Track */}
            <div className="pt-4 pb-2 space-y-4">
              <div className="grid grid-cols-11 gap-2 text-center text-[10px] text-slate-500 font-mono">
                {sCurvePoints.map(p => (
                  <div key={p.week} className="border-b pb-1 font-semibold">
                    {p.week}
                  </div>
                ))}
              </div>

              {/* Graphical Bars */}
              <div className="h-56 bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-end justify-between gap-2">
                {sCurvePoints.map((p, idx) => (
                  <div key={idx} className="flex-1 flex items-end justify-center gap-1 h-full">
                    {/* Plan Bar */}
                    <div
                      className="w-3 bg-blue-400 rounded-t transition-all hover:bg-blue-600"
                      style={{ height: `${p.plan}%` }}
                      title={`Rencana: ${p.plan}%`}
                    />
                    {/* Actual Bar */}
                    {p.actual !== null && (
                      <div
                        className="w-3 bg-emerald-500 rounded-t transition-all hover:bg-emerald-600"
                        style={{ height: `${p.actual}%` }}
                        title={`Aktual: ${p.actual}%`}
                      />
                    )}
                    {/* Cost Burn Bar */}
                    {p.costBurn !== null && (
                      <div
                        className="w-3 bg-amber-500 rounded-t transition-all hover:bg-amber-600"
                        style={{ height: `${p.costBurn}%` }}
                        title={`Serapan Biaya: ${p.costBurn.toFixed(1)}%`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* S-Curve Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Tabel Matriks Progres & Deviasi Mingguan</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Periode</th>
                    <th className="p-3 text-right">Rencana Kumulatif (%)</th>
                    <th className="p-3 text-right">Fisik Aktual Kumulatif (%)</th>
                    <th className="p-3 text-right">Deviasi Jadwal (SV)</th>
                    <th className="p-3 text-right">Serapan Biaya RAP (%)</th>
                    <th className="p-3 text-center">Status Lapangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sCurvePoints.map((p, idx) => {
                    const dev = p.actual !== null ? p.actual - p.plan : null;
                    return (
                      <tr key={idx} className="hover:bg-slate-50 font-mono">
                        <td className="p-3 font-bold text-slate-800">{p.week}</td>
                        <td className="p-3 text-right text-blue-700 font-semibold">{p.plan.toFixed(1)}%</td>
                        <td className="p-3 text-right text-emerald-700 font-bold">
                          {p.actual !== null ? `${p.actual.toFixed(1)}%` : '-'}
                        </td>
                        <td className="p-3 text-right font-bold">
                          {dev !== null ? (
                            <span className={dev >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                              {dev >= 0 ? `+${dev.toFixed(1)}%` : `${dev.toFixed(1)}%`}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="p-3 text-right text-amber-700 font-semibold">
                          {p.costBurn !== null ? `${p.costBurn.toFixed(1)}%` : '-'}
                        </td>
                        <td className="p-3 text-center">
                          {dev !== null ? (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              dev >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {dev >= 0 ? 'Ahead' : 'Delay'}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Rencana Proyeksi</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LAPORAN HARIAN PROYEK */}
      {activeTab === 'harian' && (
        <div className="space-y-4">
          {projectReports.map(rep => (
            <div key={rep.id} className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-900 text-amber-300 px-2 py-0.5 rounded">
                      {rep.reportNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Tanggal: {rep.date} (Hari ke-{rep.dayNumber})
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Dibuat oleh: <span className="font-semibold text-slate-800">{rep.submittedBy}</span> • Diverifikasi: <span className="font-semibold text-slate-800">{rep.reviewedBy}</span>
                  </div>
                </div>

                {/* Weather Badges */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="bg-slate-100 px-2 py-1 rounded text-slate-700">
                    Pagi: <strong>{rep.weather.pagi}</strong>
                  </div>
                  <div className="bg-slate-100 px-2 py-1 rounded text-slate-700">
                    Siang: <strong>{rep.weather.siang}</strong>
                  </div>
                  <div className="bg-slate-100 px-2 py-1 rounded text-slate-700">
                    Sore: <strong>{rep.weather.sore}</strong>
                  </div>
                </div>
              </div>

              {/* Manpower & Equipments */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-50 p-3 rounded-lg text-xs">
                <div>
                  <span className="text-slate-400">Pekerja:</span>
                  <div className="font-bold font-mono">{rep.manpower.pekerja} org</div>
                </div>
                <div>
                  <span className="text-slate-400">Tukang:</span>
                  <div className="font-bold font-mono">{rep.manpower.tukang} org</div>
                </div>
                <div>
                  <span className="text-slate-400">Kepala Tukang:</span>
                  <div className="font-bold font-mono">{rep.manpower.kepalaTukang} org</div>
                </div>
                <div>
                  <span className="text-slate-400">Mandor:</span>
                  <div className="font-bold font-mono">{rep.manpower.mandor} org</div>
                </div>
                <div>
                  <span className="text-slate-400">Total Tenaga:</span>
                  <div className="font-extrabold font-mono text-emerald-700">
                    {rep.manpower.pekerja + rep.manpower.tukang + rep.manpower.kepalaTukang + rep.manpower.mandor + rep.manpower.operator} org
                  </div>
                </div>
              </div>

              {/* Work Items Progress */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase">Progres Pekerjaan Hari Ini:</div>
                {rep.workProgress.map((wp, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900">{wp.description}</div>
                      <div className="text-[11px] text-slate-500 font-mono">WBS: {wp.wbsCode}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-700">
                        +{wp.volumeToday} {wp.unit} ({wp.percentComplete}% Kumulatif)
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {wp.cumulativeVolume} dari {wp.totalPlanVolume} {wp.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Obstacles & Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
                <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
                  <span className="font-bold text-amber-900">Kendala Lapangan:</span>
                  <p className="text-slate-700 mt-1">{rep.obstacles || 'Tidak ada kendala berarti.'}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200">
                  <span className="font-bold text-blue-900">Instruksi Pengawas:</span>
                  <p className="text-slate-700 mt-1">{rep.instructions || 'Lanjutkan pekerjaan sesuai metode kerja.'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Input Laporan Harian */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddDailyReport} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-sm">Input Laporan Harian Proyek (LHR)</h3>
            
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Tanggal Laporan</label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={e => setReportDate(e.target.value)}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Progres Cor Hari Ini (m3)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={todayVolume}
                    onChange={e => setTodayVolume(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Weather inputs */}
              <div>
                <label className="font-semibold text-slate-700">Kondisi Cuaca Lapangan</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div>
                    <span className="text-[10px] text-slate-500">Pagi</span>
                    <select
                      value={weatherPagi}
                      onChange={e => setWeatherPagi(e.target.value as any)}
                      className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="Cerah">Cerah</option>
                      <option value="Berawan">Berawan</option>
                      <option value="Hujan Ringan">Hujan Ringan</option>
                      <option value="Hujan Lebat">Hujan Lebat</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Siang</span>
                    <select
                      value={weatherSiang}
                      onChange={e => setWeatherSiang(e.target.value as any)}
                      className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="Cerah">Cerah</option>
                      <option value="Berawan">Berawan</option>
                      <option value="Hujan Ringan">Hujan Ringan</option>
                      <option value="Hujan Lebat">Hujan Lebat</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Sore</span>
                    <select
                      value={weatherSore}
                      onChange={e => setWeatherSore(e.target.value as any)}
                      className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="Cerah">Cerah</option>
                      <option value="Berawan">Berawan</option>
                      <option value="Hujan Ringan">Hujan Ringan</option>
                      <option value="Hujan Lebat">Hujan Lebat</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Obstacles & instructions */}
              <div>
                <label className="font-semibold text-slate-700">Kendala Lapangan</label>
                <textarea
                  rows={2}
                  value={obstacles}
                  onChange={e => setObstacles(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Instruksi Site Manager / PM</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
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
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
              >
                Kirim Laporan Harian
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
