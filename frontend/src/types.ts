import { Role } from './Role';

// Note: CartItem extends Product, so use 'id' instead of 'productId' for product identifier
export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role: Role;
  active: boolean;
  loyaltyPoints?: number;
  createdBy?: string;
  modifiedBy?: string;
  createdAt?: string;
  modifiedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: Role;
}

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: 'AP' | 'MC' | 'SD' | 'DR' | 'DE' | '';
  isActive: boolean;
  imageUrl?: string;
  createdBy?: string;
  modifiedBy?: string;
  createdAt?: string;
  modifiedAt?: string;
}

export interface Ingredient {
  id: number;
  name: string;
  category: 'DO' | 'CR' | 'SA' | 'CH' | 'TO' | 'SI';
  price: number;
  isActive: boolean;
}

export interface CartItem {
  id?: number;
  productId: number;
  quantity: number;
  price: number;
  name?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
  ingredients?: Ingredient[];
  isCustomPizza?: boolean;
}

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id?: number;
  userId: number;
  items: OrderItem[];
  totalPrice: number;
  status: 'PE' | 'AP' | 'RE' | 'OW' | 'DN' | 'DY' | 'CA';
  scheduledAt?: string;
  customPizza?: boolean;
  createdBy?: string;
  modifiedBy?: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface OrderStatusUpdate {
  orderId: number;
  status: 'PE' | 'AP' | 'RE' | 'OW' | 'DN' | 'DY' | 'CA';
  updatedAt: string;
}

export interface Translation {
  id: number;
  key: string;
  language: string;
  value: string;
}

export type { Role };
