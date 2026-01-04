import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* 🔴 FIREBASE CONFIG — নিজেরটা বসা */
const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_AUTH_DOMAIN",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_STORAGE_BUCKET",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* DOM */
const search = document.getElementById("search");
const results = document.getElementById("results");
const subjectsBox = document.getElementById("subjects");

/* STATE */
let NOTES = [];
let SUBJECTS = new Set();
let ACTIVE_SUBJECT = null;

/* LOAD ALL NOTES */
async function loadNotes(){
  NOTES = [];
  SUBJECTS.clear();

  const snap = await getDocs(collection(db,"notes"));
  snap.forEach(d=>{
    const n = d.data();
    NOTES.push({ id:d.id, ...n });
    if(n.subject) SUBJECTS.add(n.subject);
  });

  renderSubjects();
  results.innerHTML = "<div class='empty'>Select a subject or search</div>";
}

/* RENDER SUBJECTS */
function renderSubjects(){
  subjectsBox.innerHTML="";

  if(SUBJECTS.size === 0){
    subjectsBox.innerHTML = "<div class='empty'>No subjects</div>";
    return;
  }

  SUBJECTS.forEach(s=>{
    const div = document.createElement("div");
    div.className = "subject";
    div.textContent = s;

    if(ACTIVE_SUBJECT === s){
      div.style.outline = "2px solid rgba(120,170,255,.6)";
    }

    div.onclick = () => {
      ACTIVE_SUBJECT = s;
      search.value = "";
      showNotesBySubject(s);
      renderSubjects();
    };

    subjectsBox.appendChild(div);
  });
}

/* SHOW NOTES BY SUBJECT */
function showNotesBySubject(subject){
  results.innerHTML="";

  const list = NOTES.filter(n => n.subject === subject);

  if(list.length === 0){
    results.innerHTML = "<div class='result'>No notes in this subject</div>";
    return;
  }

  list.forEach(n=>{
    const div = document.createElement("div");
    div.className = "result";
    div.innerHTML = `
      <b>${n.title || "Untitled"}</b><br>
      <small>${n.subject || ""}${n.folder ? " → "+n.folder : ""}</small>
    `;
    results.appendChild(div);
  });
}

/* SEARCH (SUBJECT-AWARE) */
search.addEventListener("input",()=>{
  const q = search.value.trim().toLowerCase();
  results.innerHTML="";
  if(!q) return;

  const base = ACTIVE_SUBJECT
    ? NOTES.filter(n => n.subject === ACTIVE_SUBJECT)
    : NOTES;

  const found = base.filter(n =>
    (n.title || "").toLowerCase().includes(q) ||
    (n.content || "").toLowerCase().includes(q) ||
    (n.folder || "").toLowerCase().includes(q)
  );

  if(found.length === 0){
    results.innerHTML = "<div class='result'>No notes found</div>";
    return;
  }

  found.forEach(n=>{
    const div = document.createElement("div");
    div.className = "result";
    div.innerHTML = `
      <b>${n.title || "Untitled"}</b><br>
      <small>${n.subject || ""}${n.folder ? " → "+n.folder : ""}</small>
    `;
    results.appendChild(div);
  });
});

/* CREATE FUNCTIONS (POPUP) */
window.createSubject = async () => {
  const subject = document.getElementById("inputSubject").value.trim();
  if(!subject) return alert("Enter subject name");

  await addDoc(collection(db,"notes"), { subject });
  clearInputs(); closePopup(); loadNotes();
};

window.createFolder = async () => {
  const subject = document.getElementById("inputSubject").value.trim();
  const folder = document.getElementById("inputFolder").value.trim();
  if(!subject || !folder) return alert("Enter subject & folder");

  await addDoc(collection(db,"notes"), { subject, folder });
  clearInputs(); closePopup(); loadNotes();
};

window.createNote = async () => {
  const title = document.getElementById("inputTitle").value.trim();
  if(!title) return alert("Enter note title");

  await addDoc(collection(db,"notes"), { title });
  clearInputs(); closePopup(); loadNotes();
};

/* HELPERS */
function clearInputs(){
  document.getElementById("inputSubject").value="";
  document.getElementById("inputFolder").value="";
  document.getElementById("inputTitle").value="";
}

/* INIT */
loadNotes();
