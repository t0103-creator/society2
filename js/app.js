import { APP_CONFIG } from "./config.js";
import { ASSETS, CATEGORIES } from "./assets.js";
import { loadProjects, upsertProject, deleteProject } from "./storage.js";
import { HistoryManager } from "./history.js";
import { Room3D } from "./room3d.js";
import { BubbleManager } from "./bubbles.js";

const $=s=>document.querySelector(s);
const screens={start:$("#startScreen"),editor:$("#editorScreen"),result:$("#resultScreen")};
const state={project:null,selectedId:null,category:"all",saveTimer:null};
const history=new HistoryManager(APP_CONFIG.historyLimit);
let room,bubbles;

function uid(prefix="id"){return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`}
function show(name){Object.entries(screens).forEach(([k,v])=>v.classList.toggle("hidden",k!==name))}
function clone(v){return JSON.parse(JSON.stringify(v))}
function roomState(){return clone(state.project.roomData)}
function markChanged(push=true){
  state.project.updatedAt=new Date().toISOString();$("#saveState").textContent="저장 중…";
  clearTimeout(state.saveTimer);state.saveTimer=setTimeout(()=>{upsertProject(state.project);$("#saveState").textContent="저장됨"},180);
  if(push) history.push(roomState());updateMission();
}
function createProject(){
  const number=$("#studentNumber").value.trim(),name=$("#studentName").value.trim(),title=$("#projectTitle").value.trim()||APP_CONFIG.mission.title;
  if(!number||!name){alert("학번과 이름을 입력하세요.");return}
  const now=new Date().toISOString();
  state.project={id:uid("project"),title,student:{number,name},createdAt:now,updatedAt:now,roomData:{version:"1.0",theme:"mint",objects:[],speechBubbles:[]}};
  upsertProject(state.project);enterEditor();
}
function renderProjectList(){
  const list=$("#projectList");const ps=loadProjects();list.classList.remove("hidden");
  list.innerHTML=ps.length?"":"<p>저장된 작품이 없습니다.</p>";
  ps.forEach(p=>{const el=document.createElement("div");el.className="project-item";el.innerHTML=`<div><strong>${escapeHtml(p.title)}</strong><small>${escapeHtml(p.student?.number||"")} ${escapeHtml(p.student?.name||"")} · ${new Date(p.updatedAt).toLocaleString("ko-KR")}</small></div><div><button data-open>열기</button><button data-del>삭제</button></div>`;
    el.querySelector("[data-open]").onclick=()=>{state.project=p;enterEditor()};el.querySelector("[data-del]").onclick=()=>{if(confirm("이 작품을 삭제할까요?")){deleteProject(p.id);renderProjectList()}};list.appendChild(el)})
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function initEditorOnce(){
  if(room)return;
  room=new Room3D($("#roomCanvas"),{onSelect:item=>setSelection(item),onTransform:()=>markChanged(),onInteract:item=>interact(item)});
  bubbles=new BubbleManager($("#bubbleLayer"),$("#bubbleTemplate"),{
    onChange:(type,rec)=>{if(type==="delete"){state.project.roomData.speechBubbles=state.project.roomData.speechBubbles.filter(x=>x.id!==rec.id)}markChanged()},
    getCharacters:()=>state.project?.roomData.objects.filter(o=>o.category==="character").map(o=>({id:o.id,name:o.name}))||[],
    getScreenPosition:id=>room.screenPosition(id)
  });
  renderCategories();bindControls();
}
function enterEditor(){
  initEditorOnce();show("editor");$("#topProjectTitle").textContent=state.project.title;$("#missionTitle").textContent=APP_CONFIG.mission.title;$("#missionDesc").textContent=APP_CONFIG.mission.description;
  loadRoom(state.project.roomData);history.reset(roomState());requestAnimationFrame(()=>room.resize())
}
function loadRoom(data){
  room.clearObjects();bubbles.clear();room.setTheme(data.theme||"mint");
  for(const rec of data.objects||[]){const a=ASSETS.find(x=>x.id===rec.assetId);if(a)room.addObject(rec,a)}
  for(const rec of data.speechBubbles||[])bubbles.add(rec);
  bubbles.refreshAll();setSelection(null);updateMission()
}
function renderCategories(){
  const wrap=$("#categoryTabs");wrap.innerHTML="";CATEGORIES.forEach(([id,label])=>{const b=document.createElement("button");b.textContent=label;b.classList.toggle("active",id===state.category);b.onclick=()=>{state.category=id;renderCategories();renderAssets()};wrap.appendChild(b)});renderAssets()
}
function renderAssets(){
  const g=$("#assetGrid");g.innerHTML="";ASSETS.filter(a=>state.category==="all"||a.category===state.category).forEach(a=>{const b=document.createElement("button");b.className="asset-card";b.innerHTML=`<span class="icon">${a.icon}</span><strong>${a.name}</strong>`;b.onclick=()=>addAsset(a);g.appendChild(b)})
}
function addAsset(a){
  const i=state.project.roomData.objects.length;const x=((i%5)-2)*.65,z=(Math.floor(i/5)%4-1)*.7;
  const placement=a.placement||"floor";
  const rec={id:uid("obj"),assetId:a.id,name:a.name,category:a.category,kind:a.kind,placement,position:{x,y:placement==="floor"?0:2,z},rotationY:0,scale:1};
  if(placement==="leftWall"){rec.position.x=-4.88;}
  if(placement==="backWall"){rec.position.z=-4.88;}
  if(a.animated)rec.animation={paused:false,loop:true,speed:1,anchor:{x,y:0,z},range:.8};
  state.project.roomData.objects.push(rec);room.addObject(rec,a);room.select(rec.id);bubbles.refreshAll();markChanged()
}
function setSelection(item){
  state.selectedId=item?.record.id||null;$("#emptySelection").classList.toggle("hidden",!!item);$("#objectControls").classList.toggle("hidden",!item);
  if(item){
    $("#selectedName").textContent=item.record.name;
    $("#animationControls").classList.toggle("hidden",!item.record.animation);
    $("#placementSelect").value=item.record.placement||"floor";
  }
}
function selected(){return state.project?.roomData.objects.find(o=>o.id===state.selectedId)}
function transform(fn){
  const r=selected();if(!r)return;fn(r);room.updateRecord(r);markChanged()
}
function deleteSelected(){
  const r=selected();if(!r)return;state.project.roomData.objects=state.project.roomData.objects.filter(o=>o.id!==r.id);room.removeObject(r.id);
  state.project.roomData.speechBubbles.forEach(b=>{if(b.targetId===r.id)b.targetId=null});bubbles.refreshAll();markChanged()
}
function duplicateSelected(){
  const r=selected();if(!r)return;const n=clone(r);n.id=uid("obj");n.position.x=Math.min(APP_CONFIG.roomBounds.maxX,n.position.x+.5);n.position.z=Math.min(APP_CONFIG.roomBounds.maxZ,n.position.z+.5);if(n.animation?.anchor)n.animation.anchor={...n.position};
  state.project.roomData.objects.push(n);room.addObject(n,ASSETS.find(a=>a.id===n.assetId));room.select(n.id);bubbles.refreshAll();markChanged()
}
function interact(item){
  const r=item.record;if(!r.animation)return;if(item.asset.kind==="globe"){r.animation.speed=2.5;setTimeout(()=>{r.animation.speed=1;markChanged(false)},1200)}
  else if(item.asset.kind==="person"){item.visual.position.y+=.35;setTimeout(()=>item.visual.position.y=r.position.y||0,220)}
  else {r.animation.paused=!r.animation.paused}markChanged()
}
function addBubble(type="normal"){
  const messages={
    normal:"이곳에 생각을 적어 보세요.",
    thought:"이 장면에서 무엇을 생각할 수 있을까요?",
    question:"왜 이런 현상이 나타났을까요?",
    emphasis:"핵심 내용을 강조해 보세요!"
  };
  const rec={id:uid("bubble"),type,text:messages[type]||messages.normal,x:40,y:22,targetId:null};
  state.project.roomData.speechBubbles.push(rec);bubbles.add(rec);markChanged()
}
function updateMission(){
  if(!state.project)return;const os=state.project.roomData.objects,bs=state.project.roomData.speechBubbles;
  const c={character:os.filter(o=>o.category==="character").length,facility:os.filter(o=>o.category==="facility").length,education:os.filter(o=>o.category==="education").length,bubble:bs.length,keyword:os.filter(o=>o.category==="keyword").length};
  const req=APP_CONFIG.mission.requirements;$("#missionProgress").innerHTML=`미니미 ${c.character}/${req.character} · 시설 ${c.facility}/${req.facility}<br>학습 ${c.education}/${req.education} · 말풍선 ${c.bubble}/${req.bubble} · 키워드 ${c.keyword}/${req.keyword}`
}
function applyHistory(data){state.project.roomData=clone(data);loadRoom(state.project.roomData);upsertProject(state.project)}
function bindControls(){
  $("#rotateLeftBtn").onclick=()=>transform(r=>r.rotationY-=Math.PI/12);$("#rotateRightBtn").onclick=()=>transform(r=>r.rotationY+=Math.PI/12);
  $("#scaleDownBtn").onclick=()=>transform(r=>r.scale=Math.max(APP_CONFIG.scale.min,(r.scale||1)-.1));$("#scaleUpBtn").onclick=()=>transform(r=>r.scale=Math.min(APP_CONFIG.scale.max,(r.scale||1)+.1));
  $("#deleteBtn").onclick=deleteSelected;$("#duplicateBtn").onclick=duplicateSelected;$("#resetCameraBtn").onclick=()=>room.resetCamera();
  $("#placementSelect").onchange=()=>{const r=selected();if(!r)return;r.placement=$("#placementSelect").value;room.setPlacement(r.id,r.placement);markChanged()};
  document.querySelectorAll("[data-bubble-type]").forEach(b=>b.onclick=()=>addBubble(b.dataset.bubbleType));
  $("#playBtn").onclick=()=>transform(r=>{if(r.animation)r.animation.paused=false});$("#pauseBtn").onclick=()=>transform(r=>{if(r.animation)r.animation.paused=true});
  document.querySelectorAll("[data-speed]").forEach(b=>b.onclick=()=>transform(r=>{if(r.animation)r.animation.speed=Number(b.dataset.speed)}));
  $("#toggleLoopBtn").onclick=()=>transform(r=>{if(r.animation)r.animation.loop=!r.animation.loop});
  document.querySelectorAll("[data-room]").forEach(b=>b.onclick=()=>{state.project.roomData.theme=b.dataset.room;room.setTheme(b.dataset.room);markChanged()});
  $("#undoBtn").onclick=()=>{const d=history.undo(roomState());if(d)applyHistory(d)};$("#redoBtn").onclick=()=>{const d=history.redo(roomState());if(d)applyHistory(d)};
  window.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();const d=e.shiftKey?history.redo(roomState()):history.undo(roomState());if(d)applyHistory(d)}});
  $("#finishBtn").onclick=showResult;$("#backEditBtn").onclick=()=>{show("editor");requestAnimationFrame(()=>room.resize())};$("#newProjectBtn").onclick=()=>{show("start");renderProjectList()};
  $("#saveImageBtn").onclick=savePng
}
function showResult(){
  markChanged(false);$("#resultNumber").textContent=state.project.student.number;$("#resultName").textContent=state.project.student.name;$("#resultTopic").textContent=state.project.title;$("#resultDate").textContent=new Date().toLocaleDateString("ko-KR");
  const os=state.project.roomData.objects, bs=state.project.roomData.speechBubbles;
  $("#summaryCharacters").textContent=os.filter(o=>o.category==="character").length;
  $("#summaryFacilities").textContent=os.filter(o=>o.category==="facility").length;
  $("#summaryEducation").textContent=os.filter(o=>o.category==="education"||o.category==="keyword").length;
  $("#summaryBubbles").textContent=bs.length;
  show("result");const host=$("#resultPreview");host.innerHTML="";const img=document.createElement("img");img.src=room.renderer.domElement.toDataURL("image/png");img.style.width="100%";img.style.height="100%";img.style.objectFit="contain";host.appendChild(img)
}
function savePng(){
  const source=room.renderer.domElement,w=source.width,h=source.height;const c=document.createElement("canvas");c.width=w;c.height=h+130;const x=c.getContext("2d");x.fillStyle="#ffffff";x.fillRect(0,0,c.width,c.height);x.drawImage(source,0,0,w,h);
  x.fillStyle="#2f2d3a";x.font=`700 ${Math.max(22,Math.floor(w/42))}px sans-serif`;x.fillText(state.project.title,30,h+44);x.font=`500 ${Math.max(17,Math.floor(w/55))}px sans-serif`;x.fillText(`${state.project.student.number}  ${state.project.student.name} · ${new Date().toLocaleDateString("ko-KR")}`,30,h+85);
  const a=document.createElement("a");a.download=`MY_LEARNING_ROOM_${state.project.student.number}_${state.project.student.name}.png`;a.href=c.toDataURL("image/png");a.click()
}

$("#createProjectBtn").onclick=createProject;$("#showProjectsBtn").onclick=renderProjectList;
renderProjectList();
