'use client';

import React from 'react';
import { 
  Laptop, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Activity, 
  ArrowUpRight, 
  Clock, 
  Layers, 
  FileCheck2,
  Building2,
  QrCode
} from 'lucide-react';
import { DashboardStats } from '@/types';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  stats: DashboardStats | null;
  loading: boolean;
  onNavigate: (tab: NavTab) => void;
  onOpenScanner: () => void;
}

export function DashboardView({ stats, loading, onNavigate, onOpenScanner }: DashboardViewProps) {
  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Dashboard verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  const summary = stats?.summary || {
    total_devices: 0,
    available_devices: 0,
    assigned_devices: 0,
    faulty_devices: 0,
    in_repair_devices: 0,
    scrapped_devices: 0,
    total_users: 0,
    active_assignments: 0,
    utilization_rate: 0,
  };

  const kpis = [
    {
      title: 'Toplam Envanter',
      value: summary.total_devices,
      sub: `${summary.active_assignments} aktif zimmet`,
      icon: Laptop,
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/20',
      action: () => onNavigate('inventory'),
    },
    {
      title: 'Zimmetli Cihazlar',
      value: summary.assigned_devices,
      sub: `%${summary.utilization_rate} kullanım oranı`,
      icon: FileCheck2,
      color: 'from-indigo-500/20 to-purple-500/10 text-indigo-400 border-indigo-500/20',
      action: () => onNavigate('assignments'),
    },
    {
      title: 'Boşta / Depoda',
      value: summary.available_devices,
      sub: 'Atamaya hazır',
      icon: CheckCircle,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20',
      action: () => onNavigate('inventory'),
    },
    {
      title: 'Arızalı & Bakımda',
      value: summary.faulty_devices + summary.in_repair_devices,
      sub: summary.faulty_devices > 0 ? `${summary.faulty_devices} arızalı cihaz var` : 'Sorunlu cihaz yok',
      icon: AlertTriangle,
      color: 'from-rose-500/20 to-amber-500/10 text-rose-400 border-rose-500/20',
      action: () => onNavigate('inventory'),
    },
    {
      title: 'Kayıtlı Personel',
      value: summary.total_users,
      sub: 'Sistem kullanıcıları',
      icon: Users,
      color: 'from-cyan-500/20 to-sky-500/10 text-cyan-400 border-cyan-500/20',
      action: () => onNavigate('users'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
              IT Operasyon Merkezi
            </span>
            <h2 className="text-xl font-bold text-white">Demirbaş & Zimmet Durumu</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Kurum donanımlarını gerçek zamanlı izleyin, otomatik QR barkodları üretin ve personele zimmetleme süreçlerini yönetin.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>Saha QR Okuyucu</span>
            </button>
            <button
              onClick={() => onNavigate('inventory')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              <span>Envantere Git</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              onClick={kpi.action}
              className="p-4 rounded-xl bg-[#0F172A] border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">{kpi.title}</span>
                <div className={`p-1.5 rounded-lg border bg-gradient-to-br ${kpi.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                {kpi.value}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Breakdown Row: Categories & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Status Breakdown */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Cihaz Durum Dağılımı
            </h3>
            <span className="text-xs text-slate-400">Toplam {summary.total_devices} Cihaz</span>
          </div>

          <div className="space-y-3">
            {stats?.status_breakdown.map((item) => {
              const pct = summary.total_devices > 0 ? Math.round((item.count / summary.total_devices) * 100) : 0;
              return (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.status}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {item.count} adet ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Kategori Bazlı Envanter
            </h3>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Tümünü Gör
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {stats?.categories_breakdown.map((cat) => (
              <div
                key={cat.category}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <span className="text-xs font-medium text-slate-300 truncate">{cat.category}</span>
                <span className="text-xs font-bold text-indigo-400 font-mono px-2 py-0.5 rounded-lg bg-indigo-950/60 border border-indigo-800/40">
                  {cat.count}
                </span>
              </div>
            ))}
          </div>

          {/* Department Breakdown Mini */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              Departman Dağılımı (Zimmetli)
            </h4>
            <div className="flex flex-wrap gap-2">
              {stats?.departments_breakdown.map((d) => (
                <span
                  key={d.department}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/70 border border-slate-700/60 text-slate-300 text-[11px] font-medium"
                >
                  {d.department}: <strong className="text-indigo-300">{d.count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Assignments & Audit Logs Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Son Zimmet Hareketleri
            </h3>
            <button
              onClick={() => onNavigate('assignments')}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Zimmet Listesi
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2">Demirbaş</th>
                  <th className="pb-2">Personel</th>
                  <th className="pb-2">Tarih</th>
                  <th className="pb-2 text-right">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats?.recent_assignments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5">
                      <span className="font-mono text-indigo-400 font-medium">{item.device_tag}</span>
                      <span className="block text-[10px] text-slate-400 truncate max-w-[140px]">{item.device_name}</span>
                    </td>
                    <td className="py-2.5 text-slate-300">
                      <span className="font-medium block">{item.user_name}</span>
                      <span className="text-[10px] text-slate-400">{item.user_dept}</span>
                    </td>
                    <td className="py-2.5 text-slate-400 font-mono text-[11px]">
                      {new Date(item.assigned_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-2.5 text-right">
                      {item.is_active ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Aktif Zimmet
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                          İade Edildi
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Sistem İşlem Günlüğü (Audit)
            </h3>
            <button
              onClick={() => onNavigate('audit-logs')}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Tüm Loglar
            </button>
          </div>

          <div className="space-y-3">
            {stats?.recent_activities.map((act) => {
              let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
              if (act.action === 'CREATE') badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
              if (act.action === 'ASSIGN') badgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
              if (act.action === 'RETURN') badgeColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
              if (act.action === 'STATUS_CHANGE') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
              if (act.action === 'DELETE') badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';

              return (
                <div key={act.id} className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border shrink-0 ${badgeColor}`}>
                    {act.action}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200 line-clamp-1 leading-snug">{act.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                      <span>{act.user_name}</span>
                      <span>•</span>
                      <span>{new Date(act.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
