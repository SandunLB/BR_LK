'use client';

import { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function PhoneInput({ value, onChange, required = false }: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState('+94');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`${countryCode} ${e.target.value}`);
  };

  return (
    <div className="flex gap-2">
      <Select value={countryCode} onValueChange={setCountryCode}>
        <SelectTrigger className="w-24">
          <SelectValue placeholder="Code" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="+94">+94</SelectItem>
          <SelectItem value="+1">+1</SelectItem>
          <SelectItem value="+44">+44</SelectItem>
          <SelectItem value="+91">+91</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="tel"
        placeholder="71 234 5678"
        value={value.split(' ')[1] || ''}
        onChange={handlePhoneChange}
        required={required}
        className="flex-1"
      />
    </div>
  );
}