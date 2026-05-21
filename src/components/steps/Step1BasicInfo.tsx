'use client';

import { useState } from 'react';
import { OfferData } from '@/lib/types';

interface Step1Props {
  offer: OfferData;
  onChange: (offer: OfferData) => void;
  onNext: () => void;
}

export default function Step1BasicInfo({ offer, onChange, onNext }: Step1Props) {
  const [error, setError] = useState('');

  function handleNext() {
    if (!offer.clientName.trim()) {
      setError('Název klienta je povinný.');
      return;
    }
    setError('');
    onNext();
  }

  function set<K extends keyof OfferData>(field: K) {
    return (value: OfferData[K]) => {
      onChange({ ...offer, [field]: value });
      setError('');
    };
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border border-[#E8EBFF] p-8 shadow-sm">
        <h2 className="text-[#012163] font-bold text-xl mb-1">Základní údaje nabídky</h2>
        <p className="text-[#012163]/50 text-sm mb-8">Vyplňte informace o klientovi a parametry nabídky.</p>

        <div className="space-y-6">
          {/* Název klienta */}
          <div>
            <label className="block text-xs font-semibold text-[#012163]/60 mb-1.5 uppercase tracking-wide">
              Název / Jméno klienta *
            </label>
            <input
              type="text"
              value={offer.clientName}
              onChange={(e) => set('clientName')(e.target.value)}
              placeholder="Např. SVOBODA & WILLIAMS s.r.o."
              className="w-full border border-[#E8EBFF] rounded-xl px-4 py-3 text-[#012163] font-medium placeholder-[#012163]/30 focus:outline-none focus:border-[#0D60FF] focus:ring-2 focus:ring-[#0D60FF]/10 transition text-base"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          {/* Datum nabídky */}
          <div>
            <label className="block text-xs font-semibold text-[#012163]/60 mb-1.5 uppercase tracking-wide">
              Datum nabídky
            </label>
            <input
              type="date"
              value={offer.date}
              onChange={(e) => set('date')(e.target.value)}
              className="w-full border border-[#E8EBFF] rounded-xl px-4 py-3 text-[#012163] font-medium focus:outline-none focus:border-[#0D60FF] focus:ring-2 focus:ring-[#0D60FF]/10 transition text-base"
            />
          </div>

          {/* Počet variant */}
          <div>
            <label className="block text-xs font-semibold text-[#012163]/60 mb-3 uppercase tracking-wide">
              Počet variant nabídky
            </label>
            <div className="grid grid-cols-2 gap-3">
              {([1, 2] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set('variantCount')(n)}
                  className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                    ${offer.variantCount === n
                      ? 'border-[#012163] bg-[#012163] text-white shadow-md'
                      : 'border-[#E8EBFF] text-[#012163]/60 hover:border-[#012163]/30'
                    }`}
                >
                  {n === 1 ? '1 varianta' : '2 varianty'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleNext}
          className="mt-8 w-full bg-[#012163] hover:bg-[#011040] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-base"
        >
          Pokračovat
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
