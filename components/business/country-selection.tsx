"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const countries = [
  {
    id: "us",
    name: "United States",
    price: 599,
    processingTime: "5-7 business days",
    features: ["LLC/Corporation Formation", "EIN Registration", "Registered Agent (1 year)", "Operating Agreement"],
  },
  {
    id: "uk",
    name: "United Kingdom",
    price: 499,
    processingTime: "3-5 business days",
    features: ["Limited Company Formation", "VAT Registration", "Company Secretary", "Articles of Association"],
  },
]

interface CountrySelectionProps {
  onNext: (country: (typeof countries)[0]) => void
}

export function CountrySelection({ onNext }: CountrySelectionProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Select Country of Incorporation</h2>
        <p className="text-gray-500 mt-2">
          Choose where you want to register your business. Each jurisdiction has different requirements and benefits.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {countries.map((country) => (
          <Card
            key={country.id}
            className={`cursor-pointer transition-colors ${
              selectedCountry === country.id ? "border-indigo-600 bg-indigo-50" : "hover:border-gray-300"
            }`}
            onClick={() => setSelectedCountry(country.id)}
            aria-label={`Select ${country.name}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{country.name}</span>
                {selectedCountry === country.id && <Check className="h-5 w-5 text-indigo-600" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className="text-2xl font-bold">${country.price}</span>
                  <span className="text-gray-500 ml-2">one-time fee</span>
                </div>
                <div className="text-sm text-gray-500">Processing time: {country.processingTime}</div>
                <ul className="space-y-2">
                  {country.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        className="w-full md:w-auto"
        disabled={!selectedCountry}
        onClick={() => onNext(countries.find((c) => c.id === selectedCountry)!)}
      >
        Continue
      </Button>
    </div>
  )
}

