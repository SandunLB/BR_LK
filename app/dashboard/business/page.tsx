"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Stepper } from "@/components/business/stepper"
import { CountrySelection } from "@/components/business/country-selection"
import { PackageSelection } from "@/components/business/package-selection"
import { CompanyDetails } from "@/components/business/company-details"
import { OwnerInformation } from "@/components/business/owner-information"
import { AddressDetails } from "@/components/business/address-details"
import { Review } from "@/components/business/review"
import { Payment } from "@/components/business/payment"
import { Building } from "lucide-react"

// FormData interface (same as before)
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

export default function BusinessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const showRegistration = searchParams.get("register") === "true"
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({})
  const [hasRegisteredBusiness, setHasRegisteredBusiness] = useState(false)

  useEffect(() => {
    // Reset registration step when showing/hiding registration form
    if (showRegistration) {
      setCurrentStep(1)
    }
  }, [showRegistration])

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
      router.push('/dashboard/business')
    } else {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleEdit = (step: number) => {
    setCurrentStep(step)
  }

  const renderRegistrationStep = () => {
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
            <Button onClick={() => router.push("/dashboard/business")}>Go to Business Dashboard</Button>
          </div>
        )
      default:
        return null
    }
  }

  const renderBusinessDashboard = () => {
    if (!hasRegisteredBusiness) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Register Your Business</CardTitle>
            <CardDescription>Start your business journey by registering your company with us.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Registering your business is the first step towards growth and success. Our streamlined process makes it
              easy to get started.
            </p>
            <Button onClick={() => router.push('/dashboard/business?register=true')}>
              <Building className="mr-2 h-4 w-4" />
              Start Business Registration
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Overview</CardTitle>
            <CardDescription>Key information about your registered business</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add business overview content here */}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {showRegistration ? (
          <>
            <div>
              <h1 className="text-3xl font-bold">Business Registration</h1>
              <p className="text-gray-500 mt-2">Complete the following steps to register your business.</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Stepper steps={steps} currentStep={currentStep} />
                <div className="mt-8">
                  {renderRegistrationStep()}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-3xl font-bold">My Business</h1>
              <p className="text-gray-500 mt-2">Manage and overview your business details.</p>
            </div>
            {renderBusinessDashboard()}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}