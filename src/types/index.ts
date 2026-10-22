export type UserRole =
  | 'direktur'
  | 'pm_teknik'
  | 'admin_teknik'
  | 'admin_keuangan'
  | 'estimator'
  | 'procurement'
  | 'logistik_kantor'
  | 'pm_lapangan'
  | 'site_manager'
  | 'pelaksana'
  | 'admin_lapangan'
  | 'logistik_lapangan'
  | 'k3_lapangan';

export interface RoleInfo {
  id: UserRole;
  title: string;
  department: string;
  crossPT: boolean;
  canApprove: boolean;
  approvalLimit: number; // in IDR
  description: string;
  allowedTabs: string[];
  canView: string[];
  canInput: string[];
  canApproveItems: string[];
  financialAutomation: string;
}

export type ClientType = 'SWASTA' | 'PEMERINTAH' | 'BUMN' | 'PERORANGAN' | 'LAINNYA';

export interface Client {
  id: string;
  companyId: string; // Belongs to PT (Company)
  code: string;
  name: string;
  type: ClientType;
  taxId?: string; // NPWP Klien
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  notes?: string;
  isActive: boolean;
}

export interface PT {
  id: string;
  code: string;
  name: string;
  legalName?: string;
  npwp: string;
  address: string;
  phone: string;
  email?: string;
  logoUrl?: string; // URL or Base64 data URI of company logo
  directorName: string;
  activeProjectsCount: number;
  isMain?: boolean;
}

export interface Project {
  id: string;
  ptId: string;
  clientId?: string; // Reference to Client
  code: string;
  shortCode?: string;
  name: string;
  description?: string;
  clientName: string;
  location: string;
  contractValue: number; // IDR
  currency?: string; // default "IDR"
  targetProfitPercent: number; // e.g., 18%
  targetProfitNominal: number; // IDR
  startDate: string;
  endDate: string;
  status: 'perencanaan' | 'berjalan' | 'ditunda' | 'selesai' | 'dibatalkan';
  pmName: string;
  siteManagerName: string;
  plannedProgressPercent: number;
  actualProgressPercent: number;
  totalRapBudget: number;
  totalCostRealized: number;
  totalPaidOut: number;
  unpaidCommitments: number;
  // Tax configuration (Prisma Batch 9.6)
  isTaxable?: boolean;
  ppnEnabled?: boolean;
  ppnPercent?: number; // 11%
  pphFinalEnabled?: boolean;
  pphFinalPercent?: number; // 1.75%, 2.65%, 4% (PP 9/2022)
  taxNotes?: string;
}

export interface MaterialComponent {
  materialId: string;
  materialName: string;
  unit: string;
  coefficient: number;
  unitPrice: number;
  subtotal: number;
}

export interface LaborComponent {
  laborType: 'Pekerja' | 'Tukang' | 'Kepala Tukang' | 'Mandor';
  coefficient: number;
  unitPrice: number;
  subtotal: number;
}

export interface EquipmentComponent {
  equipmentName: string;
  unit: string;
  coefficient: number;
  unitPrice: number;
  subtotal: number;
}

export interface MasterAHS {
  id: string;
  code: string; // e.g. "A.4.1.1.25"
  name: string;
  category: 'Persiapan' | 'Tanah & Pondasi' | 'Struktur Beton' | 'Dinding & Plesteran' | 'Kusen & Pintu' | 'Atap & Plafond' | 'Finishing & Cat' | 'MEP';
  unit: string; // m3, m2, m', kg, titik
  version: string; // e.g. "Permen PUPR 2024 / SNI"
  effectiveDate: string;
  isActive: boolean;
  materials: MaterialComponent[];
  labors: LaborComponent[];
  equipments: EquipmentComponent[];
  materialTotal: number;
  laborTotal: number;
  equipmentTotal: number;
  overheadPercent: number; // e.g. 10%
  overheadAmount: number;
  totalUnitPrice: number;
  sourcePrice: string;
}

export interface RABItem {
  id: string;
  projectId: string;
  wbsCode: string; // e.g. "I.1"
  section: string; // "I. Pekerjaan Struktur Bawah"
  description: string;
  volume: number;
  unit: string;
  unitPrice: number; // Harga Penawaran ke Klien
  totalPrice: number;
  ahsCode?: string; // Mapped AHS
  hasAhsMapped: boolean;
  status: 'draft' | 'diperiksa' | 'disetujui' | 'revisi';
  notes?: string;
}

export interface RAPItem {
  id: string;
  projectId: string;
  rabItemId: string;
  wbsCode: string;
  section: string;
  description: string;
  volume: number;
  unit: string;
  ahsCode: string;
  contractUnitPrice: number;
  contractTotalPrice: number;
  
  // RAP Internal Cost breakdown
  budgetMaterialUnit: number;
  budgetLaborUnit: number;
  budgetEquipmentUnit: number;
  budgetOverheadUnit: number;
  rapUnitPrice: number;
  rapTotalPrice: number;
  
  // Realization
  realizedMaterialCost: number;
  realizedLaborCost: number;
  realizedEquipmentCost: number;
  totalCostRealized: number;
  
  projectedProfit: number;
  projectedProfitPercent: number;
  status: 'draft' | 'diperiksa' | 'disetujui' | 'revisi';
}

export interface MaterialRequestItem {
  materialId: string;
  materialName: string;
  unit: string;
  requestedQty: number;
  approvedQty: number;
  fulfilledFromOfficeQty: number;
  fulfilledFromPOQty: number;
  notes?: string;
}

export interface MaterialRequest {
  id: string;
  requestNumber: string; // SPB-2026-001
  projectId: string;
  ptId: string;
  requestedBy: string;
  role: string;
  requestDate: string;
  requiredDate: string;
  wbsSection: string;
  urgency: 'normal' | 'urgent';
  status: 'draft' | 'diajukan' | 'disetujui' | 'diproses_gudang' | 'diteruskan_po' | 'terpenuhi' | 'ditolak';
  items: MaterialRequestItem[];
  approvalHistory: {
    role: string;
    action: string;
    date: string;
    notes: string;
  }[];
}

export interface PurchaseOrderItem {
  materialId: string;
  materialName: string;
  unit: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
  receivedQty: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // PO-2026-004
  requestId?: string;
  supplierId: string;
  supplierName: string;
  projectId: string;
  ptId: string;
  orderDate: string;
  expectedDeliveryDate: string;
  deliveryDestination: 'gudang_kantor' | 'lokasi_proyek';
  items: PurchaseOrderItem[];
  subtotal: number;
  ppnPercent: number; // 11%
  ppnAmount: number;
  grandTotal: number;
  status: 'draft' | 'disetujui' | 'dikirim_supplier' | 'diterima_sebagian' | 'diterima_lengkap' | 'lunas' | 'dibatalkan';
  createdBy: string;
  approvedBy?: string;
  paymentTerms: string; // e.g. "Net 30"
}

export interface StockItem {
  id: string;
  code: string;
  name: string;
  category: 'Semen' | 'Besi & Baja' | 'Agregat & Pasir' | 'Bata & Dinding' | 'Kayu & Bekisting' | 'Cat & Kimia' | 'MEP' | 'Alat Kerja';
  unit: string;
  officeStock: number;
  minOfficeStock: number;
  fieldStocks: Record<string, number>; // projectId -> qty
  minFieldStock: number;
  avgBuyPrice: number;
  lastUpdated: string;
}

export interface StockTransaction {
  id: string;
  timestamp: string;
  type: 'in_po' | 'transfer_office_to_field' | 'receive_at_field' | 'field_usage' | 'return_office' | 'adjustment';
  materialId: string;
  materialName: string;
  location: 'gudang_kantor' | string; // 'gudang_kantor' or projectId
  qty: number;
  unit: string;
  unitPrice: number;
  refDocument: string; // PO#, SPB#, LaporanHarian#
  performedBy: string;
  reason?: string;
  wbsItemDescription?: string;
}

export interface WageRecord {
  id: string;
  recordNumber: string; // WAGE-2026-012
  projectId: string;
  ptId: string;
  wbsCode: string;
  workDescription: string;
  wageType: 'borongan' | 'harian';
  periodStart: string;
  periodEnd: string;
  mandorName: string;
  workerCount: number;
  
  // For Borongan:
  volumeDone?: number;
  unitRate?: number;
  unit?: string;
  
  // For Harian:
  mandaysTotal?: number;
  dailyRateAvg?: number;
  
  grossAmount: number;
  pph21Percent: number; // typically 2% for freelance/jasa
  pph21Amount: number;
  netPayable: number;
  
  status: 'diajukan' | 'diverifikasi_sm' | 'disetujui_pm' | 'siap_bayar' | 'lunas';
  submittedBy: string;
  verifiedBy?: string;
  paidDate?: string;
  paymentMethod?: 'Transfer Bank' | 'Kas Lapangan (Petty Cash)';
}

export interface DailyReport {
  id: string;
  reportNumber: string; // LHR-2026-03-01
  projectId: string;
  ptId: string;
  date: string;
  dayNumber: number; // Hari ke-
  weather: {
    pagi: 'Cerah' | 'Berawan' | 'Hujan Ringan' | 'Hujan Lebat';
    siang: 'Cerah' | 'Berawan' | 'Hujan Ringan' | 'Hujan Lebat';
    sore: 'Cerah' | 'Berawan' | 'Hujan Ringan' | 'Hujan Lebat';
  };
  manpower: {
    pekerja: number;
    tukang: number;
    kepalaTukang: number;
    mandor: number;
    operator: number;
  };
  heavyEquipments: {
    name: string;
    qty: number;
    hoursOperated: number;
    status: 'Operasional' | 'Standby' | 'Rusak';
  }[];
  workProgress: {
    rabItemId: string;
    wbsCode: string;
    description: string;
    volumeToday: number;
    unit: string;
    cumulativeVolume: number;
    totalPlanVolume: number;
    percentComplete: number;
  }[];
  materialUsages: {
    materialId: string;
    materialName: string;
    qty: number;
    unit: string;
    wbsCode: string;
  }[];
  obstacles: string;
  instructions: string;
  photoNotes: string[];
  submittedBy: string;
  reviewedBy?: string;
  status: 'draft' | 'submitted' | 'approved';
}

export interface FinancialEntry {
  id: string;
  ptId: string;
  projectId: string;
  date: string;
  code: string;
  category: 
    | 'pendapatan_termin'
    | 'beban_material'
    | 'beban_upah'
    | 'beban_alat'
    | 'beban_subkon'
    | 'overhead_proyek'
    | 'pajak_ppn'
    | 'pajak_pph_final';
  description: string;
  amount: number;
  type: 'masuk' | 'keluar';
  refDoc: string;
  payeeOrPayer: string;
  taxDetails?: {
    ppnRate?: number;
    ppnAmount?: number;
    pphFinalRate?: number; // 1.75%, 2.65%, 4%
    pphFinalAmount?: number;
  };
  status: 'diverifikasi' | 'pending' | 'selesai';
}

export interface WarningAlert {
  id: string;
  projectId: string;
  projectName: string;
  ptId: string;
  type: 
    | 'profit_drop'
    | 'budget_overrun'
    | 'material_surge'
    | 'stock_critical'
    | 'spb_pending'
    | 'po_delayed'
    | 'progress_delay'
    | 'unmapped_rab'
    | 'unverified_wage'
    | 'missing_daily_report'
    | 'stock_discrepancy';
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  assignedRoles: UserRole[];
  actionLabel: string;
  actionModule: string;
  createdAt: string;
  status: 'open' | 'investigating' | 'resolved';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  ptId?: string;
  projectId?: string;
  details: string;
}
