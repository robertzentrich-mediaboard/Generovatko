// Export nabídky jako PPTX – věrná kopie PDF layoutu
// PDF = 720×405 px, PPTX = 10×5.625" → scale = 10/720 = 0.013889
import PptxGenJS from 'pptxgenjs';
import { FEATURES, formatDate, formatPrice } from '@/lib/constants';
import { ImageContext, OfferData, SalespersonData } from '@/lib/types';

// ─── Konstanty ────────────────────────────────────────────────────────────────
const NAVY   = '012163';
const TEAL   = '04EDB5';
const WHITE  = 'FFFFFF';
const BORDER = 'E8EBFF';

const W   = 10;      // šířka slajdu v palcích
const H   = 5.625;   // výška slajdu v palcích
const PAD = 0.361;   // vnitřní okraj (= 26 px v PDF)

// Logo ratio 1983 : 254 px
const LOGO_RATIO = 1983 / 254;
const logoH = (w: number) => +(w / LOGO_RATIO).toFixed(3);

// ─── Barvy bez alfa – pptxgenjs akceptuje pouze 6-znakový hex ─────────────────
// (WHITE + 'CC' = 8 znaků → pptxgenjs ho nezná → text by byl černý)

// Na tmavém (navy) pozadí:
const D_FEAT   = 'DDDDDD'; // text funkce      (≈ WHITE 87 %)
const D_MUTED  = '99AACC'; // "za měsíc…"      (≈ WHITE 55 %)
const D_SUBTLE = '6677AA'; // štítek slevy      (≈ WHITE 40 %)
const D_STRIKE = '7799BB'; // přeškrtnutá cena  (≈ WHITE 50 %)
const D_DIV    = '1F3A6E'; // oddělovač         (≈ WHITE 12 % na NAVY)

// Na světlém (bílém) pozadí:
const L_FEAT   = '1A3A7A'; // text funkce       (≈ NAVY 73 %)
const L_MUTED  = '5566AA'; // "za měsíc…"       (≈ NAVY 50 %)
const L_SUBTLE = '4455AA'; // štítek slevy      (≈ NAVY 60 %)
const L_STRIKE = '7788AA'; // přeškrtnutá cena  (≈ NAVY 55 %)

// Na kontaktní straně (tmavé pozadí):
const C_POS    = 'AABBDD'; // pozice obchodníka
const C_LABEL  = '99AACC'; // popisky T/E/W

// ─── Canvas helpers ────────────────────────────────────────────────────────────

/** Ořeže obrázek na čtverec (foto obchodníka – titulní strana). */
async function cropSquare(dataUrl: string): Promise<string> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const sx = (img.width  - size) / 2;
      const sy = (img.height - size) / 2;
      const c  = document.createElement('canvas');
      c.width = c.height = size;
      c.getContext('2d')!.drawImage(img, sx, sy, size, size, 0, 0, size, size);
      resolve(c.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/** Ořeže obrázek na daný poměr stran (object-fit: cover) – foto kontaktní strana. */
async function cropToAspect(dataUrl: string, tw: number, th: number): Promise<string> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const sr = img.width / img.height;
      const tr = tw / th;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (sr > tr) { sw = Math.round(img.height * tr); sx = Math.round((img.width  - sw) / 2); }
      else          { sh = Math.round(img.width  / tr); sy = Math.round((img.height - sh) / 2); }
      const c = document.createElement('canvas');
      c.width = sw; c.height = sh;
      c.getContext('2d')!.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      resolve(c.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/** Vycentruje obrázek v boxu bez ořezu (object-fit: contain) – screenshot. */
async function containInBox(
  dataUrl: string, bx: number, by: number, bw: number, bh: number,
): Promise<{ x: number; y: number; w: number; h: number }> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const ir = img.width / img.height;
      const br = bw / bh;
      let w: number, h: number;
      if (ir > br) { w = bw; h = bw / ir; }
      else         { h = bh; w = bh * ir; }
      resolve({ x: bx + (bw - w) / 2, y: by + (bh - h) / 2, w, h });
    };
    img.onerror = () => resolve({ x: bx, y: by, w: bw, h: bh });
    img.src = dataUrl;
  });
}

// ─── Hlavní export ─────────────────────────────────────────────────────────────
export async function exportPptx(
  offer: OfferData,
  salesperson: SalespersonData,
  images: ImageContext,
): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title  = `Nabídka Mediaboard – ${offer.clientName}`;
  pptx.author = salesperson.name || 'Mediaboard';

  await addTitleSlide(pptx, offer, salesperson, images);
  addVariantsSlide(pptx, offer, images);
  await addContactSlide(pptx, salesperson, images);

  const safe = offer.clientName.replace(/[^a-zA-Z0-9À-ɏ\s]/g, '').trim() || 'klient';
  await pptx.writeFile({ fileName: `Nabídka Mediaboard – ${safe}.pptx` });
}

// ─── Gradient pozadí ──────────────────────────────────────────────────────────
// Používáme stejný PNG jako PDF – garantuje identický vzhled
function addGradientBg(slide: PptxGenJS.Slide, gradient: string | undefined) {
  if (gradient) {
    // PNG přesně přes celý slajd (stejný jako PDF bg)
    slide.addImage({ data: gradient, x: 0, y: 0, w: W, h: H });
  } else {
    // Fallback: modrá barva (bez PNG)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    slide.addShape('rect' as any, {
      x: 0, y: 0, w: W, h: H,
      fill: { color: '0C64FC' },
      line: { color: '0C64FC', width: 0 },
    });
  }
}

// ─── Slide 1: Titulní ─────────────────────────────────────────────────────────
async function addTitleSlide(
  pptx: PptxGenJS,
  offer: OfferData,
  sp: SalespersonData,
  images: ImageContext,
) {
  const slide = pptx.addSlide();
  slide.background = { color: '0C64FC' };

  // Gradient pozadí (PNG = identické s PDF)
  addGradientBg(slide, images.gradient);

  // Screenshot (pravých 48 %, object-fit: contain)
  if (images.screenshot) {
    const rx  = W * 0.52;
    const rw  = W * 0.48;
    const pos = await containInBox(images.screenshot, rx, 0, rw, H);
    slide.addImage({ data: images.screenshot, x: pos.x, y: pos.y, w: pos.w, h: pos.h });
  }

  // Logo bílé
  const lw = 1.53;
  if (images.logoWhite) {
    slide.addImage({ data: images.logoWhite, x: PAD, y: PAD, w: lw, h: logoH(lw) });
  }

  const leftColW = W * 0.52 - 2 * PAD;

  // Headline (vertikálně vycentrovaný v levém sloupci)
  slide.addText(
    `Komplexní PR\nnástroj pro\n${offer.clientName || 'Název klienta'}`,
    {
      x: PAD, y: 1.55, w: leftColW, h: 1.45,
      color: WHITE, fontSize: 24, bold: true,
      lineSpacingMultiple: 1.2, breakLine: true, valign: 'middle',
    },
  );

  // Datum
  slide.addText(formatDate(offer.date), {
    x: PAD, y: 3.08, w: leftColW, h: 0.22,
    color: C_POS, fontSize: 8,
  });

  // Platnost
  slide.addText('Platnost nabídky je 30 dní', {
    x: PAD, y: 3.3, w: leftColW, h: 0.2,
    color: C_LABEL, fontSize: 7,
  });

  // Foto obchodníka (čtverec)
  const picSize = 0.61;
  if (sp.photo) {
    const sq = await cropSquare(sp.photo);
    slide.addImage({ data: sq, x: PAD, y: 4.28, w: picSize, h: picSize });
  }

  // Jméno
  slide.addText(sp.name || 'Obchodník', {
    x: PAD + picSize + 0.12, y: 4.3, w: leftColW - picSize - 0.12, h: 0.3,
    color: WHITE, fontSize: 11, bold: true,
  });

  // Pozice
  if (sp.position) {
    slide.addText(sp.position, {
      x: PAD + picSize + 0.12, y: 4.6, w: leftColW - picSize - 0.12, h: 0.25,
      color: C_POS, fontSize: 8.5,
    });
  }

  // Teal pill
  slide.addShape(pptx.ShapeType.roundRect, {
    x: PAD, y: 5.12, w: 1.85, h: 0.27,
    fill: { color: TEAL }, line: { color: TEAL }, rectRadius: 0.13,
  });
  slide.addText('www.mediaboard.com', {
    x: PAD, y: 5.12, w: 1.85, h: 0.27,
    color: NAVY, fontSize: 7, bold: true, align: 'center', valign: 'middle',
  });
}

// ─── Slide 2: Varianty ────────────────────────────────────────────────────────
function addVariantsSlide(pptx: PptxGenJS, offer: OfferData, images: ImageContext) {
  const slide = pptx.addSlide();
  slide.background = { color: WHITE };

  // Logo modré
  const lw = 1.25;
  if (images.logoBlue) {
    slide.addImage({ data: images.logoBlue, x: PAD, y: PAD * 0.9, w: lw, h: logoH(lw) });
  }

  const variants = offer.variants.slice(0, offer.variantCount);

  // Label
  slide.addText(`CENOVÁ NABÍDKA – ${variants.length === 1 ? '1 VARIANTA' : '2 VARIANTY'}`, {
    x: PAD, y: 0.57, w: 9, h: 0.18,
    color: '6677AA', fontSize: 6, bold: true, charSpacing: 2,
  });

  // v1 sety pro detekci "navíc" ve v2
  const v1Set = new Set(variants[0]?.features ?? []);
  const v1CustomSet = new Set(
    (variants[0]?.customServices ?? [])
      .filter(cs => cs.enabled && cs.text.trim())
      .map(cs => cs.text.trim()),
  );

  const cardTop = 0.82;
  const cardH   = H - cardTop - 0.26;
  const cardGap = 0.2;
  const totalW  = W - 2 * PAD;

  variants.forEach((v, i) => {
    const isDark = variants.length === 1 || (i === 1 && variants.length === 2);

    // 40/60 split při 2 variantách, plná šířka při 1
    let cardW: number, cardX: number;
    if (variants.length === 1) {
      cardW = totalW;
      cardX = PAD;
    } else {
      const lightW = (totalW - cardGap) * 0.4;
      const darkW  = (totalW - cardGap) * 0.6;
      cardW = isDark ? darkW : lightW;
      cardX = isDark ? PAD + (totalW - cardGap) * 0.4 + cardGap : PAD;
    }

    // Karta pozadí
    slide.addShape(pptx.ShapeType.roundRect, {
      x: cardX, y: cardTop, w: cardW, h: cardH,
      fill: { color: isDark ? NAVY : WHITE },
      line: isDark ? { color: NAVY, width: 0 } : { color: BORDER, width: 1.5 },
      rectRadius: 0.1,
    });

    const p      = 0.2;
    const BADGE_H = 0.21;
    const badgeY  = cardTop + p;
    let y = badgeY + BADGE_H;

    // Badge "DOPORUČUJEME"
    if (isDark) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: cardX + p, y: badgeY, w: 1.02, h: 0.17,
        fill: { color: TEAL }, line: { color: TEAL }, rectRadius: 0.08,
      });
      slide.addText('DOPORUČUJEME', {
        x: cardX + p, y: badgeY, w: 1.02, h: 0.17,
        color: NAVY, fontSize: 5.5, bold: true, align: 'center', valign: 'middle',
      });
    }

    const iw        = cardW - 2 * p;
    const nameColW  = iw * 0.54;
    const priceColW = iw * 0.43;
    const priceColX = cardX + cardW - p - priceColW;

    // Název (levý sloupec)
    slide.addText(v.name || 'Varianta', {
      x: cardX + p, y, w: nameColW, h: 0.32,
      color: isDark ? WHITE : NAVY, fontSize: 13, bold: true, valign: 'top',
    });

    // Popis pod názvem
    if (v.description) {
      slide.addText(v.description, {
        x: cardX + p, y: y + 0.31, w: nameColW, h: 0.2,
        color: isDark ? D_MUTED : L_MUTED, fontSize: 6.5, italic: true,
      });
    }

    // Cena (pravý sloupec, vpravo)
    let py = y;
    if (v.discountEnabled && v.discountFinalPrice) {
      slide.addText(formatPrice(v.price, v.currency), {
        x: priceColX, y: py, w: priceColW, h: 0.2,
        color: isDark ? D_STRIKE : L_STRIKE, fontSize: 11, strike: true, align: 'right',
      });
      py += 0.19;
      slide.addText(`−${v.discountPercent} %`, {
        x: priceColX, y: py, w: priceColW, h: 0.15,
        color: isDark ? D_SUBTLE : L_SUBTLE, fontSize: 7.5, align: 'right',
      });
      py += 0.14;
      slide.addText(formatPrice(v.discountFinalPrice, v.currency), {
        x: priceColX, y: py, w: priceColW, h: 0.3,
        color: isDark ? TEAL : NAVY, fontSize: 15, bold: true, align: 'right',
      });
      py += 0.29;
    } else {
      slide.addText(formatPrice(v.price, v.currency), {
        x: priceColX, y: py, w: priceColW, h: 0.32,
        color: isDark ? TEAL : NAVY, fontSize: 16, bold: true, align: 'right',
      });
      py += 0.31;
    }
    slide.addText('za měsíc bez DPH', {
      x: priceColX, y: py, w: priceColW, h: 0.17,
      color: isDark ? D_MUTED : L_MUTED, fontSize: 7, align: 'right',
    });
    py += 0.17;

    // y = max výška obou sloupců
    const nameBlockH = v.description ? 0.51 : 0.32;
    y += Math.max(nameBlockH, py - y);
    y += 0.09;

    // Oddělovač
    slide.addShape(pptx.ShapeType.rect, {
      x: cardX + p, y, w: iw, h: 0.01,
      fill: { color: isDark ? D_DIV : BORDER },
      line: { color: isDark ? D_DIV : BORDER },
    });
    y += 0.09;

    // ── Funkce ──────────────────────────────────────────────────────────────
    const feats = v.features
      .slice().sort((a, b) => a - b)
      .map(idx => ({
        label: FEATURES[idx] as string,
        isExtra: isDark && variants.length === 2 && !v1Set.has(idx),
      }))
      .filter(f => Boolean(f.label));

    const customFeats = (v.customServices ?? [])
      .filter(cs => cs.enabled && cs.text.trim())
      .map(cs => ({
        label: cs.text.trim(),
        isExtra: isDark && variants.length === 2 && !v1CustomSet.has(cs.text.trim()),
      }));

    const sortedFeats = [
      ...feats.filter(f => !f.isExtra),
      ...customFeats.filter(f => !f.isExtra),
      ...feats.filter(f => f.isExtra),
      ...customFeats.filter(f => f.isExtra),
    ];

    const availH    = cardTop + cardH - y - 0.18;
    const rowH      = 0.183;
    const maxPerCol = Math.floor(availH / rowH);
    const col1      = sortedFeats.slice(0, maxPerCol);
    const col2      = sortedFeats.slice(maxPerCol, maxPerCol * 2);

    const parts = (feat: { label: string; isExtra: boolean }) => [
      { text: feat.isExtra ? '+  ' : '✓  ', options: { color: TEAL, bold: true } },
      {
        text: feat.label,
        options: {
          color: feat.isExtra ? TEAL : (isDark ? D_FEAT : L_FEAT),
          bold: true,
        },
      },
    ];

    if (col2.length > 0) {
      const colGap = 0.08;
      const cw = (iw - colGap) / 2;
      col1.forEach((f, fi) => slide.addText(parts(f), {
        x: cardX + p, y: y + fi * rowH, w: cw, h: rowH, fontSize: 9, valign: 'middle',
      }));
      col2.forEach((f, fi) => slide.addText(parts(f), {
        x: cardX + p + cw + colGap, y: y + fi * rowH, w: cw, h: rowH, fontSize: 9, valign: 'middle',
      }));
    } else {
      col1.forEach((f, fi) => slide.addText(parts(f), {
        x: cardX + p, y: y + fi * rowH, w: iw, h: rowH, fontSize: 9, valign: 'middle',
      }));
    }
  });
}

// ─── Slide 3: Kontakt ─────────────────────────────────────────────────────────
async function addContactSlide(
  pptx: PptxGenJS,
  sp: SalespersonData,
  images: ImageContext,
) {
  const slide = pptx.addSlide();
  slide.background = { color: '0C64FC' };

  // Gradient pozadí (PNG = identické s PDF)
  addGradientBg(slide, images.gradient);

  // Foto obchodníka (pravých 44 %, object-fit: cover)
  const leftW  = W * 0.56;
  const photoW = W - leftW;
  if (sp.photo) {
    const cropped = await cropToAspect(sp.photo, photoW, H);
    slide.addImage({ data: cropped, x: leftW, y: 0, w: photoW, h: H });
  }

  // Logo bílé
  const lw = 1.25;
  if (images.logoWhite) {
    slide.addImage({ data: images.logoWhite, x: PAD, y: PAD, w: lw, h: logoH(lw) });
  }

  // Headline
  slide.addText('Posuňte svou komunikaci\nna další úroveň.', {
    x: PAD, y: 0.88, w: leftW - 2 * PAD, h: 1.1,
    color: WHITE, fontSize: 22, bold: true, lineSpacingMultiple: 1.2, breakLine: true,
  });

  // ── Spodní blok: jméno + kontakty + pill ──────────────────────────────────
  // Výška se počítá zdola, aby nedošlo k překrytí pill pilulkou
  const pillH    = 0.27;
  const pillGap  = 0.16;          // mezera mezi posledním kontaktem a pilulkou
  const pillY    = H - PAD - pillH;

  // Výpočet výšky celého spodního bloku (odspodu nahoru)
  const rowH      = 0.25;
  const contactCount = (sp.phone ? 1 : 0) + (sp.email ? 1 : 0) + 1; // vždy W
  const contactsH = contactCount * rowH;
  const nameH     = 0.34;
  const posH      = sp.position ? 0.26 : 0;
  const spacerH   = 0.15; // mezera před kontakty

  const blockH   = nameH + posH + spacerH + contactsH;
  const blockTop = pillY - pillGap - blockH;

  let cy = blockTop;

  // Jméno
  slide.addText(sp.name || 'Jméno obchodníka', {
    x: PAD, y: cy, w: leftW - 2 * PAD, h: nameH,
    color: WHITE, fontSize: 15, bold: true,
  });
  cy += nameH;

  // Pozice
  if (sp.position) {
    slide.addText(sp.position, {
      x: PAD, y: cy, w: leftW - 2 * PAD, h: posH,
      color: C_POS, fontSize: 10.5,
    });
    cy += posH;
  }

  cy += spacerH;

  // Kontaktní řádky T / E / W
  const contacts: [string, string][] = [];
  if (sp.phone) contacts.push(['T:', sp.phone]);
  if (sp.email) contacts.push(['E:', sp.email]);
  contacts.push(['W:', 'www.mediaboard.com']);

  contacts.forEach(([label, val]) => {
    slide.addText(label, {
      x: PAD, y: cy, w: 0.22, h: rowH,
      color: C_LABEL, fontSize: 9.5, bold: true,
    });
    slide.addText(val, {
      x: PAD + 0.23, y: cy, w: leftW - 2 * PAD - 0.23, h: rowH,
      color: WHITE, fontSize: 9.5,
    });
    cy += rowH;
  });

  // Navy pill (vždy na pevné pozici u spodního okraje)
  slide.addShape(pptx.ShapeType.roundRect, {
    x: PAD, y: pillY, w: 1.85, h: pillH,
    fill: { color: NAVY }, line: { color: NAVY }, rectRadius: 0.13,
  });
  slide.addText('www.mediaboard.com', {
    x: PAD, y: pillY, w: 1.85, h: pillH,
    color: WHITE, fontSize: 7, bold: true, align: 'center', valign: 'middle',
  });
}
