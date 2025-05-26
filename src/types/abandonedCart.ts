export interface AbandonedCartItem {
  name: string;
  image: string;
  price: number;
  quantity: number;
  productId: string;
}

export interface AbandonedCartUser {
  name: string;
  phone: string;
}

export interface AbandonedCart {
  id: string;
  userId: string;
  items: AbandonedCartItem[];
  createdAt: string;
  updatedAt: string;
  user: AbandonedCartUser;
  totalValue: number;
  itemCount: number;
  lastUpdated: string;
  hoursInactive: number;
}

export interface AbandonedCartsApiResponse {
  success: boolean;
  count: number;
  data: AbandonedCart[];
} 