import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

const TAU = Math.PI * 2;
const fract = (value) => value - Math.floor(value);
const hash = (value) => fract(Math.sin(value * 127.1 + 311.7) * 43758.5453);
const lerp = (a, b, value) => a + (b - a) * value;
const smooth = (value) => value * value * (3 - 2 * value);
const noise = (value) => { const base=Math.floor(value); const f=value-base; return lerp(hash(base),hash(base+1),smooth(f))*2-1; };
const fbm = (value, octaves=4) => { let result=0, amplitude=.55, normalizer=0; for(let i=0;i<octaves;i+=1){result+=noise(value)*amplitude;normalizer+=amplitude;value*=2.03;amplitude*=.52;} return result/normalizer; };

const mountainLayers = [
  { base:.50, amp:42, scale:.00125, parallax:.055, step:18, top:'#9cc7b2', mid:'#79ac82', bottom:'#5d8d69', alpha:.72, mist:.30 },
  { base:.59, amp:58, scale:.00175, parallax:.095, step:16, top:'#7db66d', mid:'#5f984d', bottom:'#457641', alpha:.86, mist:.20 },
  { base:.70, amp:78, scale:.00235, parallax:.16, step:14, top:'#65a34f', mid:'#4b833b', bottom:'#2f5f33', alpha:.95, mist:.11 },
  { base:.82, amp:98, scale:.00305, parallax:.27, step:12, top:'#5f963f', mid:'#3f742d', bottom:'#1e481f', alpha:1, mist:.04 },
];

export default function AnimatedBackground() {
  const landscapeRef=useRef(null), cloudsRef=useRef(null), birdsRef=useRef(null);
  const reducedMotion=useReducedMotion();

  useEffect(() => {
    const landscape=landscapeRef.current, cloudsCanvas=cloudsRef.current, birdsCanvas=birdsRef.current;
    const ctx=landscape?.getContext('2d',{alpha:false}), cx=cloudsCanvas?.getContext('2d'), bx=birdsCanvas?.getContext('2d');
    if(!ctx||!cx||!bx) return undefined;
    let width=innerWidth,height=innerHeight,dpr=1,frameId=0,last=performance.now(),lastDraw=0,time=0,camera=0,resizeFrame=0;
    const clouds=Array.from({length:14},(_,i)=>({x:hash(i+20)*1900,y:.07+hash(i+44)*.26,scale:.72+hash(i+81)*1.08,speed:.012+hash(i+103)*.026,alpha:.22+hash(i+149)*.2,phase:hash(i+190)*TAU}));
    const birds=[];
    const makeBird=(x,y)=>({x,y,scale:.5+Math.random()*.48,speed:20+Math.random()*20,phase:Math.random()*TAU,alpha:.3+Math.random()*.2});
    const seedBirds=()=>{birds.length=0;for(let flock=0;flock<3;flock+=1){const x=width*(.18+flock*.27),y=height*(.12+Math.random()*.2);for(let i=0;i<3;i+=1)birds.push(makeBird(x+i*25,y+(Math.random()-.5)*24));}};
    const resize=()=>{width=innerWidth;height=innerHeight;dpr=Math.min(devicePixelRatio||1,width<=767?1:1.15);[landscape,cloudsCanvas,birdsCanvas].forEach(canvas=>{canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;});[ctx,cx,bx].forEach(context=>context.setTransform(dpr,0,0,dpr,0,0));seedBirds();};
    const drawSky=()=>{const gradient=ctx.createLinearGradient(0,0,0,height);gradient.addColorStop(0,'#78c8f2');gradient.addColorStop(.33,'#b7e1f5');gradient.addColorStop(.57,'#f6dea5');gradient.addColorStop(.74,'#e7b764');gradient.addColorStop(1,'#6fa66a');ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);if(width>767){const sx=width*.74,sy=height*.23;const glow=ctx.createRadialGradient(sx,sy,0,sx,sy,height*.72);glow.addColorStop(0,'rgba(255,250,211,.66)');glow.addColorStop(.2,'rgba(255,216,120,.24)');glow.addColorStop(.56,'rgba(245,168,0,.07)');glow.addColorStop(1,'rgba(245,168,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);}};
    const drawMountains=()=>{mountainLayers.forEach((layer,index)=>{ctx.save();ctx.globalAlpha=layer.alpha;ctx.beginPath();ctx.moveTo(0,height+40);for(let x=-layer.step;x<=width+layer.step;x+=layer.step){const world=x+camera*layer.parallax;const ridge=fbm(world*layer.scale+index*37.7,3);const sharp=1-Math.abs(fbm(world*layer.scale*.62+index*19,3));ctx.lineTo(x,height*layer.base-ridge*layer.amp-sharp*layer.amp*.45);}ctx.lineTo(width,height+40);ctx.closePath();const fill=ctx.createLinearGradient(0,height*.35,0,height);fill.addColorStop(0,layer.top);fill.addColorStop(.55,layer.mid);fill.addColorStop(1,layer.bottom);ctx.fillStyle=fill;ctx.fill();const mist=ctx.createLinearGradient(0,height*.35,0,height*.9);mist.addColorStop(0,`rgba(245,255,248,${layer.mist})`);mist.addColorStop(1,'rgba(245,255,248,0)');ctx.fillStyle=mist;ctx.fill();ctx.restore();});const foreground=ctx.createLinearGradient(0,height*.76,0,height);foreground.addColorStop(0,'rgba(54,112,43,.52)');foreground.addColorStop(1,'rgba(25,69,28,.88)');ctx.fillStyle=foreground;ctx.beginPath();ctx.moveTo(0,height);for(let x=0;x<=width;x+=18)ctx.lineTo(x,height*.88+fbm((x+camera*.24)*.012,3)*16);ctx.lineTo(width,height);ctx.closePath();ctx.fill();};
    const drawClouds=()=>{cx.clearRect(0,0,width,height);clouds.forEach(cloud=>{const range=width+540,x=(((cloud.x-camera*cloud.speed)%range+range)%range)-270,y=height*cloud.y+Math.sin(time*.16+cloud.phase)*2.4;cx.save();cx.translate(x,y);cx.scale(cloud.scale,cloud.scale);cx.globalAlpha=cloud.alpha;cx.globalCompositeOperation='screen';const fill=cx.createLinearGradient(0,-38,0,42);fill.addColorStop(0,'rgba(255,255,255,.95)');fill.addColorStop(.4,'rgba(255,248,230,.75)');fill.addColorStop(.75,'rgba(255,230,175,.3)');fill.addColorStop(1,'rgba(255,224,162,0)');cx.fillStyle=fill;for(let k=0;k<5;k+=1){cx.beginPath();cx.ellipse((k-2)*42,Math.sin(k+cloud.phase)*7,42+hash(k+cloud.scale)*28,12+hash(k+33)*10,0,0,TAU);cx.fill();}cx.restore();});};
    const drawBirds=(delta)=>{bx.clearRect(0,0,width,height);for(let i=birds.length-1;i>=0;i-=1)if(birds[i].x<-80)birds.splice(i,1);if(Math.random()<delta*.075&&birds.length<14){for(let i=0;i<3;i+=1)birds.push(makeBird(width+60+i*28,height*(.12+Math.random()*.22)));}birds.forEach(bird=>{bird.x-=bird.speed*delta;bird.y+=Math.sin(time*.75+bird.phase)*.06;bird.phase+=delta*3.1;const flap=Math.sin(bird.phase)*2.5*bird.scale,size=8*bird.scale;bx.save();bx.translate(bird.x,bird.y);bx.globalAlpha=bird.alpha;bx.strokeStyle='#24342b';bx.lineWidth=1.2;bx.lineCap='round';bx.beginPath();bx.moveTo(0,0);bx.quadraticCurveTo(size,-size*.62-flap,size*1.9,-1);bx.moveTo(0,0);bx.quadraticCurveTo(-size,-size*.62+flap,-size*1.9,-1);bx.stroke();bx.restore();});};
    const draw=(delta=0)=>{drawSky();drawMountains();drawClouds();drawBirds(delta);};
    const frame=now=>{frameId=requestAnimationFrame(frame);if(document.hidden||now-lastDraw<1000/24)return;lastDraw=now;const delta=Math.min(.04,(now-last)/1000||.016);last=now;if(!reducedMotion&&width>767){time+=delta;camera+=delta*58;}draw(delta);};
    const onResize=()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{resize();draw();});};
    resize();draw();if(!reducedMotion&&width>767)frameId=requestAnimationFrame(frame);addEventListener('resize',onResize,{passive:true});
    return()=>{cancelAnimationFrame(frameId);cancelAnimationFrame(resizeFrame);removeEventListener('resize',onResize);};
  },[reducedMotion]);

  const grainImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.55' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.42'/%3E%3C/svg%3E")`;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#86cbed] opacity-100 transition-opacity duration-500 motion-reduce:transition-none"
      aria-hidden="true"
      data-testid="animated-background"
    >
      <canvas ref={landscapeRef} className="absolute inset-0 h-full w-full" />
      <canvas ref={cloudsRef} className="absolute inset-0 h-full w-full" />
      <canvas ref={birdsRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute right-[8vw] top-[8vh] hidden h-[min(44vw,620px)] w-[min(44vw,620px)] rounded-full md:block bg-[radial-gradient(circle,rgba(255,249,206,.76),rgba(245,168,0,.25)_34%,rgba(245,168,0,.06)_62%,transparent_77%)] mix-blend-screen" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,231,170,.18)_43%,rgba(245,168,0,.1)_60%,rgba(44,107,56,.08))]" />
      <div className="absolute inset-0 shadow-[inset_0_0_8vw_rgba(21,45,62,.16),inset_0_-18vh_18vh_rgba(18,54,28,.15)]" />
      <div
        className="absolute inset-0 opacity-[.035] mix-blend-overlay"
        style={{ backgroundImage: grainImage }}
      />
    </div>
  );
}
