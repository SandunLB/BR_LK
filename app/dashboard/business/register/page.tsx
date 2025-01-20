"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Stepper } from "@/components/business/stepper"
import { CountrySelection } from "@/components/business/country-selection"
import { PackageSelection } from "@/components/business/package-selection"
import { CompanyDetails } from "@/components/business/company-details"
import { OwnerInformation } from "@/components/business/owner-information"
import { AddressDetails } from "@/components/business/address-details"
import { Review } from "@/components/business/review"
import { Payment } from "@/components/business/payment"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// FormData interface remains the same
interface FormData {
  country?: {
    name: string
    price: number
  }
  package?: {
    name: string
    price: number
  }
  company?: {
    name: string
    type: string
    industry: string
  }
  owner?: {
    fullName: string
    ownership: number
    isCompany: boolean
    companyDetails?: {
      name: string
      registrationNumber: string
    }
  }
  address?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

const steps = [
  { id: 1, name: "Country", description: "Select country" },
  { id: 2, name: "Package", description: "Choose package" },
  { id: 3, name: "Company", description: "Company details" },
  { id: 4, name: "Owner", description: "Owner information" },
  { id: 5, name: "Address", description: "Address details" },
  { id: 6, name: "Review", description: "Review details" },
  { id: 7, name: "Payment", description: "Complete payment" },
  { id: 8, name: "Complete", description: "Registration complete" },
]

export default function BusinessRegistrationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({})

  const handleNext = (stepData: any) => {
    setFormData((prev) => {
      const newData = { ...prev }
      
      switch (currentStep) {
        case 1:
          newData.country = {
            name: stepData.name,
            price: stepData.price
          }
          break
        case 2:
          newData.package = {
            name: stepData.name,
            price: stepData.price
          }
          break
        case 3:
          newData.company = {
            name: stepData.name,
            type: stepData.type,
            industry: stepData.industry
          }
          break
        case 4:
          newData.owner = {
            fullName: stepData.fullName,
            ownership: stepData.ownership,
            isCompany: stepData.isCompany,
            ...(stepData.isCompany && {
              companyDetails: {
                name: stepData.companyDetails?.name,
                registrationNumber: stepData.companyDetails?.registrationNumber
              }
            })
          }
          break
        case 5:
          newData.address = {
            street: stepData.street,
            city: stepData.city,
            state: stepData.state,
            postalCode: stepData.postalCode,
            country: stepData.country
          }
          break
        default:
          Object.assign(newData, stepData)
      }
      
      return newData
    })
    setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    if (currentStep === 1) {
      router.push('/dashboard')
    } else {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleEdit = (step: number) => {
    setCurrentStep(step)
  }

  const getFirstIncompleteStep = (): number => {
    if (!formData.country) return 1
    if (!formData.package) return 2
    if (!formData.company) return 3
    if (!formData.owner) return 4
    if (!formData.address) return 5
    return 6
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CountrySelection onNext={handleNext} />
      case 2:
        return <PackageSelection onNext={handleNext} onBack={handleBack} />
      case 3:
        return <CompanyDetails onNext={handleNext} onBack={handleBack} />
      case 4:
        return <OwnerInformation onNext={handleNext} onBack={handleBack} />
      case 5:
        return <AddressDetails onNext={handleNext} onBack={handleBack} />
      case 6:
        if (!formData.country || !formData.package || !formData.company || 
            !formData.owner || !formData.address) {
          const firstIncompleteStep = getFirstIncompleteStep()
          setCurrentStep(firstIncompleteStep)
          return null
        }
        return (
          <Review 
            data={formData as Required<FormData>} 
            onNext={() => setCurrentStep(7)} 
            onBack={handleBack} 
            onEdit={handleEdit} 
          />
        )
      case 7:
        return (
          <Payment
            amount={(formData.country?.price || 0) + (formData.package?.price || 0)}
            onComplete={() => setCurrentStep(8)}
            onBack={handleBack}
          />
        )
      case 8:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Registration Complete!</h2>
            <p className="text-gray-600 mb-6">Thank you for registering your business with us.</p>
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Business Registration</h1>
          <p className="text-gray-500 mt-2">Complete the following steps to register your business.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Stepper steps={steps} currentStep={currentStep} />
            <div className="mt-8">
              {renderStep()}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}