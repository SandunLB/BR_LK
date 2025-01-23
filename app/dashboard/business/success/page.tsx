"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { Loader2 } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<{
    businessId?: string;
    amount?: number;
    currency?: string;
    paymentId?: string;
    date?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");
      
      if (!sessionId) {
        setError("Invalid session ID");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          throw new Error("Payment verification failed");
        }

        const result = await response.json();
        
        setPaymentDetails({
          businessId: result.businessId,
          amount: result.amount / 100,
          currency: result.currency,
          paymentId: result.stripePaymentIntentId,
          date: new Date(result.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : "Payment verification failed");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  useEffect(() => {
    // Clear registration data
    window.sessionStorage.removeItem("businessRegistrationData");
    window.sessionStorage.removeItem("businessRegistrationStep");
    window.localStorage.removeItem("currentStripeSession");
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center space-y-6 p-4">
          <div className="text-red-500">
            <CheckCircledIcon className="h-20 w-20 mx-auto mb-4" />
          </div>
          <h1 className="text-3xl font-bold text-red-600">Payment Verification Failed</h1>
          <p className="text-gray-600">{error}</p>
          <Button
            onClick={() => router.push("/dashboard/business")}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Return to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto text-center space-y-6 p-4">
        <CheckCircledIcon className="h-20 w-20 text-green-500 mx-auto mb-4 animate-pulse" />
        
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Registration Successful!
        </h1>

        {paymentDetails && (
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-green-100 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-semibold text-green-600">
                {paymentDetails.amount?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: paymentDetails.currency || 'USD'
                })}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono text-green-600">{paymentDetails.paymentId}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="text-green-600">{paymentDetails.date}</span>
            </div>
          </div>
        )}

        <Button
          onClick={() => router.push("/dashboard/business")}
          className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
        >
          Return to Business Dashboard
        </Button>
      </div>
    </DashboardLayout>
  );
}