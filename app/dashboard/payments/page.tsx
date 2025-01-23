"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getBusinesses } from "@/utils/firebase";
import { PaymentStatus } from "@/components/business/payment-status";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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
          <p className="text-gray-500 mt-2">Detailed payment records for all your businesses</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            {businesses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No payment records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Business</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Payment Method</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {businesses.map((business) => (
                      <tr 
                        key={business.id} 
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Building className="h-5 w-5 text-indigo-600" />
                            <div>
                              <div className="font-medium text-gray-900">{business.company?.name}</div>
                              <div className="text-sm text-gray-500">{business.package?.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {business.paymentDetails?.createdAt ? 
                            format(new Date(business.paymentDetails.createdAt), "PPp") : 
                            'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {(business.paymentDetails?.amount / 100).toLocaleString('en-US', {
                              style: 'currency',
                              currency: business.paymentDetails?.currency?.toUpperCase() || 'USD'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={business.paymentDetails?.status === 'succeeded' ? 'success' : 'destructive'}
                            className="flex items-center gap-1 w-fit"
                          >
                            {business.paymentDetails?.status === 'succeeded' ? (
                              <>
                                <span className="h-2 w-2 rounded-full bg-current" />
                                Success
                              </>
                            ) : (
                              <>
                                <span className="h-2 w-2 rounded-full bg-current" />
                                Failed
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize">
                          {business.paymentDetails?.paymentMethod || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <PaymentStatus
                              status={business.paymentDetails?.status === "succeeded" ? "success" : "failed"}
                              amount={business.paymentDetails?.amount / 100 || 0}
                              paymentId={business.paymentDetails?.stripePaymentIntentId}
                              timestamp={business.paymentDetails?.createdAt}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {/* Implement receipt viewing */}}
                            >
                              Receipt
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}