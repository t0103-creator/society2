export class BubbleManager {
  constructor(layer,template,{onChange,getCharacters,getScreenPosition}){
    this.layer=layer;this.template=template;this.onChange=onChange;this.getCharacters=getCharacters;this.getScreenPosition=getScreenPosition;this.bubbles=new Map();
    this.tick=()=>{this.updateLinked();requestAnimationFrame(this.tick)};this.tick();
  }
  add(record){
    const el=this.template.content.firstElementChild.cloneNode(true);el.dataset.id=record.id;this.layer.appendChild(el);
    const text=el.querySelector(".bubble-text");const select=el.querySelector(".bubble-link");
    el.dataset.type=record.type||"normal";
    text.textContent=record.text||"이곳에 생각을 적어 보세요.";el.style.left=(record.x??40)+"%";el.style.top=(record.y??22)+"%";
    this.refreshOptions(select,record.targetId||"");select.value=record.targetId||"";
    let drag=false,startX=0,startY=0,startLeft=0,startTop=0,moved=false;
    el.addEventListener("pointerdown",e=>{if(e.target.closest("button,select"))return;drag=true;moved=false;startX=e.clientX;startY=e.clientY;startLeft=el.offsetLeft;startTop=el.offsetTop;el.setPointerCapture?.(e.pointerId)});
    el.addEventListener("pointermove",e=>{if(!drag||record.targetId)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dx)+Math.abs(dy)>3)moved=true;const maxX=Math.max(1,this.layer.clientWidth-el.offsetWidth),maxY=Math.max(1,this.layer.clientHeight-el.offsetHeight);const l=Math.max(0,Math.min(maxX,startLeft+dx)),t=Math.max(0,Math.min(maxY,startTop+dy));el.style.left=l+"px";el.style.top=t+"px"});
    el.addEventListener("pointerup",()=>{if(!drag)return;drag=false;if(moved&&!record.targetId){record.x=(el.offsetLeft/this.layer.clientWidth)*100;record.y=(el.offsetTop/this.layer.clientHeight)*100;this.onChange("move",record)}});
    el.addEventListener("dblclick",()=>this.edit(text,record));
    let lastTap=0;el.addEventListener("touchend",()=>{const n=Date.now();if(n-lastTap<350)this.edit(text,record);lastTap=n},{passive:true});
    el.querySelector(".bubble-delete").addEventListener("click",()=>{this.remove(record.id);this.onChange("delete",record)});
    select.addEventListener("change",()=>{record.targetId=select.value||null;this.onChange("link",record)});
    this.bubbles.set(record.id,{record,el,select,text});return el;
  }
  edit(text,record){const v=prompt("말풍선 내용을 입력하세요.",record.text||text.textContent);if(v===null)return;record.text=v.trim()||" ";text.textContent=record.text;this.onChange("text",record)}
  remove(id){this.bubbles.get(id)?.el.remove();this.bubbles.delete(id)}
  clear(){[...this.bubbles.keys()].forEach(id=>this.remove(id))}
  refreshAll(){for(const b of this.bubbles.values())this.refreshOptions(b.select,b.record.targetId||"")}
  refreshOptions(select,current){const items=this.getCharacters();select.innerHTML='<option value="">자유 배치</option>'+items.map(x=>`<option value="${x.id}">${x.name}</option>`).join("");select.value=current||""}
  updateLinked(){for(const b of this.bubbles.values()){if(!b.record.targetId)continue;const p=this.getScreenPosition(b.record.targetId);if(!p)continue;b.el.style.left=(p.x-b.el.offsetWidth*.5)+"px";b.el.style.top=(p.y-b.el.offsetHeight-18)+"px"}}
}
