export interface AdminUser {
    email: string;
    role: 'admin';
    createdAt: any;
  }
  
  export interface AuthState {
    isLoading: boolean;
    isAdmin: boolean;
    error: string | null;
    user: any;
  }