/* ===============================
   OpenNotes – Firebase (Browser)
   =============================== */

// Firebase CDN imports (browser safe)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } 
  from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ===============================
   Firebase Config (YOUR PROJECT)
   =============================== */

const firebaseConfig = {
  apiKey: "AIzaSyDV0x3hXbyTLXwFytOuPgK7lNMnv_PonfA",
  authDomain: "ep13-85d3a.firebaseapp.com",
  projectId: "ep13-85d3a",
  storageBucket: "ep13-85d3a.appspot.com",
  messagingSenderId: "92916303653",
  appId: "1:92916303653:web:5f06a01139ea688de9fccc"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ===============================
   LOAD NOTES (MAIN PAGE)
   =============================== */

let NOTES = [];

async function loadNotes() {
  NOTES = [];
  const snap = await getDocs(collection(db, "notes"));
  snap.forEach(d => {
    NOTES.push({ id: d.id, ...d.data() });
  });
  renderNotes(NOTES);
}

/* ===============================
   SEARCH
   =============================== */

const searchBox = document.getElementById("searchBox");
const noteList = document.getElementById("noteList");

if (searchBox) {
  searchBox.addEventListener("input", () => {
    const q = searchBox.value.toLowerCase();
    renderNotes(
      NOTES.filter(n =>
        n.id.toLowerCase().includes(q) ||
        n.title.toLowerCase().includes(q) ||
        n.text.toLowerCase().includes(q)
      )
    );
  });
}

/* ===============================
   RENDER NOTES
   =============================== */

function renderNotes(list) {
  if (!noteList) return;
  noteList.innerHTML = "";

  if (list.length === 0) {
    noteList.innerHTML = "<p>No notes found</p>";
    return;
  }

  list.forEach(n => {
    const div = document.createElement("div");
    div.className = "note-item";
    div.innerText = `${n.subject} → ${n.category} → ${n.title}`;
    div.onclick = () => {
      window.location.href = `notes.html?id=${n.id}`;
    };
    noteList.appendChild(div);
  });
}

/* ===============================
   AUTO LOAD (main.html only)
   =============================== */

if (noteList) {
  loadNotes();
}
