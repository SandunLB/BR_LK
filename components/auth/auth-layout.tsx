import Image from 'next/image';
import { Logo } from '@/components/auth/logo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="p-8 flex flex-col">
        <Logo />
        <div className="flex-1 flex flex-col justify-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">Your journey starts here</h1>
          <p className="text-gray-600 mb-8">
            Every great business starts with a solid foundation — let's build yours.
          </p>
          <div className="relative">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-7BhmPDJDAPiZ4gaPBF2wk5sZt47not.png"
              alt="Business illustration"
              className="w-full"
            />
          </div>
        </div>
      </div>
      <div className="bg-gray-50 p-8 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}

