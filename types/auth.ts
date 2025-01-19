export interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    phoneNumber: string | null;
  }
  
  export interface AuthState {
    user: UserData | null;
    loading: boolean;
    error: string | null;
  }
  
  