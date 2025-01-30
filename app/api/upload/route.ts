import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file: File | null = formData.get('file') as unknown as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create file path
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}.${fileExtension}`;
    const filePath = `users/${userId}/documents/${fileName}`;

    // Upload to Firebase Storage
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, buffer);
    const url = await getDownloadURL(storageRef);

    return NextResponse.json({ 
      url,
      name: file.name
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}