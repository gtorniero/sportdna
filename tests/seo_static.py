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
  self.assertEqual(len(urls),76);self.assertEqual(len(set(urls)),len(urls))
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
    if rel.startswith('blog/') and rel!='blog/' or rel in GUIDES:
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
GUIDES=['guias/racket/melhor-raquete-de-tenis/','guias/racket/melhor-raquete-de-tenis-para-iniciante/','guias/racket/raquete-de-tenis-para-dor-no-cotovelo/']
TRUST=['sobre/','contato/','termos/','como-ganhamos-dinheiro/']
def br(d):return '/'.join(reversed(d.split('-')))
def visible(html):return re.sub(r'\s+',' ',re.sub(r'<[^>]+>','',html).replace('&amp;','&')).strip()
class GuidesAndTrust(unittest.TestCase):
 def test_routes_sitemap_and_package(self):
  locs=[x.text for x in ET.parse(ROOT/'sitemap.xml').findall('.//{*}loc')]
  package=(ROOT/'scripts/package-site.mjs').read_text()
  for rel in GUIDES+TRUST:
   with self.subTest(rel=rel):
    self.assertIn(rel,CONFIG['routes'].values());self.assertIn(CONFIG['siteUrl']+rel,locs)
    self.assertIn("'"+rel.split('/')[0]+"'",package)
  self.assertIn("'ads.txt'",package)
 def test_guides_structured_data_and_content(self):
  dates=json.loads((ROOT/'seo.dates.json').read_text())
  for rel in GUIDES:
   with self.subTest(rel=rel):
    text=(ROOT/rel/'index.html').read_text();p=Page(text);graph=p.json[0]['@graph'];types=[g['@type'] for g in graph]
    for t in ['Article','ItemList','FAQPage','BreadcrumbList']:self.assertIn(t,types)
    art=next(g for g in graph if g['@type']=='Article');self.assertEqual(art['author'],{'@id':CONFIG['siteUrl']+'#organization'})
    title=re.search(r'<title>(.*?)</title>',text).group(1)
    self.assertLessEqual(len(title),60)
    # FAQPage só com as perguntas e respostas visíveis
    faq=next(g for g in graph if g['@type']=='FAQPage')
    shown=re.findall(r'<details><summary>(.*?)</summary><p>(.*?)</p></details>',re.search(r'<div class="faq">(.*?)</div>',text,re.S).group(1),re.S)
    self.assertEqual([(q['name'],q['acceptedAnswer']['text']) for q in faq['mainEntity']],[(visible(q),visible(a)) for q,a in shown])
    items=next(g for g in graph if g['@type']=='ItemList')['itemListElement']
    for it in items:self.assertIn(it['name'],text)
    # assinatura e datas visíveis, iguais às do JSON-LD
    d=dates[rel];self.assertIn(f'Publicado em <time datetime="{d["published"]}">{br(d["published"])}</time>',text);self.assertIn(f'Atualizado em <time datetime="{d["modified"]}">{br(d["modified"])}</time>',text)
    self.assertIn('Equipe SPORT DNA',text);self.assertIn('Nenhuma marca paga para aparecer',text)
    self.assertGreaterEqual(text.count('href="../../../racket/"'),3,'CTA para o teste')
    self.assertIn('window.ML_STATIC=true',text)
  hub=(ROOT/GUIDES[0]/'index.html').read_text()
  self.assertTrue(re.search(r'<title>Melhor raquete de tênis',hub));self.assertIn('Descubra a sua em 3 minutos',hub)
  for rel in GUIDES[1:]:self.assertIn('href="../../../guias/racket/melhor-raquete-de-tenis/"',(ROOT/rel/'index.html').read_text(),rel)
 def test_guide_specs_come_from_the_racket_catalog(self):
  app=(ROOT/'racket/index.html').read_text()
  catalog=json.loads(re.search(r'const CATALOG=/\*CATALOG\*/(.*?);\n',app).group(1));by={f"{r['brand']} {r['model']}":r for r in catalog}
  for rel in GUIDES:
   text=(ROOT/rel/'index.html').read_text()
   for name,specs in re.findall(r'<p class="nm"><b>(.*?)</b>.*?<ul class="specs"[^>]*>(.*?)</ul>',text,re.S):
    with self.subTest(rel=rel,name=name):
     r=by[name.replace('&amp;','&')];chips=re.findall(r'<li>(.*?)</li>',specs)
     self.assertEqual([c.rstrip('*') for c in chips],[f"{r['wt']} g",f"{r['head']} pol²",f"{r['ra']} RA",r['pat'],f"SW {r['sw']}",f"{r['bal']} mm"])
 def test_bylines_on_every_article(self):
  dates=json.loads((ROOT/'seo.dates.json').read_text())
  for key,rel in CONFIG['routes'].items():
   if not key.startswith('a-'):continue
   with self.subTest(rel=rel):
    text=(ROOT/rel/'index.html').read_text();d=dates[rel]
    self.assertIn(f'Por <a href="../../sobre/" data-go="sobre">Equipe SPORT DNA</a> · Publicado em <time datetime="{d["published"]}">{br(d["published"])}</time> · Atualizado em <time datetime="{d["modified"]}">{br(d["modified"])}</time>',text)
    self.assertIn(f'window.ML_DATE={{"published":"{d["published"]}","modified":"{d["modified"]}"}}',text)
    art=next(g for g in Page(text).json[0]['@graph'] if g['@type']=='Article');self.assertEqual(art['author'],{'@id':CONFIG['siteUrl']+'#organization'})
 def test_footer_links_everywhere(self):
  pages=[(ROOT/(r or '')/'index.html') for k,r in CONFIG['routes'].items() if k!='conceito']+[ROOT/'ferramentas/litragem/index.html',ROOT/'404.html']+[ROOT/app/'index.html' for app in ['racket','surf','run']]
  for f in pages:
   with self.subTest(page=str(f.relative_to(ROOT))):
    text=f.read_text()
    for slug in ['sobre/','contato/','termos/','como-ganhamos-dinheiro/','privacidade/']:self.assertRegex(text,r'href="[^"]*'+re.escape(slug)+'"',slug)
 def test_trust_pages(self):
  prices={k:int(v) for k,v in re.findall(r"'([a-z]+-(?:report|comparator))':Object.freeze\(\{name:'[^']+',amount:(\d+)\}",(ROOT/'assets/payments/config.js').read_text())}
  money=lambda c:'R$ '+('%.2f'%(c/100)).replace('.',',')
  termos=(ROOT/'termos/index.html').read_text()
  for product,cents in prices.items():self.assertIn(money(cents),termos,product)
  for must in ['artigo 49 do Código de Defesa do Consumidor','7 dias','Mercado Pago','Stripe','hi@sportdna.com.br','69.746.447/0001-00']:self.assertIn(must,termos)
  sobre=(ROOT/'sobre/index.html').read_text();self.assertIn('69.746.447/0001-00',sobre);self.assertIn('Nenhuma marca, loja ou fabricante paga',sobre)
  self.assertIn('"@type":"AboutPage"',sobre);self.assertIn('"@type":"ContactPage"',(ROOT/'contato/index.html').read_text())
  privacy_email=set(re.findall(r'mailto:([^"]+)"',(ROOT/'privacidade/index.html').read_text()))
  self.assertEqual(set(re.findall(r'mailto:([^"]+)"',(ROOT/'contato/index.html').read_text())),privacy_email)
  ganhos=(ROOT/'como-ganhamos-dinheiro/index.html').read_text()
  for must in ['surf coach parceiro','Gustavo Lucas','comissão','Isso não muda as medidas','depois da recomendação','não exibe anúncios hoje']:self.assertIn(must,ganhos)
 def test_ads_txt_and_no_ads_loaded(self):
  self.assertEqual((ROOT/'ads.txt').read_text(),'google.com, pub-4039247360984618, DIRECT, f08c47fec0942fa0\n')
  privacy=(ROOT/'privacidade/index.html').read_text()
  self.assertIn('id="anuncios"',privacy);self.assertIn('Hoje o SPORT DNA não exibe anúncios',privacy);self.assertIn('https://adssettings.google.com/',privacy)
  for f in list(ROOT.glob('**/*.html'))+list(ROOT.glob('assets/**/*.js')):
   if 'node_modules' in f.parts or 'dist' in f.parts:continue
   text=f.read_text(errors='ignore')
   self.assertNotIn('pagead2.googlesyndication.com',text,str(f));self.assertNotIn('adsbygoogle',text,str(f))
if __name__=='__main__':unittest.main(verbosity=2)
