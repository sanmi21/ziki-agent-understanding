import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const root=new URL('./dist/',import.meta.url);
const allowed=new Set(['index.html','styles.css','prototype.css','app.js','model.js','logo.svg']);
const types={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',svg:'image/svg+xml'};
createServer(async(req,res)=>{
  const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!allowed.has(file)){res.writeHead(404);res.end('Not found');return;}
  try {const body=await readFile(new URL(file,root));res.writeHead(200,{'Content-Type':types[file.split('.').pop()],'Cache-Control':'no-store'});res.end(body);}
  catch {res.writeHead(500);res.end('Could not read asset');}
}).listen(4180,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4180'));
