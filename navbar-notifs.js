import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDjlYDxJziqS2sHw46BkAl-PCRszDs1p4k", 
    authDomain: "ocarmy-db.firebaseapp.com", 
    projectId: "ocarmy-db" 
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
        // 1. WATCH CHARACTER TRANSFERS (Inbox Badge)
        const transferQ = query(collection(db, "transfers"), where("toUserId", "==", user.uid), where("status", "==", "pending"));
        onSnapshot(transferQ, (snap) => {
            updateBadge('badge-inbox', snap.size);
        });

        // 2. WATCH SOCIAL NOTIFICATIONS (Favorites & Subscriptions)
        const notifQ = query(collection(db, "notifications"), where("toUserId", "==", user.uid), where("status", "==", "unread"));
        onSnapshot(notifQ, (snap) => {
            let favCount = 0;
            let subCount = 0;
            snap.forEach(doc => {
                const data = doc.data();
                if (data.type === 'favorite') favCount++;
                if (data.type === 'subscription') subCount++;
            });
            updateBadge('badge-favs', favCount);
            updateBadge('badge-social', subCount);
        });

        // 3. WATCH WORLD REQUESTS (Keep at 0 for now)
        updateBadge('badge-worlds', 0);
    }
});

function updateBadge(id, count) {
    const el = document.getElementById(id);
    if (el) {
        el.innerText = count;
        const parentBtn = el.parentElement;
        if (count > 0) {
            parentBtn.style.opacity = "1";
            parentBtn.classList.remove('btn-secondary'); // Make it "pop"
            parentBtn.classList.add('btn-primary');
        } else {
            parentBtn.style.opacity = "0.6";
        }
    }
}
