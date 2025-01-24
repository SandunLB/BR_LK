// app/signin/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-bold">Forgot Password</h2>
          <p className="text-gray-600">Enter your email to reset your password.</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 text-red-500 p-4 rounded-lg text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        {message && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-green-50 text-green-500 p-4 rounded-lg text-sm font-medium"
          >
            {message}
          </motion.div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-6">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 text-lg"
          />

          <Button type="submit" className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-500">
            Send Reset Email
          </Button>
        </form>

        <div className="text-center">
          <Link href="/signin" className="text-indigo-600 hover:text-indigo-500">
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  );
}