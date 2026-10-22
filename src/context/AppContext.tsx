import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PT,
  Project,
  Client,
  MasterAHS,
  RABItem,
  RAPItem,
  MaterialRequest,
  PurchaseOrder,
  StockItem,
  StockTransaction,
  WageRecord,
  DailyReport,
  FinancialEntry,
  WarningAlert,
  AuditLog,
  UserRole,
  RoleInfo,
  AppUser,
  MasterAdminSettings,
  RevenueRecognition,
  MaterialControlSummary,
  MaterialControlItem,
  RAPMarginPreviewSummary,
  RAPMarginPreviewItem
} from '../types';
import {
  ROLES,
  INITIAL_PTS,
  INITIAL_CLIENTS,
  INITIAL_PROJECTS,
  INITIAL_AHS_LIST,
  INITIAL_RAB_ITEMS,
  INITIAL_RAP_ITEMS,
  INITIAL_STOCK,
  INITIAL_STOCK_TRANSACTIONS,
  INITIAL_MATERIAL_REQUESTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_WAGE_RECORDS,
  INITIAL_DAILY_REPORTS,
  INITIAL_FINANCIAL_ENTRIES,
  INITIAL_WARNINGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_USERS,
  INITIAL_ADMIN_SETTINGS,
  INITIAL_REVENUE_RECOGNITIONS
} from '../data/initialData';

interface AppContextType {
  // Current user & role state
  activeRole: UserRole;
  currentRoleInfo: RoleInfo;
  setActiveRole: (role: UserRole) => void;
  activePTId: string;
  setActivePTId: (ptId: string) => void;
  activeProjectId: string;
  setActiveProjectId: (projectId: string) => void;
  isMobileFieldMode: boolean;
  setIsMobileFieldMode: (val: boolean) => void;

  // Domain data
  roles: RoleInfo[];
  pts: PT[];
  clients: Client[];
  projects: Project[];
  masterAhs: MasterAHS[];
  rabItems: RABItem[];
  rapItems: RAPItem[];
  materialRequests: MaterialRequest[];
  purchaseOrders: PurchaseOrder[];
  stockItems: StockItem[];
  stockTransactions: StockTransaction[];
  wageRecords: WageRecord[];
  dailyReports: DailyReport[];
  financialEntries: FinancialEntry[];
  warnings: WarningAlert[];
  auditLogs: AuditLog[];
  users: AppUser[];
  adminSettings: MasterAdminSettings;

  // Active object helpers
  currentPT?: PT;
  currentProject?: Project;

  addPT: (pt: Omit<PT, 'id' | 'activeProjectsCount'>) => void;
  updatePT: (id: string, updates: Partial<PT>) => void;
  updatePTLogo: (id: string, logoUrl: string) => void;
  addClient: (client: Omit<Client, 'id' | 'isActive'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  addProject: (proj: Omit<Project, 'id' | 'plannedProgressPercent' | 'actualProgressPercent' | 'totalCostRealized' | 'totalPaidOut' | 'unpaidCommitments' | 'targetProfitNominal' | 'totalRapBudget'>) => void;
  importRABItems: (newItems: Omit<RABItem, 'id'>[]) => void;
  updateRABItemStatus: (id: string, status: RABItem['status'], notes?: string) => void;
  mapRABtoAHS: (rabItemId: string, ahsCode: string) => void;
  updateProjectTargetProfit: (projectId: string, newMarginPercent: number) => void;
  addMaterialRequest: (request: Omit<MaterialRequest, 'id' | 'requestNumber'>) => void;
  approveMaterialRequest: (requestId: string, approvedByRole: string, notes?: string) => void;
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber'>) => void;
  receiveGoodsAtField: (params: {
    materialId: string;
    projectId: string;
    qty: number;
    refDoc: string;
    notes?: string;
  }) => void;
  recordMaterialUsage: (params: {
    materialId: string;
    projectId: string;
    qty: number;
    rabItemId: string;
    wbsDesc: string;
    refDoc: string;
  }) => void;
  addWageRecord: (record: Omit<WageRecord, 'id' | 'recordNumber'>) => void;
  updateWageStatus: (wageId: string, status: WageRecord['status']) => void;
  updateRoleLimit: (roleId: UserRole, newLimit: number, canApprove: boolean) => void;
  resetRoleLimits: () => void;
  verifyMaterialRequestSM: (requestId: string, notes?: string) => void;
  approveMaterialRequestPM: (requestId: string, notes?: string) => void;
  rejectMaterialRequest: (requestId: string, reason: string) => void;
  approvePurchaseOrder: (poId: string, notes?: string) => { success: boolean; message: string };
  rejectPurchaseOrder: (poId: string, reason: string) => void;
  verifyWageSM: (wageId: string, notes?: string) => void;
  approveWagePM: (wageId: string, notes?: string) => void;
  rejectWage: (wageId: string, reason: string) => void;
  disburseWagePayment: (wageId: string, paymentMethod?: 'Transfer Bank' | 'Kas Lapangan (Petty Cash)') => void;
  switchRoleAndGetDefaultTab: (newRole: UserRole) => import('../types').ActiveTab;
  submitDailyReport: (report: Omit<DailyReport, 'id' | 'reportNumber'>) => void;
  addFinancialEntry: (entry: Omit<FinancialEntry, 'id'>) => void;
  resolveWarning: (warningId: string) => void;
  resetAllData: () => void;
  addUser: (user: Omit<AppUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  updateAdminSettings: (updates: Partial<MasterAdminSettings>) => void;
  verifyAdminPin: (pin: string) => boolean;
  revenueRecognitions: RevenueRecognition[];
  previewPSAK72: (projectId: string, periodYear: number, periodMonth: number) => {
    contractValue: number;
    progressPercent: number;
    revenueToDate: number;
    revenueRecognized: number;
    revenueThisMonth: number;
  };
  recognizeRevenue: (projectId: string, periodYear: number, periodMonth: number, notes?: string) => {
    success: boolean;
    message: string;
    record?: RevenueRecognition;
  };
  reverseRevenueRecognition: (recognitionId: string, reason: string) => {
    success: boolean;
    message: string;
  };
  getMaterialControlSummary: (projectId: string) => MaterialControlSummary;
  previewRAPMargin: (projectId: string) => RAPMarginPreviewSummary;
  updateRabItemTargetProfit: (rabItemId: string, targetProfitPercent: number | null) => void;
  generateRapFromRabWithTargetProfit: (projectId: string) => { success: boolean; message: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'kontraktor_pro_erp_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session UI states
  const [activeRole, setActiveRole] = useState<UserRole>('direktur');
  const [activePTId, setActivePTId] = useState<string>('pt-1');
  const [activeProjectId, setActiveProjectId] = useState<string>('prj-1');
  const [isMobileFieldMode, setIsMobileFieldMode] = useState<boolean>(false);

  // Core Data
  const [roles, setRoles] = useState<RoleInfo[]>(ROLES);
  const [pts, setPts] = useState<PT[]>(INITIAL_PTS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [masterAhs, setMasterAhs] = useState<MasterAHS[]>(INITIAL_AHS_LIST);
  const [rabItems, setRabItems] = useState<RABItem[]>(INITIAL_RAB_ITEMS);
  const [rapItems, setRapItems] = useState<RAPItem[]>(INITIAL_RAP_ITEMS);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>(INITIAL_MATERIAL_REQUESTS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [stockItems, setStockItems] = useState<StockItem[]>(INITIAL_STOCK);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>(INITIAL_STOCK_TRANSACTIONS);
  const [wageRecords, setWageRecords] = useState<WageRecord[]>(INITIAL_WAGE_RECORDS);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>(INITIAL_DAILY_REPORTS);
  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>(INITIAL_FINANCIAL_ENTRIES);
  const [warnings, setWarnings] = useState<WarningAlert[]>(INITIAL_WARNINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [users, setUsers] = useState<AppUser[]>(INITIAL_USERS);
  const [adminSettings, setAdminSettings] = useState<MasterAdminSettings>(INITIAL_ADMIN_SETTINGS);
  const [revenueRecognitions, setRevenueRecognitions] = useState<RevenueRecognition[]>(INITIAL_REVENUE_RECOGNITIONS);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.roles) setRoles(parsed.roles);
        if (parsed.pts) setPts(parsed.pts);
        if (parsed.clients) setClients(parsed.clients);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.rabItems) setRabItems(parsed.rabItems);
        if (parsed.rapItems) setRapItems(parsed.rapItems);
        if (parsed.materialRequests) setMaterialRequests(parsed.materialRequests);
        if (parsed.purchaseOrders) setPurchaseOrders(parsed.purchaseOrders);
        if (parsed.stockItems) setStockItems(parsed.stockItems);
        if (parsed.stockTransactions) setStockTransactions(parsed.stockTransactions);
        if (parsed.wageRecords) setWageRecords(parsed.wageRecords);
        if (parsed.dailyReports) setDailyReports(parsed.dailyReports);
        if (parsed.financialEntries) setFinancialEntries(parsed.financialEntries);
        if (parsed.warnings) setWarnings(parsed.warnings);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.adminSettings) setAdminSettings(parsed.adminSettings);
        if (parsed.revenueRecognitions) setRevenueRecognitions(parsed.revenueRecognitions);
      }
    } catch (e) {
      console.warn('Could not load saved state from localStorage:', e);
    }
  }, []);

  // Save to localStorage on changes
  const saveState = (overrides: Record<string, any> = {}) => {
    try {
      const stateToSave = {
        roles: overrides.roles || roles,
        pts: overrides.pts || pts,
        clients: overrides.clients || clients,
        projects: overrides.projects || projects,
        rabItems: overrides.rabItems || rabItems,
        rapItems: overrides.rapItems || rapItems,
        materialRequests: overrides.materialRequests || materialRequests,
        purchaseOrders: overrides.purchaseOrders || purchaseOrders,
        stockItems: overrides.stockItems || stockItems,
        stockTransactions: overrides.stockTransactions || stockTransactions,
        wageRecords: overrides.wageRecords || wageRecords,
        dailyReports: overrides.dailyReports || dailyReports,
        financialEntries: overrides.financialEntries || financialEntries,
        warnings: overrides.warnings || warnings,
        auditLogs: overrides.auditLogs || auditLogs,
        users: overrides.users || users,
        adminSettings: overrides.adminSettings || adminSettings,
        revenueRecognitions: overrides.revenueRecognitions || revenueRecognitions
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  const currentRoleInfo = roles.find(r => r.id === activeRole) || roles[0] || ROLES[0];
  const currentPT = pts.find(p => p.id === activePTId);
  const currentProject = projects.find(p => p.id === activeProjectId);

  const handleSetActivePTId = (ptId: string) => {
    setActivePTId(ptId);
    // Auto switch active project to a project belonging to this PT
    const firstProj = projects.find(p => p.ptId === ptId);
    if (firstProj) {
      setActiveProjectId(firstProj.id);
    }
  };

  const addAudit = (action: string, entityType: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: `${currentRoleInfo.title} (${currentRoleInfo.department})`,
      userRole: activeRole,
      action,
      entityType,
      entityId,
      ptId: activePTId,
      projectId: activeProjectId,
      details
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    saveState({ auditLogs: updated });
  };

  // Add New Company (PT)
  const addPT = (newPTData: Omit<PT, 'id' | 'activeProjectsCount'>) => {
    const newPT: PT = {
      ...newPTData,
      id: `pt-${Date.now()}`,
      activeProjectsCount: 0
    };
    const updated = [...pts, newPT];
    setPts(updated);
    setActivePTId(newPT.id);
    addAudit('Tambah PT Baru', 'PT', newPT.code, `Mendaftarkan entitas perusahaan baru: ${newPT.name} (NPWP: ${newPT.npwp})`);
    saveState({ pts: updated });
  };

  // Update Company (PT) & Logo
  const updatePT = (id: string, updates: Partial<PT>) => {
    const updated = pts.map(p => (p.id === id ? { ...p, ...updates } : p));
    setPts(updated);
    addAudit('Update Profil PT', 'PT', id, `Memperbarui profil / logo perusahaan ID: ${id}`);
    saveState({ pts: updated });
  };

  const updatePTLogo = (id: string, logoUrl: string) => {
    updatePT(id, { logoUrl });
  };

  // Add Client
  const addClient = (newClientData: Omit<Client, 'id' | 'isActive'>) => {
    const newClient: Client = {
      ...newClientData,
      id: `cl-${Date.now()}`,
      isActive: true
    };
    const updated = [newClient, ...clients];
    setClients(updated);
    addAudit('Tambah Klien Baru', 'Client', newClient.code, `Mendaftarkan klien baru: ${newClient.name} (${newClient.type}) untuk PT ID: ${newClient.companyId}`);
    saveState({ clients: updated });
  };

  // Update Client
  const updateClient = (id: string, updates: Partial<Client>) => {
    const updated = clients.map(c => (c.id === id ? { ...c, ...updates } : c));
    setClients(updated);
    addAudit('Update Klien', 'Client', id, `Memperbarui data klien ID: ${id}`);
    saveState({ clients: updated });
  };

  // Add New Project
  const addProject = (projData: Omit<Project, 'id' | 'plannedProgressPercent' | 'actualProgressPercent' | 'totalCostRealized' | 'totalPaidOut' | 'unpaidCommitments' | 'targetProfitNominal' | 'totalRapBudget'>) => {
    const profitNominal = (projData.contractValue * projData.targetProfitPercent) / 100;
    const rapBudget = projData.contractValue - profitNominal;
    const newProj: Project = {
      ...projData,
      id: `prj-${Date.now()}`,
      plannedProgressPercent: 0,
      actualProgressPercent: 0,
      totalCostRealized: 0,
      totalPaidOut: 0,
      unpaidCommitments: 0,
      targetProfitNominal: profitNominal,
      totalRapBudget: rapBudget
    };

    const updatedProjects = [...projects, newProj];
    setProjects(updatedProjects);
    setActiveProjectId(newProj.id);
    setActivePTId(newProj.ptId);

    // Update PT active project count
    const updatedPts = pts.map(p =>
      p.id === newProj.ptId ? { ...p, activeProjectsCount: p.activeProjectsCount + 1 } : p
    );
    setPts(updatedPts);

    addAudit('Daftarkan Proyek Baru', 'Project', newProj.code, `Mendaftarkan proyek baru: ${newProj.name} dengan nilai kontrak Rp ${newProj.contractValue.toLocaleString('id-ID')}`);
    saveState({ projects: updatedProjects, pts: updatedPts });
  };

  // Import RAB Items
  const importRABItems = (newItems: Omit<RABItem, 'id'>[]) => {
    const createdItems: RABItem[] = newItems.map((item, idx) => ({
      ...item,
      id: `rab-imp-${Date.now()}-${idx}`
    }));

    const updatedRab = [...rabItems, ...createdItems];
    setRabItems(updatedRab);

    // Auto generate draft RAP items for mapped items
    const newRapItems: RAPItem[] = [];
    createdItems.forEach(rab => {
      if (rab.ahsCode) {
        const ahs = masterAhs.find(a => a.code === rab.ahsCode);
        if (ahs) {
          const rapUnit = ahs.materialTotal + ahs.laborTotal + ahs.equipmentTotal;
          newRapItems.push({
            id: `rap-imp-${rab.id}`,
            projectId: rab.projectId,
            rabItemId: rab.id,
            wbsCode: rab.wbsCode,
            section: rab.section,
            description: rab.description,
            volume: rab.volume,
            unit: rab.unit,
            ahsCode: ahs.code,
            contractUnitPrice: rab.unitPrice,
            contractTotalPrice: rab.totalPrice,
            budgetMaterialUnit: ahs.materialTotal,
            budgetLaborUnit: ahs.laborTotal,
            budgetEquipmentUnit: ahs.equipmentTotal,
            budgetOverheadUnit: Math.round(rapUnit * 0.05),
            rapUnitPrice: rapUnit + Math.round(rapUnit * 0.05),
            rapTotalPrice: (rapUnit + Math.round(rapUnit * 0.05)) * rab.volume,
            realizedMaterialCost: 0,
            realizedLaborCost: 0,
            realizedEquipmentCost: 0,
            totalCostRealized: 0,
            projectedProfit: rab.totalPrice - ((rapUnit + Math.round(rapUnit * 0.05)) * rab.volume),
            projectedProfitPercent: ((rab.totalPrice - ((rapUnit + Math.round(rapUnit * 0.05)) * rab.volume)) / rab.totalPrice) * 100,
            status: 'draft'
          });
        }
      }
    });

    const updatedRap = [...rapItems, ...newRapItems];
    setRapItems(updatedRap);

    addAudit('Import RAB Excel', 'RAB', `${createdItems.length} items`, `Berhasil mengimpor ${createdItems.length} item pekerjaan ke proyek`);
    saveState({ rabItems: updatedRab, rapItems: updatedRap });
  };

  const updateRABItemStatus = (id: string, status: RABItem['status'], notes?: string) => {
    const updated = rabItems.map(item => (item.id === id ? { ...item, status, notes: notes || item.notes } : item));
    setRabItems(updated);
    addAudit('Update Status RAB', 'RABItem', id, `Mengubah status item RAB menjadi ${status}`);
    saveState({ rabItems: updated });
  };

  const mapRABtoAHS = (rabItemId: string, ahsCode: string) => {
    const rab = rabItems.find(r => r.id === rabItemId);
    const ahs = masterAhs.find(a => a.code === ahsCode);
    if (!rab || !ahs) return;

    const updatedRab = rabItems.map(item =>
      item.id === rabItemId ? { ...item, ahsCode, hasAhsMapped: true } : item
    );
    setRabItems(updatedRab);

    // Compute or update RAP Item
    const rapUnit = ahs.materialTotal + ahs.laborTotal + ahs.equipmentTotal;
    const rapTotal = rapUnit * rab.volume;
    const projectedProfit = rab.totalPrice - rapTotal;
    const profitPct = (projectedProfit / rab.totalPrice) * 100;

    const existingRapIdx = rapItems.findIndex(r => r.rabItemId === rabItemId);
    let updatedRap: RAPItem[];

    if (existingRapIdx >= 0) {
      updatedRap = rapItems.map((r, idx) =>
        idx === existingRapIdx
          ? {
              ...r,
              ahsCode,
              budgetMaterialUnit: ahs.materialTotal,
              budgetLaborUnit: ahs.laborTotal,
              budgetEquipmentUnit: ahs.equipmentTotal,
              rapUnitPrice: rapUnit,
              rapTotalPrice: rapTotal,
              projectedProfit,
              projectedProfitPercent: profitPct
            }
          : r
      );
    } else {
      const newRap: RAPItem = {
        id: `rap-${rab.id}`,
        projectId: rab.projectId,
        rabItemId: rab.id,
        wbsCode: rab.wbsCode,
        section: rab.section,
        description: rab.description,
        volume: rab.volume,
        unit: rab.unit,
        ahsCode,
        contractUnitPrice: rab.unitPrice,
        contractTotalPrice: rab.totalPrice,
        budgetMaterialUnit: ahs.materialTotal,
        budgetLaborUnit: ahs.laborTotal,
        budgetEquipmentUnit: ahs.equipmentTotal,
        budgetOverheadUnit: Math.round(rapUnit * 0.05),
        rapUnitPrice: rapUnit,
        rapTotalPrice: rapTotal,
        realizedMaterialCost: 0,
        realizedLaborCost: 0,
        realizedEquipmentCost: 0,
        totalCostRealized: 0,
        projectedProfit,
        projectedProfitPercent: profitPct,
        status: 'draft'
      };
      updatedRap = [...rapItems, newRap];
    }

    setRapItems(updatedRap);
    addAudit('Map AHS PUPR', 'RABItem', rabItemId, `Menghubungkan item ${rab.description} dengan AHS ${ahs.code} (${ahs.name})`);
    saveState({ rabItems: updatedRab, rapItems: updatedRap });
  };

  const updateProjectTargetProfit = (projectId: string, newMarginPercent: number) => {
    const updated = projects.map(p => {
      if (p.id === projectId) {
        const nominal = (p.contractValue * newMarginPercent) / 100;
        const newRapLimit = p.contractValue - nominal;
        return {
          ...p,
          targetProfitPercent: newMarginPercent,
          targetProfitNominal: nominal,
          totalRapBudget: newRapLimit
        };
      }
      return p;
    });

    setProjects(updated);
    addAudit('Update Target Margin Laba', 'Project', projectId, `Mengubah target profit proyek menjadi ${newMarginPercent}%`);
    saveState({ projects: updated });
  };

  const addMaterialRequest = (request: Omit<MaterialRequest, 'id' | 'requestNumber'>) => {
    const count = materialRequests.length + 1;
    const reqNum = `SPB-2026-${String(count).padStart(3, '0')}`;
    const newReq: MaterialRequest = {
      ...request,
      id: `spb-${Date.now()}`,
      requestNumber: reqNum
    };
    const updated = [newReq, ...materialRequests];
    setMaterialRequests(updated);
    addAudit('Buat Permintaan Material', 'MaterialRequest', reqNum, `Mengajukan ${reqNum} untuk bagian ${request.wbsSection}`);
    saveState({ materialRequests: updated });
  };

  const updateRoleLimit = (roleId: UserRole, newLimit: number, canApprove: boolean) => {
    const updated = roles.map(r => r.id === roleId ? { ...r, approvalLimit: newLimit, canApprove } : r);
    setRoles(updated);
    addAudit('Atur Limit Otorisasi Role', 'Role', roleId, `Mengubah limit wewenang ${roleId} menjadi Rp ${newLimit.toLocaleString('id-ID')} (Approval: ${canApprove ? 'Aktif' : 'Non-aktif'})`);
    saveState({ roles: updated });
  };

  const resetRoleLimits = () => {
    setRoles(ROLES);
    addAudit('Reset Limit Otorisasi', 'Role', 'ALL', 'Mengembalikan seluruh limit wewenang 12 role ke standar');
    saveState({ roles: ROLES });
  };

  const verifyMaterialRequestSM = (requestId: string, notes?: string) => {
    const updated = materialRequests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'diverifikasi_sm' as const,
          currentApprovalLevel: 1,
          approvalHistory: [
            ...r.approvalHistory,
            {
              role: `${currentRoleInfo.title}`,
              action: 'Verifikasi Fisik & Qty SM',
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              notes: notes || 'Verifikasi kebutuhan fisik lapangan oleh Site Manager'
            }
          ]
        };
      }
      return r;
    });
    setMaterialRequests(updated);
    addAudit('Verifikasi Awal SPB', 'MaterialRequest', requestId, `Diverifikasi Site Manager (${notes || 'Opname fisik disetujui'})`);
    saveState({ materialRequests: updated });
  };

  const approveMaterialRequestPM = (requestId: string, notes?: string) => {
    const updated = materialRequests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'disetujui' as const,
          currentApprovalLevel: 2,
          approvalHistory: [
            ...r.approvalHistory,
            {
              role: `${currentRoleInfo.title}`,
              action: 'Approval Final PM',
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              notes: notes || 'Disetujui untuk diproses gudang & procurement'
            }
          ]
        };
      }
      return r;
    });
    setMaterialRequests(updated);
    addAudit('Persetujuan Final SPB', 'MaterialRequest', requestId, `Disetujui oleh PM Teknik`);
    saveState({ materialRequests: updated });
  };

  const rejectMaterialRequest = (requestId: string, reason: string) => {
    const updated = materialRequests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'ditolak' as const,
          rejectionReason: reason,
          approvalHistory: [
            ...r.approvalHistory,
            {
              role: `${currentRoleInfo.title}`,
              action: 'Ditolak / Dikembalikan',
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              notes: reason
            }
          ]
        };
      }
      return r;
    });
    setMaterialRequests(updated);
    addAudit('Penolakan SPB', 'MaterialRequest', requestId, `Ditolak oleh ${currentRoleInfo.title}. Alasan: ${reason}`);
    saveState({ materialRequests: updated });
  };

  const approvePurchaseOrder = (poId: string, notes?: string): { success: boolean; message: string } => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return { success: false, message: 'PO tidak ditemukan' };

    if (currentRoleInfo.approvalLimit > 0 && po.grandTotal > currentRoleInfo.approvalLimit && activeRole !== 'direktur') {
      return {
        success: false,
        message: `Nilai PO Rp ${po.grandTotal.toLocaleString('id-ID')} melampaui limit wewenang Anda (Maks: Rp ${currentRoleInfo.approvalLimit.toLocaleString('id-ID')}). Dibutuhkan otorisasi Direktur Utama.`
      };
    }

    const updated = purchaseOrders.map(p => {
      if (p.id === poId) {
        return {
          ...p,
          status: 'disetujui' as const,
          approvedBy: currentRoleInfo.title,
          approvalHistory: [
            ...(p.approvalHistory || []),
            {
              role: currentRoleInfo.title,
              action: 'Approval PO Resmi',
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              notes: notes || 'Disetujui dan diteruskan ke vendor supplier'
            }
          ]
        };
      }
      return p;
    });
    setPurchaseOrders(updated);
    addAudit('Approval PO Supplier', 'PurchaseOrder', po.poNumber, `Disetujui oleh ${currentRoleInfo.title} (Nilai: Rp ${po.grandTotal.toLocaleString('id-ID')})`);
    saveState({ purchaseOrders: updated });
    return { success: true, message: `PO ${po.poNumber} berhasil disetujui!` };
  };

  const rejectPurchaseOrder = (poId: string, reason: string) => {
    const updated = purchaseOrders.map(p => {
      if (p.id === poId) {
        return {
          ...p,
          status: 'ditolak' as const,
          rejectionReason: reason,
          approvalHistory: [
            ...(p.approvalHistory || []),
            {
              role: currentRoleInfo.title,
              action: 'Ditolak / Revisi Penawaran',
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              notes: reason
            }
          ]
        };
      }
      return p;
    });
    setPurchaseOrders(updated);
    addAudit('Penolakan PO', 'PurchaseOrder', poId, `Ditolak oleh ${currentRoleInfo.title}. Alasan: ${reason}`);
    saveState({ purchaseOrders: updated });
  };

  const verifyWageSM = (wageId: string, notes?: string) => {
    const updated = wageRecords.map(w => {
      if (w.id === wageId) {
        return {
          ...w,
          status: 'diverifikasi_sm' as const,
          verifiedBy: currentRoleInfo.title,
          approvalHistory: [
            ...(w.approvalHistory || []),
            {
              role: currentRoleInfo.title,
              action: 'Verifikasi Opname Fisik Lapangan',
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              notes: notes || 'Volume fisik opname telah diperiksa dan sesuai'
            }
          ]
        };
      }
      return w;
    });
    setWageRecords(updated);
    addAudit('Verifikasi Opname Upah SM', 'WageRecord', wageId, `Diverifikasi Site Manager`);
    saveState({ wageRecords: updated });
  };

  const approveWagePM = (wageId: string, notes?: string) => {
    const updated = wageRecords.map(w => {
      if (w.id === wageId) {
        return {
          ...w,
          status: 'siap_bayar' as const,
          approvalHistory: [
            ...(w.approvalHistory || []),
            {
              role: currentRoleInfo.title,
              action: 'Persetujuan PM Teknik',
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              notes: notes || 'Divalidasi dan diteruskan ke Bagian Keuangan untuk pencairan kas'
            }
          ]
        };
      }
      return w;
    });
    setWageRecords(updated);
    addAudit('Persetujuan Upah PM', 'WageRecord', wageId, `Disetujui PM Teknik - Siap Bayar`);
    saveState({ wageRecords: updated });
  };

  const rejectWage = (wageId: string, reason: string) => {
    const updated = wageRecords.map(w => {
      if (w.id === wageId) {
        return {
          ...w,
          status: 'ditolak' as const,
          rejectionReason: reason,
          approvalHistory: [
            ...(w.approvalHistory || []),
            {
              role: currentRoleInfo.title,
              action: 'Ditolak / Perlu Perbaikan Opname',
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              notes: reason
            }
          ]
        };
      }
      return w;
    });
    setWageRecords(updated);
    addAudit('Penolakan Upah Mandor', 'WageRecord', wageId, `Ditolak oleh ${currentRoleInfo.title}. Alasan: ${reason}`);
    saveState({ wageRecords: updated });
  };

  const disburseWagePayment = (wageId: string, paymentMethod: 'Transfer Bank' | 'Kas Lapangan (Petty Cash)' = 'Transfer Bank') => {
    let paidWage: WageRecord | undefined;
    const updated = wageRecords.map(w => {
      if (w.id === wageId) {
        paidWage = w;
        return {
          ...w,
          status: 'lunas' as const,
          paidDate: new Date().toISOString().split('T')[0],
          paymentMethod,
          approvalHistory: [
            ...(w.approvalHistory || []),
            {
              role: currentRoleInfo.title,
              action: `Pencairan Upah (${paymentMethod})`,
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              notes: `Pencairan dana sebesar Rp ${w.netPayable.toLocaleString('id-ID')} telah ditransfer/dibayarkan`
            }
          ]
        };
      }
      return w;
    });
    setWageRecords(updated);

    if (paidWage) {
      const newEntry: FinancialEntry = {
        id: `fin-w-${Date.now()}`,
        ptId: paidWage.ptId,
        projectId: paidWage.projectId,
        date: new Date().toISOString().split('T')[0],
        code: `EXP-UPH-${paidWage.recordNumber}`,
        category: 'beban_upah',
        description: `Pencairan Upah Mandor: ${paidWage.mandorName} - ${paidWage.workDescription}`,
        amount: paidWage.netPayable,
        type: 'keluar',
        refDoc: paidWage.recordNumber,
        payeeOrPayer: paidWage.mandorName,
        taxDetails: {
          pphFinalRate: paidWage.pph21Percent,
          pphFinalAmount: paidWage.pph21Amount
        },
        status: 'diverifikasi'
      };
      const updatedFin = [newEntry, ...financialEntries];
      setFinancialEntries(updatedFin);

      const projId = paidWage.projectId;
      const amount = paidWage.netPayable;
      const updatedProjects = projects.map(p =>
        p.id === projId ? { ...p, totalPaidOut: p.totalPaidOut + amount } : p
      );
      setProjects(updatedProjects);

      addAudit('Pencairan Kas Upah Mandor', 'FinancialEntry', paidWage.recordNumber, `Mencairkan Rp ${paidWage.netPayable.toLocaleString('id-ID')} ke ${paidWage.mandorName}`);
      saveState({ wageRecords: updated, financialEntries: updatedFin, projects: updatedProjects });
    }
  };

  const switchRoleAndGetDefaultTab = (newRole: UserRole) => {
    setActiveRole(newRole);
    const targetInfo = roles.find(r => r.id === newRole) || ROLES.find(r => r.id === newRole);
    if (newRole === 'pelaksana') {
      setIsMobileFieldMode(true);
    } else {
      setIsMobileFieldMode(false);
    }
    return targetInfo?.defaultTab || 'dashboard';
  };

  const addUser = (userData: Omit<AppUser, 'id' | 'createdAt'>) => {
    const newUser: AppUser = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [...users, newUser];
    setUsers(updated);
    addAudit('Tambah Akun Staf', 'AppUser', newUser.email, `Mendaftarkan staf: ${newUser.fullName} (${newUser.assignedRole})`);
    saveState({ users: updated });
  };

  const updateUser = (id: string, updates: Partial<AppUser>) => {
    const updated = users.map(u => (u.id === id ? { ...u, ...updates } : u));
    setUsers(updated);
    addAudit('Update Akun Staf', 'AppUser', id, `Memperbarui data akun pengguna ID: ${id}`);
    saveState({ users: updated });
  };

  const deleteUser = (id: string) => {
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    addAudit('Hapus Akun Staf', 'AppUser', id, `Menghapus akun pengguna ID: ${id}`);
    saveState({ users: updated });
  };

  const updateAdminSettings = (updates: Partial<MasterAdminSettings>) => {
    const updated = { ...adminSettings, ...updates };
    setAdminSettings(updated);
    addAudit('Update Pengaturan Admin', 'AdminSettings', 'SYSTEM', `Mengubah pengaturan keamanan sistem (Kunci: ${updated.isSecurityLocked ? 'Aktif' : 'Non-aktif'})`);
    saveState({ adminSettings: updated });
  };

  const verifyAdminPin = (pin: string): boolean => {
    return pin.trim() === adminSettings.adminPin.trim();
  };

  const approveMaterialRequest = (requestId: string, approvedByRole: string, notes?: string) => {
    const updated = materialRequests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'disetujui' as const,
          approvalHistory: [
            ...r.approvalHistory,
            {
              role: approvedByRole,
              action: 'Disetujui',
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              notes: notes || 'Disetujui untuk diproses gudang & procurement'
            }
          ]
        };
      }
      return r;
    });
    setMaterialRequests(updated);
    addAudit('Persetujuan SPB', 'MaterialRequest', requestId, `Disetujui oleh ${approvedByRole}`);
    saveState({ materialRequests: updated });
  };

  const createPurchaseOrder = (po: Omit<PurchaseOrder, 'id' | 'poNumber'>) => {
    const count = purchaseOrders.length + 1;
    const poNum = `PO-2026-${String(count).padStart(3, '0')}`;
    const newPO: PurchaseOrder = {
      ...po,
      id: `po-${Date.now()}`,
      poNumber: poNum
    };
    const updated = [newPO, ...purchaseOrders];
    setPurchaseOrders(updated);
    addAudit('Penerbitan PO', 'PurchaseOrder', poNum, `PO senilai Rp ${po.grandTotal.toLocaleString('id-ID')} ke ${po.supplierName}`);
    saveState({ purchaseOrders: updated });
  };

  const receiveGoodsAtField = (params: {
    materialId: string;
    projectId: string;
    qty: number;
    refDoc: string;
    notes?: string;
  }) => {
    const { materialId, projectId, qty, refDoc, notes } = params;
    
    // Update stock item
    const mat = stockItems.find(s => s.id === materialId);
    if (!mat) return;

    const updatedStock = stockItems.map(item => {
      if (item.id === materialId) {
        const currentField = item.fieldStocks[projectId] || 0;
        return {
          ...item,
          fieldStocks: {
            ...item.fieldStocks,
            [projectId]: currentField + qty
          },
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    });
    setStockItems(updatedStock);

    // Add transaction log
    const newTx: StockTransaction = {
      id: `stx-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'receive_at_field',
      materialId,
      materialName: mat.name,
      location: projectId,
      qty,
      unit: mat.unit,
      unitPrice: mat.avgBuyPrice,
      refDocument: refDoc,
      performedBy: `${currentRoleInfo.title}`,
      reason: notes || 'Penerimaan barang dari supplier/kantor di gudang lapangan'
    };
    const updatedTx = [newTx, ...stockTransactions];
    setStockTransactions(updatedTx);

    addAudit('Penerimaan Gudang Lapangan', 'StockItem', materialId, `Menerima ${qty} ${mat.unit} ${mat.name} via ${refDoc}`);
    saveState({ stockItems: updatedStock, stockTransactions: updatedTx });
  };

  const recordMaterialUsage = (params: {
    materialId: string;
    projectId: string;
    qty: number;
    rabItemId: string;
    wbsDesc: string;
    refDoc: string;
  }) => {
    const { materialId, projectId, qty, rabItemId, wbsDesc, refDoc } = params;
    const mat = stockItems.find(s => s.id === materialId);
    if (!mat) return;

    // Deduct stock
    const updatedStock = stockItems.map(item => {
      if (item.id === materialId) {
        const currentField = item.fieldStocks[projectId] || 0;
        return {
          ...item,
          fieldStocks: {
            ...item.fieldStocks,
            [projectId]: Math.max(0, currentField - qty)
          },
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    });
    setStockItems(updatedStock);

    // Record transaction
    const newTx: StockTransaction = {
      id: `stx-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'field_usage',
      materialId,
      materialName: mat.name,
      location: projectId,
      qty: -qty,
      unit: mat.unit,
      unitPrice: mat.avgBuyPrice,
      refDocument: refDoc,
      performedBy: `${currentRoleInfo.title}`,
      reason: `Pemakaian material untuk item: ${wbsDesc}`,
      wbsItemDescription: wbsDesc
    };
    const updatedTx = [newTx, ...stockTransactions];
    setStockTransactions(updatedTx);

    // Add cost to RAP item realization
    const costUsed = qty * mat.avgBuyPrice;
    const updatedRap = rapItems.map(r => {
      if (r.rabItemId === rabItemId) {
        const newMatCost = r.realizedMaterialCost + costUsed;
        const newTotal = newMatCost + r.realizedLaborCost + r.realizedEquipmentCost;
        return {
          ...r,
          realizedMaterialCost: newMatCost,
          totalCostRealized: newTotal,
          projectedProfit: r.contractTotalPrice - newTotal,
          projectedProfitPercent: ((r.contractTotalPrice - newTotal) / r.contractTotalPrice) * 100
        };
      }
      return r;
    });
    setRapItems(updatedRap);

    // Update project total realized cost
    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          totalCostRealized: p.totalCostRealized + costUsed
        };
      }
      return p;
    });
    setProjects(updatedProjects);

    addAudit('Catat Pemakaian Material', 'StockUsage', materialId, `Memakai ${qty} ${mat.unit} ${mat.name} untuk ${wbsDesc}`);
    saveState({ stockItems: updatedStock, stockTransactions: updatedTx, rapItems: updatedRap, projects: updatedProjects });
  };

  const addWageRecord = (record: Omit<WageRecord, 'id' | 'recordNumber'>) => {
    const count = wageRecords.length + 1;
    const recNum = record.wageType === 'borongan' ? `SPK-BORONG-2026-${String(count).padStart(3, '0')}` : `ABS-HARIAN-2026-W${String(count).padStart(2, '0')}`;
    const newRec: WageRecord = {
      ...record,
      id: `wage-${Date.now()}`,
      recordNumber: recNum
    };
    const updated = [newRec, ...wageRecords];
    setWageRecords(updated);
    addAudit('Input Pengajuan Upah', 'WageRecord', recNum, `Upah ${record.wageType} ${record.mandorName} sebesar Rp ${record.netPayable.toLocaleString('id-ID')}`);
    saveState({ wageRecords: updated });
  };

  const updateWageStatus = (wageId: string, status: WageRecord['status']) => {
    let paidOutAmount = 0;
    let projId = '';
    const updated = wageRecords.map(w => {
      if (w.id === wageId) {
        if (status === 'lunas' && w.status !== 'lunas') {
          paidOutAmount = w.netPayable;
          projId = w.projectId;
        }
        return {
          ...w,
          status,
          verifiedBy: currentRoleInfo.title,
          paidDate: status === 'lunas' ? new Date().toISOString().split('T')[0] : w.paidDate
        };
      }
      return w;
    });
    setWageRecords(updated);

    if (paidOutAmount > 0 && projId) {
      setProjects(prev =>
        prev.map(p => (p.id === projId ? { ...p, totalPaidOut: p.totalPaidOut + paidOutAmount } : p))
      );
    }

    addAudit('Update Status Upah', 'WageRecord', wageId, `Status pembayaran upah diubah menjadi ${status}`);
    saveState({ wageRecords: updated });
  };

  const submitDailyReport = (report: Omit<DailyReport, 'id' | 'reportNumber'>) => {
    const count = dailyReports.length + 1;
    const repNum = `LHR-2026-D${String(count).padStart(3, '0')}`;
    const newRep: DailyReport = {
      ...report,
      id: `lhr-${Date.now()}`,
      reportNumber: repNum
    };
    const updated = [newRep, ...dailyReports];
    setDailyReports(updated);

    // Compute progress increment on project
    if (report.workProgress && report.workProgress.length > 0) {
      const avgProgress = report.workProgress.reduce((sum, w) => sum + w.percentComplete, 0) / report.workProgress.length;
      if (avgProgress > 0) {
        setProjects(prev =>
          prev.map(p =>
            p.id === report.projectId
              ? { ...p, actualProgressPercent: Math.min(100, Math.max(p.actualProgressPercent, parseFloat(avgProgress.toFixed(1)))) }
              : p
          )
        );
      }
    }

    addAudit('Laporan Harian Diserahkan', 'DailyReport', repNum, `Laporan harian tgl ${report.date} dengan ${report.workProgress.length} item pekerjaan`);
    saveState({ dailyReports: updated });
  };

  const addFinancialEntry = (entry: Omit<FinancialEntry, 'id'>) => {
    const newEntry: FinancialEntry = {
      ...entry,
      id: `fin-${Date.now()}`
    };
    const updated = [newEntry, ...financialEntries];
    setFinancialEntries(updated);

    // Update Project paid out or total cost
    if (entry.type === 'keluar') {
      setProjects(prev =>
        prev.map(p => (p.id === entry.projectId ? { ...p, totalPaidOut: p.totalPaidOut + entry.amount } : p))
      );
    }

    addAudit('Jurnal Keuangan', 'FinancialEntry', entry.code, `Mencatat ${entry.category} senilai Rp ${entry.amount.toLocaleString('id-ID')}`);
    saveState({ financialEntries: updated });
  };

  const resolveWarning = (warningId: string) => {
    const updated = warnings.map(w => (w.id === warningId ? { ...w, status: 'resolved' as const } : w));
    setWarnings(updated);
    addAudit('Tindak Lanjut Warning', 'WarningAlert', warningId, 'Peringatan telah diselesaikan dan dimitigasi');
    saveState({ warnings: updated });
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPts(INITIAL_PTS);
    setProjects(INITIAL_PROJECTS);
    setMasterAhs(INITIAL_AHS_LIST);
    setRabItems(INITIAL_RAB_ITEMS);
    setRapItems(INITIAL_RAP_ITEMS);
    setMaterialRequests(INITIAL_MATERIAL_REQUESTS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setStockItems(INITIAL_STOCK);
    setStockTransactions(INITIAL_STOCK_TRANSACTIONS);
    setWageRecords(INITIAL_WAGE_RECORDS);
    setDailyReports(INITIAL_DAILY_REPORTS);
    setFinancialEntries(INITIAL_FINANCIAL_ENTRIES);
    setWarnings(INITIAL_WARNINGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setRevenueRecognitions(INITIAL_REVENUE_RECOGNITIONS);
  };

  // PSAK 72 Implementation
  const previewPSAK72 = (projectId: string, periodYear: number, periodMonth: number) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) {
      return {
        contractValue: 0,
        progressPercent: 0,
        revenueToDate: 0,
        revenueRecognized: 0,
        revenueThisMonth: 0
      };
    }
    const contractValue = proj.contractValue;
    const progressPercent = proj.actualProgressPercent;
    const revenueToDate = Math.round((progressPercent / 100) * contractValue);

    const priorRecognitions = revenueRecognitions.filter(
      r =>
        r.projectId === projectId &&
        r.status === 'POSTED' &&
        (r.periodYear < periodYear || (r.periodYear === periodYear && r.periodMonth < periodMonth))
    );
    const revenueRecognized = priorRecognitions.reduce((sum, r) => sum + r.revenueThisMonth, 0);
    const revenueThisMonth = Math.max(0, revenueToDate - revenueRecognized);

    return {
      contractValue,
      progressPercent,
      revenueToDate,
      revenueRecognized,
      revenueThisMonth
    };
  };

  const recognizeRevenue = (projectId: string, periodYear: number, periodMonth: number, notes?: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return { success: false, message: 'Proyek tidak ditemukan.' };

    const existing = revenueRecognitions.find(
      r => r.projectId === projectId && r.periodYear === periodYear && r.periodMonth === periodMonth && r.status === 'POSTED'
    );
    if (existing) {
      return {
        success: false,
        message: `Pengakuan pendapatan PSAK 72 periode ${periodMonth}/${periodYear} sudah diposting (${existing.recognitionNo}).`
      };
    }

    const { contractValue, progressPercent, revenueToDate, revenueRecognized, revenueThisMonth } = previewPSAK72(
      projectId,
      periodYear,
      periodMonth
    );

    const recCount = revenueRecognitions.filter(r => r.periodYear === periodYear && r.periodMonth === periodMonth).length + 1;
    const recognitionNo = `PSAK72-${periodYear}${String(periodMonth).padStart(2, '0')}-${String(recCount).padStart(4, '0')}`;
    const journalId = `JV-${recognitionNo}`;

    const newRecord: RevenueRecognition = {
      id: `rev-rec-${Date.now()}`,
      companyId: proj.ptId,
      projectId,
      periodYear,
      periodMonth,
      recognitionNo,
      contractValue,
      progressPercent,
      revenueToDate,
      revenueRecognized,
      revenueThisMonth,
      journalId,
      status: 'POSTED',
      postedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      postedById: currentRoleInfo.title,
      notes: notes || `Pengakuan Pendapatan PSAK 72 Periode ${periodMonth}/${periodYear} berdasarkan Progres Fisik ${progressPercent}%`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    const updatedRecognitions = [newRecord, ...revenueRecognitions];
    setRevenueRecognitions(updatedRecognitions);

    // Auto post financial entry: Dr 1500 Piutang Kontrak / Cr 4100 Pendapatan Proyek
    const newEntry: FinancialEntry = {
      id: `fin-rev-${Date.now()}`,
      ptId: proj.ptId,
      projectId,
      date: new Date().toISOString().split('T')[0],
      code: journalId,
      category: 'pendapatan_termin',
      description: `[PSAK 72] Pengakuan Pendapatan Periode ${periodMonth}/${periodYear} (Fisik ${progressPercent}%) - Dr 1500 Piutang Kontrak / Cr 4100 Pendapatan Proyek`,
      amount: revenueThisMonth,
      type: 'masuk',
      refDoc: recognitionNo,
      payeeOrPayer: proj.clientName,
      status: 'diverifikasi'
    };
    const updatedFinances = [newEntry, ...financialEntries];
    setFinancialEntries(updatedFinances);

    addAudit(
      'Posting PSAK 72',
      'RevenueRecognition',
      recognitionNo,
      `Mengakui revenue Rp ${revenueThisMonth.toLocaleString('id-ID')} (Progres Fisik: ${progressPercent}%, Kumulatif: Rp ${revenueToDate.toLocaleString('id-ID')})`
    );

    saveState({
      revenueRecognitions: updatedRecognitions,
      financialEntries: updatedFinances
    });

    return {
      success: true,
      message: `Revenue PSAK 72 (${recognitionNo}) senilai Rp ${revenueThisMonth.toLocaleString('id-ID')} berhasil diakui dan diposting ke jurnal!`,
      record: newRecord
    };
  };

  const reverseRevenueRecognition = (recognitionId: string, reason: string) => {
    const target = revenueRecognitions.find(r => r.id === recognitionId);
    if (!target) return { success: false, message: 'Data pengakuan revenue tidak ditemukan.' };
    if (target.status !== 'POSTED') return { success: false, message: 'Hanya transaksi berstatus POSTED yang dapat di-reverse.' };

    const updatedRecognitions = revenueRecognitions.map(r =>
      r.id === recognitionId
        ? {
            ...r,
            status: 'REVERSED' as const,
            reversedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            reversedById: currentRoleInfo.title,
            reverseReason: reason
          }
        : r
    );
    setRevenueRecognitions(updatedRecognitions);

    const reversalEntry: FinancialEntry = {
      id: `fin-rev-cancel-${Date.now()}`,
      ptId: target.companyId,
      projectId: target.projectId,
      date: new Date().toISOString().split('T')[0],
      code: `REV-${target.journalId || target.recognitionNo}`,
      category: 'pendapatan_termin',
      description: `[REVERSAL PSAK 72] Pembatalan ${target.recognitionNo}: ${reason}`,
      amount: target.revenueThisMonth,
      type: 'keluar',
      refDoc: `REV-${target.recognitionNo}`,
      payeeOrPayer: 'Koreksi Akuntansi Fiskal/PSAK',
      status: 'diverifikasi'
    };
    const updatedFinances = [reversalEntry, ...financialEntries];
    setFinancialEntries(updatedFinances);

    addAudit(
      'Reversal PSAK 72',
      'RevenueRecognition',
      target.recognitionNo,
      `Membalikkan pengakuan revenue Rp ${target.revenueThisMonth.toLocaleString('id-ID')}. Alasan: ${reason}`
    );

    saveState({
      revenueRecognitions: updatedRecognitions,
      financialEntries: updatedFinances
    });

    return { success: true, message: `Pengakuan revenue ${target.recognitionNo} berhasil dibatalkan (Reversed).` };
  };

  // Batch 10: Material Control dari RAP (1 Halaman)
  const getMaterialControlSummary = (projectId: string): MaterialControlSummary => {
    const proj = projects.find(p => p.id === projectId);
    const pName = proj ? proj.name : 'Proyek';
    const projectRaps = rapItems.filter(r => r.projectId === projectId);
    const projectPOs = purchaseOrders.filter(
      p => p.projectId === projectId && p.status !== 'dibatalkan' && p.status !== 'ditolak'
    );
    const projectTrans = stockTransactions.filter(
      t => t.location === projectId || t.location === 'gudang_kantor'
    );

    const materialNeedMap = new Map<
      string,
      {
        materialId: string;
        materialName: string;
        unit: string;
        code: string;
        avgPrice: number;
        kebutuhanRap: number;
        sources: { rapItemId: string; wbsCode: string; description: string; volume: number; unit: string; coef: number; neededQty: number }[];
      }
    >();

    // Step 1: Calculate material needs from active RAP items & AHS components
    for (const item of projectRaps) {
      const ahs = masterAhs.find(a => a.code === item.ahsCode);
      if (ahs && ahs.materials && ahs.materials.length > 0) {
        for (const comp of ahs.materials) {
          const qty = comp.coefficient * item.volume;
          const existing = materialNeedMap.get(comp.materialId) || {
            materialId: comp.materialId,
            materialName: comp.materialName,
            unit: comp.unit,
            code: '',
            avgPrice: comp.unitPrice,
            kebutuhanRap: 0,
            sources: []
          };
          existing.kebutuhanRap += qty;
          existing.sources.push({
            rapItemId: item.id,
            wbsCode: item.wbsCode,
            description: item.description,
            volume: item.volume,
            unit: item.unit,
            coef: comp.coefficient,
            neededQty: qty
          });
          materialNeedMap.set(comp.materialId, existing);
        }
      }
    }

    // Step 2: Include stock items that exist in warehouse or catalog
    for (const stock of stockItems) {
      if (!materialNeedMap.has(stock.id)) {
        materialNeedMap.set(stock.id, {
          materialId: stock.id,
          materialName: stock.name,
          unit: stock.unit,
          code: stock.code,
          avgPrice: stock.avgBuyPrice,
          kebutuhanRap: 0,
          sources: []
        });
      } else {
        const entry = materialNeedMap.get(stock.id)!;
        entry.code = stock.code;
        if (!entry.avgPrice) entry.avgPrice = stock.avgBuyPrice;
      }
    }

    const items: MaterialControlItem[] = [];

    materialNeedMap.forEach((entry, matId) => {
      const stock = stockItems.find(s => s.id === matId);
      const matName = stock ? stock.name : entry.materialName;
      const unit = stock ? stock.unit : entry.unit;
      const code = stock ? stock.code : (entry.code || `MAT-${matId.substring(0, 4).toUpperCase()}`);
      const price = stock ? stock.avgBuyPrice : entry.avgPrice;

      let dipesan = 0;
      let diterima = 0;
      const poItemsList: MaterialControlItem['poItemsList'] = [];

      projectPOs.forEach(po => {
        po.items.forEach(poItem => {
          if (poItem.materialId === matId || poItem.materialName.toLowerCase() === matName.toLowerCase()) {
            dipesan += poItem.qty;
            diterima += poItem.receivedQty || 0;
            poItemsList.push({
              poNumber: po.poNumber,
              supplierName: po.supplierName,
              orderDate: po.orderDate,
              qty: poItem.qty,
              unitPrice: poItem.unitPrice,
              status: po.status
            });
          }
        });
      });

      const receiveTrans = projectTrans.filter(
        t => t.materialId === matId && (t.type === 'receive_at_field' || t.type === 'in_po')
      );
      const totalTransReceived = receiveTrans.reduce((sum, t) => sum + t.qty, 0);
      if (totalTransReceived > diterima) {
        diterima = totalTransReceived;
      }

      const usageTrans = projectTrans.filter(
        t => t.materialId === matId && t.type === 'field_usage' && t.location === projectId
      );
      const dipakai = usageTrans.reduce((sum, t) => sum + t.qty, 0);
      const consumptionList: MaterialControlItem['consumptionList'] = usageTrans.map(t => ({
        date: t.timestamp.split(' ')[0],
        refDoc: t.refDocument,
        qty: t.qty,
        wbsDesc: t.wbsItemDescription,
        user: t.performedBy
      }));

      const sisaStok = stock?.fieldStocks[projectId] ?? 0;
      const kebutuhanRap = Math.round(entry.kebutuhanRap * 100) / 100;

      let status: MaterialControlItem['status'] = 'AMAN';
      let warning: string | null = null;
      let warningSeverity: 'HIGH' | 'MEDIUM' | null = null;

      if (kebutuhanRap > 0 && dipesan === 0) {
        status = 'BELUM_DIPESAN';
        warning = `Belum pernah dipesan. Butuh ${kebutuhanRap} ${unit}.`;
        warningSeverity = 'HIGH';
      } else if (kebutuhanRap > 0 && ((dipakai + kebutuhanRap) > (sisaStok + dipesan) || (dipesan < kebutuhanRap * 0.8))) {
        status = 'KURANG';
        const shortfall = Math.max(0, Math.round(kebutuhanRap - dipesan));
        warning = `Kurang ${shortfall} ${unit} lagi dari total kebutuhan RAP.`;
        warningSeverity = 'HIGH';
      } else if (kebutuhanRap > 0 && dipesan > (kebutuhanRap * 1.1)) {
        status = 'BERLEBIH';
        const excess = Math.round(dipesan - kebutuhanRap);
        warning = `Berlebih ${excess} ${unit} (+${Math.round(((dipesan - kebutuhanRap) / kebutuhanRap) * 100)}%). Uang tertahan di stok.`;
        warningSeverity = 'MEDIUM';
      } else {
        status = 'AMAN';
      }

      items.push({
        materialId: matId,
        materialCode: code,
        materialName: matName,
        unit,
        kebutuhanRap,
        dipesan,
        diterima,
        dipakai,
        sisaStok,
        status,
        warning,
        warningSeverity,
        nilaiKebutuhan: Math.round(kebutuhanRap * price),
        nilaiDipesan: Math.round(dipesan * price),
        rapSourceItems: entry.sources,
        poItemsList,
        consumptionList
      });
    });

    const kurangCount = items.filter(i => i.status === 'KURANG').length;
    const amanCount = items.filter(i => i.status === 'AMAN').length;
    const berlebihCount = items.filter(i => i.status === 'BERLEBIH').length;
    const belumDipesanCount = items.filter(i => i.status === 'BELUM_DIPESAN').length;
    const totalNilaiKebutuhan = items.reduce((sum, i) => sum + i.nilaiKebutuhan, 0);
    const totalNilaiDipesan = items.reduce((sum, i) => sum + i.nilaiDipesan, 0);

    return {
      projectId,
      projectName: pName,
      totalMaterial: items.length,
      kurangCount,
      amanCount,
      berlebihCount,
      belumDipesanCount,
      totalNilaiKebutuhan,
      totalNilaiDipesan,
      items
    };
  };

  // Batch 9.75: Target Profit Per Item (RAB -> RAP)
  const previewRAPMargin = (projectId: string): RAPMarginPreviewSummary => {
    const proj = projects.find(p => p.id === projectId);
    const defaultProfit = proj?.defaultTargetProfitPercent ?? 25.0;
    const pRabItems = rabItems.filter(r => r.projectId === projectId);

    const items: RAPMarginPreviewItem[] = pRabItems.map(item => {
      const targetProfitPercent = item.targetProfitPercent != null ? item.targetProfitPercent : defaultProfit;
      const source = item.targetProfitPercent != null ? 'MANUAL' : 'PROJECT_DEFAULT';
      const targetUnitCost = Math.round(item.unitPrice * (1 - targetProfitPercent / 100));
      const targetTotalCost = Math.round(item.totalPrice * (1 - targetProfitPercent / 100));
      const marginAmount = item.totalPrice - targetTotalCost;
      const marginPercent = item.totalPrice > 0 ? (marginAmount / item.totalPrice) * 100 : targetProfitPercent;
      const status = marginPercent >= 20 ? 'SEHAT' : marginPercent > 0 ? 'TERTEKAN' : 'RUGI';

      return {
        rabItemId: item.id,
        code: item.wbsCode,
        name: item.description,
        volume: item.volume,
        unit: item.unit,
        rabUnitPrice: item.unitPrice,
        rabTotalPrice: item.totalPrice,
        targetProfitPercent,
        targetUnitCost,
        targetTotalCost,
        marginPercent: Math.round(marginPercent * 100) / 100,
        marginAmount,
        source,
        status
      };
    });

    const rabTotal = items.reduce((sum, i) => sum + i.rabTotalPrice, 0);
    const rapTotal = items.reduce((sum, i) => sum + i.targetTotalCost, 0);
    const marginAmount = rabTotal - rapTotal;
    const marginPercent = rabTotal > 0 ? Math.round((marginAmount / rabTotal) * 10000) / 100 : 0;
    const targetProfitAvgPercent =
      items.length > 0
        ? Math.round((items.reduce((s, i) => s + i.targetProfitPercent, 0) / items.length) * 100) / 100
        : defaultProfit;

    const itemsAboveTarget = items.filter(i => i.marginPercent > targetProfitAvgPercent).length;
    const itemsAtTarget = items.filter(i => Math.abs(i.marginPercent - targetProfitAvgPercent) <= 0.5).length;
    const itemsBelowTarget = items.filter(i => i.marginPercent < targetProfitAvgPercent).length;

    return {
      rabTotal,
      rapTotal,
      marginAmount,
      marginPercent,
      targetProfitAvgPercent,
      itemsAboveTarget,
      itemsAtTarget,
      itemsBelowTarget,
      items
    };
  };

  const updateRabItemTargetProfit = (rabItemId: string, targetProfitPercent: number | null) => {
    const updated = rabItems.map(item =>
      item.id === rabItemId ? { ...item, targetProfitPercent } : item
    );
    setRabItems(updated);
    addAudit(
      'Ubah Target Profit Item RAB',
      'RABItem',
      rabItemId,
      `Target profit diatur menjadi ${targetProfitPercent !== null ? targetProfitPercent + '%' : 'Default Proyek (25%)'}`
    );
    saveState({ rabItems: updated });
  };

  const generateRapFromRabWithTargetProfit = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return { success: false, message: 'Proyek tidak ditemukan.' };
    const pRabItems = rabItems.filter(r => r.projectId === projectId);
    if (pRabItems.length === 0) return { success: false, message: 'Tidak ada item RAB aktif untuk proyek ini.' };

    const defaultProfit = proj.defaultTargetProfitPercent ?? 25.0;

    const newRapItems: RAPItem[] = pRabItems.map(rab => {
      const targetProfit = rab.targetProfitPercent != null ? rab.targetProfitPercent : defaultProfit;
      const rapUnitPrice = Math.round(rab.unitPrice * (1 - targetProfit / 100));
      const rapTotalPrice = Math.round(rab.totalPrice * (1 - targetProfit / 100));
      const marginAmount = rab.totalPrice - rapTotalPrice;

      const existing = rapItems.find(r => r.rabItemId === rab.id);

      return {
        id: existing ? existing.id : `rap-${Date.now()}-${rab.wbsCode.replace('.', '_')}`,
        projectId,
        rabItemId: rab.id,
        wbsCode: rab.wbsCode,
        section: rab.section,
        description: rab.description,
        volume: rab.volume,
        unit: rab.unit,
        ahsCode: rab.ahsCode || 'A.4.1.1.25',
        contractUnitPrice: rab.unitPrice,
        contractTotalPrice: rab.totalPrice,
        rabUnitPrice: rab.unitPrice,
        rabTotalPrice: rab.totalPrice,
        targetProfitPercent: targetProfit,
        marginPercent: targetProfit,
        marginAmount,
        budgetMaterialUnit: Math.round(rapUnitPrice * 0.65),
        budgetLaborUnit: Math.round(rapUnitPrice * 0.25),
        budgetEquipmentUnit: Math.round(rapUnitPrice * 0.05),
        budgetOverheadUnit: Math.round(rapUnitPrice * 0.05),
        rapUnitPrice,
        rapTotalPrice,
        realizedMaterialCost: existing?.realizedMaterialCost || 0,
        realizedLaborCost: existing?.realizedLaborCost || 0,
        realizedEquipmentCost: existing?.realizedEquipmentCost || 0,
        totalCostRealized: existing?.totalCostRealized || 0,
        projectedProfit: marginAmount,
        projectedProfitPercent: targetProfit,
        status: 'disetujui'
      };
    });

    const otherRaps = rapItems.filter(r => r.projectId !== projectId);
    const updated = [...otherRaps, ...newRapItems];
    setRapItems(updated);

    const totalRapBudget = newRapItems.reduce((sum, r) => sum + r.rapTotalPrice, 0);
    const updatedProjects = projects.map(p =>
      p.id === projectId ? { ...p, totalRapBudget } : p
    );
    setProjects(updatedProjects);

    addAudit(
      'Generate RAP Otomatis',
      'RAP',
      projectId,
      `Menghasilkan RAP otomatis dari target profit RAB dengan pagu total Rp ${totalRapBudget.toLocaleString('id-ID')}`
    );

    saveState({ rapItems: updated, projects: updatedProjects });

    return {
      success: true,
      message: `RAP berhasil dihitung otomatis dari target profit item RAB (Total Pagu: Rp ${totalRapBudget.toLocaleString('id-ID')})`
    };
  };

  return (
    <AppContext.Provider
      value={{
        activeRole,
        currentRoleInfo,
        setActiveRole,
        activePTId,
        setActivePTId: handleSetActivePTId,
        activeProjectId,
        setActiveProjectId,
        isMobileFieldMode,
        setIsMobileFieldMode,
        roles,
        pts,
        clients,
        projects,
        masterAhs,
        rabItems,
        rapItems,
        materialRequests,
        purchaseOrders,
        stockItems,
        stockTransactions,
        wageRecords,
        dailyReports,
        financialEntries,
        warnings,
        auditLogs,
        currentPT,
        currentProject,
        addPT,
        updatePT,
        updatePTLogo,
        addClient,
        updateClient,
        addProject,
        importRABItems,
        updateRABItemStatus,
        mapRABtoAHS,
        updateProjectTargetProfit,
        addMaterialRequest,
        approveMaterialRequest,
        createPurchaseOrder,
        receiveGoodsAtField,
        recordMaterialUsage,
        addWageRecord,
        updateWageStatus,
        submitDailyReport,
        addFinancialEntry,
        resolveWarning,
        resetAllData,
        updateRoleLimit,
        resetRoleLimits,
        verifyMaterialRequestSM,
        approveMaterialRequestPM,
        rejectMaterialRequest,
        approvePurchaseOrder,
        rejectPurchaseOrder,
        verifyWageSM,
        approveWagePM,
        rejectWage,
        disburseWagePayment,
        switchRoleAndGetDefaultTab,
        users,
        adminSettings,
        addUser,
        updateUser,
        deleteUser,
        updateAdminSettings,
        verifyAdminPin,
        revenueRecognitions,
        previewPSAK72,
        recognizeRevenue,
        reverseRevenueRecognition,
        getMaterialControlSummary,
        previewRAPMargin,
        updateRabItemTargetProfit,
        generateRapFromRabWithTargetProfit
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
