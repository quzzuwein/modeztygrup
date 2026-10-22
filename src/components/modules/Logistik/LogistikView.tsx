import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { MaterialRequest, PurchaseOrder, StockItem } from '../../../types';
import { formatRupiah, exportStockToExcel, triggerPrintReport } from '../../../services/exportService';
import { MaterialControlView } from './MaterialControlView';
import {
  Boxes,
  Truck,
  PlusCircle,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  Building,
  MapPin,
  ClipboardList,
  Check,
  Plus,
  Download,
  Printer,
  Layers
} from 'lucide-react';

export const LogistikView: React.FC = () => {
  const {
    currentProject,
    currentPT,
    stockItems,
    stockTransactions,
    materialRequests,
    purchaseOrders,
    rabItems,
    addMaterialRequest,
    approveMaterialRequest,
    createPurchaseOrder,
    receiveGoodsAtField,
    recordMaterialUsage,
    currentRoleInfo,
    activeRole
  } = useApp();

  const [activeTab, setActiveTab] = useState<'kontrol_material' | 'stok' | 'spb' | 'po' | 'pemakaian'>('kontrol_material');
  
  // Modal states
  const [showSPBModal, setShowSPBModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);

  // Form states
  const [spbMaterialId, setSpbMaterialId] = useState(stockItems[0]?.id || '');
  const [spbQty, setSpbQty] = useState<number>(50);
  const [spbWbs, setSpbWbs] = useState('II.1 Pengecoran Balok & Kolom');
  const [spbUrgency, setSpbUrgency] = useState<'normal' | 'urgent'>('normal');

  const [poSupplier, setPoSupplier] = useState('PT Semen Gresik Distributor');
  const [poMaterialId, setPoMaterialId] = useState(stockItems[0]?.id || '');
  const [poQty, setPoQty] = useState<number>(100);
  const [poDestination, setPoDestination] = useState<'lokasi_proyek' | 'gudang_kantor'>('lokasi_proyek');

  const [usageMaterialId, setUsageMaterialId] = useState(stockItems[0]?.id || '');
  const [usageQty, setUsageQty] = useState<number>(20);
  const [usageRabId, setUsageRabId] = useState(rabItems[0]?.id || '');

  const [receiveMaterialId, setReceiveMaterialId] = useState(stockItems[0]?.id || '');
  const [receiveQty, setReceiveQty] = useState<number>(50);
  const [receiveRefDoc, setReceiveRefDoc] = useState('SJ-SUP-2026-09');

  if (!currentProject) {
    return <div className="p-8 text-center text-slate-500">Pilih proyek terlebih dahulu.</div>;
  }

  const projectSpbs = materialRequests.filter(s => s.projectId === currentProject.id);
  const projectPOs = purchaseOrders.filter(p => p.projectId === currentProject.id);
  const projectTransactions = stockTransactions.filter(
    t => t.location === currentProject.id || t.location === 'gudang_kantor'
  );

  const handleCreateSPB = (e: React.FormEvent) => {
    e.preventDefault();
    const mat = stockItems.find(s => s.id === spbMaterialId);
    if (!mat) return;

    addMaterialRequest({
      projectId: currentProject.id,
      ptId: currentProject.ptId,
      requestedBy: `${currentRoleInfo.title}`,
      role: currentRoleInfo.title,
      requestDate: new Date().toISOString().split('T')[0],
      requiredDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      wbsSection: spbWbs,
      urgency: spbUrgency,
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
          notes: 'Pengajuan mendesak untuk percepatan lapangan'
        }
      ],
      approvalHistory: [
        {
          role: currentRoleInfo.title,
          action: 'Mengajukan SPB',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          notes: 'Diajukan oleh staf lapangan'
        }
      ]
    });

    setShowSPBModal(false);
    alert('Surat Permintaan Bahan (SPB) berhasil diajukan!');
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const mat = stockItems.find(s => s.id === poMaterialId);
    if (!mat) return;

    const subtotal = poQty * mat.avgBuyPrice;
    const ppn = subtotal * 0.11;

    createPurchaseOrder({
      supplierId: 'sup-new',
      supplierName: poSupplier,
      projectId: currentProject.id,
      ptId: currentProject.ptId,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      deliveryDestination: poDestination,
      status: 'disetujui',
      createdBy: `${currentRoleInfo.title}`,
      paymentTerms: 'Tempo 30 Hari',
      items: [
        {
          materialId: mat.id,
          materialName: mat.name,
          unit: mat.unit,
          qty: poQty,
          unitPrice: mat.avgBuyPrice,
          subtotal,
          receivedQty: 0
        }
      ],
      subtotal,
      ppnPercent: 11,
      ppnAmount: ppn,
      grandTotal: subtotal + ppn
    });

    setShowPOModal(false);
    alert('Purchase Order (PO) berhasil diterbitkan ke supplier!');
  };

  const handleRecordUsage = (e: React.FormEvent) => {
    e.preventDefault();
    const mat = stockItems.find(s => s.id === usageMaterialId);
    const rab = rabItems.find(r => r.id === usageRabId);
    if (!mat || !rab) return;

    recordMaterialUsage({
      materialId: mat.id,
      projectId: currentProject.id,
      qty: usageQty,
      rabItemId: rab.id,
      wbsDesc: `${rab.wbsCode} ${rab.description}`,
      refDoc: `LHR-${new Date().toISOString().split('T')[0]}`
    });

    setShowUsageModal(false);
    alert(`Pemakaian ${usageQty} ${mat.unit} ${mat.name} berhasil dicatat & dialokasikan ke RAP!`);
  };

  const handleReceiveGoods = (e: React.FormEvent) => {
    e.preventDefault();
    const mat = stockItems.find(s => s.id === receiveMaterialId);
    if (!mat) return;

    receiveGoodsAtField({
      materialId: mat.id,
      projectId: currentProject.id,
      qty: receiveQty,
      refDoc: receiveRefDoc,
      notes: 'Penerimaan barang fisik di lapangan telah diverifikasi logistik'
    });

    setShowReceiveModal(false);
    alert(`Berhasil mencatat penerimaan ${receiveQty} ${mat.unit} ${mat.name} di gudang proyek!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
              <Boxes className="w-4 h-4" />
              <span>Manajemen Logistik & Rantai Pasok</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">
              Kontrol Logistik Gudang Kantor & Lapangan
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola stok dua gudang, Surat Permintaan Bahan (SPB), Purchase Order (PO), penerimaan BAST, dan pemakaian per item pekerjaan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportStockToExcel(stockItems, currentProject.id, currentProject.name)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow"
              title="Download Data Stok Dua Gudang ke Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel Stok</span>
            </button>

            <button
              onClick={() => triggerPrintReport()}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 transition"
              title="Cetak Laporan Logistik ke PDF"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Cetak PDF</span>
            </button>

            <button
              onClick={() => setShowSPBModal(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Buat SPB (Permintaan)</span>
            </button>

            <button
              onClick={() => setShowPOModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>Terbitkan PO Supplier</span>
            </button>

            <button
              onClick={() => setShowReceiveModal(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Penerimaan Lapangan</span>
            </button>

            <button
              onClick={() => setShowUsageModal(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Catat Pemakaian Material</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('kontrol_material')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'kontrol_material'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Boxes className="w-3.5 h-3.5 text-indigo-600" />
          <span>Kontrol Material (RAP)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold ml-1">
            Batch 10
          </span>
        </button>

        <button
          onClick={() => setActiveTab('stok')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition shrink-0 ${
            activeTab === 'stok' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Posisi Stok Dua Gudang ({stockItems.length})
        </button>

        <button
          onClick={() => setActiveTab('spb')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition shrink-0 ${
            activeTab === 'spb' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Permintaan Bahan / SPB ({projectSpbs.length})
        </button>

        <button
          onClick={() => setActiveTab('po')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition shrink-0 ${
            activeTab === 'po' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Purchase Order / PO ({projectPOs.length})
        </button>

        <button
          onClick={() => setActiveTab('pemakaian')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition shrink-0 ${
            activeTab === 'pemakaian' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Kartu Stok & Riwayat Mutasi
        </button>
      </div>

      {/* TAB: KONTROL MATERIAL DARI RAP (BATCH 10 FASE 2) */}
      {activeTab === 'kontrol_material' && (
        <MaterialControlView />
      )}

      {/* TAB 1: DUAL WAREHOUSE STOCK TABLE */}
      {activeTab === 'stok' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Kode / Material</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3 text-center">Satuan</th>
                  <th className="p-3 text-right bg-blue-50/50">Gudang Kantor</th>
                  <th className="p-3 text-center bg-blue-50/50">Min. Kantor</th>
                  <th className="p-3 text-right bg-emerald-50/50">Gudang Lapangan ({currentProject.code})</th>
                  <th className="p-3 text-center bg-emerald-50/50">Buffer Min. Lapangan</th>
                  <th className="p-3 text-right">Harga Beli Rata2</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockItems.map(item => {
                  const fieldQty = item.fieldStocks[currentProject.id] || 0;
                  const isFieldLow = fieldQty <= item.minFieldStock;
                  const isOfficeLow = item.officeStock <= item.minOfficeStock;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.code}</div>
                      </td>
                      <td className="p-3 font-medium text-slate-600">{item.category}</td>
                      <td className="p-3 text-center font-mono text-slate-500">{item.unit}</td>

                      {/* Office stock */}
                      <td className="p-3 text-right font-mono font-bold bg-blue-50/20 text-blue-900">
                        {item.officeStock.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-center font-mono text-[11px] bg-blue-50/20 text-slate-400">
                        {item.minOfficeStock}
                      </td>

                      {/* Field stock */}
                      <td className={`p-3 text-right font-mono font-extrabold bg-emerald-50/20 ${isFieldLow ? 'text-rose-600' : 'text-emerald-900'}`}>
                        {fieldQty.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-center font-mono text-[11px] bg-emerald-50/20 text-slate-400">
                        {item.minFieldStock}
                      </td>

                      <td className="p-3 text-right font-mono text-slate-700">
                        {formatRupiah(item.avgBuyPrice)}
                      </td>

                      <td className="p-3 text-center">
                        {isFieldLow ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Stok Menipis</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Aman
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SPB PERMINTAAN MATERIAL */}
      {activeTab === 'spb' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="space-y-3">
            {projectSpbs.map(spb => (
              <div key={spb.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-amber-300 px-2 py-0.5 rounded">
                        {spb.requestNumber}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        spb.urgency === 'urgent' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {spb.urgency}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Diajukan oleh: <span className="font-bold text-slate-900">{spb.requestedBy}</span> ({spb.role}) • Tgl Dibutuhkan: <span className="font-semibold text-rose-700">{spb.requiredDate}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Bagian: <span className="font-medium text-slate-800">{spb.wbsSection}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase px-2.5 py-1 rounded bg-blue-100 text-blue-800">
                      {spb.status.replace('_', ' ')}
                    </span>
                    {currentRoleInfo.canApprove && spb.status === 'diajukan' && (
                      <button
                        onClick={() => approveMaterialRequest(spb.id, currentRoleInfo.title)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition shadow"
                      >
                        Setujui SPB
                      </button>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Item Material Diminta:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {spb.items.map((item, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-900">{item.materialName}</div>
                          <div className="text-[11px] text-slate-500">{item.notes}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-slate-900">
                            {item.requestedQty} {item.unit}
                          </div>
                          <div className="text-[10px] text-slate-400">Acc: {item.approvedQty} {item.unit}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PURCHASE ORDER */}
      {activeTab === 'po' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="space-y-3">
            {projectPOs.map(po => (
              <div key={po.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-amber-300 px-2 py-0.5 rounded">
                        {po.poNumber}
                      </span>
                      <span className="font-bold text-slate-800 text-xs">{po.supplierName}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Tujuan Pengiriman: <span className="font-semibold text-slate-800">{po.deliveryDestination === 'lokasi_proyek' ? 'Langsung ke Lapangan' : 'Gudang Kantor'}</span> • Terms: {po.paymentTerms}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold font-mono text-slate-900">
                      {formatRupiah(po.grandTotal)}
                    </div>
                    <div className="text-[10px] text-slate-400">Termasuk PPN 11% ({formatRupiah(po.ppnAmount)})</div>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  {po.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-700 py-1 border-b border-slate-50">
                      <span>{item.qty} {item.unit} {item.materialName}</span>
                      <span className="font-mono font-semibold">{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: KARTU STOK & MUTASI */}
      {activeTab === 'pemakaian' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Waktu & Tanggal</th>
                  <th className="p-3">Jenis Transaksi</th>
                  <th className="p-3">Material</th>
                  <th className="p-3 text-right">Jumlah (Qty)</th>
                  <th className="p-3">Lokasi / Proyek</th>
                  <th className="p-3">No. Dokumen Ref</th>
                  <th className="p-3">Oleh / Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projectTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-500">{tx.timestamp}</td>
                    <td className="p-3 font-semibold">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        tx.type === 'field_usage'
                          ? 'bg-amber-100 text-amber-800'
                          : tx.type === 'receive_at_field'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {tx.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{tx.materialName}</td>
                    <td className={`p-3 text-right font-mono font-bold ${tx.qty < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {tx.qty > 0 ? `+${tx.qty}` : tx.qty} {tx.unit}
                    </td>
                    <td className="p-3 text-slate-600">{tx.location === 'gudang_kantor' ? 'Kantor Pusat' : currentProject.code}</td>
                    <td className="p-3 font-mono text-slate-600">{tx.refDocument}</td>
                    <td className="p-3 text-slate-500">
                      <div>{tx.performedBy}</div>
                      <div className="text-[10px] text-slate-400">{tx.reason}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: SPB */}
      {showSPBModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateSPB} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Form Surat Permintaan Bahan (SPB Lapangan)</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Pilih Material</label>
                <select
                  value={spbMaterialId}
                  onChange={e => setSpbMaterialId(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                >
                  {stockItems.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Jumlah Permintaan (Qty)</label>
                <input
                  type="number"
                  min="1"
                  value={spbQty}
                  onChange={e => setSpbQty(parseInt(e.target.value) || 0)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Item Pekerjaan / Alasan</label>
                <input
                  type="text"
                  value={spbWbs}
                  onChange={e => setSpbWbs(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Tingkat Urgensi</label>
                <select
                  value={spbUrgency}
                  onChange={e => setSpbUrgency(e.target.value as any)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                >
                  <option value="normal">Normal (3-5 Hari)</option>
                  <option value="urgent">Mendesak / Cor Besok</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowSPBModal(false)}
                className="px-3 py-1.5 rounded-lg border text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Kirim Pengajuan SPB
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: PO Supplier */}
      {showPOModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreatePO} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Terbitkan Purchase Order (PO) Supplier</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Nama Supplier / Vendor</label>
                <input
                  type="text"
                  value={poSupplier}
                  onChange={e => setPoSupplier(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Pilih Material</label>
                <select
                  value={poMaterialId}
                  onChange={e => setPoMaterialId(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                >
                  {stockItems.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({formatRupiah(s.avgBuyPrice)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Jumlah Pembelian (Qty)</label>
                <input
                  type="number"
                  min="1"
                  value={poQty}
                  onChange={e => setPoQty(parseInt(e.target.value) || 0)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Tujuan Pengiriman</label>
                <select
                  value={poDestination}
                  onChange={e => setPoDestination(e.target.value as any)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                >
                  <option value="lokasi_proyek">Kirim Langsung ke Lokasi Proyek</option>
                  <option value="gudang_kantor">Kirim ke Gudang Kantor Pusat</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowPOModal(false)}
                className="px-3 py-1.5 rounded-lg border text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-amber-300 font-bold text-xs"
              >
                Terbitkan PO
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Record Usage per Work Item */}
      {showUsageModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRecordUsage} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Catat Pemakaian Material per Item Pekerjaan</h3>
            <p className="text-xs text-slate-500">Mengurangi stok gudang proyek dan menambahkan realisasi biaya pada RAP item pekerjaan.</p>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Item Pekerjaan (WBS)</label>
                <select
                  value={usageRabId}
                  onChange={e => setUsageRabId(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                >
                  {rabItems.map(r => (
                    <option key={r.id} value={r.id}>{r.wbsCode} - {r.description}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Material yang Dipakai</label>
                <select
                  value={usageMaterialId}
                  onChange={e => setUsageMaterialId(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                >
                  {stockItems.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Sisa Lapangan: {s.fieldStocks[currentProject.id] || 0} {s.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Jumlah Dipakai</label>
                <input
                  type="number"
                  min="1"
                  value={usageQty}
                  onChange={e => setUsageQty(parseInt(e.target.value) || 0)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowUsageModal(false)}
                className="px-3 py-1.5 rounded-lg border text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
              >
                Posting Pemakaian Material
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Receive Goods at Field */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleReceiveGoods} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Penerimaan Barang Fisik Lapangan (BAST)</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">No. Surat Jalan / BAST</label>
                <input
                  type="text"
                  value={receiveRefDoc}
                  onChange={e => setReceiveRefDoc(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Pilih Material Masuk</label>
                <select
                  value={receiveMaterialId}
                  onChange={e => setReceiveMaterialId(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                >
                  {stockItems.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Jumlah Fisik Diterima</label>
                <input
                  type="number"
                  min="1"
                  value={receiveQty}
                  onChange={e => setReceiveQty(parseInt(e.target.value) || 0)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowReceiveModal(false)}
                className="px-3 py-1.5 rounded-lg border text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs"
              >
                Simpan BAST & Tambah Stok
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
