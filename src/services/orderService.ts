import { Order, OrdersApiResponse } from "@/types/order";
import { getToken } from "./loginService";

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const getOrders = async (params: GetOrdersParams = {}): Promise<OrdersApiResponse> => {
  const token = getToken();
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.status) queryParams.append("status", params.status);
  if (params.startDate) queryParams.append("startDate", params.startDate);
  if (params.endDate) queryParams.append("endDate", params.endDate);
  if (params.search) queryParams.append("search", params.search);

  const response = await fetch(`${API_URL}/orders?${queryParams.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return response.json();
};

export const getOrderById = async (id: string): Promise<Order> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/orders/${id}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Order not found");
    }
    throw new Error("Failed to fetch order details");
  }

  return response.json();
};

export const updateOrderStatus = async (id: string, status: string): Promise<Order> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/orders/${id}/status`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    // Consider more specific error handling based on response.status or response.json() error messages
    const errorData = await response.json().catch(() => ({ message: "Failed to update order status" }));
    throw new Error(errorData.message || "Failed to update order status");
  }

  return response.json();
}; 