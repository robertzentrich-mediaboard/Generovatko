// Pomocné funkce pro ukládání dat do localStorage
import { OfferData, SalespersonData } from './types';
import { DEFAULT_OFFER, DEFAULT_SALESPERSON } from './constants';

const KEY_SALESPERSON = 'mb_salesperson';
const KEY_OFFER = 'mb_current_offer';

export function loadSalesperson(): SalespersonData {
  if (typeof window === 'undefined') return DEFAULT_SALESPERSON;
  try {
    const raw = localStorage.getItem(KEY_SALESPERSON);
    return raw ? { ...DEFAULT_SALESPERSON, ...JSON.parse(raw) } : DEFAULT_SALESPERSON;
  } catch {
    return DEFAULT_SALESPERSON;
  }
}

export function saveSalesperson(data: SalespersonData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_SALESPERSON, JSON.stringify(data));
}

export function hasSalesperson(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(KEY_SALESPERSON);
    if (!raw) return false;
    const data = JSON.parse(raw) as SalespersonData;
    return Boolean(data.name?.trim());
  } catch {
    return false;
  }
}

export function loadOffer(): OfferData {
  if (typeof window === 'undefined') return DEFAULT_OFFER;
  try {
    const raw = localStorage.getItem(KEY_OFFER);
    if (!raw) return DEFAULT_OFFER;
    const parsed = JSON.parse(raw) as Partial<OfferData>;
    // Hluboké mergování variant – zajistí, že nová pole (discount…) mají defaultní hodnoty
    // i při načtení starých nabídek uložených před přidáním slevy
    return {
      ...DEFAULT_OFFER,
      ...parsed,
      variants: [
        { ...DEFAULT_OFFER.variants[0], ...parsed.variants?.[0] },
        { ...DEFAULT_OFFER.variants[1], ...parsed.variants?.[1] },
      ] as OfferData['variants'],
    };
  } catch {
    return DEFAULT_OFFER;
  }
}

export function saveOffer(data: OfferData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_OFFER, JSON.stringify(data));
}

export function clearOffer(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY_OFFER);
}
