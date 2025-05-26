import { getToken } from "./loginService"; // Import getToken

export interface Promotion {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  image: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    image: string;
    type: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Type for creating a new promotion (omitting id, createdAt, updatedAt, and category object)
export interface CreatePromotionData {
  title: string;
  description: string;
  buttonText: string;
  image: string;
  categoryId: string;
}

// Type for updating a promotion, all fields are optional
export type UpdatePromotionData = Partial<CreatePromotionData>;

// Interface for Summer Collection Data
export interface SummerCollectionData {
  id: string;
  title: string;
  description: string;
  additionalText?: string; // Optional based on example
  buttonText: string;
  image: string;
  categoryId: string;
  badgeYear?: string;      // Optional based on example
  badgeText?: string;      // Optional based on example
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    image: string;
    type: string;
  };
}

// Interface for the API response structure for summer collection
export interface SummerCollectionResponse {
    success: boolean;
    data: SummerCollectionData;
}

// Interface for updating Summer Collection data
// Omitting id, createdAt, updatedAt, category as these are not typically part of update payload or handled by backend
export interface UpdateSummerCollectionPayload {
  title?: string;
  description?: string;
  additionalText?: string;
  buttonText?: string;
  image?: string;
  categoryId?: string;
  badgeYear?: string;
  badgeText?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PROMOTIONS_ENDPOINT = "/promotions";
const SUMMER_COLLECTION_ENDPOINT = "/summer-collection"; // New endpoint

export const getPromotions = async (): Promise<Promotion[]> => {
  if (!API_BASE_URL) {
    throw new Error("Base API URL is not defined. Please set VITE_API_BASE_URL in your .env file.");
  }
  const API_URL = `${API_BASE_URL}${PROMOTIONS_ENDPOINT}`;
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

export const addPromotion = async (promotionData: CreatePromotionData): Promise<Promotion> => {
  if (!API_BASE_URL) {
    throw new Error("Base API URL is not defined. Please set VITE_API_BASE_URL in your .env file.");
  }
  const token = getToken(); // Retrieve the token
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }

  const API_URL = `${API_BASE_URL}${PROMOTIONS_ENDPOINT}`;
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Add Authorization header
    },
    body: JSON.stringify(promotionData),
  });

  if (!response.ok) {
    // Attempt to get error message from response body
    const errorData = await response.json().catch(() => null); // Try to parse error, ignore if not JSON
    const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
};

export const updatePromotion = async (id: string, promotionData: UpdatePromotionData): Promise<Promotion> => {
  if (!API_BASE_URL) {
    throw new Error("Base API URL is not defined. Please set VITE_API_BASE_URL in your .env file.");
  }
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }

  const API_URL = `${API_BASE_URL}${PROMOTIONS_ENDPOINT}/${id}`;
  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(promotionData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
};

export const deletePromotion = async (id: string): Promise<void> => {
  if (!API_BASE_URL) {
    throw new Error("Base API URL is not defined. Please set VITE_API_BASE_URL in your .env file.");
  }
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }

  const API_URL = `${API_BASE_URL}${PROMOTIONS_ENDPOINT}/${id}`;
  const response = await fetch(API_URL, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // For DELETE, the response might not have a JSON body on error, or even on success.
    // We check for 204 No Content for successful deletion without a body.
    if (response.status === 204) return;
    
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }
  // No explicit return for void, or handle 204 No Content if API returns that on success.
  // If the API returns the deleted object or a success message, adjust accordingly.
};

// Function to get Summer Collection data
export const getSummerCollection = async (): Promise<SummerCollectionData> => {
    if (!API_BASE_URL) {
        throw new Error("Base API URL is not defined. Please set VITE_API_BASE_URL in your .env file.");
    }
    const API_URL = `${API_BASE_URL}${SUMMER_COLLECTION_ENDPOINT}`;
    const response = await fetch(API_URL);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const result: SummerCollectionResponse = await response.json();
    if (!result.success) {
        throw new Error("Failed to fetch summer collection data: API reported failure.");
    }
    return result.data;
};

// Function to update Summer Collection data
export const updateSummerCollection = async (id: string, collectionData: UpdateSummerCollectionPayload): Promise<SummerCollectionData> => {
    if (!API_BASE_URL) {
        throw new Error("Base API URL is not defined. Please set VITE_API_BASE_URL in your .env file.");
    }
    const token = getToken();
    if (!token) {
        throw new Error("Authentication token not found. Please log in.");
    }
    const API_URL = `${API_BASE_URL}${SUMMER_COLLECTION_ENDPOINT}/${id}`;
    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(collectionData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    // Assuming the API returns the updated collection data in the same format as getSummerCollection success response
    const result: SummerCollectionResponse = await response.json(); 
    if (!result.success) {
        // This case might not be typical for a PUT success, but handling based on provided GET structure
        throw new Error("Failed to update summer collection: API reported failure after update.");
    }
    return result.data;
};