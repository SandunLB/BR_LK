import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Rocket, Plane, ScrollText } from "lucide-react";

interface Feature {
  name: string;
  included: boolean;
}

interface Package {
  id: string;
  name: string;
  price: number;
  subtitle: string;
  plan: string;
  priceNote?: string;
  description?: string;
  recommended?: boolean;
  features: Feature[];
}

type CountryPackages = {
  "United States": Package[];
  "United Kingdom": Package[];
};

const countryPackages: CountryPackages = {
  "United States": [
    {
      id: "basic",
      name: "Paperplane",
      price: 129,
      subtitle: "For the small",
      plan: "Basic",
      description: "Essential features for small businesses",
      priceNote: "+ State Fees",
      features: [
        { name: "Articles of Organization", included: true },
        { name: "EIN Business Tax Number", included: true },
        { name: "Lifetime Compliance Alerts", included: true },
        { name: "Business Banking Account Offer", included: true },
        { name: "US Address with Mail forwarding", included: true },
        { name: "Business Tax Consultation", included: true },
        { name: "Incorporation documents", included: true },
      ],
    },
    {
      id: "growth",
      name: "Plane",
      price: 159,
      subtitle: "For startups",
      plan: "Growth",
      description: "Advanced features for growing businesses",
      priceNote: "+ State Fees",
      recommended: true,
      features: [
        { name: "Order priority", included: true },
        { name: "Articles of Organization", included: true },
        { name: "Fast EIN Business Tax Number", included: true },
        { name: "BOI Reporting", included: true },
        { name: "Lifetime Compliance Alerts", included: true },
        { name: "Business Banking Account Offer", included: true },
        { name: "Business Tax Consultation", included: true },
        { name: "Incorporation documents", included: true },
      ],
    },
    {
      id: "enterprise",
      name: "Rocket",
      price: 599,
      subtitle: "For business",
      plan: "Enterprise",
      description: "Complete solution for established businesses",
      priceNote: "+ State Fees",
      features: [
        { name: "Order priority", included: true },
        { name: "Articles of Organization", included: true },
        { name: "Fast EIN Business Tax Number", included: true },
        { name: "BOI Reporting", included: true },
        { name: "Lifetime Compliance Alerts", included: true },
        { name: "Business Banking Account Offer", included: true },
        { name: "Incorporation documents", included: true },
        { name: "ITIN Number", included: true },
        { name: "DUNS Number", included: true },
      ],
    },
  ],
  "United Kingdom": [
    {
      id: "basic",
      name: "Paperplane",
      price: 99,
      subtitle: "For the small",
      plan: "Basic",
      description: "Essential features for small businesses",
      features: [
        { name: "Company formation and documents", included: true },
        { name: "Registered office address", included: true },
        { name: "Bank account: Stripe + payoneer", included: true },
        { name: "Certificate of Incorporation", included: true },
        { name: "Lifetime Compliance Alerts", included: true },
      ],
    },
    {
      id: "growth",
      name: "Plane",
      price: 197,
      subtitle: "For startups",
      plan: "Growth",
      description: "Advanced features for growing businesses",
      recommended: true,
      features: [
        { name: "Order priority", included: true },
        { name: "Company formation and documents", included: true },
        { name: "FREE UK Business Address", included: true },
        { name: "Bank account: Stripe + payoneer", included: true },
        { name: "Certificate of Incorporation", included: true },
        { name: "Priority customer support", included: true },
      ],
    },
    {
      id: "enterprise",
      name: "Rocket",
      price: 207,
      subtitle: "For business",
      plan: "Enterprise",
      description: "Complete solution for established businesses",
      features: [
        { name: "Order priority", included: true },
        { name: "FREE UK Phone number", included: true },
        { name: "FREE UK Business Address", included: true },
        { name: "Company formation and documents", included: true },
        { name: "Bank account: Stripe + payoneer", included: true },
        { name: "Certificate of Incorporation", included: true },
        { name: "Priority customer support", included: true },
      ],
    },
  ],
};

interface PackageSelectionProps {
  onNext: (pkg: Package) => void;
  onBack: () => void;
  initialData?: { name: string; price: number };
  selectedCountry?: string;
}

export function PackageSelection({
  onNext,
  onBack,
  initialData,
  selectedCountry = "United States",
}: PackageSelectionProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // Get packages based on selected country
  const packages =
    selectedCountry === "United Kingdom"
      ? countryPackages["United Kingdom"]
      : countryPackages["United States"];

  // Set initial package if provided
  useEffect(() => {
    if (initialData) {
      const pkg = packages.find((p) => p.name === initialData.name);
      if (pkg) {
        setSelectedPackage(pkg.id);
      }
    }
  }, [initialData, packages]);

  const getPackageIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "paperplane":
        return <ScrollText className="h-6 w-6" />;
      case "plane":
        return <Plane className="h-6 w-6" />;
      case "rocket":
        return <Rocket className="h-6 w-6" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#3659fb] to-[#6384ff] bg-clip-text text-transparent">
          Select Your Package
        </h2>
        <p className="text-gray-500 mt-3">
          Choose a package that best suits your business needs in{" "}
          {selectedCountry}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`relative cursor-pointer transition-all h-full ${
              selectedPackage === pkg.id
                ? "ring-2 ring-indigo-600 border-transparent"
                : "hover:border-gray-300"
            }`}
            onClick={() => setSelectedPackage(pkg.id)}
          >
            {pkg.recommended && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-[#3659fb] to-[#6384ff] text-white px-4 py-1 rounded-full text-sm font-medium">
                  Recommended
                </div>
              </div>
            )}

            <CardHeader className="pb-4">
              <CardTitle className="space-y-2">
                <div className="flex items-center gap-2">
                  {getPackageIcon(pkg.name)}
                  <span className="text-2xl font-bold">{pkg.name}</span>
                </div>
                <div className="text-sm text-gray-500">{pkg.subtitle}</div>
                <div className="text-lg font-medium text-indigo-600">
                  {pkg.plan}
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-indigo-600">
                    ${pkg.price}
                  </span>
                  {pkg.priceNote && (
                    <span className="text-gray-500">{pkg.priceNote}</span>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium mb-4">What's included:</p>
                  <ul className="space-y-3">
                    {pkg.features.map((feature) => (
                      <li
                        key={feature.name}
                        className="flex items-center gap-3"
                      >
                        <div className="bg-green-100 p-1 rounded-full flex-shrink-0">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm">{feature.name}</span>
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
          onClick={() => {
            const selected = packages.find((p) => p.id === selectedPackage);
            if (selected) onNext(selected);
          }}
          className="px-8 bg-[#3659fb] hover:bg-[#4b6bff] text-white transition-colors duration-200"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

export default PackageSelection;
