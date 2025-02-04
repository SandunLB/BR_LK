"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building,
  Settings,
  LogOut,
  Loader2 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Businesses', href: '/admin/businesses', icon: Building },
    { name: 'Settings', href: '/admin/settings', icon: Settings }
  ];

  useEffect(() => {
    if (!loading && !user && !pathname?.includes('/signin')) {
      router.push('/admin/signin');
    }
  }, [user, loading, pathname, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/admin/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Don't show layout on signin page
  if (pathname?.includes('/signin')) {
    return children;
  }

  // Don't show layout for non-authenticated users
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b">
            <span className="text-xl font-bold">Admin Panel</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 mt-4 rounded-md text-gray-600 hover:bg-gray-50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}