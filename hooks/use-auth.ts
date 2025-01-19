'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { AuthState, UserData } from '@/types/auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user: User | null) => {
        if (user) {
          const userData: UserData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            phoneNumber: user.phoneNumber,
          };
          setAuthState({ user: userData, loading: false, error: null });
        } else {
          setAuthState({ user: null, loading: false, error: null });
        }
      },
      (error) => {
        setAuthState({ user: null, loading: false, error: error.message });
      }
    );

    return () => unsubscribe();
  }, []);

  return authState;
}

