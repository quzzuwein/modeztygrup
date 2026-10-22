import * as XLSX from 'xlsx';
import { Project, PT, RABItem, RAPItem, StockItem, WageRecord, FinancialEntry } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function exportComprehensiveExcel(params: {
  project: Project;
  pt: PT;
  rabItems: RABItem[];
  rapItems: RAPItem[];
  stockItems: StockItem[];
  wageRecords: WageRecord[];
  financialEntries: FinancialEntry[];
}) {
  const { project, pt, rabItems, rapItems, stockItems, wageRecords, financialEntries } = params;
  const wb = XLSX.utils.book_new();

  // 1. Sheet Ringkasan Proyek
  const summaryData = [
    ['LAPORAN KINERJA PROYEK & KONTRAK'],
    ['KONTRAKTOR PRO MANAGEMENT SYSTEM'],
    [''],
    ['Entitas PT', pt.name],
    ['NPWP Perusahaan', pt.npwp],
    ['Nama Proyek', project.name],
    ['Kode Proyek', project.code],
    ['Klien / Pemberi Kerja', project.clientName],
    ['Lokasi Proyek', project.location],
    ['Tanggal Mulai', project.startDate],
    ['Target Selesai', project.endDate],
    ['Status Proyek', project.status.toUpperCase()],
    [''],
    ['METRIK KEUANGAN & ANGGARAN', 'NILAI (RUPIAH)', 'PERSENTASE (%)'],
    ['Nilai Kontrak Klien', project.contractValue, '100.0%'],
    ['Target Laba Kotor (Profit)', project.targetProfitNominal, `${project.targetProfitPercent.toFixed(1)}%`],
    ['Total Rencana Anggaran Pelaksanaan (RAP)', project.totalRapBudget, `${((project.totalRapBudget / project.contractValue) * 100).toFixed(1)}%`],
    ['Total Biaya Realisasi Saat Ini', project.totalCostRealized, `${((project.totalCostRealized / project.contractValue) * 100).toFixed(1)}%`],
    ['Total Pengeluaran Kas (Paid Out)', project.totalPaidOut, ''],
    ['Komitmen Belum Bayar (Unpaid PO/SPK)', project.unpaidCommitments, ''],
    [''],
    ['PROGRES FISIK PROYEK', 'PERSENTASE (%)'],
    ['Rencana Progres (Schedule Baseline)', `${project.plannedProgressPercent.toFixed(1)}%`],
    ['Realisasi Progres Fisik Aktual', `${project.actualProgressPercent.toFixed(1)}%`],
    ['Deviasi Progres (Schedule Variance)', `${(project.actualProgressPercent - project.plannedProgressPercent).toFixed(1)}%`]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan_Proyek');

  // 2. Sheet RAB Kontrak
  const rabHeader = ['No WBS', 'Kategori Pekerjaan', 'Uraian Pekerjaan', 'Volume', 'Satuan', 'Harga Satuan Kontrak (Rp)', 'Total Nilai Kontrak (Rp)', 'Status'];
  const rabRows = rabItems.map(item => [
    item.wbsCode,
    item.section,
    item.description,
    item.volume,
    item.unit,
    item.unitPrice,
    item.totalPrice,
    item.status.toUpperCase()
  ]);
  const wsRAB = XLSX.utils.aoa_to_sheet([['DAFTAR RENCANA ANGGARAN BIAYA (RAB) KONTRAK'], [''], rabHeader, ...rabRows]);
  XLSX.utils.book_append_sheet(wb, wsRAB, 'RAB_Kontrak');

  // 3. Sheet RAP & Perbandingan
  const rapHeader = [
    'No WBS',
    'Uraian Pekerjaan',
    'Vol',
    'Sat',
    'Harga RAP (Rp)',
    'Total RAP (Rp)',
    'Anggaran Material (Rp)',
    'Anggaran Upah (Rp)',
    'Realisasi Material (Rp)',
    'Realisasi Upah (Rp)',
    'Total Realisasi (Rp)',
    'Proyeksi Margin Laba (Rp)',
    'Margin (%)'
  ];
  const rapRows = rapItems.map(item => [
    item.wbsCode,
    item.description,
    item.volume,
    item.unit,
    item.rapUnitPrice,
    item.rapTotalPrice,
    item.budgetMaterialUnit * item.volume,
    item.budgetLaborUnit * item.volume,
    item.realizedMaterialCost,
    item.realizedLaborCost,
    item.totalCostRealized,
    item.projectedProfit,
    `${item.projectedProfitPercent.toFixed(1)}%`
  ]);
  const wsRAP = XLSX.utils.aoa_to_sheet([['RENCANA ANGGARAN PELAKSANAAN (RAP) & KONTROL BIAYA'], [''], rapHeader, ...rapRows]);
  XLSX.utils.book_append_sheet(wb, wsRAP, 'RAP_Anggaran');

  // 4. Sheet Stok Gudang Kantor & Lapangan
  const stockHeader = ['Kode Material', 'Nama Material', 'Kategori', 'Satuan', 'Stok Gudang Kantor', 'Buffer Min Kantor', 'Stok Gudang Lapangan', 'Buffer Min Lapangan', 'Harga Beli Rata-rata'];
  const stockRows = stockItems.map(item => [
    item.code,
    item.name,
    item.category,
    item.unit,
    item.officeStock,
    item.minOfficeStock,
    item.fieldStocks[project.id] || 0,
    item.minFieldStock,
    item.avgBuyPrice
  ]);
  const wsStock = XLSX.utils.aoa_to_sheet([['KONTROL LOGISTIK & STOK MATERIAL'], [''], stockHeader, ...stockRows]);
  XLSX.utils.book_append_sheet(wb, wsStock, 'Stok_Logistik');

  // 5. Sheet Upah Mandor & Tenaga Kerja
  const wageHeader = ['No Dokumen', 'Metode Upah', 'Item Pekerjaan', 'Nama Mandor', 'Jumlah Tukang', 'Volume / Mandays', 'Tarif', 'Nilai Bruto (Rp)', 'PPh 21 (2%)', 'Diterima Bersih (Rp)', 'Status'];
  const wageRows = wageRecords.map(w => [
    w.recordNumber,
    w.wageType.toUpperCase(),
    w.workDescription,
    w.mandorName,
    w.workerCount,
    w.wageType === 'borongan' ? `${w.volumeDone} ${w.unit}` : `${w.mandaysTotal} mandays`,
    w.wageType === 'borongan' ? w.unitRate : w.dailyRateAvg,
    w.grossAmount,
    w.pph21Amount,
    w.netPayable,
    w.status.toUpperCase()
  ]);
  const wsWage = XLSX.utils.aoa_to_sheet([['REKAPITULASI PEMBAYARAN UPAH TENAGA KERJA'], [''], wageHeader, ...wageRows]);
  XLSX.utils.book_append_sheet(wb, wsWage, 'Upah_Tenaga_Kerja');

  // 6. Sheet Keuangan & Pajak
  const finHeader = ['Tanggal', 'No Ref', 'Kategori', 'Deskripsi Transaksi', 'Penerima / Pembayar', 'Masuk (Debit)', 'Keluar (Kredit)', 'PPN 11%', 'PPh Konstruksi'];
  const finRows = financialEntries.map(f => [
    f.date,
    f.refDoc,
    f.category.toUpperCase(),
    f.description,
    f.payeeOrPayer,
    f.type === 'masuk' ? f.amount : 0,
    f.type === 'keluar' ? f.amount : 0,
    f.taxDetails?.ppnAmount || 0,
    f.taxDetails?.pphFinalAmount || 0
  ]);
  const wsFin = XLSX.utils.aoa_to_sheet([['ARUS KAS KEUANGAN PROYEK & PAJAK'], [''], finHeader, ...finRows]);
  XLSX.utils.book_append_sheet(wb, wsFin, 'Keuangan_Pajak');

  const fileName = `Laporan_Lengkap_${project.code}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportRABToExcel(rabItems: RABItem[], projectName: string) {
  const wb = XLSX.utils.book_new();
  const rabHeader = ['No WBS', 'Kategori Bagian', 'Uraian Pekerjaan', 'Volume', 'Satuan', 'Harga Satuan Kontrak (Rp)', 'Total Harga (Rp)', 'Kode AHS', 'Status'];
  const rabRows = rabItems.map(item => [
    item.wbsCode,
    item.section,
    item.description,
    item.volume,
    item.unit,
    item.unitPrice,
    item.totalPrice,
    item.ahsCode || '-',
    item.status.toUpperCase()
  ]);
  const ws = XLSX.utils.aoa_to_sheet([
    ['RENCANA ANGGARAN BIAYA (RAB) KONTRAK'],
    [`Proyek: ${projectName}`],
    [''],
    rabHeader,
    ...rabRows
  ]);
  XLSX.utils.book_append_sheet(wb, ws, 'RAB_Kontrak');
  XLSX.writeFile(wb, `RAB_${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportRAPToExcel(rapItems: RAPItem[], projectName: string) {
  const wb = XLSX.utils.book_new();
  const rapHeader = ['WBS', 'Uraian Pekerjaan', 'Vol', 'Sat', 'Harga Kontrak', 'Harsat RAP', 'Anggaran Material', 'Anggaran Upah', 'Total RAP', 'Realisasi Biaya', 'Estimasi Laba', 'Margin (%)'];
  const rapRows = rapItems.map(item => [
    item.wbsCode,
    item.description,
    item.volume,
    item.unit,
    item.contractUnitPrice,
    item.rapUnitPrice,
    item.budgetMaterialUnit * item.volume,
    item.budgetLaborUnit * item.volume,
    item.rapTotalPrice,
    item.totalCostRealized,
    item.projectedProfit,
    `${item.projectedProfitPercent.toFixed(1)}%`
  ]);
  const ws = XLSX.utils.aoa_to_sheet([
    ['RENCANA ANGGARAN PELAKSANAAN (RAP) & KONTROL BIAYA'],
    [`Proyek: ${projectName}`],
    [''],
    rapHeader,
    ...rapRows
  ]);
  XLSX.utils.book_append_sheet(wb, ws, 'RAP_Anggaran');
  XLSX.writeFile(wb, `RAP_${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportStockToExcel(stockItems: StockItem[], projectId: string, projectName: string) {
  const wb = XLSX.utils.book_new();
  const stockHeader = ['Kode Material', 'Nama Material', 'Kategori', 'Satuan', 'Stok Kantor Pusat', 'Buffer Min Kantor', 'Stok Lapangan Proyek', 'Buffer Min Lapangan', 'Harga Beli Rata2'];
  const stockRows = stockItems.map(item => [
    item.code,
    item.name,
    item.category,
    item.unit,
    item.officeStock,
    item.minOfficeStock,
    item.fieldStocks[projectId] || 0,
    item.minFieldStock,
    item.avgBuyPrice
  ]);
  const ws = XLSX.utils.aoa_to_sheet([
    ['KONTROL LOGISTIK & SALDO GUDANG KANTOR VS LAPANGAN'],
    [`Proyek: ${projectName}`],
    [''],
    stockHeader,
    ...stockRows
  ]);
  XLSX.utils.book_append_sheet(wb, ws, 'Stok_Gudang');
  XLSX.writeFile(wb, `Stok_Material_${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportWagesToExcel(wageRecords: WageRecord[], projectName: string) {
  const wb = XLSX.utils.book_new();
  const wageHeader = ['No Dokumen', 'Metode', 'Item Pekerjaan', 'Nama Mandor', 'Jumlah Pekerja', 'Volume / Mandays', 'Tarif Dasar', 'Nilai Bruto (Rp)', 'PPh 21 (2%)', 'Netto Dibayar (Rp)', 'Status'];
  const wageRows = wageRecords.map(w => [
    w.recordNumber,
    w.wageType.toUpperCase(),
    w.workDescription,
    w.mandorName,
    w.workerCount,
    w.wageType === 'borongan' ? `${w.volumeDone} ${w.unit}` : `${w.mandaysTotal} mandays`,
    w.wageType === 'borongan' ? w.unitRate : w.dailyRateAvg,
    w.grossAmount,
    w.pph21Amount,
    w.netPayable,
    w.status.toUpperCase()
  ]);
  const ws = XLSX.utils.aoa_to_sheet([
    ['REKAPITULASI PEMBAYARAN UPAH MANDOR & PAJAK PPH 21'],
    [`Proyek: ${projectName}`],
    [''],
    wageHeader,
    ...wageRows
  ]);
  XLSX.utils.book_append_sheet(wb, ws, 'Upah_Mandor');
  XLSX.writeFile(wb, `Rekap_Upah_${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportFinanceToExcel(financialEntries: FinancialEntry[], projectName: string) {
  const wb = XLSX.utils.book_new();
  const finHeader = ['Tanggal', 'No Ref', 'Kategori', 'Deskripsi Transaksi', 'Pihak Terkait', 'Masuk (Debit)', 'Keluar (Kredit)', 'PPN 11%', 'PPh Final Konstruksi'];
  const finRows = financialEntries.map(f => [
    f.date,
    f.refDoc,
    f.category.toUpperCase(),
    f.description,
    f.payeeOrPayer,
    f.type === 'masuk' ? f.amount : 0,
    f.type === 'keluar' ? f.amount : 0,
    f.taxDetails?.ppnAmount || 0,
    f.taxDetails?.pphFinalAmount || 0
  ]);
  const ws = XLSX.utils.aoa_to_sheet([
    ['JURNAL PEMBUKUAN ARUS KAS KEUANGAN & PAJAK PROYEK'],
    [`Proyek: ${projectName}`],
    [''],
    finHeader,
    ...finRows
  ]);
  XLSX.utils.book_append_sheet(wb, ws, 'Keuangan_Kas');
  XLSX.writeFile(wb, `Keuangan_${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportAHSToExcel(ahsList: any[]) {
  const wb = XLSX.utils.book_new();
  const header = ['Kode AHS', 'Nama Analisa Pekerjaan', 'Kategori', 'Satuan', 'Komponen Bahan (Rp)', 'Komponen Upah (Rp)', 'Komponen Alat (Rp)', 'Overhead/Profit (Rp)', 'Harga Satuan Total (Rp)', 'Dasar Regulasi'];
  const rows = ahsList.map(a => [
    a.code,
    a.name,
    a.category,
    a.unit,
    a.materialTotal,
    a.laborTotal,
    a.equipmentTotal,
    a.overheadAmount,
    a.totalUnitPrice,
    a.version
  ]);
  const ws = XLSX.utils.aoa_to_sheet([
    ['DATABASE MASTER ANALISA HARGA SATUAN (AHS PUPR & SNI)'],
    [''],
    header,
    ...rows
  ]);
  XLSX.utils.book_append_sheet(wb, ws, 'Master_AHS_PUPR');
  XLSX.writeFile(wb, `Master_AHS_PUPR_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function triggerPrintReport(): void {
  window.print();
}
