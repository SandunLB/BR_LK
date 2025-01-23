"use client";

import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getBusinesses } from "@/utils/firebase";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { PaymentStatus } from "@/components/business/payment-status";

export default function PaymentsPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.uid) {
        try {
          const businesses = await getBusinesses(user.uid);
          setBusinesses(businesses);
        } catch (error) {
          console.error("Error fetching businesses:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, [user]);

  if (loading) {
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
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Payment History
          </h1>
          <p className="text-gray-500 mt-2">All payment transactions for your registered businesses</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Payments</CardTitle>
            <CardDescription>Detailed payment history for each business entity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Business Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Payment Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Payment ID</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((business) => (
                    <tr key={business.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-800">{business.company?.name}</div>
                        <div className="text-sm text-gray-500">{business.country?.name}</div>
                      </td>
                      <td className="py-4 px-4">
                        {new Date(business.paymentDetails?.createdAt?.toDate()).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-4">
                        ${(business.paymentDetails?.amount / 100).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <PaymentStatus 
                          status={business.paymentDetails?.status === "succeeded" ? "success" : "failed"}
                          amount={business.paymentDetails?.amount || 0}
                          paymentId={business.paymentDetails?.stripePaymentIntentId}
                          timestamp={business.paymentDetails?.createdAt?.toDate().toISOString()}
                        />
                      </td>
                      <td className="py-4 px-4 text-sm text-indigo-600 font-mono">
                        {business.paymentDetails?.stripePaymentIntentId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}