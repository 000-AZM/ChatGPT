import { auth, db } from './firebase.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

const nameInput = document.getElementById('name');
const bioInput = document.getElementById('bio');
const saveBtn = document.getElementById('saveBtn');

onAuthStateChanged(auth, async user => {
  if (!user) {
    alert("Please log in first");
    window.location = "index.html";
    return;
  }

  const userDoc = doc(db, "users", user.uid);
  const userSnap = await getDoc(userDoc);

  if (userSnap.exists()) {
    const data = userSnap.data();
    nameInput.value = data.name || "";
    bioInput.value = data.bio || "";
  }

  saveBtn.onclick = async () => {
    await setDoc(userDoc, {
      name: nameInput.value,
      bio: bioInput.value,
      email: user.email
    }, { merge: true });
    alert("Profile saved!");
  };
});
