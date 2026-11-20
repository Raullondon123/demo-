import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { extname, resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4173);
const DATA_FILE = join(ROOT, 'data', 'graph.json');
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const MODEL = process.env.NEURAL_MODEL || 'qwen3:4b';
const MIME = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
function reply(res,code,payload){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(payload))}
function body(req,max=2_000_000){return new Promise((resolve,reject)=>{let chunks=[],size=0;req.on('data',chunk=>{size+=chunk.length;if(size>max){reject(new Error('Solicitud demasiado grande'));req.destroy();return}chunks.push(chunk)});req.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))}catch{reject(new Error('JSON inválido'))}});req.on('error',reject)})}
const seed={
 nodes:[
{id:'innovation',label:'Innovación',kind:'core',x:0,y:0,source:'demo'},
{id:'sensory',label:'Cuaderno sensorial',kind:'product',x:-165,y:40,source:'demo'},
{id:'texture',label:'Relieves y texturas',kind:'product',x:-275,y:116,source:'demo'},
{id:'attention',label:'Atención',kind:'learning',x:120,y:-85,source:'demo'},
{id:'ritual',label:'Ritual de inicio',kind:'learning',x:250,y:-120,source:'demo'},
{id:'junior',label:'Junior Lab',kind:'learning',x:60,y:-225,source:'demo'},
{id:'brand',label:'Standford',kind:'strategy',x:115,y:140,source:'demo'},
{id:'consumer',label:'Consumidor',kind:'strategy',x:-75,y:240,source:'demo'},
{id:'production',label:'Fabricación',kind:'product',x:-268,y:-105,source:'demo'}
 ],links:[
{source:'innovation',target:'sensory',origin:'demo'},{source:'innovation',target:'attention',origin:'demo'},
{source:'innovation',target:'junior',origin:'demo'},{source:'innovation',target:'brand',origin:'demo'},
{source:'innovation',target:'consumer',origin:'demo'},{source:'sensory',target:'texture',origin:'demo'},
{source:'sensory',target:'attention',origin:'demo'},{source:'sensory',target:'production',origin:'demo'},
{source:'attention',target:'ritual',origin:'demo'},{source:'brand',target:'consumer',origin:'demo'}
 ]};
async function getGraph(){try{let graph=JSON.parse(await readFile(DATA_FILE,'utf8'));return validate(graph)}catch{return structuredClone(seed)}}
function validate(g){if(!g||!Array.isArray(g.nodes)||!Array.isArray(g.links)||g.nodes.length>10000||g.links.length>30000)throw new Error('Grafo inválido');g.nodes=g.nodes.filter(n=>typeof n.id==='string'&&typeof n.label==='string').map(n=>({...n,id:n.id.slice(0,140),label:n.label.slice(0,150),x:Number(n.x)||0,y:Number(n.y)||0}));let ids=new Set(g.nodes.map(n=>n.id));g.links=g.links.filter(l=>ids.has(l.source)&&ids.has(l.target));return g}
async function analyze(text,context){const prompt=`Eres el motor de conocimiento de NEURAL, una red de ideas en español. Responde SIEMPRE con JSON plano, sin markdown. Estructura: {"reply":"respuesta oral clara en español, máximo 65 palabras","concepts":[{"label":"concepto corto","kind":"product|learning|strategy|other"}],"relations":[{"from":"concepto","to":"concepto","reason":"justificación concisa","confidence":0.0}]}. Extrae entre 1 y 5 conceptos centrales del mensaje; conecta ideas justificadamente, no inventes hechos; los enlaces son hipótesis cuando no existe evidencia. Contexto ya conocido: ${JSON.stringify(context).slice(0,3000)}. Usuario: ${text.slice(0,2500)}`;
const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),60000);
try{
 const r=await fetch(OLLAMA_URL+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:MODEL,prompt,stream:false,format:'json',options:{temperature:.35,num_predict:500}}),signal:controller.signal});
 if(!r.ok)throw new Error('Ollama HTTP '+r.status);
 const j=await r.json();let x=JSON.parse(j.response);
 return {reply:String(x.reply||'He identificado nuevas ideas.').slice(0,900),
 concepts:(Array.isArray(x.concepts)?x.concepts:[]).slice(0,8).filter(c=>c&&typeof c.label==='string').map(c=>({label:c.label.slice(0,80),kind:['product','learning','strategy','other'].includes(c.kind)?c.kind:'other'})),
 relations:(Array.isArray(x.relations)?x.relations:[]).slice(0,12).filter(r=>r&&typeof r.from==='string'&&typeof r.to==='string').map(r=>({from:r.from.slice(0,80),to:r.to.slice(0,80),reason:String(r.reason||'Relación propuesta').slice(0,180),confidence:Math.max(0,Math.min(1,Number(r.confidence)||0))})),engine:'ollama'};
}finally{clearTimeout(timer)}
}
const app=http.createServer(async(req,res)=>{
try{
 const u=new URL(req.url,'http://localhost');
 if(req.method==='GET'&&u.pathname==='/api/health'){
  let online=false;try{const c=new AbortController();const timer=setTimeout(()=>c.abort(),1200);try{online=(await fetch(OLLAMA_URL+'/api/tags',{signal:c.signal})).ok}finally{clearTimeout(timer)}}catch{}
  return reply(res,200,{online,model:MODEL,local:true,voice:'browser'});
 }
 if(req.method==='GET'&&u.pathname==='/api/graph')return reply(res,200,await getGraph());
 if(req.method==='POST'&&u.pathname==='/api/graph'){let g=validate(await body(req,3_000_000));await mkdir(dirname(DATA_FILE),{recursive:true});await writeFile(DATA_FILE,JSON.stringify(g));return reply(res,200,{saved:true,nodes:g.nodes.length,links:g.links.length})}
 if(req.method==='POST'&&u.pathname==='/api/think'){let x=await body(req,12000);if(typeof x.text!=='string'||!x.text.trim())return reply(res,400,{error:'No se recibió texto'});try{return reply(res,200,await analyze(x.text,x.context||[]))}catch(e){return reply(res,503,{error:'IA local no disponible. Comprueba Ollama y el modelo.',detail:String(e.message||e)})}}
 if(req.method!=='GET')return reply(res,405,{error:'Método no permitido'});
 let path=u.pathname==='/'?'/index.html':u.pathname;
 if(path.includes('..')||path.includes('\\')||/\0/.test(path))return reply(res,403,{error:'Ruta no permitida'});
 let allowed=['/index.html','/src/app.js','/src/style.css'];
 if(!allowed.includes(path))return reply(res,404,{error:'No encontrado'});
 let f=resolve(ROOT,'.'+path);let content=await readFile(f);res.writeHead(200,{'Content-Type':MIME[extname(f)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});res.end(content);
}catch(err){reply(res,500,{error:String(err.message||err)})}
});
app.listen(PORT,'127.0.0.1',()=>console.log('NEURAL en http://localhost:'+PORT));
export { validate };
