'use client';

import React from 'react';
import { X, Printer, Download, QrCode, ShieldCheck, Tag } from 'lucide-react';
import { Device } from '@/types';

interface QrCodeModalProps {
  device: Device | null;
  onClose: () => void;
}

export function QrCodeModal({ device, onClose }: QrCodeModalProps) {
  if (!device) return null;

  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const backendBase = `http://${host}:8000`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = device.qr_code_path?.startsWith('http') 
      ? device.qr_code_path 
      : `${backendBase}${device.qr_code_path}`;
    link.download = `QR_${device.asset_tag}.png`;
    link.target = '_blank';
    link.click();
  };

  const qrImageUrl = device.qr_code_path
    ? (device.qr_code_path.startsWith('http') ? device.qr_code_path : `${backendBase}${device.qr_code_path}`)
    : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
        JSON.stringify({ system: 'IT_DEMIRBAS_YS', asset_tag: device.asset_tag, model: device.model })
      )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D16]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 mb-4 text-indigo-400">
          <QrCode className="w-5 h-5" />
          <h3 className="font-bold text-slate-100 text-sm">Demirbaş QR Kod & Etiket</h3>
        </div>

        {/* Printable Label Card */}
        <div
          id="printable-qr-label"
          className="bg-white text-slate-900 rounded-xl p-5 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 shadow-md text-center"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-widest mb-1">
            <Tag className="w-3.5 h-3.5" />
            <span>IT DEMİRBAŞ YÖNETİMİ</span>
          </div>

          <div className="w-48 h-48 my-2 p-2 bg-white rounded-lg flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrImageUrl}
              alt={`QR Code for ${device.asset_tag}`}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="mt-1">
            <span className="font-mono font-black text-lg tracking-wider text-slate-900 block leading-tight">
              {device.asset_tag}
            </span>
            <span className="text-xs font-semibold text-slate-700 block mt-0.5">
              {device.brand} {device.model}
            </span>
            <span className="text-[10px] font-mono text-slate-500 block">
              S/N: {device.serial_number}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Etiket Yazdır</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>PNG İndir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
