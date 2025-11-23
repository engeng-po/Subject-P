// ================================
// FIREBASE INIT (Firestore only)
// ================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCzL0J8uWD7tzWPB7KX6WbHN8ueIJttZ4E",
  authDomain: "psycho-190190.firebaseapp.com",
  projectId: "psycho-190190",
  storageBucket: "psycho-190190.firebasestorage.app",
  messagingSenderId: "213859311074",
  appId: "1:213859311074:web:08c334c1a4ca3ee692edbb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const postsRef = collection(db, "posts");

// ================================
// ELEMENTS
// ================================
const submitBtn = document.getElementById("submitBtn");
const howBtn = document.getElementById("howBtn");
const postsGrid = document.getElementById("postsGrid");
const postsTitle = document.getElementById("postsTitle");

// NEW Mina Panel
const minaPanel = document.getElementById("minaPanel");

// Back button
const backBtn = document.getElementById("backToFeed");

// Template helper
function cloneTemplate(id) {
  const tpl = document.getElementById(id);
  return tpl ? tpl.content.cloneNode(true) : null;
}

// ================================
// HOW IT WORKS MODAL
// ================================
if (howBtn) {
  howBtn.addEventListener("click", () => {
    const tpl = cloneTemplate("howItWorksTpl");
    if (!tpl) return;
    document.body.appendChild(tpl);

    document.getElementById("closeHow").addEventListener("click", () => {
      const overlay = document.getElementById("howOverlay");
      if (overlay) overlay.remove();
    });
  });
}

// ================================
// CREATE POST MODAL
// ================================
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    const tpl = cloneTemplate("postFormTpl");
    if (!tpl) return;
    document.body.appendChild(tpl);

    const overlay = document.getElementById("postOverlay");
    const form = document.getElementById("postForm");

    document.getElementById("cancelPost").addEventListener("click", () => {
      form.reset();
      overlay.remove();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const content = form.content.value.trim();
      const image = form.image.value.trim();

      if (!content) return;

      await addDoc(postsRef, {
        content,
        image: image || "",
        created: Date.now(),
        author: "user"
      });

      form.reset();
      overlay.remove();
    });
  });
}

// ================================
// RENDER POSTS
// ================================
function renderPosts(posts) {
  postsGrid.innerHTML = "";
  postsTitle.textContent = "Featured Posts";

  posts.forEach(post => {
    const card = document.createElement("div");
    card.className = "post-card";

    card.innerHTML = `
      ${post.image ? `<img src="${post.image}">` : ""}
      <p>${escapeHtml(post.content)}</p>
      <span class="post-time">${new Date(post.created).toLocaleString()}</span>
    `;

    postsGrid.appendChild(card);
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
}

// ================================
// REALTIME FEED (ONLY USER POSTS)
// ================================
const mainQuery = query(
  postsRef,
  orderBy("created", "desc")
);

onSnapshot(mainQuery, (snap) => {
  // Only update if feed is visible
  if (postsGrid.style.display === "none") return;

  const posts = snap.docs
    .map(d => d.data())
    .filter(p => p.author !== "mina");

  renderPosts(posts);
});

// ================================
// MINA PANEL (LONG PSYCHO TEXT)
// ================================
function showMinaPanel() {
  postsGrid.style.display = "none";
  postsTitle.textContent = "Mina’s Mindspace";
  minaPanel.style.display = "block";
}

function hideMinaPanel() {
  minaPanel.style.display = "none";
  postsGrid.style.display = "block";
  postsTitle.textContent = "Featured Posts";
}

// ================================
// DOM EVENTS
// ================================
document.addEventListener("DOMContentLoaded", () => {

  // Clicking Mina profile photo
  document.querySelectorAll(".profile").forEach(p => {
    if (p.dataset.author === "mina") {
      p.addEventListener("click", showMinaPanel);
    }
  });

  // Back to feed
  if (backBtn) {
    backBtn.addEventListener("click", hideMinaPanel);
  }
});

// TAB SYSTEM FOR MINA PANEL
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("tab-btn")) {

    // Remove active from all buttons
    document.querySelectorAll(".tab-btn").forEach(btn =>
      btn.classList.remove("active")
    );

    // Activate clicked button
    e.target.classList.add("active");

    // Hide all contents
    document.querySelectorAll(".tab-content").forEach(tab =>
      tab.classList.remove("active")
    );

    // Show selected tab content
    const target = e.target.dataset.tab;
    document.getElementById(target).classList.add("active");
  }
});

// TAB SYSTEM
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("tab-btn")) {

    // Activate button
    document
      .querySelectorAll(".tab-btn")
      .forEach(btn => btn.classList.remove("active"));

    e.target.classList.add("active");

    // Show tab content
    let tabID = e.target.getAttribute("data-tab");

    document
      .querySelectorAll(".tab-content")
      .forEach(tab => tab.classList.remove("active"));

    document.getElementById(tabID).classList.add("active");
  }
});