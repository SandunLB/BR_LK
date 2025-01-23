"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getBusinesses } from "@/utils/firebase";
import { PaymentStatus } from "@/components/business/payment-status";

export default function PaymentsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      if (user?.uid) {
        try {
          const businesses = await getBusinesses(user.uid);
          setBusinesses(businesses);
        } catch (error) {
          console.error("Error fetching businesses:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (user) fetchBusinesses();
  }, [user]);

  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    router.push("/signin");
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Payment History
          </h1>
          <p className="text-gray-500 mt-2">View payment details for all your registered businesses</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            {businesses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No registered businesses found.
              </div>
            ) : (
              businesses.map((business) => (
                <Card key={business.id} className="mb-6 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between border-b pb-4 mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {business.company?.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Registered on: {new Date(business.createdAt?.toDate()).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                        {business.package?.name}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-3">Business Details</h4>
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Country</dt>
                            <dd className="text-gray-800">{business.country?.name}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Industry</dt>
                            <dd className="text-gray-800">{business.company?.industry}</dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-3">Payment Details</h4>
                        <div className="space-y-2">
                          <PaymentStatus
                            status={business.paymentDetails?.status === "succeeded" ? "success" : "failed"}
                            amount={business.paymentDetails?.amount / 100 || 0}
                            paymentId={business.paymentDetails?.stripePaymentIntentId}
                            timestamp={business.paymentDetails?.createdAt}
                          />
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="text-gray-800 capitalize">
                              {business.paymentDetails?.paymentMethod || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Currency:</span>
                            <span className="text-gray-800">
                              {business.paymentDetails?.currency?.toUpperCase() || 'USD'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}