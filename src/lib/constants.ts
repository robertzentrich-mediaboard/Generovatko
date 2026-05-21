import { OfferData, SalespersonData, VariantData } from './types';

// Seznam všech funkcí produktu Mediaboard
export const FEATURES = [
  'Online média',
  'TV & Rádio',
  'Podcasty / Newslettery',
  'Sociální sítě',
  'Tisk',
  'Placené zdroje (paywall)',
  'Sentiment',
  'Email Reporty',
  'Překlady (základ 50)',
  'Mobilní aplikace',
  'Mediální metriky (AVE, GRP…)',
  'Analytika – základní',
  'Archiv',
  'AI shrnutí MAIA',
  'Dashboardy',
  'Connect – Medialist',
  'Connect – Emailing',
  'Connect – Newsroom',
  'Mediaboard Insights',
  'Krizová komunikace',
  'PRIMe',
  'Přímé BI napojení',
  'Konzultace na míru',
  'PR Growth Plan',
  'Všechny nové funkce',
] as const;

const defaultVariant = (name: string): VariantData => ({
  name,
  features: [],
  price: '',
  currency: 'CZK',
  description: '',
});

export const DEFAULT_SALESPERSON: SalespersonData = {
  name: '',
  position: '',
  email: '',
  phone: '',
  photo: '',
};

export const DEFAULT_OFFER: OfferData = {
  clientName: '',
  date: new Date().toISOString().split('T')[0],
  variantCount: 1,
  variants: [defaultVariant('Základní'), defaultVariant('Premium')],
};

// Formátování ceny pro zobrazení
export function formatPrice(price: string, currency: 'CZK' | 'EUR'): string {
  if (!price) return '—';
  const num = parseFloat(price.replace(/\s/g, ''));
  if (isNaN(num)) return price;
  const formatted = num.toLocaleString('cs-CZ');
  return currency === 'CZK' ? `${formatted} Kč` : `${formatted} €`;
}

// Formátování data pro zobrazení
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Načtení obrázku z URL jako base64 data URL (pro export)
export async function imageUrlToDataUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}
