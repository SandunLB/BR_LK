import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { NextResponse } from "next/server"

interface Business {
  id: string
  userId: string
  userEmail: string | undefined
  path: string
  documents?: {
    [key: string]: {
      url: string
      name: string
    }
  }
  updatedAt?: FirebaseFirestore.Timestamp
}

export async function GET() {
  try {
    const usersResult = await adminAuth.listUsers()
    const businesses: Business[] = []

    for (const user of usersResult.users) {
      try {
        const businessesSnapshot = await adminDb
          .collection("users")
          .doc(user.uid)
          .collection("businesses")
          .get()

        const businessDocs = businessesSnapshot.docs.map(doc => ({
          id: doc.id,
          userId: user.uid,
          userEmail: user.email,
          path: `/users/${user.uid}/businesses/${doc.id}`,
          ...doc.data()
        })) as Business[]

        businesses.push(...businessDocs)
      } catch (error) {
        console.error(`Error fetching businesses for user ${user.uid}:`, error)
        // Continue with next user instead of failing completely
        continue
      }
    }

    return NextResponse.json({ 
      success: true,
      businesses,
      total: businesses.length
    })
  } catch (error) {
    console.error("Error listing businesses:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 }
    )
  }
}