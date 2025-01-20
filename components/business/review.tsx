"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ReviewProps {
  data: {
    country: {
      name: string
      price: number
    }
    package: {
      name: string
      price: number
    }
    company: {
      name: string
      type: string
      industry: string
    }
    owner: {
      fullName: string
      ownership: number
      isCompany: boolean
      companyDetails?: {
        name: string
        registrationNumber: string
      }
    }
    address: {
      street: string
      city: string
      state: string
      postalCode: string
      country: string
    }
  }
  onNext: () => void
  onBack: () => void
  onEdit: (step: number) => void
}

export function Review({ data, onNext, onBack, onEdit }: ReviewProps) {
  const missingFields = []
  if (!data.country) missingFields.push("Country")
  if (!data.package) missingFields.push("Package")
  if (!data.company) missingFields.push("Company Details")
  if (!data.owner) missingFields.push("Owner Information")
  if (!data.address) missingFields.push("Address Details")

  if (missingFields.length > 0) {
    console.error("Missing fields:", missingFields)
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Incomplete Data</h2>
        <p className="text-gray-600 mb-6">The following information is missing:</p>
        <ul className="list-disc list-inside mb-4">
          {missingFields.map((field) => (
            <li key={field}>{field}</li>
          ))}
        </ul>
        <p className="text-gray-600 mb-6">Please go back and fill in all required fields.</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    )
  }

  const totalCost = ((data.country?.price || 0) + (data.package?.price || 0)).toFixed(2)

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Total Cost Summary</h3>
        <p className="text-2xl font-bold">${totalCost}</p>
        <p className="text-sm text-gray-500">One-time fee</p>
      </div>
      <div>
        <h2 className="text-2xl font-bold">Review Your Information</h2>
        <p className="text-gray-500 mt-2">Please review all the information before proceeding to payment.</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Registration Details</span>
              <Button variant="ghost" className="text-indigo-600" onClick={() => onEdit(1)}>
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Country</dt>
                <dd className="mt-1">{data.country.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="mt-1">${data.country.price}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Package Details</span>
              <Button variant="ghost" className="text-indigo-600" onClick={() => onEdit(2)}>
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Package</dt>
                <dd className="mt-1">{data.package.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="mt-1">${data.package.price}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Company Details</span>
              <Button variant="ghost" className="text-indigo-600" onClick={() => onEdit(3)}>
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1">{data.company.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1">{data.company.type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Industry</dt>
                <dd className="mt-1">{data.company.industry}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Owner Details</span>
              <Button variant="ghost" className="text-indigo-600" onClick={() => onEdit(4)}>
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.owner.isCompany ? (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                    <dd className="mt-1">{data.owner.companyDetails?.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Registration Number</dt>
                    <dd className="mt-1">{data.owner.companyDetails?.registrationNumber}</dd>
                  </div>
                </>
              ) : (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1">{data.owner.fullName}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Ownership</dt>
                <dd className="mt-1">{data.owner.ownership}%</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Address Details</span>
              <Button variant="ghost" className="text-indigo-600" onClick={() => onEdit(5)}>
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Street Address</dt>
                <dd className="mt-1">{data.address.street}</dd>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">City</dt>
                  <dd className="mt-1">{data.address.city}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">State/Province</dt>
                  <dd className="mt-1">{data.address.state}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Postal Code</dt>
                  <dd className="mt-1">{data.address.postalCode}</dd>
                </div>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Country</dt>
                <dd className="mt-1">{data.address.country}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Proceed to Payment</Button>
      </div>
    </div>
  )
}

