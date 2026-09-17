export type Category = "iPhone" | "MacBook" | "Smartwatch" | "Android";

export type Brand = "Apple" | "Samsung" | "Google" | "OnePlus";

export type Condition = "Brand New" | "Certified Refurbished" | "Open Box";

export interface ColorVariant {
  name: string;
  hex: string;
}

export interface StorageVariant {
  label: string;
  /** Price delta added to the base price. */
  priceDelta: number;
}

export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  brand: Brand;
  category: Category;
  condition: Condition;
  basePrice: number;
  compareAtPrice?: number;
  image: string;
  gallery: string[];
  colors: ColorVariant[];
  storage: StorageVariant[];
  rating: number;
  reviews: number;
  stock: number;
  warrantyTags: string[];
  featured?: boolean;
  specs: Spec[];
  highlights: string[];
  inBox: string[];
}

export interface CartItem {
  /** Unique line id: product + storage + color combination. */
  lineId: string;
  product: Product;
  storage: StorageVariant;
  color: ColorVariant;
  quantity: number;
  unitPrice: number;
}

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

export interface FilterState {
  category: Category | "All";
  brand: Brand | "All";
  condition: Condition | "All";
  maxPrice: number;
  sort: SortKey;
  query: string;
}

export interface OrderLine {
  name: string;
  storage: string;
  color: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  customerName: string;
  neighborhood: string;
  delivery: string;
  placedAt: string;
}

export type DeliveryMethod = "standard" | "express" | "pickup";
