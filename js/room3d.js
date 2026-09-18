import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { APP_CONFIG, ROOM_THEMES } from "./config.js";

function mat(color){ return new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.03}); }
function mesh(geo,color){ const m=new THREE.Mesh(geo,mat(color)); m.castShadow=true; m.receiveShadow=true; return m; }

export class Room3D {
  constructor(canvas,{onSelect,onTransform,onCameraChange,onInteract}={}){
    this.canvas=canvas; this.onSelect=onSelect; this.onTransform=onTransform; this.onInteract=onInteract;
    this.scene=new THREE.Scene(); this.scene.background=new THREE.Color(0xeef1f5);
    this.camera=new THREE.PerspectiveCamera(35,1,.1,100);
    this.camera.position.set(8,7.2,9); this.camera.lookAt(0,0,0);
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true,alpha:false});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,2)); this.renderer.shadowMap.enabled=true;
    this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.controls=new OrbitControls(this.camera,this.canvas);
    this.controls.target.set(0,1,0); this.controls.enableDamping=true; this.controls.enablePan=false;
    this.controls.minDistance=8; this.controls.maxDistance=20; this.controls.maxPolarAngle=Math.PI/2.12; this.controls.minPolarAngle=.55;
    this.controls.addEventListener("change",()=>onCameraChange?.());

    this.clock=new THREE.Clock(); this.raycaster=new THREE.Raycaster(); this.pointer=new THREE.Vector2();
    this.objects=new Map(); this.selected=null; this.dragging=false; this.dragOffset=new THREE.Vector3();
    this.dragPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
    this.dragMode="floor";

    this.root=new THREE.Group(); this.scene.add(this.root);
    this.objectRoot=new THREE.Group(); this.root.add(this.objectRoot);
    this.selectionRing=mesh(new THREE.RingGeometry(.55,.63,48),0x6d5fe8); this.selectionRing.rotation.x=-Math.PI/2;
    this.selectionRing.position.y=.02; this.selectionRing.visible=false; this.scene.add(this.selectionRing);

    this.buildRoom(); this.bind(); this.resize();
    new ResizeObserver(()=>this.resize()).observe(this.canvas.parentElement);
    this.animate();
  }

  buildRoom(){
    const amb=new THREE.HemisphereLight(0xffffff,0xbfc6d3,2.1); this.scene.add(amb);
    const sun=new THREE.DirectionalLight(0xffffff,3.4); sun.position.set(5,9,7); sun.castShadow=true;
    sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.left=-8; sun.shadow.camera.right=8; sun.shadow.camera.top=8; sun.shadow.camera.bottom=-8; this.scene.add(sun);
    this.floor=mesh(new THREE.BoxGeometry(10,.18,10),ROOM_THEMES.mint.floor); this.floor.position.y=-.1; this.root.add(this.floor);
    this.leftWall=mesh(new THREE.BoxGeometry(.16,5,10),ROOM_THEMES.mint.left); this.leftWall.position.set(-5,2.5,0); this.root.add(this.leftWall);
    this.backWall=mesh(new THREE.BoxGeometry(10,5,.16),ROOM_THEMES.mint.right); this.backWall.position.set(0,2.5,-5); this.root.add(this.backWall);
    const rug=mesh(new THREE.CylinderGeometry(2.2,2.2,.05,48),0xffffff); rug.position.set(.6,.02,.7); rug.material.transparent=true; rug.material.opacity=.55; this.root.add(rug);
  }

  setTheme(name){
    const t=ROOM_THEMES[name]||ROOM_THEMES.mint;
    this.floor.material.color.setHex(t.floor); this.leftWall.material.color.setHex(t.left); this.backWall.material.color.setHex(t.right);
  }

  createVisual(asset){
    const g=new THREE.Group(); const c=asset.color || 0xaaaaaa;
    if(asset.kind==="person"){
      const body=mesh(new THREE.CapsuleGeometry(.35,.8,6,12),c); body.position.y=.75;
      const head=mesh(new THREE.SphereGeometry(.34,20,16),0xf1c7a5); head.position.y=1.58;
      const hair=mesh(new THREE.SphereGeometry(.35,20,12),0x44362e); hair.scale.y=.55; hair.position.y=1.76;
      g.add(body,head,hair);
    } else if(asset.kind==="desk"){
      const top=mesh(new THREE.BoxGeometry(1.8,.18,1),c); top.position.y=1;
      g.add(top); for(const [x,z] of [[-.72,-.35],[.72,-.35],[-.72,.35],[.72,.35]]){const leg=mesh(new THREE.BoxGeometry(.14,1,.14),0x7c5437); leg.position.set(x,.5,z); g.add(leg)}
    } else if(asset.kind==="chair"){
      const seat=mesh(new THREE.BoxGeometry(.9,.16,.9),c); seat.position.y=.65; const back=mesh(new THREE.BoxGeometry(.9,.9,.14),c); back.position.set(0,1.08,.38); g.add(seat,back);
      for(const [x,z] of [[-.34,-.3],[.34,-.3],[-.34,.3],[.34,.3]]){const leg=mesh(new THREE.BoxGeometry(.1,.62,.1),0x6d4e39); leg.position.set(x,.31,z); g.add(leg)}
    } else if(asset.kind==="sofa"){
      const seat=mesh(new THREE.BoxGeometry(2.2,.5,1),c); seat.position.y=.45; const back=mesh(new THREE.BoxGeometry(2.2,1,.35),c); back.position.set(0,1.05,.35);
      const a1=mesh(new THREE.BoxGeometry(.3,.8,1),c), a2=a1.clone(); a1.position.set(-1.08,.6,0); a2.position.set(1.08,.6,0); g.add(seat,back,a1,a2);
    } else if(asset.kind==="bookshelf"){
      const frame=mesh(new THREE.BoxGeometry(1.5,2.2,.45),c); frame.position.y=1.1; g.add(frame);
      for(let i=0;i<3;i++){const shelf=mesh(new THREE.BoxGeometry(1.25,.12,.52),0xede0c8); shelf.position.set(0,.5+i*.65,.02); g.add(shelf)}
    } else if(asset.kind==="building"){
      const base=mesh(new THREE.BoxGeometry(1.6,1.8,1.4),c); base.position.y=.9; const roof=mesh(new THREE.ConeGeometry(1.25,.65,4),0x7d6a64); roof.rotation.y=Math.PI/4; roof.position.y=2.12; g.add(base,roof);
      const door=mesh(new THREE.BoxGeometry(.38,.7,.08),0xffffff); door.position.set(0,.36,.74); g.add(door);
    } else if(asset.kind==="globe"){
      const globe=mesh(new THREE.SphereGeometry(.65,24,20),c); globe.position.y=1.15; globe.name="spinPart";
      const axis=mesh(new THREE.CylinderGeometry(.05,.05,1.7,12),0x6a5d54); axis.position.y=1.1; const base=mesh(new THREE.CylinderGeometry(.55,.7,.18,24),0x8b6a49); base.position.y=.09; g.add(globe,axis,base);
    } else if(asset.kind==="keyword"||asset.kind==="card"||asset.kind==="board"){
      const board=mesh(new THREE.BoxGeometry(asset.kind==="board"?2.2:1.55,asset.kind==="board"?1.5:1.05,.16),c); board.position.y=1; g.add(board);
      const canvas=document.createElement("canvas"); canvas.width=512; canvas.height=256; const ctx=canvas.getContext("2d");
      ctx.fillStyle="#ffffff"; ctx.font="700 56px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(asset.label||asset.name,256,128);
      const tex=new THREE.CanvasTexture(canvas); const label=new THREE.Mesh(new THREE.PlaneGeometry(asset.kind==="board"?1.8:1.3,asset.kind==="board"?.9:.7),new THREE.MeshBasicMaterial({map:tex,transparent:true}));
      label.position.set(0,1,.086); g.add(label);
    } else if(asset.kind==="plant"){
      const pot=mesh(new THREE.CylinderGeometry(.42,.32,.6,18),0xb96f4f); pot.position.y=.3;
      g.add(pot);
      for(let i=0;i<7;i++){
        const leaf=mesh(new THREE.SphereGeometry(.24,14,10),asset.color||0x67a878);
        leaf.scale.set(.65,1.5,.45); const a=i/7*Math.PI*2;
        leaf.position.set(Math.cos(a)*.28,.82+Math.sin(i)*.08,Math.sin(a)*.28); leaf.rotation.z=Math.cos(a)*.6;
        g.add(leaf);
      }
    } else if(asset.kind==="animal"){
      const body=mesh(new THREE.CapsuleGeometry(.28,.7,5,10),c); body.rotation.z=Math.PI/2; body.position.y=.45;
      const head=mesh(new THREE.SphereGeometry(.34,18,14),c); head.position.set(.55,.58,0); const ear1=mesh(new THREE.ConeGeometry(.12,.3,8),c),ear2=ear1.clone(); ear1.position.set(.5,.9,.18); ear2.position.set(.5,.9,-.18); g.add(body,head,ear1,ear2);
    } else if(asset.kind==="car"){
      const body=mesh(new THREE.BoxGeometry(1.6,.5,.85),c); body.position.y=.48; const top=mesh(new THREE.BoxGeometry(.9,.42,.72),0xcde5f4); top.position.set(-.15,.86,0); g.add(body,top);
      for(const [x,z] of [[-.55,-.46],[.55,-.46],[-.55,.46],[.55,.46]]){const w=mesh(new THREE.CylinderGeometry(.18,.18,.12,18),0x333333); w.rotation.x=Math.PI/2; w.position.set(x,.25,z); g.add(w)}
    } else if(asset.kind==="drone"){
      const core=mesh(new THREE.BoxGeometry(.55,.22,.55),c); core.position.y=1.4; g.add(core);
      for(const [x,z] of [[-.55,-.55],[.55,-.55],[-.55,.55],[.55,.55]]){const arm=mesh(new THREE.BoxGeometry(.75,.08,.08),c); arm.position.set(x/2,1.4,z/2); arm.rotation.y=Math.atan2(z,x); const rotor=mesh(new THREE.CylinderGeometry(.34,.34,.04,18),0x3c424a); rotor.position.set(x,1.43,z); rotor.name="spinPart"; g.add(arm,rotor)}
    } else if(asset.kind==="fan"){
      const stand=mesh(new THREE.CylinderGeometry(.06,.09,1.5,12),c); stand.position.y=.75; const base=mesh(new THREE.CylinderGeometry(.55,.7,.12,24),c); base.position.y=.06; const hub=mesh(new THREE.CylinderGeometry(.18,.18,.28,16),0x4d5963); hub.rotation.x=Math.PI/2; hub.position.y=1.52; const blades=new THREE.Group(); blades.name="spinPart"; blades.position.y=1.52;
      for(let i=0;i<4;i++){const b=mesh(new THREE.BoxGeometry(.12,.72,.05),0xb8d6df); b.position.y=.34; b.rotation.z=i*Math.PI/2; blades.add(b)} g.add(stand,base,hub,blades);
    } else {
      const cube=mesh(new THREE.BoxGeometry(1,1,1),c); cube.position.y=.5; g.add(cube);
    }
    g.traverse(o=>{ if(o.isMesh){o.userData.pickable=true;} });
    return g;
  }

  addObject(record,asset){
    const visual=this.createVisual(asset); visual.userData.objectId=record.id; visual.position.set(record.position.x,record.position.y||0,record.position.z);
    visual.rotation.y=record.rotationY||0; visual.scale.setScalar(record.scale||1);
    visual.traverse(o=>{o.userData.objectId=record.id});
    this.objectRoot.add(visual); this.objects.set(record.id,{record,asset,visual,phase:Math.random()*10});
    this.applyPlacement(this.objects.get(record.id));
    return visual;
  }

  removeObject(id){ const item=this.objects.get(id); if(!item)return; this.objectRoot.remove(item.visual); this.dispose(item.visual); this.objects.delete(id); if(this.selected===id)this.select(null); }
  clearObjects(){ [...this.objects.keys()].forEach(id=>this.removeObject(id)); }
  dispose(obj){ obj.traverse(o=>{ if(o.geometry)o.geometry.dispose?.(); if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material]; ms.forEach(m=>{m.map?.dispose?.();m.dispose?.()})} }); }

  select(id){
    this.selected=id; const item=id?this.objects.get(id):null;
    this.selectionRing.visible=!!item && (item.record.placement||"floor")==="floor"; if(item){this.selectionRing.position.x=item.visual.position.x;this.selectionRing.position.z=item.visual.position.z}
    this.onSelect?.(item||null);
  }


  applyPlacement(item){
    const r=item.record, v=item.visual, mode=r.placement||"floor";
    if(mode==="floor"){
      v.rotation.x=0;
      v.position.y=r.position.y||0;
    } else if(mode==="leftWall"){
      v.rotation.y=Math.PI/2;
      v.rotation.x=0;
      v.position.x=-4.88;
      v.position.y=Math.max(.6,r.position.y||2);
      v.position.z=THREE.MathUtils.clamp(r.position.z,-4.3,4.3);
    } else if(mode==="backWall"){
      v.rotation.y=0;
      v.rotation.x=0;
      v.position.z=-4.88;
      v.position.y=Math.max(.6,r.position.y||2);
      v.position.x=THREE.MathUtils.clamp(r.position.x,-4.3,4.3);
    }
  }

  setPlacement(id,mode){
    const item=this.objects.get(id); if(!item)return;
    item.record.placement=mode;
    if(mode==="floor"){item.record.position.y=0;}
    else {item.record.position.y=Math.max(1.3,item.record.position.y||2);}
    this.applyPlacement(item);
    this.select(id);
  }

  setupDragPlane(item){
    const mode=item.record.placement||"floor";
    this.dragMode=mode;
    if(mode==="floor") this.dragPlane.set(new THREE.Vector3(0,1,0),0);
    else if(mode==="leftWall") this.dragPlane.set(new THREE.Vector3(1,0,0),4.88);
    else this.dragPlane.set(new THREE.Vector3(0,0,1),4.88);
  }

  bind(){
    this.canvas.addEventListener("pointerdown",e=>this.pointerDown(e));
    this.canvas.addEventListener("pointermove",e=>this.pointerMove(e));
    window.addEventListener("pointerup",e=>this.pointerUp(e));
    this.canvas.addEventListener("dblclick",()=>{ if(this.selected) this.onInteract?.(this.objects.get(this.selected)); });
  }
  setPointer(e){ const r=this.canvas.getBoundingClientRect(); this.pointer.x=((e.clientX-r.left)/r.width)*2-1; this.pointer.y=-((e.clientY-r.top)/r.height)*2+1; this.raycaster.setFromCamera(this.pointer,this.camera); }
  pointerDown(e){
    this.setPointer(e);
    const hits=this.raycaster.intersectObjects([...this.objects.values()].map(x=>x.visual),true);
    if(hits.length){
      const id=hits[0].object.userData.objectId; this.select(id); this.dragging=true; this.controls.enabled=false; this.canvas.setPointerCapture?.(e.pointerId);
      const item=this.objects.get(id); this.setupDragPlane(item);
      const p=new THREE.Vector3(); if(this.raycaster.ray.intersectPlane(this.dragPlane,p)){const v=item.visual;this.dragOffset.copy(v.position).sub(p)}
    } else { this.select(null); }
  }
  pointerMove(e){
    if(!this.dragging||!this.selected)return; this.setPointer(e); const p=new THREE.Vector3();
    if(this.raycaster.ray.intersectPlane(this.dragPlane,p)){ const item=this.objects.get(this.selected); p.add(this.dragOffset);
      const mode=item.record.placement||"floor";
      if(mode==="floor"){
        p.x=THREE.MathUtils.clamp(p.x,APP_CONFIG.roomBounds.minX,APP_CONFIG.roomBounds.maxX); p.z=THREE.MathUtils.clamp(p.z,APP_CONFIG.roomBounds.minZ,APP_CONFIG.roomBounds.maxZ);
        item.visual.position.x=p.x; item.visual.position.z=p.z; item.visual.position.y=item.record.position.y||0;
        item.record.position.x=p.x; item.record.position.z=p.z;
        if(item.record.animation?.anchor){item.record.animation.anchor.x=p.x;item.record.animation.anchor.z=p.z}
      } else if(mode==="leftWall"){
        item.visual.position.z=THREE.MathUtils.clamp(p.z,-4.3,4.3); item.visual.position.y=THREE.MathUtils.clamp(p.y,.6,4.4); item.visual.position.x=-4.88;
        item.record.position.z=item.visual.position.z; item.record.position.y=item.visual.position.y; item.record.position.x=-4.88;
      } else {
        item.visual.position.x=THREE.MathUtils.clamp(p.x,-4.3,4.3); item.visual.position.y=THREE.MathUtils.clamp(p.y,.6,4.4); item.visual.position.z=-4.88;
        item.record.position.x=item.visual.position.x; item.record.position.y=item.visual.position.y; item.record.position.z=-4.88;
      }
      this.selectionRing.visible=mode==="floor"; this.selectionRing.position.x=item.visual.position.x; this.selectionRing.position.z=item.visual.position.z;
    }
  }
  pointerUp(){ if(this.dragging){this.dragging=false;this.controls.enabled=true;this.onTransform?.(this.objects.get(this.selected));} }

  updateRecord(record){
    const item=this.objects.get(record.id); if(!item)return;
    item.record=record; item.visual.position.set(record.position.x,record.position.y||0,record.position.z); item.visual.rotation.y=record.rotationY||0; item.visual.scale.setScalar(record.scale||1); this.applyPlacement(item);
  }
  resetCamera(){this.camera.position.set(8,7.2,9);this.controls.target.set(0,1,0);this.controls.update()}
  resize(){const p=this.canvas.parentElement;if(!p)return;const w=p.clientWidth,h=p.clientHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix()}
  screenPosition(id){const item=this.objects.get(id);if(!item)return null;const v=new THREE.Vector3(); item.visual.getWorldPosition(v);v.y+=item.record.placement==="floor"?2:.55;v.project(this.camera);const r=this.canvas.getBoundingClientRect();return{x:(v.x*.5+.5)*r.width,y:(-v.y*.5+.5)*r.height}}
  animate(){
    requestAnimationFrame(()=>this.animate()); const dt=Math.min(this.clock.getDelta(),.05); const t=performance.now()/1000;
    this.controls.update();
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
    for(const item of this.objects.values()){
      const a=item.record.animation;if(!a||a.paused||reduced)continue;const speed=a.speed||1;const v=item.visual;
      if(item.asset.animType==="spin"){const part=v.getObjectByName("spinPart");if(part)part.rotation.y+=dt*speed*.8}
      if(item.asset.animType==="spinPart"){v.traverse(o=>{if(o.name==="spinPart")o.rotation.z-=dt*speed*4})}
      if(item.asset.animType==="bob"){v.position.y=(item.record.position.y||0)+Math.sin(t*2*speed+item.phase)*.035}
      if(item.asset.animType==="float"){v.position.y=(item.record.position.y||0)+.12+Math.sin(t*1.7*speed+item.phase)*.12}
      if(item.asset.animType==="hover"){v.position.y=(item.record.position.y||0)+.8+Math.sin(t*2.2*speed+item.phase)*.18;v.rotation.y+=(dt*.25*speed)}
      if(item.asset.animType==="patrol"){const anchor=a.anchor||item.record.position;const range=a.range||.8;v.position.x=THREE.MathUtils.clamp(anchor.x+Math.sin(t*speed+item.phase)*range,APP_CONFIG.roomBounds.minX,APP_CONFIG.roomBounds.maxX);v.rotation.y=Math.cos(t*speed+item.phase)>=0?0:Math.PI}
    }
    this.renderer.render(this.scene,this.camera);
  }
}
