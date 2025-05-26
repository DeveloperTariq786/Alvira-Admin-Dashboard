export type PaymentMethod = 
  | "credit_card" 
  | "paypal" 
  | "bank_transfer" 
  | "cash_on_delivery";

export type UserRole = 
  | "admin" 
  | "manager" 
  | "editor" 
  | "viewer";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  discount?: number;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  color?: string;
  size?: string;
  stock: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  verified: boolean;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate?: string;
  joinedDate: string;
}

export interface DashboardStats {
  totalRevenue: number;
  ordersCount: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  averageOrderValue: number;
  paymentSuccessRate: number;
  lowStockProducts: number;
  pendingOrders: number;
}
