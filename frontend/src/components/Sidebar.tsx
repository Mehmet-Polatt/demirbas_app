'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Laptop, 
  FileCheck2, 
  Users, 
  History, 
  QrCode, 
  LogOut, 
  ShieldCheck,
  Cpu,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export type NavTab = 'dashboard' | 'inventory' | 'assignments' | 'users' | 'audit-logs';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenScanner: () => void;
}

export function Sidebar({ currentTab, onTabChange, onOpenScanner }: SidebarProps) {
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Genel bakış ve istatistikler',
    },
    {
      id: 'inventory' as NavTab,
      label: 'Envanter & Cihazlar',
      icon: Laptop,
      description: 'Demirbaş listesi ve durumlar',
    },
    {
      id: 'assignments' as NavTab,
      label: 'Zimmet Yönetimi',
      icon: FileCheck2,
      description: 'Cihaz atama ve iade işlemleri',
    },
    ...(isAdmin ? [
      {
        id: 'users' as NavTab,
        label: 'Kullanıcı Yönetimi',
        icon: Users,
        description: 'Personel ve yetki kontrolü',
      }
    ] : []),
    {
      id: 'audit-logs' as NavTab,
      label: 'İşlem Logları',
      icon: History,
      description: 'Denetim ve değişiklik geçmişi',
    },
  ];

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-600/25 ring-1 ring-white/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-base leading-tight tracking-tight">IT DEMİRBAŞ</h1>
            <p className="text-xs text-indigo-400 font-medium">Zimmet & Envanter Takip</p>
          </div>
        </div>
      </div>

      {/* Quick Action: QR Scanner */}
      <div className="px-4 pt-4">
        <button
          onClick={onOpenScanner}
          className="w-full flex items-center justify-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all duration-200 group font-medium text-xs shadow-sm hover:shadow-indigo-600/25"
        >
          <QrCode className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />
          <span>QR / Barkod Saha Tara</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Ana Menü
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <div className="truncate">
                <span className="text-xs font-semibold block leading-tight">{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
                {user?.full_name || 'Kullanıcı'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${user?.role === 'ADMIN' ? 'bg-amber-400' : user?.role === 'IT_SPECIALIST' ? 'bg-cyan-400' : 'bg-emerald-400'}`} />
                <span className="text-[10px] text-slate-400 truncate uppercase font-mono">
                  {user?.role || 'STAFF'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Güvenli Çıkış"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
