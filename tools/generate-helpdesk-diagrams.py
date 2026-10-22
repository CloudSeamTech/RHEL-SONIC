# Regenerate original help desk teaching diagrams and their asset hashes.
from pathlib import Path
import json,html,hashlib,textwrap
r=Path(__file__).resolve().parent.parent;c=json.loads((r/'content/helpdesk/course.json').read_text());p=r/'content/helpdesk/references.json';refs=json.loads(p.read_text());byid={a['id']:a for a in refs}
for l in c['lessons']:
 for s in l['steps']:
  if s['screenshot']['status']!='illustration':continue
  a=byid[s['screenshot']['assetId']];rows=[]
  for line in [s['where']]+s['actions']+['Check: '+s['expected']]:rows+=textwrap.wrap(line,95)+['']
  height=180+len(rows)*24;svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="{height}" viewBox="0 0 1100 {height}"><rect width="1100" height="{height}" fill="#080808"/><text x="36" y="45" fill="#21c5db" font-family="sans-serif" font-size="20">SONIC-Academy · illustrated action guide</text><text x="36" y="82" fill="#eaeaea" font-family="sans-serif" font-size="25">{html.escape(s["title"])}</text><text x="36" y="115" fill="#dfb656" font-family="sans-serif" font-size="16">Teaching diagram · not a screenshot or actual terminal result</text>'
  for k,line in enumerate(rows):svg+=f'<text x="36" y="{156+k*24}" fill="#eaeaea" font-family="sans-serif" font-size="18">{html.escape(line)}</text>'
  svg+='</svg>';dest=r/'public'/a['src'].lstrip('/');dest.write_text(svg);a['sha256']=hashlib.sha256(svg.encode()).hexdigest()
p.write_text(json.dumps(refs,indent=2)+'\n')
(r/'public/helpdesk/ATTRIBUTION.md').write_text('# Help desk teaching visuals\n\nOriginal vendor screenshots retain original names and pixels. Source/version differences are explained alongside each image. Teaching diagrams are original SONIC-Academy illustrations, not screenshots.\n\n'+'\n\n'.join(f"## {a['id']}\n\n{a['credit']}\n\nSource: {a['source']}\n\n{a['note']}" for a in refs)+'\n')
