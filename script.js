import { auth, db } from './firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import {
  collection, addDoc, getDocs, serverTimestamp, query, orderBy
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const postBtn = document.getElementById('postBtn');
  const postInput = document.getElementById('postInput');
  const postsDiv = document.getElementById('posts');

  if (loginBtn) {
    loginBtn.onclick = () => {
      if (!emailInput.value || !passInput.value) {
        alert("Please enter email and password.");
        return;
      }
      signInWithEmailAndPassword(auth, emailInput.value, passInput.value)
        .then(() => window.location = 'feed.html')
        .catch(e => alert(e.message));
    };
  }

  if (registerBtn) {
    registerBtn.onclick = () => {
      if (!emailInput.value || !passInput.value) {
        alert("Please enter email and password.");
        return;
      }
      createUserWithEmailAndPassword(auth, emailInput.value, passInput.value)
        .then(() => alert('Registered!'))
        .catch(e => alert(e.message));
    };
  }

  if (postBtn && postInput && postsDiv) {
    postBtn.onclick = async () => {
      const content = postInput.value.trim();
      if (content === '') {
        alert("Post content cannot be empty.");
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to post.");
        return;
      }

      try {
        await addDoc(collection(db, 'posts'), {
          text: content,
          user: user.email,
          time: serverTimestamp()
        });
        postInput.value = '';
        loadPosts();
      } catch (e) {
        alert("Error posting: " + e.message);
      }
    };
  }

  async function loadPosts() {
    try {
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
    } catch (e) {
      console.error("Error loading posts:", e);
    }
  }

  onAuthStateChanged(auth, user => {
    if (user && postsDiv) loadPosts();
  });
});
