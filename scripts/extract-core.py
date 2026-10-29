import pymupdf as f,re,json,pathlib
specs=[]
def add(sid,name,course,doc,start,end,x1,x2,kind='common',icon='◈',color='#7767d5'):
 specs.append((sid,name,course,doc,start,end,x1,x2,kind,icon,color))
add('byg','Biología y Geología',3,'main',58,64,351.2,451.1)
add('byg','Biología y Geología',4,'main',65,68,235,455.8,'optional')
add('dig','Digitalización',4,'main',71,73,213.7,435.1,'optional')
add('ece','Economía y Emprendimiento',4,'main',79,81,212.3,434.7,'optional')
add('efi','Educación Física',2,'main',90,95,366.4,473)
add('efi','Educación Física',3,'main',98,104,201.7,306.1)
add('efi','Educación Física',4,'main',98,104,366.1,467.8)
add('epv','Educación Plástica, Visual y Audiovisual',3,'main',111,116,322.3,435.2)
add('vec','Educación en Valores Cívicos y Éticos',2,'main',121,123,211.6,432.8)
add('ear','Expresión Artística',4,'main',127,128,212.3,433.1,'optional')
add('fyq','Física y Química',2,'main',134,140,187.9,286.8)
add('fyq','Física y Química',3,'main',134,140,336.1,432.3)
add('fyq','Física y Química',4,'main',142,146,212.9,434.7,'optional')
add('fop','Formación y Orientación Personal y Profesional',4,'main',151,153,212.9,437.3,'optional')
add('geh','Geografía e Historia',2,'main',163,171,323.8,429.8)
add('geh','Geografía e Historia',3,'main',175,182,188.2,281.8)
add('geh','Geografía e Historia',4,'main',175,182,336.1,427.6)
add('lat','Latín',4,'main',188,190,212.5,433,'optional')
add('lcl','Lengua Castellana y Literatura',2,'main',202,209,366.2,470.2)
add('lcl','Lengua Castellana y Literatura',3,'main',213,222,187.9,284)
add('lcl','Lengua Castellana y Literatura',4,'main',213,222,336.1,429.7)
add('ing','Inglés',2,'main',229,235,337.4,433)
add('ing','Inglés',3,'main',238,245,187.8,286.2)
add('ing','Inglés',4,'main',238,245,335.4,434.4)
add('mat','Matemáticas',2,'main',257,269,232,306.9)
add('mat','Matemáticas',3,'main',257,269,360.8,430.4)
add('mata','Matemáticas A',4,'main',271,274,219.9,422.6,'optional')
add('matb','Matemáticas B',4,'main',276,279,211.4,422.6,'optional')
add('mus','Música',2,'main',284,286,329.8,427.6)
add('mus','Música',4,'main',287,288,207.1,435.3,'optional')
add('tec','Tecnología',4,'anexos',4,6,203.5,427.6,'optional')
add('tyd','Tecnología y Digitalización',2,'anexos',13,16,168,299.2)
add('tyd','Tecnología y Digitalización',3,'anexos',13,16,351,473.6)
base=json.loads(pathlib.Path('/Users/jgleal/Documents/ChatGPT/Notas/brujula-eso/dist/curriculum.json').read_text())
out=[]
for sid,name,course,doc,start,end,x1,x2,kind,icon,color in specs:
 d=f.open('/tmp/eso-'+doc+'.pdf');parts=[]
 for n in range(start,end+1):
  p=d[n-1]
  ends=[dr['rect'].y1 for dr in p.get_drawings() if dr['rect'].width<1 and abs(dr['rect'].x0-x1)<.25 and dr['rect'].height>10 and dr['rect'].y0<700]
  assert ends,(sid,n,x1)
  yend=max(ends)+.5
  text=p.get_text(clip=f.Rect(x1+1,135,x2-1,yend),sort=True)
  text=text.replace('1..1.', '1.1.')
  if n==start:
   m=re.search(r'1\.1\.',text);assert m,(sid,text);text=text[m.start():]
  parts.append(text)
 text='\n'.join(parts);text=re.sub(r'-\s*\n\s*','',text);text=re.sub(r'\s+',' ',text).strip()
 # Repair only verified PDF line-break artefacts in narrow mathematics columns.
 for broken,joined in [('responsabilizándo se','responsabilizándose'),('responsabilizánd ose','responsabilizándose'),('autoevaluacione s','autoevaluaciones'),('específicos. .','específicos.')]: text=text.replace(broken,joined)
 matches=list(re.finditer(r'(?<!\d)(\d{1,2}\.\d{1,2})\.?\s*(?=[A-ZÁÉÍÓÚ])',text))
 cs=[]
 for j,m in enumerate(matches):
  desc=text[m.end():matches[j+1].start() if j+1<len(matches) else len(text)].strip()
  cs.append(dict(code=m[1],text=desc,competency=int(m[1].split('.')[0])))
 existing=next((s for s in base if s['id']==sid),{})
 result=dict(id=sid,name=name,course=course,icon=existing.get('icon',icon),color=existing.get('color',color),criteria=cs,pdfPart=doc,pages=[start+(289 if doc=='anexos' else 0),end+(289 if doc=='anexos' else 0)],source='https://www.juntadeandalucia.es/boja/2023/104/36',kind=kind)
 out.append(result)
 print(sid,course,len(cs),[c['code'] for c in cs],cs[-1]['text'][-120:])
pathlib.Path('/tmp/core-eso-catalog.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
