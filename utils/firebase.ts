import { db, storage } from "@/lib/firebase";
import { 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  Timestamp,
  DocumentReference
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Types
interface Owner {
  id: string;
  fullName: string;
  ownership: string;
  isCEO?: boolean;
  birthDate?: string;
  documentUrl?: string;
  documentName?: string;
}

interface BusinessData {
  owner?: Owner[];
  country?: { name: string };
  package?: { name: string; price: number };
  company?: {
    name: string;
    type: string;
    industry: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status?: 'draft' | 'completed';
  createdAt?: any;
  updatedAt?: any;
  paymentDetails?: any;
}

interface PaymentDetails {
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  stripePaymentIntentId: string;
}

// Utility function to format dates in UTC
export function formatDate(date: Date | string): string {
  const jsDate = new Date(date);
  return jsDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  });
}

// Clean Firestore data by removing undefined values
const cleanFirestoreData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(cleanFirestoreData);
  }
  if (data !== null && typeof data === 'object') {
    return Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = cleanFirestoreData(value);
      }
      return acc;
    }, {} as Record<string, any>);
  }
  return data;
};

// Upload a document to Firebase Storage
export async function uploadDocument(userId: string, file: File): Promise<string> {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExtension}`;
    const filePath = `users/${userId}/documents/${fileName}`;
    const storageRef = ref(storage, filePath);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw new Error("Failed to upload document");
  }
}

// Delete a document from Firebase Storage
export async function deleteDocument(documentUrl: string): Promise<void> {
  try {
    // Extract the path from the URL
    const decodedUrl = decodeURIComponent(documentUrl);
    const urlParts = decodedUrl.split('/o/')[1].split('?')[0];
    const storageRef = ref(storage, urlParts);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting document:", error);
    throw new Error("Failed to delete document");
  }
}

// Save business draft
export async function saveBusinessDraft(userId: string, businessData: BusinessData) {
  try {
    const userDocRef = doc(db, "users", userId);
    const businessesCollectionRef = collection(userDocRef, "businesses");
    const newBusinessDocRef = doc(businessesCollectionRef);

    const formattedBusinessData = {
      ...businessData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'draft'
    };

    await setDoc(newBusinessDocRef, cleanFirestoreData(formattedBusinessData));
    return newBusinessDocRef.id;
  } catch (error) {
    console.error("Error saving business draft:", error);
    throw error;
  }
}

// Complete business registration with payment details
export async function completeBusinessRegistration(
  userId: string, 
  businessId: string, 
  paymentDetails: PaymentDetails
) {
  try {
    const businessDocRef = doc(db, "users", userId, "businesses", businessId);

    const formattedPaymentDetails = {
      ...paymentDetails,
      createdAt: formatDate(paymentDetails.createdAt)
    };

    await updateDoc(businessDocRef, cleanFirestoreData({
      paymentDetails: formattedPaymentDetails,
      status: "completed",
      updatedAt: serverTimestamp(),
    }));

    return businessId;
  } catch (error) {
    console.error("Error completing registration:", error);
    throw error;
  }
}

// Get a specific business draft
export async function getBusinessDraft(userId: string, businessId: string) {
  try {
    const businessDocRef = doc(db, "users", userId, "businesses", businessId);
    const businessDoc = await getDoc(businessDocRef);

    if (businessDoc.exists()) {
      return businessDoc.data();
    }
    throw new Error("Business draft not found");
  } catch (error) {
    console.error("Error fetching business draft:", error);
    throw error;
  }
}

// Get all businesses for a user
export async function getBusinesses(userId: string) {
  try {
    const userDocRef = doc(db, "users", userId);
    const businessesCollectionRef = collection(userDocRef, "businesses");
    const snapshot = await getDocs(businessesCollectionRef);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...cleanFirestoreData(doc.data())
    }));
  } catch (error) {
    console.error("Error fetching businesses:", error);
    throw error;
  }
}

// Update an existing business
export async function updateBusiness(
  userId: string, 
  businessId: string, 
  updateData: Partial<BusinessData>
) {
  try {
    const businessDocRef = doc(db, "users", userId, "businesses", businessId);
    
    const updatedData = {
      ...updateData,
      updatedAt: serverTimestamp()
    };

    await updateDoc(businessDocRef, cleanFirestoreData(updatedData));
    return businessId;
  } catch (error) {
    console.error("Error updating business:", error);
    throw error;
  }
}

// Utility function to convert Firestore Timestamp to formatted date string
export function convertTimestamp(timestamp: Timestamp): string {
  return formatDate(timestamp.toDate());
}

// Utility function to get storage file path from URL
export function getStoragePathFromUrl(url: string): string {
  const decodedUrl = decodeURIComponent(url);
  return decodedUrl.split('/o/')[1].split('?')[0];
}