import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBXhnT5AWMmJnQMDRFTlE5hdtKbjB4nxNw",
  authDomain: "dkhil-32644.firebaseapp.com",
  projectId: "dkhil-32644",
  storageBucket: "dkhil-32644.firebasestorage.app",
  messagingSenderId: "37336137805",
  appId: "1:37336137805:web:b4a3eae4650a7e87405c04",
  measurementId: "G-92BRXN0F8Z",
  databaseURL: "https://dkhil-32644-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { app as firebaseApp, auth, database, storage };