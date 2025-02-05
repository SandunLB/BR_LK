"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBusinessDraft, formatTimestamp } from "@/utils/firebase";

interface PaymentDetails {
  businessId?: string;
  userId?: string;
  amount?: number;
  currency?: string;
  paymentId?: string;
  date?: string;
}

function LoadingSpinner() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    </DashboardLayout>
  );
}

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
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

        if (!response.ok) throw new Error("Payment verification failed");

        const result = await response.json();
        
        const businessData = await getBusinessDraft(
          result.userId,
          result.businessId
        );

        setPaymentDetails({
          businessId: result.businessId,
          userId: result.userId,
          amount: result.amount / 100,
          currency: result.currency,
          paymentId: result.stripePaymentIntentId,
          date: formatTimestamp(businessData.paymentDetails?.createdAt)
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
    window.sessionStorage.removeItem("businessRegistrationData");
    window.sessionStorage.removeItem("businessRegistrationStep");
    window.localStorage.removeItem("currentStripeSession");
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center space-y-8 p-4">
          <div className="text-red-500">
            <CheckCircledIcon className="h-20 w-20 mx-auto mb-4" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            Payment Verification Failed
          </h1>
          <p className="text-gray-500">{error}</p>
          <Button
            onClick={() => router.push("/dashboard/business")}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
          >
            Return to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8 p-4">
        <div className="text-center space-y-4">
          <CheckCircledIcon className="h-20 w-20 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#3659fb] to-[#6384ff] bg-clip-text text-transparent">
            Registration Successful!
          </h1>
          <p className="text-gray-500 mt-2">Your business is now officially registered with us.</p>
        </div>

        {paymentDetails && (
          <Card className="border border-indigo-100 hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#3659fb] to-[#6384ff] bg-clip-text text-transparent">
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-semibold text-indigo-600">
                  {paymentDetails.amount?.toLocaleString('en-US', {
                    style: 'currency',
                    currency: paymentDetails.currency || 'USD'
                  })}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-mono text-indigo-600">{paymentDetails.paymentId}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors">
                <span className="text-gray-500">Date:</span>
                <span className="text-indigo-600">{paymentDetails.date}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <Button
            onClick={() => router.push("/dashboard/business")}
            className="bg-gradient-to-r from-[#3659fb] to-[#6384ff] hover:from-[#4b6bff] hover:to-[#84a4ff] text-white w-full"
          >
            Go to Business Dashboard
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            <p>
              Need assistance? Contact our support team at{" "}
              <a href="mailto:support@business.com" className="text-indigo-600 hover:underline">
                support@business.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SuccessPageContent />
    </Suspense>
  );
}