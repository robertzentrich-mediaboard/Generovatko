'use client';

import { FEATURES, formatPrice } from '@/lib/constants';
import { OfferData, VariantData } from '@/lib/types';

interface VariantsSlideProps {
  offer: OfferData;
}

export default function VariantsSlide({ offer }: VariantsSlideProps) {
  const variants = offer.variants.slice(0, offer.variantCount);
  // Množina indexů funkcí v1 – pro detekci "navíc" ve v2
  const v1Set = new Set(variants[0]?.features ?? []);
  // Množina textů custom služeb v1 – pro detekci "navíc" ve v2
  const v1CustomSet = new Set(
    (variants[0]?.customServices ?? [])
      .filter(cs => cs.enabled && cs.text.trim())
      .map(cs => cs.text.trim())
  );

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden select-none"
         style={{ padding: '3.5%' }}>
      {/* Logo */}
      <div className="mb-[2%]">
        <img src="/logo-blue.png" alt="Mediaboard"
             style={{ height: 'clamp(22px, 3.8cqw, 42px)', width: 'auto', display: 'block' }} />
      </div>

      {/* Nadpis sekce */}
      <p className="text-[#012163]/40 font-semibold uppercase tracking-widest mb-[1.5%]"
         style={{ fontSize: 'clamp(6px, 1cqw, 11px)' }}>
        Cenová nabídka – {variants.length === 1 ? '1 varianta' : '2 varianty'}
      </p>

      {/* Grid variant – 40/60 při 2 variantách, plná šířka při 1 */}
      <div
        className="flex-1 min-h-0"
        style={variants.length === 2
          ? { display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '2.5%' }
          : { display: 'grid', gridTemplateColumns: '1fr' }
        }
      >
        {variants.map((v, i) => {
          // Tmavá karta: vždy při 1 variantě, nebo 2. karta při 2 variantách
          const isDark = variants.length === 1 || (i === 1 && variants.length === 2);
          return (
            <VariantCard
              key={i}
              variant={v}
              highlight={isDark}
              // isExtra detekce jen při 2 variantách
              v1Set={isDark && variants.length === 2 ? v1Set : null}
              v1CustomSet={isDark && variants.length === 2 ? v1CustomSet : null}
              // Badge oblast vždy viditelná (u tmavé = badge, u světlé = prázdný spacer pro zarovnání)
              showBadgeRow={true}
            />
          );
        })}
      </div>
    </div>
  );
}

interface VariantCardProps {
  variant: VariantData;
  highlight: boolean;
  v1Set: Set<number> | null;       // null = není potřeba rozlišovat extras
  v1CustomSet: Set<string> | null; // null = není potřeba rozlišovat extras (custom)
  showBadgeRow: boolean;           // true = rezervovat místo pro badge v obou kartách
}

function VariantCard({ variant, highlight, v1Set, v1CustomSet, showBadgeRow }: VariantCardProps) {
  // Standardní funkce: { label, isExtra }
  const feats = variant.features
    .slice()
    .sort((a, b) => a - b)
    .map(idx => ({
      label: FEATURES[idx] as string,
      isExtra: v1Set !== null && !v1Set.has(idx),
    }))
    .filter(f => Boolean(f.label));

  // Custom služby: pouze enabled s neprázdným textem
  const customFeats = (variant.customServices ?? [])
    .filter(cs => cs.enabled && cs.text.trim())
    .map(cs => ({
      label: cs.text.trim(),
      isExtra: v1CustomSet !== null && !v1CustomSet.has(cs.text.trim()),
    }));

  // Sdílené standardní → sdílené custom → extra standardní → extra custom
  const sorted = [
    ...feats.filter(f => !f.isExtra),
    ...customFeats.filter(f => !f.isExtra),
    ...feats.filter(f => f.isExtra),
    ...customFeats.filter(f => f.isExtra),
  ];

  // Plnění zleva: col1 prvních 13, col2 zbytek
  const COL_MAX = 13;
  const col1 = sorted.slice(0, COL_MAX);
  const col2 = sorted.slice(COL_MAX);
  const twoColumns = col2.length > 0;

  const featSize = 'clamp(7px, 1.35cqw, 15px)';

  const renderFeat = (f: { label: string; isExtra: boolean }, i: number) => (
    <div key={i} className="flex items-start gap-[2%] mb-[1%]" style={{ fontSize: featSize }}>
      <span className="text-[#04EDB5] flex-shrink-0 font-extrabold leading-tight">
        {f.isExtra ? '+' : '✓'}
      </span>
      <span
        className={`font-bold leading-tight ${
          f.isExtra
            ? 'text-[#04EDB5]'
            : highlight ? 'text-white/90' : 'text-[#012163]/85'
        }`}
      >
        {f.label}
      </span>
    </div>
  );

  return (
    <div
      className={`flex flex-col rounded-xl h-full overflow-hidden
        ${highlight
          ? 'bg-[#012163] text-white shadow-xl'
          : 'border-2 border-[#E8EBFF] bg-white text-[#012163]'
        }`}
      style={{ padding: '5%' }}
    >
      {/* Badge oblast – fixní výška v obou kartách → název/cena začínají na stejné výšce */}
      {showBadgeRow && (
        <div style={{ height: 'clamp(14px, 2.2cqw, 22px)', marginBottom: '2%', flexShrink: 0 }}>
          {highlight && (
            <span
              className="inline-block bg-[#04EDB5] text-[#012163] font-bold rounded-full"
              style={{ fontSize: 'clamp(5px, 0.85cqw, 10px)', padding: '2px 8px' }}
            >
              DOPORUČUJEME
            </span>
          )}
        </div>
      )}

      {/* Název varianty */}
      <h3
        className="font-extrabold leading-tight"
        style={{ fontSize: 'clamp(10px, 2cqw, 22px)' }}
      >
        {variant.name || 'Varianta'}
      </h3>

      {/* Cena – se slevou nebo bez */}
      {(variant.discountEnabled && variant.discountFinalPrice) ? (
        <div className="mt-1.5">
          <span
            className={`line-through ${highlight ? 'text-white/40' : 'text-[#012163]/40'}`}
            style={{ fontSize: 'clamp(10px, 1.9cqw, 22px)' }}
          >
            {formatPrice(variant.price, variant.currency)}
          </span>
          <div
            className={`${highlight ? 'text-white/55' : 'text-[#012163]/55'}`}
            style={{ fontSize: 'clamp(6px, 1.05cqw, 12px)' }}
          >
            {`Finální cena po slevě  •  −${variant.discountPercent} %`}
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`font-extrabold ${highlight ? 'text-[#04EDB5]' : 'text-[#012163]'}`}
              style={{ fontSize: 'clamp(12px, 2.8cqw, 32px)' }}
            >
              {formatPrice(variant.discountFinalPrice, variant.currency)}
            </span>
            <span
              className={`font-medium ${highlight ? 'text-white/50' : 'text-[#012163]/40'}`}
              style={{ fontSize: 'clamp(6px, 0.9cqw, 11px)' }}
            >
              / měsíc bez DPH
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-1.5 flex items-baseline gap-1">
          <span
            className={`font-extrabold ${highlight ? 'text-[#04EDB5]' : 'text-[#012163]'}`}
            style={{ fontSize: 'clamp(12px, 2.8cqw, 32px)' }}
          >
            {formatPrice(variant.price, variant.currency)}
          </span>
          <span
            className={`font-medium ${highlight ? 'text-white/50' : 'text-[#012163]/40'}`}
            style={{ fontSize: 'clamp(6px, 0.9cqw, 11px)' }}
          >
            / měsíc bez DPH
          </span>
        </div>
      )}

      {/* Oddělovač */}
      <div className={`h-px my-[4%] flex-shrink-0 ${highlight ? 'bg-white/10' : 'bg-[#E8EBFF]'}`} />

      {/* Funkce */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {sorted.length === 0 ? (
          <p className={`italic ${highlight ? 'text-white/30' : 'text-[#012163]/30'}`}
             style={{ fontSize: 'clamp(6px, 0.9cqw, 11px)' }}>
            Žádné funkce nebyly vybrány
          </p>
        ) : twoColumns ? (
          <div className="grid grid-cols-2 gap-x-[3%] h-full">
            <div>{col1.map((f, i) => renderFeat(f, i))}</div>
            <div>{col2.map((f, i) => renderFeat(f, i))}</div>
          </div>
        ) : (
          <div>{col1.map((f, i) => renderFeat(f, i))}</div>
        )}
      </div>

      {/* Popis */}
      {variant.description && (
        <>
          <div className={`h-px mt-[4%] mb-[4%] flex-shrink-0 ${highlight ? 'bg-white/10' : 'bg-[#E8EBFF]'}`} />
          <p
            className={`${highlight ? 'text-white/60' : 'text-[#012163]/50'} italic flex-shrink-0`}
            style={{ fontSize: 'clamp(5px, 0.85cqw, 10px)' }}
          >
            {variant.description}
          </p>
        </>
      )}
    </div>
  );
}
