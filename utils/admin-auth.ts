import { auth, db } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from "firebase/firestore";

export const signInAdmin = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const adminDoc = await getDoc(doc(db, "admins", email));
    
    if (!adminDoc.exists()) {
      await signOut(auth);
      throw new Error("Not authorized as admin");
    }
    
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signUpAdmin = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await setDoc(doc(db, "admins", email), {
      email,
      role: 'admin',
      createdAt: serverTimestamp()
    });

    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signOutAdmin = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const checkIsAdmin = async (email: string | null): Promise<boolean> => {
  if (!email) return false;
  
  try {
    const adminDoc = await getDoc(doc(db, "admins", email));
    return adminDoc.exists();
  } catch {
    return false;
  }
};