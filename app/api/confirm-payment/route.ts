import { NextResponse } from "next/server";
import Stripe from "stripe";
import { completeBusinessRegistration, getBusinessDraft } from "@/utils/firebase";
import { Timestamp } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"]
    });

    const businessId = session.metadata?.businessId;
    const userId = session.metadata?.userId;
    
    if (!businessId || !userId) {
      throw new Error("Missing business ID or user ID in payment session");
    }

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
    const paymentDetails = {
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      paymentMethod: paymentIntent.payment_method_types[0],
      status: paymentIntent.status,
      stripePaymentIntentId: paymentIntent.id,
    };

    const completedBusinessId = await completeBusinessRegistration(
      userId,
      businessId,
      paymentDetails
    );

    // Get the updated business data
    const businessData = await getBusinessDraft(userId, completedBusinessId);

    // Convert Firestore timestamp to a format that can be JSON serialized
    const timestamp = businessData.paymentDetails?.createdAt;
    const createdAt = timestamp ? {
      seconds: timestamp.seconds,
      nanoseconds: timestamp.nanoseconds
    } : null;

    return NextResponse.json({
      businessId: completedBusinessId,
      userId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      stripePaymentIntentId: paymentIntent.id,
      createdAt
    });

  } catch (error) {
    console.error("Payment confirmation failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment confirmation failed" },
      { status: 500 }
    );
  }
}