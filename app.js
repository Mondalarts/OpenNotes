import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// 🔴 PASTE YOUR FIREBASE CONFIG HERE
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

const search = document.getElementById("search");
const results = document.getElementById("results");
const subjectsBox = document.getElementById("subjects");

let NOTES = [];
let SUBJECTS = new Set();

// LOAD ALL NOTES
async function loadNotes(){
  NOTES = [];
  SUBJECTS.clear();
  const snap = await getDocs(collection(db,"notes"));
  snap.forEach(d=>{
    const data = d.data();
    NOTES.push({id:d.id,...data});
    if(data.subject) SUBJECTS.add(data.subject);
  });
  renderSubjects();
}

function renderSubjects(){
  subjectsBox.innerHTML="";
  if(SUBJECTS.size===0){
    subjectsBox.innerHTML="<div class='empty'>No subjects</div>";
    return;
  }
  SUBJECTS.forEach(s=>{
    const div=document.createElement("div");
    div.className="subject";
    div.textContent=s;
    subjectsBox.appendChild(div);
  });
}

// SEARCH (ONLY WHAT EXISTS)
search.addEventListener("input",()=>{
  const q = search.value.trim().toLowerCase();
  results.innerHTML="";
  if(!q) return;

  const found = NOTES.filter(n =>
    (n.title||"").toLowerCase().includes(q) ||
    (n.content||"").toLowerCase().includes(q) ||
    (n.subject||"").toLowerCase().includes(q) ||
    (n.folder||"").toLowerCase().includes(q)
  );

  if(found.length===0){
    results.innerHTML="<div class='result'>No notes found</div>";
    return;
  }

  found.forEach(n=>{
    const div=document.createElement("div");
    div.className="result";
    div.innerHTML = `
      <b>${n.title || "Untitled"}</b><br>
      <small>${n.subject || ""}${n.folder ? " → "+n.folder : ""}</small>
    `;
    div.onclick=()=>location.href=`notes.html?id=${n.id}`;
    results.appendChild(div);
  });
});

loadNotes();
