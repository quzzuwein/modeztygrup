/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar, ActiveTab } from './components/common/Sidebar';
import { WarningBanner } from './components/common/WarningBanner';
import { DashboardView } from './components/modules/Dashboard/DashboardView';
import { MasterAHSView } from './components/modules/MasterAHS/MasterAHSView';
import { RABView } from './components/modules/RAB/RABView';
import { RAPView } from './components/modules/RAP/RAPView';
import { LogistikView } from './components/modules/Logistik/LogistikView';
import { UpahView } from './components/modules/Upah/UpahView';
import { ProgresKurvaSView } from './components/modules/ProgresKurvaS/ProgresKurvaSView';
import { KeuanganView } from './components/modules/Keuangan/KeuanganView';
import { LaporanView } from './components/modules/Laporan/LaporanView';
import { AuditTrailView } from './components/modules/AuditTrail/AuditTrailView';
import { MobileLapanganView } from './components/modules/MobileLapangan/MobileLapanganView';

import { RoleMatrixModal } from './components/common/RoleMatrixModal';
import { AddEntityModal } from './components/common/AddEntityModal';
import { ApprovalCenterModal } from './components/common/ApprovalCenterModal';
import { RoleLimitConfigModal } from './components/common/RoleLimitConfigModal';
import { UserManagementModal } from './components/common/UserManagementModal';

const MainLayout: React.FC = () => {
  const { isMobileFieldMode, currentRoleInfo, switchRoleAndGetDefaultTab } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isWarningDrawerOpen, setIsWarningDrawerOpen] = useState(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [isApprovalCenterOpen, setIsApprovalCenterOpen] = useState(false);
  const [isRoleLimitConfigOpen, setIsRoleLimitConfigOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [addEntityModal, setAddEntityModal] = useState<{ isOpen: boolean; mode: 'pt' | 'project' }>({
    isOpen: false,
    mode: 'project'
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <Navbar
        onOpenWarnings={() => setIsWarningDrawerOpen(true)}
        onOpenRoleMatrix={() => setIsMatrixModalOpen(true)}
        onOpenAddEntity={(mode) => setAddEntityModal({ isOpen: true, mode })}
        onOpenApprovalCenter={() => setIsApprovalCenterOpen(true)}
        onOpenRoleLimitConfig={() => setIsRoleLimitConfigOpen(true)}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        onRoleChange={(newRole) => {
          const targetTab = switchRoleAndGetDefaultTab(newRole);
          setActiveTab(targetTab as ActiveTab);
        }}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar - hidden when printing */}
        <div className="no-print hidden md:block">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenRoleMatrix={() => setIsMatrixModalOpen(true)}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
          {isMobileFieldMode ? (
            <MobileLapanganView />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  onNavigateTab={setActiveTab}
                  onOpenAddEntity={(mode) => setAddEntityModal({ isOpen: true, mode })}
                />
              )}
              {activeTab === 'ahs' && <MasterAHSView />}
              {activeTab === 'rab' && <RABView />}
              {activeTab === 'rap' && <RAPView />}
              {activeTab === 'logistik' && <LogistikView />}
              {activeTab === 'upah' && <UpahView />}
              {activeTab === 'progres' && <ProgresKurvaSView />}
              {activeTab === 'keuangan' && <KeuanganView />}
              {activeTab === 'laporan' && <LaporanView />}
              {activeTab === 'audit' && <AuditTrailView />}
            </>
          )}
        </main>
      </div>

      {/* Warning & Risk Mitigation Drawer */}
      <WarningBanner
        isOpen={isWarningDrawerOpen}
        onClose={() => setIsWarningDrawerOpen(false)}
        onNavigateTab={tab => {
          setActiveTab(tab);
          setIsWarningDrawerOpen(false);
        }}
      />

      {/* Role Matrix & Permissions Modal */}
      <RoleMatrixModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
      />

      {/* Add Entity (PT Baru & Proyek Baru) Modal */}
      <AddEntityModal
        isOpen={addEntityModal.isOpen}
        initialMode={addEntityModal.mode}
        onClose={() => setAddEntityModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Multi-Tier Approval Center Modal */}
      <ApprovalCenterModal
        isOpen={isApprovalCenterOpen}
        onClose={() => setIsApprovalCenterOpen(false)}
        onNavigateTab={tab => {
          setActiveTab(tab);
          setIsApprovalCenterOpen(false);
        }}
      />

      {/* Direktur Nominal Limit Config Modal */}
      <RoleLimitConfigModal
        isOpen={isRoleLimitConfigOpen}
        onClose={() => setIsRoleLimitConfigOpen(false)}
      />

      {/* Super Admin User Management & Access Lock Modal */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        onOpenLimitConfig={() => {
          setIsUserManagementOpen(false);
          setIsRoleLimitConfigOpen(true);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
