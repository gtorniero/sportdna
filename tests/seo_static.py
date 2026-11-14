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
  self.assertEqual(len(urls),69);self.assertEqual(len(set(urls)),len(urls))
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
   def scripts(text):
    # Payment adapters are covered by payments/test. Keep the full original
    # recommendation, preview, report and PDF code byte-equivalent otherwise.
    text=re.sub(r'\n/\* SPORTDNA_CHECKOUT_ADAPTER_START \*/.*?/\* SPORTDNA_CHECKOUT_ADAPTER_END \*/\n', '', text, flags=re.S)
    text=re.sub(r'^  if\(window\.SportDNAPayments\?\.open.*\n', '', text, flags=re.M)
    text=text.replace("!window.SportDNAPayments?.enabled&&LS.get('rm_cmp')", "LS.get('rm_cmp')")
    text=text.replace("tier=window.SportDNAPayments?.enabled?0:o.t||0", "tier=o.t||0")
    # Checkout wording changes only; calculations and report rendering stay exact.
    text=text.replace('com cartão ou Pix','com Pix (simulação)').replace('via cartão ou Pix','via Pix (simulação)')
    return [re.sub(r'[ \t]+$', '', x, flags=re.M).rstrip() for x in re.findall(r'<script(?![^>]*application/ld\+json)[^>]*>(.*?)</script>',text,re.S) if x.strip()]
   self.maxDiff=1000
   self.assertEqual(scripts(before),scripts(after),app)
 def test_static_articles_and_legacy_routes(self):
  self.assertEqual(len([k for k in CONFIG['routes'] if k.startswith('a-')]),59)
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
 def test_lastmod_titles_social_and_schema(self):
  tree=ET.parse(ROOT/'sitemap.xml');entries=tree.findall('.//{*}url')
  dates=json.loads((ROOT/'seo.dates.json').read_text())
  self.assertIn('Sitemap: '+CONFIG['siteUrl']+'sitemap.xml',(ROOT/'robots.txt').read_text())
  prices={k:v for k,v in re.findall(r"'([a-z]+-report)':Object.freeze\(\{name:'[^']+',amount:(\d+)\}",(ROOT/'assets/payments/config.js').read_text())}
  for e in entries:
   url=e.find('{*}loc').text;rel=url.removeprefix(CONFIG['siteUrl'])
   with self.subTest(url=url):
    self.assertRegex(e.find('{*}lastmod').text,r'^\d{4}-\d{2}-\d{2}$');self.assertEqual(e.find('{*}lastmod').text,dates[rel]['modified'])
    text=(ROOT/rel/'index.html').read_text();p=Page(text)
    title=re.search(r'<title>(.*?)</title>',text).group(1).replace('&amp;','&');self.assertLessEqual(len(title),60,title)
    desc=next(a['content'] for t,a in p.tags if t=='meta' and a.get('name')=='description');self.assertLessEqual(len(desc),160,desc)
    meta={a.get('property') or a.get('name'):a.get('content') for t,a in p.tags if t=='meta'}
    self.assertEqual((meta['og:image:width'],meta['og:image:height'],meta['og:image:type']),('1200','630','image/jpeg'))
    self.assertTrue((ROOT/meta['og:image'].removeprefix(CONFIG['siteUrl'])).exists())
    self.assertEqual(meta['twitter:card'],'summary_large_image');self.assertEqual(meta['twitter:image'],meta['og:image'])
    graph=p.json[0]['@graph'];types=[g['@type'] for g in graph]
    self.assertIn('Organization',types);self.assertIn('WebSite',types)
    if rel:self.assertIn('BreadcrumbList',types)
    if rel.startswith('blog/') and rel!='blog/':
     art=next(g for g in graph if g['@type']=='Article');self.assertEqual(art['datePublished'],dates[rel]['published']);self.assertEqual(art['dateModified'],dates[rel]['modified'])
    if rel in ['racket/','surf/','run/']:
     product=next(g for g in graph if g['@type']=='Product');offer=product['offers']
     self.assertEqual(offer['priceCurrency'],'BRL');self.assertEqual(offer['price'],'%.2f'%(int(prices[{'racket/':'racket-report','surf/':'surf-report','run/':'run-report'}[rel]])/100))
     self.assertIn('R$ '+offer['price'].replace('.',','),desc)
    if rel=='ferramentas/litragem/':
     faq=next(g for g in graph if g['@type']=='FAQPage');visible=re.findall(r'<details><summary>(.*?)</summary>',re.search(r'<div class="faq">(.*?)</div>',text,re.S).group(1))
     self.assertEqual([q['name'] for q in faq['mainEntity']],visible)
  # Teste e guia do mesmo esporte não disputam o mesmo título.
  for test,guide in [('racket/','guias/racket/'),('surf/','guias/surf/'),('run/','guias/run/')]:
   t1=re.search(r'<title>(.*?)</title>',(ROOT/test/'index.html').read_text()).group(1);t2=re.search(r'<title>(.*?)</title>',(ROOT/guide/'index.html').read_text()).group(1)
   self.assertTrue(t1.startswith('Teste:'));self.assertIn('guia completo',t2)
 def test_non_content_pages_are_not_indexed(self):
  for rel in ['medicao.html','404.html']:
   self.assertRegex((ROOT/rel).read_text(),r'<meta name="robots" content="noindex')
  for rel in ['apps/racket/','apps/board/','apps/tenis/','tenis/']:
   self.assertRegex((ROOT/rel/'index.html').read_text(),r'<link rel="canonical" href="https://sportdna\.com\.br/(racket|surf|run)/">')
if __name__=='__main__':unittest.main(verbosity=2)
