import { db } from "@/lib/firebase";
import { doc, setDoc, collection, Timestamp } from "firebase/firestore";

export async function saveBusinessData(userId: string, businessData: any, paymentDetails: any) {
  try {
    const userDocRef = doc(db, "users", userId);
    const businessesCollectionRef = collection(userDocRef, "businesses");
    const newBusinessDocRef = doc(businessesCollectionRef); // Auto-generate business ID

    const dataToSave = {
      ...businessData,
      paymentDetails: {
        ...paymentDetails,
        createdAt: Timestamp.fromDate(new Date(paymentDetails.createdAt)),
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(newBusinessDocRef, dataToSave);

    return newBusinessDocRef.id; // Return the ID of the newly created business
  } catch (error) {
    console.error("Error saving business data:", error);
    throw error;
  }
}