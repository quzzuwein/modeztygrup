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
  RoleInfo
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
  INITIAL_AUDIT_LOGS
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
  submitDailyReport: (report: Omit<DailyReport, 'id' | 'reportNumber'>) => void;
  addFinancialEntry: (entry: Omit<FinancialEntry, 'id'>) => void;
  resolveWarning: (warningId: string) => void;
  resetAllData: () => void;
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

  // Load from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
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
      }
    } catch (e) {
      console.warn('Could not load saved state from localStorage:', e);
    }
  }, []);

  // Save to localStorage on changes
  const saveState = (overrides: Record<string, any> = {}) => {
    try {
      const stateToSave = {
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
        auditLogs: overrides.auditLogs || auditLogs
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  const currentRoleInfo = ROLES.find(r => r.id === activeRole) || ROLES[0];
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
        roles: ROLES,
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
        resetAllData
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
