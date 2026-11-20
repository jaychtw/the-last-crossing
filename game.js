'use strict';
const el=id=>document.getElementById(id),keys=new Set();
const words={
 en:{title:'The Last<br>Crossing',kicker:'BR LINE　/　TYPHOON SIGNAL',desc:'The last service is stranded above Taipei. Cross between the two trains and reach the amber evacuation gate.',start:'Enter the crossing　→',keys:'WASD / arrows · Move　 Space · Jump　 E · Tether　 Drag · Look',pause:'Pause',resume:'Resume crossing',paused:'On hold',again:'Run it again　↺',done:'Across.',end:'You reached the evacuation gate.',retry:'Back on the roof. Your last crossing is saved.',tether:'Press E to swing to the illuminated ring',early:'Follow the amber roof markings to get in range.',vent:'Roof vent ahead · Jump or move around it',objective:'Reach the next tether gate',finish:'Reach the amber evacuation gate',sound:'Audio',off:'off',on:'on',touch:'▲ Run　 ◀ ▶ Steer　 ↥ Jump　 ◎ Tether',time:'Time',cross:'Crossings'},
 zh:{title:'末班線',kicker:'文湖線　／　颱風警報',desc:'末班列車受困在臺北上空。利用纜索穿梭於兩列車之間，抵達琥珀色撤離門。',start:'進入高架線　→',keys:'WASD／方向鍵 移動　空白鍵 跳躍　E 纜索　拖曳 環視',pause:'暫停',resume:'繼續前進',paused:'暫停中',again:'再次挑戰　↺',done:'安全抵達',end:'你已抵達撤離門。',retry:'回到車頂，從上一個檢查點繼續。',tether:'按 E，盪向發光的圓環',early:'沿著車頂琥珀色標線前進，靠近纜索門。',vent:'前方有通風設備，可跳過或繞過',objective:'前往下一個纜索門',finish:'抵達琥珀色撤離門',sound:'音效',off:'關',on:'開',touch:'▲ 前進　 ◀ ▶ 移動　 ↥ 跳躍　 ◎ 纜索',time:'時間',cross:'跨越'}
};
let lang='en',mode='intro',s=0,track=0,offset=0,y=0,vy=0,next=0,swing=null,clock=0,tm=0,phase=0,speed=0,notice='',noticeTime=0,orbit=0,pitch=0,drag=null,ac=null,audioOn=false,last=performance.now(),trainShift=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,touchable=matchMedia('(pointer:coarse)').matches;
function tr(k){return words[lang][k]}
function ui(){const playing=mode==='play';document.body.classList.toggle('playing',playing);el('panel').hidden=playing;el('hud').hidden=!playing;el('pause').hidden=!playing;el('touch').hidden=!playing||!touchable;
el('lang').textContent=lang==='en'?'繁':'En';document.documentElement.lang=lang==='en'?'en':'zh-Hant';el('pause').textContent=tr('pause');el('sound').textContent=tr('sound')+' '+tr(audioOn?'on':'off');
el('kicker').textContent=tr('kicker');el('title').innerHTML=tr(mode==='done'?'done':mode==='pause'?'paused':'title');el('desc').textContent=mode==='done'?tr('end')+'　'+tr('time')+' '+clock.toFixed(1)+' s':tr('desc');el('primary').textContent=tr(mode==='pause'?'resume':mode==='done'?'again':'start');el('keys').textContent=tr(touchable?'touch':'keys');if(!playing)el('hint').textContent=''}
function setMode(m){mode=m;keys.clear();ui()}
function begin(){if(mode!=='pause'){s=0;next=track=offset=y=vy=clock=speed=0;swing=null;noticeTime=0;orbit=pitch=0}setMode('play')}
function pauseGame(){if(mode==='play')setMode('pause');else if(mode==='pause')begin()}
el('primary').onclick=begin;el('pause').onclick=pauseGame;el('lang').onclick=()=>{lang=lang==='en'?'zh':'en';ui()};
function chirp(freq,len=.13){if(!audioOn)return;const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(freq,ac.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.65,ac.currentTime+len);g.gain.setValueAtTime(.09,ac.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+len);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+len)}
el('sound').onclick=async()=>{try{if(!ac){ac=new AudioContext();const b=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate),a=b.getChannelData(0);let low=0;for(let i=0;i<a.length;i++){low=.96*low+.04*(Math.random()*2-1);a[i]=low*.36+(Math.random()-.5)*.013}let n=ac.createBufferSource();n.buffer=b;n.loop=true;n.connect(ac.destination);n.start()}if(audioOn)await ac.suspend();else await ac.resume();audioOn=!audioOn;ui()}catch{el('sound').disabled=true}};
function note(k,d=2){notice=k;noticeTime=d}
function action(k){if(mode!=='play')return;if(k==='Space'&&!swing&&y<=.005){vy=5.5;chirp(130)}
if(k==='KeyE'&&!swing){let p=route[next];if(p&&s>=p.s-6&&s<=p.s+4){swing={u:0,start:s,x:track*8+offset,p};vy=0;chirp(660)}else note('early')}}
onkeydown=e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)&&mode==='play')e.preventDefault();if(e.repeat)return;if(e.code==='Escape'){pauseGame();return}if(mode==='play'){keys.add(e.code);action(e.code)}};onkeyup=e=>keys.delete(e.code);onblur=()=>{if(mode==='play')setMode('pause')};
for(const b of document.querySelectorAll('[data-key]')){b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);action(b.dataset.key)};b.onlostpointercapture=()=>keys.delete(b.dataset.key)}
canvas.onpointerdown=e=>{if(mode==='play'){drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)}};canvas.style.touchAction='none';canvas.onpointermove=e=>{if(drag){orbit-=(e.clientX-drag[0])*.008;pitch=Math.max(-.7,Math.min(1.4,pitch+(e.clientY-drag[1])*.006));drag=[e.clientX,e.clientY]}};canvas.onlostpointercapture=()=>drag=null;
function recover(){s=next?route[next-1].s+6:0;offset=y=vy=speed=0;note('retry',2.5);chirp(95)}
function simulate(dt){clock+=dt;noticeTime-=dt;const p=route[next];
if(swing){swing.u=Math.min(1,swing.u+dt/1.32);const u=swing.u*.5,blend=.5-.5*Math.cos(u*2*Math.PI);s=T.MathUtils.lerp(swing.start,swing.p.s+6,blend);y=Math.sin(swing.u*Math.PI)*2.15;offset=T.MathUtils.lerp(swing.x,(1-track)*8,blend)-track*8;if(swing.u===1){track=1-track;next++;offset=y=vy=0;swing=null;chirp(260)}}
else{const f=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown')),side=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
speed=T.MathUtils.damp(speed,6.8*f,9,dt);s=Math.max(next?route[next-1].s+5:0,s+speed*dt);offset=Math.max(-1.45,Math.min(1.45,offset+side*dt*3.5));vy-=13*dt;y=Math.max(0,y+vy*dt);if(!y)vy=0;
for(let o of blocks)if(track===o.t&&Math.abs(s-(o.s-(o.t?trainShift:0)))<.88&&Math.abs(offset-o.x)<.84&&y<.49){recover();break}
if(p&&s>p.s+4){s=p.s+4;speed=0}if(next===3&&s>=162){setMode('done');chirp(780,.5)}}
phase+=dt*Math.abs(speed)*1.65;
el('distance').textContent=String(Math.floor(Math.min(s,162))).padStart(3,'0')+' / 162 m　·　'+next+'/3';el('bar').style.width=Math.min(100,s/162*100)+'%';el('objective').textContent=tr(p?'objective':'finish');
let msg=noticeTime>0?notice:p&&s>=p.s-6?'tether':blocks.some(o=>o.t===track&&o.s-s>0&&o.s-s<6)?'vent':'';el('hint').textContent=mode==='play'&&!swing&&msg?tr(msg):''}
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.04,(now-last)/1000);last=now;if(mode!=='pause')tm+=dt;trainShift=Math.sin(tm*.24)*1.65;trains[1].position.z=trainShift;
if(mode==='play')simulate(dt);
const x=track*8+offset,run=mode==='play'&&!swing?Math.min(1,Math.abs(speed)/5):0;
runner.position.set(x,.33+y,-s);shadow.position.set(x,.338,-s);shadow.material.opacity=Math.max(.18,1-y*.28);
hips.position.y=.85+Math.sin(phase*2)*.035*run;torso.rotation.x=-.09*run;runner.rotation.z=swing?Math.sin(swing.u*Math.PI)*.29*(track?1:-1):0;
for(let l of limbs){const step=Math.sin(phase+l.side*Math.PI*.5);l.thigh.rotation.x=step*.76*run+(y>0?-.28:0);l.shin.rotation.x=Math.max(0,-step)*.91*run+(y>0?.62:.06);l.arm.rotation.x=-step*.67*run+(swing?-2.56:.1);l.arm.rotation.z=l.side*(.1+(swing?.18:0));l.fore.rotation.x=-.31-run*.55}
rope.visible=!!swing;if(swing){const attr=rope.geometry.attributes.position;attr.setXYZ(0,x,runner.position.y+1.65,-s);attr.setXYZ(1,(1-track)*8,3.62,-swing.p.s-5);attr.needsUpdate=true;rope.geometry.computeBoundingSphere()}
if(mode==='intro'){const pan=reduced?0:Math.sin(tm*.13)*1.5;camera.position.set(-9.6+pan,4.45,11);camera.lookAt(1,1.4,-15)}
else if(mode!=='pause'){if(run>.2&&!drag){orbit=T.MathUtils.damp(orbit,0,2,dt);pitch=T.MathUtils.damp(pitch,0,1.8,dt)}
const dist=swing?7.5:5.5,eye=V(x+Math.sin(orbit)*dist+.55,2.66+y*.78+pitch,-s+Math.cos(orbit)*dist);camera.position.lerp(eye,1-Math.exp(-dt*7));camera.lookAt(x,1.33+y*.8,-s-1.15)}
waterMirror.material.uniforms.seconds.value=tm;waterMirror.material.uniforms.shift.value=trainShift;cape.rotation.x=Math.sin(tm*5)*.07+run*.16;weather(tm);renderer.render(scene,camera)}
ui();requestAnimationFrame(frame);
