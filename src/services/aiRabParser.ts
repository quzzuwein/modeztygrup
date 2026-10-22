import * as XLSX from 'xlsx';
import { RABItem, MasterAHS } from '../types';

export interface ParsedRABRow {
  wbsCode: string;
  section: string;
  sheetName?: string;
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

export interface SheetParseResult {
  sheetName: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  calculatedGrandTotal: number;
  rows: ParsedRABRow[];
}

export interface WorkbookParseResult {
  fileName: string;
  sheetNames: string[];
  activeSheetName: string; // 'ALL' or specific sheet
  sheets: Record<string, SheetParseResult>;
  combinedResult: SheetParseResult;
  fileBuffer: ArrayBuffer;
}

// Backwards compatible type alias
export type ParseResult = SheetParseResult & {
  fileName: string;
};

// Heuristic keyword matching with government AHS database
export function matchAHS(description: string, availableAhs: MasterAHS[]): { code?: string; name?: string; confidence: number } {
  const desc = description.toLowerCase();
  
  if (desc.includes('beton') || desc.includes('cor') || desc.includes('k-250') || desc.includes('ready mix') || desc.includes('k250') || desc.includes('pile cap')) {
    const ahs = availableAhs.find(a => a.code === 'A.4.1.1.25');
    if (ahs) return { code: ahs.code, name: ahs.name, confidence: 95 };
  }
  
  if (desc.includes('pembesian') || desc.includes('besi ulir') || desc.includes('tulangan') || desc.includes('bjtd') || desc.includes('rebar') || desc.includes('besi polos')) {
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

  if (desc.includes('bor') || desc.includes('pengeboran') || desc.includes('drill') || desc.includes('soil') || desc.includes('spt') || desc.includes('tanah')) {
    const ahs = availableAhs.find(a => a.category.toLowerCase().includes('tanah'));
    if (ahs) return { code: ahs.code, name: ahs.name, confidence: 85 };
  }

  return { confidence: 0 };
}

// Clean and parse Indonesian / international numeric strings
function parseNum(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  let str = String(val).trim().replace(/Rp/gi, '').replace(/\s+/g, '');
  
  // Detect if format is 1.234.567,89 (Indonesian) or 1,234,567.89 (US)
  const lastComma = str.lastIndexOf(',');
  const lastDot = str.lastIndexOf('.');

  if (lastComma > lastDot) {
    // Indonesian format: 1.250.000,50 -> remove dots, replace comma with dot
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > lastComma) {
    // US format or standard dot decimal: remove commas
    str = str.replace(/,/g, '');
  }

  // Remove any remaining unexpected chars
  str = str.replace(/[^0-9.-]+/g, '');
  const res = parseFloat(str);
  return isNaN(res) ? 0 : res;
}

// Parse a single worksheet into SheetParseResult
export function parseSingleWorksheet(
  worksheet: XLSX.WorkSheet,
  sheetName: string,
  availableAhs: MasterAHS[]
): SheetParseResult {
  const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  if (!rawData || rawData.length === 0) {
    return {
      sheetName,
      totalRows: 0,
      validRows: 0,
      errorRows: 0,
      calculatedGrandTotal: 0,
      rows: []
    };
  }

  // Look for header row up to row 35
  let headerIndex = -1;
  let colMap = {
    wbs: -1,
    desc: -1,
    vol: -1,
    unit: -1,
    price: -1,
    total: -1
  };

  for (let r = 0; r < Math.min(rawData.length, 35); r++) {
    const row = rawData[r];
    if (!row || !Array.isArray(row)) continue;

    const rowStr = row.map(cell => String(cell || '').toLowerCase().trim());
    
    const descIdx = rowStr.findIndex(c => 
      c.includes('uraian') || c.includes('pekerjaan') || c.includes('deskripsi') || 
      c.includes('item') || c.includes('kegiatan') || c.includes('spesifikasi')
    );
    const volIdx = rowStr.findIndex(c => 
      c.includes('vol') || c.includes('volume') || c.includes('qty') || 
      c.includes('kuantum') || c.includes('kuantitas') || c.includes('jumlah vol')
    );
    const unitIdx = rowStr.findIndex(c => 
      c.includes('sat') || c.includes('satuan') || c.includes('unit') || c.includes('uom')
    );
    const priceIdx = rowStr.findIndex(c => 
      c.includes('harga') || c.includes('tarif') || c.includes('unit price') || 
      c.includes('harsat') || c.includes('harga satuan')
    );

    if (descIdx !== -1 && (volIdx !== -1 || priceIdx !== -1)) {
      headerIndex = r;
      colMap.desc = descIdx;
      colMap.vol = volIdx !== -1 ? volIdx : descIdx + 1;
      colMap.unit = unitIdx !== -1 ? unitIdx : descIdx + 2;
      colMap.price = priceIdx !== -1 ? priceIdx : descIdx + 3;
      
      const totalIdx = rowStr.findIndex(c => 
        c.includes('total') || c.includes('jumlah') || c.includes('subtotal') || c.includes('sub total')
      );
      colMap.total = totalIdx !== -1 ? totalIdx : colMap.price + 1;
      
      const wbsIdx = rowStr.findIndex(c => 
        c.includes('no') || c.includes('nomor') || c.includes('kode') || c.includes('wbs') || c.includes('pos')
      );
      colMap.wbs = wbsIdx !== -1 ? wbsIdx : 0;
      break;
    }
  }

  if (headerIndex === -1) {
    // Fallback heuristic: find first row with text and numbers
    for (let r = 0; r < Math.min(rawData.length, 10); r++) {
      const row = rawData[r];
      if (row && row.length >= 3) {
        headerIndex = r;
        break;
      }
    }
    colMap = { wbs: 0, desc: 1, vol: 2, unit: 3, price: 4, total: 5 };
  }

  const parsedRows: ParsedRABRow[] = [];
  let currentSection = sheetName ? `Sheet: ${sheetName}` : 'I. PEKERJAAN UMUM';
  let totalSum = 0;

  for (let r = headerIndex + 1; r < rawData.length; r++) {
    const row = rawData[r];
    if (!row || row.length === 0) continue;

    // Check if entire row is empty
    const hasData = row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '');
    if (!hasData) continue;

    const rawWbs = String(row[colMap.wbs] !== undefined ? row[colMap.wbs] : '').trim();
    const rawDesc = String(row[colMap.desc] !== undefined ? row[colMap.desc] : '').trim();
    const rawVol = row[colMap.vol];
    const rawUnit = row[colMap.unit];
    const rawPrice = row[colMap.price];
    const rawTotal = row[colMap.total];

    const lowerDesc = rawDesc.toLowerCase();

    // Skip redundant table headers repeated on page breaks
    if (
      lowerDesc === 'uraian' ||
      lowerDesc === 'uraian pekerjaan' ||
      lowerDesc === 'item pekerjaan' ||
      lowerDesc === 'no' ||
      lowerDesc === 'volume' ||
      lowerDesc === 'harga satuan' ||
      lowerDesc === 'jumlah harga'
    ) {
      continue;
    }

    // Skip total / summary rows
    if (
      lowerDesc.startsWith('total') ||
      lowerDesc.startsWith('sub total') ||
      lowerDesc.startsWith('subtotal') ||
      lowerDesc.startsWith('jumlah harga') ||
      lowerDesc.startsWith('rekapitulasi') ||
      lowerDesc.startsWith('ppn') ||
      lowerDesc.startsWith('dibulatkan') ||
      lowerDesc.startsWith('terbilang')
    ) {
      continue;
    }

    // Detect section headers (e.g. "I. PEKERJAAN PERSIAPAN" or "A. PEKERJAAN STRUKTUR")
    // When volume and price are absent, but there is descriptive text
    const numVol = parseNum(rawVol);
    const numPrice = parseNum(rawPrice);
    const numTotal = parseNum(rawTotal);

    if (rawDesc && numVol === 0 && numPrice === 0 && numTotal === 0) {
      // This is a section title or group header!
      currentSection = rawDesc;
      continue;
    }

    if (!rawDesc) {
      // If no description, skip
      continue;
    }

    let volume = numVol;
    let unitPrice = numPrice;
    let totalPrice = numTotal;
    let unit = String(rawUnit || '').trim();

    // Auto-calculate missing price or total
    if (totalPrice === 0 && volume > 0 && unitPrice > 0) {
      totalPrice = Math.round(volume * unitPrice);
    } else if (unitPrice === 0 && volume > 0 && totalPrice > 0) {
      unitPrice = Math.round(totalPrice / volume);
    } else if (volume === 0 && totalPrice > 0) {
      volume = 1;
      unit = unit || 'ls';
      unitPrice = totalPrice;
    }

    if (!unit) {
      unit = 'ls';
    }

    const errors: string[] = [];
    if (volume <= 0 && totalPrice <= 0) {
      errors.push('Volume atau total harga pekerjaan harus diisi');
    }

    const match = matchAHS(rawDesc, availableAhs);

    parsedRows.push({
      wbsCode: rawWbs || `${parsedRows.length + 1}`,
      section: currentSection,
      sheetName,
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
    sheetName,
    totalRows: parsedRows.length,
    validRows: parsedRows.filter(r => r.errors.length === 0).length,
    errorRows: parsedRows.filter(r => r.errors.length > 0).length,
    calculatedGrandTotal: totalSum,
    rows: parsedRows
  };
}

// Complete Workbook Parser (Handles Multi-Sheet Excel)
export function parseExcelWorkbook(
  fileBuffer: ArrayBuffer,
  fileName: string,
  availableAhs: MasterAHS[]
): WorkbookParseResult {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const sheetNames = workbook.SheetNames || [];
  
  const sheets: Record<string, SheetParseResult> = {};
  const allRows: ParsedRABRow[] = [];
  let combinedTotal = 0;

  for (const name of sheetNames) {
    const ws = workbook.Sheets[name];
    if (!ws) continue;
    const parsed = parseSingleWorksheet(ws, name, availableAhs);
    sheets[name] = parsed;
    allRows.push(...parsed.rows);
    combinedTotal += parsed.calculatedGrandTotal;
  }

  const combinedResult: SheetParseResult = {
    sheetName: 'SEMUA SHEET (GABUNGAN)',
    totalRows: allRows.length,
    validRows: allRows.filter(r => r.errors.length === 0).length,
    errorRows: allRows.filter(r => r.errors.length > 0).length,
    calculatedGrandTotal: combinedTotal,
    rows: allRows
  };

  return {
    fileName,
    sheetNames,
    activeSheetName: 'ALL', // default to importing all sheets or allowing user switch
    sheets,
    combinedResult,
    fileBuffer
  };
}

// Legacy wrapper for single-sheet calls
export function parseExcelFile(
  fileBuffer: ArrayBuffer,
  fileName: string,
  availableAhs: MasterAHS[]
): ParseResult {
  const wbResult = parseExcelWorkbook(fileBuffer, fileName, availableAhs);
  // If multiple sheets and combined has rows, return combined result
  const mainResult = wbResult.combinedResult.totalRows > 0 ? wbResult.combinedResult : (wbResult.sheets[wbResult.sheetNames[0]] || wbResult.combinedResult);
  return {
    ...mainResult,
    fileName
  };
}

// Generate template workbook for users to download
export function generateRABExcelTemplate(): void {
  const data = [
    ['KONTRAKTOR PRO - TEMPLATE IMPORT RAB EXCEL RESMI MULTI-SHEET'],
    ['Klien: PT Klien Proyek | Proyek: Pembangunan Dermaga & Bangunan'],
    [''],
    ['No', 'Uraian Pekerjaan', 'Volume', 'Satuan', 'Harga Satuan (Rp)', 'Total Harga (Rp)'],
    ['I. PEKERJAAN STRUKTUR BAWAH (SUBSTRUCTURE)', '', '', '', '', ''],
    ['1.1', 'Pekerjaan Pengeboran & Pondasi Dermaga Mutu K-250', 385, 'm3', 2150000, 827750000],
    ['1.2', 'Pekerjaan Pembesian Besi Ulir BJTD-40 Pondasi & Tiang', 48500, 'kg', 24500, 1188250000],
    ['1.3', 'Pemasangan Bekisting Multiplek 12mm & Perancah', 1240, 'm2', 385000, 477400000],
    ['II. PEKERJAAN STRUKTUR ATAS (UPPER STRUCTURE)', '', '', '', '', ''],
    ['2.1', 'Pengecoran Beton Balok & Lantai Dermaga Mutu K-250', 1420, 'm3', 2180000, 3095600000],
    ['2.2', 'Pekerjaan Pembesian Balok & Plat Lantai BJTD-40', 182000, 'kg', 24500, 4459000000],
    ['2.3', 'Bekisting Balok & Plat Lantai Multiplek 12mm', 5800, 'm2', 395000, 2291000000],
    ['III. PEKERJAAN ARSITEKTUR & BANGUNAN PENYIMPANAN', '', '', '', '', ''],
    ['3.1', 'Pasangan Dinding Bata Ringan Hebel t = 10 cm', 6400, 'm2', 165000, 1056000000],
    ['3.2', 'Plesteran + Acian Dinding Mortar Instan', 12800, 'm2', 135000, 1728000000],
    ['3.3', 'Pengecatan Dinding Weatherproof Eksterior & Interior', 11500, 'm2', 55000, 632500000]
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
  XLSX.utils.book_append_sheet(wb, ws, 'RAB_Dermaga_Utama');
  XLSX.writeFile(wb, 'Template_Import_RAB_KontraktorPro.xlsx');
}
