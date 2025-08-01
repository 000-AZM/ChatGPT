import { auth, db } from './firebase.js';
import {
  doc, setDoc, getDoc, updateDoc, arrayUnion
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

const searchInput = document.getElementById('searchEmail');
const addBtn = document.getElementById('addFriendBtn');
const friendList = document.getElementById('friendList');

onAuthStateChanged(auth, async user => {
  if (!user) {
    alert("Please log in first");
    window.location = "index.html";
    return;
  }

  const userDoc = doc(db, "users", user.uid);
  const userSnap = await getDoc(userDoc);
  const userData = userSnap.data() || {};
  const friends = userData.friends || [];

  // Load friend emails
  friendList.innerHTML = '';
  for (let email of friends) {
    const li = document.createElement('li');
    li.textContent = email;
    friendList.appendChild(li);
  }

  addBtn.onclick = async () => {
    const email = searchInput.value.trim();
    if (!email) return;

    // Add friend email
    await updateDoc(userDoc, {
      friends: arrayUnion(email)
    });

    const li = document.createElement('li');
    li.textContent = email;
    friendList.appendChild(li);

    searchInput.value = '';
  };
});
