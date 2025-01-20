"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

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
}

export function PackageSelection({ onNext, onBack }: PackageSelectionProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Select Your Package</h2>
        <p className="text-gray-500 mt-2">Choose a package that best suits your business needs.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`cursor-pointer transition-colors ${
              selectedPackage === pkg.id ? "border-indigo-600 bg-indigo-50" : "hover:border-gray-300"
            }`}
            onClick={() => setSelectedPackage(pkg.id)}
            aria-label={`Select ${pkg.name} package`}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{pkg.name}</span>
                {selectedPackage === pkg.id && <Check className="h-5 w-5 text-indigo-600" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className="text-2xl font-bold">${pkg.price}</span>
                  <span className="text-gray-500 ml-2">one-time fee</span>
                </div>
                <p className="text-sm text-gray-500">{pkg.description}</p>
                <ul className="space-y-2">
                  {pkg.features.map((feature) => (
                    <li key={feature.name} className="flex items-center gap-2">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-gray-300" />
                      )}
                      <span className="text-sm">{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button disabled={!selectedPackage} onClick={() => onNext(packages.find((p) => p.id === selectedPackage)!)}>
          Continue
        </Button>
      </div>
    </div>
  )
}

