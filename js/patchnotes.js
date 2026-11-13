/* =====================================================================
   Patch Notes: documentação de versão a partir do CSV do Artia,
   no padrão do "Documento de Atualização de Versão" (Google Docs)
   ===================================================================== */
const PN={vers:[],itens:[],cfg:{},sub:false,subV:null,unsubI:null,ver:null,tab:{},gen:new Set(),bgen:new Set(),mcp:undefined,showProc:false,loaded:false,itLoaded:false,err:'',work:''};
const PN_SRV={docs:'Google Docs',drive:'Google Drive'};
const PN_SEC0=['CRM API','Protocolo Beneficiário','Protocolo Contratante','Protocolo Prestador','Protocolo Não Cliente','Ouvidoria','Pedido de Autorização','Cadastros','Dashboards','Relatórios','Configurações','Integrações'];
const PN_CL0=[{k:'Correções',fmt:'antesapos'},{k:'Melhorias',fmt:'livre'}];
const PN_BT={p:'Parágrafo',antes:'Antes',apos:'Após Ajustes',ul:'Lista',h:'Subtítulo',img:'Imagem',nota:'Importante',json:'Exemplo JSON'};
const PN_KEYS=[['chapter','Capítulo (1. Correções)'],['intro','Frase de abertura do capítulo'],['secao','Seção (CRM API, Cadastros…)'],['item','Título do item'],['sub','Subtítulo dentro do item'],['p','Parágrafo'],['antes','Antes:'],['apos','Após Ajustes:'],['ul','Lista com marcadores'],['img','Marcação [INSERIR IMAGEM]'],['cap','Legenda (Figura N - …)'],['nota','Importante:']];
const PN_RX={intro:/^a partir deste ponto/i,antes:/^antes\s*:/i,apos:/^ap[óo]s(?:\s+os)?(?:\s+ajustes)?\s*:/i,nota:/^(importante|aten[çc][ãa]o|observa[çc][ãa]o)\s*:/i,img:/^\[\s*inserir\s+imagem/i,cap:/^figura\s+\d+/i};
Object.assign(ICONS,{
  up:'<path d="M12 19V5M6 11l6-6 6 6"/>',down:'<path d="M12 5v14M6 13l6 6 6-6"/>',trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',redo:'<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/>',link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  image:'<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M20.5 16l-5-5-8 8"/>',ext:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'});
const pnView=()=>st.view==='patch'||st.view==='pnver';
const pnV=()=>PN.vers.find(v=>v.id===PN.ver);
const pnClasses=v=>(v&&Array.isArray(v.classes)&&v.classes.length?v.classes:PN_CL0);
const pnFmt=(v,k)=>(pnClasses(v).find(c=>c.k===k)||{}).fmt||'livre';
const pnDesign=()=>PN.cfg.design&&PN.cfg.design.estilos?PN.cfg.design:null;
const pnEstilo=()=>PN.cfg.estilo||null;
function pnDocId(u){u=String(u||'').trim();const m=u.match(/\/d\/([A-Za-z0-9_-]{20,})/)||u.match(/[?&]id=([A-Za-z0-9_-]{20,})/)||u.match(/^([A-Za-z0-9_-]{25,})$/);return m?m[1]:''}
const pnDocUrl=(id,h)=>`https://docs.google.com/document/d/${encodeURIComponent(id)}/edit${h?'#heading='+encodeURIComponent(h):''}`;
/* ---------- leitura da estrutura de um Google Doc ---------- */
function pnBody(doc){return (doc.body&&doc.body.content)||(doc.tabs&&doc.tabs[0]&&doc.tabs[0].documentTab&&doc.tabs[0].documentTab.body&&doc.tabs[0].documentTab.body.content)||[]}
function pnLists(doc){return doc.lists||(doc.tabs&&doc.tabs[0]&&doc.tabs[0].documentTab&&doc.tabs[0].documentTab.lists)||{}}
function pnNamedRaw(doc){const ns=doc.namedStyles||(doc.tabs&&doc.tabs[0]&&doc.tabs[0].documentTab&&doc.tabs[0].documentTab.namedStyles);return (ns&&ns.styles)||[]}
function pnFlat(doc){const out=[];
  for(const el of pnBody(doc)){
    if(el.paragraph){const pa=el.paragraph;let txt='',runs=[],img=false,pb=false;
      for(const e of pa.elements||[]){if(e.textRun){const c=e.textRun.content||'';runs.push({s:e.startIndex,e:e.endIndex,ts:e.textRun.textStyle||{}});txt+=c}
        else if(e.inlineObjectElement){img=true;txt+='￼'}else if(e.pageBreak){pb=true;txt+='\f'}else{const k=Object.keys(e).find(x=>!/Index$/.test(x));if(k)txt+='￼'}}
      out.push({kind:'p',si:el.startIndex||0,ei:el.endIndex,txt:txt.replace(/\n$/,''),runs,ps:pa.paragraphStyle||{},bullet:pa.bullet||null,img,pb})}
    else if(el.tableOfContents)out.push({kind:'toc',si:el.startIndex,ei:el.endIndex});
    else if(el.table)out.push({kind:'table',si:el.startIndex,ei:el.endIndex});
    else if(el.sectionBreak)out.push({kind:'sb',si:el.startIndex||0,ei:el.endIndex})}
  return out}
const pnClean=t=>String(t||'').replace(/[\f￼\u000b]/g,' ').replace(/\s+/g,' ').trim();
const PN_TSK=['bold','italic','underline','strikethrough','smallCaps','backgroundColor','foregroundColor','fontSize','weightedFontFamily','baselineOffset'];
const PN_PSK=['namedStyleType','alignment','lineSpacing','direction','spacingMode','spaceAbove','spaceBelow','borderBetween','borderTop','borderBottom','borderLeft','borderRight','indentFirstLine','indentStart','indentEnd','keepLinesTogether','keepWithNext','avoidWidowAndOrphan','shading','pageBreakBefore'];
function pnPick(o,keys){const r={};for(const k of keys)if(o&&o[k]!==undefined&&o[k]!==null)r[k]=JSON.parse(JSON.stringify(o[k]));return r}
function pnRunAt(p,off){const idx=p.si+off;const r=p.runs.find(x=>x.s<=idx&&idx<x.e)||p.runs[0];return r?r.ts:{}}
function pnLongRun(p){let best=null;for(const r of p.runs){const n=r.e-r.s;if(!best||n>best.n)best={n,ts:r.ts}}return best?best.ts:{}}
function pnChapRx(names){const n=(names&&names.length?names:PN_CL0.map(c=>c.k)).map(x=>norm(x).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  const extra=['correcoes','melhorias','novas? funcionalidades?','novidades','ajustes','alteracoes'];
  return new RegExp('^\\s*(?:(\\d+)\\s*([.)\\-–]\\s*))?('+[...new Set([...n,...extra])].join('|')+')\\s*$')}
function pnPreset(lists,b){const l=lists&&b&&lists[b.listId];const nl=l&&l.listProperties&&l.listProperties.nestingLevels&&l.listProperties.nestingLevels[b.nestingLevel||0];
  if(!nl)return {preset:'BULLET_DISC_CIRCLE_SQUARE',glyph:'●',num:false};const gt=nl.glyphType,g=nl.glyphSymbol||'';
  if(gt&&gt!=='GLYPH_TYPE_UNSPECIFIED'&&gt!=='NONE'){const f=nl.glyphFormat||'';const P={DECIMAL:/\)/.test(f)?'NUMBERED_DECIMAL_ALPHA_ROMAN_PARENS':'NUMBERED_DECIMAL_ALPHA_ROMAN',ZERO_DECIMAL:'NUMBERED_ZERODECIMAL_ALPHA_ROMAN',UPPER_ALPHA:'NUMBERED_UPPERALPHA_ALPHA_ROMAN',UPPER_ROMAN:'NUMBERED_UPPERROMAN_UPPERALPHA_DECIMAL'};return {preset:P[gt]||'NUMBERED_DECIMAL_ALPHA_ROMAN',glyph:gt,num:true}}
  const M={'●':'BULLET_DISC_CIRCLE_SQUARE','○':'BULLET_DISC_CIRCLE_SQUARE','■':'BULLET_DISC_CIRCLE_SQUARE','❖':'BULLET_DIAMONDX_ARROW3D_SQUARE','➔':'BULLET_ARROW_DIAMOND_DISC','★':'BULLET_STAR_CIRCLE_SQUARE','➢':'BULLET_ARROW3D_CIRCLE_SQUARE','►':'BULLET_LEFTTRIANGLE_DIAMOND_DISC','◆':'BULLET_DIAMOND_CIRCLE_SQUARE','❑':'BULLET_CHECKBOX','☐':'BULLET_CHECKBOX'};
  return {preset:M[g]||'BULLET_DISC_CIRCLE_SQUARE',glyph:g||'●',num:false,exato:!!M[g]}}
const PN_HORD=['TITLE','SUBTITLE','HEADING_1','HEADING_2','HEADING_3','HEADING_4','HEADING_5','HEADING_6'];
/* lê o modelo e guarda, para cada tipo de parágrafo, o estilo exato de um exemplo encontrado nele */
function pnDetect(doc,classNames){const P=pnFlat(doc);const lists=pnLists(doc);const rxCh=pnChapRx(classNames);const E={};let inBody=false,chapNst=null;const heads=[];
  const lab=(k,t)=>{const rx={antes:/^antes\s*:\s*/i,apos:/^ap[óo]s(?:\s+os)?(?:\s+ajustes)?\s*:\s*/i,nota:/^(importante|aten[çc][ãa]o|observa[çc][ãa]o)\s*:\s*/i,cap:/^figura\s+\d+\s*[-–—:]?\s*/i,img:/^\[\s*inserir\s+imagem\s*:?\s*/i}[k];const m=rx&&t.match(rx);return m?m[0]:''};
  const take=(k,p,extra)=>{if(E[k])return;const t=p.txt;const L=lab(k,t);const e={ps:pnPick(p.ps,PN_PSK),txt:pnClean(t).slice(0,180),...(extra||{})};
    if(L){e.tsLab=pnPick(pnRunAt(p,0),PN_TSK);let o=L.length;while(o<t.length&&/\s/.test(t[o]))o++;e.ts=pnPick(o<t.length?pnRunAt(p,o):pnRunAt(p,0),PN_TSK);e.label=L.trim()}
    else e.ts=pnPick(pnLongRun(p),PN_TSK);
    if(k==='cap'){const m=t.match(/^(figura)(\s+)(\d+)(\s*[-–—:]?\s*)/i);if(m){e.capPre=m[1];e.capSep=m[4]}}
    if(k==='img'){const m=t.match(/^(\[\s*inserir\s+imagem\s*:?\s*)([\s\S]*?)(\]?)\s*$/i);if(m){e.pre=m[1];e.suf=m[3]||']'}}
    E[k]=e};
  P.forEach((p,i)=>{if(p.kind!=='p')return;const t=pnClean(p.txt);if(!t)return;const nt=norm(t);
    const m=nt.match(rxCh);
    if(m&&t.length<60){const prev=P.slice(0,i).reverse().find(x=>x.kind!=='p'||pnClean(x.txt)||x.pb||x.img);const pb=!!(prev&&(prev.kind==='sb'||prev.pb))||!!p.ps.pageBreakBefore;
      if(!E.chapter){const mm=t.match(/^\s*(\d+)(\s*[.)\-–]\s*)/);take('chapter',p,{num:p.bullet?'list':(mm?'text':'none'),sep:mm?mm[2]:'. ',list:p.bullet?pnPreset(lists,p.bullet):null,pb})}else if(pb)E.chapter.pb=true;
      inBody=true;chapNst=p.ps.namedStyleType||null;return}
    if(!inBody)return;
    if(PN_RX.intro.test(t))return take('intro',p);
    if(PN_RX.antes.test(t))return take('antes',p);
    if(PN_RX.apos.test(t))return take('apos',p);
    if(PN_RX.nota.test(t))return take('nota',p);
    if(PN_RX.img.test(t))return take('img',p);
    if(PN_RX.cap.test(t))return take('cap',p);
    if(p.bullet&&!E.ul)return take('ul',p,{list:pnPreset(lists,p.bullet)});if(p.bullet)return;
    const nst=p.ps.namedStyleType||'NORMAL_TEXT';
    if(PN_HORD.includes(nst)&&nst!==chapNst){heads.push({nst,p});return}
    if(t.length>40&&!p.img)take('p',p)});
  const lv=[...new Set(heads.map(h=>h.nst))].sort((a,b)=>PN_HORD.indexOf(a)-PN_HORD.indexOf(b));
  ['secao','item','sub'].forEach((k,i)=>{if(lv[i])take(k,heads.find(h=>h.nst===lv[i]).p)});
  const named={};for(const s of pnNamedRaw(doc))named[s.namedStyleType]={ts:pnPick(s.textStyle,PN_TSK),ps:pnPick(s.paragraphStyle,['alignment','spaceAbove','spaceBelow','lineSpacing','indentStart','indentFirstLine'])};
  return {estilos:E,named,achados:Object.fromEntries(PN_KEYS.map(([k])=>[k,!!E[k]]))}}
/* estilo usado na escrita: o do modelo ou um padrão próximo do documento da JMJ */
const PN_DEF={json:{ps:{namedStyleType:'NORMAL_TEXT',shading:{backgroundColor:{color:{rgbColor:{red:.957,green:.957,blue:.949}}}},borderTop:{color:{color:{rgbColor:{red:.78,green:.78,blue:.76}}},width:{magnitude:.5,unit:'PT'},padding:{magnitude:2,unit:'PT'},dashStyle:'SOLID'},borderBottom:{color:{color:{rgbColor:{red:.78,green:.78,blue:.76}}},width:{magnitude:.5,unit:'PT'},padding:{magnitude:2,unit:'PT'},dashStyle:'SOLID'},borderLeft:{color:{color:{rgbColor:{red:.78,green:.78,blue:.76}}},width:{magnitude:.5,unit:'PT'},padding:{magnitude:2,unit:'PT'},dashStyle:'SOLID'},borderRight:{color:{color:{rgbColor:{red:.78,green:.78,blue:.76}}},width:{magnitude:.5,unit:'PT'},padding:{magnitude:2,unit:'PT'},dashStyle:'SOLID'},indentStart:{magnitude:6,unit:'PT'},indentEnd:{magnitude:6,unit:'PT'}},ts:{weightedFontFamily:{fontFamily:'Courier New'},fontSize:{magnitude:9,unit:'PT'}}},chapter:{ps:{namedStyleType:'HEADING_1'}},intro:{ps:{namedStyleType:'NORMAL_TEXT'}},secao:{ps:{namedStyleType:'HEADING_2'}},item:{ps:{namedStyleType:'HEADING_3'}},sub:{ps:{namedStyleType:'HEADING_4'}},p:{ps:{namedStyleType:'NORMAL_TEXT',alignment:'JUSTIFIED'}},
  antes:{ps:{namedStyleType:'NORMAL_TEXT',alignment:'JUSTIFIED'},tsLab:{bold:true},ts:{},label:'Antes:'},apos:{ps:{namedStyleType:'NORMAL_TEXT',alignment:'JUSTIFIED'},tsLab:{bold:true},ts:{},label:'Após Ajustes:'},nota:{ps:{namedStyleType:'NORMAL_TEXT'},tsLab:{bold:true},ts:{},label:'Importante:'},
  ul:{ps:{namedStyleType:'NORMAL_TEXT'},list:{preset:'BULLET_DISC_CIRCLE_SQUARE'}},img:{ps:{namedStyleType:'NORMAL_TEXT',alignment:'CENTER'},ts:{bold:true,backgroundColor:{color:{rgbColor:{red:1,green:.95,blue:.6}}}},pre:'[INSERIR IMAGEM: ',suf:']'},
  cap:{ps:{namedStyleType:'NORMAL_TEXT',alignment:'CENTER'},ts:{italic:true},capPre:'Figura',capSep:' - '}};
function pnSt(k){const d=pnDesign();return (d&&d.estilos&&d.estilos[k])||PN_DEF[k]||PN_DEF.p}
/* ---------- documento: ordem, figuras e parágrafos ---------- */
function pnSecList(v){const learned=(pnEstilo()&&pnEstilo().secoes)||[];const used=PN.itens.map(i=>i.secao).filter(Boolean);return [...new Set([...((v&&v.ordemSecoes)||[]),...learned,...PN_SEC0,...used])]}
function pnDocItems(v){const cls=pnClasses(v).map(c=>c.k);const secs=pnSecList(v);const ix=(a,x)=>{const i=a.indexOf(x);return i<0?999:i};
  return PN.itens.filter(i=>i.versaoId===v.id&&i.incluir&&!i.junto&&cls.includes(i.classe)).sort((a,b)=>ix(cls,a.classe)-ix(cls,b.classe)||ix(secs,a.secao||'')-ix(secs,b.secao||'')||String(a.secao||'').localeCompare(String(b.secao||''))||(a.ordemDoc??a.ordem??0)-(b.ordemDoc??b.ordem??0))}
function pnTree(v){const out=[];const all=pnDocItems(v);for(const c of pnClasses(v)){const its=all.filter(i=>i.classe===c.k);if(!its.length)continue;const secs=[];
    for(const it of its){let s=secs.find(x=>x.k===(it.secao||''));if(!s){s={k:it.secao||'',its:[]};secs.push(s)}s.its.push(it)}out.push({c,secs})}return out}
function pnFigs(v){const f=[];let n=0;for(const ch of pnTree(v))for(const s of ch.secs)for(const it of s.its)(it.blocos||[]).forEach((b,bi)=>{if(b.t==='img'){n++;f.push({n,it,bi,b})}});return f}
const pnLines=b=>(Array.isArray(b.itens)?b.itens:String(b.txt||'').split('\n')).map(x=>String(x).replace(/^\s*(?:[-*•●]|\d+[.)])\s+/,'').trim()).filter(Boolean);
const pnRich=t=>{const raw=String(t||'');const parts=raw.split('**');if(parts.length%2===0)return {txt:raw.replace(/\*\*/g,''),bolds:[]};
  let txt='';const bolds=[];parts.forEach((x,i)=>{if(i%2===1&&x){bolds.push([txt.length,txt.length+x.length])}txt+=x});return {txt,bolds}};
const pnPlain=t=>pnRich(t).txt;
const pnSplitP=t=>String(t||'').split(/\n\s*\n|\n/).map(x=>x.trim()).filter(Boolean);
function pnIntro(v,c){const t=c.intro||'A partir deste ponto, serão apresentadas as {classe} contempladas na versão {versao} do sistema {sistema}.';
  return t.replace(/\{classe\}/g,String(c.k).toLowerCase()).replace(/\{versao\}/g,v.versao||'').replace(/\{sistema\}/g,v.sistema||'JMJ CRM')}
function pnMarker(desc){const s=pnSt('img');return (s.pre||'[INSERIR IMAGEM: ')+String(desc||'').trim()+(s.suf||']')}
/* o Google Docs exige uma URL absoluta (http/https); cap.assets.upload() pode devolver um caminho relativo */
function pnAbsUrl(url){url=String(url||'');if(/^https?:\/\//i.test(url))return url;try{return new URL(url,location.href).href}catch(e){return url}}
function pnCaption(n,leg){const s=pnSt('cap');return `${s.capPre||'Figura'} ${n}${s.capSep||' - '}${String(leg||'').trim()}`}
/* lista plana de parágrafos: é a mesma para a prévia, para copiar e para gravar no Google Docs */
function pnParas(v){const P=[];let ci=0,fig=0;const ch0=pnSt('chapter');
  for(const ch of pnTree(v)){ci++;const num=ch0.num==='text'?`${ci}${ch0.sep||'. '}`:'';P.push({k:'chapter',txt:num+ch.c.k,n:ci});P.push({k:'intro',txt:pnIntro(v,ch.c)});
    for(const s of ch.secs){if(s.k)P.push({k:'secao',txt:s.k});
      for(const it of s.its){P.push({k:'item',txt:it.titulo||canonTit(it.origTitulo),itemId:it.id});
        (it.blocos||[]).forEach((b,bi)=>{const bid=it.id+':'+bi;
          if(b.t==='ul'){for(const li of pnLines(b))P.push({k:'ul',txt:li,bid,itemId:it.id,lab:pnUlLab(pnPlain(li))})}
          else if(b.t==='img'){fig++;const hasPrint=!!(b.print&&b.print.url);P.push({k:'img',txt:hasPrint?'':pnMarker(b.desc),itemId:it.id,bi,fig,print:hasPrint?b.print:null});P.push({k:'cap',txt:pnCaption(fig,b.legenda||b.desc),lab:(pnCaption(fig,'')).length,itemId:it.id,fig})}
          else if(b.t==='h'){const t=pnClean(b.txt);if(t)P.push({k:'sub',txt:t,itemId:it.id})}
          else if(b.t==='antes'||b.t==='apos'||b.t==='nota'){const ps=pnSplitP(b.txt);if(!ps.length)return;const L=pnSt(b.t).label||PN_DEF[b.t].label;P.push({k:b.t,txt:L+' '+ps[0],lab:L.length,itemId:it.id});ps.slice(1).forEach(x=>P.push({k:'p',txt:x,itemId:it.id}))}
          else if(b.t==='json'){for(const ln of String(b.txt||'').split('\n'))if(ln.trim()!=='')P.push({k:'json',txt:ln,itemId:it.id})}
          else for(const x of pnSplitP(b.txt))P.push({k:'p',txt:x,itemId:it.id})})}}}
  return P.map(p=>{const r=pnRich(String(p.txt).replace(/[\r\n\u000b]+/g,' '));return {...p,txt:r.txt,bolds:r.bolds}})}

/* ---------- prévia com o estilo do modelo ---------- */
const pnRGB=c=>{const r=c&&c.color&&c.color.rgbColor;if(!r)return'';const f=x=>Math.round((x||0)*255);return `rgb(${f(r.red)},${f(r.green)},${f(r.blue)})`};
function pnCss(ts,ps){const o=[];ts=ts||{};ps=ps||{};
  if(ts.fontSize&&ts.fontSize.magnitude)o.push(`font-size:${ts.fontSize.magnitude}pt`);
  if(ts.weightedFontFamily&&ts.weightedFontFamily.fontFamily)o.push(`font-family:'${String(ts.weightedFontFamily.fontFamily).replace(/'/g,'')}',Arial,sans-serif`);
  if(ts.weightedFontFamily&&ts.weightedFontFamily.weight)o.push(`font-weight:${ts.weightedFontFamily.weight}`);
  if(ts.bold===true)o.push('font-weight:700');else if(ts.bold===false)o.push('font-weight:400');
  if(ts.italic===true)o.push('font-style:italic');if(ts.underline===true)o.push('text-decoration:underline');
  const fg=pnRGB(ts.foregroundColor);if(fg)o.push('color:'+fg);const bg=pnRGB(ts.backgroundColor);if(bg)o.push('background:'+bg);
  const al={CENTER:'center',END:'right',JUSTIFIED:'justify',START:'left'}[ps.alignment];if(al)o.push('text-align:'+al);
  if(ps.spaceAbove&&ps.spaceAbove.magnitude!=null)o.push(`margin-top:${ps.spaceAbove.magnitude}pt`);if(ps.spaceBelow&&ps.spaceBelow.magnitude!=null)o.push(`margin-bottom:${ps.spaceBelow.magnitude}pt`);
  if(ps.indentStart&&ps.indentStart.magnitude)o.push(`padding-left:${ps.indentStart.magnitude}pt`);
  return o.join(';')}
function pnStyleFor(k,part){const s=pnSt(k);const d=pnDesign();const nst=(s.ps&&s.ps.namedStyleType)||'NORMAL_TEXT';const nm=(d&&d.named&&d.named[nst])||{};const base=d?((d.named&&d.named.NORMAL_TEXT)||{}):{};
  const ts={...(base.ts||{}),...(nm.ts||{}),...(part!=='lab'&&['chapter','secao','item','sub'].includes(k)?{bold:false}:{}),...((part==='lab'?(s.tsLab||(k==='ul'?{bold:true}:null)):s.ts)||{})};const ps={...(nm.ps||{}),...(s.ps||{})};
  return d?pnCss(ts,part==='lab'?{}:ps):''}
const PN_TAG={chapter:'h2',secao:'h3',item:'h4',sub:'h5'};
const pnLiStyle=()=>pnStyleFor('ul').replace(/padding-left:[^;]+;?/,'').replace(/margin-(top|bottom):[^;]+;?/g,'');
function pnUlPad(){const s=pnSt('ul');const m=s.ps&&s.ps.indentStart&&s.ps.indentStart.magnitude;return m?` style="padding-left:${m}pt"`:''}
function pnUlLab(x){const m=String(x||'').match(/^[^:]{1,60}:/);return m?m[0].length:0}
function pnInner(txt,lab,k,forCopy,bolds){const B=bolds||[];if(!lab&&!B.length)return esc(txt);
  const cuts=[...new Set([0,txt.length,lab||0,...B.flat()])].filter(x=>x>=0&&x<=txt.length).sort((a,b)=>a-b);let out='';
  for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1];if(b<=a)continue;const seg=txt.slice(a,b);
    if(lab&&a<lab){const sl=pnStyleFor(k,'lab')||(forCopy?'font-weight:700':'');out+=`<span${sl?` style="${sl}"`:''}${forCopy?'':' class="pk-lab"'}>${esc(seg)}</span>`}
    else if(B.some(([x,y])=>a>=x&&b<=y))out+=`<b${forCopy?'':' class="pk-b"'}>${esc(seg)}</b>`;
    else out+=esc(seg)}
  return out}
function pnParaHTML(p,forCopy){const tag=PN_TAG[p.k]||'p';const st=pnStyleFor(p.k)+(p.k==='json'?';background:#f4f4f2;padding:0 8px;white-space:pre':'');const cls=forCopy?'':` class="pk pk-${p.k}"`;
  const inner=(p.lab||(p.bolds&&p.bolds.length))?pnInner(p.txt,p.lab||0,p.k,forCopy,p.bolds):esc(p.txt);
  return `<${tag}${cls}${st?` style="${st}"`:''}>${inner}</${tag}>`}
function pnDocHTML(v,forCopy){const P=pnParas(v);let h='',i=0;
  while(i<P.length){const p=P[i];if(p.k==='ul'){let j=i;const lis=[];while(j<P.length&&P[j].k==='ul'&&P[j].bid===p.bid){lis.push(`<li${pnLiStyle()?` style="${pnLiStyle()}"`:''}>${pnInner(P[j].txt,P[j].lab||0,'ul',forCopy,P[j].bolds)}</li>`);j++}h+=`<ul${forCopy?'':' class="pk pk-ul"'}${pnUlPad()}>${lis.join('')}</ul>`;i=j;continue}h+=pnParaHTML(p,forCopy);i++}
  return h}

/* ---------- onde gravar no documento da versão ---------- */
function pnRegion(doc,v){const P=pnFlat(doc);const rxCh=pnChapRx(pnClasses(v).map(c=>c.k));const isCh=p=>p.kind==='p'&&pnClean(p.txt).length<60&&rxCh.test(norm(pnClean(p.txt)));
  const toc=P.findIndex(p=>p.kind==='toc');const i0=P.findIndex((p,i)=>i>toc&&isCh(p));
  const blank=p=>p.kind==='p'&&!pnClean(p.txt)&&!p.img&&!p.pb;
  const short=p=>{const t=pnClean(p.txt);return t.length<=40&&!PN_RX.cap.test(t)&&!/^HEADING_|^TITLE/.test(p.ps.namedStyleType||'')};
  /* contracapa: a partir da última quebra de página/seção, só textos curtos e imagens */
  let bc=-1;for(let j=P.length-1;j>Math.max(i0,toc);j--){const p=P[j];if(p.kind==='sb'||(p.kind==='p'&&p.pb)){if(P.slice(j+1).filter(x=>x.kind==='p'&&pnClean(x.txt)).every(short))bc=j;break}}
  if(i0>=0){let iEnd=(bc>=0?bc:P.length)-1;while(iEnd>i0&&(P[iEnd].kind!=='p'||blank(P[iEnd])||(P[iEnd].pb&&!pnClean(P[iEnd].txt))))iEnd--;
    if(P[iEnd].kind!=='p')iEnd=i0;
    const tables=P.slice(i0,iEnd+1).filter(x=>x.kind==='table').length;
    return {mode:'replace',at:P[i0].si,delEnd:P[iEnd].ei-1,first:pnClean(P[i0].txt),last:pnClean(P[iEnd].txt)||'(imagem)',count:P.slice(i0,iEnd+1).filter(x=>x.kind==='p').length,tables}}
  if(toc>=0){let j=toc+1;while(j<P.length&&blank(P[j]))j++;if(j<P.length&&P[j].kind==='p'&&P[j].pb&&!pnClean(P[j].txt))j++;
    if(j<P.length&&P[j].kind==='p')return {mode:'insert',at:P[j].si,where:'depois do Sumário'}}
  const lastP=[...P].reverse().find(p=>p.kind==='p');const tgt=bc>=0?P.slice(0,bc).reverse().find(p=>p.kind==='p'):lastP;
  return {mode:'append',at:(tgt?tgt.ei:2)-1,where:bc>=0?'antes da contracapa':'no fim do documento'}}
function pnOldVersions(doc,v){const P=pnFlat(doc);const all=P.filter(p=>p.kind==='p').map(p=>p.txt).join('\n');const set=new Set();
  for(const m of all.matchAll(/\b(\d+\.\d+\.\d+)\b/g))if(m[1]!==v.versao)set.add(m[1]);return [...set].slice(0,6)}

/* ---------- requests do Google Docs (batchUpdate) ---------- */
function pnRequests(paras,reg,opt){opt=opt||{};const R=[];const texts=paras.map(p=>p.txt);
  if(reg.mode==='replace'&&reg.delEnd>reg.at)R.push({deleteContentRange:{range:{startIndex:reg.at,endIndex:reg.delEnd}}});
  let text=texts.join('\n');let pos=reg.at;
  if(reg.mode==='insert')text+='\n';else if(reg.mode==='append'){text='\n'+text;pos=reg.at+1}
  R.push({insertText:{location:{index:reg.at},text}});
  const rg=[];for(const t of texts){rg.push([pos,pos+t.length]);pos+=t.length+1}
  const s0=rg[0][0],eN=rg[rg.length-1][1];
  const range=(a,b)=>({startIndex:a,endIndex:b});
  R.push({deleteParagraphBullets:{range:range(s0,eN+1)}});
  R.push({updateTextStyle:{range:range(s0,eN),textStyle:{},fields:PN_TSK.join(',')+',link'}});
  const ch=pnSt('chapter');
  if(ch.num==='list'&&ch.list){R.push({createParagraphBullets:{range:range(s0,eN+1),bulletPreset:ch.list.preset}});
    let i=0;while(i<paras.length){if(paras[i].k==='chapter'){i++;continue}let j=i;while(j+1<paras.length&&paras[j+1].k!=='chapter')j++;R.push({deleteParagraphBullets:{range:range(rg[i][0],rg[j][1]+1)}});i=j+1}}
  {let i=0;while(i<paras.length){if(paras[i].k!=='ul'){i++;continue}let j=i;while(j+1<paras.length&&paras[j+1].k==='ul'&&paras[j+1].bid===paras[i].bid)j++;
    R.push({createParagraphBullets:{range:range(rg[i][0],rg[j][1]+1),bulletPreset:(pnSt('ul').list&&pnSt('ul').list.preset)||'BULLET_DISC_CIRCLE_SQUARE'}});i=j+1}}
  let nch=0;
  paras.forEach((p,i)=>{const s=pnSt(p.k);const ps={...(s.ps||{})};if(!ps.namedStyleType)ps.namedStyleType='NORMAL_TEXT';
    if(p.k==='chapter'){nch++;if(s.pb&&(nch>1||opt.pbFirst))ps.pageBreakBefore=true}
    if(p.k==='json'){const first=i===0||paras[i-1].k!=='json',last=i===paras.length-1||paras[i+1].k!=='json';
      if(!first)delete ps.borderTop;if(!last)delete ps.borderBottom;ps.spaceAbove={magnitude:0,unit:'PT'};ps.spaceBelow={magnitude:0,unit:'PT'}}
    const fields=['namedStyleType','alignment','lineSpacing','spaceAbove','spaceBelow','indentFirstLine','indentStart','indentEnd','keepWithNext','keepLinesTogether','avoidWidowAndOrphan','pageBreakBefore','shading',...PN_PSK.filter(k=>/^border/.test(k)&&ps[k])];
    R.push({updateParagraphStyle:{range:range(rg[i][0],rg[i][1]+1),paragraphStyle:pnPick(ps,fields),fields:fields.join(',')}})});
  paras.forEach((p,i)=>{const [a,b]=rg[i];if(b<=a)return;const s=pnSt(p.k);const put=(x,y,ts)=>{const f=Object.keys(ts||{}).filter(k=>PN_TSK.includes(k));if(y>x&&f.length)R.push({updateTextStyle:{range:range(x,y),textStyle:pnPick(ts,f),fields:f.join(',')}})};
    const tl=s.tsLab||(p.k==='ul'?{bold:true}:null);if(p.lab&&tl){put(a,Math.min(b,a+p.lab),tl);put(Math.min(b,a+p.lab),b,s.ts)}else put(a,b,s.ts);(p.bolds||[]).forEach(([x,y])=>put(a+x,a+y,{bold:true}));if(['chapter','secao','item','sub'].includes(p.k))put(a,b,{bold:false})});
  /* imagens anexadas: insere do último parágrafo pro primeiro, assim os índices já usados acima não mudam */
  const PN_IMG_MAXW_PT=360;
  for(let i=paras.length-1;i>=0;i--){const p=paras[i];if(p.k!=='img'||!p.print||!p.print.url)continue;
    let w=PN_IMG_MAXW_PT,h=Math.round(w*3/4);
    if(p.print.w&&p.print.h){const natPt=p.print.w*72/96;w=natPt<PN_IMG_MAXW_PT?natPt:PN_IMG_MAXW_PT;h=Math.round(w*p.print.h/p.print.w)}
    R.push({insertInlineImage:{location:{index:rg[i][0]},uri:pnAbsUrl(p.print.url),objectSize:{width:{magnitude:w,unit:'PT'},height:{magnitude:h,unit:'PT'}}}})}
  for(const o of (opt.trocar||[]))R.push({replaceAllText:{containsText:{text:o,matchCase:true},replaceText:opt.versao}});
  return {requests:R,ranges:rg}}
/* ---------- dados ---------- */
function pnSubscribe(){if(PN.sub||!cap.db)return;PN.sub=true;
  const t=setTimeout(()=>{if(!PN.loaded){PN.err='A base demorou para responder. Recarregue a página.';if(pnView())render()}},10000);
  cap.db.collection('pnversoes').onSnapshot(s=>{clearTimeout(t);PN.vers=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(b.criadoEm||'').localeCompare(String(a.criadoEm||'')));PN.loaded=true;PN.err='';if(pnView())render()},
    e=>{clearTimeout(t);PN.err='Não foi possível ler as versões ('+(e.code||e.message)+').';if(pnView())render()});
  cap.db.collection('pnconfig').onSnapshot(s=>{PN.cfg={};s.docs.forEach(d=>PN.cfg[d.id]=d.data());if(pnView())render()},()=>{})}
function pnSubItens(vid){if(PN.subV===vid)return;PN.subV=vid;if(PN.unsubI){try{PN.unsubI()}catch(e){}PN.unsubI=null}PN.itens=[];PN.itLoaded=false;if(!vid||!cap.db)return;
  PN.unsubI=cap.db.collection('pnitens').where('versaoId','==',vid).onSnapshot(s=>{PN.itens=s.docs.map(d=>({id:d.id,...d.data()}));PN.itLoaded=true;if(pnView()&&!(PN.quiet&&Date.now()<PN.quiet))render()},e=>toast('Não foi possível ler os itens da versão: '+(e.code||e.message)))}
async function pnUpd(col,id,up){const arr=col==='pnitens'?PN.itens:PN.vers;const o=arr.find(x=>x.id===id);if(o)Object.assign(o,up);
  try{await cap.db.collection(col).doc(id).update(up)}catch(e){toast('Não foi possível salvar: '+(e.code||e.message));throw e}}
const pnSorted=v=>PN.itens.filter(i=>i.versaoId===v.id).sort((a,b)=>(a.ordem??0)-(b.ordem??0));

/* ---------- telas ---------- */
function pnStatusPill(v){const its=PN.itens.filter(i=>i.versaoId===v.id);
  if(v.enviadoEm)return '<span class="pill p-ok">Enviada ao Google Doc</span>';if(!v.triagemOk)return '<span class="pill p-warn">Triagem</span>';return '<span class="pill p-acc">Redação</span>'}
function patchHTML(){
  if(!PN.loaded)return `<div class="scrin"><div class="sk" style="height:64px;max-width:420px"></div><div class="splist"><div class="sk" style="height:150px"></div><div class="sk" style="height:150px"></div></div>${PN.err?`<div class="card empty">${esc(PN.err)}</div>`:''}</div>`;
  const d=pnDesign(),e=pnEstilo();
  return `<div class="scrin"><div class="scrhead"><div><h1>Patch Notes</h1><p class="small muted" style="margin:0">Monte o Documento de Atualização de Versão a partir do CSV da sprint no Artia e grave no Google Doc da versão.</p></div><span class="grow"></span><button id="pnCfgBtn">Modelo e estilo</button><button class="pri" id="pnNew">Nova versão</button></div>
  ${!d?`<div class="card pnsetup"><div class="row"><span class="pnstep-n">1</span><div class="grow" style="min-width:220px"><b>Ensine o design do documento</b><div class="small muted">Cole o link do Google Doc modelo. O Sprintboard lê os estilos de cada parte (capítulo, seção, título, Antes/Após, lista, marcação de imagem, legenda) e grava a versão exatamente nesse padrão.</div></div><button class="pri" id="pnCfgGo">Configurar modelo</button></div></div>`
   :`<div class="pncfgline small muted">Modelo: <a href="${esc(pnDocUrl(d.modeloId))}" target="_blank" rel="noopener">${esc(d.titulo||'documento modelo')}</a> · ${Object.values(d.achados||{}).filter(Boolean).length} de ${PN_KEYS.length} estilos lidos${e&&e.guia?` · estilo de escrita aprendido de ${(e.fontes||[]).length} versões`:' · <button class="linkbtn" id="pnLearnGo">aprender o estilo com versões anteriores</button>'}</div>`}
  ${PN.vers.length?`<div class="splist">${PN.vers.map(v=>`<button class="spcard" data-pnv="${esc(v.id)}"><span class="sptop"><span class="spcod">${esc(v.sistema||'JMJ CRM')}</span>${pnStatusPill(v)}</span><span class="spname">Versão ${esc(v.versao||'')}</span>${v.nome?`<span class="small">${esc(v.nome)}</span>`:''}<span class="small muted">${v.nItens!=null?`${v.nItens} itens no documento · `:''}criada em ${esc(fmtDT(v.criadoEm).slice(0,10))}${v.enviadoEm?` · enviada em ${esc(fmtDT(v.enviadoEm).slice(0,10))}`:''}</span></button>`).join('')}</div>`
   :`<div class="card empty">Nenhuma versão ainda. <button class="linkbtn" id="pnNew2">Começar pela versão desta sprint</button></div>`}</div>`}
function bindPatch(sc){const nw=()=>openPnNew();[$('#pnNew'),$('#pnNew2')].forEach(b=>b&&(b.onclick=nw));
  [$('#pnCfgBtn'),$('#pnCfgGo')].forEach(b=>b&&(b.onclick=()=>openPnCfg()));const lg=$('#pnLearnGo');if(lg)lg.onclick=()=>openPnCfg('estilo');
  sc.querySelectorAll('[data-pnv]').forEach(b=>b.onclick=()=>{PN.ver=b.dataset.pnv;nav('pnver')})}

function pnverHTML(){const v=pnV();if(!v)return PN.loaded?'<div class="scrin"><div class="card empty">Versão não encontrada. <button class="linkbtn" data-nav="patch">Voltar para as versões</button></div></div>':'<div class="scrin"><div class="sk" style="height:80px"></div><div class="sk" style="height:360px"></div></div>';
  if(!PN.itLoaded)return '<div class="scrin"><div class="sk" style="height:80px"></div><div class="sk" style="height:360px"></div></div>';
  const its=pnSorted(v);const doc=pnDocItems(v);const figs=pnFigs(v);const tab=PN.tab[v.id]||(v.triagemOk?'doc':'tri');
  const nGen=its.filter(i=>PN.gen.has(i.id)||i.status==='gerando').length,nErr=doc.filter(i=>i.status==='erro').length,nOk=doc.filter(i=>(i.blocos||[]).length).length;
  const cnt=k=>doc.filter(i=>i.classe===k).length;
  const canSend=!!pnDesign()&&!!v.docId&&doc.length&&nOk===doc.length&&!nGen;
  const sendTip=!pnDesign()?'Configure o modelo de design primeiro':!v.docId?'Informe o link do Google Doc da versão em Dados da versão':!doc.length?'Nenhum item no documento':nGen?'Espere o Claude terminar os textos':nOk<doc.length?'Há itens sem texto':'';
  return `<div class="scrin pnver"><div class="scrhead"><div><div class="small muted">${esc(v.sistema||'JMJ CRM')} · Nível de detalhes ${PN_NIVEIS[pnNivel(v)].t}${v.docId?` · <a href="${esc(pnDocUrl(v.docId))}" target="_blank" rel="noopener">abrir o Google Doc</a>`:' · sem Google Doc vinculado'}</div><h1>Versão ${esc(v.versao||'')}</h1>
    <div class="kpis"><span><b>${doc.length}</b> itens no documento</span>${pnClasses(v).map(c=>`<span><b>${cnt(c.k)}</b> ${esc(c.k.toLowerCase())}</span>`).join('')}<span><b>${figs.length}</b> imagens</span></div></div><span class="grow"></span>
    <button id="pnDados">Dados da versão</button><button id="pnCopy"${doc.length?'':' disabled'}>Copiar documento</button><button class="pri" id="pnSend"${canSend?'':` disabled aria-disabled="true" data-tip="${esc(sendTip)}"`}>${v.enviadoEm?'Enviar de novo ao Google Doc':'Enviar ao Google Doc'}</button></div>
  <div class="pnseg" role="tablist" aria-label="Etapas da versão">${[['tri','Triagem',its.filter(i=>i.incluir&&!i.junto).length+' de '+its.length],['doc','Documento',nGen?`escrevendo ${nGen}`:nErr?`${nErr} com erro`:`${nOk}/${doc.length}`]].map(([k,l,s],i)=>`<button role="tab" aria-selected="${tab===k}" data-pntab="${k}"><span class="pnstep-n">${i+1}</span>${l}<span class="small muted">${esc(s)}</span></button>`).join('')}</div>
  ${PN.work?`<div class="pnwork">${esc(PN.work)}</div>`:''}
  <div id="pnTabBody">${tab==='tri'?pnTriHTML(v,its):pnDocTabHTML(v,doc)}</div></div>`}
function bindPnver(sc){const v=pnV();if(!v)return;
  sc.querySelectorAll('[data-pntab]').forEach(b=>b.onclick=()=>{PN.tab[v.id]=b.dataset.pntab;render()});
  const dd=$('#pnDados');if(dd)dd.onclick=()=>openPnDados(v);const cp=$('#pnCopy');if(cp)cp.onclick=()=>pnCopyDoc(v);const sd=$('#pnSend');if(sd)sd.onclick=()=>pnSendStart(v);const tab=PN.tab[v.id]||(v.triagemOk?'doc':'tri');if(tab==='tri')bindPnTri(sc,v);else bindPnDoc(sc,v)}

/* ---------- 1. triagem: quais atividades entram, classificação, seção e título ---------- */
function pnTriHTML(v,its){const cls=pnClasses(v);const vis=its.filter(i=>PN.showProc||i.incluir||!PROC.test(i.origTitulo||''));const hid=its.length-vis.length;
  const leads=its.filter(i=>i.incluir&&!i.junto);
  return `<div class="card pntri"><div class="row" style="margin-bottom:6px"><h3 style="margin:0">Quais atividades entram na documentação?</h3><span class="grow"></span>${cap.sample?`<button id="pnRetri">${v.triado?'Sugerir de novo':'Pedir sugestão ao Claude'}</button>`:''}</div>
  <p class="small muted" style="margin:0 0 12px">${v.triado?'O Claude marcou o que entra, a classificação, a seção e o título de cada item. Confira, ajuste o que precisar e confirme.':'Marque as atividades que entram e escolha a classificação e a seção de cada uma.'} Atividades com o mesmo assunto podem virar um item só: use <b>Juntar com</b>.</p>
  <datalist id="pnSecDL">${pnSecList(v).map(s=>`<option value="${esc(s)}">`).join('')}</datalist>
  <div class="tblw"><table class="pntbl"><thead><tr><th class="c-ok"><span class="sr">Entra</span></th><th>Atividade do Artia</th><th>Classificação</th><th>Seção</th><th>Título no documento</th><th>Juntar com</th></tr></thead><tbody>
  ${vis.map(it=>{const j=it.junto?its.find(x=>x.id===it.junto):null;const off=!it.incluir;return `<tr class="${off?'off':''}${j?' jn':''}" data-pnrow="${esc(it.id)}">
    <td class="c-ok"><input type="checkbox" data-pnf="incluir" aria-label="Incluir ${esc(it.origTitulo)}"${it.incluir?' checked':''}></td>
    <td class="c-at"><div class="pnat">${esc(it.origTitulo)}</div>${it.motivo?`<div class="small muted">${esc(it.motivo)}</div>`:''}</td>
    <td><select data-pnf="classe" aria-label="Classificação"${off||j?' disabled':''}><option value="">—</option>${cls.map(c=>`<option${it.classe===c.k?' selected':''}>${esc(c.k)}</option>`).join('')}</select></td>
    <td><input type="text" list="pnSecDL" data-pnf="secao" aria-label="Seção" value="${esc(it.secao||'')}" placeholder="Ex.: CRM API"${off||j?' disabled':''}></td>
    <td><input type="text" data-pnf="titulo" aria-label="Título no documento" value="${esc(it.titulo||'')}" placeholder="${esc(canonTit(it.origTitulo))}"${off||j?' disabled':''}></td>
    <td><select data-pnf="junto" aria-label="Juntar com outro item"${off?' disabled':''}><option value="">—</option>${leads.filter(x=>x.id!==it.id).map(x=>`<option value="${esc(x.id)}"${it.junto===x.id?' selected':''}>${esc((x.titulo||canonTit(x.origTitulo)).slice(0,60))}</option>`).join('')}</select></td></tr>`}).join('')}
  </tbody></table></div>
  <div class="row" style="margin-top:12px">${hid?`<button class="linkbtn" id="pnShowProc">Mostrar ${hid} atividade${hid>1?'s':''} de processo (reuniões, homologação, WAR…)</button>`:PN.showProc?'<button class="linkbtn" id="pnShowProc">Ocultar atividades de processo</button>':''}<span class="grow"></span>
  <span class="small muted">${leads.length} ite${leads.length===1?'m':'ns'} no documento</span><button class="pri" id="pnTriOk"${leads.length?'':' disabled'}>${v.triagemOk?'Salvar e escrever os novos itens':'Confirmar e escrever os textos'}</button></div></div>`}
function bindPnTri(sc,v){
  sc.querySelectorAll('[data-pnrow]').forEach(tr=>{const id=tr.dataset.pnrow;tr.querySelectorAll('[data-pnf]').forEach(el=>{
    el.onchange=async()=>{const f=el.dataset.pnf;let val=el.type==='checkbox'?el.checked:el.value.trim();const up={[f]:f==='junto'?(val||null):val};
      if(f==='incluir'&&val){const it=PN.itens.find(x=>x.id===id);if(it&&!it.classe)up.classe=pnClasses(v)[pnGuessFix(it.origTitulo)?0:1]?.k||'';if(it&&!it.titulo)up.titulo=canonTit(it.origTitulo)}
      if(f==='incluir'&&!val){PN.itens.filter(x=>x.junto===id).forEach(x=>pnUpd('pnitens',x.id,{junto:null}).catch(()=>{}));up.junto=null}
      if(f==='titulo')up.tituloFixo=true;
      try{await pnUpd('pnitens',id,up)}catch(e){}render()}})});
  const sp=$('#pnShowProc');if(sp)sp.onclick=()=>{PN.showProc=!PN.showProc;render()};
  const rt=$('#pnRetri');if(rt)rt.onclick=()=>{if(v.triado)costAsk('retri','Sugerir a triagem de novo?','O Claude vai reler todas as atividades da sprint e refazer a sugestão. Isso usa o seu limite do Claude.',()=>pnTriage(v,rt),{tipo:'retri',verId:v.id,titulo:'Refazer a triagem · versão '+(v.versao||'')});else pnTriage(v,rt)};
  const ok=$('#pnTriOk');if(ok)ok.onclick=async()=>{const leads=PN.itens.filter(i=>i.versaoId===v.id&&i.incluir&&!i.junto);const sem=leads.filter(i=>!i.classe);
    if(sem.length){toast(`Escolha a classificação de: ${sem.map(i=>canonTit(i.origTitulo).slice(0,40)).join(', ')}.`,6000);return}
    await pnUpd('pnversoes',v.id,{triagemOk:true,nItens:leads.length});PN.tab[v.id]='doc';render();
    const todo=leads.filter(i=>!(i.blocos||[]).length&&i.status!=='gerando');if(todo.length)pnQueue(todo.map(i=>i.id))}}
const pnGuessFix=t=>/corre[çc][ãa]o|\bbug\b|\berro\b|n[ãa]o (exib|grav|carreg|funcion|aparec|envia|salv)|falha|indevid|incorret/i.test(String(t||''));
async function pnTriage(v,btn){if(!cap.sample){toast('O acesso ao Claude não está disponível nesta página.');return}
  const its=pnSorted(v);const cls=pnClasses(v);const e=pnEstilo();btnLoad(btn,true);PN.work='O Claude está lendo as atividades e sugerindo a triagem…';render();
  const lista=its.map((x,i)=>`#${i} ${x.origTitulo}\n${String(x.origDescricao||'').replace(/\s+/g,' ').slice(0,1500)}`).join('\n\n');
  const prompt=`Você prepara a triagem do "Documento de Atualização de Versão" do sistema ${v.sistema||'JMJ CRM'} (versão ${v.versao}). Esse documento é lido pelas operadoras clientes e pelo suporte e descreve o que mudou no sistema: correções e melhorias, agrupadas por seção (área do sistema).

Abaixo estão as atividades exportadas da sprint no Artia (título e começo da descrição). Para cada uma, decida:
- "incluir": true só se a atividade muda o comportamento do sistema para quem usa ou integra (tela, regra, endpoint, relatório, dashboard, e-mail, parâmetro). false para atividades de processo e de time (reuniões, análise/quebra/revisão de requisitos, modelo de dados, questionários, mensuração, atualização em homologação/produção, geração de WAR/imagem, testes da versão, documentação, preparação de ambiente), atividades canceladas ("CANCELADA" no título) e as que não mudam nada visível.
- "classe": uma destas: ${cls.map(c=>`"${c.k}"`).join(', ')}. Correção = o sistema fazia algo errado e passou a fazer certo (erro, falha, comportamento indevido). Melhoria = funcionalidade nova, ajuste pedido, parâmetro, endpoint, filtro, campo, regra nova.
- "secao": a área do sistema onde a mudança aparece, curta, no padrão das seções do documento. Use uma destas quando servir: ${pnSecList(v).slice(0,30).join(', ')}. Mudança só de API/integração vai em "CRM API".
- "titulo": o título do item no documento, com o nome da funcionalidade como o usuário conhece, no padrão "Tela/Funcionalidade - Aspecto" (ex.: "Especialidades - Tela de Pesquisa", "Gestão de Atendimentos - Novos Filtros", "Anexos do Protocolo - Player de Áudio") ou "Endpoint “Nome do endpoint”". Sem GLPI, sem número de atividade, sem nome de cliente.
- "juntar": quando duas ou mais atividades tratam da mesma funcionalidade e devem virar um único item do documento (ex.: 3 e 3.1 do mesmo assunto, ou partes de uma mesma entrega), coloque em "juntar" o número (#) da atividade principal do grupo; na principal deixe null.
- "motivo": até 12 palavras explicando a decisão.
${e&&e.guia?`\nComo os documentos anteriores costumam organizar seções e títulos:\n${String(e.guia).slice(0,4000)}\n`:''}
Responda APENAS com JSON: {"itens":[{"i":0,"incluir":true,"classe":"","secao":"","titulo":"","juntar":null,"motivo":""}]} com um objeto para cada atividade, na mesma ordem.

Atividades:
${lista}`;
  try{const r=await aiJ('triagem',prompt,{modelTier:'default'});const arr=Array.isArray(r&&r.itens)?r.itens:Array.isArray(r)?r:[];
    if(!arr.length)throw new Error('O Claude não devolveu a triagem.');
    for(const x of arr){const it=its[+x.i];if(!it)continue;const lead=x.juntar!=null&&its[+x.juntar]&&+x.juntar!==+x.i?its[+x.juntar].id:null;
      const up={incluir:!!x.incluir,classe:cls.some(c=>c.k===x.classe)?x.classe:(x.incluir?cls[pnGuessFix(it.origTitulo)?0:Math.min(1,cls.length-1)].k:''),secao:String(x.secao||'').trim().slice(0,80),motivo:String(x.motivo||'').slice(0,160),junto:x.incluir?lead:null};
      if(!it.tituloFixo)up.titulo=String(x.titulo||canonTit(it.origTitulo)).trim().slice(0,160);
      await pnUpd('pnitens',it.id,up)}
    for(const it of its){if(it.junto&&!PN.itens.find(x=>x.id===it.junto&&x.incluir&&!x.junto))await pnUpd('pnitens',it.id,{junto:null})}
    await pnUpd('pnversoes',v.id,{triado:true});toast('Triagem sugerida. Confira antes de confirmar.',4200,{kind:'ok'})}
  catch(err){if(!v.triado)for(const it of its){await pnUpd('pnitens',it.id,{incluir:!PROC.test(it.origTitulo||''),classe:PROC.test(it.origTitulo||'')?'':cls[pnGuessFix(it.origTitulo)?0:Math.min(1,cls.length-1)].k,titulo:it.titulo||canonTit(it.origTitulo)}).catch(()=>{})}
    toast(err.code==='not_granted'?'O acesso ao Claude não foi liberado nesta página. Marque a triagem manualmente.':'Não consegui sugerir a triagem ('+(err.code||err.message)+'). Marque manualmente ou tente de novo.',6500)}
  finally{PN.work='';btnLoad(btn,false);render()}}
/* ---------- 2. documento: prévia no padrão do modelo, edição por item ---------- */
function pnDocTabHTML(v,doc){
  if(!v.triagemOk)return `<div class="card empty">Confirme a triagem para o Claude escrever os textos. <button class="linkbtn" data-pntab="tri">Ir para a triagem</button></div>`;
  if(!doc.length)return `<div class="card empty">Nenhuma atividade marcada para entrar. <button class="linkbtn" data-pntab="tri">Voltar para a triagem</button></div>`;
  const tree=pnTree(v);let fig=0;let ci=0;const ch0=pnSt('chapter');
  const outline=`<nav class="pnout card" aria-label="Estrutura do documento">${tree.map((ch,i)=>`<div class="pnoc"><b>${ch0.num!=='none'?(i+1)+'. ':''}${esc(ch.c.k)}</b>${ch.secs.map((s,si)=>`<div class="pnos"><div class="row pnosh"><span class="grow">${esc(s.k||'Sem seção')}</span>${ch.secs.length>1?`${ib('up','Subir seção',`data-pnsec="${esc(s.k)}" data-dir="-1"${si===0?' disabled':''}`)}${ib('down','Descer seção',`data-pnsec="${esc(s.k)}" data-dir="1"${si===ch.secs.length-1?' disabled':''}`)}`:''}</div>${s.its.map(it=>`<a href="#pni-${esc(it.id)}" class="pnoi${it.status==='erro'?' err':''}">${PN.gen.has(it.id)||it.status==='gerando'?'<span class="spin sm"></span>':''}${esc(it.titulo||canonTit(it.origTitulo))}</a>`).join('')}</div>`).join('')}</div>`).join('')}</nav>`;
  const body=tree.map(ch=>{ci++;const num=ch0.num==='text'?`${ci}${ch0.sep||'. '}`:ch0.num==='list'?`${ci}. `:'';
    return pnParaHTML({k:'chapter',txt:num+ch.c.k})+pnParaHTML({k:'intro',txt:pnIntro(v,ch.c)})+ch.secs.map(s=>(s.k?pnParaHTML({k:'secao',txt:s.k}):'')+s.its.map(it=>{
      const busy=PN.gen.has(it.id)||it.status==='gerando';const n0=fig;fig+=(it.blocos||[]).filter(b=>b.t==='img').length;
      const juntos=PN.itens.filter(x=>x.junto===it.id);
      return `<section class="pnit${busy?' pngen':''}${it.status==='erro'?' err':''}" id="pni-${esc(it.id)}" data-k="pn:${esc(it.id)}" aria-label="${esc(it.titulo||'')}"><div class="pnit-tools">${busy?'<span class="pnchip"><span class="spin sm"></span>Escrevendo…</span>':`${it.editadoEm?'<span class="pnchip">Editado</span>':''}${ib('edit','Editar item',`data-pned="${esc(it.id)}"`)}${cap.sample?ib('redo','Pedir ajuste ao Claude',`data-pnre="${esc(it.id)}"`):''}${ib('up','Subir item',`data-pnmv="${esc(it.id)}" data-dir="-1"`)}${ib('down','Descer item',`data-pnmv="${esc(it.id)}" data-dir="1"`)}`}</div>
        ${pnParaHTML({k:'item',txt:it.titulo||canonTit(it.origTitulo)})}
        ${busy&&!(it.blocos||[]).length?'<div class="sk" style="height:90px;margin:6px 0"></div>':it.status==='erro'&&!(it.blocos||[]).length?`<div class="pnerr">Não consegui escrever este item (${esc(it.erro||'erro')}). <button class="linkbtn" data-pngen="${esc(it.id)}">Tentar de novo</button></div>`:pnItemBody(it,n0)}
        <div class="pnsrc small">${esc(it.origTitulo)}${juntos.length===1?' + 1 atividade junta':juntos.length?` + ${juntos.length} atividades juntas`:''}${(it.perguntas||[]).length?` · ${it.perguntas.length} resposta${it.perguntas.length>1?'s':''} sua${it.perguntas.length>1?'s':''} usada${it.perguntas.length>1?'s':''}`:''}</div></section>`}).join('')).join('')}).join('');
  const nGen2=doc.filter(i=>PN.gen.has(i.id)||i.status==='gerando').length,nOk2=doc.filter(i=>(i.blocos||[]).length).length;
  const canSend2=!!pnDesign()&&!!v.docId&&doc.length&&nOk2===doc.length&&!nGen2;
  const sendTip2=!pnDesign()?'Configure o modelo de design primeiro':!v.docId?'Informe o link do Google Doc da versão em Dados da versão':!doc.length?'Nenhum item no documento':nGen2?'Espere o Claude terminar os textos':nOk2<doc.length?'Há itens sem texto':'';
  const fin=`<div class="pnfin"><button class="pri" id="pnFin"${canSend2?'':` disabled aria-disabled="true" data-tip="${esc(sendTip2)}"`}>${v.enviadoEm?'Finalizar e enviar de novo ao Google Doc':'Finalizar e enviar ao Google Doc'}</button></div>`;
  return `<div class="pndoc">${outline}<div class="pnpaper-wrap"><article class="pnpaper">${body}</article>${fin}</div></div>`}
function pnItemBody(it,n0){const v={versao:''};let f=n0;let h='';(it.blocos||[]).forEach((b,bi)=>{const bk=it.id+':'+bi;const bgen=PN.bgen.has(bk);const ed=`<div class="pnlive" contenteditable="${bgen?'false':'true'}" spellcheck="true" data-pnit="${esc(it.id)}" data-bi="${bi}">`;
  const aiB=cap.sample&&!PN.gen.has(it.id)?`<button type="button" class="pnbai" data-pnbai="${esc(bk)}" aria-label="Editar este bloco com o Claude" data-tip="Editar este bloco com o Claude"${bgen?' disabled':''}>${bgen?'<span class="spin sm"></span>':ksvg(KIC.spark,'')}</button>`:'';
  const ce=(html)=>{h+=`<div class="pnbw${bgen?' pnbgen':''}">${aiB}${ed}${html}</div>${bgen?'<span class="pnbchip">O Claude está editando este bloco…</span>':''}</div>`};
  if(b.t==='ul'){ce(`<ul class="pk pk-ul"${pnUlPad()}>${pnLines(b).map(x=>{const r=pnRich(x);return `<li${pnLiStyle()?` style="${pnLiStyle()}"`:''}>${pnInner(r.txt,pnUlLab(r.txt),'ul',false,r.bolds)}</li>`}).join('')}</ul>`);return}
  if(b.t==='img'){f++;const cap1=pnParaHTML({k:'cap',txt:pnCaption(f,b.legenda||b.desc),lab:pnCaption(f,'').length});
    const figX=`<button type="button" class="pnfigx" data-pfrm aria-label="Tirar esta figura do documento" data-tip="Tirar a figura do documento">${ICO('close')}</button>`;
    const capIn=`<label class="pncapin"><span>Legenda</span><input type="text" data-pfcap maxlength="240" value="${esc(b.legenda||'')}" placeholder="Texto depois de “Figura ${f} -”" aria-label="Legenda da figura ${f}"></label>`;
    if(b.print&&b.print.url){h+=`<div class="pnimgblk" data-pnfig="${esc(it.id)}:${bi}">${figX}<div class="pnthumb"><img src="${esc(b.print.url)}" alt="Print da figura ${f}"></div><div class="row pnfact"><button data-pfcopy>${ICO('copy')} Copiar print</button><span class="grow"></span>${cap.downloads?ib('download','Baixar o print','data-pfdl'):''}${cap.assets?`<label class="ib" data-tip="Trocar o print" aria-label="Trocar o print" style="cursor:pointer">${ICO('redo')}<input type="file" accept="image/*" data-pffile hidden></label>`:''}${ib('trash','Tirar o print','data-pfdel','ib-bad')}</div>${capIn}</div>`+cap1;return}
    h+=`<div class="pnimgblk pnimgblk-empty" data-pnfig="${esc(it.id)}:${bi}">${figX}${b.desc?`<div class="small muted" style="margin-bottom:6px">${esc(b.desc)}</div>`:''}${cap.assets?`<div class="row"><div class="pastebox pnpaste" tabindex="0" data-pfpaste title="Clique e cole com Ctrl+V">Clique e cole o print (Ctrl+V)</div><label class="pastebox" style="cursor:pointer">Escolher imagem<input type="file" accept="image/*" data-pffile hidden></label></div>`:`<div class="pnmarkerph">${esc(pnMarker(b.desc))}</div>`}${capIn}</div>`+cap1;return}
  if(b.t==='h'){ce(pnParaHTML({k:'sub',txt:pnClean(b.txt)}));return}
  if(b.t==='antes'||b.t==='apos'||b.t==='nota'){const ps=pnSplitP(b.txt);if(!ps.length)return;const L=pnSt(b.t).label||PN_DEF[b.t].label;const r=pnRich(L+' '+ps[0]);let x2='';x2+=pnParaHTML({k:b.t,txt:r.txt,lab:L.length,bolds:r.bolds});ps.slice(1).forEach(x=>{const q=pnRich(x);x2+=pnParaHTML({k:'p',txt:q.txt,bolds:q.bolds})});ce(x2);return}
  if(b.t==='json'){ce(String(b.txt||'').split('\n').filter(ln=>ln.trim()!=='').map(ln=>pnParaHTML({k:'json',txt:ln})).join(''));return}
  ce(pnSplitP(b.txt).map(x=>{const q=pnRich(x);return pnParaHTML({k:'p',txt:q.txt,bolds:q.bolds})}).join(''))});return h}
/* edição direta no documento: clique no texto, Ctrl+B negrita; ao sair do bloco, grava */
function pnSerInline(n){if(n.nodeType===3)return n.nodeValue.replace(/\u00a0/g,' ');if(n.nodeType!==1)return '';if(n.tagName==='BR')return '\n';
  const inner=[...n.childNodes].map(pnSerInline).join('');
  if(n.tagName==='B'||n.tagName==='STRONG'){const tr=inner.trim();if(!tr)return inner;const lead=inner.match(/^\s*/)[0],tail=inner.match(/\s*$/)[0];return lead+'**'+tr+'**'+tail}
  return inner}
function pnBlkFromDom(el,old){const t=old.t;if(!t||t==='img')return null;
  if(t==='ul'){const lis=[...el.querySelectorAll('li')];const itens=lis.length?lis.map(li=>pnSerInline(li)):pnSerInline(el).split('\n');return pnNormBlocks([{t:'ul',itens}])[0]||null}
  const kids=[...el.children];const paras=kids.length?kids.map(c=>pnSerInline(c)):[pnSerInline(el)];
  const txt=paras.map(x=>x.replace(/[ \t]+/g,' ').trim()).filter(Boolean).join('\n\n');
  return pnNormBlocks([{t,txt}])[0]||null}
async function pnSaveBlk(el){const it=PN.itens.find(x=>x.id===el.dataset.pnit);if(!it||PN.gen.has(it.id))return;const bi=+el.dataset.bi;const old=(it.blocos||[])[bi];if(!old)return;
  const nb=pnBlkFromDom(el,old);if(!nb){toast('Texto vazio: não salvei este bloco.',3000);render();return}
  if(JSON.stringify(nb)===JSON.stringify(old))return;
  const blocos=(it.blocos||[]).slice();blocos[bi]=nb;
  PN.quiet=Date.now()+4000;
  try{await pnUpd('pnitens',it.id,{blocos,editadoEm:nowISO()})}catch(e){render()}}
document.addEventListener('focusout',e=>{const el=e.target.closest&&e.target.closest('.pnlive[data-pnit]');if(el)pnSaveBlk(el)});
function bindPnDoc(sc,v){
  sc.querySelectorAll('[data-pntab]').forEach(b=>b.onclick=()=>{PN.tab[v.id]=b.dataset.pntab;render()});
  const fn=$('#pnFin');if(fn)fn.onclick=()=>pnSendStart(v);
  sc.querySelectorAll('[data-pned]').forEach(b=>b.onclick=()=>openPnItem(v,b.dataset.pned));
  sc.querySelectorAll('[data-pnre]').forEach(b=>b.onclick=()=>openPnAjuste(v,b.dataset.pnre));
  sc.querySelectorAll('[data-pngen]').forEach(b=>b.onclick=()=>pnQueue([b.dataset.pngen]));
  sc.querySelectorAll('[data-pnmv]').forEach(b=>b.onclick=()=>pnMove(v,b.dataset.pnmv,+b.dataset.dir));
  sc.querySelectorAll('[data-pnsec]').forEach(b=>b.onclick=()=>pnMoveSec(v,b.dataset.pnsec,+b.dataset.dir));
  sc.querySelectorAll('.pnout a[href^="#pni-"]').forEach(a=>a.onclick=e=>{e.preventDefault();const t=document.getElementById(a.getAttribute('href').slice(1));if(t){t.scrollIntoView({behavior:'smooth',block:'start'});t.classList.remove('flash');void t.offsetWidth;t.classList.add('flash')}})
  /* anexar/trocar/remover o print de uma figura, direto na aba Documento */
  const blockOf=el=>{const [id,bi]=el.closest('[data-pnfig]').dataset.pnfig.split(':');const it=PN.itens.find(x=>x.id===id);return {it,bi:+bi,b:it&&(it.blocos||[])[+bi]}};
  const imgDims=url=>new Promise(res=>{const im=new Image();im.onload=()=>res({w:im.naturalWidth,h:im.naturalHeight});im.onerror=()=>res(null);im.src=url});
  const setPrint=async(el,file0)=>{const {it,bi}=blockOf(el);if(!it||!file0)return;if(!/^image\//.test(file0.type||'')){toast('Escolha uma imagem.');return}
    const file=file0;
    const bz=busy('Enviando o print…');try{const r=await cap.assets.upload(file);const url=pnAbsUrl(r.url);const dim=await imgDims(url);
      const bl=JSON.parse(JSON.stringify(it.blocos||[]));bl[bi]={...bl[bi],print:{assetId:r.id,url,nome:file.name||'print.png',tipo:r.contentType||file.type,...(dim?{w:dim.w,h:dim.h}:{})}};
      await pnUpd('pnitens',it.id,{blocos:bl});render()}
    catch(e){toast('Não foi possível enviar o print: '+(e.code||e.message))}finally{bz.done()}};
  sc.querySelectorAll('[data-pfpaste]').forEach(p=>{p.onpaste=e=>{const f=[...(e.clipboardData&&e.clipboardData.files||[])].find(x=>/^image\//.test(x.type));if(f){e.preventDefault();setPrint(p,f)}else toast('Não encontrei imagem na área de transferência.')}});
  sc.querySelectorAll('[data-pffile]').forEach(i=>i.onchange=()=>setPrint(i,i.files[0]));
  sc.querySelectorAll('[data-pfcopy]').forEach(b=>b.onclick=()=>{const {b:bl}=blockOf(b);if(bl&&bl.print)pnCopyImg(bl.print.url,b)});
  sc.querySelectorAll('[data-pfdl]').forEach(b=>b.onclick=async()=>{const {b:bl,it}=blockOf(b);if(!bl||!bl.print)return;try{const blob=await (await fetch(bl.print.url)).blob();const ext=(blob.type.split('/')[1]||'png').replace('jpeg','jpg');await cap.downloads.save({filename:`figura-${(it.titulo||'item').normalize('NFD').replace(/[^\w]+/g,'-').slice(0,40)}.${ext}`,data:blob})}catch(e){if(e&&e.code!=='declined')toast('Não foi possível baixar: '+(e.code||e.message))}});
  sc.querySelectorAll('[data-pfrm]').forEach(b=>b.onclick=async()=>{const {it,bi}=blockOf(b);if(!it)return;const prev=JSON.parse(JSON.stringify(it.blocos||[]));const bl=prev.slice();bl.splice(bi,1);
    try{await pnUpd('pnitens',it.id,{blocos:bl,editadoEm:nowISO()})}catch(e){toast('Não foi possível tirar a figura: '+(e.code||e.message));return}render();
    toastUndo('Figura tirada do documento.','Desfazer',async()=>{await pnUpd('pnitens',it.id,{blocos:prev});render()},10000,{kind:'del'})});
  sc.querySelectorAll('[data-pfcap]').forEach(inp=>{const save=async()=>{const {it,bi,b}=blockOf(inp);if(!it||!b)return;const v2=inp.value.replace(/\s+/g,' ').trim().slice(0,240);if(v2===(b.legenda||''))return;
      const bl=JSON.parse(JSON.stringify(it.blocos||[]));bl[bi]={...bl[bi],legenda:v2};try{await pnUpd('pnitens',it.id,{blocos:bl,editadoEm:nowISO()});render()}catch(e){toast('Não foi possível salvar a legenda: '+(e.code||e.message))}};
    inp.onchange=save;inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();inp.blur()}if(e.key==='Escape'){const {b}=blockOf(inp);inp.value=(b&&b.legenda)||'';inp.blur()}}});
  sc.querySelectorAll('[data-pnbai]').forEach(b=>b.onclick=()=>{const [id,bi]=b.dataset.pnbai.split(':');openPnBlockAI(v,id,+bi)});
  sc.querySelectorAll('[data-pfdel]').forEach(b=>b.onclick=async()=>{const {it,bi}=blockOf(b);const bl=JSON.parse(JSON.stringify(it.blocos||[]));const old=bl[bi].print;delete bl[bi].print;await pnUpd('pnitens',it.id,{blocos:bl}).catch(()=>{});render();
    toastUndo('Print retirado da figura.','Desfazer',async()=>{const cur=JSON.parse(JSON.stringify((PN.itens.find(x=>x.id===it.id)||it).blocos||[]));if(cur[bi]){cur[bi].print=old;await pnUpd('pnitens',it.id,{blocos:cur});render()}},8000)})}
async function pnMove(v,id,dir){const it=PN.itens.find(x=>x.id===id);if(!it)return;const sib=pnDocItems(v).filter(x=>x.classe===it.classe&&(x.secao||'')===(it.secao||''));const i=sib.indexOf(it),j=i+dir;if(j<0||j>=sib.length)return;
  sib.forEach((x,k)=>x.ordemDoc=k);[sib[i],sib[j]]=[sib[j],sib[i]];for(let k=0;k<sib.length;k++)await pnUpd('pnitens',sib[k].id,{ordemDoc:k}).catch(()=>{});render()}
async function pnMoveSec(v,sec,dir){const order=pnSecList(v);const used=[...new Set(pnDocItems(v).map(i=>i.secao||''))];const cur=used.indexOf(sec),nx=cur+dir;if(cur<0||nx<0||nx>=used.length)return;
  [used[cur],used[nx]]=[used[nx],used[cur]];const rest=order.filter(s=>!used.includes(s));await pnUpd('pnversoes',v.id,{ordemSecoes:[...used,...rest].filter(Boolean).slice(0,80)}).catch(()=>{});render()}

/* ---------- escrita dos itens pelo Claude ---------- */
const PNQ=[];let pnRun=0;
function pnQueue(ids){for(const id of ids)if(!PNQ.includes(id)&&!PN.gen.has(id))PNQ.push(id);pnPump()}
function pnPump(){while(pnRun<2&&PNQ.length){const id=PNQ.shift();pnRun++;pnGen(id).finally(()=>{pnRun--;pnPump()})}}
const PN_NIVEIS={baixo:{t:'Baixo'},medio:{t:'Médio'},alto:{t:'Alto'}};
function pnNivel(v){return PN_NIVEIS[v&&v.nivel]?v.nivel:'alto'}
function pnNivelRegra(v){const n=pnNivel(v);
  if(n==='baixo')return 'Nível de detalhes BAIXO: texto simples, objetivo e fácil de ler, direcionado ao cliente de uso geral. Não cite endpoints, nomes de API, campos técnicos, propriedades nem códigos HTTP. Descreva o que a pessoa vê e faz no sistema, em linguagem de usuário.';
  if(n==='medio')return 'Nível de detalhes MÉDIO: objetivo, com os detalhes que a equipe de tecnologia reconhece. Quando a mudança for de API, cite o nome dos endpoints (ex.: POST /…), sem detalhar propriedades de request e response nem códigos HTTP.';
  return 'Nível de detalhes ALTO: texto direcionado ao cliente, mas com detalhes de TI. Quando a mudança for de API ou integração, cite endpoints, propriedades de request e response, códigos HTTP e regras técnicas.';}
function pnRules(v){const sis=v.sistema||'JMJ CRM';return `Regras do texto (Documento de Atualização de Versão do ${sis}):
- Público: operadoras clientes e suporte. Português do Brasil, formal, objetivo e impessoal. Nada de primeira pessoa.
- Descreva o comportamento do sistema, não o trabalho feito. Nunca cite GLPI, Artia, sprint, atividade, desenvolvedor, teste, homologação, quem pediu, nomes de tabelas, colunas, packages, classes ou detalhes de banco de dados. ${pnNivelRegra(v)}
- Use os nomes como aparecem na tela: menus como caminho com ">" (ex.: Cadastros > Especialidades); telas, botões, campos e filtros com a grafia do sistema; nomes de dashboards, endpoints, opções e mensagens entre aspas curvas “ ”.
- Correções: use o par de blocos "antes" e "apos". "antes" no passado, dizendo onde e o que acontecia de errado e o impacto ("Ao acessar … e acionar …, a aplicação apresentava …, impedindo …"). "apos" no presente, dizendo o comportamento correto ("A pesquisa foi corrigida e passa a …", "Os atendimentos … passam a ser gravados …"). Uma ou duas frases em cada. Os rótulos "Antes:" e "Após Ajustes:" são colocados automaticamente: não escreva os rótulos no texto.
- Melhorias: sem Antes/Após. Comece dizendo o que foi disponibilizado e onde ("Foi disponibilizado o novo endpoint POST /… na seção … do Swagger, que permite …", "A partir desta versão, …", "Foram adicionados novos filtros às telas …"). Detalhe regras em listas ("ul") quando houver campos, endpoints, opções, condições ou regras enumeráveis; cada linha da lista no formato "Nome: descrição" quando fizer sentido, terminando com ";" e a última com ".". Antes de uma lista, uma frase que a apresente terminando com ":".
- Use subtítulos ("h") quando a melhoria tiver partes distintas (ex.: Tela de Pesquisa, Cadastro da Configuração, Regra de Geração da Notificação, E-mail de Notificação).
- Use "nota" (vira "Importante:") só para aviso que exige ação de quem integra ou usa (ex.: campo renomeado que quebra integração).
- Imagens: coloque um bloco "img" logo depois do trecho que ele ilustra sempre que um print ajudar (tela nova, campo, filtro ou botão novo, modal, e-mail, endpoint no Swagger, dashboard). "desc" diz exatamente o que o print deve mostrar, para quem vai tirar o print; "legenda" é a legenda da figura sem o "Figura N - " (a numeração é automática), curta, com nomes entre aspas curvas. Em correções, só inclua imagem quando o resultado for visual.
- Não invente comportamento que a descrição não sustenta. Se faltar algo essencial para escrever certo (onde fica no menu, qual era o erro antes, nome exato na tela, a quem se aplica, permissão necessária), chame a ferramenta perguntar_ao_usuario com 2 a 5 opções prováveis. Pergunte só o necessário, no máximo 3 perguntas, uma por vez, e nunca o que a descrição ou as respostas já dizem.
- Negrito: marque com ** ** (duplo asterisco) os nomes de telas, botões, campos, filtros, abas e menus que aparecem no texto corrido, com a grafia do sistema (ex.: clique em **Salvar**; acesse **Cadastros > Especialidades**; no campo **Situação**), e também os identificadores técnicos e valores citados (ex.: **id_resposta** = **5**; **nr_versao** = **003**). Não use ** em mais nada.${v.jsonExemplos?'\n- Exemplos JSON: quando a atividade trouxer exemplo de requisição ou de retorno, crie um bloco "json" logo após o parágrafo que o apresenta. Antes do bloco, escreva uma frase curta de introdução, como "Exemplo de JSON que a aplicação envia:" ou "Como no exemplo:" (use uma dessas formas ou outra equivalente). O JSON deve estar exatamente como está na atividade (identado com 2 espaços, sem comentários). Não invente campos nem valores; se não houver exemplo na atividade, não crie o bloco.':''} O sistema aplica o negrito automaticamente em "Antes:", "Após Ajustes:", "Importante:" e no nome antes dos dois-pontos de cada item de lista.
- Texto puro: sem markdown, sem asteriscos, sem numeração manual, sem o título do item dentro dos blocos.`}
function pnPrompt(v,it,juntos,instr){const e=pnEstilo();const outros=pnDocItems(v).filter(x=>x.id!==it.id).map(x=>`- [${x.classe}] ${x.secao||''} › ${x.titulo||canonTit(x.origTitulo)}`).join('\n');
  const fmt=pnFmt(v,it.classe);
  return `Você redige um item do "Documento de Atualização de Versão" do sistema ${v.sistema||'JMJ CRM'}, versão ${v.versao}.

${pnRules(v)}
${e&&e.guia?`\nEstilo observado nas versões anteriores (siga):\n${String(e.guia).slice(0,6000)}\n`:''}${e&&Array.isArray(e.exemplos)&&e.exemplos.length?`\nTrechos reais de versões anteriores, como referência de tom e estrutura:\n${e.exemplos.slice(0,6).map(x=>`[${x.classe||''}]\n${String(x.texto||'').slice(0,1500)}`).join('\n\n')}\n`:''}
Item a escrever:
- Classificação: ${it.classe} (${fmt==='antesapos'?'formato Antes/Após: blocos "antes" e "apos"':'formato livre: parágrafos, listas, subtítulos'})
- Seção: ${it.secao||'(sem seção)'}
- Título sugerido: ${it.titulo||canonTit(it.origTitulo)}${it.tituloFixo?' (definido pelo usuário: mantenha exatamente)':''}

Atividade do Artia: ${it.origTitulo}
Descrição:
${String(it.origDescricao||'(sem descrição)').slice(0,40000)}
${juntos.map(j=>`\nAtividade do mesmo item: ${j.origTitulo}\nDescrição:\n${String(j.origDescricao||'').slice(0,20000)}`).join('\n')}
${(it.perguntas||[]).length?`\nRespostas já dadas pelo usuário (use sem perguntar de novo):\n${it.perguntas.map(q=>`- ${q.p} → ${q.r}`).join('\n')}\n`:''}${outros?`\nOutros itens desta versão (não repita o conteúdo deles):\n${outros}\n`:''}${instr?`\nTexto atual do item:\n${JSON.stringify({titulo:it.titulo,blocos:it.blocos||[]})}\n\nAjuste pedido pelo usuário (aplique e mantenha o resto): ${instr}\n`:''}
Responda APENAS com JSON: {"titulo":"","blocos":[{"t":"p|antes|apos|ul|h|img|nota|json","txt":"","itens":[""],"desc":"","legenda":""}]}
- "txt" para p, antes, apos, h, nota e json; "itens" só para ul; "desc" e "legenda" só para img.`}
function pnNormBlocks(arr){if(!Array.isArray(arr))return[];const out=[];for(const b of arr){if(!b||!PN_BT[b.t])continue;
    if(b.t==='ul'){const itens=pnLines(b);if(itens.length)out.push({t:'ul',itens})}
    else if(b.t==='img'){const desc=String(b.desc||b.txt||'').trim();if(desc)out.push({t:'img',desc:desc.slice(0,400),legenda:String(b.legenda||'').trim().slice(0,240),...(b.print&&b.print.url?{print:b.print,colada:!!b.colada}:{})})}
    else{let txt=String(b.txt||'').replace(/\*\*\s*\*\*/g,'').trim();if(b.t==='antes')txt=txt.replace(/^\s*(\*\*)?antes\s*:(\*\*)?\s*/i,'');if(b.t==='apos')txt=txt.replace(/^\s*(\*\*)?ap[óo]s(\s+os)?(\s+ajustes)?\s*:(\*\*)?\s*/i,'');if(b.t==='nota')txt=txt.replace(/^\s*(\*\*)?importante\s*:(\*\*)?\s*/i,'');if(txt)out.push({t:b.t,txt})}}
  return out}
function pnAskTool(it){return {name:'perguntar_ao_usuario',description:'Abre um pop-up com uma pergunta de múltipla escolha para quem está montando a documentação e devolve a resposta. Use só quando faltar algo essencial que a descrição da atividade não diz. Dê de 2 a 5 opções prováveis; a pessoa também pode escrever outra resposta.',
  inputSchema:{type:'object',properties:{pergunta:{type:'string',description:'pergunta curta e direta'},contexto:{type:'string',description:'em uma frase, por que precisa saber'},opcoes:{type:'array',items:{type:'string'},description:'2 a 5 respostas prováveis'},multipla:{type:'boolean',description:'true quando mais de uma opção pode valer'}},required:['pergunta','opcoes']},
  async execute(i){const pergunta=String(i.pergunta||'').trim();if(!pergunta)throw new Error('pergunta vazia');
    const cur=PN.itens.find(x=>x.id===it.id)||it;const ja=(cur.perguntas||[]).find(x=>norm(x.p)===norm(pergunta));if(ja)return 'Resposta do usuário (já dada): '+ja.r;
    const ans=await askUser({pergunta,contexto:i.contexto?String(i.contexto):'',opcoes:Array.isArray(i.opcoes)?i.opcoes:[],multipla:!!i.multipla,origem:'Patch Notes · '+(cur.titulo||canonTit(cur.origTitulo)),semContexto:true});
    const m=String(ans).match(/^Resposta do tester:\s*([\s\S]*)$/);
    if(m){const per=[...(cur.perguntas||[]),{p:pergunta.slice(0,500),r:m[1].slice(0,4000),em:nowISO()}];cur.perguntas=per;cap.db.collection('pnitens').doc(it.id).update({perguntas:per}).catch(()=>{});return 'Resposta do usuário: '+m[1]}
    return 'O usuário pulou a pergunta. Siga com a opção mais provável, sem afirmar o que não tem certeza.'}}}
async function pnGen(id,instr){const it=PN.itens.find(x=>x.id===id);const v=it&&PN.vers.find(x=>x.id===it.versaoId);if(!it||!v)return;
  if(!cap.sample){toast('O acesso ao Claude não está disponível nesta página.');return}
  PN.gen.add(id);render();
  try{pnUpd('pnitens',id,{status:'gerando',gerandoEm:nowISO()}).catch(()=>{});
    const juntos=PN.itens.filter(x=>x.junto===id);
    const r=await aiJ('itemPn',pnPrompt(v,it,juntos,instr),{model:'claude-sonnet-5-5',modelTier:'complex',tools:[pnAskTool(it)]});
    const bl=pnNormBlocks(r&&r.blocos);if(!bl.length)throw new Error('o Claude não devolveu o texto');
    const up={blocos:bl,status:'pronto',geradoEm:nowISO(),erro:'',editadoEm:null};if(r.titulo&&!it.tituloFixo)up.titulo=String(r.titulo).trim().slice(0,200);
    await pnUpd('pnitens',id,up)}
  catch(e){const msg=e&&e.code==='not_granted'?'acesso ao Claude não liberado':e&&e.code==='rate_limited'?'muitas chamadas seguidas, tente em instantes':String((e&&(e.message||e.code))||e).slice(0,200);
    await pnUpd('pnitens',id,{status:(it.blocos||[]).length?'pronto':'erro',erro:msg}).catch(()=>{});if((it.blocos||[]).length)toast('Não consegui ajustar "'+(it.titulo||'')+'": '+msg,6000)}
  finally{PN.gen.delete(id);render()}}
function openPnAjuste(v,id){const it=PN.itens.find(x=>x.id===id);if(!it)return;const m=$('#modal');
  m.innerHTML=`<div class="box" style="max-width:560px" role="dialog" aria-modal="true" aria-labelledby="pnAjT"><b id="pnAjT" style="font-size:17px">Pedir ajuste ao Claude</b><div class="small muted">${esc(it.titulo||canonTit(it.origTitulo))}</div>
  <label class="small" style="display:grid;gap:4px">O que mudar<textarea id="pnAjTxt" rows="4" placeholder="Ex.: deixe o Antes mais curto e cite o menu Configurações > Parâmetros"></textarea></label>
  <div class="row pnquick">${['Deixar mais curto','Detalhar mais as regras','Adicionar imagem da tela','Reescrever do zero'].map(q=>`<button type="button" class="chipbtn" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
  ${it.editadoEm?'<div class="small" style="color:var(--warn)">Este item foi editado à mão. O ajuste parte do texto atual, com as suas edições.</div>':''}
  <div class="row"><span class="grow"></span><button id="pnAjNo">Cancelar</button><button class="pri" id="pnAjGo">Ajustar</button></div></div>`;
  m.hidden=false;const ta=$('#pnAjTxt');setTimeout(()=>ta.focus(),30);m.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{ta.value=b.dataset.q;ta.focus()});
  $('#pnAjNo').onclick=()=>m.hidden=true;$('#pnAjGo').onclick=()=>{const t=ta.value.trim();m.hidden=true;if(t==='Reescrever do zero'){pnUpd('pnitens',id,{blocos:[],editadoEm:null}).catch(()=>{});pnQueue([id]);return}pnGenNow(id,t||'Revise o texto seguindo as regras.')}}
function pnBlkPlain(b){if(!b)return '';if(b.t==='ul')return pnLines(b).map(x=>'• '+x).join('\n');if(b.t==='img')return (b.legenda||b.desc||'');return String(b.txt||'').replace(/\*\*/g,'')}
function openPnBlockAI(v,id,bi){const it=PN.itens.find(x=>x.id===id);const b=it&&(it.blocos||[])[bi];if(!b)return;if(PN.gen.has(id)){toast('Espere o Claude terminar este item.');return}const m=$('#modal');
  m.innerHTML=`<div class="box" style="max-width:600px" role="dialog" aria-modal="true" aria-labelledby="pnBaT"><b id="pnBaT" style="font-size:17px">Editar bloco com o Claude</b><div class="small muted">${esc(it.titulo||canonTit(it.origTitulo))} · ${esc(PN_BT[b.t]||b.t)}</div>
  <div class="pnbprev">${esc(pnBlkPlain(b)).slice(0,1800)}</div>
  <label class="small" style="display:grid;gap:4px">O que mudar, ou o contexto que o Claude precisa saber<textarea id="pnBaTxt" rows="4" placeholder="Ex.: o campo só é obrigatório quando a Unimed for de origem; cite o menu Configurações > Parâmetros"></textarea></label>
  <div class="row pnquick">${['Deixar mais curto','Detalhar mais','Transformar em lista','Revisar o português'].map(q=>`<button type="button" class="chipbtn" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
  <div class="small muted">Só este bloco muda. O resto do item fica como está.</div>
  <div class="row"><span class="grow"></span><button id="pnBaNo">Cancelar</button><button class="pri" id="pnBaGo">Editar bloco</button></div></div>`;
  m.hidden=false;const ta=$('#pnBaTxt');setTimeout(()=>ta.focus(),30);m.querySelectorAll('[data-q]').forEach(x=>x.onclick=()=>{ta.value=x.dataset.q;ta.focus()});
  const go=()=>{const t=ta.value.trim();if(!t){ta.focus();toast('Escreva o que o Claude deve mudar neste bloco.');return}m.hidden=true;m.innerHTML='';pnBlockAI(v,id,bi,t)};
  $('#pnBaNo').onclick=()=>{m.hidden=true;m.innerHTML=''};$('#pnBaGo').onclick=go;ta.onkeydown=e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();go()}}}
async function pnBlockAI(v,id,bi,instr){const it=PN.itens.find(x=>x.id===id);const old=it&&(it.blocos||[])[bi];if(!old||!cap.sample)return;const key=id+':'+bi;if(PN.bgen.has(key))return;
  const sel=document.activeElement;if(sel&&sel.closest&&sel.closest('.pnlive'))sel.blur();
  PN.bgen.add(key);render();
  try{const prompt=`Você edita UM bloco de um item do "Documento de Atualização de Versão" do sistema ${v.sistema||'JMJ CRM'}, versão ${v.versao}.

${pnRules(v)}

Item: ${it.titulo||canonTit(it.origTitulo)} (classificação ${it.classe}${it.secao?', seção '+it.secao:''})
Atividade de origem: ${it.origTitulo}
Descrição da atividade (contexto, use para não inventar):
${String(it.origDescricao||'').slice(0,20000)}

Blocos atuais do item (só para contexto; o bloco a editar é o de índice ${bi}):
${JSON.stringify((it.blocos||[]).map((x,i)=>({i,...x,print:undefined})))}

Bloco a editar (índice ${bi}):
${JSON.stringify({...old,print:undefined})}

Pedido do usuário para este bloco: ${instr}

Responda APENAS com JSON: {"blocos":[{"t":"p|antes|apos|ul|h|nota|json","txt":"","itens":[""]}]}
- Devolva só o que substitui ESTE bloco. Normalmente é um único bloco do mesmo tipo ("${old.t}"). Use mais de um bloco ou outro tipo só se o pedido exigir (ex.: transformar em lista = um "p" que apresenta a lista + um "ul").
- Não repita o conteúdo dos outros blocos e não mude o que o usuário não pediu.`;
    const r=await aiJ('blocoPn',prompt,{modelTier:'default',tools:[pnAskTool(it)]});
    let nb=pnNormBlocks(r&&r.blocos);if(old.t==='img')nb=nb.filter(x=>x.t==='img');if(!nb.length)throw new Error('o Claude não devolveu o bloco');
    if(old.t==='img'&&old.print)nb=nb.map(x=>({...x,print:old.print}));
    const cur=PN.itens.find(x=>x.id===id);if(!cur||JSON.stringify((cur.blocos||[])[bi])!==JSON.stringify(old)){toast('O bloco mudou enquanto o Claude trabalhava. Peça de novo.',5000,{kind:'warn'});return}
    const prev=JSON.parse(JSON.stringify(cur.blocos||[]));const bl=prev.slice();bl.splice(bi,1,...nb);
    await pnUpd('pnitens',id,{blocos:bl,editadoEm:nowISO(),editadoPor:me?.id||null});
    toastUndo('Bloco editado pelo Claude.','Desfazer',async()=>{await pnUpd('pnitens',id,{blocos:prev});render()},12000,{kind:'ok'})}
  catch(e){const msg=e&&e.code==='not_granted'?'acesso ao Claude não liberado':e&&e.code==='rate_limited'?'muitas chamadas seguidas, tente em instantes':String((e&&(e.message||e.code))||e).slice(0,200);toast('Não consegui editar o bloco: '+msg,6000)}
  finally{PN.bgen.delete(key);render()}}
function pnGenNow(id,instr){if(PN.gen.has(id))return;pnRun++;pnGen(id,instr).finally(()=>{pnRun--;pnPump()})}

/* ---------- edição manual de um item ---------- */
function openPnItem(v,id){const it=PN.itens.find(x=>x.id===id);if(!it)return;let B=JSON.parse(JSON.stringify(it.blocos||[]));const m=$('#modal');
  const blockHTML=(b,i)=>`<div class="pnblk" data-bi="${i}"><div class="row"><select data-bf="t" aria-label="Tipo do bloco ${i+1}">${Object.entries(PN_BT).map(([k,l])=>`<option value="${k}"${b.t===k?' selected':''}>${l}</option>`).join('')}</select><span class="grow"></span>${ib('up','Subir bloco',`data-bmv="-1"${i===0?' disabled':''}`)}${ib('down','Descer bloco',`data-bmv="1"${i===B.length-1?' disabled':''}`)}${ib('trash','Apagar bloco','data-bdel','ib-bad')}</div>
    ${b.t==='img'?`<label class="small">O que o print deve mostrar<textarea data-bf="desc" rows="2">${esc(b.desc||'')}</textarea></label><label class="small">Legenda (sem o "Figura N -")<input type="text" data-bf="legenda" value="${esc(b.legenda||'')}"></label>`
     :b.t==='ul'?`<label class="small">Um item por linha<textarea data-bf="itens" rows="${Math.min(10,Math.max(3,pnLines(b).length+1))}">${esc(pnLines(b).join('\n'))}</textarea></label>`
     :`<textarea data-bf="txt" rows="${b.t==='h'?1:Math.min(8,Math.max(2,Math.ceil(String(b.txt||'').length/90)+1))}" aria-label="Texto do bloco ${i+1}">${esc(b.txt||'')}</textarea>`}</div>`;
  const paint=()=>{$('#pnBlks').innerHTML=B.map(blockHTML).join('')||'<div class="small muted">Sem blocos. Adicione abaixo.</div>';
    $('#pnBlks').querySelectorAll('.pnblk').forEach(el=>{const i=+el.dataset.bi;
      el.querySelectorAll('[data-bf]').forEach(f=>{const k=f.dataset.bf;const ev=f.tagName==='SELECT'?'onchange':'oninput';f[ev]=()=>{if(k==='t'){const old=B[i];const txt=old.txt||(old.itens||[]).join('\n')||old.desc||'';B[i]=f.value==='img'?{t:'img',desc:txt,legenda:old.legenda||''}:f.value==='ul'?{t:'ul',itens:pnLines({txt})}:{t:f.value,txt};paint();return}
        if(k==='itens')B[i].itens=f.value.split('\n');else B[i][k]=f.value}});
      el.querySelectorAll('[data-bmv]').forEach(b=>b.onclick=()=>{const j=i+ +b.dataset.bmv;if(j<0||j>=B.length)return;[B[i],B[j]]=[B[j],B[i]];paint()});
      const d=el.querySelector('[data-bdel]');if(d)d.onclick=()=>{B.splice(i,1);paint()}})};
  m.innerHTML=`<div class="box pnedit" role="dialog" aria-modal="true" aria-labelledby="pnEdT"><div class="row pnedhd"><b id="pnEdT" style="font-size:17px" class="grow">Editar item</b><span class="small muted pnedkb">Ctrl+Enter salva</span><button id="pnEdNo">Cancelar</button><button class="pri" id="pnEdOk">Salvar</button></div>
  <div class="formgrid"><label>Classificação<select id="pnEdC">${pnClasses(v).map(c=>`<option${it.classe===c.k?' selected':''}>${esc(c.k)}</option>`).join('')}</select></label><label>Seção<input type="text" id="pnEdS" list="pnSecDL2" value="${esc(it.secao||'')}"></label><label class="full">Título no documento<input type="text" id="pnEdTi" value="${esc(it.titulo||'')}"></label></div>
  <datalist id="pnSecDL2">${pnSecList(v).map(s=>`<option value="${esc(s)}">`).join('')}</datalist>
  <div class="lbl">Blocos do texto</div><div id="pnBlks" class="pnblks"></div>
  <div class="row pnadd"><span class="small muted">Adicionar:</span>${Object.entries(PN_BT).map(([k,l])=>`<button type="button" class="chipbtn" data-badd="${k}">+ ${l}</button>`).join('')}</div>
  ${(it.perguntas||[]).length?`<details class="knbox"><summary><span class="small">Suas respostas usadas neste item (${it.perguntas.length})</span></summary><ul class="small">${it.perguntas.map(q=>`<li><b>${esc(q.p)}</b> ${esc(q.r)}</li>`).join('')}</ul></details>`:''}
  <details class="knbox"><summary><span class="small">Descrição original no Artia</span></summary><div class="small pnorig">${esc(String(it.origDescricao||'').slice(0,20000))}</div></details></div>`;
  m.hidden=false;paint();
  m.querySelectorAll('[data-badd]').forEach(b=>b.onclick=()=>{const k=b.dataset.badd;B.push(k==='img'?{t:'img',desc:'',legenda:''}:k==='ul'?{t:'ul',itens:['']}:{t:k,txt:''});paint();const last=$('#pnBlks').lastElementChild;if(last){const f=last.querySelector('textarea,input');if(f)f.focus();last.scrollIntoView({block:'nearest'})}});
  const close=()=>{m.hidden=true;m.innerHTML=''};$('#pnEdNo').onclick=close;m.querySelector('.pnedit').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();$('#pnEdOk').click()}});
  $('#pnEdOk').onclick=async()=>{const bl=pnNormBlocks(B);
    const ti=$('#pnEdTi').value.trim();const up={blocos:bl,classe:$('#pnEdC').value,secao:$('#pnEdS').value.trim(),editadoEm:nowISO(),editadoPor:me?.id||null,status:'pronto',erro:''};if(ti&&ti!==it.titulo){up.titulo=ti;up.tituloFixo=true}
    btnLoad($('#pnEdOk'),true);try{await pnUpd('pnitens',id,up);close();render();toast('Item salvo.',2400,{kind:'ok'})}catch(e){btnLoad($('#pnEdOk'),false)}}}
/* ---------- imagens: copiar print (usado pelo card inline na aba Documento) ---------- */
async function pnCopyImg(url,btn){try{let b=await (await fetch(url)).blob();if(b.type!=='image/png')b=await new Promise((res,rej)=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext('2d').drawImage(im,0,0);c.toBlob(x=>x?res(x):rej(new Error('png')),'image/png')};im.onerror=rej;im.crossOrigin='anonymous';im.src=URL.createObjectURL(b)});
  await navigator.clipboard.write([new ClipboardItem({'image/png':b})]);toast('Print copiado.',3600,{kind:'ok'})}
  catch(e){toast(cap.downloads?'O navegador não deixou copiar a imagem. Use Baixar.':'O navegador não deixou copiar a imagem.',5200)}}

/* ---------- copiar (alternativa ao envio) ---------- */
async function pnCopyDoc(v){const html=pnDocHTML(v,true);const txt=pnParas(v).map(p=>(p.k==='ul'?'• ':'')+p.txt).join('\n');
  try{await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([txt],{type:'text/plain'})})]);toast('Documento copiado com a formatação. Cole no Google Doc da versão.',4200,{kind:'ok'})}
  catch(e){try{await navigator.clipboard.writeText(txt);toast('Copiado como texto simples (o navegador não deixou copiar a formatação).',5000)}catch(e2){toast('O navegador não deixou copiar.')}}}

/* ---------- nova versão, dados da versão ---------- */
function openPnNew(preSp){const m=$('#modal');let rows=null,csvName='',spSel='';
  m.innerHTML=`<div class="box" style="max-width:620px" role="dialog" aria-modal="true" aria-labelledby="pnNwT"><div class="row"><b id="pnNwT" style="font-size:17px" class="grow">Nova versão</b>${ib('close','Fechar','id="pnNwX"')}</div>
  <div class="formgrid"><label>Versão<input type="text" id="pnNwV" placeholder="4.117.0" inputmode="decimal"></label><label>Sistema<input type="text" id="pnNwS" value="JMJ CRM"></label><label>Exibir exemplos de JSON<select id="pnNwJ"><option value="nao" selected>Não</option><option value="sim">Sim · blocos com as requisições</option></select></label><label>Nível de detalhes<select id="pnNwL"><option value="baixo">Baixo · simples, uso geral</option><option value="medio" selected>Médio · com nomes de endpoints</option><option value="alto">Alto · com detalhes de TI</option></select></label>
  <label class="full">Nome (opcional)<input type="text" id="pnNwN" placeholder="Nova Versão GPU"></label>
  <label class="full">Link do Google Doc da versão<input type="url" id="pnNwD" placeholder="https://docs.google.com/document/d/…/edit"></label>
  <label class="full drop">CSV das atividades do Artia (colunas Título e Descrição)<input type="file" id="pnNwF" accept=".csv,text/csv"></label></div>
  <div id="pnNwInfo" class="small muted">${S.sprints.length?'Também dá para usar uma sprint já importada no Tester, sem CSV: ':''}${S.sprints.length?`<select id="pnNwSp" aria-label="Usar sprint do Tester"><option value="">escolher sprint…</option>${S.sprints.map(s=>`<option value="${esc(s.id)}">${esc((s.codigo?s.codigo+' · ':'')+s.nome)}</option>`).join('')}</select>`:''}</div>
  <div class="row"><span class="small muted grow" id="pnNwMsg"></span><button id="pnNwNo">Cancelar</button><button class="pri" id="pnNwGo">Importar e fazer a triagem</button></div></div>`;
  m.hidden=false;setTimeout(()=>$('#pnNwV').focus(),30);const close=()=>{m.hidden=true;m.innerHTML=''};$('#pnNwX').onclick=close;$('#pnNwNo').onclick=close;
  $('#pnNwF').onchange=async e=>{const f=e.target.files[0];if(!f)return;spSel='';const buf=await f.arrayBuffer();let txt=new TextDecoder('utf-8').decode(buf);if(txt.includes(String.fromCharCode(65533)))txt=new TextDecoder('windows-1252').decode(buf);
    const r=parseCSV(txt);const hdr=r.shift()||[];const ti=Math.max(0,hdr.findIndex(h=>/t[ií]tulo/i.test(h))),di=hdr.findIndex(h=>/descri/i.test(h));
    rows=r.filter(x=>x[ti]&&x[ti].trim()).map(x=>({titulo:x[ti].trim(),descricao:di>=0?(x[di]||'').trim():''}));csvName=f.name;
    const vm=(rows.map(x=>x.titulo).join(' ').match(/\b(\d+\.\d+\.\d+)\b/)||[])[1];if(vm&&!$('#pnNwV').value)$('#pnNwV').value=vm;
    $('#pnNwMsg').textContent=`${rows.length} atividades no CSV.`;const sp=$('#pnNwSp');if(sp)sp.value=''};
  const sp=$('#pnNwSp');if(sp)sp.onchange=()=>{const s=S.sprints.find(x=>x.id===sp.value);spSel=s?s.id:'';if(!s){rows=null;return}const as=(S.allAtiv||[]).filter(a=>a.sprintId===s.id);rows=as.map(a=>({titulo:a.titulo,descricao:a.descricao||''}));csvName='';
    const vm=(String(s.nome||'').match(/\b(\d+\.\d+\.\d+)\b/)||[])[1];if(vm&&!$('#pnNwV').value)$('#pnNwV').value=vm;if(!$('#pnNwN').value)$('#pnNwN').value=String(s.nome||'').replace(/\[?\d+\.\d+\.\d+\]?\s*-?\s*/,'').replace(/[[\]]/g,'').trim();$('#pnNwMsg').textContent=`${rows.length} atividades da sprint.`};
  if(preSp&&sp){sp.value=preSp;sp.onchange()}
  $('#pnNwGo').onclick=async()=>{const versao=$('#pnNwV').value.trim();const docUrl=$('#pnNwD').value.trim();const docId=pnDocId(docUrl);
    if(!versao){$('#pnNwMsg').textContent='Informe o número da versão.';$('#pnNwV').focus();return}
    if(!rows||!rows.length){$('#pnNwMsg').textContent='Escolha o CSV do Artia.';return}
    if(docUrl&&!docId){$('#pnNwMsg').textContent='Esse link não parece de um Google Doc.';$('#pnNwD').focus();return}
    const btn=$('#pnNwGo');btnLoad(btn,true);const bz=waitBox('Criando a versão…');
    try{const vref=await cap.db.collection('pnversoes').add({versao,sistema:$('#pnNwS').value.trim()||'JMJ CRM',nivel:PN_NIVEIS[$('#pnNwL').value]?$('#pnNwL').value:'medio',jsonExemplos:$('#pnNwJ').value==='sim',nome:$('#pnNwN').value.trim(),docUrl,docId,classes:PN_CL0,csvNome:csvName,sprintId:spSel||null,triado:false,triagemOk:false,criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||''});
      let i=0;for(const r of rows){i++;bz.set(`Importando ${i} de ${rows.length}…`);await cap.db.collection('pnitens').add({versaoId:vref.id,ordem:i,origTitulo:r.titulo.slice(0,500),origDescricao:r.descricao.slice(0,200000),incluir:false,classe:'',secao:'',titulo:'',blocos:[],perguntas:[],status:'novo',criadoEm:nowISO()})}
      close();PN.ver=vref.id;PN.tab[vref.id]='tri';nav('pnver');
      setTimeout(()=>{const v=PN.vers.find(x=>x.id===vref.id)||{id:vref.id,versao,sistema:$('#pnNwS')?.value||'JMJ CRM',classes:PN_CL0};const go=()=>{if(PN.itLoaded&&PN.subV===vref.id&&PN.itens.length)pnTriage(PN.vers.find(x=>x.id===vref.id)||v,$('#pnRetri'));else setTimeout(go,300)};go()},300)}
    catch(e){$('#pnNwMsg').textContent='Não foi possível criar: '+(e.code||e.message);btnLoad(btn,false)}finally{bz.done()}}}
function pnAskJsonRewrite(v,ids){const m=$('#modal');const liga=!!v.jsonExemplos;
  m.innerHTML=`<div class="box" style="max-width:500px" role="dialog" aria-modal="true" aria-labelledby="pnJrT"><b id="pnJrT" style="font-size:17px">Reescrever os textos?</b><div class="small">Você ${liga?'ligou':'desligou'} “Exibir exemplos de JSON” na versão ${esc(v.versao||'')}. Para ${liga?'incluir os blocos de JSON':'tirar os blocos de JSON'}, preciso reescrever o texto de ${ids.length} ${ids.length===1?'item':'itens'}. Os textos atuais somem. O Google Doc não é alterado até você enviar.</div><div class="row"><span class="grow"></span><button id="pnJrNo">Não, manter os textos</button><button class="pri" id="pnJrGo">Reescrever ${ids.length===1?'o item':'os itens'}</button></div></div>`;
  m.hidden=false;const close=()=>{m.hidden=true;m.innerHTML=''};$('#pnJrNo').onclick=close;
  $('#pnJrGo').onclick=async()=>{close();for(const id of ids)await pnUpd('pnitens',id,{blocos:[],editadoEm:null}).catch(()=>{});pnQueue(ids)}}
function openPnDados(v){const m=$('#modal');let C=JSON.parse(JSON.stringify(pnClasses(v)));
  const paintC=()=>{$('#pnDC').innerHTML=C.map((c,i)=>`<div class="row pnclrow" data-ci="${i}"><input type="text" data-cf="k" value="${esc(c.k)}" aria-label="Nome do capítulo ${i+1}" style="flex:1 1 160px"><select data-cf="fmt" aria-label="Formato"><option value="antesapos"${c.fmt==='antesapos'?' selected':''}>Antes / Após Ajustes</option><option value="livre"${c.fmt!=='antesapos'?' selected':''}>Texto livre</option></select>${ib('up','Subir',`data-cmv="-1"${i===0?' disabled':''}`)}${ib('down','Descer',`data-cmv="1"${i===C.length-1?' disabled':''}`)}${ib('trash','Remover','data-cdel','ib-bad')}</div>`).join('');
    $('#pnDC').querySelectorAll('[data-ci]').forEach(r=>{const i=+r.dataset.ci;r.querySelectorAll('[data-cf]').forEach(f=>f.oninput=f.onchange=()=>{C[i][f.dataset.cf]=f.value});r.querySelectorAll('[data-cmv]').forEach(b=>b.onclick=()=>{const j=i+ +b.dataset.cmv;[C[i],C[j]]=[C[j],C[i]];paintC()});r.querySelector('[data-cdel]').onclick=()=>{if(C.length<2)return;C.splice(i,1);paintC()}})};
  m.innerHTML=`<div class="box" style="max-width:620px" role="dialog" aria-modal="true" aria-labelledby="pnDT"><div class="row"><b id="pnDT" style="font-size:17px" class="grow">Dados da versão</b>${ib('close','Fechar','id="pnDX"')}</div>
  <div class="formgrid"><label>Versão<input type="text" id="pnDV" value="${esc(v.versao||'')}"></label><label>Sistema<input type="text" id="pnDS" value="${esc(v.sistema||'JMJ CRM')}"></label><label>Exibir exemplos de JSON<select id="pnDJ"><option value="nao"${v.jsonExemplos?'':' selected'}>Não</option><option value="sim"${v.jsonExemplos?' selected':''}>Sim · blocos com as requisições</option></select></label><label>Nível de detalhes<select id="pnDL">${Object.entries(PN_NIVEIS).map(([k,o])=>`<option value="${k}"${pnNivel(v)===k?' selected':''}>${o.t}</option>`).join('')}</select></label><label class="full">Nome (opcional)<input type="text" id="pnDN" value="${esc(v.nome||'')}"></label>
  <label class="full">Link do Google Doc da versão<input type="url" id="pnDD" value="${esc(v.docUrl||(v.docId?pnDocUrl(v.docId):''))}" placeholder="https://docs.google.com/document/d/…/edit"></label></div>
  <div class="lbl">Capítulos do documento, na ordem</div><div id="pnDC" style="display:grid;gap:6px"></div><div><button type="button" class="chipbtn" id="pnDCadd">+ Capítulo</button></div>
  <div class="small muted">A frase de abertura de cada capítulo sai como: “${esc(pnIntro(v,{k:'Correções'}))}”</div>
  <div class="row"><span class="grow small muted" id="pnDMsg"></span>${ib('trash','Apagar esta versão','id="pnDDel"','ib-bad')}<button id="pnDNo">Cancelar</button><button class="pri" id="pnDOk">Salvar</button></div></div>`;
  m.hidden=false;paintC();const close=()=>{m.hidden=true;m.innerHTML=''};$('#pnDX').onclick=close;$('#pnDNo').onclick=close;
  $('#pnDCadd').onclick=()=>{C.push({k:'Novas Funcionalidades',fmt:'livre'});paintC()};
  $('#pnDOk').onclick=async()=>{const docUrl=$('#pnDD').value.trim();const docId=pnDocId(docUrl);if(docUrl&&!docId){$('#pnDMsg').textContent='Esse link não parece de um Google Doc.';return}
    const cls=C.map(c=>({k:String(c.k||'').trim(),fmt:c.fmt==='antesapos'?'antesapos':'livre'})).filter(c=>c.k);if(!cls.length){$('#pnDMsg').textContent='Deixe pelo menos um capítulo.';return}
    const old=pnClasses(v);for(let i=0;i<old.length;i++){const nw=C[i]&&String(C[i].k||'').trim();if(nw&&nw!==old[i].k&&!old.some(o=>o.k===nw))for(const it of PN.itens.filter(x=>x.classe===old[i].k))await pnUpd('pnitens',it.id,{classe:nw}).catch(()=>{})}
    const ok=$('#pnDOk');btnLoad(ok,true);const bz=waitBox('Atualizando a versão…');const jsonAntes=!!v.jsonExemplos;
    try{const upd={versao:$('#pnDV').value.trim()||v.versao,sistema:$('#pnDS').value.trim()||'JMJ CRM',nivel:PN_NIVEIS[$('#pnDL').value]?$('#pnDL').value:'alto',jsonExemplos:$('#pnDJ').value==='sim',nome:$('#pnDN').value.trim(),docUrl,docId,classes:cls};
      await pnUpd('pnversoes',v.id,upd);close();render();toast('Dados salvos.',2400,{kind:'ok'});
      if(jsonAntes!==!!upd.jsonExemplos){const nv={...v,...upd};const its=PN.itens.filter(i=>i.versaoId===v.id&&i.incluir&&!i.junto);
        if(its.length)pnAskJsonRewrite(nv,its.map(i=>i.id))}
    }catch(e){$('#pnDMsg').textContent='Não consegui salvar: '+(e.code||e.message)}
    finally{bz.done();btnLoad(ok,false)}};
  $('#pnDDel').onclick=()=>{const box=m.querySelector('.box');box.innerHTML=`<b style="font-size:17px">Apagar a versão ${esc(v.versao)}?</b><div class="small">Os textos, a triagem e os prints guardados aqui somem. O Google Doc não é alterado.</div><div class="row"><span class="grow"></span><button id="pnDelNo">Cancelar</button><button class="dangerfill" id="pnDelGo">Apagar</button></div>`;
    $('#pnDelNo').onclick=close;$('#pnDelGo').onclick=async()=>{btnLoad($('#pnDelGo'),true);try{for(const it of PN.itens.filter(x=>x.versaoId===v.id))await cap.db.collection('pnitens').doc(it.id).delete();await cap.db.collection('pnversoes').doc(v.id).delete();close();nav('patch');toast('Versão apagada.')}catch(e){toast('Não foi possível apagar: '+(e.code||e.message))}}}}
/* ---------- modelo de design e estilo de escrita ---------- */
function openPnCfg(foco){const m=$('#modal');const d=PN.cfg.design||{};const e=pnEstilo()||{};
  const achados=()=>{const dd=PN.cfg.design;if(!dd||!dd.estilos)return '';const E=dd.estilos;return `<div class="pnach">${PN_KEYS.map(([k,l])=>{const x=E[k];const ul=k==='ul'&&x&&x.list;const warn=ul&&x.list.exato===false&&!x.list.num;
      return `<div class="pnachr ${x?'ok':'no'}"><span class="pnachi" aria-hidden="true">${x?'✓':'–'}</span><span class="grow"><b>${esc(l)}</b><span class="small muted">${x?(x.txt?' “'+esc(x.txt.slice(0,70))+(x.txt.length>70?'…':'')+'”':''):' não encontrado no modelo: usa o padrão do Google Docs'}${warn?` · o marcador “${esc(x.list.glyph)}” sai como ● (o Google não permite esse marcador pela API)`:''}${k==='chapter'&&x?(x.num==='list'?' · numeração automática':x.num==='text'?' · número no texto':' · sem número')+(x.pb?' · começa em página nova':''):''}</span></span></div>`}).join('')}</div>`};
  m.innerHTML=`<div class="box" style="max-width:680px" role="dialog" aria-modal="true" aria-labelledby="pnCfT"><div class="row"><b id="pnCfT" style="font-size:17px" class="grow">Modelo e estilo</b>${ib('close','Fechar','id="pnCfX"')}</div>
  <section class="pncfgsec"><div class="lbl">1. Modelo de design</div><p class="small muted" style="margin:0">Link do Google Doc com exemplos de cada parte do documento (capítulo, abertura, seção, título, subtítulo, parágrafo, Antes/Após Ajustes, lista, marcação [INSERIR IMAGEM], legenda Figura N, Importante). O Sprintboard copia o estilo exato de cada exemplo.</p>
   <div class="row"><input type="url" id="pnCfM" style="flex:1 1 260px" value="${esc(d.modeloUrl||'')}" placeholder="https://docs.google.com/document/d/…/edit"><button class="pri" id="pnCfRead">${d.modeloId?'Ler de novo':'Ler modelo'}</button></div>
   <div id="pnCfAch">${achados()}</div>${d.lidoEm?`<div class="small muted">Lido em ${esc(fmtDT(d.lidoEm))}.</div>`:''}</section>
  <section class="pncfgsec" id="pnCfEst"><div class="lbl">2. Estilo de escrita</div><p class="small muted" style="margin:0">O Claude lê os Documentos de Atualização de Versão anteriores (da mesma pasta do modelo no Drive, ou dos links abaixo) e aprende seções, termos e o jeito de escrever.</p>
   <label class="small" style="display:grid;gap:4px">Links de versões anteriores (opcional, um por linha)<textarea id="pnCfL" rows="2" placeholder="Em branco: usa os 3 mais recentes da pasta do modelo">${esc((e.links||[]).join('\n'))}</textarea></label>
   <div class="row"><span class="small muted grow">${e.lidoEm?`Aprendido de: ${esc((e.fontes||[]).map(f=>f.titulo).join('; ')).slice(0,300)}`:''}</span><button id="pnCfLearn"${cap.sample?'':' disabled'}>${e.guia?'Aprender de novo':'Aprender com versões anteriores'}</button></div>
   <label class="small" style="display:grid;gap:4px">Guia de escrita (pode editar)<textarea id="pnCfG" rows="8" placeholder="Depois de aprender, o guia aparece aqui.">${esc(e.guia||'')}</textarea></label>
   <label class="small" style="display:grid;gap:4px">Seções usadas, na ordem (uma por linha)<textarea id="pnCfS" rows="4">${esc((e.secoes||[]).join('\n'))}</textarea></label></section>
  <div class="row"><span class="grow small muted" id="pnCfMsg"></span><button id="pnCfNo">Fechar</button><button class="pri" id="pnCfOk">Salvar guia e seções</button></div></div>`;
  m.hidden=false;const close=()=>{m.hidden=true;m.innerHTML=''};$('#pnCfX').onclick=close;$('#pnCfNo').onclick=close;
  if(foco==='estilo')setTimeout(()=>$('#pnCfEst').scrollIntoView({block:'start'}),40);
  $('#pnCfRead').onclick=async()=>{const url=$('#pnCfM').value.trim();const id=pnDocId(url);if(!id){$('#pnCfMsg').textContent='Cole o link de um Google Doc.';return}
    const b=$('#pnCfRead');btnLoad(b,true);$('#pnCfMsg').textContent='Lendo o modelo…';
    try{const doc=await pnReadDoc(id);const names=[...new Set([...PN_CL0.map(c=>c.k),...PN.vers.flatMap(v=>pnClasses(v).map(c=>c.k))])];const r=pnDetect(doc,names);
      const n=Object.values(r.achados).filter(Boolean).length;if(!n)throw {code:'tool_error',server:PN_SRV.docs,message:'não encontrei capítulos nem exemplos no documento (procuro “1. Correções”, “2. Melhorias”, “Antes:”, “Figura 1 - …”).'};
      await cap.db.collection('pnconfig').doc('design').set({modeloUrl:url,modeloId:id,titulo:String(doc.title||'').slice(0,200),estilos:r.estilos,named:r.named,achados:r.achados,lidoEm:nowISO(),lidoPor:me?.id||null});
      PN.cfg.design={modeloUrl:url,modeloId:id,titulo:doc.title||'',estilos:r.estilos,named:r.named,achados:r.achados,lidoEm:nowISO()};$('#pnCfAch').innerHTML=achados();
      $('#pnCfMsg').textContent=`${n} de ${PN_KEYS.length} estilos lidos.`;render()}
    catch(err){$('#pnCfMsg').textContent=err&&err.code==='tool_error'&&/não encontrei/.test(err.message||'')?'O modelo foi lido, mas '+err.message:pnErr(err,PN_SRV.docs)}finally{btnLoad(b,false)}};
  $('#pnCfLearn').onclick=async()=>{const b=$('#pnCfLearn');btnLoad(b,true);const msg=t=>$('#pnCfMsg').textContent=t;
    try{const links=$('#pnCfL').value.split(/\s+/).map(pnDocId).filter(Boolean);let fontes=[];
      if(links.length)fontes=links.slice(0,4).map(id=>({id,titulo:''}));
      else{const mid=(PN.cfg.design&&PN.cfg.design.modeloId)||pnDocId($('#pnCfM').value);if(!mid)throw {code:'x',message:'Leia o modelo primeiro ou cole links de versões anteriores.'};
        msg('Procurando versões anteriores na pasta do modelo…');const meta=await pnCall(PN_SRV.drive,'get_file_metadata',{fileId:mid,excludeContentSnippets:true});const pid=meta&&(meta.parentId||(meta.parents&&meta.parents[0]));
        if(!pid)throw {code:'x',message:'Não descobri a pasta do modelo. Cole os links das versões anteriores.'};
        const sr=await pnCall(PN_SRV.drive,'search_files',{query:`parentId = '${pid}' and mimeType = 'application/vnd.google-apps.document' and title contains 'Vers'`,orderBy:'modifiedTime desc',pageSize:8,excludeContentSnippets:true});
        const ids=new Set([mid,...PN.vers.map(v=>v.docId).filter(Boolean)]);fontes=((sr&&sr.files)||[]).filter(f=>!ids.has(f.id)).slice(0,3).map(f=>({id:f.id,titulo:f.title||''}))}
      if(!fontes.length)throw {code:'x',message:'Não encontrei versões anteriores na pasta. Cole os links abaixo.'};
      const txts=[];for(const f of fontes){msg(`Lendo ${f.titulo||'documento'}…`);const t=await pnDocText(f.id);f.titulo=f.titulo||t.titulo;txts.push(`### ${f.titulo}\n${t.txt.replace(/\n{3,}/g,'\n\n').slice(0,26000)}`)}
      msg('O Claude está estudando os documentos…');
      const r=await aiJ('estiloPn',`Você analisa Documentos de Atualização de Versão de um sistema (JMJ CRM) para ensinar outro redator a escrever as próximas versões exatamente no mesmo estilo. Leia os documentos abaixo (texto puro exportado; listas aparecem com "*", e marcações de imagem como [INSERIR IMAGEM: …] seguidas de "Figura N - …").

Responda APENAS com JSON {"guia":"","secoes":[""],"exemplos":[{"classe":"","texto":""}]}:
- "guia": regras práticas observadas, em tópicos curtos com "- ": como abre cada capítulo, como se escreve Antes/Após Ajustes, como as melhorias começam e terminam, uso de listas e "Importante:", como são os títulos dos itens (padrões "Tela - Aspecto", "Endpoint “…”"), como se citam menus, campos, endpoints e mensagens, onde entram imagens e como são as legendas, tempo verbal, termos recorrentes do sistema e o que nunca aparece. Até 30 tópicos.
- "secoes": as seções (áreas do sistema) que aparecem como agrupamento dentro dos capítulos, na ordem em que costumam aparecer, sem repetir.
- "exemplos": 4 a 6 itens copiados literalmente dos documentos (título do item + texto, até 900 caracteres cada), variando entre correção com Antes/Após, melhoria com lista e melhoria de API; "classe" é o capítulo de onde veio.

${txts.join('\n\n')}`,{model:'claude-sonnet-5-5',modelTier:'default'});
      if(!r||!r.guia)throw {code:'x',message:'O Claude não devolveu o guia.'};
      const est={guia:String(r.guia).slice(0,12000),secoes:(Array.isArray(r.secoes)?r.secoes:[]).map(s=>String(s).trim()).filter(Boolean).slice(0,40),exemplos:(Array.isArray(r.exemplos)?r.exemplos:[]).slice(0,6).map(x=>({classe:String(x.classe||''),texto:String(x.texto||'').slice(0,1500)})),fontes,links:links.map(id=>pnDocUrl(id)),lidoEm:nowISO(),lidoPor:me?.id||null};
      await cap.db.collection('pnconfig').doc('estilo').set(est);PN.cfg.estilo=est;$('#pnCfG').value=est.guia;$('#pnCfS').value=est.secoes.join('\n');msg(`Estilo aprendido de ${fontes.length} documento${fontes.length>1?'s':''}.`);render()}
    catch(err){msg(err&&err.code==='x'?err.message:pnErr(err,err&&err.server||PN_SRV.drive))}finally{btnLoad(b,false)}};
  const ok=$('#pnCfOk');const dirty=()=>{ok.classList.remove('saved');ok.textContent='Salvar guia e seções'};
  ['#pnCfG','#pnCfS','#pnCfL'].forEach(q=>{const el=$(q);if(el)el.addEventListener('input',dirty)});
  ok.onclick=async()=>{const cur=pnEstilo()||{};const est={...cur,guia:$('#pnCfG').value.trim().slice(0,12000),secoes:$('#pnCfS').value.split('\n').map(s=>s.trim()).filter(Boolean).slice(0,40),links:$('#pnCfL').value.split(/\s+/).map(pnDocId).filter(Boolean).map(id=>pnDocUrl(id)),editadoEm:nowISO()};
    btnLoad(ok,true);
    try{await cap.db.collection('pnconfig').doc('estilo').set(est);PN.cfg.estilo=est;
      btnLoad(ok,false);ok.classList.add('saved');ok.textContent='Salvo ✓';
      $('#pnCfMsg').textContent='Salvo em '+fmtDT(est.editadoEm);
      toast('Guia de escrita e seções salvos. O Claude passa a usar nos próximos textos.',3600,{kind:'ok',title:'Salvo'});render()}
    catch(e){btnLoad(ok,false);const m='Não foi possível salvar: '+(e.code||e.message);$('#pnCfMsg').textContent=m;toast(m,6000)}}}

/* ---------- 4. envio ao Google Doc da versão ---------- */
const pnCut=(t,n)=>{t=String(t||'');return t.length>n?t.slice(0,n-1).trimEnd()+'…':t};
async function pnSendStart(v){const d=pnDesign();if(!d){openPnCfg();return}if(!v.docId){openPnDados(v);return}
  const btn=$('#pnSend');btnLoad(btn,true);PN.work='Lendo o Google Doc da versão…';render();
  try{const doc=await pnReadDoc(v.docId);const reg=pnRegion(doc,v);const paras=pnParas(v);const olds=pnOldVersions(doc,v);
    if(reg.tables){toast('Há tabela no meio do conteúdo atual do documento. Remova a tabela ou envie para um documento novo.',7000);return}
    const m=$('#modal');const nF=paras.filter(p=>p.k==='img').length;const nFSem=paras.filter(p=>p.k==='img'&&!p.print).length;
    m.innerHTML=`<div class="box" style="max-width:600px" role="dialog" aria-modal="true" aria-labelledby="pnSdT"><b id="pnSdT" style="font-size:17px">Enviar ao Google Doc</b>
    <div class="small"><b>${esc(doc.title||'Documento')}</b></div>
    ${reg.mode==='replace'?`<div class="pnwarnbox small">Vou <b>substituir</b> o conteúdo atual dos capítulos (${reg.count} parágrafos), de “${esc(pnCut(reg.first,80))}” até “${esc(pnCut(reg.last,80))}”. Capa, sumário e contracapa ficam como estão.</div>`
      :`<div class="small">O documento ainda não tem capítulos. Vou inserir o conteúdo ${esc(reg.where)}.</div>`}
    <div class="small">${paras.filter(p=>p.k==='item').length} itens${nF?`, ${nF} imagem${nF===1?'':'ns'}`:''}, no estilo do modelo “${esc(d.titulo||'modelo')}”.</div>
    ${nFSem?`<div class="pnwarnbox small">${nFSem} de ${nF} imagem${nFSem===1?'':'ns'} ainda sem print anexado: vou gravar a marcação de texto no lugar. Anexe o print na aba Documento e envie de novo se quiser a imagem já no documento.</div>`:''}
    ${olds.length?`<div class="small">Números de versão encontrados no resto do documento (capa, cabeçalho, títulos). Marque os que devem virar <b>${esc(v.versao)}</b>:</div><div class="row">${olds.map((o,i)=>`<label class="chk"><input type="checkbox" data-old="${esc(o)}"${i===0?' checked':''}><span>${esc(o)}</span></label>`).join('')}</div>`:''}
    <div class="small muted">Depois de gravar, atualize o sumário no Google Docs (clique nele e em Atualizar). Se precisar voltar, use Arquivo → Histórico de versões.</div>
    <div class="row"><span class="grow"></span><button id="pnSdNo">Cancelar</button><button class="pri" id="pnSdGo">Gravar no documento</button></div></div>`;
    m.hidden=false;const close=()=>{m.hidden=true;m.innerHTML=''};$('#pnSdNo').onclick=close;
    $('#pnSdGo').onclick=async()=>{const go=$('#pnSdGo');btnLoad(go,true);const trocar=[...m.querySelectorAll('[data-old]:checked')].map(x=>x.dataset.old);
      try{const {requests}=pnRequests(paras,reg,{trocar,versao:v.versao});
        await pnCall(PN_SRV.docs,'update_doc',{documentId:v.docId,requests,writeControl:{requiredRevisionId:doc.revisionId}});
        close();let headings={};
        try{const d2=await pnReadDoc(v.docId);const P2=pnFlat(d2).filter(p=>p.kind==='p');const its=paras.filter(p=>p.k==='item');let k=0;
          for(const p of P2){if(k>=its.length)break;if(pnClean(p.txt)===pnClean(its[k].txt)&&p.ps.headingId){headings[its[k].itemId]=p.ps.headingId;k++}}}catch(e){}
        await pnUpd('pnversoes',v.id,{enviadoEm:nowISO(),enviadoPor:me?.id||null,envio:{headings,itens:paras.filter(p=>p.k==='item').length,figuras:nF},nItens:paras.filter(p=>p.k==='item').length});
        toastUndo('Documento gravado.','Abrir',()=>window.open(pnDocUrl(v.docId),'_blank','noopener'),12000,{kind:'ok',title:'Versão '+v.versao+' no Google Doc'})}
      catch(e){btnLoad(go,false);const rev=e&&e.code==='tool_error'&&/revision/i.test(e.message||'');m.querySelector('.box').insertAdjacentHTML('beforeend',`<div class="pnerr small">${rev?'O documento mudou enquanto você confirmava. Feche e envie de novo.':esc(pnErr(e,PN_SRV.docs))}</div>`)}}}
  catch(e){toast(pnErr(e,PN_SRV.docs),8000)}finally{PN.work='';btnLoad(btn,false);render()}}

/* ---------- tela ---------- */
function renderPatch(sc){pnSubscribe();if(st.view==='pnver'){pnSubItens(PN.ver)}
  const foc=document.activeElement&&sc.contains(document.activeElement)?(document.activeElement.closest('[data-pnrow]')?{row:document.activeElement.closest('[data-pnrow]').dataset.pnrow,f:document.activeElement.dataset.pnf}:document.activeElement.id?{id:document.activeElement.id}:null):null;
  const key=st.view+'|'+PN.ver;sc.dataset.v=st.view;sc.innerHTML=st.view==='patch'?patchHTML():pnverHTML();
  sc.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>nav(b.dataset.nav));
  if(st.view==='patch')bindPatch(sc);else bindPnver(sc);
  if(foc){const el=foc.row?sc.querySelector(`[data-pnrow="${CSS.escape(foc.row)}"] [data-pnf="${CSS.escape(foc.f||'')}"]`):document.getElementById(foc.id);if(el)el.focus({preventScroll:true})}
  if(key!==lastScreen){lastScreen=key;enterAnim(sc)}}

