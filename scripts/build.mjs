import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=async file=>(await readFile(path.join(root,file),'utf8')).replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');
const inputs=['src/index.html','src/styles.css','src/model.js','src/app.js','src/service-worker.js','app-config.js','apps-script/Code.gs','apps-script/Bridge.html','manifest.json','src/theme.css','src/vendor/leaflet.css','src/vendor/leaflet.js','src/place-picker.js'];
const content=await Promise.all(inputs.map(read));
const assets=['assets/brand-mark.svg','assets/logo-wordmark-dark.svg','assets/icon.svg','assets/icon-180.png','assets/icon-192.png','assets/icon-512.png','assets/favicon.ico','assets/chiang-mai.jpg','offline.html'];
const assetContent=await Promise.all(assets.map(file=>readFile(path.join(root,file))));
const hash=createHash('sha256').update(content.join('\n'));assetContent.forEach(bytes=>hash.update(bytes));
const version=hash.digest('hex').slice(0,12);
const [,css,model,app,,config]=content;
const template=content[0].replaceAll('<!-- BRAND_MARK -->',assetContent[0].toString('utf8').trim())
  .replace('<!-- BRAND_WORDMARK -->',assetContent[1].toString('utf8').trim())
  .replace(/(href="\.\/assets\/[^"?]+)(")/g,'$1?v='+version+'$2');
const web=template.replace('<!-- APP_STYLES -->','<link rel="stylesheet" href="./src/styles.css?v='+version+'">\n  <link rel="stylesheet" href="./src/vendor/leaflet.css?v='+version+'">\n  <link rel="stylesheet" href="./src/theme.css?v='+version+'">')
  .replace('<!-- APP_SCRIPTS -->',['app-config.js','src/model.js','src/vendor/leaflet.js','src/place-picker.js','src/app.js'].map(file=>'<script src="./'+file+'?v='+version+'" defer></script>').join('\n  '));
await writeFile(path.join(root,'index.html'),web);
const photo=(await readFile(path.join(root,'assets/chiang-mai.jpg'))).toString('base64');
const gasCss=css.replace("url('../assets/chiang-mai.jpg')","url('data:image/jpeg;base64,"+photo+"')");
let gas=template.replace('<!-- APP_STYLES -->','<style>\n'+gasCss+'\n'+content[10]+'\n'+content[9]+'\n</style>')
  .replace('<!-- APP_SCRIPTS -->',[config,model,content[11],content[12],app].map(code=>'<script>\n'+code.replace(/<\/script/gi,'<\\/script')+'\n</script>').join('\n'));
gas=gas.replace('<link rel="manifest" href="./manifest.json">','')
  .replace(/href="\.\/assets\/icon\.svg[^\"]*"/,'href="data:image/svg+xml;base64,'+assetContent[2].toString('base64')+'"')
  .replace(/href="\.\/assets\//g,'href="https://basssg.github.io/TripPlanner/assets/');
await writeFile(path.join(root,'apps-script/index.html'),gas.replace(/[ \t]+$/gm,''));
await writeFile(path.join(root,'service-worker.js'),content[4].replaceAll('__CACHE_VERSION__',version));
console.log('Built GitHub Pages + GAS from the same source. Cache version: '+version);
