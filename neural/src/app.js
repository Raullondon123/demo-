const $ = id => document.getElementById(id);
const canvas=$('graph'),ctx=canvas.getContext('2d');
const palette={core:[160,237,255],product:[61,218,241],learning:[174,147,252],strategy:[244,181,113],other:[128,182,208]};
const state={nodes:[],links:[],selected:'innovation',zoom:1,panX:0,panY:0,drag:null,hover:null,listening:false,recognition:null,wantsListen:false,speaking:false,thinking:false,voiceOut:true,AI:false,time:0,last:0,w:900,h:700,dpr:1,seq:0,dirty:false,imported:false};
const safeText=x=>String(x||'').replace(/[<>]/g,'').slice(0,300);
const color=(kind,a=1)=>'rgba('+((palette[kind]||palette.other).join(','))+','+a+')';
const find=id=>state.nodes.find(n=>n.id===id);
const byLabel=label=>state.nodes.find(n=>n.label.toLocaleLowerCase('es')===String(label).trim().toLocaleLowerCase('es'));
function setStatus(message){$('live').textContent=message;$('activity').textContent=message.slice(0,55).toUpperCase()}
function mode(x){$('mode').textContent=x;const orb=$('orb');orb.classList.toggle('listening',x==='ESCUCHANDO');orb.classList.toggle('thinking',x==='ANALIZANDO');orb.classList.toggle('talking',x==='RESPONDIENDO')}
function resize(){const rect=canvas.getBoundingClientRect();state.w=rect.width||900;state.h=rect.height||700;state.dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(state.w*state.dpr);canvas.height=Math.round(state.h*state.dpr);ctx.setTransform(state.dpr,0,0,state.dpr,0,0)}
resize();if('ResizeObserver'in window)new ResizeObserver(resize).observe(canvas);
function position(n,t){const w=state.w,h=state.h;return{x:w/2+state.panX+(n.x+Math.sin(t*.00038+n.phase)*4)*state.zoom,y:h/2+state.panY+(n.y+Math.cos(t*.00032+n.phase)*4)*state.zoom}}
function draw(t){
 if(document.hidden){requestAnimationFrame(draw);return}
 state.time=t;const w=state.w,h=state.h;ctx.clearRect(0,0,w,h);
 let bg=ctx.createRadialGradient(w*.53,h*.53,0,w*.53,h*.53,Math.max(w,h)*.6);
 bg.addColorStop(0,'rgba(14,76,101,.11)');bg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 for(let i=0;i<115;i++){let x=(i*73.229+17)%w,y=(i*137.119+13)%h;ctx.fillStyle='rgba(133,203,229,.08)';ctx.fillRect(x,y,1,1)}
 for(const e of state.links){let a=find(e.source),b=find(e.target);if(!a||!b)continue;const A=position(a,t),B=position(b,t),hot=a.id===state.selected||b.id===state.selected;
 const dx=B.x-A.x,dy=B.y-A.y,len=Math.max(1,Math.hypot(dx,dy));let bend=Math.sin(e.phase*7)*Math.min(22,len*.1);let cx=(A.x+B.x)/2-dy/len*bend,cy=(A.y+B.y)/2+dx/len*bend;
 ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.quadraticCurveTo(cx,cy,B.x,B.y);ctx.lineWidth=hot?1.2:.65;ctx.strokeStyle=color(a.kind,hot?.38:.14);ctx.stroke();
 const u=(t*.00009*(e.speed||1)+e.phase)%1;let x=(1-u)*(1-u)*A.x+2*(1-u)*u*cx+u*u*B.x,y=(1-u)*(1-u)*A.y+2*(1-u)*u*cy+u*u*B.y;
 let vx=2*(1-u)*(cx-A.x)+2*u*(B.x-cx),vy=2*(1-u)*(cy-A.y)+2*u*(B.y-cy),vn=Math.max(1,Math.hypot(vx,vy));
 let g=ctx.createLinearGradient(x-vx/vn*19,y-vy/vn*19,x,y);g.addColorStop(0,color(a.kind,0));g.addColorStop(1,color(a.kind,hot?.88:.42));
 ctx.beginPath();ctx.moveTo(x-vx/vn*19,y-vy/vn*19);ctx.lineTo(x,y);ctx.strokeStyle=g;ctx.lineWidth=hot?2:1;ctx.stroke();ctx.shadowBlur=hot?13:7;ctx.shadowColor=color(a.kind,.8);ctx.beginPath();ctx.arc(x,y,hot?1.8:1.05,0,Math.PI*2);ctx.fillStyle=color(a.kind,hot?.95:.48);ctx.fill();ctx.shadowBlur=0;
 }
 let count=state.nodes.length;for(let i=0;i<count;i++){let n=state.nodes[i],p=position(n,t),hot=n.id===state.selected,near=n.id===state.hover,r=hot?6.5:near?5:3.2;
 let gl=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,hot?36:23);gl.addColorStop(0,color(n.kind,hot?.23:.12));gl.addColorStop(1,color(n.kind,0));ctx.beginPath();ctx.arc(p.x,p.y,hot?36:23,0,Math.PI*2);ctx.fillStyle=gl;ctx.fill();
 if(hot){ctx.beginPath();ctx.arc(p.x,p.y,17+Math.sin(t*.002)*2,0,Math.PI*2);ctx.strokeStyle=color(n.kind,.32);ctx.lineWidth=1;ctx.stroke()}
 ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.shadowColor=color(n.kind,1);ctx.shadowBlur=hot?22:13;ctx.fillStyle=hot?'#dcffff':color(n.kind,1);ctx.fill();ctx.shadowBlur=0;
 if((count>350&&!hot&&!near)|| (state.zoom<.65&&!hot&&!near))continue;
 ctx.textAlign='center';ctx.font=(hot?'600 12px':'400 10px')+' system-ui';let width=ctx.measureText(n.label).width;ctx.fillStyle='rgba(4,13,24,.74)';ctx.fillRect(p.x-width/2-5,p.y+12,width+10,18);ctx.fillStyle=hot?'#edffff':'#aac7d7';ctx.fillText(n.label,p.x,p.y+25);
 }
 requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
function hit(x,y){for(let i=state.nodes.length-1;i>=0;i--){let p=position(state.nodes[i],state.time);if(Math.hypot(x-p.x,y-p.y)<19)return state.nodes[i].id}return null}
function coords(e){let b=canvas.getBoundingClientRect();return{x:e.clientX-b.left,y:e.clientY-b.top}}
canvas.addEventListener('pointerdown',e=>{let p=coords(e),id=hit(p.x,p.y),n=id?find(id):null;state.drag={id,x:p.x,y:p.y,nx:n?.x||0,ny:n?.y||0,px:state.panX,py:state.panY,moved:false};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{let p=coords(e),d=state.drag;state.hover=hit(p.x,p.y);if(!d)return;let dx=p.x-d.x,dy=p.y-d.y;if(Math.abs(dx)+Math.abs(dy)>3)d.moved=true;if(d.id){let n=find(d.id);n.x=d.nx+dx/state.zoom;n.y=d.ny+dy/state.zoom;state.dirty=true}else{state.panX=d.px+dx;state.panY=d.py+dy}});
canvas.addEventListener('pointerup',()=>{let d=state.drag;if(d&&!d.moved&&d.id)select(d.id);if(d?.moved&&d.id)scheduleSave();state.drag=null});canvas.addEventListener('pointercancel',()=>state.drag=null);
canvas.addEventListener('wheel',e=>{e.preventDefault();state.zoom=Math.max(.3,Math.min(3,state.zoom*(e.deltaY<0?1.12:.89)))},{passive:false});
$('zoomIn').onclick=()=>state.zoom=Math.min(3,state.zoom*1.2);$('zoomOut').onclick=()=>state.zoom=Math.max(.3,state.zoom/1.2);
$('center').onclick=()=>{state.zoom=1;state.panX=0;state.panY=0};$('reset').onclick=$('center').onclick;
function select(id){let n=find(id);if(!n)return;state.selected=id;$('focus').textContent=n.label;$('cluster').textContent=(n.kind||'other').toUpperCase();let links=state.links.filter(e=>e.source===id||e.target===id);$('subtitle').textContent=links.length+' conexiones · '+(n.source==='demo'?'Dato de ejemplo':n.source==='chatgpt'?'Conversación importada':n.source==='ai'?'Hipótesis de IA':'Concepto creado');$('detail').textContent=n.description||'Explora este concepto a través de su red de relaciones.';$('stats').textContent=state.nodes.length+' NODOS · '+state.links.length+' CONEXIONES'}
let saveTimer=null;
function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(save,700)}
async function save(){try{await fetch('/api/graph',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nodes:state.nodes,links:state.links})});state.dirty=false}catch{setStatus('No se pudo guardar en el disco local.')}}
function addNode(label,kind='other',source='user',parent=state.selected,description=''){
 label=safeText(label).trim();if(!label)return null;let existing=byLabel(label);if(existing){if(parent&&existing.id!==parent)addLink(parent,existing.id,'user');return existing}
 let p=find(parent)||find('innovation')||{x:0,y:0},i=++state.seq,theta=i*2.3999632297;
 let n={id:'n-'+Date.now().toString(36)+'-'+i,label,kind,source,description,x:p.x+Math.cos(theta)*(100+i%5*13),y:p.y+Math.sin(theta)*(100+i%5*13),phase:Math.random()*6};
 state.nodes.push(n);if(p.id)addLink(p.id,n.id,source);select(n.id);scheduleSave();return n;
}
function addLink(a,b,origin='user',reason='',confidence=null){if(!a||!b||a===b||state.links.some(e=>(e.source===a&&e.target===b)||(e.source===b&&e.target===a)))return;state.links.push({source:a,target:b,origin,reason,confidence,phase:Math.random(),speed:.6+Math.random()});scheduleSave()}
function context(){let n=find(state.selected);return[n?.label,...state.links.filter(e=>e.source===state.selected||e.target===state.selected).slice(0,10).map(e=>find(e.source===state.selected?e.target:e.source)?.label)].filter(Boolean)}
function speak(text){if(!state.voiceOut||!('speechSynthesis'in window))return;state.speaking=true;mode('RESPONDIENDO');try{window.speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(text);u.lang='es-PE';u.rate=1.04;u.pitch=1;let voices=window.speechSynthesis.getVoices(),spanish=voices.find(v=>v.lang.toLowerCase().startsWith('es'));if(spanish)u.voice=spanish;u.onend=()=>{state.speaking=false;mode(state.wantsListen?'ESCUCHANDO':'MODO EXPLORACIÓN');if(state.wantsListen)restartRecognition()};u.onerror=u.onend;window.speechSynthesis.speak(u)}catch{state.speaking=false}}
function pauseRecognition(){try{state.recognition?.stop()}catch{}}
function extractIntent(text){const s=text.toLowerCase();if(/^(explora|abre|profundiza|muéstrame|muestrame)\b/.test(s)){let n=state.nodes.find(n=>s.includes(n.label.toLowerCase()));if(n){select(n.id);return true}}if(/^(conecta|relaciona)\b/.test(s)){let found=state.nodes.filter(n=>s.includes(n.label.toLowerCase())).slice(0,2);if(found.length===2){addLink(found[0].id,found[1].id);select(found[0].id);setStatus('He conectado '+found[0].label+' con '+found[1].label);return true}}return false}
async function processIdea(text){text=safeText(text).trim();if(!text)return;state.thinking=true;mode('ANALIZANDO');setStatus('Analizando: '+text);pauseRecognition();if('speechSynthesis'in window)window.speechSynthesis.cancel();
 if(extractIntent(text)){state.thinking=false;mode('MODO EXPLORACIÓN');speak('He abierto esa conexión. Podemos seguir explorando.');return}
 try{let r=await fetch('/api/think',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,context:context()})});if(!r.ok)throw new Error('Ollama sin respuesta');let x=await r.json();let root=state.selected,conceptNodes=[];
 for(const c of x.concepts||[]){let n=addNode(c.label,c.kind||'other','ai',root,'Concepto propuesto por la IA a partir de: '+text);if(n)conceptNodes.push(n)}
 for(const rel of x.relations||[]){let a=byLabel(rel.from),b=byLabel(rel.to);if(a&&b)addLink(a.id,b.id,'ai',rel.reason,rel.confidence)}
 if(conceptNodes.length)select(conceptNodes[0].id);
 setStatus(x.reply||'La red ha incorporado nuevas conexiones.');state.thinking=false;mode('MODO EXPLORACIÓN');speak(x.reply||'He conectado nuevas ideas.');
 if(!state.voiceOut&&state.wantsListen)restartRecognition();
 }catch{let m=text.match(/[\p{L}\p{N}][\p{L}\p{N}\s-]{2,48}/u)?.[0]||text;addNode(m,'other','user');setStatus('He añadido tu idea. La inteligencia local no responde; inicia Ollama para generar relaciones semánticas.');state.thinking=false;mode('SIN IA LOCAL');if(state.wantsListen)restartRecognition()}
}
$('send').onclick=()=>{let v=$('idea').value.trim();$('idea').value='';processIdea(v)};$('idea').addEventListener('keydown',e=>{if(e.key==='Enter')$('send').click()});
$('sound').onclick=()=>{state.voiceOut=!state.voiceOut;$('sound').textContent='VOZ DE SALIDA: '+(state.voiceOut?'SÍ':'NO');$('sound').classList.toggle('on',state.voiceOut);$('sound').setAttribute('aria-pressed',state.voiceOut?'true':'false');if(!state.voiceOut&&'speechSynthesis'in window)window.speechSynthesis.cancel()};
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let retryTimer=null;
function restartRecognition(){if(!state.wantsListen||state.thinking||state.speaking)return;if(!SR)return;clearTimeout(retryTimer);retryTimer=setTimeout(()=>{if(!state.wantsListen||state.thinking||state.speaking)return;try{let rec=new SR();state.recognition=rec;rec.lang='es-PE';rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=1;rec.onresult=e=>{let finals=[];let draft='';for(let i=e.resultIndex;i<e.results.length;i++){let txt=e.results[i][0].transcript;if(e.results[i].isFinal)finals.push(txt);else draft+=txt}if(draft)setStatus('Escuchando: '+draft);if(finals.length)processIdea(finals.join(' '))};rec.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){stopListening();setStatus('Micrófono bloqueado por el navegador ('+e.error+'). Abre NEURAL en localhost y concede permiso, o usa otro navegador.')}else setStatus('Reconocimiento: '+e.error)};rec.onend=()=>{if(state.wantsListen&&!state.thinking&&!state.speaking)restartRecognition()};rec.start();mode('ESCUCHANDO');setStatus('Escucha continua activada. Habla sobre una idea o di «explora» seguido de un concepto.')}catch(e){setStatus('No se pudo iniciar el micrófono: '+e.message)}},300)}
function stopListening(){state.wantsListen=false;clearTimeout(retryTimer);pauseRecognition();$('mic').classList.remove('active');$('micLabel').textContent='INICIAR CONVERSACIÓN';mode('MODO EXPLORACIÓN')}
$('mic').onclick=()=>{if(state.wantsListen){stopListening();setStatus('Conversación detenida.');return}if(!SR){setStatus('Este navegador no dispone de reconocimiento continuo. En Mac prueba Chrome; para voz íntegramente local se requiere instalar Whisper.');return}state.wantsListen=true;$('mic').classList.add('active');$('micLabel').textContent='DETENER CONVERSACIÓN';restartRecognition()};
async function importChatGPT(file){if(!file)return;try{
 if(file.size>120_000_000)throw new Error('Archivo demasiado grande para esta versión; divide la exportación.');
 setStatus('Analizando conversaciones localmente…');const obj=JSON.parse(await file.text());
 if(!Array.isArray(obj))throw new Error('Selecciona conversations.json de la exportación de ChatGPT.');
 const stopwords=new Set('para como este esta estos estas sobre desde entre donde cuando porque aunque hasta pero muy todo todos todas tener hacer puede puedo quieres quiero seria tener cual esto aquello ahora alguna alguno algunos algunas entonces mas menos estan estoy eres somos hemos nuestras nuestro nuestra unos unas esos esas año algo alguien quien que del las los una uno por con sin sus era sido hay aqui hacia antes despues mucho muchos tipo solo nuevo nueva haces dice dijo dame muestra diseño imagen version analiza piensa consulta proyecto proyectos trabajo conversaciones usuario asistente chatgpt chat'.split(' '));
 const tokenize=str=>String(str||'').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').match(/[a-z][a-z0-9]{4,}/g)?.filter(w=>!stopwords.has(w))||[];
 const docs=obj.slice(0,1200).map((chat,i)=>{
  const title=safeText(chat.title).trim(),texts=[];let len=0;
  for(const node of Object.values(chat.mapping||{})){
   const message=node?.message;if(!message||message.author?.role!=='user')continue;
   for(const p of message.content?.parts||[])if(typeof p==='string'){texts.push(p);len+=p.length}
   if(len>9000)break;
  }
  const excerpt=texts.join(' ').slice(0,9000),words=tokenize(title+' '+excerpt),freq=new Map();
  for(const w of words)freq.set(w,(freq.get(w)||0)+1);
  return{id:'chat-'+String(chat.id||i).replace(/[^\w-]/g,'').slice(0,100),title,freq,preview:safeText(excerpt.slice(0,290))};
 }).filter(d=>d.title.length>=3);
 const df=new Map();for(const d of docs)for(const w of d.freq.keys())df.set(w,(df.get(w)||0)+1);
 const vocabulary=new Set([...df.entries()].filter(([w,n])=>n>=2&&n<=docs.length*.4).sort((a,b)=>b[1]-a[1]).slice(0,220).map(x=>x[0]));
 let added=0,connections=0;
 for(const d of docs){
  if(find(d.id))continue;
  const i=state.seq++,a=i*2.39996;
  state.nodes.push({id:d.id,label:d.title.slice(0,105),kind:'strategy',source:'chatgpt',description:'Conversación importada. Fragmento: '+d.preview,x:Math.cos(a)*(100+Math.sqrt(i)*16),y:Math.sin(a)*(100+Math.sqrt(i)*16),phase:a});
  addLink('innovation',d.id,'chatgpt');added++;
  const terms=[...d.freq.entries()].filter(([w])=>vocabulary.has(w)).map(([w,tf])=>({w,score:(1+Math.log(tf))*Math.log(1+docs.length/(1+(df.get(w)||1)))})).sort((a,b)=>b.score-a.score).slice(0,3);
  for(const {w} of terms){
   const tid='topic-'+w;let n=find(tid);
   if(!n){const k=state.seq++,phi=k*2.39996;n={id:tid,label:w,kind:'other',source:'chatgpt',description:'Concepto recurrente. La relación indica coocurrencia, no causalidad.',x:Math.cos(phi)*(100+Math.sqrt(k)*16),y:Math.sin(phi)*(100+Math.sqrt(k)*16),phase:phi};state.nodes.push(n)}
   addLink(d.id,tid,'cooccurrence','Palabra recurrente en la conversación');connections++;
  }
 }
 state.imported=true;$('source').textContent='FUENTES: CHATGPT IMPORTADO';
 $('stats').textContent=state.nodes.length+' NODOS · '+state.links.length+' CONEXIONES';
 setStatus('Importadas '+added+' conversaciones y '+connections+' relaciones por coocurrencia. No se ha enviado tu historial a servicios externos.');scheduleSave();
 }catch(e){setStatus('No se pudo importar: '+e.message)}}
$('import').onclick=()=>$('file').click();$('file').onchange=e=>{importChatGPT(e.target.files?.[0]);e.target.value=''};
async function init(){try{let r=await fetch('/api/graph');let g=await r.json();state.nodes=g.nodes.map((n,i)=>({...n,phase:i*.74}));state.links=g.links.map((e,i)=>({...e,phase:typeof e.phase==='number'?e.phase:i*.271,speed:e.speed||1}));state.seq=state.nodes.length;state.imported=state.nodes.some(n=>n.source==='chatgpt');if(state.imported)$('source').textContent='FUENTES: CHATGPT IMPORTADO';select(find(state.selected)?state.selected:state.nodes[0]?.id)}catch(e){setStatus('No se pudo cargar la red: '+e.message)}
 try{let r=await fetch('/api/health');let data=await r.json();state.AI=data.online;$('engine').textContent=data.online?'OLLAMA LOCAL CONECTADO':'OLLAMA NO CONECTADO';$('engine').style.color=data.online?'#75ebbc':'#edc28c'}catch{$('engine').textContent='SERVIDOR SIN RESPUESTA'}
}
init();
