// The standard structure of your Backend API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// Standard Error format
export interface ApiError {
  code: number;
  message: string;
  details?: Record<string, string[]>; // Validation errors
}

// User Identity Domain
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
}