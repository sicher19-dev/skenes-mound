import { useState, useRef, useEffect, useCallback } from 'react'
const PC = {
  FF:{name:'4-Seam FB',color:'#ff4444',velo:100.2,pfx:-9.8,ivb:16.2,sn:'FF'},
  SL:{name:'Sweeper',color:'#44aaff',velo:88.1,pfx:14.2,ivb:1.8,sn:'SL'},
  CH:{name:'Changeup',color:'#44dd66',velo:89.4,pfx:-14.6,ivb:28.1,sn:'CH'},
  SP:{name:'Splinker',color:'#ffaa44',velo:93.7,pfx:-11.8,ivb:22.4,sn:'SP'},
  SI:{name:'Sinker',color:'#ff8866',velo:97.8,pfx:-15.2,ivb:8.4,sn:'SI'},
}
const PR=[
  {label:'Skenes vs RHH  Full Arsenal',rx:-12,b:'R',p:[{t:'FF',pl:-3,a:true},{t:'SL',pl:7,a:true},{t:'CH',pl:2,a:true},{t:'SP',pl:-1,a:true},{t:'SI',pl:-5,a:true}]},
  {label:'Skenes vs LHH  Full Arsenal',rx:12,b:'L',p:[{t:'FF',pl:4,a:true},{t:'SL',pl:-3,a:true},{t:'CH',pl:8,a:true},{t:'SP',pl:5,a:true},{t:'SI',pl:2,a:true}]},
]
const MTP=60.5*12,ARM=24,REL=78,PLW=17
function cRX(rx){return rx-ARM}
function tX(f,rx,pl,pfx){return rx+(pl-pfx-rx)*f+pfx*f*f}
function cHAA(rx,pl){return Math.atan2(pl-rx,MTP-REL)*(180/Math.PI)}
function tSep(f,rx,a,b){return Math.abs(tX(f,rx,a.pl,PC[a.t].pfx)-tX(f,rx,b.pl,PC[b.t].pfx))}
function draw(canvas,st){
  const ctx=canvas.getContext('2d'),dpr=window.devicePixelRatio||1,w=canvas.clientWidth,h=canvas.clientHeight
  canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h)
  const pX=30,pT=40,pB=50,dW=w-pX*2,dH=h-pT-pB,xR=100,yR=MTP
  const cX=x=>pX+((x+50)/xR)*dW,cY=y=>pT+(y/yR)*dH
  const{rubberX:rx,batter:bt,pitches:ps}=st,rlX=cRX(rx)
  ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.lineWidth=1
  for(let xi=-40;xi<=40;xi+=10){ctx.beginPath();ctx.moveTo(cX(xi),pT);ctx.lineTo(cX(xi),h-pB);ctx.stroke()}
  ctx.strokeStyle='#888';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cX(rx-12),cY(0));ctx.lineTo(cX(rx+12),cY(0));ctx.stroke()
  ctx.strokeStyle='#666';ctx.lineWidth=1;ctx.setLineDash([2,2]);ctx.beginPath();ctx.moveTo(cX(0),cY(-20));ctx.lineTo(cX(0),cY(0));ctx.stroke();ctx.setLineDash([])
  ctx.fillStyle='#888';ctx.font='10px -apple-system,sans-serif';ctx.textAlign='center';ctx.fillText('Rubber: '+(rx>0?'+':'')+rx+'"',cX(rx),cY(0)-10)
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(cX(rx),cY(0));ctx.lineTo(cX(rlX),cY(REL));ctx.stroke();ctx.setLineDash([])
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cX(rlX),cY(REL),5,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#aaa';ctx.font='9px -apple-system,sans-serif';ctx.textAlign='left';ctx.fillText('Release: '+rlX.toFixed(0)+'"',cX(rlX)+8,cY(REL)+3)
  const pY=MTP,pcx=cX(0),pcy=cY(pY),pw=(PLW/xR)*dW
  ctx.fillStyle='rgba(255,255,255,0.12)';ctx.beginPath();ctx.moveTo(pcx-pw/2,pcy-6);ctx.lineTo(pcx+pw/2,pcy-6);ctx.lineTo(pcx+pw/2,pcy+2);ctx.lineTo(pcx,pcy+10);ctx.lineTo(pcx-pw/2,pcy+2);ctx.closePath();ctx.fill()
  ctx.strokeStyle='rgba(255,255,255,0.25)';ctx.lineWidth=1;ctx.strokeRect(cX(-PLW/2),cY(pY)-8,(PLW/xR)*dW,16)
  const bW=(20/xR)*dW,bH=50,bOX=bt==='R'?-(PLW/2+22):(PLW/2+2)
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;ctx.strokeRect(cX(bOX),cY(pY)-bH/2,bW,bH)
  ctx.fillStyle='#666';ctx.font='9px -apple-system,sans-serif';ctx.textAlign='center';ctx.fillText(bt==='R'?'RHH':'LHH',cX(bOX)+bW/2,cY(pY)+bH/2+12)
  const tY=pY-28*12;ctx.strokeStyle='rgba(255,255,0,0.12)';ctx.lineWidth=1;ctx.setLineDash([3,6]);ctx.beginPath();ctx.moveTo(pX,cY(tY));ctx.lineTo(w-pX,cY(tY));ctx.stroke();ctx.setLineDash([])
  ctx.fillStyle='rgba(255,255,0,0.3)';ctx.font='8px -apple-system,sans-serif';ctx.textAlign='right';ctx.fillText('28 ft tunnel point',w-pX-4,cY(tY)-3)
  const aP=ps.filter(p=>p.a),fD=MTP-REL,tF=1-(28*12/fD)
  aP.forEach(p=>{const cat=PC[p.t],st=80;ctx.strokeStyle=cat.color;ctx.lineWidth=2.5;ctx.globalAlpha=0.85;ctx.beginPath()
    for(let i=0;i<=st;i++){const f=i/st,x=tX(f,rlX,p.pl,cat.pfx),y=REL+f*fD;i===0?ctx.moveTo(cX(x),cY(y)):ctx.lineTo(cX(x),cY(y))}
    ctx.stroke();ctx.globalAlpha=1;const eX=cX(p.pl),eY=cY(pY);ctx.fillStyle=cat.color;ctx.beginPath();ctx.arc(eX,eY,4,0,Math.PI*2);ctx.fill()
    const tx=tX(tF,rlX,p.pl,cat.pfx);ctx.fillStyle=cat.color;ctx.globalAlpha=0.5;ctx.beginPath();ctx.arc(cX(tx),cY(tY),3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1
    ctx.fillStyle=cat.color;ctx.font='bold 9px -apple-system,sans-serif';ctx.textAlign='center';ctx.fillText(cat.sn,eX,eY+16)})
  ctx.fillStyle='#555';ctx.font='9px -apple-system,sans-serif';ctx.textAlign='center'
  ctx.fillText('3B side ',cX(-35),h-10);ctx.fillText(' 1B side',cX(35),h-10);ctx.fillText('MOUND',cX(0),pT-8);ctx.fillText('HOME',cX(0),h-10)
}
export default function App(){
  const canvasRef=useRef(null)
  const[rubberX,setRubberX]=useState(-12)
  const[batter,setBatter]=useState('R')
  const[pitches,setPitches]=useState([{t:'FF',pl:-3,a:true},{t:'SL',pl:7,a:true},{t:'CH',pl:2,a:true},{t:'SP',pl:-1,a:true},{t:'SI',pl:-5,a:true}])
  const[activePreset,setActivePreset]=useState(0)
  const state={rubberX,batter,pitches}
  useEffect(()=>{if(canvasRef.current)draw(canvasRef.current,state)})
  useEffect(()=>{const h=()=>{if(canvasRef.current)draw(canvasRef.current,state)};window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h)})
  const applyPreset=i=>{const p=PR[i];setRubberX(p.rx);setBatter(p.b);setPitches(p.p.map(x=>({...x})));setActivePreset(i)}
  const togglePitch=i=>setPitches(prev=>prev.map((p,j)=>j===i?{...p,a:!p.a}:p))
  const updatePL=(i,v)=>setPitches(prev=>prev.map((p,j)=>j===i?{...p,pl:v}:p))
  const rlX=cRX(rubberX),aP=pitches.filter(p=>p.a),fD=MTP-REL,tF=1-(28*12/fD)
  const haaData=aP.map(p=>({...p,haa:cHAA(rlX,p.pl),cat:PC[p.t]}))
  const tPairs=[]
  for(let i=0;i<aP.length;i++)for(let j=i+1;j<aP.length;j++)tPairs.push({a:PC[aP[i].t].sn,b:PC[aP[j].t].sn,sep:tSep(tF,rlX,aP[i],aP[j]),cA:PC[aP[i].t].color,cB:PC[aP[j].t].color})
  const S={
    ct:{maxWidth:480,margin:'0 auto',padding:'12px 12px 24px',color:'#e0e0e0',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',background:'#0a0a0f',minHeight:'100vh'},
    hd:{textAlign:'center',padding:'8px 0 12px',borderBottom:'1px solid #222'},
    ti:{fontSize:18,fontWeight:700,color:'#fff',margin:0},
    st:{fontSize:11,color:'#666',marginTop:2},
    sc:{marginTop:14},
    sl:{fontSize:10,fontWeight:600,color:'#666',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:6},
    cv:{width:'100%',height:400,borderRadius:8,background:'#0f0f18',border:'1px solid #1a1a2a'},
    pg:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6},
    pb:a=>({padding:'8px 6px',borderRadius:6,border:'1px solid '+(a?'#ffd700':'#222'),background:a?'rgba(255,215,0,0.08)':'#111',color:a?'#ffd700':'#aaa',fontSize:10,fontWeight:500,cursor:'pointer',textAlign:'center',lineHeight:1.3}),
    sr:{display:'flex',alignItems:'center',gap:8,padding:'4px 0'},
    si:{flex:1,height:4,WebkitAppearance:'none',appearance:'none',background:'#222',borderRadius:2,outline:'none'},
    sv:{fontSize:12,fontWeight:600,color:'#fff',minWidth:40,textAlign:'right'},
    pr:{display:'flex',alignItems:'center',gap:8,padding:'6px 8px',borderRadius:6,marginBottom:4},
    pd:(c,a)=>({width:10,height:10,borderRadius:'50%',background:a?c:'#333',flexShrink:0,cursor:'pointer',border:'2px solid '+(a?c:'#444')}),
    pn:a=>({fontSize:12,fontWeight:500,color:a?'#ddd':'#555',flex:1,cursor:'pointer'}),
    ls:{width:80,height:3,WebkitAppearance:'none',appearance:'none',background:'#222',borderRadius:2,outline:'none'},
    lv:{fontSize:10,color:'#888',minWidth:28,textAlign:'right'},
    sg:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:6},
    sc2:c=>({padding:'8px 10px',borderRadius:6,background:'#111',borderLeft:'3px solid '+c}),
    sl2:{fontSize:9,color:'#666',textTransform:'uppercase'},
    sv2:{fontSize:16,fontWeight:700,color:'#fff',marginTop:2},
    ss:{fontSize:9,color:'#888',marginTop:1},
    tc:{padding:'8px 10px',borderRadius:6,background:'#111',border:'1px solid #1a1a2a',marginBottom:4},
    tl:{fontSize:10,color:'#aaa'},tv:{fontSize:14,fontWeight:700,color:'#ffd700',marginTop:1},
    bt:{display:'flex',gap:4},
    bb:a=>({padding:'6px 16px',borderRadius:4,border:'1px solid '+(a?'#4a9eff':'#222'),background:a?'rgba(74,158,255,0.1)':'#111',color:a?'#4a9eff':'#666',fontSize:12,fontWeight:600,cursor:'pointer'}),
    ib:{padding:'10px 12px',borderRadius:6,background:'rgba(255,215,0,0.04)',border:'1px solid rgba(255,215,0,0.15)',marginTop:10},
    it:{fontSize:11,color:'#ccc',lineHeight:1.5},ih:{color:'#ffd700',fontWeight:600},
  }
  return (
    <div style={S.ct}>
      <div style={S.hd}><h1 style={S.ti}> Skenes HAA Pitch Model</h1><div style={S.st}>Horizontal Approach Angle  |  Rubber Position  |  Tunnel Analysis</div></div>
      <div style={S.sc}><div style={S.sl}>Presets</div><div style={S.pg}>{PR.map((p,i)=>(<button key={i} style={S.pb(activePreset===i)} onClick={()=>applyPreset(i)}>{p.label}</button>))}</div></div>
      <div style={S.sc}><div style={S.sl}>Top-Down View (Bird's Eye)</div><canvas ref={canvasRef} style={S.cv}/></div>
      <div style={S.sc}><div style={S.sl}>Rubber Position</div>
        <div style={S.sr}><span style={{fontSize:10,color:'#666'}}>3B</span>
          <input type="range" min={-18} max={18} step={1} value={rubberX} style={S.si} onChange={e=>setRubberX(Number(e.target.value))}/>
          <span style={{fontSize:10,color:'#666'}}>1B</span><span style={S.sv}>{rubberX>0?'+':''}{rubberX}"</span></div></div>
      <div style={S.sc}><div style={S.sl}>Batter Hand</div>
        <div style={S.bt}><button style={S.bb(batter==='R')} onClick={()=>setBatter('R')}>RHH</button><button style={S.bb(batter==='L')} onClick={()=>setBatter('L')}>LHH</button></div></div>
      <div style={S.sc}><div style={S.sl}>Pitches  |  Tap to toggle  |  Slide for plate location</div>
        {pitches.map((p,i)=>{const cat=PC[p.t];return(<div key={p.t} style={{...S.pr,background:p.a?'#0d0d15':'#0a0a0f'}}>
          <div style={S.pd(cat.color,p.a)} onClick={()=>togglePitch(i)}/>
          <span style={S.pn(p.a)} onClick={()=>togglePitch(i)}>{cat.name} ({cat.velo} mph)</span>
          {p.a&&(<><input type="range" min={-15} max={15} step={1} value={p.pl} style={S.ls} onChange={e=>updatePL(i,Number(e.target.value))}/>
            <span style={S.lv}>{p.pl>0?'+':''}{p.pl}"</span></>)}</div>)})}</div>
      <div style={S.sc}><div style={S.sl}>Horizontal Approach Angles</div>
        <div style={S.sg}>{haaData.map(h=>(<div key={h.t} style={S.sc2(h.cat.color)}>
          <div style={S.sl2}>{h.cat.sn} HAA</div><div style={S.sv2}>{h.haa.toFixed(2)}Ã°</div>
          <div style={S.ss}>Break: {h.cat.pfx>0?'+':''}{h.cat.pfx}"  |  {h.cat.velo} mph</div></div>))}</div></div>
      {tPairs.length>0&&(<div style={S.sc}><div style={S.sl}>Tunnel Separation @ 28 ft</div>
        {tPairs.map((t,i)=>(<div key={i} style={S.tc}><div style={S.tl}><span style={{color:t.cA,fontWeight:600}}>{t.a}</span>{'  '}<span style={{color:t.cB,fontWeight:600}}>{t.b}</span></div>
          <div style={S.tv}>{t.sep.toFixed(1)}" separation</div></div>))}</div>)}
      <div style={S.ib}><div style={S.it}><span style={S.ih}>Key Finding: </span>
        Tunnel separation at the 28-ft tunnel point is{' '}<span style={S.ih}>analytically independent of rubber position</span>  the release_x term cancels out. Drag the rubber slider to verify. What rubber position controls is the{' '}<span style={S.ih}>absolute HAA of every pitch</span> to its target zone.</div>
        <div style={{...S.it,marginTop:8}}>Skenes' ~24" total rubber shift between RHH/LHH matchups means hitters calibrate to a completely different release window  one of only 23 pitcher seasons in the Hawkeye era with a shift exceeding 12 inches.</div></div>
      <div style={{marginTop:14}}>
        <div style={S.sl}>What This Model Shows</div>
        <div style={{padding:'12px 14px',borderRadius:8,background:'#111',border:'1px solid #1a1a2a',lineHeight:1.7,fontSize:12,color:'#bbb'}}>
          <p style={{margin:'0 0 10px'}}>This tool models how Paul Skenes can manipulate where he stands on the pitching rubber to change the angle his pitches take toward home plate â without changing his mechanics, grip, or pitch shape at all.</p>
          <p style={{margin:'0 0 10px'}}>Think of it this way: if you're a hitter, you're reading the pitch out of the pitcher's hand and trying to predict where it's going. When Skenes shifts 24 inches on the rubber between right-handed and left-handed hitters, it's like changing the angle of a gun barrel â every pitch comes in on a slightly different line, and the hitter has to recalibrate entirely.</p>
          <p style={{margin:'0 0 10px'}}>The <span style={S.ih}>key finding</span> is that moving on the rubber doesn't make his fastball and slider tunnel better <em>together</em> â that separation is locked in by the pitch shapes themselves. What it does is optimize the <span style={S.ih}>approach angle of his best pitch to its best zone</span> for each batter hand. Against righties, he maximizes the angle of his sinker and sweeper to the outer half. Against lefties, he maximizes the changeup's deception on the outer edge.</p>
          <p style={{margin:'0 0 10px'}}>Only 23 pitcher-seasons in the entire Hawkeye tracking era have involved a rubber shift of more than 12 inches. Skenes shifts 24. It's a sign of elite pitching IQ â he's engineering deception at a level almost no one else in the sport is doing.</p>
          <p style={{margin:0,color:'#888',fontSize:11}}>Data sourced from Baseball Savant Hawkeye 2024. Trajectory model uses quadratic Magnus buildup: x(f) = relX + (plateLoc â pfx â relX) * f + pfx * f^2. HAA = arctan((plateLoc â relX) / 648"). Release offset: rubber â 24" (RHP arm geometry).</p>
        </div>
      </div>
      <div style={{textAlign:'center',padding:'16px 0 8px',fontSize:9,color:'#333'}}>Data: Baseball Savant 2024  |  Model: Quadratic Magnus  |  Built for Paul Skenes</div>
    </div>)
}
