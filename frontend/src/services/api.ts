const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getTours = async () => {
  const response = await fetch(`${API_BASE_URL}/tours`);
  if (!response.ok) {
    throw new Error('Failed to fetch tours');
  }
  return response.json();
};
export const getTourById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/tours/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tour');
  }
  return response.json();
};

// TODO: Implement search functionality for the test
export const searchTours = async (params: {
  name?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
}) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/tours/search?${searchParams}`);
  if (!response.ok) {
    throw new Error('Failed to search tours');
  }
  return response.json();
};

export const loginUser = async (email: string, password: string) => {
  // Check if using mock auth mode
  if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
    // Mock login for JSON Server mode
    if (email === 'test@example.com' && password === 'password') {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser'
      };
      localStorage.setItem('mockUser', JSON.stringify(user));
      return { user, token: 'mock-jwt-token' };
    } else {
      throw new Error('Invalid credentials');
    }
  }

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  return response.json();
};
