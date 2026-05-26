import {
  Document, Page, View, Text, Image as PDFImage, StyleSheet, Svg, Polyline,
} from '@react-pdf/renderer';
import { FEATURES, formatDate, formatPrice } from '@/lib/constants';
import { ImageContext, OfferData, SalespersonData } from '@/lib/types';

// Exaktní rozměry loga (1983 × 254 px) → ratio = 7.807
const LOGO_RATIO = 1983 / 254;
const logoH = (w: number) => Math.round((w / LOGO_RATIO) * 10) / 10;

const NAVY = '#012163';
const TEAL = '#04EDB5';
const WHITE = '#FFFFFF';
const BLUE = '#0D60FF';
const BORDER = '#E8EBFF';

// Rozměry stránky v px (16:9)
const PW = 720;
const PH = 405;
const PAD = 26;

const s = StyleSheet.create({
  page: { backgroundColor: WHITE },

  pill: {
    backgroundColor: TEAL, borderRadius: 20,
    paddingVertical: 3, paddingHorizontal: 10, alignSelf: 'flex-start',
  },
  pillTxt: { color: NAVY, fontSize: 7, fontWeight: 700 },
  pillDark: {
    backgroundColor: NAVY, borderRadius: 20,
    paddingVertical: 3, paddingHorizontal: 10, alignSelf: 'flex-start',
  },
  pillDarkTxt: { color: WHITE, fontSize: 7, fontWeight: 700 },

  // ─── Titulní strana ────────────────────────────────────────────────────────
  titlePage: { width: PW, height: PH },        // absolutní pozicování children
  titleLeft: {
    position: 'absolute', top: 0, left: 0,
    width: PW * 0.52, height: PH,
    flexDirection: 'column', padding: PAD,
  },
  titleRight: {
    position: 'absolute', top: 0, right: 0,
    width: PW * 0.48, height: PH,
    overflow: 'hidden',
  },
  titleScreenshot: { width: PW * 0.48, height: PH, objectFit: 'contain' },
  // Nový design – headline „Komplexní PR nástroj pro [klient]"
  titleHeadline: { color: WHITE, fontSize: 24, fontWeight: 800, lineHeight: 1.2, marginTop: 6 },
  titleDate: { color: 'rgba(255,255,255,0.6)', fontSize: 8, marginTop: 8 },
  titleValidity: { color: 'rgba(255,255,255,0.4)', fontSize: 7, marginTop: 3 },
  spPic: { width: 44, height: 44, borderRadius: 8, marginRight: 10 },  // zaoblený čtverec
  spName: { color: WHITE, fontSize: 11, fontWeight: 700 },
  spPos:  { color: 'rgba(255,255,255,0.6)', fontSize: 8.5, marginTop: 1 },

  // ─── Varianty ──────────────────────────────────────────────────────────────
  varPage: { backgroundColor: WHITE },
  varLogoArea: { marginBottom: 8 },
  varLabel: { color: 'rgba(1,33,99,0.35)', fontSize: 6, fontWeight: 600, letterSpacing: 2, marginTop: 5 },
  cardsRow: { flexDirection: 'row', flex: 1 },
  cardLight: { flex: 1, borderRadius: 10, borderWidth: 1.5, borderColor: BORDER, backgroundColor: WHITE, padding: 14, flexDirection: 'column', overflow: 'hidden' },
  cardDark: { flex: 1, borderRadius: 10, backgroundColor: NAVY, padding: 14, flexDirection: 'column', marginLeft: 12, overflow: 'hidden' },
  badgeRow: { height: 17, justifyContent: 'flex-start' },
  recBadge: { backgroundColor: TEAL, borderRadius: 8, paddingVertical: 2, paddingHorizontal: 7, alignSelf: 'flex-start' },
  recBadgeTxt: { color: NAVY, fontSize: 5.5, fontWeight: 700 },
  varNameL: { color: NAVY, fontSize: 13, fontWeight: 800 },
  varNameD: { color: WHITE, fontSize: 13, fontWeight: 800 },
  varPriceL: { color: NAVY, fontSize: 17, fontWeight: 800, marginTop: 3 },
  varPriceD: { color: TEAL, fontSize: 17, fontWeight: 800, marginTop: 3 },
  varSubL: { color: 'rgba(1,33,99,0.4)', fontSize: 7, marginTop: 1 },
  varSubD: { color: 'rgba(255,255,255,0.4)', fontSize: 7, marginTop: 1 },
  // Sleva
  strikePriceL: { color: 'rgba(1,33,99,0.4)', fontSize: 13, textDecoration: 'line-through', marginTop: 3 },
  strikePriceD: { color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'line-through', marginTop: 3 },
  discountLabelL: { color: 'rgba(1,33,99,0.5)', fontSize: 7.5, marginTop: 2 },
  discountLabelD: { color: 'rgba(255,255,255,0.5)', fontSize: 7.5, marginTop: 2 },
  divL: { height: 1, backgroundColor: BORDER, marginVertical: 8 },
  divD: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 8 },
  featRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 3 },
  tick:    { color: TEAL, fontSize: 10, fontWeight: 800, marginRight: 4, marginTop: -1 },
  tickExtra: { color: TEAL, fontSize: 10, fontWeight: 800, marginRight: 4, marginTop: -1 },
  featTxtL: { color: 'rgba(1,33,99,0.8)',    fontSize: 10, fontWeight: 700, flex: 1, lineHeight: 1.2 },
  featTxtD: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: 700, flex: 1, lineHeight: 1.2 },
  // Funkce, které jsou ve variantě 2 navíc oproti variantě 1 – odlišeny teal barvou
  featTxtExtra: { color: TEAL, fontSize: 10, fontWeight: 700, flex: 1, lineHeight: 1.2 },
  moreL: { color: 'rgba(1,33,99,0.35)', fontSize: 6.5, fontStyle: 'italic', marginTop: 2 },
  moreD: { color: 'rgba(255,255,255,0.35)', fontSize: 6.5, fontStyle: 'italic', marginTop: 2 },
  descL: { color: 'rgba(1,33,99,0.4)', fontSize: 6.5, fontStyle: 'italic', marginTop: 3, marginBottom: 4 },
  descD: { color: 'rgba(255,255,255,0.4)', fontSize: 6.5, fontStyle: 'italic', marginTop: 3, marginBottom: 4 },

  // ─── Kontaktní strana ──────────────────────────────────────────────────────
  contPage: { width: PW, height: PH },
  contLeft: {
    position: 'absolute', top: 0, left: 0,
    width: PW * 0.56, height: PH,
    padding: PAD, flexDirection: 'column',
  },
  contRight: {
    position: 'absolute', top: 0, right: 0,
    width: PW * 0.44, height: PH, overflow: 'hidden',
  },
  contPhoto: { width: PW * 0.44, height: PH, objectFit: 'cover' },
  contHeadline: { color: WHITE, fontSize: 22, fontWeight: 800, lineHeight: 1.2, marginTop: 14 },
  contName: { color: WHITE, fontSize: 13, fontWeight: 700, marginTop: 20 },
  contPos:  { color: 'rgba(255,255,255,0.6)', fontSize: 9, marginTop: 2 },
  contLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 8, fontWeight: 600, width: 14 },
  contVal:   { color: WHITE, fontSize: 8, flex: 1 },
  contRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
});

// SVG checkmark – font-independent, vždy se zobrazí správně
function Checkmark({ size = 9 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 10 10"
         style={{ marginRight: 4, marginTop: 0.5, flexShrink: 0 }}>
      <Polyline
        points="1,5.5 3.8,8 9,2"
        stroke={TEAL}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface Props {
  offer: OfferData;
  salesperson: SalespersonData;
  images: ImageContext;
  fontFamily?: string;
}

export default function PdfDocument({ offer, salesperson, images, fontFamily = 'Helvetica' }: Props) {
  const variants = offer.variants.slice(0, offer.variantCount);

  return (
    <Document title={`Nabídka – ${offer.clientName}`} author="Mediaboard">

      {/* ── Slide 1: Titulní ─────────────────────────────────────────── */}
      <Page size={[PW, PH]} style={[s.page, s.titlePage, { fontFamily }]}>
        {/* Gradient pozadí */}
        {images.gradient ? (
          <PDFImage src={images.gradient} style={{ position: 'absolute', top: 0, left: 0, width: PW, height: PH }} />
        ) : (
          <View style={{ position: 'absolute', top: 0, left: 0, width: PW, height: PH, backgroundColor: NAVY }} />
        )}

        <View style={s.titleLeft}>
          {images.logoWhite ? (
            <PDFImage src={images.logoWhite} style={{ width: 110, height: logoH(110) }} />
          ) : (
            <Text style={{ color: WHITE, fontSize: 13, fontWeight: 800 }}>mediaboard</Text>
          )}

          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={s.titleHeadline}>
              {`Komplexní PR\nnástroj pro\n${offer.clientName || 'Název klienta'}`}
            </Text>
            <Text style={s.titleDate}>{formatDate(offer.date)}</Text>
            <Text style={s.titleValidity}>Platnost nabídky je 30 dní</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            {salesperson.photo ? (
              <PDFImage src={salesperson.photo} style={s.spPic} />
            ) : (
              <View style={[s.spPic, { backgroundColor: 'rgba(255,255,255,0.12)' }]} />
            )}
            <View>
              <Text style={s.spName}>{salesperson.name || 'Obchodník'}</Text>
              {salesperson.position ? <Text style={s.spPos}>{salesperson.position}</Text> : null}
            </View>
          </View>

          <View style={s.pill}>
            <Text style={s.pillTxt}>www.mediaboard.com</Text>
          </View>
        </View>

        <View style={s.titleRight}>
          {images.screenshot ? (
            <PDFImage src={images.screenshot} style={s.titleScreenshot} />
          ) : null}
        </View>
      </Page>

      {/* ── Slide 2: Varianty ────────────────────────────────────────── */}
      <Page size={[PW, PH]} style={[s.page, s.varPage, { fontFamily }]}>
        {/* Wrapper s pevnou výškou a overflow: hidden zabraňuje vzniku prázdných stran */}
        <View style={{ width: PW, height: PH, padding: PAD, flexDirection: 'column', overflow: 'hidden' }}>
          <View style={s.varLogoArea}>
            {images.logoBlue ? (
              <PDFImage src={images.logoBlue} style={{ width: 90, height: logoH(90) }} />
            ) : (
              <Text style={{ color: BLUE, fontSize: 12, fontWeight: 800 }}>mediaboard</Text>
            )}
            <Text style={s.varLabel}>
              CENOVÁ NABÍDKA – {variants.length === 1 ? '1 VARIANTA' : '2 VARIANTY'}
            </Text>
          </View>

          <View style={s.cardsRow}>
            {(() => {
              // Množina indexů standardních funkcí v1 – pro detekci "navíc" ve v2
              const v1Set = new Set(variants[0]?.features ?? []);
              // Množina textů custom služeb v1 – pro detekci "navíc" ve v2
              const v1CustomSet = new Set(
                (variants[0]?.customServices ?? [])
                  .filter(cs => cs.enabled && cs.text.trim())
                  .map(cs => cs.text.trim())
              );
              return variants.map((v, i) => {
                // Tmavá karta: vždy při 1 variantě, nebo 2. karta při 2 variantách
                const isDark = variants.length === 1 || (i === 1 && variants.length === 2);
                // Standardní funkce: { label, isExtra }
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

                const renderFeat = (f: { label: string; isExtra: boolean }, fi: number) => (
                  <View key={fi} style={s.featRow}>
                    {f.isExtra
                      ? <Text style={s.tick}>+</Text>
                      : <Checkmark />
                    }
                    <Text style={f.isExtra ? s.featTxtExtra : (isDark ? s.featTxtD : s.featTxtL)}>
                      {f.label}
                    </Text>
                  </View>
                );

                // Sdílené standardní → sdílené custom → extra standardní → extra custom
                const sorted = [
                  ...feats.filter(f => !f.isExtra),
                  ...customFeats.filter(f => !f.isExtra),
                  ...feats.filter(f => f.isExtra),
                  ...customFeats.filter(f => f.isExtra),
                ];
                const COL_MAX = 13;
                const col1 = sorted.slice(0, COL_MAX);
                const col2 = sorted.slice(COL_MAX);

                return (
                  <View key={i} style={[
                    isDark ? s.cardDark : s.cardLight,
                    // 40/60 split při 2 variantách; marginLeft jen u 2. karty
                    variants.length === 2
                      ? { flex: isDark ? 3 : 2 }
                      : { flex: 1, marginLeft: 0 },
                  ]}>
                    {/* Badge oblast: u obou karet při 2 variantách (zarovnání), vždy u tmavé */}
                    {(variants.length === 2 || isDark) && (
                      <View style={s.badgeRow}>
                        {isDark && (
                          <View style={s.recBadge}><Text style={s.recBadgeTxt}>DOPORUČUJEME</Text></View>
                        )}
                      </View>
                    )}
                    {/* Řádek: název vlevo, cena vpravo */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      {/* Levá strana – název + popis */}
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={isDark ? s.varNameD : s.varNameL}>{v.name || 'Varianta'}</Text>
                        {v.description ? (
                          <Text style={isDark ? s.descD : s.descL}>{v.description}</Text>
                        ) : null}
                      </View>
                      {/* Pravá strana – cena (zarovnána vpravo) */}
                      <View style={{ alignItems: 'flex-end' }}>
                        {(v.discountEnabled && v.discountFinalPrice) ? (
                          <>
                            <Text style={[isDark ? s.strikePriceD : s.strikePriceL, { marginTop: 0, textAlign: 'right' }]}>
                              {formatPrice(v.price, v.currency)}
                            </Text>
                            <Text style={[isDark ? s.discountLabelD : s.discountLabelL, { textAlign: 'right' }]}>
                              {`−${v.discountPercent} %`}
                            </Text>
                            <Text style={[isDark ? s.varPriceD : s.varPriceL, { marginTop: 0, textAlign: 'right' }]}>
                              {formatPrice(v.discountFinalPrice, v.currency)}
                            </Text>
                          </>
                        ) : (
                          <Text style={[isDark ? s.varPriceD : s.varPriceL, { marginTop: 0, textAlign: 'right' }]}>
                            {formatPrice(v.price, v.currency)}
                          </Text>
                        )}
                        <Text style={[isDark ? s.varSubD : s.varSubL, { textAlign: 'right' }]}>za měsíc bez DPH</Text>
                      </View>
                    </View>
                    <View style={isDark ? s.divD : s.divL} />

                    {/* Plnění zleva: col1 první, col2 až když col1 přeteče */}
                    {col2.length > 0 ? (
                      <View style={{ flexDirection: 'row', flex: 1 }}>
                        <View style={{ flex: 1, paddingRight: 4 }}>
                          {col1.map((f, fi) => renderFeat(f, fi))}
                        </View>
                        <View style={{ flex: 1 }}>
                          {col2.map((f, fi) => renderFeat(f, fi))}
                        </View>
                      </View>
                    ) : (
                      <View style={{ flex: 1 }}>
                        {col1.map((f, fi) => renderFeat(f, fi))}
                      </View>
                    )}
                  </View>
                );
              });
            })()}
          </View>
        </View>
      </Page>

      {/* ── Slide 3: Kontakt ─────────────────────────────────────────── */}
      <Page size={[PW, PH]} style={[s.page, s.contPage, { fontFamily }]}>
        {/* Gradient pozadí */}
        {images.gradient ? (
          <PDFImage src={images.gradient} style={{ position: 'absolute', top: 0, left: 0, width: PW, height: PH }} />
        ) : (
          <View style={{ position: 'absolute', top: 0, left: 0, width: PW, height: PH, backgroundColor: NAVY }} />
        )}

        <View style={s.contLeft}>
          {images.logoWhite ? (
            <PDFImage src={images.logoWhite} style={{ width: 90, height: logoH(90) }} />
          ) : (
            <Text style={{ color: WHITE, fontSize: 12, fontWeight: 800 }}>mediaboard</Text>
          )}
          <Text style={s.contHeadline}>{'Posuňte svou komunikaci\nna další úroveň.'}</Text>
          <Text style={s.contName}>{salesperson.name || 'Jméno obchodníka'}</Text>
          {salesperson.position ? <Text style={s.contPos}>{salesperson.position}</Text> : null}

          <View style={{ marginTop: 14 }}>
            {salesperson.phone ? (
              <View style={s.contRow}>
                <Text style={s.contLabel}>T:</Text>
                <Text style={s.contVal}>{salesperson.phone}</Text>
              </View>
            ) : null}
            {salesperson.email ? (
              <View style={s.contRow}>
                <Text style={s.contLabel}>E:</Text>
                <Text style={s.contVal}>{salesperson.email}</Text>
              </View>
            ) : null}
            <View style={s.contRow}>
              <Text style={s.contLabel}>W:</Text>
              <Text style={s.contVal}>www.mediaboard.com</Text>
            </View>
          </View>

          <View style={[s.pillDark, { marginTop: 'auto' }]}>
            <Text style={s.pillDarkTxt}>www.mediaboard.com</Text>
          </View>
        </View>

        <View style={s.contRight}>
          {salesperson.photo ? (
            <PDFImage src={salesperson.photo} style={s.contPhoto} />
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
