import { NextResponse } from "next/server";
import Stripe from "stripe";
import { saveBusinessData } from "@/utils/firebase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"]
    });

    if (!session.metadata?.businessData) {
      throw new Error("Missing business data in payment session");
    }

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const businessData = JSON.parse(session.metadata.businessData);
    const paymentIntent = session.payment_intent as Stripe.PaymentIntent;

    const paymentDetails = {
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      paymentMethod: paymentIntent.payment_method_types[0],
      status: paymentIntent.status,
      createdAt: new Date(paymentIntent.created * 1000).toISOString(),
      stripePaymentIntentId: paymentIntent.id,
    };

    const businessId = await saveBusinessData(
      businessData.userId,
      businessData,
      paymentDetails
    );

    return NextResponse.json({
      businessId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      stripePaymentIntentId: paymentIntent.id,
      createdAt: paymentDetails.createdAt
    });

  } catch (error) {
    console.error("Payment confirmation failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment confirmation failed" },
      { status: 500 }
    );
  }
}