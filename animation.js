'use strict';
const canvas = document.getElementById('film');
const viewer = document.getElementById('viewer');
const DURATION = 18;
const C = {bg:'#0a1017',line:'#344657',muted:'#97a8b8',white:'#e6eef6',blue:'#92bfff',mint:'#93e0cb',purple:'#bba6ff',gold:'#e1c691'};
const chapters = [
 {t:0,title:'A message arrives',detail:'The channel adapter passes an eligible message to the host, which resolves its session.',caption:'A message arrives. The host finds its session.'},
 {t:3,title:'A durable handoff',detail:'The host persists the message in the session inbox and wakes or reuses its container.',caption:'Saved to the inbox. The agent wakes—or keeps running.'},
 {t:6,title:'The agent works',detail:'The SDK calls the model through OneCLI, executes a local tool, then sends the result back for the next model response. This is one illustrative turn.',caption:'Ask the model. Run a tool. Read the result.'},
 {t:14,title:'The answer returns',detail:'The agent writes its reply to the outbox. The host delivers it through the channel adapter.',caption:'The agent writes a reply. The host delivers it.'}
];
let time=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,speed=1,prev=performance.now(),recording=false,lastChapter=-1;
const clamp=(v)=>Math.max(0,Math.min(1,v));
const phase=(t,a,b)=>clamp((t-a)/(b-a));
const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
function drawScene(ctx,t,portrait){
 const w=portrait?1080:1440,h=portrait?1920:900;
 const x=portrait?[180,540,900]:[240,720,1200],y=portrait?720:335,r=portrait?76:68;
 const detailY=portrait?1160:620;
 const active=t<1.8?0:t<5?1:t<15.4?2:t<17?1:0;
 const act=chapters.reduce((a,c,i)=>t>=c.t?i:a,0);
 ctx.fillStyle=C.bg;ctx.fillRect(0,0,w,h);
 const gradient=ctx.createRadialGradient(w/2,y,0,w/2,y,w*.6);gradient.addColorStop(0,'#17263866');gradient.addColorStop(1,'#0a101700');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
 function label(s,xx,yy,size=24,color=C.white,align='center',mono=false){ctx.fillStyle=color;ctx.font=`400 ${size}px ${mono?'ui-monospace, monospace':'"Space Grotesk", sans-serif'}`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(s,xx,yy)}
 function path(points,color=C.line,width=2){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke()}
 function ring(xx,yy,rr,color,width=2){ctx.beginPath();ctx.arc(xx,yy,rr,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
 function dot(xx,yy,color,radius=7){ctx.save();ctx.shadowColor=color;ctx.shadowBlur=24;ctx.beginPath();ctx.arc(xx,yy,radius,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.restore()}
 function box(xx,yy,bw,bh,color=C.line){ctx.beginPath();ctx.roundRect(xx,yy,bw,bh,14);ctx.fillStyle='#101a24';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=color;ctx.stroke()}
 function travel(a,b,p,color){if(p<=0||p>=1)return;for(let i=8;i>=0;i--){let q=clamp(p-i*.012);ctx.save();ctx.globalAlpha=1-i/9;dot(a[0]+(b[0]-a[0])*q,a[1]+(b[1]-a[1])*q,color,i?3:8);ctx.restore()}}
 function reveal(a,b){return ease((t-a)/.3)*(1-ease((t-b)/.3))}
 label('K I N E T I C   /   0 0 1',w/2,portrait?160:52,portrait?21:15,C.muted);
 label('One message. One loop.',w/2,portrait?250:108,portrait?58:42);
 label('Inside NanoClaw',w/2,portrait?330:155,portrait?32:23,C.mint);
 // Three anchors stay in place. Only the active mechanism is revealed.
 ctx.save();ctx.globalAlpha=t>=6&&t<14?.22:.8;
 path([[x[0]+r,y],[x[1]-r,y]]);path([[x[1]+r,y],[x[2]-r,y]]);ctx.restore();
 const colors=[C.mint,C.blue,C.purple];
 x.forEach((xx,i)=>{const on=i===active;ctx.save();ctx.globalAlpha=on?1:.48;
 ring(xx,y,r,on?colors[i]:C.line,2);ring(xx,y,r-10,C.line,1);
 for(let k=0;k<24;k++){const a=k*Math.PI/12;path([[xx+Math.cos(a)*(r+5),y+Math.sin(a)*(r+5)],[xx+Math.cos(a)*(r+(k%3?9:15)),y+Math.sin(a)*(r+(k%3?9:15))]],on?colors[i]:C.line,1)}
 if(on){ctx.save();ctx.translate(xx,y);ctx.rotate(t*.5);ctx.beginPath();ctx.arc(0,0,r-19,0,Math.PI*.6);ctx.strokeStyle=colors[i];ctx.lineWidth=3;ctx.stroke();ctx.restore()}
 if(i===0){box(xx-27,y-19,54,38,colors[i]);path([[xx-24,y-14],[xx,y+2],[xx+24,y-14]],colors[i]);}
 if(i===1){for(let k=0;k<3;k++){const a=k*Math.PI*2/3+t*.3;path([[xx,y],[xx+Math.cos(a)*34,y+Math.sin(a)*34]],colors[i],3)}dot(xx,y,colors[i],6)}
 if(i===2){ring(xx,y,24,colors[i]);dot(xx,y,colors[i],7)}
 label(['Chat','Host','Agent'][i],xx,y+r+57,portrait?40:32,on?C.white:C.muted);
 ctx.restore();});
 travel([x[0]+r,y],[x[1]-r,y],phase(t,.7,1.8),C.mint);
 travel([x[1]+r,y],[x[2]-r,y],phase(t,4.4,5.5),C.blue);
 travel([x[2]-r,y],[x[1]+r,y],phase(t,14.7,15.6),C.mint);
 travel([x[1]-r,y],[x[0]+r,y],phase(t,16,17),C.mint);
 // Durable mailboxes are short handoff details, not permanent queue towers.
 function mailbox(name,status,alpha){if(alpha<=0)return;ctx.save();ctx.globalAlpha=alpha;
 box(w/2-185,detailY-44,370,88,name==='Inbox'?C.blue:C.mint);
 label(name,w/2-130,detailY,portrait?32:26,C.white,'left');label(status,w/2+145,detailY,portrait?24:19,C.mint,'right',true);
 label(name==='Inbox'?'Host writes · agent reads':'Agent writes · host reads',w/2,detailY+88,portrait?25:21,C.muted);
 ctx.restore();}
 mailbox('Inbox',t<4.2?'SAVED':'READY',reveal(3,5.6));
 mailbox('Outbox',t<15.6?'SAVED':'DELIVERED',reveal(14,16.4));
 // Focus on credentialed inference only during the request/response.
 const modelAlpha=Math.max(reveal(6,8.8),reveal(11,13.7));
 if(modelAlpha>0){ctx.save();ctx.globalAlpha=modelAlpha;
 const gx=w/2,spread=portrait?300:350,yy=detailY;
 label(t<10?'Ask the model':'Send the tool result',gx,yy-(portrait?155:110),portrait?36:28,C.purple);
 const anchors=[gx-spread,gx,gx+spread];
 path([[anchors[0]+60,yy],[anchors[2]-60,yy]],C.line);
 // The small gate sits on the boundary; it is not another machine-sized box.
 box(gx-58,yy-48,116,96,C.gold);ring(gx,yy-7,14,C.gold);path([[gx,yy+7],[gx,yy+23]],C.gold,3);
 ring(anchors[0],yy,49,C.purple);ring(anchors[2],yy,49,C.purple);
 label('SDK',anchors[0],yy,portrait?26:23,C.purple);label('API',anchors[2],yy,portrait?26:23,C.purple);
 label('Agent',anchors[0],yy+94,portrait?27:23);label('OneCLI',gx,yy+94,portrait?27:23,C.gold);label('Model',anchors[2],yy+94,portrait?27:23);
 label('Credentials added here',gx,yy+142,portrait?23:18,C.muted);
 const local=t<10?t-6:t-11;
 if(local<.75)travel([anchors[0]+49,yy],[gx-58,yy],phase(local,.15,.75),C.purple);
 else if(local<1.25)travel([gx+58,yy],[anchors[2]-49,yy],phase(local,.75,1.25),C.gold);
 else if(local<1.85)travel([anchors[2]-49,yy],[gx+58,yy],phase(local,1.3,1.85),C.purple);
 else travel([gx-58,yy],[anchors[0]+49,yy],phase(local,1.85,2.45),C.purple);
 ctx.restore();}
 const toolAlpha=reveal(9,10.7);
 if(toolAlpha>0){ctx.save();ctx.globalAlpha=toolAlpha;
 label('One local tool call',w/2,detailY-(portrait?135:110),portrait?36:28,C.mint);
 box(w/2-180,detailY-45,360,90,C.mint);label(t<10?'READ FILE':'RESULT READY',w/2,detailY,portrait?30:25,C.mint,'center',true);
 label('Runs inside the container',w/2,detailY+94,portrait?26:21,C.muted);
 ctx.restore();}
 if(t>=17){ctx.save();ctx.globalAlpha=ease((t-17)/.3);label('Reply delivered',w/2,detailY,portrait?42:32,C.mint);ctx.restore()}
 if(t<3){ctx.save();ctx.globalAlpha=reveal(.2,2.6);label('Find the right session',w/2,detailY,portrait?36:28,C.blue);ctx.restore()}
 const caption=chapters[act].caption;
 // Two short lines in portrait; a single line on desktop.
 if(portrait){const lines=[['A message arrives.','The host finds its session.'],['Saved to the inbox.','The agent wakes—or keeps running.'],['Ask the model. Run a tool.','Read the result.'],['The agent writes a reply.','The host delivers it.']][act];label(lines[0],w/2,1650,34);label(lines[1],w/2,1705,30,C.muted);}
 else label(caption,w/2,843,24,C.white);
 label('ONE ILLUSTRATIVE SESSION',w/2,portrait?1815:885,portrait?19:13,C.muted,'center',true);
 ctx.fillStyle=C.mint;ctx.fillRect(0,h-4,w*t/DURATION,4);
}
function render(t){drawScene(canvas.getContext('2d'),t,true);if(viewer&&!matchMedia('(max-width: 800px)').matches)drawScene(viewer.getContext('2d'),t,false);
 const s=chapters.reduce((a,c,i)=>t>=c.t?i:a,0);
 if(s!==lastChapter){document.getElementById('stage-title').textContent=chapters[s].title;document.getElementById('stage-detail').textContent=chapters[s].detail;document.querySelectorAll('#chapters button').forEach((b,i)=>{b.classList.toggle('active',i===s);b.setAttribute('aria-current',i===s?'step':'false')});lastChapter=s}
 document.getElementById('scrub').value=t;document.getElementById('clock').textContent=`00:${String(Math.floor(t)).padStart(2,'0')} / 00:18`;
}
let audioCtx,master,recordDest,audioSource,soundOn=false,scoreBuffer;
const soundButton=document.createElement('button');soundButton.id='sound';soundButton.textContent='♪ Sound off';soundButton.title='Enable sound';soundButton.setAttribute('aria-label','Enable sound');soundButton.setAttribute('aria-pressed','false');document.querySelector('.transport').insertBefore(soundButton,document.getElementById('clock'));
function makeScore(ctx){const sr=ctx.sampleRate,b=ctx.createBuffer(2,sr*DURATION,sr),L=b.getChannelData(0),R=b.getChannelData(1);let seed=421;function random(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296*2-1}
 function tone(at,dur,f,amp,pan=0,noise=false,end=f){let ph=0,low=0;for(let i=0;i<dur*sr;i++){const j=Math.floor(at*sr)+i;if(j>=L.length)break;const q=i/(dur*sr),tt=i/sr;ph+=Math.PI*2*(f+(end-f)*q)/sr;low=.85*low+.15*random();const v=(noise?low:Math.sin(ph)) *amp*Math.min(1,tt/.006)*Math.exp(-tt/(dur*.25))*(1-q);L[j]+=v*Math.sqrt((1-pan)/2);R[j]+=v*Math.sqrt((1+pan)/2)}}
 tone(.7,.3,680,.17,-.6);tone(1.8,.1,240,.16);tone(3.1,.13,140,.25);tone(4.4,.35,330,.12,0,false,600);tone(5.5,.3,510,.12,.6);
 for(const t of [6,11]){tone(t+.15,.28,380,.10,-.6,false,600);tone(t+.75,.07,1800,.15,0,true);tone(t+1.25,.25,760,.11,.6);tone(t+1.85,.3,580,.11,.2,false,380)}
 tone(9.3,.055,1500,.17,0,true);tone(10,.2,440,.12);tone(14.15,.15,160,.2,.6);tone(15.6,.12,230,.12);tone(16,.35,620,.1,0,false,420);[523,659,784].forEach((f,i)=>tone(17+i*.09,.65,f,.12,(i-1)*.4));return b;
}
async function initAudio(){if(!audioCtx){audioCtx=new AudioContext();master=audioCtx.createGain();master.gain.value=.8;master.connect(audioCtx.destination);recordDest=audioCtx.createMediaStreamDestination();master.connect(recordDest);scoreBuffer=makeScore(audioCtx)}await audioCtx.resume()}
function stopAudio(){if(audioSource){audioSource.stop();audioSource.disconnect();audioSource=null}}
function syncAudio(){stopAudio();if(audioCtx&&soundOn&&playing){audioSource=audioCtx.createBufferSource();audioSource.buffer=scoreBuffer;audioSource.playbackRate.value=speed;audioSource.connect(master);audioSource.start(0,Math.min(time,DURATION-.01))}}
soundButton.onclick=async()=>{await initAudio();soundOn=!soundOn;soundButton.setAttribute('aria-pressed',String(soundOn));soundButton.textContent=soundOn?'♪ Sound on':'♪ Sound off';document.getElementById('export-status').textContent=soundOn?'Sound on · synchronized with playback':'Sound off · enable it for the full experience';soundButton.setAttribute('aria-label',soundOn?'Mute sound':'Enable sound');soundButton.style.color=soundOn?C.mint:'';soundButton.title=soundOn?'Mute sound':'Enable sound';syncAudio()};
function setPlaying(v){playing=v;document.getElementById('play').textContent=v?'Ⅱ':'▶';document.getElementById('play').setAttribute('aria-label',v?'Pause animation':'Play animation');syncAudio()}
chapters.forEach((c,i)=>{const li=document.createElement('li'),b=document.createElement('button');b.innerHTML=`<span>0${i+1}</span>${c.title}`;b.onclick=()=>{time=c.t;syncAudio();render(time)};li.append(b);document.getElementById('chapters').append(li)});
document.getElementById('play').onclick=()=>setPlaying(!playing);document.getElementById('restart').onclick=()=>{time=0;setPlaying(true)};document.getElementById('speed').onchange=e=>{speed=+e.target.value;syncAudio()};document.getElementById('scrub').oninput=e=>{time=+e.target.value;syncAudio();render(time)};
document.addEventListener('keydown',e=>{if(e.code==='Space'&&e.target===document.body){e.preventDefault();setPlaying(!playing)}});
let finishRecording;
function frame(now){const delta=Math.min((now-prev)/1000,.1);prev=now;if(playing){time+=delta*speed;if(time>=DURATION){if(recording){time=DURATION-.019;render(time);finishRecording();return requestAnimationFrame(frame)}time%=DURATION;syncAudio()}}render(time);requestAnimationFrame(frame)}
document.getElementById('export').onclick=async()=>{const btn=document.getElementById('export'),status=document.getElementById('export-status');if(!canvas.captureStream||!window.MediaRecorder){status.textContent='Video export is unavailable in this browser.';return}await initAudio();const formats=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];const mimeType=formats.find(f=>MediaRecorder.isTypeSupported(f));if(!mimeType){status.textContent='WebM export is unavailable in this browser.';return}const old={time,playing,speed,soundOn};stopAudio();time=0;speed=1;soundOn=true;playing=true;recording=true;btn.disabled=true;document.querySelectorAll('.transport button,#scrub,.transport select,#chapters button').forEach(x=>x.disabled=true);status.textContent='Recording picture + sound… 18 seconds';const stream=canvas.captureStream(30);recordDest.stream.getAudioTracks().forEach(track=>stream.addTrack(track));const rec=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:8000000,audioBitsPerSecond:192000});const chunks=[];rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};const restore=()=>{recording=false;stopAudio();stream.getVideoTracks().forEach(track=>track.stop());({time,playing,speed,soundOn}=old);document.querySelectorAll('.transport button,#scrub,.transport select,#chapters button').forEach(x=>x.disabled=false);btn.disabled=false;setPlaying(playing)};rec.onerror=()=>{status.textContent='Export failed. Please try again.';restore()};rec.onstop=()=>{const url=URL.createObjectURL(new Blob(chunks,{type:mimeType})),a=document.createElement('a');a.href=url;a.download='nanoclaw-host-agent-loop.webm';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent='Exported 1080 × 1920 video with sound.';restore()};finishRecording=()=>{playing=false;recording=false;rec.stop()};render(0);rec.start();prev=performance.now();syncAudio()};
setPlaying(playing);render(0);document.fonts.ready.then(()=>render(time));requestAnimationFrame(frame);
