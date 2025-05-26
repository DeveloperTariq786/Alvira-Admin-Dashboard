export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedColor: string | null;
  selectedSize: string | null;
  isReturned: boolean;
  returnReason: string | null;
  returnedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  id: string;
  userId: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  mobile: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
}

export interface StatusHistory {
  id: string;
  orderId: string;
  previousStatus: string;
  newStatus: string;
  comment: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  isPaid: boolean;
  paidAt: string | null;
  addressId: string;
  tracking: string | null;
  carrier: string | null;
  estimatedDelivery: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  user: User;
  statusHistory: StatusHistory[];
}

export interface OrdersApiResponse {
  orders: Order[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
} 