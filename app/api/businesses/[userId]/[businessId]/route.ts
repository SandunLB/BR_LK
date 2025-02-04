// app/api/businesses/[userId]/[businessId]/route.ts
import { adminDb } from "@/lib/firebase-admin"
import { NextResponse } from "next/server"
import { Timestamp } from "firebase-admin/firestore"

interface BusinessDocument {
  id: string
  userId: string
  documents?: {
    [key: string]: {
      url: string
      name: string
    }
  }
  updatedAt: FirebaseFirestore.Timestamp
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string; businessId: string }> }
) {
  try {
    // Await the params object
    const { userId, businessId } = await params

    // Validate parameters
    if (!userId || !businessId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Validate request body
    const body = await request.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const businessRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("businesses")
      .doc(businessId)

    // Check if business exists
    const businessDoc = await businessRef.get()
    if (!businessDoc.exists) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      )
    }

    // Perform update
    await businessRef.update({
      ...body,
      updatedAt: Timestamp.now(),
    })

    // Get updated document
    const updatedDoc = await businessRef.get()
    const businessData = updatedDoc.data() as Omit<BusinessDocument, 'id'>

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...businessData,
      } as BusinessDocument,
    })
  } catch (error) {
    console.error("Error updating business:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update business" },
      { status: 500 }
    )
  }
}