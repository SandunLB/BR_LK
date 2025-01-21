import { NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"
import { saveBusinessData } from "@/utils/firebase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get("stripe-signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const businessData = JSON.parse(session.metadata?.businessData || "{}")

    try {
      await saveBusinessData(businessData.userId, businessData)
      return NextResponse.json({ received: true, businessId: businessData.userId })
    } catch (error) {
      console.error("Error saving business data:", error)
      return NextResponse.json({ error: "Error saving business data" }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

