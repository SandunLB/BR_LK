'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/signin');
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button
            onClick={() => auth.signOut()}
            variant="outline"
          >
            Sign Out
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user.displayName || user.email}</h2>
          <p className="text-gray-600">Your account details:</p>
          <ul className="mt-4 space-y-2">
            <li><strong>Email:</strong> {user.email}</li>
            <li><strong>User ID:</strong> {user.uid}</li>
            {user.phoneNumber && (
              <li><strong>Phone:</strong> {user.phoneNumber}</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

