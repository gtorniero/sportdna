import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = root;
const target = join(root, 'dist', 'site');
const directories = ['apps', 'assets', 'blog', 'content', 'ferramentas', 'guias', 'privacidade', 'racket', 'run', 'surf', 'tenis'];
const files = ['index.html', '404.html', 'favicon.ico', 'medicao.html', 'robots.txt', 'sitemap.xml'];
const allowed = /\.(html|css|js|json|svg|png|jpe?g|webp|gif|ico|avif|woff2?|ttf|otf)$/i;
if (existsSync(target)) rmSync(target, { recursive: true });
mkdirSync(target, {recursive:true});
const manifest = [];
function copy(file) {
  const name = relative(source, file);
  if (name.split('/').some(part => part.startsWith('.') || part === 'tools')) return;
  if (statSync(file).isDirectory()) {
    for (const child of readdirSync(file)) copy(join(file, child));
    return;
  }
  if (!allowed.test(name) && !['robots.txt', 'sitemap.xml'].includes(name)) return;
  const destination = join(target, name);
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(file, destination);
  const content = readFileSync(file);
  manifest.push({ path: name, bytes: content.length, sha256: createHash('sha256').update(content).digest('hex') });
}
for (const entry of [...directories, ...files]) copy(join(source, entry));
manifest.sort((a, b) => a.path.localeCompare(b.path));
writeFileSync(join(root, 'dist', 'asset-manifest.json'), JSON.stringify({ source: 'current-checkout', files: manifest }, null, 2) + '\n');
console.log(JSON.stringify({ files: manifest.length, bytes: manifest.reduce((n, f) => n + f.bytes, 0), source: 'current-checkout' }));
