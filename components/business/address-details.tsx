import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const countries = [
  { id: "us", name: "United States" },
  { id: "uk", name: "United Kingdom" },
  { id: "ca", name: "Canada" },
]

interface AddressDetailsProps {
  onNext: (details: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }) => void
  onBack: () => void
}

export function AddressDetails({ onNext, onBack }: AddressDetailsProps) {
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({ street, city, state, postalCode, country })
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Residential Address
        </h2>
        <p className="text-gray-500 mt-2">Provide your residential address details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Street Address</label>
          <Input
            required
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Enter street address"
            className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">City</label>
            <Input 
              required 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              placeholder="Enter city" 
              className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">State/Province</label>
            <Input
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Enter state/province"
              className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Postal Code</label>
            <Input
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Enter postal code"
              className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <Select required value={country} onValueChange={setCountry}>
              <SelectTrigger className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            className="px-8"
          >
            Back
          </Button>
          <Button 
            type="submit" 
            disabled={!street || !city || !state || !postalCode || !country}
            className="px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}