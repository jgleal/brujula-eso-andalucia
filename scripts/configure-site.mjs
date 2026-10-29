import {readFile,writeFile} from 'node:fs/promises';
const raw=process.argv[2]||process.env.SITE_URL;
if(!raw)throw Error('Indica la URL pública completa (incluida la ruta del repositorio).');
const u=new URL(raw);if(u.protocol!=='https:'||u.search||u.hash||u.username||u.password)throw Error('Usa una URL HTTPS pública sin parámetros.');
const base=u.href.replace(/\/?$/,'/');
for(const file of ['index.html','fuentes.html']){
 let html=await readFile(`dist/${file}`,'utf8');const old=html.match(/<link rel="canonical" href="([^"]+)"/)[1];const oldBase=file==='index.html'?old:old.slice(0,-'fuentes.html'.length);
 html=html.replaceAll(oldBase,base);await writeFile(`dist/${file}`,html);
}
const escape=x=>x.replaceAll('&','&amp;').replaceAll('<','&lt;');
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['','fuentes.html'].map(p=>`<url><loc>${escape(base+p)}</loc></url>`).join('')}</urlset>\n`);
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${base}sitemap.xml\n`);
console.log('Metadatos preparados para '+base);
