import { db, auth } from './firebase.js';
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy
} from 'firebase/firestore';

export async function createPost(text, visibility = "public") {
  const user = auth.currentUser;
  if (!user) return alert("Login required");
  return await addDoc(collection(db, "posts"), {
    userId: user.uid,
    text,
    visibility,
    timestamp: serverTimestamp(),
    likes: []
  });
}

export async function getAllPosts() {
  const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function editPost(postId, newText) {
  await updateDoc(doc(db, "posts", postId), { text: newText });
}

export async function deletePost(postId) {
  await deleteDoc(doc(db, "posts", postId));
}
