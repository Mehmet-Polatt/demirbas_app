'use client';

import React from 'react';
import { QrCode, RefreshCw, Bell, Shield, Sparkles } from 'lucide-react';
import { NavTab } from './Sidebar';
import { useAuth } from '@/lib/auth-context';

interface HeaderProps {
  currentTab: NavTab;
  onRefresh: () => void;
  onOpenScanner: () => void;
  refreshing: boolean;
}

export function Header({ currentTab, onRefresh, onOpenScanner, refreshing }: HeaderProps) {
  const { user } = useAuth();

  const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Genel Gösterge Paneli',
      subtitle: 'Envanter metrikleri, cihaz dağılımı ve son hareketler',
    },
    inventory: {
      title: 'Envanter & Cihaz Yönetimi',
      subtitle: 'Tüm donanım varlıkları, teknik özellikler ve QR kodlar',
    },
    assignments: {
      title: 'Zimmet Takip Modülü',
      subtitle: 'Personellere zimmetlenen cihazlar ve iade geçmişi',
    },
    users: {
      title: 'Kullanıcı & Personel Yönetimi',
      subtitle: 'Sistem kullanıcıları, departmanlar ve yetki rolleri',
    },
    'audit-logs': {
      title: 'Sistem & Denetim Logları',
      subtitle: 'Zimmet, cihaz ve durum değişikliklerinin tam geçmişi',
    },
  };

  const current = tabTitles[currentTab] || tabTitles.dashboard;

  return (
    <header className="h-16 bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between z-10 shrink-0">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          {current.title}
          {currentTab === 'dashboard' && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Canlı Takip
            </span>
          )}
        </h2>
        <p className="text-xs text-slate-400 hidden sm:block">{current.subtitle}</p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          title="Verileri Yenile"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 text-slate-300 text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
          <span className="hidden md:inline">Yenile</span>
        </button>

        {/* QR Scanner trigger */}
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all duration-200"
        >
          <QrCode className="w-4 h-4" />
          <span>Saha QR Tara</span>
        </button>

        {/* User Role Indicator */}
        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800">
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-200 block leading-tight">{user?.full_name}</span>
            <span className="text-[10px] text-indigo-400 font-mono">{user?.department || 'IT Departmanı'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
