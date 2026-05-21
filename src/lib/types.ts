// Datové typy celé aplikace

export interface SalespersonData {
  name: string;
  position: string;
  email: string;
  phone: string;
  photo: string; // base64 data URL nebo prázdný řetězec
}

export interface VariantData {
  name: string;
  features: number[]; // indexy vybraných funkcí z pole FEATURES
  price: string;
  currency: 'CZK' | 'EUR';
  description: string;
}

export interface OfferData {
  clientName: string;
  date: string; // YYYY-MM-DD
  variantCount: 1 | 2;
  variants: [VariantData, VariantData]; // vždy 2, zobrazuje se jen prvních N
}

// Kontext obrázků předávaný do exportů (base64 data URLs)
export interface ImageContext {
  logoBlue: string;
  logoWhite: string;
  screenshot: string;
  gradient?: string; // gradient PNG – pouze pro PDF (PPTX má nativní gradient fill)
}
