// Export nabídky jako PPTX pomocí pptxgenjs
// Funguje kompletně na straně klienta (browser)
import PptxGenJS from 'pptxgenjs';
import { FEATURES, formatDate, formatPrice } from '@/lib/constants';
import { ImageContext, OfferData, SalespersonData } from '@/lib/types';

const NAVY = '012163';
const TEAL = '04EDB5';
const WHITE = 'FFFFFF';
const LIGHT = 'F2F4FF';
const BORDER = 'E8EBFF';

// Rozměry slajdu v palcích (16:9 = 10 × 5.625)
const W = 10;
const H = 5.625;

// Poměr stran loga (1983 × 254 px)
const LOGO_RATIO = 1983 / 254;
const logoH = (w: number) => Math.round((w / LOGO_RATIO) * 1000) / 1000;

/**
 * Ořeže obrázek (data URL) tak, aby přesně odpovídal poměru stran cílového boxu.
 * Chová se jako CSS object-fit: cover – vždy ořez ze středu, bez deformace.
 *
 * pptxgenjs má bug v sizing: { type: 'cover' } – imgWidth/imgHeight jsou vždy
 * shodné s rozměry boxu, takže srcRect je vždy l=0 r=0 t=0 b=0 → žádný ořez
 * → obrázek se prostě roztáhne. Tento helper problém obchází tím, že ořez
 * provedeme sami v canvasu ještě před předáním pptxgenjs.
 */
async function cropToAspect(dataUrl: string, boxW: number, boxH: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const srcRatio = img.width / img.height;
      const tgtRatio = boxW / boxH;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;

      if (srcRatio > tgtRatio) {
        // Obrázek je širší než cíl → ořez boky
        sw = Math.round(img.height * tgtRatio);
        sx = Math.round((img.width - sw) / 2);
      } else {
        // Obrázek je vyšší než cíl → ořez nahoru/dolů
        sh = Math.round(img.width / tgtRatio);
        sy = Math.round((img.height - sh) / 2);
      }

      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => resolve(dataUrl); // fallback: original
    img.src = dataUrl;
  });
}

/**
 * Vrátí pozici a rozměry obrázku umístěného v boxu jako CSS object-fit: contain.
 * Obrázek se NEOŘEZÁVÁ – zobrazí se celý, vycentrovaný v boxu.
 */
async function containInBox(
  dataUrl: string,
  boxX: number, boxY: number, boxW: number, boxH: number,
): Promise<{ x: number; y: number; w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const imgRatio = img.width / img.height;
      const boxRatio = boxW / boxH;
      let w: number, h: number;
      if (imgRatio > boxRatio) {
        // Obrázek je širší → zarovnat na šířku
        w = boxW;
        h = boxW / imgRatio;
      } else {
        // Obrázek je vyšší → zarovnat na výšku
        h = boxH;
        w = boxH * imgRatio;
      }
      resolve({
        x: boxX + (boxW - w) / 2,
        y: boxY + (boxH - h) / 2,
        w,
        h,
      });
    };
    img.onerror = () => resolve({ x: boxX, y: boxY, w: boxW, h: boxH });
    img.src = dataUrl;
  });
}

export async function exportPptx(
  offer: OfferData,
  salesperson: SalespersonData,
  images: ImageContext,
): Promise<void> {
  const pptx = new PptxGenJS();
  // Vestavěný LAYOUT_16x9 = 10 × 5.625" – custom layout name způsoboval fallback na 4:3
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = `Nabídka Mediaboard – ${offer.clientName}`;
  pptx.author = salesperson.name || 'Mediaboard';

  await addTitleSlide(pptx, offer, salesperson, images);
  addVariantsSlide(pptx, offer, images);
  await addContactSlide(pptx, salesperson, images);

  const safeName = offer.clientName.replace(/[^a-zA-Z0-9À-ɏ\s]/g, '').trim() || 'klient';
  await pptx.writeFile({ fileName: `Nabídka Mediaboard – ${safeName}.pptx` });
}

// ─── Slide 1: Titulní ────────────────────────────────────────────────────────
async function addTitleSlide(
  pptx: PptxGenJS,
  offer: OfferData,
  salesperson: SalespersonData,
  images: ImageContext,
) {
  const slide = pptx.addSlide();
  // Fallback barva pozadí
  slide.background = { color: '0C64FC' };

  // Gradient pozadí – celý slide (#0C64FC → #05E9B6, úhlopříčně)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: W, h: H,
    fill: {
      type: 'gradient',
      gradType: 'linear',
      angle: 135,
      stops: [
        { color: '0C64FC', position: 0 },
        { color: '05E9B6', position: 100 },
      ],
    } as any,
    line: { color: '0C64FC', width: 0 },
  });

  // Screenshot aplikace – pravá strana (48% šířky), celý obrázek (contain, bez ořezu)
  if (images.screenshot) {
    const scrW = W * 0.48;
    const pos = await containInBox(images.screenshot, W * 0.52, 0, scrW, H);
    slide.addImage({ data: images.screenshot, x: pos.x, y: pos.y, w: pos.w, h: pos.h });
  }

  // Logo bílé – levý horní roh
  if (images.logoWhite) {
    const lw = 1.53;
    slide.addImage({ data: images.logoWhite, x: 0.36, y: 0.36, w: lw, h: logoH(lw) });
  }

  // Headline "Komplexní PR\nnástroj pro\n[klient]"
  slide.addText(
    `Komplexní PR\nnástroj pro\n${offer.clientName || 'Název klienta'}`,
    {
      x: 0.36, y: 1.6, w: 4.48, h: 1.5,
      color: WHITE,
      fontSize: 22,
      bold: true,
      lineSpacingMultiple: 1.2,
      breakLine: true,
    },
  );

  // Datum
  slide.addText(formatDate(offer.date), {
    x: 0.36, y: 3.22, w: 4.48, h: 0.28,
    color: WHITE + '99',
    fontSize: 8,
  });

  // Foto obchodníka – zaoblený čtverec (1:1 ořez, bez kruhu)
  if (salesperson.photo) {
    const cropped = await cropToAspect(salesperson.photo, 1, 1);
    slide.addImage({
      data: cropped,
      x: 0.36, y: 4.2, w: 0.61, h: 0.61,
    });
  }

  // Jméno obchodníka
  slide.addText(salesperson.name || 'Obchodník', {
    x: 1.1, y: 4.22, w: 3.5, h: 0.30,
    color: WHITE,
    fontSize: 11,
    bold: true,
  });

  // Pozice
  if (salesperson.position) {
    slide.addText(salesperson.position, {
      x: 1.1, y: 4.52, w: 3.5, h: 0.25,
      color: WHITE + '99',
      fontSize: 8.5,
    });
  }

  // Teal WWW pill
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.36, y: 5.1, w: 1.8, h: 0.26,
    fill: { color: TEAL },
    line: { color: TEAL },
    rectRadius: 0.13,
  });
  slide.addText('www.mediaboard.com', {
    x: 0.36, y: 5.1, w: 1.8, h: 0.26,
    color: NAVY,
    fontSize: 7,
    bold: true,
    align: 'center',
    valign: 'middle',
  });
}

// ─── Slide 2: Varianty ───────────────────────────────────────────────────────
function addVariantsSlide(pptx: PptxGenJS, offer: OfferData, images: ImageContext) {
  const slide = pptx.addSlide();
  slide.background = { color: WHITE };

  // Logo modré (správný poměr stran)
  if (images.logoBlue) {
    const lw = 1.3;
    slide.addImage({ data: images.logoBlue, x: 0.38, y: 0.32, w: lw, h: logoH(lw) });
  }

  // Label
  slide.addText(`CENOVÁ NABÍDKA – ${offer.variantCount === 1 ? '1 VARIANTA' : '2 VARIANTY'}`, {
    x: 0.38, y: 0.55, w: 9, h: 0.2,
    color: NAVY + '50',
    fontSize: 6.5,
    bold: true,
    charSpacing: 2,
  });

  const variants = offer.variants.slice(0, offer.variantCount);
  const cardTop = 0.85;
  const cardH = H - cardTop - 0.3;
  // Množina indexů standardních funkcí v1 – pro detekci "navíc" ve v2
  const v1Set = new Set(variants[0]?.features ?? []);
  // Množina textů custom služeb v1 – pro detekci "navíc" ve v2
  const v1CustomSet = new Set(
    (variants[0]?.customServices ?? [])
      .filter(cs => cs.enabled && cs.text.trim())
      .map(cs => cs.text.trim())
  );

  variants.forEach((v, i) => {
    const isDark = i === 1 && variants.length === 2;
    const cardW = variants.length === 2 ? 4.55 : 7;
    const cardX = variants.length === 2 ? 0.38 + i * (4.55 + 0.24) : 1.5;

    // Karta pozadí
    if (isDark) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: cardX, y: cardTop, w: cardW, h: cardH,
        fill: { color: NAVY },
        line: { color: NAVY },
        rectRadius: 0.12,
      });
    } else {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: cardX, y: cardTop, w: cardW, h: cardH,
        fill: { color: WHITE },
        line: { color: BORDER, width: 1.5 },
        rectRadius: 0.12,
      });
    }

    const pad = 0.22;
    // Fixní výška badge oblasti pro obě karty → název/cena/funkce jsou vždy na stejné Y
    const BADGE_ROW_H = variants.length === 2 ? 0.24 : 0;
    const badgeY = cardTop + pad;
    let yPos = badgeY + BADGE_ROW_H;

    // "Doporučujeme" badge – kreslíme jen pro druhou kartu, ale místo je rezervováno v obou
    if (isDark) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: cardX + pad, y: badgeY, w: 1.05, h: 0.19,
        fill: { color: TEAL },
        line: { color: TEAL },
        rectRadius: 0.09,
      });
      slide.addText('DOPORUČUJEME', {
        x: cardX + pad, y: badgeY, w: 1.05, h: 0.19,
        color: NAVY, fontSize: 5.5, bold: true, align: 'center', valign: 'middle',
      });
    }

    // Název varianty – začíná na stejné Y v obou kartách
    slide.addText(v.name || 'Varianta', {
      x: cardX + pad, y: yPos, w: cardW - 2 * pad, h: 0.35,
      color: isDark ? WHITE : NAVY,
      fontSize: 14, bold: true,
    });
    yPos += 0.35;

    // Cena – se slevou nebo bez
    if (v.discountEnabled && v.discountFinalPrice) {
      // Původní cena přeškrtnutá, menším písmem
      slide.addText(formatPrice(v.price, v.currency), {
        x: cardX + pad, y: yPos, w: cardW - 2 * pad, h: 0.3,
        color: (isDark ? WHITE : NAVY) + '66',
        fontSize: 13,
        strike: true,
      });
      yPos += 0.29;
      // Popis slevy
      slide.addText(`Finální cena po slevě  •  −${v.discountPercent} %`, {
        x: cardX + pad, y: yPos, w: cardW - 2 * pad, h: 0.2,
        color: (isDark ? WHITE : NAVY) + '77',
        fontSize: 7.5,
      });
      yPos += 0.2;
      // Cena po slevě – plná velikost
      slide.addText(formatPrice(v.discountFinalPrice, v.currency), {
        x: cardX + pad, y: yPos, w: cardW - 2 * pad, h: 0.4,
        color: isDark ? TEAL : NAVY,
        fontSize: 18, bold: true,
      });
      yPos += 0.38;
    } else {
      slide.addText(formatPrice(v.price, v.currency), {
        x: cardX + pad, y: yPos, w: cardW - 2 * pad, h: 0.4,
        color: isDark ? TEAL : NAVY,
        fontSize: 18, bold: true,
      });
      yPos += 0.38;
    }

    // Podtext ceny
    slide.addText('za měsíc bez DPH', {
      x: cardX + pad, y: yPos, w: cardW - 2 * pad, h: 0.2,
      color: (isDark ? WHITE : NAVY) + '50',
      fontSize: 7,
    });
    yPos += 0.24;

    // Oddělovač
    slide.addShape(pptx.ShapeType.rect, {
      x: cardX + pad, y: yPos, w: cardW - 2 * pad, h: 0.01,
      fill: { color: isDark ? WHITE + '20' : BORDER },
      line: { color: isDark ? WHITE + '20' : BORDER },
    });
    yPos += 0.1;

    // Standardní funkce – každá položka: { label, isExtra }
    const feats = v.features
      .slice()
      .sort((a, b) => a - b)
      .map(idx => ({ label: FEATURES[idx] as string, isExtra: isDark && !v1Set.has(idx) }))
      .filter(f => Boolean(f.label));

    // Custom služby: pouze enabled s neprázdným textem
    const customFeats = (v.customServices ?? [])
      .filter(cs => cs.enabled && cs.text.trim())
      .map(cs => ({
        label: cs.text.trim(),
        isExtra: isDark && !v1CustomSet.has(cs.text.trim()),
      }));

    // Sdílené standardní → sdílené custom → extra standardní → extra custom
    const sortedFeats = [
      ...feats.filter(f => !f.isExtra),
      ...customFeats.filter(f => !f.isExtra),
      ...feats.filter(f => f.isExtra),
      ...customFeats.filter(f => f.isExtra),
    ];

    const availH = cardTop + cardH - yPos - 0.25;
    const rowH = 0.2;
    // Kolik řádků se vejde do jednoho sloupce
    const maxRowsPerCol = Math.floor(availH / rowH);
    // Plnění zleva: col1 zaplníme na maximum, zbytek do col2
    const col1 = sortedFeats.slice(0, maxRowsPerCol);
    const col2 = sortedFeats.slice(maxRowsPerCol, maxRowsPerCol * 2);

    // Helper: sestaví pole textových částí pro jednu položku
    const featParts = (feat: { label: string; isExtra: boolean }) => [
      { text: feat.isExtra ? '+  ' : '✓  ', options: { color: TEAL, bold: true } },
      {
        text: feat.label,
        options: {
          color: feat.isExtra ? TEAL : (isDark ? WHITE + 'CC' : NAVY + 'BB'),
          bold: true, // všechny položky tučně
        },
      },
    ];

    if (col2.length > 0) {
      // Dvousloupcový layout – col1 zaplněn, zbytek do col2
      const gap = 0.1;
      const colW = (cardW - 2 * pad - gap) / 2;

      col1.forEach((feat, fi) => {
        slide.addText(featParts(feat), {
          x: cardX + pad, y: yPos + fi * rowH, w: colW, h: rowH,
          fontSize: 10, valign: 'middle',
        });
      });
      col2.forEach((feat, fi) => {
        slide.addText(featParts(feat), {
          x: cardX + pad + colW + gap, y: yPos + fi * rowH, w: colW, h: rowH,
          fontSize: 10, valign: 'middle',
        });
      });
    } else {
      // Jednosloupec – vše se vejde do col1
      col1.forEach((feat, fi) => {
        slide.addText(featParts(feat), {
          x: cardX + pad, y: yPos + fi * rowH, w: cardW - 2 * pad, h: rowH,
          fontSize: 10, valign: 'middle',
        });
      });
    }
  });
}

// ─── Slide 3: Kontakt ─────────────────────────────────────────────────────────
async function addContactSlide(pptx: PptxGenJS, salesperson: SalespersonData, images: ImageContext) {
  const slide = pptx.addSlide();
  // Fallback barva pozadí
  slide.background = { color: '0C64FC' };

  // Gradient pozadí – celý slide
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: W, h: H,
    fill: {
      type: 'gradient',
      gradType: 'linear',
      angle: 135,
      stops: [
        { color: '0C64FC', position: 0 },
        { color: '05E9B6', position: 100 },
      ],
    } as any,
    line: { color: '0C64FC', width: 0 },
  });

  // Foto obchodníka – pravá strana (44% šířky), plná výška
  const leftW = W * 0.56;
  const photoW = W - leftW;
  if (salesperson.photo) {
    const cropped = await cropToAspect(salesperson.photo, photoW, H);
    slide.addImage({ data: cropped, x: leftW, y: 0, w: photoW, h: H });
  }

  // Logo bílé
  if (images.logoWhite) {
    const lw = 1.25;
    slide.addImage({ data: images.logoWhite, x: 0.36, y: 0.36, w: lw, h: logoH(lw) });
  }

  // Hlavní nadpis
  slide.addText('Posuňte svou komunikaci\nna další úroveň.', {
    x: 0.36, y: 0.75, w: leftW - 0.56, h: 1.0,
    color: WHITE,
    fontSize: 18,
    bold: true,
    lineSpacingMultiple: 1.2,
    breakLine: true,
  });

  // Jméno
  slide.addText(salesperson.name || 'Jméno obchodníka', {
    x: 0.36, y: 2.1, w: leftW - 0.56, h: 0.38,
    color: WHITE,
    fontSize: 13,
    bold: true,
  });

  // Pozice
  if (salesperson.position) {
    slide.addText(salesperson.position, {
      x: 0.36, y: 2.47, w: leftW - 0.56, h: 0.28,
      color: WHITE + '99',
      fontSize: 9,
    });
  }

  // Kontaktní údaje
  const contacts: [string, string][] = [];
  if (salesperson.phone) contacts.push(['T:', salesperson.phone]);
  if (salesperson.email) contacts.push(['E:', salesperson.email]);
  contacts.push(['W:', 'www.mediaboard.com']);

  contacts.forEach(([label, val], idx) => {
    const y = 2.95 + idx * 0.28;
    slide.addText(label, { x: 0.36, y, w: 0.22, h: 0.22, color: WHITE + '80', fontSize: 8, bold: true });
    slide.addText(val, { x: 0.60, y, w: leftW - 0.8, h: 0.22, color: WHITE, fontSize: 8 });
  });

  // Navy pill (tmavý) – bottom-left
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.36, y: H - 0.55, w: 1.8, h: 0.26,
    fill: { color: NAVY },
    line: { color: NAVY },
    rectRadius: 0.13,
  });
  slide.addText('www.mediaboard.com', {
    x: 0.36, y: H - 0.55, w: 1.8, h: 0.26,
    color: WHITE, fontSize: 7, bold: true, align: 'center', valign: 'middle',
  });
}
