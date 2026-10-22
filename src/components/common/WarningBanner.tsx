import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from './Sidebar';
import { AlertTriangle, AlertOctagon, Info, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface WarningBannerProps {
  onNavigateTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const WarningBanner: React.FC<WarningBannerProps> = ({ onNavigateTab, isOpen, onClose }) => {
  const { warnings, activeRole, resolveWarning } = useApp();

  const roleWarnings = warnings.filter(
    w => w.assignedRoles.includes(activeRole) || activeRole === 'direktur'
  );

  const openWarnings = roleWarnings.filter(w => w.status === 'open');

  if (!isOpen && openWarnings.length === 0) return null;

  return (
    <div className={`transition-all ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end">
        <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Pusat Peringatan & Mitigasi Risiko
                </h3>
                <p className="text-xs text-slate-500">
                  {openWarnings.length} peringatan aktif untuk role Anda
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {roleWarnings.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Semua Terkendali!</p>
                <p className="text-xs">Tidak ada peringatan deviasi atau keterlambatan untuk role Anda.</p>
              </div>
            ) : (
              roleWarnings.map(w => {
                const isCritical = w.severity === 'critical';
                const isWarning = w.severity === 'warning';
                const isResolved = w.status === 'resolved';

                return (
                  <div
                    key={w.id}
                    className={`p-3.5 rounded-xl border text-xs transition ${
                      isResolved
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : isCritical
                        ? 'bg-rose-50/70 border-rose-300'
                        : isWarning
                        ? 'bg-amber-50/80 border-amber-300'
                        : 'bg-blue-50/80 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {isCritical ? (
                        <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      )}

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-bold uppercase text-[10px] px-1.5 py-0.5 rounded ${
                              isCritical
                                ? 'bg-rose-200 text-rose-900'
                                : isWarning
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-blue-200 text-blue-900'
                            }`}
                          >
                            {w.severity}
                          </span>
                          <span className="text-[10px] text-slate-400">{w.createdAt}</span>
                        </div>

                        <div className="font-bold text-slate-900 text-xs mt-1">{w.title}</div>
                        <p className="text-slate-600 mt-1 leading-relaxed">{w.message}</p>
                        <div className="mt-1 text-[11px] text-slate-500 font-medium">
                          Proyek: {w.projectName}
                        </div>

                        {/* Actions */}
                        {!isResolved && (
                          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-200/60">
                            <button
                              onClick={() => {
                                onNavigateTab(w.actionModule as ActiveTab);
                                onClose();
                              }}
                              className="px-2.5 py-1 bg-slate-900 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 hover:bg-slate-800 transition"
                            >
                              <span>{w.actionLabel}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => resolveWarning(w.id)}
                              className="px-2 py-1 text-slate-600 hover:text-emerald-700 text-[11px] font-medium transition"
                            >
                              Tandai Selesai
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
