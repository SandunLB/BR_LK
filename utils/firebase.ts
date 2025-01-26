import { db } from "@/lib/firebase";
import { doc, setDoc, collection, Timestamp, getDocs, getDoc, updateDoc } from "firebase/firestore";

// Utility function to format dates in UTC (defined inside firebase.ts)
function formatDate(date: Date | string): string {
  const jsDate = new Date(date); // Ensure it's a Date object
  return jsDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC', // Explicitly set the timezone to UTC
    timeZoneName: 'short',
  });
}

const cleanFirestoreData = (data: any): any => {
  if (Array.isArray(data)) return data.map(cleanFirestoreData);
  if (data !== null && typeof data === 'object') {
    return Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = cleanFirestoreData(value);
      return acc;
    }, {} as Record<string, any>);
  }
  return data;
};

export async function saveBusinessDraft(userId: string, businessData: any) {
  try {
    const userDocRef = doc(db, "users", userId);
    const businessesCollectionRef = collection(userDocRef, "businesses");
    const newBusinessDocRef = doc(businessesCollectionRef);

    // Format all date fields in businessData
    const formattedBusinessData = {
      ...businessData,
      createdAt: formatDate(new Date()), // Format the current date in UTC
      updatedAt: formatDate(new Date()), // Format the current date in UTC
    };

    await setDoc(newBusinessDocRef, cleanFirestoreData(formattedBusinessData));

    return newBusinessDocRef.id;
  } catch (error) {
    console.error("Error saving business draft:", error);
    throw error;
  }
}

export async function completeBusinessRegistration(userId: string, businessId: string, paymentDetails: any) {
  try {
    const businessDocRef = doc(db, "users", userId, "businesses", businessId);

    // Format the paymentDetails.createdAt field in UTC
    const formattedPaymentDetails = {
      ...paymentDetails,
      createdAt: formatDate(paymentDetails.createdAt), // Format the date in UTC
    };

    await updateDoc(businessDocRef, cleanFirestoreData({
      paymentDetails: formattedPaymentDetails,
      status: "completed",
      updatedAt: formatDate(new Date()), // Format the current date in UTC
    }));

    return businessId;
  } catch (error) {
    console.error("Error completing registration:", error);
    throw error;
  }
}

export async function getBusinessDraft(userId: string, businessId: string) {
  try {
    const businessDocRef = doc(db, "users", userId, "businesses", businessId);
    const businessDoc = await getDoc(businessDocRef);

    if (businessDoc.exists()) return businessDoc.data();
    throw new Error("Business draft not found");
  } catch (error) {
    console.error("Error fetching business draft:", error);
    throw error;
  }
}

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