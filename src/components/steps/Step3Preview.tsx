'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { OfferData, SalespersonData } from '@/lib/types';
import TitleSlide from '@/components/preview/TitleSlide';
import VariantsSlide from '@/components/preview/VariantsSlide';
import ContactSlide from '@/components/preview/ContactSlide';

// Dynamický import exportů – pouze na straně klienta
const PdfExportButton  = dynamic(() => import('@/export/PdfExportButton'),  { ssr: false });
const PptxExportButton = dynamic(() => import('@/export/PptxExportButton'), { ssr: false });

interface Step3Props {
  offer: OfferData;
  salesperson: SalespersonData;
  onBack: () => void;
  onNewOffer: () => void;
}

export default function Step3Preview({ offer, salesperson, onBack, onNewOffer }: Step3Props) {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    { label: 'Titulní strana', component: <TitleSlide offer={offer} salesperson={salesperson} /> },
    { label: 'Cenová nabídka', component: <VariantsSlide offer={offer} /> },
    { label: 'Kontaktní strana', component: <ContactSlide salesperson={salesperson} /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Záhlaví kroku */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#012163] font-bold text-xl">Náhled nabídky</h2>
          <p className="text-[#012163]/50 text-sm mt-0.5">
            Nabídka pro <strong>{offer.clientName}</strong>
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-sm text-[#012163]/50 hover:text-[#012163] transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zpět k úpravám
        </button>
      </div>

      {/* Záložky slajdů */}
      <div className="flex gap-1 bg-[#F2F4FF] p-1 rounded-xl">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all
              ${activeSlide === i
                ? 'bg-white text-[#012163] shadow-sm'
                : 'text-[#012163]/50 hover:text-[#012163]/80'
              }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Náhled slajdu */}
      <div className="slide-wrapper rounded-xl shadow-lg">
        <div className="absolute inset-0">
          {slides[activeSlide].component}
        </div>
      </div>

      {/* Miniatury */}
      <div className="grid grid-cols-3 gap-3">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className={`slide-thumb rounded-lg overflow-hidden transition-all
              ${activeSlide === i ? 'ring-2 ring-[#012163] shadow-md' : 'ring-1 ring-[#E8EBFF] opacity-70 hover:opacity-100'}`}
          >
            <div className="absolute inset-0">
              {s.component}
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent p-1.5">
              <p className="text-white text-xs font-semibold">{s.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Export sekce */}
      <div className="bg-white rounded-2xl border border-[#E8EBFF] p-6 shadow-sm">
        <h3 className="text-[#012163] font-bold text-base mb-1">Stáhnout nabídku</h3>
        <p className="text-[#012163]/50 text-sm mb-5">
          Vygenerujte nabídku ve formátu PDF nebo PPTX pro odeslání klientovi.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <PdfExportButton  offer={offer} salesperson={salesperson} />
          <PptxExportButton offer={offer} salesperson={salesperson} />
        </div>
      </div>

      {/* Nová nabídka */}
      <div className="flex justify-center pb-4">
        <button
          onClick={onNewOffer}
          className="flex items-center gap-2 text-sm text-[#012163]/40 hover:text-[#012163] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Vytvořit novou nabídku
        </button>
      </div>
    </div>
  );
}
