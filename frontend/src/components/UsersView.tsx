'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  ShieldCheck, 
  Wrench, 
  UserCheck, 
  Edit3, 
  Trash2, 
  X, 
  Phone, 
  Mail, 
  Building2 
} from 'lucide-react';
import { User, UserRole } from '@/types';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { useAuth } from '@/lib/auth-context';

interface UsersViewProps {
  users: User[];
  loading: boolean;
  onRefresh: () => void;
}

export function UsersView({ users, loading, onRefresh }: UsersViewProps) {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    full_name: '',
    password: '',
    role: 'STAFF' as UserRole,
    department: '',
    phone_number: '',
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldCheck className="w-3 h-3" />
            ADMIN
          </span>
        );
      case 'IT_SPECIALIST':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Wrench className="w-3 h-3" />
            IT UZMANI
          </span>
        );
      case 'STAFF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <UserCheck className="w-3 h-3" />
            PERSONEL
          </span>
        );
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createUser({
        email: formData.email,
        username: formData.username,
        full_name: formData.full_name,
        password: formData.password,
        role: formData.role,
        department: formData.department || undefined,
        phone_number: formData.phone_number || undefined,
        is_active: formData.is_active,
      });

      showToast('success', 'Yeni kullanıcı başarıyla oluşturuldu.');
      setIsAddModalOpen(false);
      resetForm();
      onRefresh();
    } catch (err: any) {
      showToast('error', err.message || 'Kullanıcı oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      const payload: any = {
        email: formData.email,
        username: formData.username,
        full_name: formData.full_name,
        role: formData.role,
        department: formData.department || undefined,
        phone_number: formData.phone_number || undefined,
        is_active: formData.is_active,
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      await api.updateUser(editingUser.id, payload);
      showToast('success', 'Kullanıcı bilgileri güncellendi.');
      setEditingUser(null);
      resetForm();
      onRefresh();
    } catch (err: any) {
      showToast('error', err.message || 'Güncelleme başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (u: User) => {
    if (u.id === currentUser?.id) {
      showToast('error', 'Kendi hesabınızı silemezsiniz');
      return;
    }
    if (!confirm(`'${u.full_name}' kullanıcısını sistemden silmek istediğinize emin misiniz?`)) {
      return;
    }
    try {
      await api.deleteUser(u.id);
      showToast('success', 'Kullanıcı silindi.');
      onRefresh();
    } catch (err: any) {
      showToast('error', err.message || 'Kullanıcı silinemedi');
    }
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setFormData({
      email: u.email,
      username: u.username,
      full_name: u.full_name,
      password: '',
      role: u.role,
      department: u.department || '',
      phone_number: u.phone_number || '',
      is_active: u.is_active,
    });
  };

  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      full_name: '',
      password: '',
      role: 'STAFF',
      department: '',
      phone_number: '',
      is_active: true,
    });
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="İsim, e-posta, departman veya kullanıcı adı ara..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="ALL">Tüm Roller</option>
            <option value="ADMIN">Admin</option>
            <option value="IT_SPECIALIST">IT Uzmanı</option>
            <option value="STAFF">Standart Personel</option>
          </select>

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Kullanıcı Ekle</span>
          </button>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="rounded-2xl bg-[#0F172A] border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-sm">Kullanıcı Listesi</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {filteredUsers.length} kişi
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Kullanıcı Bilgisi</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Departman</th>
                <th className="py-3 px-4">İletişim</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    Kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* User info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
                          {u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-200 block">{u.full_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">@{u.username}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">{getRoleBadge(u.role)}</td>

                    {/* Department */}
                    <td className="py-3 px-4 text-slate-300">
                      <span className="font-medium">{u.department || 'Belirtilmedi'}</span>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4">
                      <span className="text-slate-300 block font-mono text-[11px]">{u.email}</span>
                      <span className="text-slate-400 text-[10px] block">{u.phone_number || '-'}</span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {u.is_active ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Pasif
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          title="Düzenle"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(u)}
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

      {/* Add / Edit User Modal */}
      {(isAddModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D16]/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingUser(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-slate-100 text-base mb-1">
              {editingUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Oluştur'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Personel veya IT yetkilisinin bilgilerini ve rolünü tanımlayın.
            </p>

            <form onSubmit={editingUser ? handleEditSubmit : handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Örn: Caner Yıldız"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kullanıcı Adı *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="caneryildiz"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rol *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="STAFF">Standart Personel</option>
                    <option value="IT_SPECIALIST">IT Uzmanı</option>
                    <option value="ADMIN">Sistem Yöneticisi (Admin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">E-Posta *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="caner@itdemirbas.com"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {editingUser ? 'Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)' : 'Şifre *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required={!editingUser}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Departman</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Yazılım, İK, Pazarlama..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Telefon</label>
                  <input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+90 532 ..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Kaydediliyor...' : editingUser ? 'Güncelle' : 'Kullanıcıyı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
