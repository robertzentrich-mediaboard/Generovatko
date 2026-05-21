'use client';

import Image from 'next/image';
import { SalespersonData } from '@/lib/types';

interface HeaderProps {
  salesperson: SalespersonData;
  onSettingsOpen: () => void;
  onNewOffer: () => void;
}

export default function Header({ salesperson, onSettingsOpen, onNewOffer }: HeaderProps) {
  return (
    <header className="bg-white border-b border-[#E8EBFF] sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image src="/logo-blue.png" alt="Mediaboard" width={120} height={28} className="h-7 w-auto" />
          <span className="text-xs font-semibold text-[#012163]/30 uppercase tracking-widest hidden sm:block">
            Generátor nabídek
          </span>
        </div>

        {/* Akce */}
        <div className="flex items-center gap-3">
          {/* Nová nabídka */}
          <button
            onClick={onNewOffer}
            className="hidden sm:flex items-center gap-1.5 text-sm text-[#012163]/60 hover:text-[#012163] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nová nabídka
          </button>

          {/* Obchodník + nastavení */}
          <button
            onClick={onSettingsOpen}
            className="flex items-center gap-2 pl-3 border-l border-[#E8EBFF] group"
          >
            {salesperson.photo ? (
              <img
                src={salesperson.photo}
                alt={salesperson.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-[#E8EBFF]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#012163] flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {salesperson.name ? salesperson.name[0].toUpperCase() : '?'}
                </span>
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-[#012163] leading-none">
                {salesperson.name || 'Nastavit profil'}
              </p>
              {salesperson.position && (
                <p className="text-xs text-[#012163]/50 leading-none mt-0.5">{salesperson.position}</p>
              )}
            </div>
            <svg className="w-4 h-4 text-[#012163]/40 group-hover:text-[#012163] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
