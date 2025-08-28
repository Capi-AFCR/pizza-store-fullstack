import { Role } from './Role';

export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role: Role;
  active: boolean;
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
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'AP' | 'MC' | 'SD' | 'DR' | 'DE';
  available: boolean;
  imageUrl?: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  modifiedAt: string;
}

export interface CartItem extends Product {
  quantity: number;
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
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  modifiedAt: string;
}
export type { Role };
