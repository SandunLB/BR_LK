import Image from 'next/image';
import { Logo } from '@/components/auth/logo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="p-12 flex flex-col">
        <Logo />
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-[480px]">
            <h1 className="text-[64px] leading-[1.1] font-bold tracking-tight">
            Start Your Global Business Journey Today
            </h1>
            <p className="text-xl mt-6 text-gray-600">
            We help international entrepreneurs establish their business presence in the UK and USA.
            </p>
          </div>
          <div className="relative mt-16">
            <Image
              src="/side_hero.png"
              alt="Business illustration"
              width={720}
              height={480}
              priority
              className="w-full max-w-[720px]"
            />
          </div>
        </div>
      </div>
      <div className="bg-gray-50 p-12 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}