// Offline renderer: use the same canvas choreography and audio score as the player.
const fs=require('node:fs');
const vm=require('node:vm');
const {spawn}=require('node:child_process');
const {once}=require('node:events');
const {createCanvas,GlobalFonts}=require('@napi-rs/canvas');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const canvas=createCanvas(1080,1920);
const els=new Map();
const dummy=()=>({style:{},classList:{toggle(){}},setAttribute(){},append(){},insertBefore(){},value:0,textContent:'',disabled:false});
function element(id){if(id==='film')return canvas;if(!els.has(id))els.set(id,dummy());return els.get(id)}
const sandbox={console,performance:{now:()=>0},matchMedia:()=>({matches:true}),document:{getElementById:element,querySelector:()=>dummy(),querySelectorAll:()=>[],createElement:()=>dummy(),addEventListener(){},fonts:{ready:Promise.resolve()}},requestAnimationFrame(){},setTimeout,Float32Array,Math,window:{}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(root,'animation.js'),'utf8'),sandbox);
const sr=48000,channels=[new Float32Array(sr*30),new Float32Array(sr*30)];sandbox.offlineContext={sampleRate:sr,createBuffer:()=>({getChannelData:i=>channels[i]})};vm.runInContext('makeScore(offlineContext)',sandbox);
const wav=Buffer.alloc(44+sr*30*4);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(sr,24);wav.writeUInt32LE(sr*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(wav.length-44,40);let peak=0;for(let i=0;i<sr*30;i++)for(let c=0;c<2;c++){const v=channels[c][i]*.8;peak=Math.max(peak,Math.abs(v));wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,v))*32767),44+(i*2+c)*2)}fs.writeFileSync(path.join(root,'exports/soundtrack.wav'),wav);console.log(`Soundtrack peak: ${peak.toFixed(3)} (${(20*Math.log10(peak)).toFixed(1)} dBFS)`);
(async()=>{const out=path.join(root,'exports/nanoclaw-host-agent-loop.mp4');const ff=spawn('ffmpeg',['-y','-hide_banner','-loglevel','warning','-f','rawvideo','-pixel_format','rgba','-video_size','1080x1920','-framerate','30','-i','pipe:0','-i',path.join(root,'exports/soundtrack.wav'),'-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart','-shortest',out],{stdio:['pipe','inherit','inherit']});const done=once(ff,'close');for(let i=0;i<900;i++){sandbox.frameTime=i/30;vm.runInContext('render(frameTime)',sandbox);if(i===450)fs.writeFileSync(path.join(root,'exports/poster.png'),canvas.toBuffer('image/png'));const data=canvas.getContext('2d').getImageData(0,0,1080,1920).data;if(!ff.stdin.write(Buffer.from(data.buffer,data.byteOffset,data.byteLength)))await once(ff.stdin,'drain');if(i%150===0)console.log(`Rendered ${i}/900 frames`)}ff.stdin.end();const [code]=await done;if(code!==0)throw Error(`ffmpeg exited ${code}`);console.log(out)})().catch(e=>{console.error(e);process.exit(1)});
