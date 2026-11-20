'use strict';
const T=THREE, canvas=document.querySelector('#view'), scene=new T.Scene(), camera=new T.PerspectiveCamera(55,1,.12,650);
let renderer;
try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}
catch(e){document.querySelector('#desc').textContent='This crossing needs WebGL. Enable hardware acceleration and reload.';throw e;}
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;
scene.fog=new T.FogExp2(0x897b8c,.008);
const V=(x,y,z)=>new T.Vector3(x,y,z);
let seed=74133;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
const pick=a=>a[Math.floor(rand()*a.length)],r=(a,b)=>a+rand()*(b-a);
const sky=new T.Mesh(new T.SphereGeometry(510,40,24),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{time:{value:0}},vertexShader:'varying vec3 dir;void main(){dir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
varying vec3 dir;uniform float time;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float fb(vec2 p){return .54*n(p)+.27*n(2.03*p)+.13*n(4.12*p)+.06*n(8.34*p);}
void main(){vec3 d=normalize(dir);float h=max(.008,d.y);float sun=dot(d,normalize(vec3(-.45,.13,-1.)));vec3 c=mix(vec3(.86,.57,.47),vec3(.095,.17,.28),smoothstep(.0,.57,h));c+=vec3(.9,.37,.08)*pow(max(sun,0.),18.);
vec2 uv=d.xz/(h+.09)*1.45+vec2(time*.008,0.);float f=fb(uv+fb(uv*1.6));float clouds=smoothstep(.31,.68,f)*smoothstep(.006,.12,h);c=mix(c,mix(vec3(.47,.35,.39),vec3(.085,.13,.22),smoothstep(.37,.72,f)),clouds*.92);
c+=vec3(1.,.65,.31)*smoothstep(.9988,.9994,sun)*(1.-.8*clouds);gl_FragColor=vec4(c,1.);}`}));
sky.renderOrder=-5;scene.add(sky);
scene.add(new T.HemisphereLight(0xffe3cd,0x586e8e,1.85));
const sunlight=new T.DirectionalLight(0xffc08c,3.1);sunlight.position.set(-30,24,-45);scene.add(sunlight);
const fill=new T.DirectionalLight(0x89cdff,1.25);fill.position.set(20,10,30);scene.add(fill);
const unit=new T.BoxGeometry(), materials=new Map(),batch=new Map(),dummy=new T.Object3D();
function mat(color,metal=0,rough=.67){const key=color+','+metal+','+rough;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,metalness:metal,roughness:rough}));return materials.get(key)}
function glow(color){let k='g'+color;if(!materials.has(k))materials.set(k,new T.MeshBasicMaterial({color}));return materials.get(k)}
function box(x,y,z,w,h,d,m,rot=0){if(!batch.has(m))batch.set(m,[]);dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.rotation.set(0,0,rot);dummy.updateMatrix();batch.get(m).push(dummy.matrix.clone())}
function flush(parent){for(const [m,arr] of batch){const mesh=new T.InstancedMesh(unit,m,arr.length);arr.forEach((v,i)=>mesh.setMatrixAt(i,v));parent.add(mesh)}batch.clear()}
function tex(w,h,paint){let c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),w,h);let t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t}
function panel(x,y,z,w,h,m,angle=0,parent=scene){let p=new T.Mesh(new T.PlaneGeometry(w,h),m);p.position.set(x,y,z);p.rotation.y=angle;parent.add(p);return p}
function lettering(words,bg,fg,vertical=false){const map=tex(vertical?128:512,vertical?512:128,(c,w,h)=>{c.fillStyle=bg;c.fillRect(0,0,w,h);c.strokeStyle=fg;c.lineWidth=4;c.strokeRect(8,8,w-16,h-16);c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';if(vertical){c.font='bold 82px sans-serif';[...words].forEach((s,i)=>c.fillText(s,w/2,(i+.55)*h/words.length))}else{c.font='bold 61px sans-serif';c.fillText(words,w/2,h/2,w-32)}});return new T.MeshBasicMaterial({map,side:T.DoubleSide})}
const facades=[];
for(let j=0;j<9;j++){
 const map=tex(512,1024,(c,w,h)=>{const palette=['#323c4c','#45505b','#55535a','#3b4558','#524c50'];c.fillStyle=pick(palette);c.fillRect(0,0,w,h);
 for(let row=0;row<27;row++){for(let col=0;col<10;col++){let x=col*51+4,y=row*38+5;let lit=rand();c.fillStyle=lit<.18?pick(['#eac197','#febf84','#ddada1','#c9d6cd']):pick(['#454e60','#344453','#526371','#626977']);c.fillRect(x,y,42,24);c.fillStyle='rgba(13,24,39,.42)';c.fillRect(x+20,y,3,25);c.fillRect(x,y,42,4);if(rand()<.32)c.fillRect(x,y+6,24,9);c.fillStyle='#313a47';c.fillRect(x-3,y+27,49,3)}}
 for(let i=0;i<280;i++){c.fillStyle='rgba(18,23,31,.08)';c.fillRect(r(0,w),r(0,h),r(1,4),r(10,120))}});facades.push(new T.MeshStandardMaterial({map,roughness:.76,emissiveMap:map,emissive:0xdddddd,emissiveIntensity:.3}))
}
const steel=mat(0x394957,.36),dark=mat(0x202f3d,.2),concrete=mat(0x67707b),amber=glow(0xffbd76),cool=glow(0xaddfe3);
const signs=['旅　社','東亞電器','永和豆漿','南港茶行','映畫','光華商場'].map((s,i)=>lettering(s,['#994f48','#e3b892','#204f57'][i%3],['#ffe4b3','#482f3b','#a8f5e4'][i%3],true));
for(const side of [-1,1])for(let row=0;row<3;row++)for(let z=-480;z<125;){
 const w=r(8,20)*(1+row*.25),d=r(10,23),h=r(12,46)+row*r(7,33),x=side*(r(27,44)+row*34),base=-30;
 box(x,base+h/2,z,w,h,d,pick(facades));box(x,base+h+.3,z,w+.4,.6,d+.4,concrete);box(x+1,base+h+1.4,z,w*.4,2.5,d*.36,steel);
 if(row===0){for(let k=0;k<h/4;k+=2)box(x-side*w*.51,base+k*4,z,.7,.27,d,concrete);
 if(rand()<.58){const sx=x-side*(w*.5+1.5);box(sx,base+h*.7,z,2.5,8,.42,dark);panel(sx,base+h*.7,z+.23,2.45,7.9,pick(signs))}
 }z+=d+r(2,10)}
// A tiered tower and distant ridgelines anchor the city silhouette.
for(let i=0;i<8;i++){let w=13-i*.72;box(-40,16+i*7,-219,w,6.8,w,facades[4]);box(-40,19+i*7,-219,w+1,.6,w+1,steel)}
box(-40,77,-219,.38,17,.38,steel);box(-40,85.6,-219,.45,.45,.45,amber);
for(let j=0;j<2;j++){let sh=new T.Shape();sh.moveTo(-400,-42);for(let i=-400;i<=400;i+=5)sh.lineTo(i,9+j*7+10*Math.sin(i*.026+j)+8*Math.sin(i*.051)+r(-1,1));sh.lineTo(400,-42);const mountain=new T.Mesh(new T.ShapeGeometry(sh),new T.MeshBasicMaterial({color:j?0x757388:0x65687a}));mountain.position.z=-320-j*55;scene.add(mountain)}
box(0,-30,0,900,1,1200,mat(0x34424d));
for(let z=-460;z<140;z+=9){box(6,-29.44,z,.15,.03,3,amber);for(const x of [-6,12]){const pos=z+r(-2,2);box(x,-28.8,pos,1.8,1.4,3.8,steel);box(x,-28.6,pos+1.93,1.6,.18,.05,x<0?amber:glow(0xfc695e))}}
for(let x of [0,8]){box(x,-3.3,-150,4.25,1.5,650,concrete);for(let a of [-1,1])box(x+a*.87,-2.47,-150,.12,.16,650,steel)}
for(let z=-460;z<150;z+=14){box(4,-17,z,2.2,26,2.5,concrete);box(4,-4.7,z,11.8,1.5,2.8,concrete)}
flush(scene);
const roofTex=tex(512,1024,(c,w,h)=>{c.fillStyle='#718186';c.fillRect(0,0,w,h);for(let i=0;i<6500;i++){c.fillStyle=rand()<.5?'rgba(225,218,201,.14)':'rgba(22,35,49,.17)';c.fillRect(r(0,w),r(0,h),r(.6,2),r(2,30))}for(let i=12;i<w;i+=17){c.fillStyle='#53616b';c.fillRect(i,0,2,h);c.fillStyle='#99a1a0';c.fillRect(i+2,0,2,h)}});
const roof=new T.MeshStandardMaterial({map:roofTex,roughness:.29,metalness:.28});
const trainSigns=[lettering('文湖線　BR 07','#173237','#ffcc80'),lettering('工程車　E-12','#372a23','#ffd38d')];
const trains=[];
for(let t=0;t<2;t++){const g=new T.Group();g.position.x=t*8;scene.add(g);trains.push(g);
const body=mat(t?0xb68b51:0xadb4ad,.24),stripe=mat(t?0xe8aa56:0x358a89,.3);
for(let car=0;car<15;car++){
const z=23-car*14.4;box(0,-1,z,3.68,2.32,14,body);box(0,.23,z,3.48,.18,13.92,roof);box(0,-2.23,z,2.68,.28,13,dark);
for(let side of [-1,1]){box(side*1.85,-1.72,z,.035,.29,13.9,stripe);box(side*1.7,.38,z,.06,.10,13.88,steel);
for(let win=0;win<8;win++){let wz=z-5.95+win*1.7;box(side*1.847,-.68,wz,.05,.98,1.37,dark);box(side*1.88,-.64,wz,.016,.74,1.18,win%3===0?cool:amber);box(side*1.895,-.59,wz,.02,.77,.055,steel);if(win%3!==0)box(side*1.90,-.85,wz+.16,.025,.29,.34,steel)}
}box(0,.28,z+6.96,3.5,.14,.14,steel);box(0,-1,z-7.15,2.8,1.95,.36,dark);
if(car%3===0)panel(0,-.67,z+7.02,2.7,.62,trainSigns[t],0,g);
}flush(g)}
const env=tex(512,256,(c,w,h)=>{const gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#596477');gr.addColorStop(.4,'#d9a99c');gr.addColorStop(.49,'#ffce93');gr.addColorStop(.55,'#485267');gr.addColorStop(1,'#283848');c.fillStyle=gr;c.fillRect(0,0,w,h);for(let x=0;x<w;){let bw=r(4,18),top=r(83,130);c.fillStyle=pick(['#536071','#465366','#637080']);c.fillRect(x,top,bw,145-top);for(let y=top+3;y<142;y+=4)if(rand()<.7){c.fillStyle='#dbab89';c.fillRect(x+2,y,bw*.54,1)}x+=bw+2}});env.mapping=T.EquirectangularReflectionMapping;scene.environment=env;
const route=[{s:42,from:0},{s:88,from:1},{s:134,from:0}],blocks=[{s:18,t:0,x:0},{s:29,t:0,x:-.76},{s:62,t:1,x:.63},{s:74,t:1,x:-.53},{s:107,t:0,x:0},{s:117,t:0,x:.7},{s:151,t:1,x:0}];
for(let o of blocks){box(o.x,.59,-o.s,1.42,.51,1.7,steel);for(let i=-3;i<=3;i++)box(o.x,.86,-o.s+i*.19,1.26,.04,.07,dark);for(let side of [-1,1])box(o.x+side*.57,.87,-o.s,.09,.03,1.6,amber);flush(trains[o.t])}
const archMat=mat(0xd0ac6f,.43),targets=[];
function gate(x,s,finish=false){const g=new T.Group();g.position.set(x,0,-s);scene.add(g);for(let sign of [-1,1]){box(sign*1.75,2.25,0,.14,4,.19,steel);box(sign*1.75,3.7,.12,.09,.86,.05,finish?amber:cool)}box(0,4.22,0,3.65,.22,.24,archMat);flush(g);let dest=new T.Mesh(new T.TorusGeometry(.40,.042,8,44),finish?amber:cool);dest.position.set(0,3.62,0);g.add(dest);return dest}
for(let p of route){targets.push(gate(8*(1-p.from),p.s+5));for(let k=0;k<5;k++){box((p.from?8:0)+(p.from?-1:1)*.95,.333,-p.s+4-k*1.65,.48,.02,.16,amber)}}
gate(8,162,true);flush(scene);
const runner=new T.Group();scene.add(runner);
function joint(parent,x,y,z){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g}
function solid(parent,geo,m,x,y,z,sx=1,sy=1,sz=1){let v=new T.Mesh(geo,m);v.position.set(x,y,z);v.scale.set(sx,sy,sz);parent.add(v);return v}
const sphere=new T.SphereGeometry(1,16,12),jacket=mat(0xeb9b30,.08,.47),pants=mat(0x233444),rubber=mat(0x20292e),tape=mat(0xf6e1ac,.29),bag=mat(0x434c49),face=mat(0xb28368);
function oval(p,m,x,y,z,a,b,c){return solid(p,sphere,m,x,y,z,a,b,c)}
const hips=joint(runner,0,.85,0),torso=joint(hips,0,0,0);
solid(torso,new T.CylinderGeometry(.245,.30,.53,12),jacket,0,.26,0,1,1,.72);
oval(torso,jacket,0,.52,0,.283,.16,.19);oval(torso,jacket,0,.78,0,.214,.244,.22);oval(torso,rubber,0,.78,-.124,.168,.175,.136);oval(torso,face,0,.76,-.19,.135,.127,.10);oval(torso,jacket,0,.885,-.06,.229,.116,.239);
oval(torso,bag,0,.30,.143,.189,.245,.115);solid(torso,unit,tape,0,.34,.251,.29,.049,.023);
const limbs=[];for(let side of [-1,1]){const thigh=joint(hips,side*.14,0,0),shin=joint(thigh,0,-.37,0),arm=joint(torso,side*.267,.47,0),fore=joint(arm,0,-.25,0);
oval(thigh,pants,0,-.17,0,.107,.247,.12);oval(shin,pants,0,-.169,0,.09,.21,.101);oval(shin,rubber,0,-.34,-.055,.102,.102,.165);oval(arm,jacket,0,-.118,0,.095,.18,.106);oval(fore,jacket,0,-.123,0,.079,.158,.088);oval(fore,tape,0,-.171,0,.081,.036,.088);oval(fore,rubber,0,-.267,0,.067,.091,.07);limbs.push({side,thigh,shin,arm,fore})}
const shade=tex(128,128,(c,w,h)=>{let g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(0,0,0,.76)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,w,h)});
const shadow=new T.Mesh(new T.PlaneGeometry(1.35,1.8),new T.MeshBasicMaterial({map:shade,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;scene.add(shadow);
const rope=new T.Line(new T.BufferGeometry().setFromPoints([V(0,0,0),V(1,1,1)]),new T.LineBasicMaterial({color:0xffe8ad}));scene.add(rope);rope.visible=false;
const rainCount=1450,rainPos=new Float32Array(rainCount*6),drops=[];for(let i=0;i<rainCount;i++)drops.push([r(-28,28),r(0,28),r(-35,20),r(.65,1.3)]);
const rainGeo=new T.BufferGeometry();rainGeo.setAttribute('position',new T.BufferAttribute(rainPos,3));const rain=new T.LineSegments(rainGeo,new T.LineBasicMaterial({color:0xd2e0ed,transparent:true,opacity:.23,depthWrite:false}));rain.frustumCulled=false;scene.add(rain);
function weather(tm){sky.position.copy(camera.position);sky.material.uniforms.time.value=tm;rain.position.copy(camera.position);for(let i=0;i<rainCount;i++){const [x,y,z,k]=drops[i],a=i*6;let yy=((y-tm*13*k)%28+28)%28-11;rainPos[a]=x-yy*.24;rainPos[a+1]=yy;rainPos[a+2]=z;rainPos[a+3]=rainPos[a]+.105*k;rainPos[a+4]=yy-.46*k;rainPos[a+5]=z+.04}rainGeo.attributes.position.needsUpdate=true}
function resize(){renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}onresize=resize;resize();
