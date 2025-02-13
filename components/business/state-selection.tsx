import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search } from 'lucide-react';

// Define state data with prices
const states = [
  { name: "Alabama", price: 99 },
  { name: "Alaska", price: 149 },
  { name: "Arizona", price: 129 },
  { name: "Arkansas", price: 89 },
  { name: "California", price: 199 },
  { name: "Colorado", price: 139 },
  { name: "Connecticut", price: 159 },
  { name: "Delaware", price: 179 },
  { name: "Florida", price: 169 },
  { name: "Georgia", price: 119 },
  { name: "Hawaii", price: 189 },
  { name: "Idaho", price: 99 },
  { name: "Illinois", price: 149 },
  { name: "Indiana", price: 109 },
  { name: "Iowa", price: 89 },
  { name: "Kansas", price: 99 },
  { name: "Kentucky", price: 109 },
  { name: "Louisiana", price: 119 },
  { name: "Maine", price: 129 },
  { name: "Maryland", price: 149 },
  { name: "Massachusetts", price: 169 },
  { name: "Michigan", price: 139 },
  { name: "Minnesota", price: 129 },
  { name: "Mississippi", price: 89 },
  { name: "Missouri", price: 109 },
  { name: "Montana", price: 99 },
  { name: "Nebraska", price: 89 },
  { name: "Nevada", price: 159 },
  { name: "New Hampshire", price: 139 },
  { name: "New Jersey", price: 179 },
  { name: "New York", price: 199 },
  { name: "North Carolina", price: 129 },
  { name: "North Dakota", price: 89 },
  { name: "Ohio", price: 139 },
  { name: "Oklahoma", price: 99 },
  { name: "Oregon", price: 129 },
  { name: "Pennsylvania", price: 159 },
  { name: "Rhode Island", price: 149 },
  { name: "South Carolina", price: 119 },
  { name: "South Dakota", price: 89 },
  { name: "Tennessee", price: 129 },
  { name: "Texas", price: 179 },
  { name: "Utah", price: 119 },
  { name: "Vermont", price: 129 },
  { name: "Virginia", price: 149 },
  { name: "Washington", price: 169 },
  { name: "West Virginia", price: 99 },
  { name: "Wisconsin", price: 129 },
  { name: "Wyoming", price: 109 }
].sort((a, b) => a.name.localeCompare(b.name));

interface StateSelectionProps {
  onNext: (data: { name: string; price: number }) => void;
  onBack: () => void;
  initialData?: { name: string; price: number };
}

export function StateSelection({ onNext, onBack, initialData }: StateSelectionProps) {
  const [selectedState, setSelectedState] = useState<string>(initialData?.name || '');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStates = states.filter(state =>
    state.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinue = () => {
    const stateData = states.find(state => state.name === selectedState);
    if (stateData) {
      onNext(stateData);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#3659fb] to-[#6384ff] bg-clip-text text-transparent">
          Choose a State for your Business Registration
        </h2>
        <p className="text-gray-500 mt-2">
          Select the state where you want to register your business. Each state has different registration fees.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search states..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Selected State Summary */}
      {selectedState && (
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-600" />
                <span className="font-medium text-indigo-900">Selected State: {selectedState}</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-indigo-600">Registration Fee</p>
                <p className="text-lg font-bold text-indigo-700">
                  ${states.find(state => state.name === selectedState)?.price}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* States Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStates.map((state) => (
          <Card 
            key={state.name}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedState === state.name 
                ? 'border-2 border-indigo-600 bg-indigo-50' 
                : 'hover:border-indigo-200'
            }`}
            onClick={() => setSelectedState(state.name)}
          >
            <CardHeader className="p-4">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <MapPin className={`h-4 w-4 ${
                    selectedState === state.name ? 'text-indigo-600' : 'text-gray-400'
                  }`} />
                  {state.name}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className={`text-xl font-bold ${
                selectedState === state.name ? 'text-indigo-600' : 'text-gray-700'
              }`}>
                ${state.price}
              </p>
              <p className="text-sm text-gray-500">Registration fee</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results Message */}
      {filteredStates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No states found matching your search.</p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <Button variant="outline" onClick={onBack} className="px-8">
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedState}
          className="px-8 bg-[#3659fb] hover:bg-[#4b6bff] text-white transition-colors duration-200"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}