import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const usersResult = await adminAuth.listUsers();
    const businesses: any[] = [];

    for (const user of usersResult.users) {
      const businessesSnapshot = await adminDb
        .collection('users')
        .doc(user.uid)
        .collection('businesses')
        .get();

      businessesSnapshot.docs.forEach(doc => {
        businesses.push({
          id: doc.id,
          userId: user.uid,
          userEmail: user.email,
          path: `/users/${user.uid}/businesses/${doc.id}`,
          ...doc.data()
        });
      });
    }

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error('Error listing businesses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}