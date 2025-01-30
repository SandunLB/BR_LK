import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { Timestamp } from 'firebase-admin/firestore';

export async function PUT(
  request: Request,
  context: { params: { userId: string; businessId: string } }
) {
  try {
    const { userId, businessId } = context.params;
    const body = await request.json();

    const businessRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('businesses')
      .doc(businessId);

    await businessRef.update({
      ...body,
      updatedAt: Timestamp.now()
    });

    const updatedDoc = await businessRef.get();
    
    if (!updatedDoc.exists) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: updatedDoc.id, 
        ...updatedDoc.data() 
      } 
    });

  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json(
      { error: 'Failed to update business' },
      { status: 500 }
    );
  }
}