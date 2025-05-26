import { getToken } from "./loginService"; // For authenticated actions

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const INSTAGRAM_POSTS_ENDPOINT = "/instagram";

export interface InstagramPost {
  id: string;
  postId: string;
  link: string;
  alt: string;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
}

export interface InstagramPostsApiResponse {
  posts: InstagramPost[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

// DTO for creating an Instagram post
export interface CreateInstagramPostData {
  postId: string;
  link: string;
  imageUrl: string;
  alt?: string; // Alt text might be optional on creation
}

// DTO for updating an Instagram post (all fields typically optional)
export type UpdateInstagramPostData = Partial<CreateInstagramPostData>;

export const getInstagramPosts = async (page: number = 1, limit: number = 12): Promise<InstagramPostsApiResponse> => {
  if (!API_BASE_URL) {
    throw new Error("Base API URL is not defined. Please set VITE_API_BASE_URL in your .env file.");
  }
  const API_URL = `${API_BASE_URL}${INSTAGRAM_POSTS_ENDPOINT}?page=${page}&limit=${limit}`;
  
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

// Create Instagram Post (Staff only - assuming staff token is required)
export const createInstagramPost = async (postData: CreateInstagramPostData): Promise<InstagramPost> => {
  if (!API_BASE_URL) throw new Error("Base API URL is not defined");
  const token = getToken(); // Assumes staff/admin token is available via getToken()
  if (!token) throw new Error("Authentication token not found. Please log in as staff/admin.");

  const response = await fetch(`${API_BASE_URL}${INSTAGRAM_POSTS_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    throw new Error(errorData.message || `Failed to create Instagram post: ${response.status}`);
  }
  return response.json();
};

// Update Instagram Post (Staff only)
export const updateInstagramPost = async (id: string, postData: UpdateInstagramPostData): Promise<InstagramPost> => {
  if (!API_BASE_URL) throw new Error("Base API URL is not defined");
  const token = getToken();
  if (!token) throw new Error("Authentication token not found. Please log in as staff/admin.");

  const response = await fetch(`${API_BASE_URL}${INSTAGRAM_POSTS_ENDPOINT}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    throw new Error(errorData.message || `Failed to update Instagram post: ${response.status}`);
  }
  return response.json();
};

// Delete Instagram Post (Staff only)
export const deleteInstagramPost = async (id: string): Promise<void> => {
  if (!API_BASE_URL) throw new Error("Base API URL is not defined");
  const token = getToken();
  if (!token) throw new Error("Authentication token not found. Please log in as staff/admin.");

  const response = await fetch(`${API_BASE_URL}${INSTAGRAM_POSTS_ENDPOINT}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) { // 204 No Content is a success for DELETE
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    throw new Error(errorData.message || `Failed to delete Instagram post: ${response.status}`);
  }
  // No content expected on successful delete (204) or potentially 200 OK
  return;
}; 