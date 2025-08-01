import { auth, db } from './firebase.js';
import {
  collection,
  doc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const container = document.getElementById("postsContainer");

let currentUserUid = null;

onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Please login first");
    window.location = "index.html";
    return;
  }
  currentUserUid = user.uid;

  const q = query(collection(db, "posts"), orderBy("time", "desc"));

  onSnapshot(q, (snapshot) => {
    container.innerHTML = "";
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const postId = docSnap.id;

      const likedBy = data.likedBy || [];
      const isLiked = likedBy.includes(currentUserUid);

      const postDiv = document.createElement("div");
      postDiv.className = "post";

      const date = data.time?.toDate ? data.time.toDate() : new Date();
      const dateStr = date.toLocaleString();

      postDiv.innerHTML = `
        <div class="post-header">
          <img src="${data.avatar || 'https://via.placeholder.com/40'}" class="avatar" alt="avatar" />
          <div class="post-info">
            <div class="name">${data.user || "Unknown"}</div>
            <div class="meta">${dateStr} · ${data.visibility || "Public"}</div>
          </div>
        </div>
        <div class="post-content">${data.text || ""}</div>

        <div class="post-actions">
          <button class="likeBtn">${isLiked ? '❤️' : '🤍'} Like (<span class="likeCount">${likedBy.length}</span>)</button>
          <button class="commentBtn">💬 Comment</button>
          <button class="shareBtn">🔄 Share</button>
        </div>

        <div class="comments" style="display:none; margin-top:10px;">
          <div class="comments-list"></div>
          <input type="text" class="commentInput" placeholder="Write a comment..." />
          <button class="postCommentBtn">Post</button>
        </div>
      `;

      container.appendChild(postDiv);

      // Like button toggle
      const likeBtn = postDiv.querySelector(".likeBtn");
      const likeCountSpan = postDiv.querySelector(".likeCount");
      likeBtn.onclick = async () => {
        const postDoc = doc(db, "posts", postId);
        if (isLiked) {
          await updateDoc(postDoc, {
            likedBy: arrayRemove(currentUserUid)
          });
        } else {
          await updateDoc(postDoc, {
            likedBy: arrayUnion(currentUserUid)
          });
        }
      };

      // Comment toggle
      const commentBtn = postDiv.querySelector(".commentBtn");
      const commentsDiv = postDiv.querySelector(".comments");
      const commentsListDiv = postDiv.querySelector(".comments-list");
      const commentInput = postDiv.querySelector(".commentInput");
      const postCommentBtn = postDiv.querySelector(".postCommentBtn");

      commentBtn.onclick = () => {
        commentsDiv.style.display = commentsDiv.style.display === "none" ? "block" : "none";
        if (commentsDiv.style.display === "block") {
          loadComments();
        }
      };

      async function loadComments() {
        commentsListDiv.innerHTML = "Loading comments...";
        const commentsSnapshot = await getDocs(collection(db, "posts", postId, "comments"));
        commentsListDiv.innerHTML = "";
        commentsSnapshot.forEach(commentDoc => {
          const c = commentDoc.data();
          const cDate = c.time?.toDate ? c.time.toDate() : new Date();
          const cDateStr = cDate.toLocaleString();
          const cElem = document.createElement("div");
          cElem.style.marginBottom = "8px";
          cElem.innerHTML = `<strong>${c.user}</strong> (${cDateStr}): ${c.text}`;
          commentsListDiv.appendChild(cElem);
        });
      }

      postCommentBtn.onclick = async () => {
        const commentText = commentInput.value.trim();
        if (!commentText) return alert("Enter a comment");

        const commentRef = doc(collection(db, "posts", postId, "comments"));
        await setDoc(commentRef, {
          user: auth.currentUser.email,
          text: commentText,
          time: serverTimestamp()
        });
        commentInput.value = "";
        loadComments();
      };

      // Share button: simple copy text to clipboard
      const shareBtn = postDiv.querySelector(".shareBtn");
      shareBtn.onclick = () => {
        navigator.clipboard.writeText(data.text || "")
          .then(() => alert("Post text copied to clipboard!"))
          .catch(() => alert("Failed to copy!"));
      };
    });
  });
});
