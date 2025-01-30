"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building,
  Settings,
  LogOut,
  Loader2 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Businesses', href: '/admin/businesses', icon: Building },
    { name: 'Settings', href: '/admin/settings', icon: Settings }
  ];

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) {
        setIsCheckingAdmin(false);
        return;
      }

      try {
        const adminDoc = await getDoc(doc(db, "admins", user.email));
        setIsAdmin(adminDoc.exists() && adminDoc.data()?.role === 'admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    if (user) {
      checkAdminStatus();
    } else {
      setIsCheckingAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !isCheckingAdmin) {
      if (!user && !pathname?.includes('/signin')) {
        router.push('/admin/signin');
      } else if (!isAdmin && !pathname?.includes('/signin')) {
        // Redirect non-admin users to home page
        router.push('/');
      }
    }
  }, [user, loading, isAdmin, isCheckingAdmin, pathname, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/admin/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading || isCheckingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Don't show layout for non-admin users
  if (!isAdmin && !pathname?.includes('/signin')) {
    return null;
  }

  // Don't show layout on signin page
  if (pathname?.includes('/signin')) {
    return children;
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
              className="flex items-center w-full px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50"
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