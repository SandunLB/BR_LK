"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

interface OwnerInformationProps {
  onNext: (details: {
    fullName: string
    ownership: number
    isCompany: boolean
    companyDetails?: {
      name: string
      registrationNumber: string
    }
  }) => void
  onBack: () => void
}

export function OwnerInformation({ onNext, onBack }: OwnerInformationProps) {
  const [fullName, setFullName] = useState("")
  const [ownership, setOwnership] = useState("100")
  const [isCompany, setIsCompany] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [ownershipError, setOwnershipError] = useState("")

  const handleOwnershipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setOwnership(value)
    if (Number.parseInt(value) < 0 || Number.parseInt(value) > 100) {
      setOwnershipError("Ownership must be between 0 and 100")
    } else {
      setOwnershipError("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({
      fullName,
      ownership: Number(ownership),
      isCompany,
      ...(isCompany && {
        companyDetails: {
          name: companyName,
          registrationNumber,
        },
      }),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Owner Information</h2>
        <p className="text-gray-500 mt-2">Provide details about the business owner.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isCompany"
            checked={isCompany}
            onCheckedChange={(checked) => setIsCompany(checked as boolean)}
          />
          <label
            htmlFor="isCompany"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Owner is a company
          </label>
        </div>

        {isCompany ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Registration Number</label>
              <Input
                required
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="Enter registration number"
              />
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Ownership Percentage</label>
          <Input
            required
            type="number"
            min="0"
            max="100"
            value={ownership}
            onChange={handleOwnershipChange}
            placeholder="Enter ownership percentage"
          />
          {ownershipError && <p className="text-sm text-red-500">{ownershipError}</p>}
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={!ownership || (isCompany ? !companyName || !registrationNumber : !fullName)}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

