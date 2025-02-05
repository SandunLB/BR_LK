import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const countries = [
  {
    id: "us",
    name: "United States",
    code: "us",
    processingTime: "5-7 business days",
    features: ["LLC/Corporation Formation", "EIN Registration", "Registered Agent (1 year)", "Operating Agreement"],
  },
  {
    id: "uk",
    name: "United Kingdom",
    code: "gb",
    processingTime: "3-5 business days",
    features: ["Limited Company Formation", "VAT Registration", "Company Secretary", "Articles of Association"],
  },
]

interface CountrySelectionProps {
  onNext: (country: (typeof countries)[0]) => void
  initialData?: { name: string }
}

export function CountrySelection({ onNext, initialData }: CountrySelectionProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(
    initialData ? countries.find((c) => c.name === initialData.name)?.id || null : null,
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#3659fb] to-[#6384ff] bg-clip-text text-transparent">
          Select Country of Incorporation
        </h2>
        <p className="text-gray-500 mt-2">
          Choose where you want to register your business. Each jurisdiction has different requirements and benefits.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {countries.map((country) => (
          <Card
            key={country.id}
            className={`cursor-pointer transition-all relative overflow-hidden group h-full ${
              selectedCountry === country.id ? "ring-2 ring-indigo-600 border-transparent" : "hover:border-gray-300"
            }`}
            onClick={() => setSelectedCountry(country.id)}
            aria-label={`Select ${country.name}`}
          >
            {/* Background Flag */}
            <div
              className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
              style={{
                backgroundImage: `url(https://flagcdn.com/w640/${country.code.toLowerCase()}.png)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: "scale(1.2)",
                filter: "grayscale(30%)",
              }}
            />

            <CardHeader className="relative pb-4">
              <CardTitle className="flex items-center min-h-[28px]">
                <div className="flex items-center gap-2 flex-1">
                  <img
                    src={`https://flagcdn.com/24x18/${country.code.toLowerCase()}.png`}
                    alt={`${country.name} flag`}
                    className="w-6 h-auto rounded shadow-sm flex-shrink-0"
                  />
                  <span className="font-semibold">{country.name}</span>
                </div>
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    selectedCountry === country.id ? "bg-indigo-600" : "bg-transparent"
                  }`}
                >
                  {selectedCountry === country.id && <Check className="h-5 w-5 text-white" />}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                <div className="text-sm text-gray-500">Processing time: {country.processingTime}</div>
                <ul className="space-y-2">
                  {country.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <div className="bg-green-100 p-1 rounded-full flex-shrink-0">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          className="px-8 bg-[#3659fb] hover:bg-[#4b6bff] text-white transition-colors duration-200"
          disabled={!selectedCountry}
          onClick={() => onNext(countries.find((c) => c.id === selectedCountry)!)}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

