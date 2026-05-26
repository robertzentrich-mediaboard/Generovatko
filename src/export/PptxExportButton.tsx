'use client';

import { useState } from 'react';
import { exportPptx } from './exportPptx';
import { OfferData, SalespersonData } from '@/lib/types';
import { imageUrlToDataUrl } from '@/lib/constants';

interface Props {
  offer: OfferData;
  salesperson: SalespersonData;
}

export default function PptxExportButton({ offer, salesperson }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const [logoBlue, logoWhite, screenshot, gradient] = await Promise.all([
        imageUrlToDataUrl('/logo-blue.png'),
        imageUrlToDataUrl('/logo-white.png'),
        imageUrlToDataUrl('/app-screenshot.png'),
        imageUrlToDataUrl('/bg-gradient.png'),
      ]);
      await exportPptx(offer, salesperson, { logoBlue, logoWhite, screenshot, gradient });
    } catch (e) {
      console.error('PPTX export error:', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex-1 py-3 border-2 border-[#E8EBFF] hover:border-[#012163]/30 text-[#012163] font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Generuji PPTX…
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Stáhnout PPTX
        </>
      )}
    </button>
  );
}
