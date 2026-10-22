import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { formatRupiah, exportAHSToExcel, triggerPrintReport } from '../../../services/exportService';
import { MasterAHS } from '../../../types';
import {
  BookOpen,
  Layers,
  Search,
  Filter,
  Package,
  Users,
  Wrench,
  CheckCircle2,
  Info,
  ChevronRight,
  Download,
  Printer
} from 'lucide-react';

export const MasterAHSView: React.FC = () => {
  const { masterAhs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAhs, setSelectedAhs] = useState<MasterAHS>(masterAhs[0]);

  const categories = Array.from(new Set(masterAhs.map(a => a.category)));

  const filteredList = masterAhs.filter(a => {
    const matchSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'all' || a.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
              <BookOpen className="w-4 h-4" />
              <span>Standar Nasional & Pemerintah</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">
              Master Analisa Harga Satuan (AHS PUPR & SNI)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Database formula baku koefisien material, tenaga kerja (pekerja, tukang, mandor), dan alat kerja sesuai Permen PUPR.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportAHSToExcel(masterAhs)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
              title="Download Master AHS ke Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel AHS</span>
            </button>

            <button
              onClick={() => triggerPrintReport()}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Cetak Master AHS ke PDF"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Cetak PDF</span>
            </button>

            <div className="text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-600">
              Standar: <span className="font-bold text-slate-800">Permen PUPR 2023/2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split: Left List / Right Deep Coefficient Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: AHS Catalog */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
          {/* Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari kode AHS atau nama pekerjaan..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">Semua Kategori ({masterAhs.length})</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* List items */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredList.map(item => {
              const isSelected = selectedAhs.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAhs(item)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-xs flex items-center justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-amber-300">
                        {item.code}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">{item.category}</span>
                    </div>
                    <div className="font-bold text-slate-900 mt-1 truncate">{item.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Satuan: <span className="font-mono font-semibold text-slate-700">{item.unit}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-mono font-extrabold text-slate-900">
                      {formatRupiah(item.totalUnitPrice)}
                    </div>
                    <ChevronRight className={`w-4 h-4 ml-auto mt-1 ${isSelected ? 'text-amber-600' : 'text-slate-300'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Deep Breakdown Inspector */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
          {/* AHS Title & Summary */}
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-mono text-xs font-bold rounded-lg shadow-xs">
                KODE: {selectedAhs.code}
              </span>
              <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                Status: Aktif PUPR
              </span>
            </div>

            <h2 className="text-lg font-extrabold text-slate-900 mt-2">
              {selectedAhs.name}
            </h2>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
              <span>Dasar Hukum: <strong className="text-slate-700">{selectedAhs.version}</strong></span>
              <span>•</span>
              <span>Satuan Acuan: <strong className="text-slate-700">{selectedAhs.unit}</strong></span>
            </div>
          </div>

          {/* 3 Summary Badges: Bahan, Upah, Overhead */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200">
              <div className="flex items-center gap-1.5 text-blue-700 text-xs font-bold">
                <Package className="w-3.5 h-3.5" />
                <span>Komponen Bahan</span>
              </div>
              <div className="text-sm font-extrabold font-mono text-blue-900 mt-1">
                {formatRupiah(selectedAhs.materialTotal)}
              </div>
              <div className="text-[10px] text-blue-600 mt-0.5">
                {Math.round((selectedAhs.materialTotal / selectedAhs.totalUnitPrice) * 100)}% dari total
              </div>
            </div>

            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>Komponen Upah</span>
              </div>
              <div className="text-sm font-extrabold font-mono text-emerald-900 mt-1">
                {formatRupiah(selectedAhs.laborTotal)}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">
                {Math.round((selectedAhs.laborTotal / selectedAhs.totalUnitPrice) * 100)}% dari total
              </div>
            </div>

            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
              <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold">
                <Wrench className="w-3.5 h-3.5" />
                <span>Overhead ({selectedAhs.overheadPercent}%)</span>
              </div>
              <div className="text-sm font-extrabold font-mono text-amber-900 mt-1">
                {formatRupiah(selectedAhs.overheadAmount)}
              </div>
              <div className="text-[10px] text-amber-600 mt-0.5">Biaya umum & profit</div>
            </div>
          </div>

          {/* 1. Rincian Bahan / Material */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <span className="flex items-center gap-1.5 text-blue-700">
                <Package className="w-4 h-4" />
                <span>A. Rincian Kebutuhan Bahan (Material)</span>
              </span>
              <span className="font-mono text-blue-900">{formatRupiah(selectedAhs.materialTotal)}</span>
            </div>

            <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2">Uraian Bahan</th>
                  <th className="p-2 text-right">Koefisien</th>
                  <th className="p-2 text-center">Satuan</th>
                  <th className="p-2 text-right">Harga Satuan (Rp)</th>
                  <th className="p-2 text-right">Subtotal (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedAhs.materials.map((m, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-2 font-medium text-slate-800">{m.materialName}</td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900">{m.coefficient}</td>
                    <td className="p-2 text-center font-mono text-slate-500">{m.unit}</td>
                    <td className="p-2 text-right font-mono text-slate-600">{formatRupiah(m.unitPrice)}</td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900">{formatRupiah(m.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. Rincian Tenaga Kerja / Upah */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Users className="w-4 h-4" />
                <span>B. Rincian Kebutuhan Tenaga Kerja (Labor)</span>
              </span>
              <span className="font-mono text-emerald-900">{formatRupiah(selectedAhs.laborTotal)}</span>
            </div>

            <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2">Jenis Tenaga Kerja</th>
                  <th className="p-2 text-right">Koefisien (OH)</th>
                  <th className="p-2 text-right">Upah Harian Standar (Rp)</th>
                  <th className="p-2 text-right">Subtotal (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedAhs.labors.map((l, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-2 font-medium text-slate-800">{l.laborType}</td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900">{l.coefficient}</td>
                    <td className="p-2 text-right font-mono text-slate-600">{formatRupiah(l.unitPrice)}</td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900">{formatRupiah(l.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Box */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-amber-400 uppercase font-semibold">
                Total Harga Satuan Pekerjaan (AHS)
              </span>
              <div className="text-xs text-slate-400">Termasuk bahan, upah, alat, dan profit/overhead 10%</div>
            </div>
            <div className="text-xl font-extrabold font-mono text-amber-400">
              {formatRupiah(selectedAhs.totalUnitPrice)} <span className="text-xs text-white">/ {selectedAhs.unit}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
