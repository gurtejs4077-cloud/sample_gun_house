/**
 * SAHIBZADA GUN HOUSE — Live Database Provider
 * This module handles the automatic syncing of products, categories, and brands.
 */

// --- PASTE YOUR FIREBASE CONFIG HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyCnz1IsDNZIhHn3PMqq4GpiqAkVBtcIyzg",
  authDomain: "gymflow-83d53.firebaseapp.com",
  projectId: "gymflow-83d53",
  storageBucket: "gymflow-83d53.firebasestorage.app",
  messagingSenderId: "606905628730",
  appId: "1:606905628730:web:31b7a28e2345484d0f5d03",
  measurementId: "G-XQ34HFPY14"
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
    const { getFirestore, doc, getDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    return { doc, getDoc, setDoc };
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
