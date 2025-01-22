import { db } from "@/lib/firebase";
import { doc, setDoc, collection, Timestamp, getDocs } from "firebase/firestore";

export async function saveBusinessData(userId: string, businessData: any, paymentDetails: any) {
  try {
    const userDocRef = doc(db, "users", userId);
    const businessesCollectionRef = collection(userDocRef, "businesses");
    const newBusinessDocRef = doc(businessesCollectionRef);

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
    return newBusinessDocRef.id;
  } catch (error) {
    console.error("Error saving business data:", error);
    throw error;
  }
}

export async function getBusinesses(userId: string) {
  try {
    const userDocRef = doc(db, "users", userId);
    const businessesCollectionRef = collection(userDocRef, "businesses");
    const snapshot = await getDocs(businessesCollectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching businesses:", error);
    throw error;
  }
}