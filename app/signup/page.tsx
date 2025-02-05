'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { parsePhoneNumberFromString, AsYouType, getExampleNumber, CountryCode } from 'libphonenumber-js/max';
import examples from 'libphonenumber-js/mobile/examples';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, EyeIcon, EyeOffIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface Country {
  code: string;
  name: string;
  flag: string;
  countryCode: CountryCode;
  example?: string;
  format?: string;
}

interface UnifiedPhoneInputProps {
  value: string;
  countryCode: string;
  onChange: (phoneNumber: string) => void;
  onCountryChange: (code: string) => void;
  countries: Country[];
  required?: boolean;
  error?: string;
}

const UnifiedPhoneInput = ({
  value,
  countryCode,
  onChange,
  onCountryChange,
  countries,
  required,
  error
}: UnifiedPhoneInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = countries.find(c => c.code === countryCode);
  const asYouType = new AsYouType(selectedCountry?.countryCode || undefined);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = asYouType.input(e.target.value);
    onChange(formatted);
  };

  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.code.includes(search)
  );

  const handleContainerClick = () => {
    if (!isFocused) {
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-1">
      <div 
        ref={containerRef}
        className={`
          relative flex rounded-md border transition-colors
          ${isFocused ? 'ring-2 ring-offset-2 ring-ring ring-offset-background border-input' : 'border-input'}
          ${error ? 'border-red-500' : ''}
          ${isOpen ? 'z-50' : 'z-0'}
        `}
        onClick={handleContainerClick}
      >
        <div
          className="flex items-center gap-2 px-3 min-w-[120px] cursor-pointer bg-transparent"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedCountry && (
            <Image
              src={selectedCountry.flag}
              alt={`${selectedCountry.name} flag`}
              width={16}
              height={12}
              className="object-cover"
            />
          )}
          <span className="text-sm">{countryCode}</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>

        <div className="w-px bg-input self-stretch" />

        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="tel"
            value={value}
            onChange={handlePhoneChange}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 text-sm bg-transparent outline-none rounded-r-md"
            placeholder={selectedCountry?.format || "Phone number"}
            required={required}
          />
        </div>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute left-0 top-full mt-1 w-64 bg-white border rounded-md shadow-lg max-h-72 overflow-auto"
          >
            <div className="p-2 sticky top-0 bg-white border-b">
              <Input
                type="text"
                placeholder="Search countries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            {filteredCountries.map((country) => (
              <div
                key={country.code}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                onClick={() => {
                  onCountryChange(country.code);
                  onChange(''); // Clear phone number when country changes
                  setIsOpen(false);
                  setSearch('');
                  inputRef.current?.focus();
                }}
              >
                <Image
                  src={country.flag}
                  alt={`${country.name} flag`}
                  width={16}
                  height={12}
                  className="object-cover"
                />
                <span className="text-sm text-gray-600">{country.code}</span>
                <span className="text-sm">{country.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default function SignUpPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    validatePhoneNumber();
  }, [phoneNumber, countryCode]);

  const validatePhoneNumber = () => {
    if (!phoneNumber) {
      setPhoneError('');
      return;
    }

    const selectedCountry = countries.find(c => c.code === countryCode);
    if (!selectedCountry) return;

    const phoneNumberWithCountry = `${countryCode}${phoneNumber}`;
    const parsedNumber = parsePhoneNumberFromString(phoneNumberWithCountry);

    if (!parsedNumber?.isValid()) {
      setPhoneError('Please enter a valid phone number');
    } else {
      setPhoneError('');
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,idd,cca2');
      const data = await response.json();
      
      const processedCountries = await Promise.all(
        data
          .filter((country: any) => country.idd?.root)
          .map(async (country: any) => {
            const countryCode = country.cca2 as CountryCode;
            const dialCode = `${country.idd.root}${country.idd.suffixes ? country.idd.suffixes[0] : ''}`;
            
            let example = '';
            let format = '';
            
            try {
              const exampleNumber = getExampleNumber(countryCode, examples);
              if (exampleNumber) {
                example = exampleNumber.formatNational();
                format = exampleNumber.formatNational();
              }
            } catch (error) {
              console.error(`Error getting example for ${countryCode}:`, error);
            }

            return {
              code: dialCode,
              name: country.name.common,
              flag: country.flags.svg,
              countryCode,
              example,
              format
            };
          })
      );

      const sortedCountries = processedCountries.sort((a, b) => a.name.localeCompare(b.name));
      setCountries(sortedCountries);
      
      if (sortedCountries.length > 0) {
        setCountryCode(sortedCountries[0].code);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      setError('Failed to load country codes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    router.push('/dashboard');
    return null;
  }

  if (loading) {
    return (
      <AuthLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </AuthLayout>
    );
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (phoneError) {
      setError('Please fix the errors before submitting');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      const phoneNumberWithCountry = `${countryCode}${phoneNumber}`;
      const parsedNumber = parsePhoneNumberFromString(phoneNumberWithCountry);
      const formattedPhone = parsedNumber?.format('E.164') || phoneNumberWithCountry;

      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        phone: formattedPhone,
        createdAt: new Date().toISOString(),
      });

      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName,
        createdAt: new Date().toISOString(),
      });

      router.push('/dashboard');
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
        className="space-y-8 transform scale-120"
      >
        <div className="space-y-3 text-center">
          <h2 className="text-4xl font-bold tracking-tight">Let's get started!</h2>
          <p className="text-lg text-gray-600">
            Already have an account?{' '}
            <Link href="/signin" className="text-[#3659fb] hover:text-[#2944c7] font-medium transition-colors">
              Sign in
            </Link>
          </p>
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

        <form onSubmit={handleEmailSignUp} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.00 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Input
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="h-12 text-lg"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.00 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Input
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="h-12 text-lg"
              />
            </motion.div>
          </div>

          <motion.div
            whileHover={{ scale: 1.00 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <UnifiedPhoneInput
              value={phoneNumber}
              countryCode={countryCode}
              onChange={setPhoneNumber}
              onCountryChange={setCountryCode}
              countries={countries}
              required
              error={phoneError}
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.00 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 text-lg"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.00 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="relative"
          >
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 text-lg pr-12"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button type="submit" className="w-full h-12 text-lg bg-[#3659fb] hover:bg-[#4b6bff] transition-colors">
              Sign up
            </Button>
          </motion.div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-50 text-gray-500">Or continue with</span>
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full h-12 text-lg bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
          >
            <div className="flex items-center justify-center w-full">
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </div>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <p className="text-center text-sm text-gray-500">
            Copyright © 2025 BR.LK
          </p>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
}