import { auth, db } from './firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import {
  collection, addDoc, getDocs, serverTimestamp, query, orderBy
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

if (loginBtn) {
  loginBtn.onclick = () => {
    signInWithEmailAndPassword(auth, emailInput.value, passInput.value)
      .then(() => window.location = 'feed.html')
      .catch(e => alert(e.message));
  };
}

if (registerBtn) {
  registerBtn.onclick = () => {
    createUserWithEmailAndPassword(auth, emailInput.value, passInput.value)
      .then(() => alert('Registered!'))
      .catch(e => alert(e.message));
  };
}

const postBtn = document.getElementById('postBtn');
const postInput = document.getElementById('postInput');
const postsDiv = document.getElementById('posts');

if (postBtn) {
  postBtn.onclick = async () => {
    if (postInput.value.trim() === '') return;
    await addDoc(collection(db, 'posts'), {
      text: postInput.value,
      user: auth.currentUser.email,
      time: serverTimestamp()
    });
    postInput.value = '';
    loadPosts();
  };
}

async function loadPosts() {
  const q = query(collection(db, 'posts'), orderBy('time', 'desc'));
  const snap = await getDocs(q);
  postsDiv.innerHTML = '';
  snap.forEach(doc => {
    const data = doc.data();
    const postEl = document.createElement('div');
    postEl.className = "post";
    postEl.innerHTML = `<strong>${data.user}</strong><p>${data.text}</p>`;
    postsDiv.appendChild(postEl);
  });
}

onAuthStateChanged(auth, user => {
  if (user && postsDiv) loadPosts();
});
