'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Home, CreditCard, MessageSquare, Briefcase, Users, Settings, LogOut } from 'lucide-react';
import { Logo } from '@/components/auth/logo';
import { useAuth } from '@/hooks/use-auth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Communication', href: '/dashboard/communication', icon: MessageSquare },
  { name: 'My Business', href: '/dashboard/business', icon: Briefcase },
  { name: 'Affiliate Program', href: '/dashboard/affiliate', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex h-full w-72 flex-col bg-white border-r border-gray-200">
      <div className="flex h-20 items-center justify-center border-b border-gray-200">
        <div className="w-40 h-12 flex items-center justify-center">
          <Logo />
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-4 p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <Avatar className="h-12 w-12 ring-2 ring-indigo-600/10">
            <AvatarFallback className="text-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-medium truncate text-gray-900">
              {user.displayName || user.email?.split('@')[0]}
            </span>
            <span className="text-xs text-gray-500 truncate">{user.email}</span>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                isActive 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg' 
                  : 'text-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600'
              )}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 transition-colors", 
                  isActive 
                    ? "text-white" 
                    : "text-gray-400 group-hover:text-indigo-600"
                )} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </Button>
      </div>
    </div>
  );
}