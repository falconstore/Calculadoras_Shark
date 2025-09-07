// PASSO 5 - assets/js/config/firebase.js
// Configuração e inicialização do Firebase

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Configurações do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC6-O6BnUXGzwXwcRM_wRYwGUNFuRpT7NI",
  authDomain: "calculadora-free-pro.firebaseapp.com",
  projectId: "calculadora-free-pro",
  storageBucket: "calculadora-free-pro.firebasestorage.app",
  messagingSenderId: "313485499345",
  appId: "1:313485499345:web:020a4d47f6de604c129ef0",
  measurementId: "G-X7QJD503L6"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Disponibiliza globalmente para compatibilidade com código existente
window.firebaseDb = db;
window.firebaseGetDoc = getDoc;
window.firebaseDoc = doc;

// Exporta para uso em módulos ES6
export { db, doc, getDoc };

// Log para debug
console.log('Firebase inicializado com sucesso');
