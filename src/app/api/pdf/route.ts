import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer, Font } from '@react-pdf/renderer';
import path from 'path';
import React from 'react';
import PdfDocument from '@/export/PdfDocument';
import type { OfferData, SalespersonData } from '@/lib/types';

// Fonty registrujeme jednou – server má přístup k filesystému, žádné browser shenanigans
let _fontsRegistered = false;

function ensureFonts() {
  if (_fontsRegistered) return;
  const dir = path.join(process.cwd(), 'public', 'fonts');
  // Merged soubory (latin + latin-ext) → obsahují základní latinku i českou diakritiku
  Font.register({
    family: 'DMSans',
    fonts: [
      { src: path.join(dir, 'dm-sans-400-normal.woff'), fontWeight: 400 },
      { src: path.join(dir, 'dm-sans-700-normal.woff'), fontWeight: 700 },
      { src: path.join(dir, 'dm-sans-800-normal.woff'), fontWeight: 800 },
      { src: path.join(dir, 'dm-sans-400-italic.woff'), fontWeight: 400, fontStyle: 'italic' },
      { src: path.join(dir, 'dm-sans-700-italic.woff'), fontWeight: 700, fontStyle: 'italic' },
    ],
  });
  _fontsRegistered = true;
}

export async function POST(req: NextRequest) {
  try {
    ensureFonts();

    const body = await req.json() as { offer: OfferData; salesperson: SalespersonData };
    const { offer, salesperson } = body;

    // Obrázky jako file-path – server má přístup k public/
    const pub = path.join(process.cwd(), 'public');
    const images = {
      logoBlue: path.join(pub, 'logo-blue.png'),
      logoWhite: path.join(pub, 'logo-white.png'),
      screenshot: path.join(pub, 'app-screenshot.png'),
      gradient: path.join(pub, 'bg-gradient.png'),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(PdfDocument, {
      offer,
      salesperson,
      images,
      fontFamily: 'DMSans',
    }) as any;

    const buffer = await renderToBuffer(element);

    const safeName =
      offer.clientName.replace(/[^a-zA-Z0-9À-ɏ\s]/g, '').trim() || 'klient';
    const filename = `Nabídka Mediaboard – ${safeName}.pdf`;

    // Buffer extends Uint8Array – NextResponse akceptuje Uint8Array jako body
    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (err) {
    console.error('[PDF API] error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
