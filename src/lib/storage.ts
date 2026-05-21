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
    return raw ? { ...DEFAULT_OFFER, ...JSON.parse(raw) } : DEFAULT_OFFER;
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
