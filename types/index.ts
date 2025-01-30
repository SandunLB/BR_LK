export interface Business {
  id: string;
  path: string;
  company?: {
    name: string;
    type: string;
    industry: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  owner?: Array<{
    id: string;
    fullName: string;
    ownership: string;
    birthDate?: string;
    documentUrl?: string;
    documentName?: string;
  }>;
  status: 'draft' | 'completed';
  paymentDetails?: {
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    stripePaymentIntentId: string;
    createdAt?: {
      seconds: number;
      nanoseconds: number;
    }
  };
  createdAt?: any;
  updatedAt?: any;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  providerData: Array<{
    providerId: string;
    [key: string]: any;
  }>;
  creationTime: string;
  lastSignInTime: string;
  businesses: Business[];
}

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