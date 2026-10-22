import * as XLSX from 'xlsx';
import { RABItem, MasterAHS } from '../types';

export interface ParsedRABRow {
  wbsCode: string;
  section: string;
  description: string;
  volume: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  suggestedAhsCode?: string;
  suggestedAhsName?: string;
  confidence: number;
  errors: string[];
}

export interface ParseResult {
  fileName: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  calculatedGrandTotal: number;
  declaredGrandTotal?: number;
  rows: ParsedRABRow[];
}

// Heuristic keyword matching with government AHS database
export function matchAHS(description: string, availableAhs: MasterAHS[]): { code?: string; name?: string; confidence: number } {
  const desc = description.toLowerCase();
  
  if (desc.includes('beton') || desc.includes('cor') || desc.includes('k-250') || desc.includes('ready mix') || desc.includes('k250')) {
    const ahs = availableAhs.find(a => a.code === 'A.4.1.1.25');
    if (ahs) return { code: ahs.code, name: ahs.name, confidence: 95 };
  }
  
  if (desc.includes('pembesian') || desc.includes('besi ulir') || desc.includes('tulangan') || desc.includes('bjtd') || desc.includes('rebar')) {
    const ahs = availableAhs.find(a => a.code === 'A.4.1.1.17');
    if (ahs) return { code: ahs.code, name: ahs.name, confidence: 94 };
  }
  
  if (desc.includes('bekisting') || desc.includes('formwork') || desc.includes('multiplek') || desc.includes('cetakan beton')) {
    const ahs = availableAhs.find(a => a.code === 'A.4.1.1.21');
    if (ahs) return { code: ahs.code, name: ahs.name, confidence: 92 };
  }
  
  if (desc.includes('bata ringan') || desc.includes('hebel') || desc.includes('pasangan dinding hebel') || desc.includes('aac')) {
    const ahs = availableAhs.find(a => a.code === 'A.4.4.1.9');
    if (ahs) return { code: ahs.code, name: ahs.name, confidence: 96 };
  }
  
  if (desc.includes('plesteran') || desc.includes('acian') || desc.includes('plester') || desc.includes('mu-301')) {
    const ahs = availableAhs.find(a => a.code === 'A.4.4.2.4');
    if (ahs) return { code: ahs.code, name: ahs.name, confidence: 93 };
  }
  
  if (desc.includes('cat') || desc.includes('pengecatan') || desc.includes('plamir') || desc.includes('interior painting') || desc.includes('dulux') || desc.includes('mowilex')) {
    const ahs = availableAhs.find(a => a.code === 'A.4.7.1.10');
    if (ahs) return { code: ahs.code, name: ahs.name, confidence: 91 };
  }

  return { confidence: 0 };
}

export function parseExcelFile(fileBuffer: ArrayBuffer, fileName: string, availableAhs: MasterAHS[]): ParseResult {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Find header row
  let headerIndex = -1;
  let colMap = {
    wbs: -1,
    desc: -1,
    vol: -1,
    unit: -1,
    price: -1,
    total: -1
  };

  for (let r = 0; r < Math.min(rawData.length, 15); r++) {
    const row = rawData[r];
    if (!row || !Array.isArray(row)) continue;

    const rowStr = row.map(cell => String(cell || '').toLowerCase().trim());
    
    const descIdx = rowStr.findIndex(c => c.includes('uraian') || c.includes('pekerjaan') || c.includes('deskripsi') || c.includes('item'));
    const volIdx = rowStr.findIndex(c => c.includes('vol') || c.includes('volume') || c.includes('qty') || c.includes('jumlah vol'));
    const unitIdx = rowStr.findIndex(c => c.includes('sat') || c.includes('satuan') || c.includes('unit'));
    const priceIdx = rowStr.findIndex(c => c.includes('harga') || c.includes('tarif') || c.includes('unit price') || c.includes('harsat'));

    if (descIdx !== -1 && (volIdx !== -1 || priceIdx !== -1)) {
      headerIndex = r;
      colMap.desc = descIdx;
      colMap.vol = volIdx !== -1 ? volIdx : descIdx + 1;
      colMap.unit = unitIdx !== -1 ? unitIdx : descIdx + 2;
      colMap.price = priceIdx !== -1 ? priceIdx : descIdx + 3;
      
      const totalIdx = rowStr.findIndex(c => c.includes('total') || c.includes('jumlah') || c.includes('subtotal'));
      colMap.total = totalIdx !== -1 ? totalIdx : colMap.price + 1;
      
      const wbsIdx = rowStr.findIndex(c => c.includes('no') || c.includes('kode') || c.includes('wbs') || c.includes('item no'));
      colMap.wbs = wbsIdx !== -1 ? wbsIdx : 0;
      break;
    }
  }

  if (headerIndex === -1) {
    // Fallback standard column indices
    headerIndex = 0;
    colMap = { wbs: 0, desc: 1, vol: 2, unit: 3, price: 4, total: 5 };
  }

  const parsedRows: ParsedRABRow[] = [];
  let currentSection = 'I. PEKERJAAN STRUKTUR & ARSITEKTUR';
  let totalSum = 0;

  for (let r = headerIndex + 1; r < rawData.length; r++) {
    const row = rawData[r];
    if (!row || row.length === 0) continue;

    const rawWbs = String(row[colMap.wbs] || '').trim();
    const rawDesc = String(row[colMap.desc] || '').trim();
    
    // Detect section headers (e.g. "I. PEKERJAAN PERSIAPAN" or rows with only text and 0 volume)
    if (rawDesc && (!row[colMap.vol] && !row[colMap.price]) && (rawDesc.toUpperCase() === rawDesc || rawWbs.includes('.') === false)) {
      currentSection = rawDesc;
      continue;
    }

    if (!rawDesc) continue;

    const volume = parseFloat(String(row[colMap.vol] || '0').replace(/[^0-9.-]+/g, '')) || 0;
    const unit = String(row[colMap.unit] || 'ls').trim() || 'ls';
    const unitPrice = parseFloat(String(row[colMap.price] || '0').replace(/[^0-9.-]+/g, '')) || 0;
    let totalPrice = parseFloat(String(row[colMap.total] || '0').replace(/[^0-9.-]+/g, '')) || 0;

    if (totalPrice === 0 && volume > 0 && unitPrice > 0) {
      totalPrice = volume * unitPrice;
    }

    const errors: string[] = [];
    if (volume <= 0) errors.push('Volume harus lebih dari 0');
    if (unitPrice <= 0) errors.push('Harga satuan belum diisi');
    if (!unit) errors.push('Satuan wajib diisi');

    const match = matchAHS(rawDesc, availableAhs);

    parsedRows.push({
      wbsCode: rawWbs || `${parsedRows.length + 1}`,
      section: currentSection,
      description: rawDesc,
      volume,
      unit,
      unitPrice,
      totalPrice,
      suggestedAhsCode: match.code,
      suggestedAhsName: match.name,
      confidence: match.confidence,
      errors
    });

    totalSum += totalPrice;
  }

  return {
    fileName,
    totalRows: parsedRows.length,
    validRows: parsedRows.filter(r => r.errors.length === 0).length,
    errorRows: parsedRows.filter(r => r.errors.length > 0).length,
    calculatedGrandTotal: totalSum,
    rows: parsedRows
  };
}

// Generate template workbook for users to download
export function generateRABExcelTemplate(): void {
  const data = [
    ['KONTRAKTOR PRO - TEMPLATE IMPORT RAB EXCEL RESMI'],
    ['Klien: PT Sudirman Graha Investama | Proyek: Pembangunan Gedung Kantor 5 Lantai'],
    [''],
    ['No', 'Uraian Pekerjaan', 'Volume', 'Satuan', 'Harga Satuan (Rp)', 'Total Harga (Rp)'],
    ['I. PEKERJAAN STRUKTUR BAWAH (SUBSTRUCTURE)', '', '', '', '', ''],
    ['1.1', 'Pekerjaan Beton Pile Cap & Tie Beam Mutu K-250', 385, 'm3', 2150000, 827750000],
    ['1.2', 'Pekerjaan Pembesian Besi Ulir BJTD-40 Pondasi & Tie Beam', 48500, 'kg', 24500, 1188250000],
    ['1.3', 'Pemasangan Bekisting Pondasi & Balok Tie Beam', 1240, 'm2', 385000, 477400000],
    ['II. PEKERJAAN STRUKTUR ATAS (UPPER STRUCTURE)', '', '', '', '', ''],
    ['2.1', 'Pengecoran Beton Kolom & Balok Lt. 1 s/d Lt. 5 Mutu K-250', 1420, 'm3', 2180000, 3095600000],
    ['2.2', 'Pekerjaan Pembesian Balok, Kolom, & Plat Lantai BJTD-40', 182000, 'kg', 24500, 4459000000],
    ['2.3', 'Bekisting Balok & Plat Lantai Multiplek 12mm', 5800, 'm2', 395000, 2291000000],
    ['III. PEKERJAAN ARSITEKTUR & PASANGAN', '', '', '', '', ''],
    ['3.1', 'Pasangan Dinding Bata Ringan Hebel t = 10 cm', 6400, 'm2', 165000, 1056000000],
    ['3.2', 'Plesteran + Acian Dinding Mortar Instan', 12800, 'm2', 135000, 1728000000],
    ['3.3', 'Pengecatan Dinding Interior Acrylic Emulsion (2 Lapis)', 11500, 'm2', 55000, 632500000]
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 10 },
    { wch: 55 },
    { wch: 14 },
    { wch: 12 },
    { wch: 22 },
    { wch: 24 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template_RAB_Kontrak');
  XLSX.writeFile(wb, 'Template_Import_RAB_KontraktorPro.xlsx');
}
