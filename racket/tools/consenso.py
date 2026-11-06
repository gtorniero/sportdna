#!/usr/bin/env python3
"""Consenso de reviews por família (rodada 11).
Uso: python3 racket/tools/consenso.py   (lê docs/racket/dados/reviews-paises.json e reescreve const RVF em racket/index.html)
Cada review vira a forma do perfil (atributo menos a média da própria review) e uma aprovação; pesos por tipo
(playtest/editorial 1, vídeo 0,6, cliente 0,4, fórum 0,3) e por ano (2024+ 1; 2022-23 0,65; antes 0,4).
A escala é convertida para a da Tennis Warehouse por regressão nas famílias que têm as duas fontes."""
import json,os,re,statistics as st,collections
RAIZ=os.path.join(os.path.dirname(os.path.abspath(__file__)),"../..")
R=json.load(open(os.path.join(RAIZ,"docs/racket/dados/reviews-paises.json")))["reviews"]
HTML=os.path.join(RAIZ,"racket/index.html")
K=['power','control','spin','comfort','maneuver','stability']
TW={'tipo':{'playtest':1,'editorial':1,'video':.6,'cliente':.4,'forum':.3}}
def wyear(y):
  try:y=int(y)
  except: return .7
  return 1 if y>=2024 else .65 if y>=2022 else .4
def tonum(v,esc):
  if v is None:return None
  try:v=float(v)
  except:return None
  if esc=='sentimento':return 5+1.5*max(-2,min(2,v))
  s={'10':10,'100':100,'5':5}.get(str(esc))
  return None if not s else v/s*10
MED={'10':(8.2,.6),'100':(82,6),'5':(4.3,.4)}
def overall(g,esc):
  if g is None:return None
  try:g=float(g)
  except:return None
  if esc=='sentimento':return max(-2,min(2,g))/2
  m=MED.get(str(esc));return None if not m else max(-1.5,min(1.5,(g-m[0])/m[1]))/1.5
F=collections.defaultdict(lambda:{'dw':collections.defaultdict(float),'w':collections.defaultdict(float),'ow':0,'o':0,'n':0,'paises':collections.Counter(),'sites':set()})
for r in R:
  f=F[r['fam']];f['n']+=1;f['paises'][r.get('pais')]+=1;f['sites'].add(r.get('site'))
  w=TW['tipo'].get(r.get('tipo'),.6)*wyear(r.get('ano'))
  x={k:tonum((r.get('notas') or {}).get(k),r.get('escala')) for k in K};x={k:v for k,v in x.items() if v is not None}
  if len(x)>=2:
    mu=st.mean(x.values())
    for k,v in x.items():f['dw'][k]+=w*(v-mu);f['w'][k]+=w
  o=overall(r.get('geral'),r.get('escala'))
  if o is not None:f['o']+=w*o;f['ow']+=w
out={}
for fam,f in F.items():
  d={k:round(f['dw'][k]/(f['w'][k]+1.5),3) for k in K if f['w'][k]>0}
  out[fam]={'d':d,'o':round(f['o']/(f['ow']+2),3) if f['ow'] else None,'n':f['n'],'no':round(f['ow'],1),'paises':dict(f['paises']),'nsites':len(f['sites'])}
V=out
s=open(HTML).read()
TWD=json.loads(re.search(r"const TWD=(\{.*?\});\n",s).group(1))
C=json.loads(re.search(r"const CATALOG=/\*CATALOG\*/(\[.*?\]);\n",s).group(1))
fam=collections.defaultdict(list)
for i,r in enumerate(C):fam[r.get("fam") or r["brand"]+" "+r["model"]].append(i)
F=[{"fam":f,"ids":ids} for f,ids in fam.items()]
def rank(x):
  o=sorted(range(len(x)),key=lambda i:x[i]);r=[0]*len(x)
  for j,i in enumerate(o):r[i]=j
  return r
def sp(a,b):
  if len(a)<4:return None
  ra,rb=rank(a),rank(b);n=len(a);ma=sum(ra)/n;mb=sum(rb)/n
  c=sum((x-ma)*(y-mb) for x,y in zip(ra,rb));return round(c/(sum((x-ma)**2 for x in ra)*sum((y-mb)**2 for y in rb))**.5,2)
pairs={k:([],[]) for k in K};oa=([],[])
for f in F:
  v=V.get(f['fam']);t=next((TWD[str(i)] for i in f["ids"] if str(i) in TWD),None)
  if not v or not t:continue
  for k in K:
    if k in v['d'] and t['d'].get(k) is not None:pairs[k][0].append(v['d'][k]);pairs[k][1].append(t['d'][k])
  if v['o'] is not None and t.get('a') is not None:oa[0].append(v['o']);oa[1].append(t['a'])
for k in K:
  a,b=pairs[k];sc=sum(x*y for x,y in zip(a,b))/max(1e-9,sum(x*x for x in a))
  print(k,len(a),'spearman',sp(a,b),'escala→TW',round(sc,2))
print('aprovacao',len(oa[0]),sp(*oa))
sc={}
for k in K:
  a,b=pairs[k];sc[k]=sum(x*y for x,y in zip(a,b))/max(1e-9,sum(x*x for x in a))
ma=sum(oa[0])/len(oa[0]);mb=sum(oa[1])/len(oa[1])
so=sum((x-ma)*(y-mb) for x,y in zip(*oa))/sum((x-ma)**2 for x in oa[0])
out={f:{'d':{k:round(v['d'][k]*sc[k],3) for k in v['d']},'o':None if v['o'] is None else round((v['o']-ma)*so+mb,3),'n':v['n'],'no':v['no']} for f,v in V.items()}
s=re.sub(r"const RVF=\{.*?\};\n",lambda m:"const RVF="+json.dumps(out,ensure_ascii=False,separators=(",",":"))+";\n",s)
open(HTML,"w").write(s)
print("reviews",len(R),"famílias",len(out))
