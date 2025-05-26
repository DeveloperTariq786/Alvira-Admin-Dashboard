import { getToken } from "./loginService"; // Import getToken

export interface Size {
  id: string;
  label: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSizeData {
  label: string;
  value: string;
}

export type UpdateSizeData = Partial<CreateSizeData>;

export interface Color {
  id: string;
  name: string;
  value: string;
  hexCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateColorData {
  name: string;
  value: string;
  hexCode: string;
}

export type UpdateColorData = Partial<CreateColorData>;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SIZES_ENDPOINT = "/sizes";
const COLORS_ENDPOINT = "/colors";

// Sizes CRUD
export const getSizes = async (): Promise<Size[]> => {
  if (!API_BASE_URL) {
    throw new Error("Base API URL is not defined. Please set VITE_API_BASE_URL in your .env file.");
  }
  const API_URL = `${API_BASE_URL}${SIZES_ENDPOINT}`;
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

export const addSize = async (sizeData: CreateSizeData): Promise<Size> => {
  if (!API_BASE_URL) {
    throw new Error("Base API URL is not defined");
  }
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }
  const response = await fetch(`${API_BASE_URL}${SIZES_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(sizeData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const updateSize = async (id: string, sizeData: UpdateSizeData): Promise<Size> => {
  if (!API_BASE_URL) {
    throw new Error("Base API URL is not defined");
  }
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }
  const response = await fetch(`${API_BASE_URL}${SIZES_ENDPOINT}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(sizeData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const deleteSize = async (id: string): Promise<void> => {
  if (!API_BASE_URL) {
    throw new Error("Base API URL is not defined");
  }
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }
  const response = await fetch(`${API_BASE_URL}${SIZES_ENDPOINT}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok && response.status !== 204) { // 204 No Content is a success for DELETE
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
};

// Colors CRUD
export const getColors = async (): Promise<Color[]> => {
  if (!API_BASE_URL) {
    throw new Error("Base API URL is not defined. Please set VITE_API_BASE_URL in your .env file.");
  }
  const API_URL = `${API_BASE_URL}${COLORS_ENDPOINT}`;
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

export const addColor = async (colorData: CreateColorData): Promise<Color> => {
  if (!API_BASE_URL) {
    throw new Error("Base API URL is not defined");
  }
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }
  const response = await fetch(`${API_BASE_URL}${COLORS_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(colorData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const updateColor = async (id: string, colorData: UpdateColorData): Promise<Color> => {
  if (!API_BASE_URL) {
    throw new Error("Base API URL is not defined");
  }
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }
  const response = await fetch(`${API_BASE_URL}${COLORS_ENDPOINT}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(colorData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const deleteColor = async (id: string): Promise<void> => {
  if (!API_BASE_URL) {
    throw new Error("Base API URL is not defined");
  }
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }
  const response = await fetch(`${API_BASE_URL}${COLORS_ENDPOINT}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok && response.status !== 204) { // 204 No Content is a success for DELETE
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
}; 