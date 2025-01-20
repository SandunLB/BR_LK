import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const companyTypes = [
  { id: "llc", name: "Limited Liability Company (LLC)" },
  { id: "l.l.c", name: "Limited Liability Company (L.L.C.)" },
]

const industries = [
    // Agriculture, Forestry, Fishing and Hunting
    { id: "agriculture", name: "Agriculture, Forestry & Fishing" },
    
    // Mining and Energy
    { id: "mining", name: "Mining & Quarrying" },
    { id: "energy", name: "Energy & Utilities" },
    
    // Manufacturing
    { id: "manufacturing", name: "Manufacturing" },
    { id: "food_manufacturing", name: "Food & Beverage Manufacturing" },
    { id: "textile", name: "Textile & Apparel" },
    
    // Construction
    { id: "construction", name: "Construction" },
    { id: "real_estate", name: "Real Estate & Property" },
    
    // Trade
    { id: "wholesale", name: "Wholesale Trade" },
    { id: "retail", name: "Retail Trade" },
    
    // Transportation and Storage
    { id: "transportation", name: "Transportation & Logistics" },
    { id: "warehouse", name: "Warehousing & Storage" },
    
    // Services
    { id: "accommodation", name: "Accommodation & Food Services" },
    { id: "information", name: "Information & Media" },
    { id: "telecom", name: "Telecommunications" },
    { id: "tech", name: "Information Technology" },
    { id: "software", name: "Software Development" },
    { id: "finance", name: "Financial Services" },
    { id: "insurance", name: "Insurance" },
    { id: "real_estate_services", name: "Real Estate Services" },
    { id: "professional", name: "Professional Services" },
    { id: "scientific", name: "Scientific & Technical Services" },
    { id: "legal", name: "Legal Services" },
    { id: "consulting", name: "Business Consulting" },
    { id: "administrative", name: "Administrative Services" },
    
    // Healthcare
    { id: "healthcare", name: "Healthcare & Medical" },
    { id: "social_assistance", name: "Social Assistance" },
    
    // Entertainment and Recreation
    { id: "arts", name: "Arts & Entertainment" },
    { id: "recreation", name: "Recreation & Sports" },
    
    // Education
    { id: "education", name: "Education & Training" },
    
    // Other Services
    { id: "repair", name: "Repair & Maintenance" },
    { id: "personal_services", name: "Personal Services" },
    { id: "nonprofit", name: "Non-Profit Organization" },
    { id: "other", name: "Other Services" }
  ]

interface CompanyDetailsProps {
  onNext: (details: {
    name: string
    type: string
    industry: string
  }) => void
  onBack: () => void
}

export function CompanyDetails({ onNext, onBack }: CompanyDetailsProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [industry, setIndustry] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({ name, type, industry })
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Company Details
        </h2>
        <p className="text-gray-500 mt-2">Provide information about your company.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Company Name</label>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your company name"
            className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Company Type</label>
          <Select required value={type} onValueChange={setType}>
            <SelectTrigger className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600">
              <SelectValue placeholder="Select company type" />
            </SelectTrigger>
            <SelectContent>
              {companyTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Industry</label>
          <Select required value={industry} onValueChange={setIndustry}>
            <SelectTrigger className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry.id} value={industry.id}>
                  {industry.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            disabled={!name || !type || !industry}
            className="px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}