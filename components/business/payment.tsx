"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { loadStripe } from "@stripe/stripe-js";
import { saveBusinessDraft } from "@/utils/firebase";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentProps {
  amount: number;
  businessData: any;
}

export function Payment({ amount, businessData }: PaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handlePayment = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const businessId = await saveBusinessDraft(user.uid, businessData);

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          businessId,
          userId: user.uid
        }),
      });

      if (!response.ok) throw new Error("Failed to create checkout session");

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (!stripe) throw new Error("Stripe failed to initialize");
      
      localStorage.setItem("currentStripeSession", sessionId);
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        localStorage.removeItem("currentStripeSession");
        router.push("/dashboard/business?payment_error=checkout_failed");
      }

    } catch (error) {
      console.error("Payment failed:", error);
      router.push("/dashboard/business?payment_error=processing_failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#3659fb] to-[#6384ff] bg-clip-text text-transparent">
          Complete Payment
        </h2>
        <p className="text-gray-500 mt-2">Secure payment processing via Stripe</p>
      </div>

      <Card className="border-2 border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-center text-xl">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-4xl font-bold text-indigo-600">${amount}</p>
          <p className="text-sm text-gray-500 mt-1">One-time registration fee</p>
        </CardContent>
      </Card>

      <Button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-[#3659fb] to-[#6384ff] hover:from-[#4b6bff] hover:to-[#84a4ff] relative"
      >
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin absolute left-4" />
        )}
        {isLoading ? (
          <span className="ml-2">Processing...</span>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay with Stripe
          </>
        )}
      </Button>
    </div>
  );
}