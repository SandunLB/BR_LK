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
import { PaymentStatus } from "@/components/business/payment-status";
import { Building, Loader2 } from "lucide-react";
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
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchBusinesses();
  }, [user]);

  // Initialize registration data
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
      // Clean up uploaded documents
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
        return <Payment amount={formData.package?.price || 0} businessData={formData} />;
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
          <CardDescription className="text-md">Manage your registered business entities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {existingBusinesses.map((business) => (
              <Card key={business.id} className="shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6 space-y-6">
                  {/* Header Section */}
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                        <Building className="h-6 w-6 text-indigo-600" />
                        {business.company?.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Registered in {business.country?.name}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      {business.company?.type}
                    </span>
                  </div>

                  {/* Main Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-lg mb-3 text-gray-700 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm4 0h2v2h-2V5zM5 10h10v6H5v-6z" clipRule="evenodd" />
                          </svg>
                          Company Details
                        </h4>
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Industry</dt>
                            <dd className="text-gray-800">{business.company?.industry}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Package</dt>
                            <dd className="text-gray-800">
                              {business.package?.name} (${business.package?.price})
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-lg mb-3 text-gray-700 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          Address
                        </h4>
                        <div className="text-sm space-y-1">
                          <p className="text-gray-800">{business.address?.street}</p>
                          <p className="text-gray-800">{business.address?.city}, {business.address?.state}</p>
                          <p className="text-gray-800">{business.address?.postalCode}, {business.address?.country}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-lg mb-3 text-gray-700 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                          </svg>
                          Ownership Structure
                        </h4>
                        <div className="space-y-3">
                          {business.owner?.map((owner: any) => (
                            <div key={owner.id} className="flex items-center justify-between p-2 bg-white rounded border">
                              <div>
                                <p className="font-medium text-gray-800">{owner.fullName}</p>
                                <p className="text-xs text-gray-500">
                                  {owner.isCEO ? "CEO • " : ""}
                                  {owner.birthDate || "DOB not provided"}
                                </p>
                              </div>
                              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm">
                                {owner.ownership}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-lg mb-3 text-gray-700 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          Payment Details
                        </h4>
                        <div className="space-y-2">
                          <PaymentStatus
                            status={business.paymentDetails?.status === "succeeded" ? "success" : "failed"}
                            amount={business.paymentDetails?.amount || 0}
                            paymentId={business.paymentDetails?.stripePaymentIntentId}
                            timestamp={business.paymentDetails?.createdAt}
                          />
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="text-gray-800 capitalize">{business.paymentDetails?.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Currency:</span>
                            <span className="text-gray-800">{business.paymentDetails?.currency?.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
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