import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Package, Building2, Users, MapPin, FileText } from "lucide-react";

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

interface ReviewProps {
  data: {
    country: {
      name: string;
    };
    package: {
      name: string;
      price: number;
    };
    company: {
      name: string;
      type: string;
      industry: string;
    };
    state?: {
      name: string;
      price: number;
    };
    owner: Array<Owner>;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    totalPrice: number;
  };
  onNext: () => void;
  onBack: () => void;
  onEdit: (step: number) => void;
}

export function Review({ data, onNext, onBack, onEdit }: ReviewProps) {
  const missingFields = [];
  if (!data.country) missingFields.push("Country");
  if (!data.package) missingFields.push("Package");
  if (!data.company) missingFields.push("Company Details");
  if (!data.owner) missingFields.push("Owner Information");
  if (!data.address) missingFields.push("Address Details");

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
          className="bg-[#3659fb] hover:bg-[#4b6bff] text-white transition-colors duration-200"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#3659fb] to-[#6384ff] bg-clip-text text-transparent">
          Review Your Information
        </h2>
        <p className="text-gray-500 mt-2">Please review all the information before proceeding to payment.</p>
      </div>

      {/* Total Cost Card */}
      <Card className="border-2 border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-center text-xl">Total Cost</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-4xl font-bold text-indigo-600">${data.totalPrice}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm text-gray-500">Package fee: ${data.package.price}</p>
            {data.state?.price && (
              <p className="text-sm text-gray-500">State registration fee: ${data.state.price}</p>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">One-time fee</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {/* Registration Details */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-indigo-600" />
                Registration Details
              </span>
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

        {/* Package Details */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                Package Details
              </span>
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

        {/* Company Details */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                Company Details
              </span>
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

        {/* State Details (US Only) */}
        {data.state && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  State Registration
                </span>
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
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Selected State</dt>
                  <dd className="mt-1 font-medium">{data.state.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">State Fee</dt>
                  <dd className="mt-1 font-medium">${data.state.price}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Owner Details */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Owner Details
              </span>
              <Button
                variant="ghost"
                onClick={() => onEdit(data.state ? 5 : 4)}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.owner.map((owner, index) => (
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
                                <FileText className="h-4 w-4 text-gray-500" />
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
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Address Details */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-600" />
                Address Details
              </span>
              <Button
                variant="ghost"
                onClick={() => onEdit(data.state ? 6 : 5)}
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

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <Button variant="outline" onClick={onBack} className="px-8">
          Back
        </Button>
        <Button
          onClick={onNext}
          className="px-8 bg-[#3659fb] hover:bg-[#4b6bff] text-white transition-colors duration-200"
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}