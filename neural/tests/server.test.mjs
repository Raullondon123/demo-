import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const port=42871,host='http://127.0.0.1:'+port;
test('Servidor local NEURAL: salud, grafo y archivos',async t=>{
 const child=spawn(process.execPath,['server.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,PORT:String(port),OLLAMA_URL:'http://127.0.0.1:1'},stdio:'ignore'});
 t.after(()=>child.kill());
 let ready=false;
 for(let i=0;i<40;i++){try{let r=await fetch(host+'/api/health');if(r.ok){ready=true;break}}catch{}await sleep(100)}
 assert.equal(ready,true,'el servidor debe iniciar');
 let health=await (await fetch(host+'/api/health')).json();
 assert.equal(health.local,true);
 let graph=await (await fetch(host+'/api/graph')).json();
 assert.ok(graph.nodes.length>=5);
 assert.ok(graph.links.length>=5);
 let page=await fetch(host+'/');
 assert.equal(page.status,200);
 assert.match(await page.text(),/NEURAL/);
 let app=await fetch(host+'/src/app.js');
 assert.equal(app.status,200);
 let invalid=await fetch(host+'/api/graph',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nodes:null,links:[]})});
 assert.equal(invalid.status,500);
 let badPath=await fetch(host+'/package.json');
 assert.equal(badPath.status,404);
 let missing=await fetch(host+'/api/think',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:'conecta pedagogía y materiales'})});
 assert.equal(missing.status,503,'sin Ollama debe informar indisponibilidad, no simular IA');
});
