import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
const pages=['index.html','fuentes.html','calcular-nota-final-eso-andalucia.html'];
const titles=new Set(),descriptions=new Set();
const home=await readFile('dist/index.html','utf8');
const base=home.match(/rel="canonical" href="([^"]+)"/)[1];
const sitemap=await readFile('dist/sitemap.xml','utf8');
for(const file of pages){
 const html=await readFile('dist/'+file,'utf8');
 const title=html.match(/<title>(.*?)<\/title>/)[1],desc=html.match(/name="description" content="([^"]+)"/)[1];
 assert(!titles.has(title),'Duplicate title');titles.add(title);
 assert(!descriptions.has(desc),'Duplicate description');descriptions.add(desc);
 const url=base+(file==='index.html'?'':file);
 assert(html.includes(`rel="canonical" href="${url}"`));assert(html.includes(`property="og:url" content="${url}"`));assert(sitemap.includes(`<loc>${url}</loc>`));
 for(const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs))JSON.parse(m[1]);
 for(const m of html.matchAll(/(?:href|src)="(\.\/[^"?#]*)(?:[?#][^"]*)?"/g))await access('dist/'+(m[1]==='./'?'index.html':m[1].slice(2)));
 assert(!/name="robots" content="noindex/.test(html));
}
const guide=await readFile('dist/calcular-nota-final-eso-andalucia.html','utf8');
assert.equal((guide.match(/<h1>/g)||[]).length,1);
for(const id of ['criterios','competencias','final','aprobar','preguntas'])assert(guide.includes(`id="${id}"`));
assert((await readFile('dist/app.js','utf8')).includes('href="./calcular-nota-final-eso-andalucia.html"'));
console.log('Unique metadata, canonicals, social URLs, sitemap, structured data and local links verified.');
