import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Smartphone,
  Laptop,
  Globe,
  X,
  HardHat,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ShareLinkModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { currentPT, currentProject, activeRole } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // The primary production/shared URL
  const sharedUrl = 'https://ais-pre-6t63rqsp2bmb5tko33slkj-755317578717.asia-northeast1.run.app';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : sharedUrl;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappMessage = encodeURIComponent(
    `Halo Tim Proyek ${currentPT?.name || 'PT Modezty Jaya Abadi'},\n\nBerikut tautan sistem ERP Kontraktor untuk input laporan lapangan, opname, SPB material, dan kurva S:\n🔗 ${sharedUrl}\n\nSilakan buka tautan di browser HP (Chrome/Safari) dan pilih 'Tambahkan ke Layar Utama' (Add to Home Screen) agar dapat digunakan seperti aplikasi HP.`
  );

  // Quick QR code generator via safe Google Chart API / QR Server
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(sharedUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 flex items-center justify-between text-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-950/20 rounded-xl">
              <Share2 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Tautan Akses Aplikasi & Tim</h2>
              <p className="text-xs text-slate-900/80 font-medium">
                {currentPT?.name || 'PT Modezty Jaya Abadi'} • {currentProject?.name || 'Semua Proyek'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-900 hover:bg-black/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Main URL Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                Tautan Aplikasi Siap Pakai (Shared Link)
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">● Online / Live</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={sharedUrl}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-amber-300 focus:outline-hidden selection:bg-amber-500 selection:text-slate-950"
              />
              <button
                onClick={() => handleCopy(sharedUrl)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* Quick Actions (WhatsApp & Open in New Tab) */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://wa.me/?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 rounded-xl text-xs font-semibold transition"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Kirim via WhatsApp</span>
            </a>
            <a
              href={sharedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>Buka Tautan Baru</span>
            </a>
          </div>

          {/* QR Code & Mobile Instructions */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-inner shrink-0">
              <img
                src={qrCodeUrl}
                alt="QR Code Aplikasi ERP Kontraktor"
                className="w-28 h-28 object-contain"
                loading="lazy"
              />
            </div>
            <div className="space-y-2 text-xs text-slate-300 flex-1">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>Scan untuk Mandor & Pelaksana Lapangan</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Scan QR Code ini menggunakan kamera HP untuk langsung membuka mode input harian lapangan tanpa instalasi rumit.
              </p>
              <div className="text-[11px] bg-slate-900 border border-slate-700/60 rounded-lg p-2 text-slate-300 flex items-start gap-1.5">
                <HardHat className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Tips:</strong> Di browser HP (Chrome/Safari), klik menu <strong>Titik Tiga</strong> lalu pilih <strong>&apos;Tambahkan ke Layar Utama&apos;</strong> agar menjadi aplikasi mandiri di HP.
                </span>
              </div>
            </div>
          </div>

          {/* Access Note */}
          <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Multi-Role 12 Divisi Aktif
            </span>
            <span className="text-slate-500 font-mono text-[10px]">
              PT Modezty Jaya Abadi ERP
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
