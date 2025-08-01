import { auth, db } from './firebase.js';
import {
  doc, getDoc, setDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

const nameInput = document.getElementById('displayName');
const bioInput = document.getElementById('bio');
const saveBtn = document.getElementById('saveProfileBtn');

onAuthStateChanged(auth, async user => {
  if (!user) {
    alert("Please log in first");
    window.location = "index.html";
    return;
  }

  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    nameInput.value = data.name || "";
    bioInput.value = data.bio || "";
  }

  saveBtn.onclick = async () => {
    await setDoc(docRef, {
      name: nameInput.value,
      bio: bioInput.value,
      email: user.email
    });
    alert("Profile updated!");
  };
});
