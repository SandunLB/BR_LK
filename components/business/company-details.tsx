"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const companyTypes = [
  { id: "llc", name: "Limited Liability Company (LLC)" },
  { id: "corp", name: "Corporation" },
  { id: "partnership", name: "Partnership" },
]

const industries = [
  { id: "tech", name: "Technology" },
  { id: "retail", name: "Retail" },
  { id: "healthcare", name: "Healthcare" },
  { id: "finance", name: "Finance" },
  { id: "other", name: "Other" },
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Company Details</h2>
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
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Company Type</label>
          <Select required value={type} onValueChange={setType}>
            <SelectTrigger>
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
            <SelectTrigger>
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

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={!name || !type || !industry}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

