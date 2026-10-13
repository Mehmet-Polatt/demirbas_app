'use client';

import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ShieldAlert, 
  User, 
  Laptop, 
  FileCheck2, 
  KeyRound, 
  Clock, 
  ChevronDown, 
  ChevronRight,
  Terminal
} from 'lucide-react';
import { AuditLog } from '@/types';

interface AuditLogsViewProps {
  logs: AuditLog[];
  loading: boolean;
  onRefresh: () => void;
}

export function AuditLogsView({ logs, loading, onRefresh }: AuditLogsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.user?.full_name && log.user.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.entity_id && log.entity_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">EKLEME</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">GÜNCELLEME</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">SİLME</span>;
      case 'ASSIGN':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">ZİMMET</span>;
      case 'RETURN':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">İADE</span>;
      case 'STATUS_CHANGE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">DURUM DEĞİŞİMİ</span>;
      case 'AUTH_LOGIN':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">GİRİŞ</span>;
      case 'AUTH_LOGOUT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">ÇIKIŞ</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">{action}</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Log açıklaması, kullanıcı veya varlık no ara..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="ALL">Tüm İşlem Tipleri</option>
            <option value="ASSIGN">Zimmet Atama</option>
            <option value="RETURN">Zimmet İade</option>
            <option value="STATUS_CHANGE">Durum Değişikliği</option>
            <option value="CREATE">Varlık Ekleme</option>
            <option value="UPDATE">Güncelleme</option>
            <option value="DELETE">Silme</option>
            <option value="AUTH_LOGIN">Oturum Girişleri</option>
          </select>
        </div>
      </div>

      {/* Logs Timeline Card */}
      <div className="rounded-2xl bg-[#0F172A] border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-sm">Denetim Günlüğü (Audit Trail)</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {filteredLogs.length} kayıt
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Kayıtlı log hareketi bulunamadı.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div key={log.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">{getActionBadge(log.action)}</div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200 leading-snug">
                          {log.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                          <span className="text-indigo-300 font-medium">
                            {log.user ? log.user.full_name : 'Sistem / Anonim'}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{log.ip_address || '127.0.0.1'}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-500">
                            {new Date(log.created_at).toLocaleString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {log.changes && (
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-mono py-1 px-2 rounded-lg bg-indigo-950/40 border border-indigo-900/50 transition-colors shrink-0"
                      >
                        <Terminal className="w-3 h-3" />
                        <span>{isExpanded ? 'Detayı Gizle' : 'JSON Detay'}</span>
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  {/* Expanded JSON Changes */}
                  {isExpanded && log.changes && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                      <pre>{JSON.stringify(log.changes, null, 2)}</pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
