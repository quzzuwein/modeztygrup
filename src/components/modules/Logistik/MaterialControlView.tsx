import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { formatRupiah } from '../../../services/exportService';
import { MaterialControlItem, MaterialControlStatus } from '../../../types';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  PackageX,
  PackageCheck,
  Search,
  Filter,
  Download,
  Eye,
  FileSpreadsheet,
  X,
  Layers,
  ShoppingBag,
  TrendingUp,
  Activity,
  Calendar,
  AlertCircle,
  Truck
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const MaterialControlView: React.FC = () => {
  const { currentProject, currentRoleInfo, activeRole, getMaterialControlSummary } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedWarehouse, setSelectedWarehouse] = useState<'ALL' | 'FIELD' | 'OFFICE'>('ALL');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialControlItem | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'rap' | 'po' | 'consumption'>('rap');

  if (!currentProject) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        Pilih proyek terlebih dahulu untuk melihat dashboard Kontrol Material.
      </div>
    );
  }

  const summary = getMaterialControlSummary(currentProject.id);

  // Permissions according to spec:
  // COMPANY_OWNER, DIRECTOR, PM, PROCUREMENT can export
  const canExport = ['direktur', 'pm_teknik', 'pm_lapangan', 'procurement'].includes(activeRole);

  // Filtered items
  const filteredItems = useMemo(() => {
    return summary.items.filter(item => {
      const matchSearch =
        item.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.materialCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [summary.items, searchTerm, selectedStatus]);

  // Warning lists
  const kurangMaterials = summary.items.filter(i => i.status === 'KURANG');
  const berlebihMaterials = summary.items.filter(i => i.status === 'BERLEBIH');
  const belumDipesanMaterials = summary.items.filter(i => i.status === 'BELUM_DIPESAN');

  // Export to Excel handler
  const handleExportExcel = () => {
    if (!canExport) {
      alert('Akses ditolak: Hanya Direktur, PM, dan Procurement yang dapat mengunduh data kontrol material.');
      return;
    }

    const exportRows = filteredItems.map((item, idx) => ({
      No: idx + 1,
      'Kode Material': item.materialCode,
      'Nama Material': item.materialName,
      Satuan: item.unit,
      'Kebutuhan (RAP)': item.kebutuhanRap,
      'Dipesan (PO)': item.dipesan,
      Diterima: item.diterima,
      Dipakai: item.dipakai,
      'Sisa Stok Lapangan': item.sisaStok,
      Status: item.status,
      Peringatan: item.warning || '-',
      'Nilai Kebutuhan (Rp)': item.nilaiKebutuhan,
      'Nilai Dipesan (Rp)': item.nilaiDipesan
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kontrol Material RAP');
    XLSX.writeFile(workbook, `Kontrol_Material_RAP_${currentProject.code}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const renderStatusBadge = (status: MaterialControlStatus) => {
    switch (status) {
      case 'AMAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Aman
          </span>
        );
      case 'KURANG':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Kurang
          </span>
        );
      case 'BERLEBIH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Berlebih
          </span>
        );
      case 'BELUM_DIPESAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <PackageX className="w-3.5 h-3.5 text-slate-500" />
            Belum Dipesan
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Kontrol Material dari RAP — Real-Time Procurement
              </h2>
              <p className="text-sm text-slate-500">
                Otomatisasi kebutuhan material berbasis belanja real (RAP aktif) vs PO pengadaan, penerimaan gudang & pemakaian lapangan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm ${
              canExport
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
            title={canExport ? 'Unduh Laporan Excel Kontrol Material' : 'Role Anda tidak memiliki hak export Excel'}
          >
            <Download className="w-4 h-4" />
            Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* 4 Summary Cards (Batch 10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Material RAP</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{summary.totalMaterial} <span className="text-xs font-normal text-slate-500">Jenis</span></p>
            <p className="text-xs text-slate-400 mt-1">Nilai: {formatRupiah(summary.totalNilaiKebutuhan)}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Material Kurang</span>
            <p className="text-2xl font-black text-rose-700 mt-1">{summary.kurangCount} <span className="text-xs font-normal text-rose-600">Perlu Dipesan</span></p>
            <p className="text-xs text-rose-500 mt-1">Stok & PO &lt; 80% Kebutuhan</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Material Aman</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{summary.amanCount} <span className="text-xs font-normal text-emerald-600">Sesuai Pagu</span></p>
            <p className="text-xs text-emerald-500 mt-1">Stok & PO seimbang</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Material Berlebih</span>
            <p className="text-2xl font-black text-amber-700 mt-1">{summary.berlebihCount} <span className="text-xs font-normal text-amber-600">Over-budget</span></p>
            <p className="text-xs text-amber-500 mt-1">PO &gt; 110% Kebutuhan RAP</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Auto-Warning Banners */}
      <div className="space-y-3">
        {kurangMaterials.length > 0 && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl shadow-sm flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">
                  PERINGATAN: {kurangMaterials.length} Material Kritis Mengalami Kekurangan di Lapangan!
                </h4>
                <p className="text-xs text-rose-700 mt-1">
                  Material berikut berada di bawah 80% dari target kebutuhan RAP. Segera buat Purchase Order (PO) agar tidak menghambat progres:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {kurangMaterials.slice(0, 4).map(item => (
                    <span key={item.materialId} className="px-2 py-0.5 bg-rose-200 text-rose-900 rounded text-xs font-semibold">
                      🔴 {item.materialName}: {item.warning || 'Stok Menipis'}
                    </span>
                  ))}
                  {kurangMaterials.length > 4 && (
                    <span className="text-xs text-rose-600 font-medium self-center">
                      +{kurangMaterials.length - 4} material lainnya
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {berlebihMaterials.length > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  PERINGATAN PEMBOROSAN: {berlebihMaterials.length} Material Dipesan Melebihi Pagu RAP (&gt; 110%)!
                </h4>
                <p className="text-xs text-amber-700 mt-1">
                  Uang tunai proyek tertahan dalam bentuk stok mati. Cek komitmen PO supplier berikut:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {berlebihMaterials.slice(0, 3).map(item => (
                    <span key={item.materialId} className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded text-xs font-semibold">
                      ⚠️ {item.materialName}: {item.warning}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {belumDipesanMaterials.length > 0 && (
          <div className="bg-slate-100 border-l-4 border-slate-400 p-4 rounded-r-xl shadow-sm flex items-start gap-3">
            <PackageX className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                INFORMASI PENGADAAN: {belumDipesanMaterials.length} Material Belum Pernah Dipesan ke Supplier
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Kebutuhan RAP sudah didefinisikan tetapi belum ada penerbitan Purchase Order sama sekali.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari material berdasarkan nama atau kode (misal: Semen, MAT-BSI-16)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-700 shrink-0">
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-3 py-1.5 rounded transition ${selectedStatus === 'ALL' ? 'bg-white shadow text-slate-900 font-bold' : 'hover:bg-slate-200'}`}
            >
              Semua ({summary.totalMaterial})
            </button>
            <button
              onClick={() => setSelectedStatus('KURANG')}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1 ${selectedStatus === 'KURANG' ? 'bg-rose-500 text-white font-bold' : 'hover:bg-slate-200 text-rose-700'}`}
            >
              🔴 Kurang ({summary.kurangCount})
            </button>
            <button
              onClick={() => setSelectedStatus('AMAN')}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1 ${selectedStatus === 'AMAN' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-200 text-emerald-700'}`}
            >
              ✅ Aman ({summary.amanCount})
            </button>
            <button
              onClick={() => setSelectedStatus('BERLEBIH')}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1 ${selectedStatus === 'BERLEBIH' ? 'bg-amber-500 text-white font-bold' : 'hover:bg-slate-200 text-amber-700'}`}
            >
              ⚠️ Berlebih ({summary.berlebihCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Material Control Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Material</th>
                <th className="py-3.5 px-3 text-center">Satuan</th>
                <th className="py-3.5 px-3 text-right">Kebutuhan (RAP)</th>
                <th className="py-3.5 px-3 text-right">Dipesan (PO)</th>
                <th className="py-3.5 px-3 text-right">Diterima</th>
                <th className="py-3.5 px-3 text-right">Dipakai</th>
                <th className="py-3.5 px-3 text-right font-black">Sisa Stok</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada material yang sesuai kriteria pencarian atau RAP proyek belum terisi.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const percentOrdered = item.kebutuhanRap > 0 ? Math.min(150, Math.round((item.dipesan / item.kebutuhanRap) * 100)) : 0;
                  return (
                    <tr key={item.materialId} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.materialName}</div>
                        <div className="text-xs text-slate-400 font-mono">{item.materialCode}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-slate-600">{item.unit}</td>
                      <td className="py-3 px-3 text-right font-bold text-indigo-700">
                        {item.kebutuhanRap.toLocaleString('id-ID')}
                        <div className="text-[11px] text-slate-400 font-normal">{formatRupiah(item.nilaiKebutuhan)}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-800">
                        {item.dipesan.toLocaleString('id-ID')}
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full mt-1 ml-auto overflow-hidden">
                          <div
                            className={`h-full ${percentOrdered > 110 ? 'bg-amber-500' : percentOrdered < 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, percentOrdered)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700 font-medium">
                        {item.diterima.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700 font-medium">
                        {item.dipakai.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900">
                        <span className={item.sisaStok === 0 ? 'text-rose-600' : 'text-slate-900'}>
                          {item.sisaStok.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {renderStatusBadge(item.status)}
                        {item.warning && (
                          <div className="text-[10px] text-rose-600 mt-0.5 truncate max-w-[120px] mx-auto">
                            {item.warning}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedMaterial(item);
                            setActiveModalTab('rap');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition border border-indigo-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Lihat
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill-Down Modal ("Lihat") */}
      {selectedMaterial && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">Detail Kontrol Material: {selectedMaterial.materialName}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {selectedMaterial.materialCode}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proyek: {currentProject.name} ({currentProject.code})
                </p>
              </div>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Visual Metrics & Status Bar */}
            <div className="p-5 bg-slate-50 border-b border-slate-200">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Kebutuhan RAP</span>
                  <p className="text-lg font-black text-indigo-700 mt-1">
                    {selectedMaterial.kebutuhanRap.toLocaleString('id-ID')} <span className="text-xs font-normal">{selectedMaterial.unit}</span>
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Dipesan (PO)</span>
                  <p className="text-lg font-black text-slate-800 mt-1">
                    {selectedMaterial.dipesan.toLocaleString('id-ID')} <span className="text-xs font-normal">{selectedMaterial.unit}</span>
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Sudah Diterima</span>
                  <p className="text-lg font-black text-emerald-700 mt-1">
                    {selectedMaterial.diterima.toLocaleString('id-ID')} <span className="text-xs font-normal">{selectedMaterial.unit}</span>
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Dipakai Lapangan</span>
                  <p className="text-lg font-black text-amber-700 mt-1">
                    {selectedMaterial.dipakai.toLocaleString('id-ID')} <span className="text-xs font-normal">{selectedMaterial.unit}</span>
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                  <span className="text-xs text-slate-500 font-medium">Sisa Stok Lapangan</span>
                  <p className="text-lg font-black text-slate-900 mt-1">
                    {selectedMaterial.sisaStok.toLocaleString('id-ID')} <span className="text-xs font-normal">{selectedMaterial.unit}</span>
                  </p>
                </div>
              </div>

              {/* Progress comparison visual bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Realisasi Pengadaan vs Kebutuhan RAP (100%)</span>
                  <span className="font-bold">
                    {selectedMaterial.kebutuhanRap > 0
                      ? `${Math.round((selectedMaterial.dipesan / selectedMaterial.kebutuhanRap) * 100)}% Dipesan`
                      : '0%'}
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{
                      width: `${Math.min(100, selectedMaterial.kebutuhanRap > 0 ? (selectedMaterial.diterima / selectedMaterial.kebutuhanRap) * 100 : 0)}%`
                    }}
                    title={`Diterima: ${selectedMaterial.diterima}`}
                  />
                  <div
                    className="bg-blue-400 h-full"
                    style={{
                      width: `${Math.min(100, selectedMaterial.kebutuhanRap > 0 ? (Math.max(0, selectedMaterial.dipesan - selectedMaterial.diterima) / selectedMaterial.kebutuhanRap) * 100 : 0)}%`
                    }}
                    title={`Dalam Pengiriman PO: ${Math.max(0, selectedMaterial.dipesan - selectedMaterial.diterima)}`}
                  />
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-1.5">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Diterima di Lokasi</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-400 inline-block" /> Sedang Dipesan (Belum Tiba)</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-300 inline-block" /> Belum Dipesan</span>
                </div>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="border-b border-slate-200 px-5 flex items-center gap-4 bg-white">
              <button
                onClick={() => setActiveModalTab('rap')}
                className={`py-3 text-sm font-bold border-b-2 flex items-center gap-2 ${
                  activeModalTab === 'rap'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                Sumber Kebutuhan RAP ({selectedMaterial.rapSourceItems.length})
              </button>
              <button
                onClick={() => setActiveModalTab('po')}
                className={`py-3 text-sm font-bold border-b-2 flex items-center gap-2 ${
                  activeModalTab === 'po'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Riwayat PO Pengadaan ({selectedMaterial.poItemsList.length})
              </button>
              <button
                onClick={() => setActiveModalTab('consumption')}
                className={`py-3 text-sm font-bold border-b-2 flex items-center gap-2 ${
                  activeModalTab === 'consumption'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Activity className="w-4 h-4" />
                Riwayat Pemakaian ({selectedMaterial.consumptionList.length})
              </button>
            </div>

            {/* Modal Tab Content */}
            <div className="p-5 flex-1 overflow-y-auto">
              {activeModalTab === 'rap' && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Daftar Item RAP yang Membutuhkan Material Ini
                  </h4>
                  {selectedMaterial.rapSourceItems.length === 0 ? (
                    <p className="text-sm text-slate-400 py-6 text-center">
                      Material ini tidak terikat langsung pada koefisien AHS item RAP aktif.
                    </p>
                  ) : (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-700 font-bold text-xs border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Kode WBS</th>
                            <th className="py-2.5 px-3">Deskripsi Item Pekerjaan</th>
                            <th className="py-2.5 px-3 text-right">Volume Pekerjaan</th>
                            <th className="py-2.5 px-3 text-right">Koefisien AHS</th>
                            <th className="py-2.5 px-3 text-right font-black">Total Kebutuhan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {selectedMaterial.rapSourceItems.map((src, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono text-xs font-semibold text-slate-600">{src.wbsCode}</td>
                              <td className="py-2.5 px-3 text-slate-800 font-medium">{src.description}</td>
                              <td className="py-2.5 px-3 text-right text-slate-600">
                                {src.volume.toLocaleString('id-ID')} {src.unit}
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                                {src.coef} {selectedMaterial.unit}/{src.unit}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-indigo-700">
                                {src.neededQty.toLocaleString('id-ID')} {selectedMaterial.unit}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeModalTab === 'po' && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Daftar Surat Pesanan (Purchase Order) Terkait
                  </h4>
                  {selectedMaterial.poItemsList.length === 0 ? (
                    <p className="text-sm text-slate-400 py-6 text-center">
                      Belum ada Purchase Order yang diterbitkan untuk material ini.
                    </p>
                  ) : (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-700 font-bold text-xs border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">No. PO</th>
                            <th className="py-2.5 px-3">Supplier</th>
                            <th className="py-2.5 px-3">Tgl Order</th>
                            <th className="py-2.5 px-3 text-right">Qty Dipesan</th>
                            <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                            <th className="py-2.5 px-3 text-center">Status PO</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {selectedMaterial.poItemsList.map((po, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono text-xs font-bold text-indigo-700">{po.poNumber}</td>
                              <td className="py-2.5 px-3 text-slate-800 font-medium">{po.supplierName}</td>
                              <td className="py-2.5 px-3 text-slate-500 text-xs">{po.orderDate}</td>
                              <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                                {po.qty.toLocaleString('id-ID')} {selectedMaterial.unit}
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-600 font-mono text-xs">
                                {formatRupiah(po.unitPrice)}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                                  {po.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeModalTab === 'consumption' && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Riwayat Pengeluaran / Pemakaian Nyata di Lapangan
                  </h4>
                  {selectedMaterial.consumptionList.length === 0 ? (
                    <p className="text-sm text-slate-400 py-6 text-center">
                      Belum ada catatan pemakaian material di lapangan untuk proyek ini.
                    </p>
                  ) : (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-700 font-bold text-xs border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Tanggal</th>
                            <th className="py-2.5 px-3">No. Dokumen / LHR</th>
                            <th className="py-2.5 px-3">Item Pekerjaan</th>
                            <th className="py-2.5 px-3 text-right font-bold">Qty Dipakai</th>
                            <th className="py-2.5 px-3">Petugas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {selectedMaterial.consumptionList.map((c, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 text-xs text-slate-500">{c.date}</td>
                              <td className="py-2.5 px-3 font-mono text-xs font-semibold text-slate-700">{c.refDoc}</td>
                              <td className="py-2.5 px-3 text-slate-800 text-xs">{c.wbsDesc || 'Pemakaian Pekerjaan Lapangan'}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-amber-700">
                                {c.qty.toLocaleString('id-ID')} {selectedMaterial.unit}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 text-xs">{c.user}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedMaterial(null)}
                className="px-5 py-2 rounded-lg bg-slate-800 text-white font-semibold text-sm hover:bg-slate-900 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
