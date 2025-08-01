import { auth, db } from './firebase.js';
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

const friendEmailInput = document.getElementById('friendEmail');
const addFriendBtn = document.getElementById('addFriendBtn');
const friendList = document.getElementById('friendList');

let userDocRef;

onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Please log in first");
    window.location = "index.html";
    return;
  }

  userDocRef = doc(db, "users", user.uid);

  // Listen for real-time friend updates
  onSnapshot(userDocRef, docSnap => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const friends = data.friends || [];
      renderFriends(friends);
    }
  });
});

addFriendBtn.onclick = async () => {
  const friendEmail = friendEmailInput.value.trim();
  if (!friendEmail) return alert("Please enter friend's email.");

  try {
    await updateDoc(userDocRef, {
      friends: arrayUnion(friendEmail)
    });
    friendEmailInput.value = "";
  } catch (e) {
    alert("Failed to add friend: " + e.message);
  }
};

function renderFriends(friends) {
  friendList.innerHTML = "";
  friends.forEach(email => {
    const li = document.createElement("li");
    li.textContent = email;
    friendList.appendChild(li);
  });
}
