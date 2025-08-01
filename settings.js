import { auth } from './firebase.js';
import {
  updateEmail,
  updatePassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

const newEmailInput = document.getElementById('newEmail');
const newPasswordInput = document.getElementById('newPassword');
const updateEmailBtn = document.getElementById('updateEmailBtn');
const updatePasswordBtn = document.getElementById('updatePasswordBtn');
const logoutBtn = document.getElementById('logoutBtn');

onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Please login first");
    window.location = "index.html";
  }
});

updateEmailBtn.onclick = () => {
  const newEmail = newEmailInput.value.trim();
  if (!newEmail) return alert("Enter new email");

  updateEmail(auth.currentUser, newEmail)
    .then(() => alert("Email updated!"))
    .catch(e => alert("Error: " + e.message));
};

updatePasswordBtn.onclick = () => {
  const newPassword = newPasswordInput.value.trim();
  if (!newPassword) return alert("Enter new password");

  updatePassword(auth.currentUser, newPassword)
    .then(() => alert("Password updated!"))
    .catch(e => alert("Error: " + e.message));
};

logoutBtn.onclick = () => {
  signOut(auth)
    .then(() => window.location = "index.html")
    .catch(e => alert("Error logging out: " + e.message));
};
