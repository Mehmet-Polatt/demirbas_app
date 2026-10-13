'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  QrCode, 
  Laptop, 
  Monitor, 
  Server, 
  Smartphone, 
  Printer, 
  Wifi, 
  HardDrive, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  UserCheck,
  X
} from 'lucide-react';
import { Device, DeviceCategory, DeviceStatus } from '@/types';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { useAuth } from '@/lib/auth-context';

interface InventoryViewProps {
  devices: Device[];
  loading: boolean;
  onRefresh: () => void;
  onViewQr: (device: Device) => void;
  onOpenAssign: (device: Device) => void;
}

export function InventoryView({ devices, loading, onRefresh, onViewQr, onOpenAssign }: InventoryViewProps) {
  const { showToast } = useToast();
  const { isITOrAdmin, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [statusModalDevice, setStatusModalDevice] = useState<Device | null>(null);
  const [statusUpdateVal, setStatusUpdateVal] = useState<DeviceStatus>('AVAILABLE');
  const [statusUpdateNotes, setStatusUpdateNotes] = useState('');

  // Form state for Add / Edit
  const [formData, setFormData] = useState({
    asset_tag: '',
    serial_number: '',
    category: 'LAPTOP' as DeviceCategory,
    brand: '',
    model: '',
    cpu: '',
    ram: '',
    storage: '',
    purchase_date: '',
    warranty_end_date: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Filtered devices
  const filteredDevices = devices.filter((d) => {
    const matchesSearch = 
      !searchQuery ||
      d.asset_tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.serial_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.current_holder?.full_name && d.current_holder.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || d.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || d.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryIcon = (cat: DeviceCategory) => {
    switch (cat) {
      case 'LAPTOP':
      case 'DESKTOP':
        return <Laptop className="w-4 h-4 text-indigo-400" />;
      case 'MONITOR':
        return <Monitor className="w-4 h-4 text-cyan-400" />;
      case 'SERVER':
        return <Server className="w-4 h-4 text-amber-400" />;
      case 'PHONE':
      case 'TABLET':
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'PRINTER':
        return <Printer className="w-4 h-4 text-purple-400" />;
      case 'NETWORK_DEVICE':
        return <Wifi className="w-4 h-4 text-sky-400" />;
      default:
        return <HardDrive className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Boşta (Depo)
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Zimmetli
          </span>
        );
      case 'FAULTY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Arızalı
          </span>
        );
      case 'IN_REPAIR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Tamirde
          </span>
        );
      case 'SCRAPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Hurda
          </span>
        );
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const specs: Record<string, string> = {};
      if (formData.cpu) specs.cpu = formData.cpu;
      if (formData.ram) specs.ram = formData.ram;
      if (formData.storage) specs.storage = formData.storage;

      await api.createDevice({
        asset_tag: formData.asset_tag || undefined,
        serial_number: formData.serial_number,
        category: formData.category,
        brand: formData.brand,
        model: formData.model,
        specs: Object.keys(specs).length ? specs : undefined,
        purchase_date: formData.purchase_date || undefined,
        warranty_end_date: formData.warranty_end_date || undefined,
        notes: formData.notes || undefined,
      });

      showToast('success', 'Yeni cihaz başarıyla eklendi ve QR kodu üretildi!');
      setIsAddModalOpen(false);
      resetForm();
      onRefresh();
    } catch (err: any) {
      showToast('error', err.message || 'Cihaz eklenirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;
    setSubmitting(true);
    try {
      const specs: Record<string, string> = {};
      if (formData.cpu) specs.cpu = formData.cpu;
      if (formData.ram) specs.ram = formData.ram;
      if (formData.storage) specs.storage = formData.storage;

      await api.updateDevice(editingDevice.id, {
        asset_tag: formData.asset_tag,
        serial_number: formData.serial_number,
        category: formData.category,
        brand: formData.brand,
        model: formData.model,
        specs: Object.keys(specs).length ? specs : undefined,
        purchase_date: formData.purchase_date || undefined,
        warranty_end_date: formData.warranty_end_date || undefined,
        notes: formData.notes || undefined,
      });

      showToast('success', 'Cihaz bilgileri güncellendi.');
      setEditingDevice(null);
      resetForm();
      onRefresh();
    } catch (err: any) {
      showToast('error', err.message || 'Güncelleme hatası');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalDevice) return;
    setSubmitting(true);
    try {
      await api.updateDeviceStatus(statusModalDevice.id, statusUpdateVal, statusUpdateNotes || undefined);
      showToast('success', `${statusModalDevice.asset_tag} durumu güncellendi.`);
      setStatusModalDevice(null);
      onRefresh();
    } catch (err: any) {
      showToast('error', err.message || 'Durum güncellenemedi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDevice = async (device: Device) => {
    if (!confirm(`'${device.asset_tag} (${device.brand} ${device.model})' cihazını silmek istediğinize emin misiniz?`)) {
      return;
    }
    try {
      await api.deleteDevice(device.id);
      showToast('success', 'Cihaz sistemden silindi.');
      onRefresh();
    } catch (err: any) {
      showToast('error', err.message || 'Cihaz silinemedi');
    }
  };

  const openEditModal = (d: Device) => {
    setEditingDevice(d);
    setFormData({
      asset_tag: d.asset_tag,
      serial_number: d.serial_number,
      category: d.category,
      brand: d.brand,
      model: d.model,
      cpu: d.specs?.cpu || '',
      ram: d.specs?.ram || '',
      storage: d.specs?.storage || '',
      purchase_date: d.purchase_date || '',
      warranty_end_date: d.warranty_end_date || '',
      notes: d.notes || '',
    });
  };

  const resetForm = () => {
    setFormData({
      asset_tag: '',
      serial_number: '',
      category: 'LAPTOP',
      brand: '',
      model: '',
      cpu: '',
      ram: '',
      storage: '',
      purchase_date: '',
      warranty_end_date: '',
      notes: '',
    });
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Demirbaş no, marka, model, seri no veya personel ara..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="ALL">Tüm Kategoriler</option>
            <option value="LAPTOP">Dizüstü (Laptop)</option>
            <option value="DESKTOP">Masaüstü (Desktop)</option>
            <option value="MONITOR">Monitör</option>
            <option value="SERVER">Sunucu</option>
            <option value="PHONE">Telefon</option>
            <option value="TABLET">Tablet</option>
            <option value="PRINTER">Yazıcı</option>
            <option value="NETWORK_DEVICE">Ağ Cihazı</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="AVAILABLE">Boşta (Depo)</option>
            <option value="ASSIGNED">Zimmetli</option>
            <option value="FAULTY">Arızalı</option>
            <option value="IN_REPAIR">Tamirde</option>
            <option value="SCRAPPED">Hurda</option>
          </select>

          {/* Add Device Button */}
          {isITOrAdmin && (
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Cihaz Ekle</span>
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table Card */}
      <div className="rounded-2xl bg-[#0F172A] border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-sm">Cihaz Listesi</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {filteredDevices.length} kayıt
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Demirbaş No</th>
                <th className="py-3 px-4">Cihaz & Model</th>
                <th className="py-3 px-4">Donanım / Specs</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4">Mevcut Zimmetli</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    Aranan kriterlere uygun cihaz bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredDevices.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Asset tag with QR trigger */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewQr(d)}
                          title="QR Kodu Görüntüle & Yazdır"
                          className="p-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-300 transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <div>
                          <span className="font-mono font-bold text-slate-200 block">{d.asset_tag}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{d.serial_number}</span>
                        </div>
                      </div>
                    </td>

                    {/* Brand & Model */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                          {getCategoryIcon(d.category)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-200 block">{d.brand} {d.model}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">{d.category}</span>
                        </div>
                      </div>
                    </td>

                    {/* Specs */}
                    <td className="py-3 px-4">
                      {d.specs ? (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {Object.entries(d.specs).map(([k, v]) => (
                            <span key={k} className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-mono">
                              {String(v)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {getStatusBadge(d.status)}
                    </td>

                    {/* Holder */}
                    <td className="py-3 px-4">
                      {d.current_holder ? (
                        <div>
                          <span className="font-medium text-slate-200 block leading-tight">
                            {d.current_holder.full_name}
                          </span>
                          <span className="text-[10px] text-indigo-400">
                            {d.current_holder.department}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-mono">Boşta</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Assign button if available */}
                        {d.status === 'AVAILABLE' && isITOrAdmin && (
                          <button
                            onClick={() => onOpenAssign(d)}
                            title="Personele Zimmetle"
                            className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Status change modal trigger */}
                        {isITOrAdmin && (
                          <button
                            onClick={() => {
                              setStatusModalDevice(d);
                              setStatusUpdateVal(d.status);
                              setStatusUpdateNotes('');
                            }}
                            title="Durum Değiştir"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Edit */}
                        {isITOrAdmin && (
                          <button
                            onClick={() => openEditModal(d)}
                            title="Düzenle"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete */}
                        {isAdmin && d.status !== 'ASSIGNED' && (
                          <button
                            onClick={() => handleDeleteDevice(d)}
                            title="Sil"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Device Modal */}
      {(isAddModalOpen || editingDevice) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D16]/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingDevice(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-slate-100 text-base mb-1">
              {editingDevice ? 'Cihaz Bilgilerini Düzenle' : 'Yeni Demirbaş Cihaz Ekle'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Cihaza ait teknik özellikleri ve seri numarasını girin. QR Kod otomatik oluşturulacaktır.
            </p>

            <form onSubmit={editingDevice ? handleEditSubmit : handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Demirbaş Kodu</label>
                  <input
                    type="text"
                    value={formData.asset_tag}
                    onChange={(e) => setFormData({ ...formData, asset_tag: e.target.value })}
                    placeholder="Örn: AST-2024-001 (Boşsa otomatik üretilir)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Seri No (S/N) *</label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    placeholder="Örn: C02G19JPMD6R"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as DeviceCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LAPTOP">Dizüstü (Laptop)</option>
                    <option value="DESKTOP">Masaüstü</option>
                    <option value="MONITOR">Monitör</option>
                    <option value="SERVER">Sunucu</option>
                    <option value="PHONE">Telefon</option>
                    <option value="TABLET">Tablet</option>
                    <option value="PRINTER">Yazıcı</option>
                    <option value="NETWORK_DEVICE">Ağ Cihazı</option>
                    <option value="OTHER">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Marka *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Örn: Apple, Dell"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Model *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Örn: MacBook Pro 16"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Hardware Specs */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                  Donanım Özellikleri
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={formData.cpu}
                    onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                    placeholder="İşlemci (Örn: M3 Pro)"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={formData.ram}
                    onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                    placeholder="Bellek (Örn: 32 GB)"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={formData.storage}
                    onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                    placeholder="Disk (Örn: 1 TB SSD)"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Satın Alma Tarihi</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Garanti Bitiş Tarihi</label>
                  <input
                    type="date"
                    value={formData.warranty_end_date}
                    onChange={(e) => setFormData({ ...formData, warranty_end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ek Notlar</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Kutu içeriği, fiziksel durum vs."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingDevice(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Kaydediliyor...' : editingDevice ? 'Güncelle' : 'Cihazı Kaydet & QR Üret'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Status Update Modal */}
      {statusModalDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D16]/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setStatusModalDevice(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-slate-100 text-sm mb-1">Durum Güncelle</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              {statusModalDevice.asset_tag} ({statusModalDevice.brand} {statusModalDevice.model})
            </p>

            <form onSubmit={handleStatusSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Yeni Durum</label>
                <select
                  value={statusUpdateVal}
                  onChange={(e) => setStatusUpdateVal(e.target.value as DeviceStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="AVAILABLE">Boşta (Depo)</option>
                  <option value="FAULTY">Arızalı</option>
                  <option value="IN_REPAIR">Tamirde / Serviste</option>
                  <option value="SCRAPPED">Hurdaya Ayrıldı</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Açıklama / Arıza Notu</label>
                <textarea
                  rows={2}
                  value={statusUpdateNotes}
                  onChange={(e) => setStatusUpdateNotes(e.target.value)}
                  placeholder="Arıza sebebi, servis takip no vs."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStatusModalDevice(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Kaydediliyor...' : 'Durumu Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
