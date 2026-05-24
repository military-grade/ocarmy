import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDjlYDxJziqS2sHw46BkAl-PCRszDs1p4k", 
    authDomain: "ocarmy-db.firebaseapp.com", 
    projectId: "ocarmy-db" 
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

onAuthStateChanged(auth, async (user) => {
    if (user) {
        let dbId = user.uid;
        
        // Find user ID by email
        const emailQuery = query(collection(db, "users"), where("email", "==", user.email.toLowerCase()));
        const emailSnap = await getDocs(emailQuery);
        if (!emailSnap.empty) { 
            dbId = emailSnap.docs[0].id; 
        }

        // 1. WATCH MESSAGES
        const messageQ = query(collection(db, "messages"), where("recipientId", "==", dbId), where("isRead", "==", false));
        onSnapshot(messageQ, (snap) => {
            updateBadge('badge-messages', snap.size);
        });

        // 2. WATCH CHARACTER TRANSFERS (Worlds Badge)
        const transferQ = query(collection(db, "transfers"), where("toUserId", "==", user.uid), where("status", "==", "pending"));
        onSnapshot(transferQ, (snap) => {
            updateBadge('badge-worlds', snap.size);
        });

        // 3. WATCH SOCIAL NOTIFICATIONS (Favorites & Subscriptions)
        const notifQ = query(collection(db, "notifications"), where("toUserId", "==", user.uid), where("read", "==", false));
        onSnapshot(notifQ, (snap) => {
            let favCount = 0;
            let socialCount = 0;
            snap.forEach(doc => {
                const data = doc.data();
                if (data.type === 'favorite' || data.type === 'update') favCount++;
                if (data.type === 'subscription' || data.type === 'comment') socialCount++;
            });
            updateBadge('badge-favs', favCount);
            updateBadge('badge-social', socialCount);
        });
    }
});

function updateBadge(id, count) {
    const el = document.getElementById(id);
    if (el) {
        el.innerText = count;
        const parentBtn = el.parentElement;
        if (count > 0) {
            parentBtn.classList.add('active-alert');
        } else {
            parentBtn.classList.remove('active-alert');
        }
    }
}
