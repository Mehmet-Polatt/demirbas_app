'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { api } from '@/lib/api';
import { 
  Device, 
  Assignment, 
  User, 
  DashboardStats, 
  AuditLog 
} from '@/types';
import { Sidebar, NavTab } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { LoginModal } from '@/components/LoginModal';
import { DashboardView } from '@/components/DashboardView';
import { InventoryView } from '@/components/InventoryView';
import { AssignmentsView } from '@/components/AssignmentsView';
import { UsersView } from '@/components/UsersView';
import { AuditLogsView } from '@/components/AuditLogsView';
import { QrCodeModal } from '@/components/QrCodeModal';
import { QrScannerModal } from '@/components/QrScannerModal';
import { Cpu } from 'lucide-react';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Entities state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Modals state
  const [qrModalDevice, setQrModalDevice] = useState<Device | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [assignTargetDevice, setAssignTargetDevice] = useState<Device | null>(null);

  const loadData = useCallback(async (isSilent = false) => {
    if (!user) return;
    if (!isSilent) setRefreshing(true);

    try {
      const [
        statsRes,
        devicesRes,
        assignmentsRes,
        myAssignmentsRes,
        usersRes,
        logsRes,
      ] = await Promise.allSettled([
        api.getDashboardStats(),
        api.getDevices({ limit: 100 }),
        api.getAssignments({ limit: 100 }),
        api.getMyAssignments(),
        api.getUsers({ limit: 100 }),
        api.getAuditLogs({ limit: 100 }),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (devicesRes.status === 'fulfilled') setDevices(devicesRes.value);
      if (assignmentsRes.status === 'fulfilled') setAssignments(assignmentsRes.value);
      if (myAssignmentsRes.status === 'fulfilled') setMyAssignments(myAssignmentsRes.value);
      if (usersRes.status === 'fulfilled') setUsersList(usersRes.value);
      if (logsRes.status === 'fulfilled') setAuditLogs(logsRes.value);

      if (!isSilent) {
        showToast('info', 'Veriler güncellendi.');
      }
    } catch (err: any) {
      showToast('error', 'Veriler yüklenirken bir problem oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (user) {
      loadData(true);
    }
  }, [user, loadData]);

  const handleOpenAssignWithDevice = (targetDev: Device) => {
    setAssignTargetDevice(targetDev);
    setCurrentTab('assignments');
  };

  // Auth Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
            <Cpu className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-xs text-slate-400 font-mono">Sistem Hazırlanıyor...</span>
        </div>
      </div>
    );
  }

  // Not authenticated -> show Login
  if (!user) {
    return <LoginModal />;
  }

  const availableDevices = devices.filter((d) => d.status === 'AVAILABLE');

  return (
    <div className="flex h-screen bg-[#090D16] text-slate-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentTab={currentTab}
          onRefresh={() => loadData(false)}
          onOpenScanner={() => setIsScannerOpen(true)}
          refreshing={refreshing}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#090D16]/50">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                loading={loading}
                onNavigate={(tab) => setCurrentTab(tab)}
                onOpenScanner={() => setIsScannerOpen(true)}
              />
            )}

            {currentTab === 'inventory' && (
              <InventoryView
                devices={devices}
                loading={loading}
                onRefresh={() => loadData(true)}
                onViewQr={(device) => setQrModalDevice(device)}
                onOpenAssign={handleOpenAssignWithDevice}
              />
            )}

            {currentTab === 'assignments' && (
              <AssignmentsView
                assignments={assignments}
                myAssignments={myAssignments}
                availableDevices={availableDevices}
                users={usersList}
                loading={loading}
                onRefresh={() => loadData(true)}
                assignTargetDevice={assignTargetDevice}
                onClearAssignTarget={() => setAssignTargetDevice(null)}
              />
            )}

            {currentTab === 'users' && (
              <UsersView
                users={usersList}
                loading={loading}
                onRefresh={() => loadData(true)}
              />
            )}

            {currentTab === 'audit-logs' && (
              <AuditLogsView
                logs={auditLogs}
                loading={loading}
                onRefresh={() => loadData(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global QR Code Printable Modal */}
      {qrModalDevice && (
        <QrCodeModal
          device={qrModalDevice}
          onClose={() => setQrModalDevice(null)}
        />
      )}

      {/* Global Field QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDeviceUpdated={() => loadData(true)}
        onOpenAssign={handleOpenAssignWithDevice}
      />
    </div>
  );
}
