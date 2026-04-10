import { CuisineType } from '../dto/create-restaurant.dto';

/** Entité interne : supporte v1 (phone) et v2 (countryCode + localNumber). */
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  /** v1 : numéro complet */
  phone?: string;
  /** v2 : indicatif pays */
  countryCode?: string;
  /** v2 : numéro local */
  localNumber?: string;
  cuisineType: CuisineType;
  deliveryRadiusKm: number;
  openingTime: string;
  closingTime: string;
  description?: string;
  isActive?: boolean;
}
