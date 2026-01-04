import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDV0x3hXbyTLXwFytOuPgK7lNMnv_PonfA",
  authDomain: "ep13-85d3a.firebaseapp.com",
  projectId: "ep13-85d3a",
  storageBucket: "ep13-85d3a.appspot.com",
  appId: "1:92916303653:web:5f06a01139ea688de9fccc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const sidebar=document.getElementById("sidebar");
const results=document.getElementById("results");
const popup=document.getElementById("popup");

let NOTES=[];
let ACTIVE_SUBJECT=null;
let ACTIVE_NOTE=null;

loadNotes();

async function loadNotes(){
  const snap=await getDocs(collection(db,"notes"));
  NOTES=snap.docs.map(d=>({id:d.id,...d.data()}));
  renderSubjects();
}

function renderSubjects(){
  sidebar.innerHTML="";
  [...new Set(NOTES.map(n=>n.subject))].forEach(s=>{
    const div=document.createElement("div");
    div.className="subject";
    div.textContent=s;
    div.onclick=()=>{ACTIVE_SUBJECT=s;showNotes()};
    div.oncontextmenu=e=>{
      e.preventDefault();
      if(confirm("Delete subject?")){
        NOTES.filter(n=>n.subject===s)
          .forEach(n=>deleteDoc(doc(db,"notes",n.id)));
        loadNotes();
      }
    };
    sidebar.appendChild(div);
  });
}

function showNotes(){
  results.innerHTML="";
  NOTES.filter(n=>n.subject===ACTIVE_SUBJECT)
    .forEach(n=>{
      const d=document.createElement("div");
      d.className="result";
      d.textContent=n.title||"Untitled";
      d.onclick=()=>openNote(n);
      results.appendChild(d);
    });
}

function openNote(n){
  ACTIVE_NOTE=n;
  editor.style.display="block";
  noteTitle.value=n.title||"";
  noteContent.value=n.content||"";
  imagePreview.innerHTML=n.image?`<img src="${n.image}">`:"";
}

search.oninput=()=>{
  const q=search.value.toLowerCase();
  results.innerHTML="";
  NOTES.filter(n=>n.title?.toLowerCase().includes(q))
    .forEach(n=>{
      const d=document.createElement("div");
      d.className="result";
      d.textContent=n.title;
      results.appendChild(d);
    });
};

createBtn.onclick=()=>popup.style.display="flex";
window.closePopup=()=>popup.style.display="none";

btnSubject.onclick=async()=>{
  const s=inputSubject.value.trim();
  if(!s)return;
  await addDoc(collection(db,"notes"),{subject:s});
  closePopup();loadNotes();
};

btnFolder.onclick=async()=>{
  if(!ACTIVE_SUBJECT)return alert("Select subject");
  await addDoc(collection(db,"notes"),{
    subject:ACTIVE_SUBJECT,
    folder:inputFolder.value||"General"
  });
  closePopup();loadNotes();
};

btnNote.onclick=async()=>{
  if(!ACTIVE_SUBJECT)return;
  await addDoc(collection(db,"notes"),{
    subject:ACTIVE_SUBJECT,
    folder:inputFolder.value||"",
    title:inputTitle.value||"New Note",
    content:""
  });
  closePopup();loadNotes();
};

imageInput.onchange=async()=>{
  const file=imageInput.files[0];
  if(!file||!ACTIVE_NOTE)return;
  const r=ref(storage,"images/"+Date.now());
  await uploadBytes(r,file);
  const url=await getDownloadURL(r);
  imagePreview.innerHTML=`<img src="${url}">`;
};
