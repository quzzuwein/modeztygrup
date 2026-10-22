import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  ShieldCheck,
  Eye,
  Edit3,
  CheckCircle,
  Zap,
  Building2,
  DollarSign,
  X,
  Search,
  Filter,
  Info
} from 'lucide-react';

interface RoleMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleMatrixModal: React.FC<RoleMatrixModalProps> = ({ isOpen, onClose }) => {
  const { roles, activeRole, setActiveRole } = useApp();
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<UserRole | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'matrix' | 'keuangan_flow'>('matrix');

  if (!isOpen) return null;

  const displayedRoles = selectedRoleFilter === 'all'
    ? roles
    : roles.filter(r => r.id === selectedRoleFilter);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <span>Matriks Kewenangan 12 Role & Alur Keuangan Kontraktor</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded uppercase">
                  RBAC Sesuai PRD
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Panduan komprehensif: Hak lihat, hak input, batas approval, dan integrasi otomatisasi keuangan.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch inside modal */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'matrix' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tabel Matriks Input / Approve / Lihat (12 Role)
            </button>
            <button
              onClick={() => setActiveTab('keuangan_flow')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'keuangan_flow' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              Penjelasan Alur Keuangan (Otomatis vs Input Manual)
            </button>
          </div>

          {activeTab === 'matrix' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Filter Role:</span>
              <select
                value={selectedRoleFilter}
                onChange={e => setSelectedRoleFilter(e.target.value as any)}
                className="p-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
              >
                <option value="all">Semua 12 Role</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: MATRIX TABLE */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-300 p-3.5 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold">Apakah tiap role hanya bisa melihat bagiannya?</span>
                  <p className="mt-0.5 leading-relaxed text-slate-700">
                    <strong>Ya, benar.</strong> Sistem membatasi menu sidebar, data proyek, dan wewenang tindakan sesuai role aktif. Pengguna lapangan (Pelaksana/Mandor) hanya dapat mengakses menu operasional fisik harian dan gudang site, Estimator hanya mengelola tender/AHS/RAB, Procurement hanya menangani vendor/PO, Keuangan menangani arus kas/pajak, dan hanya level Direktur / PM yang memiliki akses cross-modul dan persetujuan bernilai besar.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {displayedRoles.map(role => {
                  const isActive = activeRole === role.id;
                  return (
                    <div
                      key={role.id}
                      className={`rounded-xl border p-4 transition ${
                        isActive
                          ? 'border-amber-500 bg-amber-50/20 shadow-sm ring-1 ring-amber-500/40'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Role Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-sm text-slate-900">{role.title}</h3>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {role.department}
                            </span>
                            {role.crossPT && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                Lintas PT
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{role.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveRole(role.id);
                              onClose();
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              isActive
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-100 text-slate-700 hover:bg-amber-400 hover:text-slate-950'
                            }`}
                          >
                            {isActive ? 'Sedang Aktif' : 'Simulasi Role Ini'}
                          </button>
                        </div>
                      </div>

                      {/* 3 Pillars: Lihat, Input, Approve */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs">
                        {/* 1. Lihat (View) */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase text-blue-700">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Akses Lihat (View Scope)</span>
                          </div>
                          <ul className="space-y-1 text-slate-600 pl-4 list-disc text-[11px]">
                            {role.canView.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        {/* 2. Input (Create/Edit) */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase text-emerald-700">
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Data yang Di-Input</span>
                          </div>
                          <ul className="space-y-1 text-slate-600 pl-4 list-disc text-[11px]">
                            {role.canInput.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        {/* 3. Approve */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                          <div className="flex items-center justify-between font-bold text-[11px] uppercase text-amber-700">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Wewenang Approval</span>
                            </span>
                            {role.canApprove && (
                              <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                                Limit: Rp {(role.approvalLimit / 1_000_000).toFixed(0)} Jt
                              </span>
                            )}
                          </div>
                          <ul className="space-y-1 text-slate-600 pl-4 list-disc text-[11px]">
                            {role.canApproveItems.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Financial flow note */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span><strong>Keterkaitan Alur Keuangan:</strong> {role.financialAutomation}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIAL AUTOMATION FLOW DETAIL */}
          {activeTab === 'keuangan_flow' && (
            <div className="space-y-5 text-xs text-slate-700">
              {/* Core Answer Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900 to-slate-900 text-white space-y-2">
                <div className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                  JAWABAN PERTANYAAN KEUANGAN
                </div>
                <h3 className="text-base font-extrabold text-white">
                  Apakah Modul Keuangan Otomatis atau Bagian Keuangan Input Apa Saja?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sistem dirancang dengan arsitektur <strong>Semi-Otomatis Cerdas (Automated Flow with Financial Verification Gate)</strong>:
                  Operasional lapangan dan pengadaan <em>mengalirkan data biaya secara otomatis</em> ke antrean tagihan, sedangkan <em>Bagian Keuangan bertindak sebagai verifikator akhir</em> untuk memeriksa keabsahan dokumen, nomor faktur pajak, rekening bank, serta mengeksekusi pencairan dana (pembayaran) dan mencatat penerimaan termin dari klien.
                </p>
              </div>

              {/* 2 Columns: Otomatis vs Input Keuangan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bagian A: Yang Terjadi Otomatis */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>1. Proses yang Berjalan OTOMATIS oleh Sistem:</span>
                  </div>

                  <ul className="space-y-2 text-slate-700 text-xs pl-2">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">1</span>
                      <div>
                        <strong>Pembentukan Komitmen Biaya dari PO Supplier:</strong> Saat Procurement menerbitkan PO yang disetujui PM, sistem langsung mencatat komitmen belanja material dan menghitung PPN 11% secara otomatis.
                      </div>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">2</span>
                      <div>
                        <strong>Antrean Tagihan Siap Bayar dari Penerimaan Barang (BAST):</strong> Begitu Logistik Lapangan mengonfirmasi barang tiba di proyek via BAST, status PO otomatis berubah menjadi <em>"Diterima Lengkap / Siap Ditagihkan"</em> di dashboard Keuangan.
                      </div>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">3</span>
                      <div>
                        <strong>Kalkulasi Tagihan Upah Mandor & Pajak PPh 21:</strong> Saat SPK Borongan diverifikasi SM dan di-approve PM, sistem otomatis menghitung potongan <strong>PPh 21 (2%)</strong> dan memasukkan nilai netto ke daftar <em>"Klaim Upah Siap Bayar"</em> Keuangan.
                      </div>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">4</span>
                      <div>
                        <strong>Perhitungan Real-Time Serapan Anggaran & Laba Proyek:</strong> Setiap ada pemakaian material di lapangan atau upah yang dibayarkan, grafik <strong>Kurva S Serapan Biaya</strong> dan proyeksi profit margin proyek langsung ter-update otomatis tanpa perlu entri ulang.
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Bagian B: Yang Di-Input Manual oleh Bagian Keuangan */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
                    <Edit3 className="w-4 h-4 text-blue-600" />
                    <span>2. Data yang Di-INPUT oleh Bagian Keuangan:</span>
                  </div>

                  <ul className="space-y-2 text-slate-700 text-xs pl-2">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">A</span>
                      <div>
                        <strong>Pencatatan Penerimaan Termin Klien:</strong> Menginput uang masuk dari klien (Uang Muka DP 20%, Termin I, Termin II, Termin III, dan pelunasan Retensi 5%) beserta tanggal masuk rekening dan nomor faktur pajak.
                      </div>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">B</span>
                      <div>
                        <strong>Eksekusi Pencairan Pembayaran (Payment Release):</strong> Melakukan otorisasi pencairan dana untuk PO supplier dan upah mandor yang antre, memilih metode bayar (*Transfer Bank / Bilyet Giro / Kas Lapangan*), dan mengunggah bukti transfer.
                      </div>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">C</span>
                      <div>
                        <strong>Beban Overhead & Kas Kecil Proyek (Petty Cash):</strong> Menginput biaya-biaya operasional yang tidak bersumber dari PO material (misal: listrik/air kerja proyek, biaya perizinan lingkungan, sewa gudang temporer, konsumsi lembur).
                      </div>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">D</span>
                      <div>
                        <strong>Pelaporan Pajak Kontraktor:</strong> Menghitung dan merekap Bukti Potong PPh Final Jasa Konstruksi (2.65% atau 1.75% PP 9/2022) serta PPN Masukan/Keluaran 11% untuk SPT Masa PPN & PPh.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Role Aktif Saat Ini: <strong className="text-slate-900">{roles.find(r => r.id === activeRole)?.title}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition"
          >
            Tutup Matriks
          </button>
        </div>
      </div>
    </div>
  );
};
