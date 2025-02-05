import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ReviewProps {
  data: {
    country: {
      name: string
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
    owner: Array<{
      id: string
      fullName: string
      ownership: string
      isCEO?: boolean
      birthDate?: string
      document?: File | null
      documentUrl?: string
      documentName?: string
    }>
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
    return (
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Incomplete Data</h2>
        <p className="text-gray-600 mb-6">The following information is missing:</p>
        <ul className="list-disc list-inside mb-4">
          {missingFields.map((field) => (
            <li key={field}>{field}</li>
          ))}
        </ul>
        <p className="text-gray-600 mb-6">Please go back and fill in all required fields.</p>
        <Button
          onClick={onBack}
          className="bg-gradient-to-r from-[#3659fb] to-[#6384ff] hover:from-[#4b6bff] hover:to-[#84a4ff]"
        >
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#3659fb] to-[#6384ff] bg-clip-text text-transparent">
          Review Your Information
        </h2>
        <p className="text-gray-500 mt-2">Please review all the information before proceeding to payment.</p>
      </div>

      <Card className="border-2 border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-center text-xl">Total Cost</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-4xl font-bold text-indigo-600">${data.package.price}</p>
          <p className="text-sm text-gray-500 mt-1">One-time fee</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Registration Details</span>
              <Button
                variant="ghost"
                onClick={() => onEdit(1)}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Country</dt>
                <dd className="mt-1 font-medium">{data.country.name}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Package Details</span>
              <Button
                variant="ghost"
                onClick={() => onEdit(2)}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Package</dt>
                <dd className="mt-1 font-medium">{data.package.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="mt-1 font-medium">${data.package.price}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Company Details</span>
              <Button
                variant="ghost"
                onClick={() => onEdit(3)}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 font-medium">{data.company.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 font-medium">{data.company.type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Industry</dt>
                <dd className="mt-1 font-medium">{data.company.industry}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Owner Details</span>
              <Button
                variant="ghost"
                onClick={() => onEdit(4)}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Array.isArray(data.owner) ? (
                data.owner.map((owner, index) => (
                  <div key={owner.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                    <h4 className="font-medium mb-3">
                      Owner {index + 1} {owner.isCEO && " (CEO)"}
                    </h4>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                        <dd className="mt-1 font-medium">{owner.fullName}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Ownership</dt>
                        <dd className="mt-1 font-medium">{owner.ownership}%</dd>
                      </div>
                      {(owner.isCEO || data.owner.length === 1) && (
                        <>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Birth Date</dt>
                            <dd className="mt-1 font-medium">
                              {owner.birthDate ? new Date(owner.birthDate).toLocaleDateString() : "Not provided"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">ID Document</dt>
                            <dd className="mt-1 font-medium flex items-center gap-2">
                              {owner.documentName ? (
                                <>
                                  <span>
                                    {owner.documentName.length > 25
                                      ? owner.documentName.slice(0, 25) + "..." + owner.documentName.split(".").pop()
                                      : owner.documentName}
                                  </span>
                                  {owner.documentUrl && (
                                    <a
                                      href={owner.documentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-indigo-600 hover:text-indigo-700 text-sm"
                                    >
                                      View
                                    </a>
                                  )}
                                </>
                              ) : (
                                "Not provided"
                              )}
                            </dd>
                          </div>
                        </>
                      )}
                    </dl>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No owner information available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Address Details</span>
              <Button
                variant="ghost"
                onClick={() => onEdit(5)}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Street Address</dt>
                <dd className="mt-1 font-medium">{data.address.street}</dd>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">City</dt>
                  <dd className="mt-1 font-medium">{data.address.city}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">State/Province</dt>
                  <dd className="mt-1 font-medium">{data.address.state}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Postal Code</dt>
                  <dd className="mt-1 font-medium">{data.address.postalCode}</dd>
                </div>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Country</dt>
                <dd className="mt-1 font-medium">{data.address.country}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <Button variant="outline" onClick={onBack} className="px-8">
          Back
        </Button>
        <Button
          onClick={onNext}
          className="px-8 bg-gradient-to-r from-[#3659fb] to-[#6384ff] hover:from-[#4b6bff] hover:to-[#84a4ff]"
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  )
}