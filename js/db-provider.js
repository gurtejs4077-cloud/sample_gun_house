/**
 * SAHIBZADA GUN HOUSE — Live Database Provider
 * This module handles the automatic syncing of products, categories, and brands.
 */

// --- PASTE YOUR FIREBASE CONFIG HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyAjjbfZnzejzzatJZg8kc5X-03CPQLsTVs",
  authDomain: "sahibzada-gun-house.firebaseapp.com",
  projectId: "sahibzada-gun-house",
  storageBucket: "sahibzada-gun-house.firebasestorage.app",
  messagingSenderId: "86635259129",
  appId: "1:86635259129:web:1647d819ce5c42dd10ae28",
  measurementId: "G-RSJR1T9QR4"
};
// ---------------------------------------

let db = null;

// Initialize Firebase (Only if config is provided)
async function initDatabase() {
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.warn("Firebase not configured. Using local products.js data.");
    return null;
  }

  try {
    // Dynamically load Firebase SDKs
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const { getAnalytics } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js');

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);

    try { getAnalytics(app); } catch (e) { console.warn("Analytics failed to load:", e); }
    return { doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc };
  } catch (error) {
    console.error("Firebase init failed:", error);
    return null;
  }
}

/**
 * Loads all data (products, categories, brands)
 */
async function loadInventory() {
  const providers = await initDatabase();

  if (!providers || !db) {
    // Fallback to the variables defined in products.js
    return {
      products: typeof PRODUCTS !== 'undefined' ? PRODUCTS : [],
      categories: typeof CATEGORIES !== 'undefined' ? CATEGORIES : [],
      brands: typeof BRANDS !== 'undefined' ? BRANDS : []
    };
  }

  try {
    const docRef = providers.doc(db, "inventory", "main");
    const docSnap = await providers.getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // If DB is empty, seed it with current local data
      const initialData = { products: PRODUCTS, categories: CATEGORIES, brands: BRANDS };
      await providers.setDoc(docRef, initialData);
      return initialData;
    }
  } catch (error) {
    console.error("Error loading from database:", error);
    return { products: PRODUCTS, categories: CATEGORIES, brands: BRANDS };
  }
}

/**
 * Saves all data to the live database
 */
async function saveInventory(data) {
  const providers = await initDatabase();

  if (!providers || !db) {
    alert("Database not configured! Changes will only be temporary.");
    return false;
  }

  try {
    const docRef = providers.doc(db, "inventory", "main");
    await providers.setDoc(docRef, data);
    return true;
  } catch (error) {
    console.error("Error saving to database:", error);
    alert("Save failed: " + error.message);
    return false;
  }
}

/**
 * Saves a customer enquiry/reservation
 */
async function saveEnquiry(enquiryData) {
  const providers = await initDatabase();
  if (!providers || !db) return false;

  try {
    const colRef = providers.collection(db, "enquiries");
    await providers.addDoc(colRef, {
      ...enquiryData,
      timestamp: Date.now()
    });
    return true;
  } catch (error) {
    console.error("Error saving enquiry:", error);
    return false;
  }
}

/**
 * Loads all enquiries for the admin panel
 */
async function loadEnquiries() {
  const providers = await initDatabase();
  if (!providers || !db) return [];

  try {
    const colRef = providers.collection(db, "enquiries");
    const querySnapshot = await providers.getDocs(colRef);
    
    const enquiries = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort by timestamp descending
    return enquiries.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error loading enquiries:", error);
    return [];
  }
}

/**
 * Deletes an enquiry from the database
 */
async function deleteEnquiryFromDB(id) {
  const providers = await initDatabase();
  if (!providers || !db) return false;

  try {
    const docRef = providers.doc(db, "enquiries", id);
    await providers.deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    return false;
  }
}
