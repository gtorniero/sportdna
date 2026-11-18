import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = root;
const target = join(root, 'dist', 'site');
const directories = ['apps', 'assets', 'blog', 'como-ganhamos-dinheiro', 'contato', 'content', 'ferramentas', 'guias', 'privacidade', 'racket', 'run', 'sobre', 'surf', 'tenis', 'termos'];
const files = ['index.html', '404.html', 'ads.txt', 'favicon.ico', 'medicao.html', 'robots.txt', 'sitemap.xml', '_headers'];
const allowed = /\.(html|css|js|json|svg|png|jpe?g|webp|gif|ico|avif|woff2?|ttf|otf)$/i;
if (existsSync(target)) rmSync(target, { recursive: true });
mkdirSync(target, {recursive:true});
const manifest = [];
function copy(file) {
  const name = relative(source, file);
  if (name === 'assets/products' || name.startsWith('assets/products/')) return;
  if (name.split('/').some(part => part.startsWith('.') || part === 'tools')) return;
  if (statSync(file).isDirectory()) {
    for (const child of readdirSync(file)) copy(join(file, child));
    return;
  }
  if (!allowed.test(name) && !['ads.txt', 'robots.txt', 'sitemap.xml', '_headers'].includes(name)) return;
  const destination = join(target, name);
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(file, destination);
  const content = readFileSync(file);
  manifest.push({ path: name, bytes: content.length, sha256: createHash('sha256').update(content).digest('hex') });
}
for (const entry of [...directories, ...files]) copy(join(source, entry));
// Product originals are stored losslessly as text for batch GitHub imports.
// Only decoded WebP files enter the public package; no image transformation.
const productSources = join(source, 'source-assets', 'products');
if (existsSync(productSources)) for (const file of readdirSync(productSources).sort()) {
  if (file === 'README.md') continue;
  if (!/^MLB\d+\.webp\.b64$/.test(file)) throw new Error('Invalid product source: '+file);
  const encoded = readFileSync(join(productSources, file), 'utf8').trim();
  const content = Buffer.from(encoded, 'base64');
  if (content.toString('base64') !== encoded || content.toString('ascii',0,4) !== 'RIFF' || content.toString('ascii',8,12) !== 'WEBP') throw new Error('Invalid WebP: '+file);
  const name = 'assets/products/'+file.slice(0,-4);
  const destination = join(target, name);
  mkdirSync(dirname(destination), {recursive:true});
  writeFileSync(destination, content);
  manifest.push({path:name,bytes:content.length,sha256:createHash('sha256').update(content).digest('hex')});
}
manifest.sort((a, b) => a.path.localeCompare(b.path));
writeFileSync(join(root, 'dist', 'asset-manifest.json'), JSON.stringify({ source: 'current-checkout', files: manifest }, null, 2) + '\n');
console.log(JSON.stringify({ files: manifest.length, bytes: manifest.reduce((n, f) => n + f.bytes, 0), source: 'current-checkout' }));
