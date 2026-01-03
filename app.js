import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* 🔴 PASTE YOUR FIREBASE CONFIG */
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

const search=document.getElementById("search");
const results=document.getElementById("results");
const subjectsBox=document.getElementById("subjects");

let NOTES=[];
let SUBJECTS=new Set();

/* LOAD NOTES */
async function loadNotes(){
  NOTES=[];
  SUBJECTS.clear();
  const snap=await getDocs(collection(db,"notes"));
  snap.forEach(d=>{
    const n=d.data();
    NOTES.push({id:d.id,...n});
    if(n.subject) SUBJECTS.add(n.subject);
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

/* SEARCH */
search.addEventListener("input",()=>{
  const q=search.value.trim().toLowerCase();
  results.innerHTML="";
  if(!q) return;

  const found=NOTES.filter(n=>
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
    div.innerHTML=`<b>${n.title||"Untitled"}</b><br>
    <small>${n.subject||""}${n.folder?" → "+n.folder:""}</small>`;
    results.appendChild(div);
  });
});

/* CREATE FUNCTIONS */
window.createSubject=async()=>{
  const name=prompt("Subject name?");
  if(!name) return;
  await addDoc(collection(db,"notes"),{subject:name});
  closePopup(); loadNotes();
};

window.createFolder=async()=>{
  const subject=prompt("Subject?");
  const folder=prompt("Folder name?");
  if(!subject||!folder) return;
  await addDoc(collection(db,"notes"),{subject,folder});
  closePopup(); loadNotes();
};

window.createNote=async()=>{
  const title=prompt("Note title?");
  if(!title) return;
  await addDoc(collection(db,"notes"),{title});
  closePopup(); loadNotes();
};

loadNotes();
