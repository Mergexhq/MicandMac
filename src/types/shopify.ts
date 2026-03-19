// src/types/shopify.ts — Shopify data shapes

export interface ShopifyImage {
  id: number;
  src: string;
  alt: string | null;
  width: number;
  height: number;
}

export interface ShopifyVariant {
  id: number;
  title: string;
  price: number;           // In paise (×100)
  compare_at_price: number | null;
  available: boolean;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  sku: string;
  featured_image: ShopifyImage | null;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  vendor: string;
  type: string;
  tags: string[];
  description: string;
  url: string;
  available: boolean;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  featured_image: string;
  options: string[];
}

export interface ShopifyCartItem {
  key: string;
  id: number;
  quantity: number;
  variant_id: number;
  product_id: number;
  product_title: string;
  variant_title: string | null;
  price: number;
  final_price: number;
  final_line_price: number;
  url: string;
  image: string | null;
  handle: string;
  properties: Record<string, string>;
  featured_image: {
    url: string;
    alt: string | null;
  } | null;
}

export interface ShopifyCart {
  token: string;
  note: string | null;
  item_count: number;
  total_price: number;
  total_discount: number;
  items: ShopifyCartItem[];
  currency: string;
}

export interface CartAddPayload {
  id: number;
  quantity: number;
  properties?: Record<string, string>;
}

export interface CartChangePayload {
  id: string;
  quantity: number;
}
