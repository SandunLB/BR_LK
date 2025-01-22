import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentProps {
  amount: number;
  businessData: any;
  onPaymentComplete: (details: { method: string; receiptUrl?: string; businessId: string }) => void;
}

export function Payment({ amount, businessData, onPaymentComplete }: PaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!user) {
      console.error("User not logged in");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          businessData: {
            ...businessData,
            userId: user.uid,
          },
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error("Stripe checkout error:", error);
      } else {
        sessionStorage.removeItem("businessRegistrationData");
        sessionStorage.removeItem("businessRegistrationStep");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Complete Your Payment
        </h2>
        <p className="text-gray-500 mt-2">Securely process your payment to finalize your business registration.</p>
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
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
      >
        {isLoading ? (
          "Processing..."
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