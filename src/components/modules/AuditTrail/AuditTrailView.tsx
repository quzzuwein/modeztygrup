import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  UserCheck,
  FileCheck2,
  Calendar,
  Layers
} from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const { auditLogs, currentProject, currentPT } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    const matchSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
              <History className="w-4 h-4" />
              <span>Integritas Data & Jejak Audit (Audit Trail)</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">
              Riwayat Aktivitas, Revisi & Rekam Jejak Transaksi
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Setiap perubahan RAB, RAP, persetujuan transaksi, mutasi stok, dan pencairan upah terekam otomatis dengan identitas pengguna dan stempel waktu.
            </p>
          </div>

          <div className="text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-600 font-mono font-semibold">
            Total {auditLogs.length} Riwayat Tercatat
          </div>
        </div>
      </div>

      {/* Search & Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari aktivitas, pengguna, atau nomor dokumen..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-40">Waktu & Tanggal</th>
                <th className="p-3">Pengguna & Peran (Role)</th>
                <th className="p-3">Aksi Transaksi</th>
                <th className="p-3">Tipe & ID Entitas</th>
                <th className="p-3">Rincian Perubahan / Audit Trail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-500 text-[11px]">{log.timestamp}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{log.userName}</div>
                    <div className="text-[10px] text-amber-700 font-mono uppercase">{log.userRole}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-slate-700 font-semibold">{log.entityType}</span>
                    <div className="text-[10px] font-mono text-slate-400">{log.entityId}</div>
                  </td>
                  <td className="p-3 text-slate-700">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
