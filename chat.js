import { auth, db } from './firebase.js';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

const friendEmailInput = document.getElementById('friendEmailInput');
const startChatBtn = document.getElementById('startChatBtn');
const chatWindow = document.getElementById('chatWindow');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

let currentUser = null;
let chatId = null;

function generateChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

onAuthStateChanged(auth, user => {
if (!user) {
alert("Login required");
window.location = "index.html";
return;
}
currentUser = user;
});

startChatBtn.onclick = async () => {
const friendEmail = friendEmailInput.value.trim();
if (!friendEmail) return alert("Enter friend's email");

const usersSnap = await getDocs(query(collection(db, "users"), where("email", "==", friendEmail)));
if (usersSnap.empty) return alert("Friend not found");

const friendUid = usersSnap.docs[0].id;
chatId = generateChatId(currentUser.uid, friendUid);

chatWindow.innerHTML = "";
chatWindow.style.display = "block";
messageForm.style.display = "flex";

const msgRef = collection(db, "chats", chatId, "messages");
const q = query(msgRef, orderBy("time"));

onSnapshot(q, snapshot => {
chatWindow.innerHTML = "";
snapshot.forEach(docSnap => {
const msg = docSnap.data();
const div = document.createElement("div");
div.className = "message " + (msg.sender === currentUser.email ? "myMessage" : "friendMessage");
div.textContent = msg.text;
chatWindow.appendChild(div);
});
chatWindow.scrollTop = chatWindow.scrollHeight;
});
};

sendBtn.onclick = async () => {
const text = messageInput.value.trim();
if (!text) return;

await addDoc(collection(db, "chats", chatId, "messages"), {
sender: currentUser.email,
text,
time: new Date()
});
messageInput.value = "";
};

