import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get all users from Auth
    const usersResult = await adminAuth.listUsers();
    
    // Get Firestore data for each user
    const usersWithData = await Promise.all(
      usersResult.users.map(async (user) => {
        // Get user's businesses collection
        const businessesSnapshot = await adminDb
          .collection('users')
          .doc(user.uid)
          .collection('businesses')
          .get();

        // Convert businesses data
        const businesses = businessesSnapshot.docs.map(doc => ({
          id: doc.id,
          path: `/users/${user.uid}/businesses/${doc.id}`,
          ...doc.data()
        }));

        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
          providerData: user.providerData,
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime,
          businesses
        };
      })
    );

    return NextResponse.json({ users: usersWithData });
  } catch (error) {
    console.error('Error listing users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' }, 
      { status: 500 }
    );
  }
}