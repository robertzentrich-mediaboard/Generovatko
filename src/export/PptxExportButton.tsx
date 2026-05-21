'use client';

import { useState } from 'react';
import { exportPptx } from './exportPptx';
import { OfferData, SalespersonData, ImageContext } from '@/lib/types';
import { imageUrlToDataUrl } from '@/lib/constants';

interface PptxExportButtonProps {
  offer: OfferData;
  salesperson: SalespersonData;
}

export default function PptxExportButton({ offer, salesperson }: PptxExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleExport() {
    setLoading(true);
    setError('');
    try {
      // Načtení statických obrázků jako base64 data URLs
      const [logoBlue, logoWhite, screenshot] = await Promise.all([
        imageUrlToDataUrl('/logo-blue.png'),
        imageUrlToDataUrl('/logo-white.png'),
        imageUrlToDataUrl('/app-screenshot.png'),
      ]);

      const images: ImageContext = { logoBlue, logoWhite, screenshot };
      await exportPptx(offer, salesperson, images);
    } catch (err) {
      console.error('Chyba při exportu PPTX:', err);
      setError('Export PPTX selhal. Zkuste to znovu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1">
      <button
        onClick={handleExport}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 bg-[#04EDB5] hover:bg-[#00C99A] disabled:opacity-60 text-[#012163] font-bold py-3.5 px-6 rounded-xl transition-all text-sm"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generuji PPTX…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Stáhnout PPTX
          </>
        )}
      </button>
      {error && <p className="text-red-500 text-xs mt-1 text-center">{error}</p>}
    </div>
  );
}
