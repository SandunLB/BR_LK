"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Stepper } from "@/components/business/stepper";
import { CountrySelection } from "@/components/business/country-selection";
import { PackageSelection } from "@/components/business/package-selection";
import { CompanyDetails } from "@/components/business/company-details";
import { OwnerInformation } from "@/components/business/owner-information";
import { AddressDetails } from "@/components/business/address-details";
import { Review } from "@/components/business/review";
import { Payment } from "@/components/business/payment";
import { Building, Building2, Loader2, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, Users, MapPin, CreditCard, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getBusinesses, deleteDocument } from "@/utils/firebase";

interface Owner {
  id: string;
  fullName: string;
  ownership: string;
  isCEO?: boolean;
  birthDate?: string;
  document?: File | null;
  documentUrl?: string;
  documentName?: string;
}

interface FormData {
  country?: { name: string };
  package?: { name: string; price: number };
  company?: { name: string; type: string; industry: string };
  owner?: Owner[];
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

const steps = [
  { id: 1, name: "Country", description: "Select country" },
  { id: 2, name: "Package", description: "Choose package" },
  { id: 3, name: "Company", description: "Company details" },
  { id: 4, name: "Owner", description: "Owner information" },
  { id: 5, name: "Address", description: "Address details" },
  { id: 6, name: "Review", description: "Review details" },
  { id: 7, name: "Payment", description: "Complete payment" },
];

function BusinessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showRegistration, setShowRegistration] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [existingBusinesses, setExistingBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBusinessId, setExpandedBusinessId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBusinesses = async () => {
      if (user?.uid) {
        try {
          const businesses = await getBusinesses(user.uid);
          setExistingBusinesses(businesses);
        } catch (error) {
          console.error("Error fetching businesses:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchBusinesses();
  }, [user]);

  useEffect(() => {
    const initializeData = () => {
      if (typeof window !== "undefined") {
        const paymentError = searchParams.get("payment_error");
        if (paymentError) {
          alert(`Payment failed: ${paymentError}`);
          router.replace("/dashboard/business");
        }

        const savedStep = sessionStorage.getItem("businessRegistrationStep");
        const savedData = sessionStorage.getItem("businessRegistrationData");
        const registerParam = searchParams.get("register");

        if (searchParams.has("clean")) {
          sessionStorage.removeItem("businessRegistrationData");
          sessionStorage.removeItem("businessRegistrationStep");
        } else {
          if (savedStep) setCurrentStep(Number(savedStep));
          if (savedData) setFormData(JSON.parse(savedData));
          setShowRegistration(registerParam === "true" || !!savedStep || !!savedData);
        }
      }
      setIsLoading(false);
    };

    initializeData();
  }, [router, searchParams]);

  const handleNext = (stepData: any) => {
    setFormData((prev) => {
      const newData = { ...prev };

      switch (currentStep) {
        case 1:
          newData.country = { name: stepData.name || "" };
          break;
        case 2:
          newData.package = { name: stepData.name || "", price: stepData.price || 0 };
          break;
        case 3:
          newData.company = {
            name: stepData.name || "",
            type: stepData.type || "",
            industry: stepData.industry || "",
          };
          break;
        case 4:
          newData.owner = stepData.map((owner: Owner) => ({
            id: owner.id,
            fullName: owner.fullName,
            ownership: owner.ownership,
            isCEO: owner.isCEO,
            birthDate: owner.birthDate,
            documentUrl: owner.documentUrl,
            documentName: owner.documentName,
          }));
          break;
        case 5:
          newData.address = {
            street: stepData.street || "",
            city: stepData.city || "",
            state: stepData.state || "",
            postalCode: stepData.postalCode || "",
            country: stepData.country || "",
          };
          break;
      }

      sessionStorage.setItem("businessRegistrationData", JSON.stringify(newData));
      return newData;
    });

    setCurrentStep((prev) => {
      const newStep = prev + 1;
      sessionStorage.setItem("businessRegistrationStep", newStep.toString());
      return newStep;
    });
  };

  const handleBack = () => {
    if (currentStep === 1) {
      handleCancelRegistration();
    } else {
      setCurrentStep((prev) => {
        const newStep = prev - 1;
        sessionStorage.setItem("businessRegistrationStep", newStep.toString());
        return newStep;
      });
    }
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
    sessionStorage.setItem("businessRegistrationStep", step.toString());
  };

  const handleCancelRegistration = async () => {
    try {
      if (formData.owner?.length) {
        for (const owner of formData.owner) {
          if (owner.documentUrl) {
            try {
              await deleteDocument(owner.documentUrl);
            } catch (error) {
              console.error("Error cleaning up document:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
    } finally {
      sessionStorage.removeItem("businessRegistrationData");
      sessionStorage.removeItem("businessRegistrationStep");
      setCurrentStep(1);
      setFormData({});
      setShowRegistration(false);
      router.push("/dashboard/business");
    }
  };

  const getCurrentStep = (documents: any) => {
    if (!documents) return 0;
    const documentOrder = ['filedArticles', 'einTaxId', 'organizerStatement', 'boiReport'];
    let currentStep = 0;
    
    documentOrder.forEach((doc, index) => {
      if (documents[doc]) {
        currentStep = index + 1;
      }
    });
    
    return currentStep;
  };

  const renderRegistrationStep = () => {
    switch (currentStep) {
      case 1:
        return <CountrySelection onNext={handleNext} initialData={formData.country} />;
      case 2:
        return <PackageSelection onNext={handleNext} onBack={handleBack} initialData={formData.package} />;
      case 3:
        return <CompanyDetails onNext={handleNext} onBack={handleBack} initialData={formData.company} country={formData.country?.name} />;
      case 4:
        return <OwnerInformation onNext={handleNext} onBack={handleBack} initialData={formData.owner} />;
      case 5:
        return <AddressDetails onNext={handleNext} onBack={handleBack} initialData={formData.address} />;
      case 6:
        return (
          <Review
            data={formData as Required<FormData>}
            onNext={() => setCurrentStep(7)}
            onBack={handleBack}
            onEdit={handleEdit}
          />
        );
      case 7:
        return <Payment amount={formData.package?.price || 0} businessData={formData} />;
      default:
        return null;
    }
  };

  const renderBusinessCard = (business: any) => {
    const isExpanded = expandedBusinessId === business.id;
    const registrationStep = getCurrentStep(business.documents);
    const documentOrder = [
      { key: 'filedArticles', name: 'Filed Articles' },
      { key: 'einTaxId', name: 'EIN / Tax ID Number' },
      { key: 'organizerStatement', name: 'Statement of the Organizer' },
      { key: 'boiReport', name: 'BOI Report' }
    ];

    return (
      <Card key={business.id} className="shadow-lg">
        <CardContent className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="h-6 w-6 text-indigo-600" />
                {business.company?.name}
              </h3>
              <p className="text-gray-500 mt-1">
                Registered in {business.country?.name}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full ${
              registrationStep === 4 
                ? 'bg-green-100 text-green-800'
                : 'bg-indigo-100 text-indigo-800'
            }`}>
              {registrationStep === 4 ? 'Completed' : 'In Progress'}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="flex mb-2 items-center justify-between">
              <span className="text-sm font-semibold text-indigo-600">
                Registration Progress
              </span>
              <span className="text-sm font-semibold text-indigo-600">
                {Math.round((registrationStep / 4) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-indigo-100 rounded">
              <div
                className="h-2 bg-indigo-600 rounded transition-all duration-500"
                style={{ width: `${(registrationStep / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Document Status */}
          <div className="space-y-4">
            {documentOrder.map((doc, index) => {
              const isCompleted = business.documents && business.documents[doc.key];
              const isCurrent = index === registrationStep;
              
              return (
                <div 
                  key={doc.key}
                  className={`flex items-center p-4 rounded-lg border ${
                    isCompleted ? 'bg-green-50 border-green-200' :
                    isCurrent ? 'bg-indigo-50 border-indigo-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex-shrink-0 mr-4">
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : isCurrent ? (
                      <Clock className="h-6 w-6 text-indigo-600 animate-pulse" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${
                          isCompleted ? 'text-green-800' :
                          isCurrent ? 'text-indigo-800' :
                          'text-gray-600'
                        }`}>
                          {doc.name}
                        </p>
                        {isCompleted && business.documents[doc.key].name && (
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <FileText className="h-4 w-4 mr-1" />
                            {business.documents[doc.key].name}
                          </p>
                        )}
                      </div>
                      {isCompleted && (
                        <a 
                          href={business.documents[doc.key].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          View Document
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expandable Details Section */}
          <div className="border-t pt-4">
            <button
              onClick={() => setExpandedBusinessId(isExpanded ? null : business.id)}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <span className="font-medium text-gray-700">Additional Details</span>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {isExpanded && (
              <div className="mt-4 space-y-6">
                {/* Company Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-gray-500" />
                    Company Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Industry</p>
                      <p className="font-medium">{business.company?.industry}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Package</p>
                      <p className="font-medium">{business.package?.name}</p>
                    </div>
                  </div>
                </div>

                {/* Ownership Structure */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    Ownership Structure
                  </h3>
                  <div className="space-y-3">
                    {business?.owner?.map((owner: Owner) => (
                      <div key={owner.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div>
                          <p className="font-medium">{owner.fullName}</p>
                          <p className="text-sm text-gray-500">
                            {owner.isCEO ? "CEO • " : ""}
                            {owner.birthDate}
                          </p>
                        </div>
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm">
                          {owner.ownership}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    Address Details
                  </h3>
                  <div className="space-y-2">
                    <p>{business?.address?.street}</p>
                    <p>{business?.address?.city}, {business?.address?.state}</p>
                    <p>{business?.address?.postalCode}, {business?.address?.country}</p>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    Payment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Amount</p>
                      <p className="font-medium">${business?.package?.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Status</p>
                      <p className="font-medium capitalize">{business?.paymentDetails?.status}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Payment Method</p>
                      <p className="font-medium capitalize">{business?.paymentDetails?.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Currency</p>
                      <p className="font-medium">{business?.paymentDetails?.currency?.toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBusinessDashboard = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Your Businesses
          </CardTitle>
          <CardDescription className="text-md">Manage your registered business entities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {existingBusinesses.map((business) => renderBusinessCard(business))}
          </div>
          
          <Button
            onClick={() => {
              sessionStorage.removeItem("businessRegistrationData");
              sessionStorage.removeItem("businessRegistrationStep");
              router.push("/dashboard/business?register=true");
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 mt-6"
          >
            <Building className="mr-2 h-4 w-4" />
            Register New Business
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {showRegistration ? (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Business Registration
                </h1>
                <p className="text-gray-500 mt-2">Complete the following steps to register your business.</p>
              </div>
              <Button
                variant="outline"
                onClick={handleCancelRegistration}
                className="text-gray-600 hover:bg-gray-50"
              >
                Cancel Registration
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Stepper steps={steps} currentStep={currentStep} />
                <div className="mt-8">{renderRegistrationStep()}</div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Business Dashboard
              </h1>
              <p className="text-gray-500 mt-2">Manage your registered businesses</p>
            </div>
            {renderBusinessDashboard()}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function BusinessPage() {
  return (
    <Suspense 
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        </DashboardLayout>
      }
    >
      <BusinessContent />
    </Suspense>
  );
}