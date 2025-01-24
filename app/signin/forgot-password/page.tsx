'use client';

import { useState, useRef, useEffect } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Focus on the email input when the page loads
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // Validate email format
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Handle password reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate email
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setIsButtonDisabled(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        'Password reset email sent. Please check your inbox (and spam folder) for instructions. If you don’t receive an email within a few minutes, please try again.'
      );
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsButtonDisabled(false), 30000); // Disable button for 30 seconds
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

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 text-red-500 p-4 rounded-lg text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        {/* Success Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-green-50 text-green-500 p-4 rounded-lg text-sm font-medium"
          >
            {message}
          </motion.div>
        )}

        {/* Reset Password Form */}
        <motion.form
          onSubmit={handleResetPassword}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 text-lg"
            aria-label="Email address"
            ref={emailInputRef}
          />

          <Button
            type="submit"
            disabled={isLoading || isButtonDisabled}
            className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-500"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Send Reset Email'
            )}
          </Button>
        </motion.form>

        {/* Back to Sign In Link */}
        <div className="text-center">
          <Link href="/signin" className="text-indigo-600 hover:text-indigo-500">
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  );
}