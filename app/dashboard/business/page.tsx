"use client";

import { useState, useEffect } from "react";
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
import { Building, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getBusinesses } from "@/utils/firebase";

interface FormData {
  country?: { name: string };
  package?: { name: string; price: number };
  company?: { name: string; type: string; industry: string };
  owner?: Array<{
    id: string;
    fullName: string;
    ownership: string;
    isCEO?: boolean;
    birthDate?: string;
    document?: File | null;
  }>;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentDetails?: {
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    stripePaymentIntentId: string;
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
  { id: 8, name: "Complete", description: "Registration complete" },
];

export default function BusinessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showRegistration, setShowRegistration] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [existingBusinesses, setExistingBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBusinesses = async () => {
      if (user?.uid) {
        try {
          const businesses = await getBusinesses(user.uid);
          setExistingBusinesses(businesses);
        } catch (error) {
          console.error("Error fetching businesses:", error);
        }
      }
    };

    fetchBusinesses();
  }, [user]);

  useEffect(() => {
    const initializeData = () => {
      if (typeof window !== "undefined") {
        const savedStep = sessionStorage.getItem("businessRegistrationStep");
        const savedData = sessionStorage.getItem("businessRegistrationData");
        const registerParam = searchParams.get("register");

        if (savedStep) {
          setCurrentStep(Number.parseInt(savedStep, 10));
        }

        if (savedData) {
          setFormData(JSON.parse(savedData));
        }

        setShowRegistration(registerParam === "true" || !!savedStep || !!savedData);
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
          newData.country = { name: stepData.name };
          break;
        case 2:
          newData.package = { name: stepData.name, price: stepData.price };
          break;
        case 3:
          newData.company = {
            name: stepData.name,
            type: stepData.type,
            industry: stepData.industry,
          };
          break;
        case 4:
          newData.owner = stepData.map((owner: any) => ({
            id: owner.id,
            fullName: owner.fullName,
            ownership: owner.ownership,
            isCEO: owner.isCEO,
            birthDate: owner.birthDate,
            document: owner.document,
          }));
          break;
        case 5:
          newData.address = {
            street: stepData.street,
            city: stepData.city,
            state: stepData.state,
            postalCode: stepData.postalCode,
            country: stepData.country,
          };
          break;
        case 7:
          newData.paymentDetails = {
            amount: stepData.amount,
            currency: stepData.currency,
            status: "paid",
            createdAt: new Date().toISOString(),
            stripePaymentIntentId: stepData.stripePaymentIntentId,
          };
          break;
        default:
          Object.assign(newData, stepData);
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
      router.push("/dashboard/business");
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

  const handlePaymentComplete = async (details: { method: string; receiptUrl?: string; businessId: string }) => {
    if (user?.uid) {
      try {
        const businesses = await getBusinesses(user.uid);
        setExistingBusinesses(businesses);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      }
    }
    
    sessionStorage.removeItem("businessRegistrationData");
    sessionStorage.removeItem("businessRegistrationStep");
    router.push("/dashboard/business");
  };

  const handleCancelRegistration = () => {
    sessionStorage.removeItem("businessRegistrationData");
    sessionStorage.removeItem("businessRegistrationStep");
    setCurrentStep(1);  // Reset to first step
    setFormData({});     // Clear form data
    setShowRegistration(false);
    router.push("/dashboard/business");
  };

  const renderRegistrationStep = () => {
    switch (currentStep) {
      case 1:
        return <CountrySelection onNext={handleNext} initialData={formData.country} />;
      case 2:
        return <PackageSelection onNext={handleNext} onBack={handleBack} initialData={formData.package} />;
      case 3:
        return <CompanyDetails onNext={handleNext} onBack={handleBack} initialData={formData.company} />;
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
        return (
          <Payment
            onPaymentComplete={handlePaymentComplete}
            amount={formData.package?.price || 0}
            businessData={formData}
          />
        );
      case 8:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Registration Complete!
            </h2>
            <p className="text-gray-600 mb-6">Thank you for registering your business with us.</p>
            <Button
              onClick={() => router.push("/dashboard/business")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Go to Business Dashboard
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const renderBusinessDashboard = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Your Businesses
          </CardTitle>
          <CardDescription>Manage your registered businesses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {existingBusinesses.map((business) => (
              <Card key={business.id} className="mb-4">
                <CardContent className="pt-4">
                  <h3 className="font-medium text-lg">{business.company?.name}</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-gray-500">Type: {business.company?.type}</p>
                      <p className="text-sm text-gray-500">Industry: {business.company?.industry}</p>
                      <p className="text-sm text-gray-500">
                        Registered: {business.createdAt?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status: {business.paymentDetails?.status}</p>
                      <p className="text-sm text-gray-500">
                        Amount: ${(business.paymentDetails?.amount / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        Payment ID: {business.paymentDetails?.stripePaymentIntentId}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Button
          onClick={() => {
            sessionStorage.removeItem("businessRegistrationData");
            sessionStorage.removeItem("businessRegistrationStep");
            router.push("/dashboard/business?register=true");
          }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 mt-4"
        >
          <Building className="mr-2 h-4 w-4" />
          Register Another Business
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
                My Business
              </h1>
              <p className="text-gray-500 mt-2">Manage and overview your business details.</p>
            </div>
            {renderBusinessDashboard()}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}