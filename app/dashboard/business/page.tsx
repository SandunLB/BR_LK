"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Stepper } from "@/components/business/stepper";
import { CountrySelection } from "@/components/business/country-selection";
import { PackageSelection } from "@/components/business/package-selection";
import { CompanyDetails } from "@/components/business/company-details";
import { StateSelection } from "@/components/business/state-selection";
import { OwnerInformation } from "@/components/business/owner-information";
import { AddressDetails } from "@/components/business/address-details";
import { Review } from "@/components/business/review";
import { Payment } from "@/components/business/payment";
import {
  Building,
  Building2,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Users,
  MapPin,
  CreditCard,
  FileText,
} from "lucide-react";
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
  state?: { name: string; price: number };
  owner?: Owner[];
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface BusinessDocument {
  name: string;
  url: string;
}

interface Business {
  id: string;
  path: string;
  country: { name: string };
  package: { name: string; price: number };
  company: { name: string; type: string; industry: string };
  state?: { name: string; price: number };
  owner: Owner[];
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: any;
  paymentDetails?: {
    amount: number;
    currency: string;
    paymentMethod: string;
    status: string;
    stripePaymentIntentId: string;
    createdAt: { seconds: number; nanoseconds: number };
  };
  status: string;
  updatedAt: { seconds: number; nanoseconds: number };
  documents?: Record<string, BusinessDocument>;
}

// Helper function to check if state selection is needed
const isStateSelectionRequired = (country?: string) => {
  return country === "United States";
};

// Dynamic steps based on country selection
const getSteps = (country?: string) => {
  const baseSteps = [
    { id: 1, name: "Country", description: "Select country" },
    { id: 2, name: "Package", description: "Choose package" },
    { id: 3, name: "Company", description: "Company details" },
  ];

  const afterStateSteps = [
    { id: 4, name: "Owner", description: "Owner information" },
    { id: 5, name: "Address", description: "Address details" },
    { id: 6, name: "Review", description: "Review details" },
    { id: 7, name: "Payment", description: "Complete payment" },
  ];

  if (isStateSelectionRequired(country)) {
    return [
      ...baseSteps,
      { id: 4, name: "State", description: "Select state" },
      ...afterStateSteps.map(step => ({ ...step, id: step.id + 1 }))
    ];
  }

  return [...baseSteps, ...afterStateSteps];
};

const getRequiredDocuments = (country: string, packageName: string) => {
  if (country === "United Kingdom") {
    return [
      { key: "businessRegistration", name: "Business Registration" }
    ];
  }

  const usDocuments = [
    { key: "filedArticlesAndOrganizer", name: "Filed Articles & Statement of the Organizer" },
    { key: "einTaxId", name: "EIN / Tax ID Number" },
    { key: "boiReport", name: "BOI Report" }
  ];

  if (country === "United States" && packageName === "enterprise") {
    return [
      ...usDocuments,
      { key: "itinNumber", name: "ITIN Number" }
    ];
  }

  if (country === "United States") {
    return usDocuments;
  }

  return [];
};

// Format timestamp to human readable date
const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
  if (!timestamp) return '';
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format currency with proper symbol and decimals
const formatCurrency = (amount: number, currency: string = 'usd') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2
  });
  return formatter.format(amount);
};

function BusinessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showRegistration, setShowRegistration] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [existingBusinesses, setExistingBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBusinessId, setExpandedBusinessId] = useState<string | null>(null);
  const { user } = useAuth();
  const steps = getSteps(formData.country?.name);

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
          setShowRegistration(
            registerParam === "true" || !!savedStep || !!savedData
          );
        }
      }
      setIsLoading(false);
    };

    initializeData();
  }, [router, searchParams]);

  const calculateTotalPrice = (data: FormData) => {
    let total = data.package?.price || 0;
    if (isStateSelectionRequired(data.country?.name) && data.state?.price) {
      total += data.state.price;
    }
    return total;
  };

  const handleNext = (stepData: any) => {
    setFormData((prev) => {
      const newData = { ...prev };

      switch (currentStep) {
        case 1:
          newData.country = { name: stepData.name || "" };
          break;
        case 2:
          newData.package = {
            name: stepData.name || "",
            price: stepData.price || 0,
          };
          break;
        case 3:
          newData.company = {
            name: stepData.name || "",
            type: stepData.type || "",
            industry: stepData.industry || "",
          };
          break;
        case 4:
          if (isStateSelectionRequired(newData.country?.name)) {
            newData.state = {
              name: stepData.name || "",
              price: stepData.price || 0,
            };
          } else {
            newData.owner = stepData;
          }
          break;
        case 5:
          if (isStateSelectionRequired(newData.country?.name)) {
            newData.owner = stepData;
          } else {
            newData.address = stepData;
          }
          break;
        case 6:
          if (isStateSelectionRequired(newData.country?.name)) {
            newData.address = stepData;
          }
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

  const getCurrentStep = (business: Business) => {
    const documents = business.documents || {};
    const requiredDocs = getRequiredDocuments(
      business.country?.name || '',
      business.package?.name || ''
    );
    
    return requiredDocs.reduce((count, doc) => {
      return count + (documents[doc.key] ? 1 : 0);
    }, 0);
  };

  const renderBusinessCard = (business: Business) => {
    const isExpanded = expandedBusinessId === business.id;
    const requiredDocuments = getRequiredDocuments(
      business.country?.name || '',
      business.package?.name || ''
    );
    const registrationStep = getCurrentStep(business);
    const totalSteps = requiredDocuments.length;
    const totalAmount = (business.state?.price || 0) + business.package.price;
    const documents = business.documents || {};

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
                {business.state && ` • ${business.state.name}`}
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-full ${
                business.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-indigo-100 text-indigo-800"
              }`}
            >
              {business.status === "completed" ? "Active" : "In Progress"}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="flex mb-2 items-center justify-between">
              <span className="text-sm font-semibold text-[#3659fb]">
                Registration Progress
              </span>
              <span className="text-sm font-semibold text-[#3659fb]">
                {totalSteps > 0 ? Math.round((registrationStep / totalSteps) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 bg-indigo-100 rounded">
              <div
                className="h-2 bg-[#3659fb] rounded transition-all duration-500"
                style={{ width: `${totalSteps > 0 ? (registrationStep / totalSteps) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Document Status */}
          <div className="space-y-4">
            {requiredDocuments.map((doc, index) => {
              const documentInfo = documents[doc.key];
              const isCompleted = !!documentInfo;
              const isCurrent = index === registrationStep;

              return (
                <div
                  key={doc.key}
                  className={`flex items-center p-4 rounded-lg border ${
                    isCompleted
                      ? "bg-green-50 border-green-200"
                      : isCurrent
                      ? "bg-indigo-50 border-indigo-200"
                      : "bg-gray-50 border-gray-200"
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
                        <p
                          className={`font-medium ${
                            isCompleted
                            ? "text-green-800"
                            : isCurrent
                            ? "text-indigo-800"
                            : "text-gray-600"
                        }`}
                      >
                        {doc.name}
                      </p>
                      {documentInfo && documentInfo.name && (
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <FileText className="h-4 w-4 mr-1" />
                          {documentInfo.name}
                        </p>
                      )}
                    </div>
                    {documentInfo?.url && (
                      <a
                        href={documentInfo.url}
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
            onClick={() =>
              setExpandedBusinessId(isExpanded ? null : business.id)
            }
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          >
            <span className="font-medium text-gray-700">
              Additional Details
            </span>
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
                    <p className="font-medium capitalize">
                      {business.company?.industry}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Type</p>
                    <p className="font-medium uppercase">
                      {business.company?.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Package</p>
                    <p className="font-medium capitalize">{business.package?.name}</p>
                  </div>
                  {business.state && (
                    <div>
                      <p className="text-gray-500 text-sm">State</p>
                      <p className="font-medium">{business.state.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ownership Structure */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  Ownership Structure
                </h3>
                <div className="space-y-3">
                  {business.owner.map((owner) => (
                    <div
                      key={owner.id}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <div>
                        <p className="font-medium">{owner.fullName}</p>
                        <p className="text-sm text-gray-500">
                          {owner.isCEO ? "CEO • " : ""}
                          {owner.birthDate && new Date(owner.birthDate).toLocaleDateString()}
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
                  <p>{business.address?.street}</p>
                  <p>
                    {business.address?.city}, {business.address?.state}
                  </p>
                  <p>
                    {business.address?.postalCode}, {business.address?.country}
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              {business.paymentDetails && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    Payment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Total Amount</p>
                      <p className="font-medium">
                        {formatCurrency(business.paymentDetails.amount / 100, business.paymentDetails.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Status</p>
                      <p className="font-medium capitalize">
                        {business.paymentDetails.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Payment Method</p>
                      <p className="font-medium capitalize">
                        {business.paymentDetails.paymentMethod}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Payment Date</p>
                      <p className="font-medium">
                        {formatDate(business.paymentDetails.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
        <CardTitle className="bg-gradient-to-r from-[#3659fb] to-[#6384ff] bg-clip-text text-transparent">
          Your Businesses
        </CardTitle>
        <CardDescription className="text-md">
          Manage your registered business entities
        </CardDescription>
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
          className="bg-[#3659fb] hover:bg-[#4b6bff] text-white transition-colors duration-200 mt-6"
        >
          <Building className="mr-2 h-4 w-4" />
          Register New Business
        </Button>
      </CardContent>
    </Card>
  </div>
);

const renderRegistrationStep = () => {
  switch (currentStep) {
    case 1:
      return (
        <CountrySelection
          onNext={handleNext}
          initialData={formData.country}
        />
      );
    case 2:
      return (
        <PackageSelection
          onNext={handleNext}
          onBack={handleBack}
          initialData={formData.package}
          selectedCountry={formData.country?.name}
        />
      );
    case 3:
      return (
        <CompanyDetails
          onNext={handleNext}
          onBack={handleBack}
          initialData={formData.company}
          country={formData.country?.name}
        />
      );
    case 4:
      if (isStateSelectionRequired(formData.country?.name)) {
        return (
          <StateSelection
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData.state}
          />
        );
      } else {
        return (
          <OwnerInformation
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData.owner}
          />
        );
      }
    case 5:
      if (isStateSelectionRequired(formData.country?.name)) {
        return (
          <OwnerInformation
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData.owner}
          />
        );
      } else {
        return (
          <AddressDetails
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData.address}
          />
        );
      }
    case 6:
      if (isStateSelectionRequired(formData.country?.name)) {
        return (
          <AddressDetails
            onNext={handleNext}
            onBack={handleBack}
            initialData={formData.address}
          />
        );
      } else {
        return (
          <Review
            data={{
              ...formData as Required<FormData>,
              totalPrice: calculateTotalPrice(formData)
            }}
            onNext={() => setCurrentStep(7)}
            onBack={handleBack}
            onEdit={handleEdit}
          />
        );
      }
    case 7:
      if (isStateSelectionRequired(formData.country?.name)) {
        return (
          <Review
            data={{
              ...formData as Required<FormData>,
              totalPrice: calculateTotalPrice(formData)
            }}
            onNext={() => setCurrentStep(8)}
            onBack={handleBack}
            onEdit={handleEdit}
          />
        );
      } else {
        return (
          <Payment
            amount={calculateTotalPrice(formData)}
            businessData={formData}
          />
        );
      }
    case 8:
      if (isStateSelectionRequired(formData.country?.name)) {
        return (
          <Payment
            amount={calculateTotalPrice(formData)}
            businessData={formData}
          />
        );
      }
      return null;
    default:
      return null;
  }
};

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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#3659fb] to-[#6384ff] bg-clip-text text-transparent">
                Business Registration
              </h1>
              <p className="text-gray-500 mt-2">
                Complete the following steps to register your business.
              </p>
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#3659fb] to-[#6384ff] bg-clip-text text-transparent">
              Business Dashboard
            </h1>
            <p className="text-gray-500 mt-2">
              Manage your registered businesses
            </p>
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