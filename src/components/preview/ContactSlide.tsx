'use client';

import { SalespersonData } from '@/lib/types';

interface ContactSlideProps {
  salesperson: SalespersonData;
}

export default function ContactSlide({ salesperson }: ContactSlideProps) {
  return (
    <div
      className="w-full h-full flex overflow-hidden select-none"
      style={{ background: 'linear-gradient(135deg, #0C64FC 0%, #05E9B6 100%)' }}
    >
      {/* Levá strana */}
      <div className="w-[56%] flex flex-col h-full overflow-hidden" style={{ padding: '4.5%' }}>
        {/* Logo bílé */}
        <div>
          <img src="/logo-white.png" alt="Mediaboard"
               style={{ height: 'clamp(20px, 3.6cqw, 40px)', width: 'auto', display: 'block' }} />
        </div>

        {/* Hlavní nadpis */}
        <h2
          className="text-white font-extrabold leading-tight mt-[3%]"
          style={{ fontSize: 'clamp(11px, 2.4cqw, 30px)' }}
        >
          Posuňte svou komunikaci
          <br />
          na další úroveň.
        </h2>

        {/* Jméno a pozice */}
        <div className="mt-[5%]">
          <p
            className="text-white font-bold leading-tight"
            style={{ fontSize: 'clamp(9px, 1.6cqw, 20px)' }}
          >
            {salesperson.name || 'Jméno obchodníka'}
          </p>
          {salesperson.position && (
            <p
              className="text-white/60 font-medium leading-tight mt-1"
              style={{ fontSize: 'clamp(7px, 1.1cqw, 14px)' }}
            >
              {salesperson.position}
            </p>
          )}
        </div>

        {/* Kontaktní informace */}
        <div className="mt-[4%] space-y-[2%]" style={{ fontSize: 'clamp(7px, 1.1cqw, 14px)' }}>
          {salesperson.phone && (
            <div className="flex items-center gap-[3%]">
              <span className="text-white/50 font-semibold w-[8%]">T:</span>
              <span className="text-white">{salesperson.phone}</span>
            </div>
          )}
          {salesperson.email && (
            <div className="flex items-center gap-[3%]">
              <span className="text-white/50 font-semibold w-[8%]">E:</span>
              <span className="text-white">{salesperson.email}</span>
            </div>
          )}
          <div className="flex items-center gap-[3%]">
            <span className="text-white/50 font-semibold w-[8%]">W:</span>
            <span className="text-white">www.mediaboard.com</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Navy pill – tmavý */}
        <div>
          <span
            className="inline-flex items-center bg-[#012163] text-white font-bold rounded-full"
            style={{ fontSize: 'clamp(6px, 1cqw, 12px)', padding: '3px 12px' }}
          >
            www.mediaboard.com
          </span>
        </div>
      </div>

      {/* Pravá strana – foto obchodníka */}
      <div className="w-[44%] h-full relative overflow-hidden flex-shrink-0">
        {salesperson.photo ? (
          <img
            src={salesperson.photo}
            alt={salesperson.name}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-white/10 flex flex-col items-center justify-center gap-3">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-12 h-12 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-white/50 text-xs text-center px-4">
              Nahrajte fotografii<br />v nastavení profilu
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
