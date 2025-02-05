import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Sparkles } from "lucide-react"

const packages = [
  {
    id: "basic",
    name: "Basic",
    price: 599,
    description: "Essential features for small businesses",
    features: [
      { name: "Business Formation", included: true },
      { name: "EIN Registration", included: true },
      { name: "Registered Agent (1 year)", included: true },
      { name: "Operating Agreement", included: true },
      { name: "Banking Resolution", included: false },
      { name: "Priority Support", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 999,
    description: "Advanced features for growing businesses",
    recommended: true,
    features: [
      { name: "Business Formation", included: true },
      { name: "EIN Registration", included: true },
      { name: "Registered Agent (1 year)", included: true },
      { name: "Operating Agreement", included: true },
      { name: "Banking Resolution", included: true },
      { name: "Priority Support", included: true },
    ],
  },
]

interface PackageSelectionProps {
  onNext: (pkg: (typeof packages)[0]) => void
  onBack: () => void
  initialData?: { name: string; price: number }
}

export function PackageSelection({ onNext, onBack, initialData }: PackageSelectionProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(
    initialData ? packages.find((p) => p.name === initialData.name)?.id || null : null,
  )

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#3659fb] to-[#6384ff] bg-clip-text text-transparent">
          Select Your Package
        </h2>
        <p className="text-gray-500 mt-3">
          Choose a package that best suits your business needs. All packages include our core services.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`relative cursor-pointer transition-all h-full ${
              selectedPackage === pkg.id ? "ring-2 ring-indigo-600 border-transparent" : "hover:border-gray-300"
            }`}
            onClick={() => setSelectedPackage(pkg.id)}
            aria-label={`Select ${pkg.name} package`}
          >
            {pkg.recommended && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-[#3659fb] to-[#6384ff] text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  Recommended
                </div>
              </div>
            )}

            <CardHeader className="relative pb-4">
              <CardTitle className="flex items-center min-h-[28px]">
                <div className="flex flex-col flex-1">
                  <span className="text-2xl font-bold">{pkg.name}</span>
                  <span className="text-sm text-gray-500 mt-1">{pkg.description}</span>
                </div>
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    selectedPackage === pkg.id ? "bg-indigo-600" : "bg-transparent"
                  }`}
                >
                  {selectedPackage === pkg.id && <Check className="h-5 w-5 text-white" />}
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-indigo-600">${pkg.price}</span>
                  <span className="text-gray-500">one-time fee</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-3">
                    {pkg.features.map((feature) => (
                      <li
                        key={feature.name}
                        className={`flex items-center gap-3 ${feature.included ? "text-gray-900" : "text-gray-400"}`}
                      >
                        <div
                          className={`p-1 rounded-full flex-shrink-0 ${
                            feature.included ? "bg-green-100" : "bg-gray-100"
                          }`}
                        >
                          {feature.included ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <span className={`text-sm ${feature.included ? "font-medium" : ""}`}>{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onBack} className="px-8">
          Back
        </Button>
        <Button
          disabled={!selectedPackage}
          onClick={() => onNext(packages.find((p) => p.id === selectedPackage)!)}
          className="px-8 bg-gradient-to-r from-[#3659fb] to-[#6384ff] hover:from-[#4b6bff] hover:to-[#84a4ff]"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

