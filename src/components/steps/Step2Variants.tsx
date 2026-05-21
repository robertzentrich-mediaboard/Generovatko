'use client';

import { useState } from 'react';
import { FEATURES, formatPrice } from '@/lib/constants';
import { OfferData, VariantData } from '@/lib/types';

interface Step2Props {
  offer: OfferData;
  onChange: (offer: OfferData) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step2Variants({ offer, onChange, onBack, onNext }: Step2Props) {
  const [activeTab, setActiveTab] = useState(0);

  function updateVariant(index: number, updated: VariantData) {
    const variants: [VariantData, VariantData] = [...offer.variants] as [VariantData, VariantData];
    variants[index] = updated;
    onChange({ ...offer, variants });
  }

  const variantsToShow = offer.variants.slice(0, offer.variantCount);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-[#E8EBFF] shadow-sm overflow-hidden">
        {/* Záložky variant (jen pokud jsou 2) */}
        {offer.variantCount === 2 && (
          <div className="flex border-b border-[#E8EBFF]">
            {variantsToShow.map((v, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`flex-1 py-4 text-sm font-bold transition-all
                  ${activeTab === i
                    ? 'text-[#012163] border-b-2 border-[#012163] bg-[#F2F4FF]'
                    : 'text-[#012163]/40 hover:text-[#012163]/70'
                  }`}
              >
                {v.name || `Varianta ${i + 1}`}
              </button>
            ))}
          </div>
        )}

        {variantsToShow.map((variant, i) => (
          <div
            key={i}
            className={offer.variantCount === 2 && activeTab !== i ? 'hidden' : ''}
          >
            <VariantForm
              variant={variant}
              onChange={(v) => updateVariant(i, v)}
              label={offer.variantCount === 1 ? 'Varianta' : `Varianta ${i + 1}`}
            />
          </div>
        ))}

        {/* Navigace */}
        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3 border-2 border-[#E8EBFF] text-[#012163]/60 hover:border-[#012163]/30 hover:text-[#012163] font-bold rounded-xl transition-all text-sm"
          >
            Zpět
          </button>
          <button
            onClick={onNext}
            className="flex-1 py-3 bg-[#012163] hover:bg-[#011040] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            Zobrazit náhled
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function VariantForm({ variant, onChange, label }: {
  variant: VariantData;
  onChange: (v: VariantData) => void;
  label: string;
}) {
  function toggleFeature(idx: number) {
    const features = variant.features.includes(idx)
      ? variant.features.filter((f) => f !== idx)
      : [...variant.features, idx];
    onChange({ ...variant, features });
  }

  function selectAll() {
    onChange({ ...variant, features: FEATURES.map((_, i) => i) });
  }

  function selectNone() {
    onChange({ ...variant, features: [] });
  }

  return (
    <div className="p-8 space-y-6">
      <h3 className="text-[#012163] font-bold text-base">{label}</h3>

      {/* Název varianty */}
      <div>
        <label className="block text-xs font-semibold text-[#012163]/60 mb-1.5 uppercase tracking-wide">
          Název varianty
        </label>
        <input
          type="text"
          value={variant.name}
          onChange={(e) => onChange({ ...variant, name: e.target.value })}
          placeholder="Např. Základní, Premium…"
          className="w-full border border-[#E8EBFF] rounded-xl px-4 py-2.5 text-[#012163] font-medium placeholder-[#012163]/30 focus:outline-none focus:border-[#0D60FF] focus:ring-2 focus:ring-[#0D60FF]/10 transition text-sm"
        />
      </div>

      {/* Cena */}
      <div>
        <label className="block text-xs font-semibold text-[#012163]/60 mb-1.5 uppercase tracking-wide">
          Cena (měsíčně, bez DPH)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={variant.price}
            onChange={(e) => onChange({ ...variant, price: e.target.value })}
            placeholder="0"
            min="0"
            className="flex-1 border border-[#E8EBFF] rounded-xl px-4 py-2.5 text-[#012163] font-bold placeholder-[#012163]/30 focus:outline-none focus:border-[#0D60FF] focus:ring-2 focus:ring-[#0D60FF]/10 transition text-sm"
          />
          <div className="flex border border-[#E8EBFF] rounded-xl overflow-hidden">
            {(['CZK', 'EUR'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange({ ...variant, currency: c })}
                className={`px-4 py-2.5 text-sm font-bold transition-all
                  ${variant.currency === c
                    ? 'bg-[#012163] text-white'
                    : 'text-[#012163]/50 hover:bg-[#F2F4FF]'
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        {variant.price && (
          <p className="text-xs text-[#012163]/50 mt-1 ml-1">
            Zobrazí se jako: <strong>{formatPrice(variant.price, variant.currency)}</strong> / měsíc bez DPH
          </p>
        )}
      </div>

      {/* Funkce */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-[#012163]/60 uppercase tracking-wide">
            Zahrnuté funkce ({variant.features.length}/{FEATURES.length})
          </label>
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-xs text-[#0D60FF] hover:underline">Vše</button>
            <button onClick={selectNone} className="text-xs text-[#012163]/40 hover:underline">Žádné</button>
          </div>
        </div>
        <div className="border border-[#E8EBFF] rounded-xl overflow-hidden">
          {FEATURES.map((feature, idx) => {
            const checked = variant.features.includes(idx);
            return (
              <label
                key={idx}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-[#E8EBFF] last:border-b-0
                  ${checked ? 'bg-[#F2F4FF]' : 'hover:bg-[#fafbff]'}`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all
                    ${checked ? 'bg-[#04EDB5]' : 'border-2 border-[#E8EBFF]'}`}
                >
                  {checked && (
                    <svg className="w-3 h-3 text-[#012163]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input type="checkbox" checked={checked} onChange={() => toggleFeature(idx)} className="sr-only" />
                <span className={`text-sm ${checked ? 'text-[#012163] font-medium' : 'text-[#012163]/50'}`}>
                  {feature}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Popis varianty */}
      <div>
        <label className="block text-xs font-semibold text-[#012163]/60 mb-1.5 uppercase tracking-wide">
          Doplňkový popis (volitelný)
        </label>
        <textarea
          value={variant.description}
          onChange={(e) => onChange({ ...variant, description: e.target.value })}
          placeholder="Např. ideální pro PR týmy s potřebou komplexního monitoringu…"
          rows={3}
          className="w-full border border-[#E8EBFF] rounded-xl px-4 py-2.5 text-[#012163] placeholder-[#012163]/30 focus:outline-none focus:border-[#0D60FF] focus:ring-2 focus:ring-[#0D60FF]/10 transition text-sm resize-none"
        />
      </div>
    </div>
  );
}
