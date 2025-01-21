import { db } from "@/lib/firebase"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"

export async function saveBusinessData(userId: string, businessData: any) {
  try {
    const userDocRef = doc(db, "users", userId)
    
    // First, get the current user document
    const userDoc = await getDoc(userDocRef)
    
    if (!userDoc.exists()) {
      // If user document doesn't exist, create it with first business
      await setDoc(userDocRef, {
        businesses: [{
          id: '1',
          ...businessData,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]
      })
      return '1' // Return the business ID
    } else {
      // If user exists, get current businesses array
      const userData = userDoc.data()
      const businesses = userData.businesses || []
      
      // Generate new business ID (increment from last business)
      const newBusinessId = businesses.length > 0 
        ? String(Number(businesses[businesses.length - 1].id) + 1)
        : '1'
      
      // Add new business to array
      businesses.push({
        id: newBusinessId,
        ...businessData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      
      // Update user document with new businesses array
      await updateDoc(userDocRef, {
        businesses: businesses
      })
      
      return newBusinessId
    }
  } catch (error) {
    console.error("Error saving business data:", error)
    throw error
  }
}

// Optional: Function to get all businesses for a user
export async function getUserBusinesses(userId: string) {
  try {
    const userDocRef = doc(db, "users", userId)
    const userDoc = await getDoc(userDocRef)
    
    if (!userDoc.exists()) {
      return []
    }
    
    return userDoc.data().businesses || []
  } catch (error) {
    console.error("Error getting user businesses:", error)
    throw error
  }
}

// Optional: Function to get a specific business
export async function getUserBusiness(userId: string, businessId: string) {
  try {
    const userDocRef = doc(db, "users", userId)
    const userDoc = await getDoc(userDocRef)
    
    if (!userDoc.exists()) {
      return null
    }
    
    const businesses = userDoc.data().businesses || []
    return businesses.find((business: any) => business.id === businessId) || null
  } catch (error) {
    console.error("Error getting user business:", error)
    throw error
  }
}