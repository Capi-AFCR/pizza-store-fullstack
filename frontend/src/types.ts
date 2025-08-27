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
