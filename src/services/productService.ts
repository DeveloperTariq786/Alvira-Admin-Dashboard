import { getToken } from "./loginService"; // For potential future authenticated product actions

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory { // Simplified, use full Category from categoryService if more details needed elsewhere
  id: string;
  name: string;
  image?: string; // Optional as per product's category structure
  type?: string;  // Optional
  createdAt: string;
  updatedAt: string;
}

export interface ProductColor { // Simplified, use full Color from colorAndSizeService if more details needed
  id: string;
  name: string;
  value: string;
  hexCode: string;
}

export interface ProductSize { // Simplified, use full Size from colorAndSizeService if more details needed
  id: string;
  label: string;
  value: string;
}

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface ProductBenefit {
  icon: string; // Assuming icon is a string identifier like 'clock', 'cash'
  text: string;
}

export interface ProductInformation {
  work?: string;
  style?: string;
  length?: string;
  material?: string;
  occasion?: string;
  set_contents?: string;
  // Add any other potential fields from productInformation
  [key: string]: string | undefined; // For dynamic properties
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  saleEndsIn?: number; // Assuming this is number of days or similar
  currency: string;
  categoryId: string;
  rating: number;
  fabric: string;
  isBest: boolean;
  isNew: boolean;
  description: string;
  productBenefits: ProductBenefit[];
  productInformation: ProductInformation;
  shippingPoints: string[];
  careInstructions: string[];
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  category: ProductCategory;
  colors: ProductColor[];
  sizes: ProductSize[];
  stockQuantity: number;
  lowStockThreshold: number;
  stockStatus: StockStatus;
  _count?: { // Optional _count object
    reviews?: number;
  };
}

// Define the Review interface based on the API response
export interface Review {
  id: string;
  rating: number;
  comment: string;
  productId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsApiResponse {
  products: Product[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

// DTO for creating product image
export interface CreateProductImageDto {
  imageUrl: string;
  isPrimary: boolean;
}

// DTO for creating a product
export interface CreateProductData {
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  saleEndsIn?: number;
  currency: string; // Should default to INR or be selectable
  categoryId: string;
  // rating is likely not set on create, defaults to 0
  fabric: string;
  isBest: boolean;
  isNew: boolean;
  description: string;
  images: CreateProductImageDto[]; 
  colors: string[]; // Array of Color IDs
  sizes: string[];  // Array of Size IDs
  productBenefits: ProductBenefit[];
  productInformation: ProductInformation;
  shippingPoints: string[];
  careInstructions: string[];
  stockQuantity: number;
  lowStockThreshold: number;
  stockStatus: StockStatus;
}

// DTO for updating a product
export type UpdateProductData = Partial<CreateProductData> & {
  rating?: number; // Rating can be updated
  stockQuantity?: number;
  lowStockThreshold?: number;
  stockStatus?: StockStatus;
  // Ensure all fields from the user's request body are optional here
  // For example, if 'name' is in CreateProductData and can be updated, it's covered by Partial.
  // If there are fields in the update payload not in CreateProductData, add them here.
  // Based on the user's PUT request body, it seems Partial<CreateProductData>
  // and adding `rating` covers most fields.
  // The request body also shows `colors` and `sizes` as array of IDs, which is in CreateProductData.
  // `images` are also in CreateProductData.
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PRODUCTS_ENDPOINT = "/products";
const REVIEWS_ENDPOINT = "/reviews/product"; // Define reviews endpoint
const INVENTORY_ENDPOINT = "/inventory"; // Added inventory endpoint

export const getProducts = async (page: number = 1, limit: number = 10): Promise<ProductsApiResponse> => {
  if (!API_BASE_URL) {
    throw new Error("Base API URL is not defined. Please set VITE_API_BASE_URL in your .env file.");
  }
  // No token needed for GET /api/products as per user instruction
  const API_URL = `${API_BASE_URL}${PRODUCTS_ENDPOINT}?page=${page}&limit=${limit}`;
  
  const response = await fetch(API_URL);
  
  if (!response.ok) {
    // Try to parse error message from response body
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

export const addProduct = async (productData: CreateProductData): Promise<Product> => {
  if (!API_BASE_URL) throw new Error("Base API URL is not defined. Please set VITE_API_BASE_URL in your .env file.");
  const token = getToken();
  if (!token) throw new Error("Authentication token not found. Please log in.");

  const response = await fetch(`${API_BASE_URL}${PRODUCTS_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status} - Failed to parse error response.` }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json(); // Assuming API returns the created product matching the Product interface
};

export const updateProduct = async (id: string, productData: UpdateProductData): Promise<Product> => {
  if (!API_BASE_URL) throw new Error("Base API URL is not defined");
  const token = getToken();
  if (!token) throw new Error("Authentication token not found");

  const response = await fetch(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status} - Failed to parse error response.` }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  if (response.status === 204) {
    return;
  } else if (response.ok) {
    return; 
  }
};

// Placeholder for deleteProduct
export const deleteProduct = async (id: string): Promise<void> => {
  if (!API_BASE_URL) throw new Error("Base API URL is not defined");
  const token = getToken();
  if (!token) throw new Error("Authentication token not found");

  const response = await fetch(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok && response.status !== 204) { // 204 No Content is a success for DELETE
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status} - Failed to parse error response.` }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  // For DELETE, typically no content is returned on success (204 No Content).
  // If the API *might* return a body on a 200 OK for a DELETE, that would be unusual but could be handled.
  // Given standard practices, we don't attempt to parse a body for 200/204 on DELETE.
  return; // Successfully deleted, no specific data to return
};

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  if (!API_BASE_URL) {
    throw new Error("Base API URL is not defined. Please set VITE_API_BASE_URL in your .env file.");
  }
  const API_URL = `${API_BASE_URL}${REVIEWS_ENDPOINT}/${productId}`;
  
  const response = await fetch(API_URL);
  
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

export const updateStockQuantity = async (productId: string, quantity: number, reason?: string): Promise<void> => {
  if (!API_BASE_URL) throw new Error("Base API URL is not defined");
  const token = getToken();
  if (!token) throw new Error("Authentication token not found");

  const payload: { quantity: number; reason?: string } = { quantity };
  if (reason) {
    payload.reason = reason;
  }

  const response = await fetch(`${API_BASE_URL}${INVENTORY_ENDPOINT}/${productId}/stock`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status} - Failed to parse error response.` }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  // Assuming a 200/204 response for successful PUT
};

export const updateLowStockThreshold = async (productId: string, threshold: number): Promise<void> => {
  if (!API_BASE_URL) throw new Error("Base API URL is not defined");
  const token = getToken();
  if (!token) throw new Error("Authentication token not found");

  const response = await fetch(`${API_BASE_URL}${INVENTORY_ENDPOINT}/${productId}/threshold`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ threshold }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status} - Failed to parse error response.` }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  // Assuming a 200/204 response for successful PUT
}

export const getLowStockProducts = async (page: number = 1, limit: number = 10): Promise<ProductsApiResponse> => {
  if (!API_BASE_URL) throw new Error("Base API URL is not defined");
  const token = getToken();
  if (!token) throw new Error("Authentication token not found. Please log in.");

  const API_URL = `${API_BASE_URL}${INVENTORY_ENDPOINT}/low-stock?page=${page}&limit=${limit}`;
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  const rawData = await response.json();
  // Specific mapping for the /low-stock endpoint structure
  return {
    products: rawData.products,    // Directly use rawData.products
    page: rawData.page,           // 'page' is correct
    limit: limit,                 // Add the request limit
    totalPages: rawData.pages,    // Map 'pages' to 'totalPages'
    totalItems: rawData.total     // Map 'total' to 'totalItems'
  };
};

export const getOutOfStockProducts = async (page: number = 1, limit: number = 10): Promise<ProductsApiResponse> => {
  if (!API_BASE_URL) throw new Error("Base API URL is not defined");
  const token = getToken();
  if (!token) throw new Error("Authentication token not found. Please log in.");

  const API_URL = `${API_BASE_URL}${INVENTORY_ENDPOINT}/out-of-stock?page=${page}&limit=${limit}`;
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  const rawData = await response.json();
  return {
    products: rawData.data,      // Map 'data' to 'products'
    page: rawData.page,           // 'page' is correct
    limit: limit,                 // Add the request limit
    totalPages: rawData.pages,    // Map 'pages' to 'totalPages'
    totalItems: rawData.total     // Map 'total' to 'totalItems'
  };
}; 