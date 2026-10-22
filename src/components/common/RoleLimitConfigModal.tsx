import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { formatRupiah } from '../../services/exportService';
import {
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  Lock,
  Unlock,
  Building2,
  Sparkles,
  Info
} from 'lucide-react';

interface RoleLimitConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleLimitConfigModal: React.FC<RoleLimitConfigModalProps> = ({ isOpen, onClose }) => {
  const { roles, activeRole, updateRoleLimit, resetRoleLimits, currentRoleInfo } = useApp();
  
  // Local state copy for editing
  const [limitsMap, setLimitsMap] = useState<Record<UserRole, { limit: number; canApprove: boolean }>>(() => {
    const initial: Record<string, { limit: number; canApprove: boolean }> = {};
    roles.forEach(r => {
      initial[r.id] = { limit: r.approvalLimit, canApprove: r.canApprove };
    });
    return initial as Record<UserRole, { limit: number; canApprove: boolean }>;
  });

  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  // Sync state when modal opens or roles change
  React.useEffect(() => {
    if (isOpen) {
      const initial: Record<string, { limit: number; canApprove: boolean }> = {};
      roles.forEach(r => {
        initial[r.id] = { limit: r.approvalLimit, canApprove: r.canApprove };
      });
      setLimitsMap(initial as Record<UserRole, { limit: number; canApprove: boolean }>);
    }
  }, [isOpen, roles]);

  if (!isOpen) return null;

  const isDirektur = activeRole === 'direktur';

  const handleLimitChange = (roleId: UserRole, limit: number) => {
    setLimitsMap(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        limit: Math.max(0, limit),
        canApprove: limit > 0 ? true : prev[roleId]?.canApprove
      }
    }));
  };

  const handleToggleApprove = (roleId: UserRole, canApprove: boolean) => {
    setLimitsMap(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        canApprove
      }
    }));
  };

  const handleSaveAll = () => {
    Object.entries(limitsMap).forEach(([roleId, data]) => {
      const original = roles.find(r => r.id === roleId);
      if (original && (original.approvalLimit !== data.limit || original.canApprove !== data.canApprove)) {
        updateRoleLimit(roleId as UserRole, data.limit, data.canApprove);
      }
    });
    setSavedNotification('Batas limit wewenang persetujuan 12 role berhasil diperbarui & disimpan ke sistem!');
    setTimeout(() => {
      setSavedNotification(null);
      onClose();
    }, 1800);
  };

  // Presets
  const applyPreset = (type: 'standard' | 'high' | 'strict') => {
    const updated = { ...limitsMap };
    if (type === 'standard') {
      updated['direktur'] = { limit: 10_000_000_000, canApprove: true };
      updated['pm_teknik'] = { limit: 500_000_000, canApprove: true };
      updated['pm_lapangan'] = { limit: 150_000_000, canApprove: true };
      updated['admin_keuangan'] = { limit: 100_000_000, canApprove: true };
      updated['site_manager'] = { limit: 75_000_000, canApprove: true };
      updated['logistik_kantor'] = { limit: 50_000_000, canApprove: false };
      updated['procurement'] = { limit: 250_000_000, canApprove: false };
      updated['admin_teknik'] = { limit: 0, canApprove: false };
      updated['estimator'] = { limit: 0, canApprove: false };
      updated['pelaksana'] = { limit: 0, canApprove: false };
      updated['admin_lapangan'] = { limit: 0, canApprove: false };
      updated['logistik_lapangan'] = { limit: 0, canApprove: false };
      updated['k3_lapangan'] = { limit: 0, canApprove: false };
    } else if (type === 'high') {
      updated['direktur'] = { limit: 25_000_000_000, canApprove: true };
      updated['pm_teknik'] = { limit: 1_000_000_000, canApprove: true };
      updated['pm_lapangan'] = { limit: 300_000_000, canApprove: true };
      updated['admin_keuangan'] = { limit: 250_000_000, canApprove: true };
      updated['site_manager'] = { limit: 150_000_000, canApprove: true };
      updated['procurement'] = { limit: 500_000_000, canApprove: false };
    } else if (type === 'strict') {
      updated['direktur'] = { limit: 5_000_000_000, canApprove: true };
      updated['pm_teknik'] = { limit: 200_000_000, canApprove: true };
      updated['pm_lapangan'] = { limit: 50_000_000, canApprove: true };
      updated['admin_keuangan'] = { limit: 50_000_000, canApprove: true };
      updated['site_manager'] = { limit: 25_000_000, canApprove: true };
    }
    setLimitsMap(updated);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  Konfigurasi Limit Nominal & Otorisasi 12 Role
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold uppercase">
                  Wewenang Direktur
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Atur batas nominal rupiah transaksi yang boleh disetujui (SPB, PO, Klaim Upah, Kasbon) oleh masing-masing jabatan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Director Notice & Quick Presets */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-700 flex items-center gap-2">
            {isDirektur ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <Unlock className="w-3.5 h-3.5" />
                <span>Mode Edit Aktif (Login sebagai Direktur Utama)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Lock className="w-3.5 h-3.5" />
                <span>Mode Tinjau (Role Anda: {currentRoleInfo.title}). Beralih ke Direktur untuk mengubah limit.</span>
              </span>
            )}
          </div>

          {isDirektur && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold text-[11px]">Preset Standar:</span>
              <button
                type="button"
                onClick={() => applyPreset('standard')}
                className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-semibold text-[11px] text-slate-700"
              >
                Standar PRD
              </button>
              <button
                type="button"
                onClick={() => applyPreset('high')}
                className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-semibold text-[11px] text-blue-700"
              >
                Proyek Mega
              </button>
              <button
                type="button"
                onClick={() => applyPreset('strict')}
                className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-semibold text-[11px] text-amber-700"
              >
                Pagu Ketat
              </button>
            </div>
          )}
        </div>

        {savedNotification && (
          <div className="p-3 bg-emerald-600 text-white text-xs font-bold text-center flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{savedNotification}</span>
          </div>
        )}

        {/* Table of Roles */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Jabatan / Role Pengguna</th>
                <th className="p-3">Departemen</th>
                <th className="p-3 text-center">Hak Approval</th>
                <th className="p-3 text-right">Batas Limit Nominal (IDR)</th>
                <th className="p-3 text-center">Tindakan Otorisasi Utama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roles.map(r => {
                const currentData = limitsMap[r.id] || { limit: r.approvalLimit, canApprove: r.canApprove };
                const isSelectedRole = r.id === activeRole;

                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-50/80 transition ${
                      isSelectedRole ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="p-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{r.title}</span>
                        {isSelectedRole && (
                          <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-bold">
                            Role Aktif
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{r.id}</div>
                    </td>
                    <td className="p-3 font-medium text-slate-600">
                      {r.department}
                    </td>
                    <td className="p-3 text-center">
                      {isDirektur ? (
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentData.canApprove}
                            onChange={e => handleToggleApprove(r.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600 relative"></div>
                        </label>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            currentData.canApprove
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {currentData.canApprove ? 'Ya' : 'Tidak'}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {isDirektur ? (
                        <div className="inline-flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-xs focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500">
                            <span className="text-[10px] text-slate-400 font-mono">Rp</span>
                            <input
                              type="number"
                              min="0"
                              step="5000000"
                              value={currentData.limit}
                              onChange={e => handleLimitChange(r.id, parseFloat(e.target.value) || 0)}
                              className="w-32 text-right font-mono font-bold text-xs text-slate-900 focus:outline-none"
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {formatRupiah(currentData.limit)}
                          </span>
                        </div>
                      ) : (
                        <div className="font-mono font-extrabold text-slate-800">
                          {formatRupiah(currentData.limit)}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center text-[11px] text-slate-600 max-w-[220px] truncate" title={r.canApproveItems.join(', ')}>
                      {r.canApproveItems[0] || 'Hanya Input & Pengajuan'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetRoleLimits}
              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
              title="Reset seluruh limit ke standar pabrik"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Default</span>
            </button>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold hover:bg-slate-100"
            >
              Tutup
            </button>
            {isDirektur && (
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Perubahan Limit</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
