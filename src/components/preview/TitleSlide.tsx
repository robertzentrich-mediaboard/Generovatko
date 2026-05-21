'use client';

import { formatDate } from '@/lib/constants';
import { OfferData, SalespersonData } from '@/lib/types';

interface TitleSlideProps {
  offer: OfferData;
  salesperson: SalespersonData;
}

export default function TitleSlide({ offer, salesperson }: TitleSlideProps) {
  return (
    <div
      className="w-full h-full flex overflow-hidden select-none relative"
      style={{ background: 'linear-gradient(135deg, #0C64FC 0%, #05E9B6 100%)' }}
    >
      {/* Levá strana – obsah */}
      <div className="w-[52%] flex flex-col h-full px-[5%] py-[5%] relative z-10">
        {/* Logo */}
        <div>
          <img src="/logo-white.png" alt="Mediaboard"
               style={{ height: 'clamp(20px, 3.6cqw, 40px)', width: 'auto', display: 'block' }} />
        </div>

        {/* Headline */}
        <div className="flex-1 flex flex-col justify-center">
          <h1
            className="text-white font-extrabold leading-tight whitespace-pre-line"
            style={{ fontSize: 'clamp(13px, 3.3cqw, 40px)' }}
          >
            {`Komplexní PR\nnástroj pro\n${offer.clientName || 'Název klienta'}`}
          </h1>
          <p className="text-white/60 mt-[2%]"
             style={{ fontSize: 'clamp(7px, 1cqw, 12px)' }}>
            {formatDate(offer.date)}
          </p>
        </div>

        {/* Obchodník */}
        <div className="flex items-center gap-[3%] mb-[2%]">
          {salesperson.photo ? (
            <img
              src={salesperson.photo}
              alt={salesperson.name}
              className="rounded-lg object-cover flex-shrink-0"
              style={{ width: 'clamp(28px, 5.5cqw, 52px)', height: 'clamp(28px, 5.5cqw, 52px)' }}
            />
          ) : (
            <div
              className="rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0"
              style={{ width: 'clamp(28px, 5.5cqw, 52px)', height: 'clamp(28px, 5.5cqw, 52px)' }}
            >
              <span className="text-white font-bold"
                    style={{ fontSize: 'clamp(10px, 1.5cqw, 18px)' }}>
                {salesperson.name ? salesperson.name[0].toUpperCase() : '?'}
              </span>
            </div>
          )}
          <div>
            <p className="text-white font-bold leading-tight"
               style={{ fontSize: 'clamp(8px, 1.3cqw, 16px)' }}>
              {salesperson.name || 'Jméno obchodníka'}
            </p>
            {salesperson.position && (
              <p className="text-white/60 leading-tight"
                 style={{ fontSize: 'clamp(6px, 1cqw, 12px)' }}>
                {salesperson.position}
              </p>
            )}
          </div>
        </div>

        {/* Teal WWW pill */}
        <div>
          <span
            className="inline-flex items-center bg-[#04EDB5] text-[#012163] font-bold rounded-full"
            style={{ fontSize: 'clamp(6px, 0.9cqw, 12px)', padding: '3px 12px' }}
          >
            www.mediaboard.com
          </span>
        </div>
      </div>

      {/* Pravá strana – screenshot aplikace (celý, bez ořezu) */}
      <div className="absolute right-0 top-0 bottom-0 w-[48%] flex items-center justify-center overflow-hidden">
        <img
          src="/app-screenshot.png"
          alt="Mediaboard aplikace"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
