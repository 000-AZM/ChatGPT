import { auth, db } from './firebase.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

const nameText = document.getElementById('nameText');
const bioText = document.getElementById('bioText');
const nameInput = document.getElementById('nameInput');
const bioInput = document.getElementById('bioInput');

const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');

let userDocRef;
let originalData = {};

function showProfileView() {
  nameText.style.display = 'block';
  bioText.style.display = 'block';
  nameInput.style.display = 'none';
  bioInput.style.display = 'none';

  editBtn.style.display = 'inline-block';
  saveBtn.style.display = 'none';
  cancelBtn.style.display = 'none';
}

function showProfileEdit() {
  nameText.style.display = 'none';
  bioText.style.display = 'none';
  nameInput.style.display = 'block';
  bioInput.style.display = 'block';

  editBtn.style.display = 'none';
  saveBtn.style.display = 'inline-block';
  cancelBtn.style.display = 'inline-block';
}

function loadProfile(data) {
  originalData = data;
  nameText.textContent = data.name || "(No name set)";
  bioText.textContent = data.bio || "(No bio)";
  nameInput.value = data.name || "";
  bioInput.value = data.bio || "";
}

onAuthStateChanged(auth, async user => {
  if (!user) {
    alert("Please log in first");
    window.location = "index.html";
    return;
  }

  userDocRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userDocRef);

  if (userSnap.exists()) {
    loadProfile(userSnap.data());
  } else {
    loadProfile({});
  }
  showProfileView();
});

editBtn.onclick = () => {
  showProfileEdit();
};

cancelBtn.onclick = () => {
  loadProfile(originalData);
  showProfileView();
};

saveBtn.onclick = async () => {
  try {
    await setDoc(userDocRef, {
      name: nameInput.value.trim(),
      bio: bioInput.value.trim(),
      email: auth.currentUser.email
    }, { merge: true });
    loadProfile({
      name: nameInput.value.trim(),
      bio: bioInput.value.trim()
    });
    alert("Profile saved!");
    showProfileView();
  } catch (e) {
    alert("Error saving profile: " + e.message);
  }
};
