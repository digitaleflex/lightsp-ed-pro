import os

OUT = 'public/blog'

TPL = '''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0C1226"/>
      <stop offset="1" stop-color="{bg2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.35" r="0.65">
      <stop offset="0" stop-color="{accent}" stop-opacity="0.38"/>
      <stop offset="1" stop-color="{accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="2" fill="#ffffff" opacity="0.06"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#dots)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <text x="80" y="118" font-family="Arial, Helvetica, sans-serif" font-size="28" letter-spacing="6" fill="{accent_light}" font-weight="bold">{eyebrow}</text>
  <text x="76" y="252" font-family="Arial, Helvetica, sans-serif" font-size="{big_size}" font-weight="bold" fill="#ffffff">{title1}</text>
  <text x="76" y="348" font-family="Arial, Helvetica, sans-serif" font-size="{sub_size}" font-weight="bold" fill="{accent_light}">{title2}</text>
  <text x="80" y="402" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="{accent_light}">{subtitle}</text>
  <rect x="80" y="430" width="{pill_w}" height="60" rx="30" fill="{accent}"/>
  <text x="{pill_cx}" y="471" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="bold" fill="{pill_text}" text-anchor="middle">{pill}</text>
  {icon}
  <rect x="0" y="614" width="1200" height="16" fill="{accent}"/>
</svg>
'''

ICONS = {
    'loaf': '''<g>
    <rect x="700" y="180" width="320" height="270" rx="24" fill="none" stroke="#3B4670" stroke-width="10"/>
    <rect x="730" y="220" width="260" height="44" rx="10" fill="#EA580C"/>
    <rect x="730" y="280" width="180" height="44" rx="10" fill="#EA580C" opacity="0.65"/>
    <rect x="730" y="340" width="220" height="44" rx="10" fill="#EA580C" opacity="0.4"/>
    <text x="1020" y="258" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="bold" fill="#EA580C">240</text>
    <text x="1020" y="318" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="bold" fill="#EA580C" opacity="0.65">150</text>
    <text x="1020" y="378" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="bold" fill="#EA580C" opacity="0.4">90</text>
  </g>''',
    'inp-debug': '''<g fill="none" stroke-linecap="round">
    <rect x="700" y="200" width="230" height="130" rx="20" stroke="#10B981" stroke-width="11"/>
    <rect x="730" y="360" width="170" height="34" rx="17" fill="#10B981" opacity="0.5"/>
    <circle cx="990" cy="300" r="70" stroke="#ffffff" stroke-width="12"/>
    <line x1="1040" y1="350" x2="1095" y2="405" stroke="#ffffff" stroke-width="16"/>
    <polygon points="770,120 770,210 800,185 818,225 834,217 816,177 840,177" fill="#10B981" stroke="none"/>
  </g>''',
    'fid': '''<g>
    <rect x="680" y="220" width="150" height="120" rx="20" fill="none" stroke="#3B4670" stroke-width="10"/>
    <text x="755" y="298" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="bold" fill="#94A3B8" text-anchor="middle">FID</text>
    <rect x="920" y="220" width="150" height="120" rx="20" fill="#6366F1"/>
    <text x="995" y="298" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="bold" fill="#ffffff" text-anchor="middle">INP</text>
    <g stroke="#818CF8" stroke-width="10" stroke-linecap="round" fill="none">
      <line x1="845" y1="280" x2="905" y2="280"/>
      <polyline points="887,262 907,280 887,298"/>
    </g>
    <text x="755" y="390" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#94A3B8" text-anchor="middle">≤ 100 ms</text>
    <text x="995" y="390" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="bold" fill="#818CF8" text-anchor="middle">≤ 200 ms</text>
  </g>''',
    'speedindex': '''<g fill="none" stroke-linecap="round">
    <path d="M690,450 A170,170 0 0 1 1030,450" stroke="#3B4670" stroke-width="32"/>
    <path d="M690,450 A170,170 0 0 1 920,300" stroke="#7C3AED" stroke-width="32"/>
    <line x1="860" y1="450" x2="940" y2="350" stroke="#ffffff" stroke-width="15"/>
    <circle cx="860" cy="450" r="24" fill="#7C3AED" stroke="none"/>
    <text x="860" y="520" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="bold" fill="#A78BFA" text-anchor="middle">3,4 s</text>
  </g>''',
    'fetchpriority': '''<g>
    <rect x="700" y="180" width="320" height="70" rx="16" fill="none" stroke="#0891B2" stroke-width="10"/>
    <text x="860" y="227" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="bold" fill="#22D3EE" text-anchor="middle">HERO · HIGH</text>
    <rect x="700" y="270" width="320" height="70" rx="16" fill="none" stroke="#3B4670" stroke-width="10"/>
    <text x="860" y="317" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#94A3B8" text-anchor="middle">reste · low</text>
    <g stroke="#22D3EE" stroke-width="12" stroke-linecap="round" fill="none">
      <line x1="760" y1="370" x2="760" y2="440"/>
      <polyline points="738,418 760,442 782,418"/>
      <line x1="860" y1="370" x2="860" y2="440"/>
      <polyline points="838,418 860,442 882,418"/>
      <line x1="960" y1="370" x2="960" y2="440"/>
      <polyline points="938,418 960,442 982,418"/>
    </g>
  </g>''',
    'bfcache': '''<g fill="none" stroke-linecap="round">
    <path d="M980,250 A110,110 0 1 0 990,360" stroke="#2DD4BF" stroke-width="22"/>
    <polygon points="990,200 990,260 935,235" fill="#2DD4BF" stroke="none"/>
    <rect x="700" y="400" width="330" height="60" rx="30" fill="#2DD4BF"/>
    <text x="865" y="441" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="bold" fill="#042926" text-anchor="middle">retour instantané</text>
  </g>''',
    'polices': '''<g>
    <text x="700" y="360" font-family="Georgia, serif" font-size="200" font-weight="bold" fill="#ffffff">Aa</text>
    <text x="905" y="360" font-family="Arial, Helvetica, sans-serif" font-size="200" fill="#E879F9" opacity="0.55">Aa</text>
    <line x1="700" y1="400" x2="1050" y2="400" stroke="#E879F9" stroke-width="8" stroke-dasharray="20 14"/>
    <rect x="700" y="430" width="200" height="52" rx="26" fill="#E879F9"/>
    <text x="800" y="466" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="bold" fill="#3B0A22" text-anchor="middle">WOFF2</text>
  </g>''',
}

COVERS = [
    dict(name='loaf', eyebrow='LIGHTSPEED · LOAF', title1='LoAF', big_size=130, title2='Long Frames', sub_size=64, subtitle='Qui bloque ? Quel script ?', pill='frames > 50 ms', pill_w=300, pill_cx=230, pill_text='#331303', accent='#EA580C', accent_light='#FDBA74', bg2='#431407'),
    dict(name='inp-debug', eyebrow='LIGHTSPEED · INP DEBUG', title1='INP', big_size=130, title2='Attribution', sub_size=64, subtitle='Délai · traitement · rendu', pill='trouver la phase', pill_w=300, pill_cx=230, pill_text='#06281E', accent='#10B981', accent_light='#6EE7B7', bg2='#0E3B2E'),
    dict(name='fid', eyebrow='LIGHTSPEED · MIGRATION', title1='FID → INP', big_size=88, title2='Depuis mars 2024', sub_size=48, subtitle='Checklist en 6 points', pill='nouveaux seuils', pill_w=300, pill_cx=230, pill_text='#ffffff', accent='#6366F1', accent_light='#A5B4FC', bg2='#1A2452'),
    dict(name='speedindex', eyebrow='LIGHTSPEED · LABO', title1='SI · TTI', big_size=110, title2='Utiles ?', sub_size=72, subtitle='Diagnostics, pas objectifs', pill='labo uniquement', pill_w=300, pill_cx=230, pill_text='#ffffff', accent='#7C3AED', accent_light='#C4B5FD', bg2='#2A1A52'),
    dict(name='fetchpriority', eyebrow='LIGHTSPEED · CHARGEMENT', title1='Priorités', big_size=92, title2='preload · hints', sub_size=56, subtitle='Le bon ordre, au bon moment', pill='LCP en Highest', pill_w=300, pill_cx=230, pill_text='#06333C', accent='#0891B2', accent_light='#67E8F9', bg2='#083B46'),
    dict(name='bfcache', eyebrow='LIGHTSPEED · NAVIGATION', title1='bfcache', big_size=104, title2='Retour éclair', sub_size=60, subtitle='1 nav. sur 5 : gratuite', pill='taux > 70 %', pill_w=280, pill_cx=220, pill_text='#042926', accent='#2DD4BF', accent_light='#99F6E4', bg2='#07322E'),
    dict(name='polices', eyebrow='LIGHTSPEED · POLICES', title1='Polices', big_size=104, title2='rapides · stables', sub_size=52, subtitle='swap + subset + size-adjust', pill='WOFF2 · CLS ~ 0', pill_w=320, pill_cx=240, pill_text='#3B0A22', accent='#E879F9', accent_light='#F5D0FE', bg2='#471032'),
]

os.makedirs(OUT, exist_ok=True)
for c in COVERS:
    svg = TPL.format(icon=ICONS[c['name']], **{k: v for k, v in c.items() if k != 'name'})
    path = os.path.join(OUT, c['name'] + '.svg')
    open(path, 'w', encoding='utf-8').write(svg)
    print('OK', path)
