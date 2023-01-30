import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
// import Constants from "expo-constants";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// console.log("constants contain : " + JSON.stringify(Constants.manifest.extra));

const firebaseConfig = {
  // apiKey: Constants.manifest.extra.apiKey,
  // authDomain: Constants.manifest.extra.authDomain,
  // projectId: Constants.manifest.extra.projectId,
  // storageBucket: Constants.manifest.extra.storageBucket,
  // messagingSenderId: Constants.manifest.extra.messagingSenderId,
  // appId: Constants.manifest.extra.appId,
  // databaseURL: Constants.manifest.extra.databaseURL,
  apiKey: "AIzaSyDOAVv8KcY0Vtp-NSeCcvn3i8zV2k8X6CU",
  authDomain: "letschat-f37d6.firebaseapp.com",
  projectId: "letschat-f37d6",
  storageBucket: "letschat-f37d6.appspot.com",
  messagingSenderId: "666141643891",
  appId: "1:666141643891:web:6df1d228a817926e3ac606",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
