import { getToken } from "./loginService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USERS_ENDPOINT = "/users";

export type UserRole = "ADMIN" | "CUSTOMER" | "STAFF";

export interface User {
  id: string;
  name: string;
  email?: string; // Email might not always be present based on response example
  phone: string | null;
  role: UserRole;
  isPhoneVerified: boolean; // Use isPhoneVerified from API
  dateOfBirth: string | null;
  verificationToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsersApiResponse {
  users: User[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

// DTO for creating a user
export interface CreateUserData {
  name: string;
  phone: string;
  role: UserRole;
  email?: string; // Optional based on typical user creation fields
  password?: string; // Often required for new user creation
  dateOfBirth?: string;
}

// DTO for updating a user (all fields optional)
export type UpdateUserData = Partial<CreateUserData> & {
  isPhoneVerified?: boolean;
  // Add any other specific update fields if different from CreateUserData
};

export const getUsers = async (page: number = 1, limit: number = 10, role?: UserRole): Promise<UsersApiResponse> => {
  if (!API_BASE_URL) {
    throw new Error("Base API URL is not defined. Please set VITE_API_BASE_URL in your .env file.");
  }
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }

  let url = `${API_BASE_URL}${USERS_ENDPOINT}?page=${page}&limit=${limit}`;
  if (role) {
    url += `&role=${role}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // Ignore if response is not JSON or doesn't have a message
    }
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  return data;
};

export const createUser = async (userData: CreateUserData): Promise<User> => {
  if (!API_BASE_URL) throw new Error("Base API URL is not defined");
  const token = getToken();
  if (!token) throw new Error("Authentication token not found");

  const response = await fetch(`${API_BASE_URL}${USERS_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const updateUser = async (id: string, userData: UpdateUserData): Promise<User> => {
  if (!API_BASE_URL) throw new Error("Base API URL is not defined");
  const token = getToken();
  if (!token) throw new Error("Authentication token not found");

  const response = await fetch(`${API_BASE_URL}${USERS_ENDPOINT}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const deleteUser = async (id: string): Promise<void> => {
  if (!API_BASE_URL) throw new Error("Base API URL is not defined");
  const token = getToken();
  if (!token) throw new Error("Authentication token not found");

  const response = await fetch(`${API_BASE_URL}${USERS_ENDPOINT}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return;
}; 