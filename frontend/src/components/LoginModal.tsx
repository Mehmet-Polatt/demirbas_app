'use client';

import React, { useState } from 'react';
import { Cpu, Lock, User, ArrowRight, ShieldCheck, Wrench, UserCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';

export function LoginModal() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [identifier, setIdentifier] = useState('admin@itdemirbas.com');
  const [password, setPassword] = useState('AdminPassword123!');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      showToast('error', 'Lütfen tüm alanları doldurunuz');
      return;
    }
    setLoading(true);
    try {
      await login({ username_or_email: identifier, password });
      showToast('success', 'Giriş başarılı! Hoş geldiniz.');
    } catch (err: any) {
      showToast('error', err.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (u: string, p: string, roleName: string) => {
    setIdentifier(u);
    setPassword(p);
    showToast('info', `${roleName} bilgileri forma aktarıldı.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D16]/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl p-7 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600 blur-sm rounded-full" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-1 ring-white/20">
            <Cpu className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">IT Demirbaş & Zimmet</h2>
          <p className="text-xs text-slate-400 mt-1">Lütfen devam etmek için oturum açınız</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              E-Posta veya Kullanıcı Adı
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ornek@itdemirbas.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Şifre
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all duration-200 mt-2 disabled:opacity-50"
          >
            <span>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Demo Fast Fill Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
            Test Girişi İçin Hızlı Hesap Seçin
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoAccount('admin@itdemirbas.com', 'AdminPassword123!', 'Admin')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/60 transition-all text-center group"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-slate-200">Admin</span>
              <span className="text-[9px] text-slate-400">Tam Yetki</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoAccount('it.destek@itdemirbas.com', 'UserPassword123!', 'IT Uzmanı')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/60 transition-all text-center group"
            >
              <Wrench className="w-4 h-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-slate-200">IT Uzmanı</span>
              <span className="text-[9px] text-slate-400">Envanter/Zimmet</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoAccount('ahmet.yilmaz@itdemirbas.com', 'UserPassword123!', 'Personel')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all text-center group"
            >
              <UserCheck className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-slate-200">Personel</span>
              <span className="text-[9px] text-slate-400">Kişisel Zimmet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
