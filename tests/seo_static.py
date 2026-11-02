import json, re, subprocess, unittest
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse, unquote
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
CONFIG=json.loads((ROOT/'seo.config.json').read_text())
class Page(HTMLParser):
 def __init__(self, text):
  super().__init__();self.tags=[];self.ids=[];self.json=[];self.in_json=False;self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.tags.append((tag,a));
  if 'id' in a:self.ids.append(a['id'])
  if tag=='script' and a.get('type')=='application/ld+json':self.in_json=True
 def handle_endtag(self,tag):
  if tag=='script':self.in_json=False
 def handle_data(self,data):
  if self.in_json:self.json.append(json.loads(data))
class SEO(unittest.TestCase):
 def test_all_canonical_pages_and_links(self):
  tree=ET.parse(ROOT/'sitemap.xml');urls=[x.text for x in tree.findall('.//{*}loc')]
  self.assertEqual(len(urls),57);self.assertEqual(len(set(urls)),len(urls))
  titles=set();descriptions=set()
  for url in urls:
   with self.subTest(url=url):
    rel=url.removeprefix(CONFIG['siteUrl']);file=ROOT/rel/'index.html';text=file.read_text();p=Page(text)
    self.assertEqual(sum(t=='head' for t,a in p.tags),1)
    self.assertEqual(sum(t=='body' for t,a in p.tags),1)
    self.assertEqual([a['href'] for t,a in p.tags if t=='link' and a.get('rel')=='canonical'],[url])
    self.assertEqual(sum(t=='meta' and a.get('name')=='description' for t,a in p.tags),1)
    description=next(a['content'] for t,a in p.tags if t=='meta' and a.get('name')=='description');self.assertNotIn(description,descriptions);descriptions.add(description)
    title=re.search(r'<title>(.*?)</title>',text).group(1);self.assertNotIn(title,titles);titles.add(title)
    self.assertTrue(p.json);self.assertNotIn('"@type":"Review"',text)
    if rel not in ['surf/','racket/','run/'] and not rel.startswith('apps/'):
     self.assertEqual(sum(t=='h1' for t,a in p.tags),1)
    self.assertEqual(len(p.ids),len(set(p.ids)))
    for tag,a in p.tags:
     for attr in ['src','href']:
      v=a.get(attr,'')
      if not v or v.startswith(('https:','http:','data:','mailto:','tel:','#')):continue
      parsed=urlparse(urljoin(url,v))
      if not parsed.path.startswith(urlparse(CONFIG['siteUrl']).path):continue
      target=ROOT/unquote(parsed.path.removeprefix(urlparse(CONFIG['siteUrl']).path))
      if target.is_dir():target=target/'index.html'
      self.assertTrue(target.exists(),f'{file}: missing {v}')
 def test_report_engines_unchanged(self):
  for app in ['surf','racket','run']:
   rel=f'{app}/index.html'
   before=subprocess.check_output(['git','show','HEAD:'+rel],cwd=ROOT,text=True)
   after=(ROOT/rel).read_text()
   def scripts(text):return re.findall(r'<script(?![^>]*application/ld\+json)[^>]*>(.*?)</script>',text,re.S)
   self.assertEqual([re.sub(r'[ \t]+$', '', x, flags=re.M) for x in scripts(before)],scripts(after),app)
 def test_static_articles_and_legacy_routes(self):
  self.assertEqual(len([k for k in CONFIG['routes'] if k.startswith('a-')]),47)
  for key,route in CONFIG['routes'].items():
   if key=='conceito':continue
   text=(ROOT/route/'index.html').read_text()
   self.assertIn('data-go="blog"',text)
   self.assertNotRegex(text,r'href="#a-')
   self.assertNotIn('R$ 19,90',text);self.assertNotIn('R$ 34,90',text)
   if key.startswith('a-'):self.assertIn('"@type":"Article"',text)
 def test_prices(self):
  for app,price in [('surf','19,99'),('racket','19,99'),('run','9,99')]:
   text=(ROOT/f'{app}/index.html').read_text()
   self.assertIn('R$ '+price,text)
  self.assertIn('isCmp?4.99:19.99',(ROOT/'racket/index.html').read_text())
if __name__=='__main__':unittest.main(verbosity=2)
