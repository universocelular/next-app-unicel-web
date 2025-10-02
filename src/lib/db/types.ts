
import type { ReactNode, ComponentType, SVGProps } from "react";

export interface Brand {
  id: string;
  name: string;
}

export interface Model {
  id: string;
  name: string;
  brand: string;
  category?: 'Phone' | 'Mac' | 'iPad' | 'Watch';
  processor?: string;
  priceOverrides?: Record<string, number | null | Record<string, number | null>> | null; 
  disabledPrices?: Record<string, boolean | Record<string, boolean>> | null;
}

export interface SubService {
  id: string;
  name:string;
  description: string;
  price: number;
  iconSvg?: string;
  imageUrl?: string;
  dataAiHint?: string;
  emoji?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price?: number;
  subServices?: SubService[];
  iconSvg?: string;
  emoji?: string;
  imageUrl?: string;
  dataAiHint?: string;
}

export interface Country {
  id: string;
  name: string;
  flag: ComponentType<SVGProps<SVGSVGElement>>;
  phoneCode: string;
}

export interface Carrier {
  id: string;
  name: string;
  countryId: string;
  logo?: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  isActive: boolean;
  brandName?: string;
  modelId?: string;
  serviceId?: string;
  subServiceId?: string;
}

export interface FreeServiceSetting {
  id: string;
  modelId: string;
  serviceId: string;
  subServiceId?: string;
  modelName: string;
  serviceName: string;
}

export interface DiscountSetting {
    id: string;
    isActive: boolean;
    discountPercentage: number;
    brandName?: string;
    modelName?: string;
    serviceId?: string;
    subServiceId?: string;
}

export interface Settings {
    isDiscountModeActive?: boolean;
    discounts?: DiscountSetting[];
    isFreeModeActive?: boolean;
    freeServices?: FreeServiceSetting[];
    usdToArsRate?: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  countryId: string;
  emoji?: string;
  isActive: boolean;
}

export interface Popup {
  id: string;
  title: string;
  description: string[];
  mediaType?: 'youtube' | 'image' | 'audio';
  mediaUrl?: string;
  targetBrandName?: string;
  targetServiceId?: string;
  targetSubServiceId?: string;
  hasCountdown: boolean;
  countdownSeconds?: number;
  delaySeconds?: number;
  animationEffect?: 'fadeIn' | 'slideIn' | 'zoomIn' | 'rotateIn' | 'slideUp' | 'flipIn';
  showLastUpdated?: boolean;
  isActive: boolean;
}
