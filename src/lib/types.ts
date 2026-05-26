// Datové typy celé aplikace

export interface SalespersonData {
  name: string;
  position: string;
  email: string;
  phone: string;
  photo: string; // base64 data URL nebo prázdný řetězec
}

export interface CustomService {
  text: string;
  enabled: boolean;
}

export interface VariantData {
  name: string;
  features: number[]; // indexy vybraných funkcí z pole FEATURES
  customServices: CustomService[]; // vlastní služby mimo standardní seznam
  price: string;
  currency: 'CZK' | 'EUR';
  description: string;
  discountEnabled: boolean;
  discountPercent: string;    // např. "20" nebo "15.5"
  discountFinalPrice: string; // výsledná cena po slevě
}

export interface OfferData {
  clientName: string;
  date: string; // YYYY-MM-DD
  variantCount: 1 | 2;
  variants: [VariantData, VariantData]; // vždy 2, zobrazuje se jen prvních N
}

// Kontext obrázků předávaný do PDF exportu (base64 data URLs)
export interface ImageContext {
  logoBlue: string;
  logoWhite: string;
  screenshot: string;
  gradient?: string;
}
