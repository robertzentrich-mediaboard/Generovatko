'use client';

import { useState } from 'react';
import { OfferData, SalespersonData } from '@/lib/types';

interface PdfExportButtonProps {
  offer: OfferData;
  salesperson: SalespersonData;
}

export default function PdfExportButton({ offer, salesperson }: PdfExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleExport() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer, salesperson }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName =
        offer.clientName.replace(/[^a-zA-Z0-9À-ɏ\s]/g, '').trim() || 'klient';
      a.href = url;
      a.download = `Nabídka Mediaboard – ${safeName}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Export selhal: ${msg.slice(0, 120)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1">
      <button
        onClick={handleExport}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 bg-[#012163] hover:bg-[#011040] disabled:opacity-60 text-white font-bold py-3.5 px-6 rounded-xl transition-all text-sm"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generuji PDF…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Stáhnout PDF
          </>
        )}
      </button>
      {error && <p className="text-red-500 text-xs mt-1 text-center">{error}</p>}
    </div>
  );
}
