import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=async file=>(await readFile(path.join(root,file),'utf8')).replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');
const inputs=['src/index.html','src/styles.css','src/model.js','src/app.js','src/service-worker.js','app-config.js','apps-script/Code.gs','apps-script/Bridge.html','manifest.json','src/theme.css'];
const content=await Promise.all(inputs.map(read));
const version=createHash('sha256').update(content.join('\n')).digest('hex').slice(0,12);
const [template,css,model,app,,config]=content;
const web=template.replace('<!-- APP_STYLES -->','<link rel="stylesheet" href="./src/styles.css?v='+version+'">\n  <link rel="stylesheet" href="./src/theme.css?v='+version+'">')
  .replace('<!-- APP_SCRIPTS -->',['app-config.js','src/model.js','src/app.js'].map(file=>'<script src="./'+file+'?v='+version+'" defer></script>').join('\n  '));
await writeFile(path.join(root,'index.html'),web);
const photo=(await readFile(path.join(root,'assets/chiang-mai.jpg'))).toString('base64');
const gasCss=css.replace("url('../assets/chiang-mai.jpg')","url('data:image/jpeg;base64,"+photo+"')");
let gas=template.replace('<!-- APP_STYLES -->','<style>\n'+gasCss+'\n'+content[9]+'\n</style>')
  .replace('<!-- APP_SCRIPTS -->',[config,model,app].map(code=>'<script>\n'+code.replace(/<\/script/gi,'<\\/script')+'\n</script>').join('\n'));
gas=gas.replace('<link rel="manifest" href="./manifest.json">','')
  .replace(/href="\.\/assets\//g,'href="https://basssg.github.io/TripPlanner/assets/');
await writeFile(path.join(root,'apps-script/index.html'),gas.replace(/[ \t]+$/gm,''));
await writeFile(path.join(root,'service-worker.js'),content[4].replaceAll('__CACHE_VERSION__',version));
console.log('Built GitHub Pages + GAS from the same source. Cache version: '+version);
