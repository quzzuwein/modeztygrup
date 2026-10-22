import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { formatRupiah } from '../../../services/exportService';
import {
  Smartphone,
  CheckCircle2,
  CloudSun,
  Camera,
  Boxes,
  Plus,
  Send,
  AlertTriangle,
  ArrowLeft,
  Wifi,
  Clock,
  Sparkles
} from 'lucide-react';

export const MobileLapanganView: React.FC = () => {
  const {
    currentProject,
    stockItems,
    rabItems,
    submitDailyReport,
    addMaterialRequest,
    setIsMobileFieldMode,
    currentRoleInfo
  } = useApp();

  const [activeScreen, setActiveScreen] = useState<'home' | 'progres' | 'spb' | 'stok'>('home');
  const [synced, setSynced] = useState(true);

  // Quick Progress form state
  const [selectedRabId, setSelectedRabId] = useState(rabItems[0]?.id || '');
  const [volumeToday, setTodayVolume] = useState<number>(12);
  const [weather, setWeather] = useState<'Cerah' | 'Hujan'>('Cerah');
  const [notes, setNotes] = useState('Pengecoran berjalan lancar dengan slump 12cm.');
  const [photoAdded, setPhotoAdded] = useState(false);

  // Quick SPB form state
  const [spbMaterialId, setSpbMaterialId] = useState(stockItems[0]?.id || '');
  const [spbQty, setSpbQty] = useState<number>(50);

  if (!currentProject) {
    return <div className="p-4 text-center text-slate-500">Pilih proyek terlebih dahulu.</div>;
  }

  const handleSendQuickProgress = (e: React.FormEvent) => {
    e.preventDefault();
    const rab = rabItems.find(r => r.id === selectedRabId) || rabItems[0];

    submitDailyReport({
      projectId: currentProject.id,
      ptId: currentProject.ptId,
      date: new Date().toISOString().split('T')[0],
      dayNumber: 281,
      weather: {
        pagi: weather === 'Cerah' ? 'Cerah' : 'Hujan Ringan',
        siang: weather === 'Cerah' ? 'Berawan' : 'Hujan Ringan',
        sore: weather === 'Cerah' ? 'Cerah' : 'Hujan Lebat'
      },
      manpower: { pekerja: 20, tukang: 15, kepalaTukang: 2, mandor: 2, operator: 1 },
      heavyEquipments: [],
      workProgress: [
        {
          rabItemId: rab.id,
          wbsCode: rab.wbsCode,
          description: rab.description,
          volumeToday,
          unit: rab.unit,
          cumulativeVolume: 610,
          totalPlanVolume: rab.volume,
          percentComplete: Math.min(100, currentProject.actualProgressPercent + 0.4)
        }
      ],
      materialUsages: [],
      obstacles: notes,
      instructions: 'Dokumentasi terunggah via Mobile Lapangan App.',
      photoNotes: photoAdded ? ['Foto slump test terverifikasi'] : [],
      submittedBy: `${currentRoleInfo.title} (Mobile Sync)`,
      status: 'submitted'
    });

    setSynced(true);
    setActiveScreen('home');
    alert('Laporan progres harian berhasil disinkronkan ke server pusat!');
  };

  const handleSendQuickSPB = (e: React.FormEvent) => {
    e.preventDefault();
    const mat = stockItems.find(s => s.id === spbMaterialId);
    if (!mat) return;

    addMaterialRequest({
      projectId: currentProject.id,
      ptId: currentProject.ptId,
      requestedBy: `${currentRoleInfo.title} (Mobile)`,
      role: currentRoleInfo.title,
      requestDate: new Date().toISOString().split('T')[0],
      requiredDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      wbsSection: 'Permintaan Darurat Lapangan',
      urgency: 'urgent',
      status: 'diajukan',
      items: [
        {
          materialId: mat.id,
          materialName: mat.name,
          unit: mat.unit,
          requestedQty: spbQty,
          approvedQty: spbQty,
          fulfilledFromOfficeQty: 0,
          fulfilledFromPOQty: 0,
          notes: 'Diajukan via aplikasi mobile lapangan'
        }
      ],
      approvalHistory: []
    });

    setActiveScreen('home');
    alert('SPB Kilat berhasil diajukan ke Logistik Kantor!');
  };

  return (
    <div className="max-w-md mx-auto min-h-[85vh] bg-slate-900 text-white rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-800 flex flex-col justify-between">
      {/* Mobile Top Bar */}
      <div>
        <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-tight text-slate-300 flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>ONLINE • SINKRON OTOMATIS</span>
            </span>
          </div>

          <button
            onClick={() => setIsMobileFieldMode(false)}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Tutup Mobile</span>
            <ArrowLeft className="w-3 h-3" />
          </button>
        </div>

        {/* Project Header Card */}
        <div className="p-4 bg-gradient-to-b from-slate-900 to-slate-800 border-b border-slate-800">
          <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
            LAPORAN LAPANGAN MANDOR & PELAKSANA
          </div>
          <h2 className="text-base font-extrabold text-white mt-0.5 truncate">
            {currentProject.name}
          </h2>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Progress Fisik:</span>
            <span className="font-mono font-bold text-emerald-400">{currentProject.actualProgressPercent}%</span>
          </div>

          {/* Quick Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-2 mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full"
              style={{ width: `${currentProject.actualProgressPercent}%` }}
            />
          </div>
        </div>

        {/* SCREEN: HOME MENU */}
        {activeScreen === 'home' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Button 1: Input Progres */}
              <button
                onClick={() => setActiveScreen('progres')}
                className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-left transition shadow-lg flex flex-col justify-between h-32"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white leading-tight">Input Progres Harian</div>
                  <div className="text-[10px] text-emerald-200 mt-0.5">Volume & Foto Opname</div>
                </div>
              </button>

              {/* Button 2: SPB Kilat */}
              <button
                onClick={() => setActiveScreen('spb')}
                className="p-4 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-left transition shadow-lg flex flex-col justify-between h-32"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white leading-tight">SPB Bahan Kilat</div>
                  <div className="text-[10px] text-amber-200 mt-0.5">Minta Material Segera</div>
                </div>
              </button>

              {/* Button 3: Cek Stok Lapangan */}
              <button
                onClick={() => setActiveScreen('stok')}
                className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-left transition shadow-lg flex flex-col justify-between h-32 col-span-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Boxes className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
                    {stockItems.length} Material
                  </span>
                </div>
                <div>
                  <div className="font-bold text-sm text-white leading-tight">Cek Sisa Stok Gudang Lapangan</div>
                  <div className="text-[10px] text-blue-200 mt-0.5">Lihat buffer semen, besi, dan multiplek</div>
                </div>
              </button>
            </div>

            {/* Daily status box */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1.5">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Status Sinkronisasi Mobile</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Data lapangan langsung terhubung ke dashboard direktur & monitoring serapan anggaran RAP real-time.
              </p>
            </div>
          </div>
        )}

        {/* SCREEN: INPUT PROGRES */}
        {activeScreen === 'progres' && (
          <form onSubmit={handleSendQuickProgress} className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-xs text-emerald-400">INPUT CAPAIAN FISIK HARI INI</span>
              <button
                type="button"
                onClick={() => setActiveScreen('home')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Kembali
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-400 font-semibold">Pilih Item Pekerjaan</label>
                <select
                  value={selectedRabId}
                  onChange={e => setSelectedRabId(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                >
                  {rabItems.map(r => (
                    <option key={r.id} value={r.id}>{r.wbsCode} - {r.description}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold">Capaian Volume Hari Ini</label>
                <input
                  type="number"
                  step="0.5"
                  value={volumeToday}
                  onChange={e => setTodayVolume(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold">Kondisi Cuaca</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setWeather('Cerah')}
                    className={`py-2 rounded-xl text-xs font-bold ${
                      weather === 'Cerah' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Cerah
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeather('Hujan')}
                    className={`py-2 rounded-xl text-xs font-bold ${
                      weather === 'Hujan' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Hujan
                  </button>
                </div>
              </div>

              {/* Photo Upload Simulation */}
              <div>
                <label className="text-slate-400 font-semibold">Lampiran Foto Dokumentasi</label>
                <button
                  type="button"
                  onClick={() => setPhotoAdded(!photoAdded)}
                  className={`w-full mt-1 p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                    photoAdded
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>{photoAdded ? '1 Foto Lapangan Terlampir (Slump Test)' : 'Ambil Foto Lapangan via Kamera'}</span>
                </button>
              </div>

              <div>
                <label className="text-slate-400 font-semibold">Catatan Mandor / Pelaksana</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg mt-2"
            >
              Kirim Progres ke Kantor Pusat
            </button>
          </form>
        )}

        {/* SCREEN: QUICK SPB */}
        {activeScreen === 'spb' && (
          <form onSubmit={handleSendQuickSPB} className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-xs text-amber-400">SURAT PERMINTAAN BAHAN (SPB KILAT)</span>
              <button
                type="button"
                onClick={() => setActiveScreen('home')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Kembali
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold">Pilih Material</label>
                <select
                  value={spbMaterialId}
                  onChange={e => setSpbMaterialId(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                >
                  {stockItems.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold">Jumlah Permintaan (Qty)</label>
                <input
                  type="number"
                  min="1"
                  value={spbQty}
                  onChange={e => setSpbQty(parseInt(e.target.value) || 0)}
                  className="w-full mt-1 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[11px]">
                SPB kilat akan langsung masuk notifikasi Site Manager & Logistik Kantor untuk diproses pengirimannya.
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg mt-2"
            >
              Kirim SPB Mendesak
            </button>
          </form>
        )}

        {/* SCREEN: CEK STOK */}
        {activeScreen === 'stok' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-xs text-blue-400">SISA STOK GUDANG LAPANGAN</span>
              <button
                onClick={() => setActiveScreen('home')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Kembali
              </button>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto">
              {stockItems.map(s => {
                const qty = s.fieldStocks[currentProject.id] || 0;
                const isLow = qty <= s.minFieldStock;

                return (
                  <div key={s.id} className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{s.name}</div>
                      <div className="text-[10px] text-slate-400">{s.category} • Buffer min: {s.minFieldStock} {s.unit}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-extrabold text-sm ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {qty} {s.unit}
                      </div>
                      {isLow && <span className="text-[10px] text-rose-400 font-bold">MENIPIS</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-[10px] text-slate-500">
        KontraktorPro Field Companion • v2.4
      </div>
    </div>
  );
};
