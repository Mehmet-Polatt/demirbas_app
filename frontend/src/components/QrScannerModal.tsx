'use client';

import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  Search, 
  Laptop, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Device } from '@/types';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast-context';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceUpdated: () => void;
  onOpenAssign: (device: Device) => void;
}

export function QrScannerModal({ isOpen, onClose, onDeviceUpdated, onOpenAssign }: QrScannerModalProps) {
  const { showToast } = useToast();
  const [tagInput, setTagInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [device, setDevice] = useState<Device | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (tag: string) => {
    const targetTag = tag.trim();
    if (!targetTag) return;
    setSearching(true);
    setDevice(null);
    try {
      const data = await api.getDeviceByTag(targetTag);
      setDevice(data);
      showToast('success', `${data.asset_tag} (${data.brand} ${data.model}) cihazı bulundu`);
    } catch (err: any) {
      showToast('error', err.message || 'Demirbaş etiketi sistemde bulunamadı');
    } finally {
      setSearching(false);
    }
  };

  const handleFastPreset = (presetTag: string) => {
    setTagInput(presetTag);
    handleSearch(presetTag);
  };

  const handleQuickReturn = async () => {
    if (!device || !device.current_holder?.assignment_id) return;
    setActionLoading(true);
    try {
      await api.returnAssignment(device.current_holder.assignment_id, {
        condition_at_return: 'Saha taraması ile sağlam iade alındı',
      });
      showToast('success', `${device.asset_tag} başarıyla depoya iade alındı.`);
      onDeviceUpdated();
      // Refresh current device view
      const updated = await api.getDeviceById(device.id);
      setDevice(updated);
    } catch (err: any) {
      showToast('error', err.message || 'İade işlemi gerçekleştirilemedi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportFaulty = async () => {
    if (!device) return;
    setActionLoading(true);
    try {
      await api.updateDeviceStatus(device.id, 'FAULTY', 'Saha okutmasında arızalı olarak bildirildi');
      showToast('warning', `${device.asset_tag} cihaz durumu 'Arızalı' olarak kaydedildi.`);
      onDeviceUpdated();
      const updated = await api.getDeviceById(device.id);
      setDevice(updated);
    } catch (err: any) {
      showToast('error', err.message || 'Durum güncellenemedi');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D16]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">QR Kod & Barkod Saha Tarayıcı</h3>
            <p className="text-xs text-slate-400">Demirbaş etiketini okutun veya arayın</p>
          </div>
        </div>

        {/* Scanner Simulation & Input */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(tagInput)}
                placeholder="Örn: AST-2024-001"
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => handleSearch(tagInput)}
              disabled={searching}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors disabled:opacity-50"
            >
              {searching ? 'Aranıyor...' : 'Sorgula'}
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Hızlı Test İçin Örnek Cihazlar:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['AST-2024-001', 'AST-2024-002', 'AST-2024-003', 'AST-2024-006', 'AST-2024-010'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleFastPreset(tag)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Device Information Card */}
        {device && (
          <div className="mt-5 p-4 rounded-xl bg-slate-900/90 border border-slate-700 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                  {device.asset_tag}
                </span>
                <h4 className="text-sm font-bold text-slate-100 mt-1">
                  {device.brand} {device.model}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">Seri No: {device.serial_number}</p>
              </div>

              {/* Status Badge */}
              <div>
                {device.status === 'AVAILABLE' && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Boşta / Depoda
                  </span>
                )}
                {device.status === 'ASSIGNED' && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Zimmetli
                  </span>
                )}
                {device.status === 'FAULTY' && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Arızalı
                  </span>
                )}
                {device.status === 'IN_REPAIR' && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Tamirde
                  </span>
                )}
              </div>
            </div>

            {/* Holder Information if assigned */}
            {device.current_holder ? (
              <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-900/40 text-xs">
                <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block">
                  Mevcut Zimmet Sahibi
                </span>
                <span className="font-bold text-slate-200 block">{device.current_holder.full_name}</span>
                <span className="text-slate-400 text-[11px]">
                  {device.current_holder.department} • {device.current_holder.email}
                </span>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-slate-800/40 text-[11px] text-slate-400">
                Bu cihaz şu an boştadır, herhangi bir personele atanmamıştır.
              </div>
            )}

            {/* Field Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
              {device.status === 'AVAILABLE' && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAssign(device);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Personele Zimmetle</span>
                </button>
              )}

              {device.status === 'ASSIGNED' && (
                <button
                  onClick={handleQuickReturn}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Depoya İade Al</span>
                </button>
              )}

              {device.status !== 'FAULTY' && (
                <button
                  onClick={handleReportFaulty}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Arıza Bildir</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
