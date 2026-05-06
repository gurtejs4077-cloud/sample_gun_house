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
let providersCache = null;

// Initialize Firebase (Only if config is provided)
async function initDatabase() {
  if (providersCache) return providersCache;

  if (firebaseConfig.apiKey === "YOUR_API_KEY" || !firebaseConfig.apiKey) {
    console.warn("Firebase not configured. Using local products.js data.");
    return null;
  }

  try {
    // 10-second timeout for Firebase SDK loading
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Firebase SDK load timed out. Check your internet connection.")), 10000)
    );

    const [
      { initializeApp },
      { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc },
    ] = await Promise.race([
      Promise.all([
        import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'),
      ]),
      timeout.then(() => { throw new Error("Firebase SDK load timed out."); })
    ]);

    // Load analytics separately — non-critical, don't let it block
    import('https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js')
      .then(({ getAnalytics }) => { try { getAnalytics(initializeApp(firebaseConfig)); } catch(e) {} })
      .catch(() => {});

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);

    providersCache = { doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc };
    console.log("Firebase initialized successfully.");
    return providersCache;
  } catch (error) {
    console.error("Firebase init failed:", error.message);
    providersCache = null; // reset so it can retry
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
  if (!navigator.onLine) {
    alert("You are currently offline. Please connect to the internet to sync changes.");
    return false;
  }

  const providers = await initDatabase();
  if (!providers || !db) {
    alert("Database not configured! Changes will only be temporary.");
    return false;
  }

  // Set a timeout to prevent indefinite hanging (30 seconds)
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Sync timed out after 30 seconds. This usually happens due to a poor connection or Firestore being unreachable.")), 30000)
  );

  try {
    const docRef = providers.doc(db, "inventory", "main");
    console.log("Saving inventory to Firestore...");
    
    // Race the Firestore operation against the timeout
    await Promise.race([
      providers.setDoc(docRef, data),
      timeoutPromise
    ]);
    
    console.log("Inventory saved successfully.");
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
