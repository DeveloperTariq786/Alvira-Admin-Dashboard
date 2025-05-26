const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${BASE_API_URL}/categories`;

export interface Category {
  id: string;
  name: string;
  image: string;
  type: 'featured' | 'small' | 'horizontal';
}

export interface NewCategory {
    name: string;
    image: string;
    type: 'featured' | 'small' | 'horizontal';
}

// Get all categories
export const getCategories = async (type?: string): Promise<Category[]> => {
  const queryParams = type ? `?type=${type}` : '';
  const response = await fetch(`${API_URL}${queryParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
};

// Get category by ID
export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch category');
  }
  return response.json();
};

// Create a new category
export const createCategory = async (category: NewCategory, token: string): Promise<Category> => {
  const response = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(category),
  });
  if (!response.ok) {
    throw new Error('Failed to create category');
  }
  return response.json();
};

// Update a category
export const updateCategory = async (id: string, category: Partial<NewCategory>, token: string): Promise<Category> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(category),
  });
  if (!response.ok) {
    throw new Error('Failed to update category');
  }
  return response.json();
};

// Delete a category
export const deleteCategory = async (id: string, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to delete category');
  }
}; 