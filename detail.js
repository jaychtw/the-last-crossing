// Both train roofs share one reflection pass. Cut the reflective surface at each carriage joint.
const wetShader=structuredShader();
function structuredShader(){
 const src=RailReflector.ReflectorShader;
 return {uniforms:{...src.uniforms,seconds:{value:0},shift:{value:0}},vertexShader:src.vertexShader.replace('varying vec4 vUv;','varying vec4 vUv; varying vec2 ground;').replace('vUv =','ground=(modelMatrix*vec4(position,1.)).xz; vUv ='),
 fragmentShader:src.fragmentShader.replace('uniform vec3 color;',`uniform vec3 color; uniform float seconds,shift; varying vec2 ground;
 float cell(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(cell(i),cell(i+vec2(1,0)),f.x),mix(cell(i+vec2(0,1)),cell(i+1.),f.x),f.y);}`).replace('vec4 base = texture2DProj( tDiffuse, vUv );',`float rail=step(4.,ground.x);vec2 p=vec2(ground.x-rail*8.,ground.y-rail*shift);
 if(abs(p.x)>1.68||abs(mod(p.y-23.+7.2,14.4)-7.2)>6.89) discard;
 vec2 rip=p*3.8;vec2 delta=fract(rip)-.5;float phase=fract(seconds*1.35+cell(floor(rip)));float ring=sin((length(delta)-phase*.72)*51.)*exp(-abs(length(delta)-phase*.72)*13.)*(1.-phase);
 float wet=noise(p*vec2(2.4,.8))*.65+noise(p*vec2(6.,2.))*.35;
 vec2 uv=vUv.xy/vUv.w + vec2(ring*.0016+.0011*sin(p.y*6.+seconds*3.),ring*.0011);
 vec4 base=texture2D(tDiffuse,uv);`).replace('vec4( blendOverlay( base.rgb, color ), 1.0 )','vec4(base.rgb*.85,smoothstep(.22,.67,wet)*.79+.08)')};
}
const waterMirror=new RailReflector(new T.PlaneGeometry(11.5,215),{shader:wetShader,textureWidth:640,textureHeight:360,multisample:0,clipBias:.001});
waterMirror.position.set(4,.325,-78);waterMirror.rotation.x=-Math.PI/2;waterMirror.material.transparent=true;waterMirror.material.depthWrite=false;waterMirror.renderOrder=1;scene.add(waterMirror);
shadow.renderOrder=2;
// Civil infrastructure and carriage fittings.
const cableMat=new T.LineBasicMaterial({color:0x283446});
function cable(points){let path=new T.CatmullRomCurve3(points);const line=new T.Line(new T.BufferGeometry().setFromPoints(path.getPoints(26)),cableMat);scene.add(line)}
const oxide=mat(0x485568,.5),warning=mat(0xe7b86a,.25);
for(let z=12;z>-230;z-=32){
 for(let x of [-3.45,11.45]){box(x,1.6,z,.19,10.8,.22,oxide);box(x,-.2,z,.37,1.6,.39,steel);for(let i=0;i<4;i++)box(x,.03+i*.42,z+.22,.36,.16,.035,warning)}
 for(let y of [6.25,6.98])box(4,y,z,15.1,.105,.14,oxide);
 for(let i=0;i<15;i++)box(-3.2+i,6.61,z,.085,1.16,.1,oxide,i%2?.91:-.91);
 for(let x of [-2.8,10.9]){box(x,6,z,.4,.3,.43,steel);cable([V(x,6,z),V(x,5.6,z-16),V(x,6,z-32)])}
}
flush(scene);
const glassPanels=Array.from({length:9},(_,i)=>new T.MeshStandardMaterial({roughness:.19,metalness:.4,map:tex(128,96,(c,w,h)=>{let g=c.createLinearGradient(0,0,w/2,h);g.addColorStop(0,'#616c70');g.addColorStop(.22,'#d8bc87');g.addColorStop(.5,i%3?'#c5a67c':'#8ba9ac');g.addColorStop(1,'#405568');c.fillStyle=g;c.fillRect(0,0,w,h);c.fillStyle='#fff4c9';c.fillRect(2,8,122,3);c.fillStyle='#5a626b';c.fillRect(10,27,65,22);c.fillStyle='#b7a79a';c.fillRect(14,30,57,16);for(let k=0;k<3;k++){let px=r(0,w),py=r(44,64);c.fillStyle=pick(['#44505a','#535057','#5c5e5c']);c.beginPath();c.ellipse(px,py,6,8,0,0,7);c.fill();c.beginPath();c.ellipse(px,py+19,12,15,0,0,7);c.fill()}c.fillStyle='#948d7d';c.fillRect(84,5,3,90);c.fillStyle='rgba(184,217,225,.2)';c.beginPath();c.moveTo(0,40);c.lineTo(90,0);c.lineTo(125,0);c.lineTo(0,72);c.fill()})}));
for(let t=0;t<2;t++){for(let car=0;car<15;car++){let z=23-car*14.4;
 for(let side of [-1,1]){for(let k=0;k<8;k++){let wz=z-5.95+k*1.7;box(side*1.912,-.64,wz,.014,.73,1.18,pick(glassPanels));if(k%4===1||k%4===2){box(side*1.86,-.99,wz+.76,.05,1.91,.034,dark);box(side*1.89,-1.49,wz+.43,.05,.18,.054,steel)}}
 for(let k=0;k<12;k++)box(side*1.69,.39,z-6.5+k*1.15,.075,.1,.11,archMat);
 box(side*1.84,-1.96,z,.035,.057,13.9,steel)}
 for(let k=0;k<4;k++){box(1.32,.347,z-5+k*3.1,.42,.035,.85,steel);for(let j=0;j<4;j++)box(1.32,.372,z-5+k*3.1+j*.14-.22,.30,.014,.043,dark)}
}flush(trains[t])}
const packLabel=lettering('巡　檢','#35434a','#e3cba3');panel(0,.27,.264,.19,.066,packLabel,0,torso);
for(let side of [-1,1]){let strap=solid(torso,unit,rubber,side*.15,.33,.168,.033,.34,.03);strap.rotation.z=side*.11;solid(torso,unit,tape,side*.18,.49,.138,.088,.045,.035)}
const cape=solid(torso,new T.CylinderGeometry(.248,.34,.21,14,1,true),jacket,0,.04,.01,1,1,.73);
const hoodSeam=new T.Mesh(new T.TorusGeometry(.194,.008,6,40),mat(0xa97838));hoodSeam.position.set(0,.79,.014);hoodSeam.rotation.y=Math.PI/2;torso.add(hoodSeam);
// Low-intensity halos keep the gate readable against bright windows.
const haloMap=tex(128,128,c=>{let g=c.createRadialGradient(64,64,2,64,64,64);g.addColorStop(0,'rgba(190,255,245,.55)');g.addColorStop(.17,'rgba(104,255,228,.2)');g.addColorStop(1,'rgba(40,211,204,0)');c.fillStyle=g;c.fillRect(0,0,128,128)});
for(let gate of targets){const sprite=new T.Sprite(new T.SpriteMaterial({map:haloMap,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));sprite.scale.set(2.2,2.2,1);gate.add(sprite)}
