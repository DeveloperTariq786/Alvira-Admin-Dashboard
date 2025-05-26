import { AbandonedCartsApiResponse } from '@/types/abandonedCart';
import { getToken } from './loginService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAbandonedCarts = async (): Promise<AbandonedCartsApiResponse> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/admin/abandoned-carts`, {
    headers,
  });
  if (!response.ok) {
    if (response.status === 401) {
      console.error('Unauthorized: Token might be invalid or expired.');
    }
    throw new Error('Failed to fetch abandoned carts');
  }
  return response.json();
}; 