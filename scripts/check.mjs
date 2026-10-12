import {readFile,access} from 'node:fs/promises';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const file of ['src/app.js','src/model.js','app-config.js','service-worker.js','scripts/build.mjs','scripts/serve.mjs'])execFileSync(process.execPath,['--check',path.join(root,file)],{stdio:'pipe'});
new vm.Script(await readFile(path.join(root,'apps-script/Code.gs'),'utf8'));
for(const file of ['manifest.json','apps-script/appsscript.json','.clasp.json'])JSON.parse((await readFile(path.join(root,file),'utf8')).replace(/^\uFEFF/,''));
const manifest=JSON.parse((await readFile(path.join(root,'manifest.json'),'utf8')).replace(/^\uFEFF/,''));
if(manifest.start_url!=='./'||manifest.scope!=='./')throw new Error('PWA must stay inside the project scope');
for(const icon of manifest.icons){await access(path.join(root,icon.src));const bytes=await readFile(path.join(root,icon.src));const size=Number(icon.sizes.split('x')[0]);if(bytes.readUInt32BE(16)!==size||bytes.readUInt32BE(20)!==size)throw new Error('Incorrect PNG icon dimensions');}
const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(f=>/\.(js|gs|html|md|json|css|mjs|yml)$/.test(f));
for(const file of files){const text=await readFile(path.join(root,file),'utf8');if(/AIza[A-Za-z0-9_-]{25,}|sk-or-v1-[A-Za-z0-9]{32,}|gh[pousr]_[A-Za-z0-9]{32,}/.test(text))throw new Error('Possible secret detected in '+file);}
const html=await readFile(path.join(root,'index.html'),'utf8');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);if(new Set(ids).size!==ids.length)throw new Error('Duplicate HTML id');
if(html.includes('APP_SCRIPTS')||html.includes('APP_STYLES'))throw new Error('Build output missing');
const sw=await readFile(path.join(root,'service-worker.js'),'utf8');if(sw.includes('__CACHE_VERSION__'))throw new Error('Worker version missing');
console.log('Syntax, manifests, icons, build output, unique IDs and secret scan passed ('+files.length+' text files).');
