'use client';

import React, { useState } from 'react';
import { 
  FileCheck2, 
  Plus, 
  RotateCcw, 
  UserCheck, 
  Laptop, 
  Calendar, 
  AlertCircle, 
  Search, 
  CheckCircle2, 
  X,
  User,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Assignment, Device, User as UserType } from '@/types';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { useAuth } from '@/lib/auth-context';

interface AssignmentsViewProps {
  assignments: Assignment[];
  myAssignments: Assignment[];
  availableDevices: Device[];
  users: UserType[];
  loading: boolean;
  onRefresh: () => void;
  assignTargetDevice?: Device | null;
  onClearAssignTarget?: () => void;
}

export function AssignmentsView({
  assignments,
  myAssignments,
  availableDevices,
  users,
  loading,
  onRefresh,
  assignTargetDevice,
  onClearAssignTarget,
}: AssignmentsViewProps) {
  const { showToast } = useToast();
  const { user, isITOrAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'returned' | 'my'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Assign Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(!!assignTargetDevice);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | ''>(assignTargetDevice ? assignTargetDevice.id : '');
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [conditionAtAssignment, setConditionAtAssignment] = useState('Kusursuz / Yeni');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  // Return Modal
  const [returnTarget, setReturnTarget] = useState<Assignment | null>(null);
  const [conditionAtReturn, setConditionAtReturn] = useState('İyi / Sorunsuz');
  const [returnNotes, setReturnNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // If assignTargetDevice changed from outside
  React.useEffect(() => {
    if (assignTargetDevice) {
      setSelectedDeviceId(assignTargetDevice.id);
      setIsAssignModalOpen(true);
    }
  }, [assignTargetDevice]);

  // Determine current list based on tab
  let sourceList = assignments;
  if (activeTab === 'active') {
    sourceList = assignments.filter((a) => a.is_active);
  } else if (activeTab === 'returned') {
    sourceList = assignments.filter((a) => !a.is_active);
  } else if (activeTab === 'my') {
    sourceList = myAssignments;
  }

  const filteredList = sourceList.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (a.device?.asset_tag && a.device.asset_tag.toLowerCase().includes(q)) ||
      (a.device?.model && a.device.model.toLowerCase().includes(q)) ||
      (a.device?.brand && a.device.brand.toLowerCase().includes(q)) ||
      (a.user?.full_name && a.user.full_name.toLowerCase().includes(q)) ||
      (a.user?.department && a.user.department.toLowerCase().includes(q))
    );
  });

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceId || !selectedUserId) {
      showToast('error', 'Lütfen hem cihazı hem de personeli seçin');
      return;
    }
    setSubmitting(true);
    try {
      await api.createAssignment({
        device_id: Number(selectedDeviceId),
        user_id: Number(selectedUserId),
        condition_at_assignment: conditionAtAssignment,
        expected_return_date: expectedReturnDate || undefined,
        notes: assignNotes || undefined,
      });

      showToast('success', 'Cihaz başarıyla personele zimmetlendi!');
      setIsAssignModalOpen(false);
      if (onClearAssignTarget) onClearAssignTarget();
      setSelectedDeviceId('');
      setSelectedUserId('');
      setAssignNotes('');
      onRefresh();
    } catch (err: any) {
      showToast('error', err.message || 'Zimmetleme işlemi başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnTarget) return;
    setSubmitting(true);
    try {
      await api.returnAssignment(returnTarget.id, {
        condition_at_return: conditionAtReturn,
        notes: returnNotes || undefined,
      });

      showToast('success', `${returnTarget.device?.asset_tag} cihazı zimmetten başarıyla iade alındı.`);
      setReturnTarget(null);
      setReturnNotes('');
      onRefresh();
    } catch (err: any) {
      showToast('error', err.message || 'İade işlemi başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Controls & Subtabs Bar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Aktif Zimmetler
          </button>
          <button
            onClick={() => setActiveTab('returned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'returned'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            İade Edilenler
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tüm Geçmiş
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'my'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Benim Cihazlarım ({myAssignments.length})</span>
          </button>
        </div>

        {/* Search & Assign Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 lg:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zimmet ara..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {isITOrAdmin && (
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Zimmet Ata</span>
            </button>
          )}
        </div>
      </div>

      {/* Assignments Table Card */}
      <div className="rounded-2xl bg-[#0F172A] border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              {activeTab === 'my' ? 'Üzerinize Zimmetli Cihazlar' : 'Zimmet Kayıtları'}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {filteredList.length} kayıt
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Demirbaş Cihaz</th>
                <th className="py-3 px-4">Zimmetlenen Personel</th>
                <th className="py-3 px-4">Teslim Eden</th>
                <th className="py-3 px-4">Zimmet Tarihi</th>
                <th className="py-3 px-4">Durum / Notlar</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    {activeTab === 'my'
                      ? 'Üzerinize kayıtlı aktif bir zimmetli cihaz bulunmuyor.'
                      : 'Kayıt bulunamadı.'}
                  </td>
                </tr>
              ) : (
                filteredList.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Device info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-800 text-indigo-400">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-mono font-bold text-indigo-300 block">
                            {a.device?.asset_tag || `#${a.device_id}`}
                          </span>
                          <span className="text-slate-200 font-semibold block text-xs">
                            {a.device ? `${a.device.brand} ${a.device.model}` : 'Cihaz'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Target user */}
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-slate-200 block">{a.user?.full_name || 'Personel'}</span>
                        <span className="text-[10px] text-indigo-400 block">{a.user?.department || '-'}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{a.user?.email}</span>
                      </div>
                    </td>

                    {/* Operator */}
                    <td className="py-3 px-4 text-slate-400">
                      <span className="text-xs text-slate-300 font-medium block">
                        {a.assigned_by?.full_name || 'IT Yetkilisi'}
                      </span>
                    </td>

                    {/* Assigned date & condition */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-300 block">
                        {new Date(a.assigned_at).toLocaleDateString('tr-TR')}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{a.condition_at_assignment}</span>
                    </td>

                    {/* Status & return notes */}
                    <td className="py-3 px-4">
                      {a.is_active ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Aktif Zimmetli
                          </span>
                          {a.notes && <p className="text-[10px] text-slate-400 line-clamp-1">{a.notes}</p>}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                            İade Edildi ({a.returned_at ? new Date(a.returned_at).toLocaleDateString('tr-TR') : ''})
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Durum: {a.condition_at_return || 'Normal'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      {a.is_active && isITOrAdmin && (
                        <button
                          onClick={() => {
                            setReturnTarget(a);
                            setConditionAtReturn('İyi / Sorunsuz');
                            setReturnNotes('');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-semibold transition-all ml-auto"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>İade Al</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Assignment Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D16]/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setIsAssignModalOpen(false);
                if (onClearAssignTarget) onClearAssignTarget();
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-slate-100 text-base mb-1">Cihazı Personele Zimmetle</h3>
            <p className="text-xs text-slate-400 mb-4">
              Boştaki cihazı bir personele atayarak zimmet kaydı ve denetim logu oluşturun.
            </p>

            <form onSubmit={handleCreateAssignment} className="space-y-3.5">
              {/* Device Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cihaz Seç *</label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Boştaki Cihazı Seçin --</option>
                  {availableDevices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.asset_tag} - {d.brand} {d.model} ({d.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* User Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Zimmetlenecek Personel *</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Personel Seçin --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.department || 'Bölüm Yok'}) - {u.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Teslim Durumu</label>
                <input
                  type="text"
                  value={conditionAtAssignment}
                  onChange={(e) => setConditionAtAssignment(e.target.value)}
                  placeholder="Örn: Sıfır kutusunda, ekranında koruyucu var"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Expected return date */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Beklenen İade Tarihi (Opsiyonel)</label>
                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Accessories / Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Teslim Edilen Aksesuarlar / Notlar</label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Örn: Şarj aleti, taşıma çantası, kablosuz mouse teslim edildi."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Zimmetleniyor...' : 'Zimmet Tutanağını Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Assignment Modal */}
      {returnTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D16]/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setReturnTarget(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-slate-100 text-sm mb-1">Cihazı İade Al</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              {returnTarget.device?.asset_tag} • Personel: {returnTarget.user?.full_name}
            </p>

            <form onSubmit={handleReturnSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">İade Durumu *</label>
                <select
                  value={conditionAtReturn}
                  onChange={(e) => setConditionAtReturn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="İyi / Sorunsuz">İyi / Sorunsuz (Depoya Alınsın)</option>
                  <option value="Temiz / Sıfır Ayarında">Temiz / Sıfır Ayarında (Depoya Alınsın)</option>
                  <option value="Hafif Kozmetik Çizikli">Hafif Kozmetik Çizikli (Depoya Alınsın)</option>
                  <option value="Arızalı / Hasarlı">Arızalı / Hasarlı (Cihaz 'Arızalı' Durumuna Çekilsin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">İade Kontrol Notu</label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Eksik aksesuar veya tespit edilen durumlar..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReturnTarget(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'İade Alınıyor...' : 'İadeyi Onayla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
