import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  RotateCcw,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  X,
  ShieldAlert,
  Database,
  Lock
} from 'lucide-react';

export const ResetDataModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { resetAllData, clearAllWarnings, currentProject, currentPT, activeRole } = useApp();
  const [confirmText, setConfirmText] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetAction, setResetAction] = useState<'all' | 'warnings'>('all');

  if (!isOpen) return null;

  const handleExecute = () => {
    if (resetAction === 'all') {
      resetAllData();
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        onClose();
      }, 1500);
    } else if (resetAction === 'warnings') {
      clearAllWarnings();
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-slate-900 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-black/10 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Pusat Reset & Pembersihan Data</h2>
              <p className="text-xs text-rose-100 font-medium">
                Khusus Direktur & Super Admin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-rose-100 hover:bg-black/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {resetSuccess ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="font-bold text-base text-slate-900">Pembersihan Selesai!</h3>
              <p className="text-xs text-slate-500">
                {resetAction === 'all'
                  ? 'Seluruh data sistem telah berhasil direset ke kondisi default awal.'
                  : 'Seluruh peringatan risiko proyek berhasil dihapus & dinormalisasi.'}
              </p>
            </div>
          ) : (
            <>
              <div className="text-xs text-slate-600 leading-relaxed">
                Pilih tindakan pembersihan atau reset data yang ingin Anda lakukan sebagai <strong>Direktur / Super Admin</strong>:
              </div>

              {/* Reset Option 1: Reset Semua Data */}
              <label
                onClick={() => setResetAction('all')}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                  resetAction === 'all'
                    ? 'border-rose-500 bg-rose-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="resetType"
                  checked={resetAction === 'all'}
                  onChange={() => setResetAction('all')}
                  className="mt-1 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                    <span>Reset Seluruh Aplikasi ke Kondisi Awal</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Mengembalikan seluruh PT, proyek, master AHS PUPR, RAB, RAP, logistik, upah, dan kas ke data bawaan sistem.
                  </p>
                </div>
              </label>

              {/* Reset Option 2: Bersihkan Peringatan Saja */}
              <label
                onClick={() => setResetAction('warnings')}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                  resetAction === 'warnings'
                    ? 'border-amber-500 bg-amber-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="resetType"
                  checked={resetAction === 'warnings'}
                  onChange={() => setResetAction('warnings')}
                  className="mt-1 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Hapus Semua Peringatan Risiko Saja</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Menghapus seluruh daftar peringatan deviasi dan risiko tanpa mengubah data RAB, RAP, dan keuangan proyek.
                  </p>
                </div>
              </label>

              {/* Confirmation Warning */}
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>
                  Tindakan ini tidak dapat dibatalkan. Pastikan Anda telah mengunduh backup Excel jika masih memerlukan data berjalan.
                </span>
              </div>

              {/* Footer Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecute}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Konfirmasi Reset</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
