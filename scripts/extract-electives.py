import pymupdf,re,json
D=pymupdf.open('/tmp/eso-anexos.pdf')
# Bounds derived from the printed criteria columns, not competence/saberes columns.
S=[
('acc','Ampliación de Cultura Clásica',4,23,25,201,430,245,700),
('ase','Aprendizaje Social y Emocional',4,31,33,225,433,202,205),
('aed','Artes Escénicas y Danza',4,37,39,222,433,482,380),
('cyr','Computación y Robótica',2,46,48,212,428,559,439),
('cyr','Computación y Robótica',3,48,50,212,428,508,435),
('cci','Cultura Científica',4,55,57,225,428,424,330),
('ccl','Cultura Clásica',1,63,67,181,287,224,215),
('ccl','Cultura Clásica',2,63,67,343,433,224,215),
('ccl','Cultura Clásica',3,68,70,257,433,378,700),
('cf','Cultura del Flamenco',3,74,75,238,438,534,585),
('dbt','Dibujo Técnico',4,79,80,219,435,323,600),
('fil','Filosofía',4,85,88,222,430,540,315),
('fya','Filosofía y Argumentación',3,93,94,223,431,180,540),
('iae','Iniciación a la Actividad Emprendedora y Empresarial',3,100,102,225,431,195,215),
('oyd','Oratoria y Debate',1,108,111,208,305,298,265),
('oyd','Oratoria y Debate',2,108,111,362,454,298,265),
('oyd','Oratoria y Debate',3,112,114,292,458,420,455),
('pepa','Proyecto de Educación Plástica y Audiovisual',2,118,119,238,449,191,700),
]
R=[]
for id,name,course,start,end,x0,x1,y0,y1 in S:
 lines=[]
 for n in range(start,end+1):
  p=D[n-1]
  # get words to preserve text even where PDF stores justified words as separate lines
  words=[w for w in p.get_text('words') if w[0]>=x0 and w[2]<=x1 and w[1]>= (y0-.5 if n==start else 130) and w[3]<= (y1 if n==end else 700)]
  rows=[]
  for w in sorted(words,key=lambda w:(round(w[1],0),w[0])):
   if rows and abs(rows[-1][0]-w[1])<2: rows[-1][1].append(w)
   else: rows.append((w[1],[w]))
  lines.extend(' '.join(w[4] for w in sorted(row,key=lambda w:w[0])) for y,row in rows)
 txt='\n'.join(lines)
 txt=re.sub(r'(?<=\w)-\n(?=\w)','',txt)
 txt=re.sub(r'\s+',' ',txt).strip()
 matches=list(re.finditer(r'(?<!\w)(\d{1,2}\.\d{1,2})\.?\s+(?=[A-ZÁÉÍÓÚ])',txt))
 cs=[]
 for i,m in enumerate(matches):
  t=txt[m.end():matches[i+1].start() if i+1<len(matches) else len(txt)].strip()
  cs.append({'code':m[1],'text':t,'competency':int(m[1].split('.')[0])})
 R.append(dict(id=id,name=name,course=course,icon={'cyr':'cpu','ccl':'landmark','oyd':'mic'}.get(id,'book-open'),color='#7c6bd5',criteria=cs,pages=[start+289,end+289],pdfPart='anexos',source='https://www.juntadeandalucia.es/boja/2023/104/36',kind='optional'))
 print(id,course,len(cs),[c['code'] for c in cs])
json.dump(R,open('/tmp/electives-eso-catalog.json','w'),ensure_ascii=False,indent=2)
# Reviewed expected criterion sequences for each independently printed curriculum.
expected=[28,22,17,16,17,22,26,26,26,9,15,24,21,20,20,20,20,9]
for r,count in zip(R,expected):
 assert len(r['criteria'])==count,(r['id'],r['course'],len(r['criteria']))
 assert r['criteria'][0]['code']=='1.1'
 assert len({c['code'] for c in r['criteria']})==count
 for c in r['criteria']:
  assert len(c['text'])>30
  assert not re.search(r'\b(?:CCL|OYD|CYR|FYA|FIL|ACC|ASE|AED|CCI|CF|DBT|IAE|PEPA)\.\d\.',c['text']),c
  assert not re.search(r'Criterios de evaluación|Saberes básicos|Competencias específicas|BOJA|9727/',c['text']),c
print('Validated',len(R),'curricula;',sum(len(r['criteria']) for r in R),'criteria')
