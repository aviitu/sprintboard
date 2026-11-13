/* ---------- Keeper: notas da equipe (scripts, credenciais, links, anotações) ---------- */
const KTYPES={script:{l:'Script',pl:'Scripts',ic:'<path d="M8.5 8 4.5 12l4 4M15.5 8l4 4-4 4M13.5 5.5l-3 13"/>'},
  credencial:{l:'Credencial',pl:'Credenciais',ic:'<circle cx="8" cy="15.5" r="3.5"/><path d="M10.5 13 19 4.5M15.5 8l2.5 2.5M18 5.5 19.5 7"/>'},
  link:{l:'Link',pl:'Links',ic:'<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3A4.5 4.5 0 0 0 13 4.6l-1.2 1.2"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3A4.5 4.5 0 0 0 11 19.4l1.2-1.2"/>'},
  anotacao:{l:'Anotação',pl:'Anotações',ic:'<path d="M6 4.5h12A1.5 1.5 0 0 1 19.5 6v8.5l-5 5H6A1.5 1.5 0 0 1 4.5 18V6A1.5 1.5 0 0 1 6 4.5z"/><path d="M19.5 14.5h-5v5M8 9h8M8 12.5h4.5"/>'}};
const KCORES=[['','Padrão'],['argila','Argila'],['areia','Areia'],['oliva','Oliva'],['ceu','Céu'],['pedra','Pedra']];
/* notas antigas guardam as cores do modelo anterior: abrem já na cor pastel equivalente */
const KCOR_OLD={coral:'argila',rosa:'argila',laranja:'areia',amarelo:'areia',verde:'oliva',turquesa:'oliva',azul:'ceu',roxo:'pedra'};
function kpCor(c){c=String(c||'');return KCOR_OLD[c]||(KCORES.some(x=>x[0]===c)?c:'')}
const KIC={expand:'<path d="M14 4.5h5.5V10M10 19.5H4.5V14M19.5 4.5l-6 6M4.5 19.5l6-6"/>',pin:'<path d="M9 4.5h6l-1 5.5 3 3.5H7l3-3.5z"/><path d="M12 13.5V20"/>',lock:'<rect x="5.5" y="10.5" width="13" height="9.5" rx="2.2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',team:'<circle cx="9" cy="9" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="10" r="2.4"/><path d="M16 14.6a4.6 4.6 0 0 1 4.6 4.4"/>',
  copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',eyeoff:'<path d="M3 3l18 18"/><path d="M10.6 5.6A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M6.6 6.9A16.6 16.6 0 0 0 2.5 12S6 18.5 12 18.5a9.6 9.6 0 0 0 4.8-1.300"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  open:'<path d="M14 4.5h5.5V10M19.5 4.5l-8 8"/><path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',trash:'<path d="M4.5 7h15M9.5 7V4.5h5V7"/><path d="M6.5 7l1 13h9l1-13"/>',plus:'<path d="M12 5v14M5 12h14"/>',spark:'<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z"/><path d="M18.5 16l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  note:'<path d="M6 4.5h12A1.5 1.5 0 0 1 19.5 6v8.5l-5 5H6A1.5 1.5 0 0 1 4.5 18V6A1.5 1.5 0 0 1 6 4.5z"/><path d="M19.5 14.5h-5v5"/>',
  grid:'<rect x="4.5" y="4.5" width="6" height="6" rx="1.5"/><rect x="13.5" y="4.5" width="6" height="6" rx="1.5"/><rect x="4.5" y="13.5" width="6" height="6" rx="1.5"/><rect x="13.5" y="13.5" width="6" height="6" rx="1.5"/>',full:'<rect x="4.5" y="4.5" width="6" height="15" rx="1.5"/><rect x="13.5" y="4.5" width="6" height="8" rx="1.5"/><rect x="13.5" y="15.5" width="6" height="4" rx="1.5"/>'};
const ksvg=(d,cls='ico')=>`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const kib=(n,tip,attrs='',cls='')=>`<button type="button" class="ib ${cls}" data-tip="${esc(tip)}" aria-label="${esc(tip)}" ${attrs}>${ksvg(KIC[n])}</button>`;
const KP={shared:[],priv:[],q:'',f:'',sub:false,loaded:false,err:'',html:null,reveal:new Set(),mode:'compacto'};
try{if(localStorage.getItem('sb-kpmode')==='completo')KP.mode='completo'}catch(e){}
let KE=null;
const kpCol=p=>p?cap.db.collection('data/users/'+me.id+'/keeper/notas'):cap.db.collection('keeper');
function kpSubscribe(){if(KP.sub||!cap.db)return;KP.sub=true;const map=snap=>snap.docs.map(d=>({id:d.id,...d.data()}));
  const t=setTimeout(()=>{if(!KP.loaded){KP.err='A base demorou para responder. Recarregue a página.';paintKeeper()}},10000);
  cap.db.collection('keeper').onSnapshot(snap=>{clearTimeout(t);KP.shared=map(snap);KP.loaded=true;KP.err='';if(st.view==='keeper')paintKeeper()},e=>{clearTimeout(t);KP.err='Não foi possível ler as notas ('+(e.code||e.message)+').';paintKeeper()});
  if(me?.id)try{kpCol(true).onSnapshot(snap=>{KP.priv=map(snap);if(st.view==='keeper')paintKeeper()},()=>{})}catch(e){}}
/* ordem: notas que você arrastou guardam "ordem"; as novas (sem ordem) aparecem antes, da mais recente para a mais antiga */
function kpAll(){const hasO=n=>typeof n.ordem==='number';return[...KP.shared.map(n=>({...n,_p:false})),...KP.priv.map(n=>({...n,_p:true}))].sort((a,b)=>hasO(a)!==hasO(b)?(hasO(a)?1:-1):hasO(a)?a.ordem-b.ordem:String(b.atualizadoEm||b.criadoEm||'').localeCompare(String(a.atualizadoEm||a.criadoEm||'')))}
function kpGuess(t){t=String(t||'').trim();if(!t)return{tipo:'anotacao',lang:''};const lines=t.split(/\n/).map(x=>x.trim()).filter(Boolean);
  if(lines.length<=3&&lines.every(x=>/^https?:\/\/\S+$/i.test(x)))return{tipo:'link',lang:''};
  if(/^\s*(select|insert\s+into|update|delete\s+from|create|alter|drop|merge|with|declare|begin|grant|truncate)\b/im.test(t)&&/\b(from|into|set|table|view|index|end|values|sequence|column)\b/i.test(t))return{tipo:'script',lang:'sql'};
  if(/^#!|^\s*(curl|wget|ssh|scp|git|docker|kubectl|npm|npx|yarn|mvn|gradle|sudo|export|chmod|systemctl)\s/m.test(t))return{tipo:'script',lang:'bash'};
  if(/\b(senha|password|passwd|pwd|token|api[_ -]?key|secret|client[_ -]?secret|bearer|usu[aá]rio|login|username|user)\b\s*[:=]/i.test(t)||/\beyJ[\w-]{10,}\.[\w-]{10,}\./.test(t)||(lines.length===1&&/^[A-Za-z0-9_\-+/=.]{28,}$/.test(t)))return{tipo:'credencial',lang:''};
  if(/^[\[{][\s\S]*[\]}]$/.test(t)&&/"\s*:/.test(t))return{tipo:'script',lang:'json'};
  if(/^<\?xml|^<[a-zA-Z][\s\S]*<\/[a-zA-Z][\w:.-]*>\s*$/.test(t))return{tipo:'script',lang:'xml'};
  if(/\b(function|const|let|var|public\s+class|private\s+\w+|import\s+[\w{*]|return)\b/.test(t)&&/[;{}]\s*$/m.test(t))return{tipo:'script',lang:/\b(public|private)\s+(class|static|void|\w+\s+\w+\()/.test(t)?'java':'javascript'};
  if(/^\s*(def |class \w+.*:|import \w+|from \w+ import )/m.test(t)&&/:\s*$/m.test(t))return{tipo:'script',lang:'python'};
  return{tipo:'anotacao',lang:''}}
function kpMask(t){return String(t||'').split('\n').map(l=>{const m=l.match(/^(\s*[^:=\n]{1,32}[:=]\s*)(\S.*)$/);if(m)return m[1]+'•'.repeat(Math.min(Math.max(m[2].length,6),14));return l.trim()?'•'.repeat(Math.min(Math.max(l.trim().length,6),18)):l}).join('\n')}
function kpFirstUrl(t){const m=String(t||'').match(/https?:\/\/[^\s"'<>)]+/i);return m?m[0]:''}
function kpCard(n){const tp=KTYPES[n.tipo]?n.tipo:'anotacao',T=KTYPES[tp];const key=(n._p?'p:':'s:')+n.id;const masked=tp==='credencial'&&!KP.reveal.has(key);
  const lim=KP.mode==='completo'?20000:700;const raw=String(n.texto||'').slice(0,lim);const edit=!masked&&String(n.texto||'').length<=lim;const body=masked?esc(kpMask(raw)):edit?esc(raw):tp==='link'?esc(raw).replace(/https?:\/\/[^\s"'&<>)]+/gi,u=>`<a href="${u}" target="_blank" rel="noopener noreferrer" data-kstop>${u}</a>`):esc(raw);
  const url=tp==='link'?kpFirstUrl(n.texto):'';const who=nameOf(n.atualizadoPor||n.criadoPor,n.atualizadoPorNome||n.criadoPorNome||'');const when=fmtDT(n.atualizadoEm||n.criadoEm).slice(0,10);
  return `<div class="kn nc-${esc(kpCor(n.cor))}${KP.mode==='completo'?' kdrag':''}" role="button" tabindex="0" data-kn="${esc(key)}" aria-label="${esc((n.titulo||T.l)+', '+T.l)}"><div class="knh"><span class="pill">${ksvg(T.ic,'')}${T.l}</span><span class="grow"></span>${n._p?`<span class="knlock" title="Só você vê esta nota">${ksvg(KIC.lock,'')}</span>`:''}${kib('pin',n.fixada?'Desafixar':'Fixar no topo',`data-kpin="${esc(key)}"`,'knpin'+(n.fixada?' on':''))}</div>
  ${n.titulo||edit?`<div class="knt"${edit?` contenteditable="plaintext-only" spellcheck="false" data-kedit="titulo" data-ph="Título" aria-label="Título da nota (editável)"`:''}>${esc(n.titulo||'')}</div>`:''}<div class="knb${tp==='script'||tp==='credencial'?' mono':''}"${edit?` contenteditable="plaintext-only" spellcheck="false" data-kedit="texto" aria-label="Conteúdo da nota (editável)"`:''}>${body}</div>
  <div class="knf"><span class="small">${esc(who)}${who&&when?' · ':''}${esc(when)}</span><span class="grow"></span>${tp==='credencial'?kib(masked?'eye':'eyeoff',masked?'Mostrar':'Ocultar',`data-kshow="${esc(key)}"`):''}${url?`<a class="ib" href="${esc(url)}" target="_blank" rel="noopener noreferrer" data-kstop data-tip="Abrir link" aria-label="Abrir link">${ksvg(KIC.open)}</a>`:''}${kib('copy','Copiar conteúdo',`data-kcopy="${esc(key)}"`)}${kib('expand','Abrir a nota',`data-kopen="${esc(key)}"`)}</div></div>`}
function keeperHTML(){return `<div class="scrin kp"><div class="scrhead"><div><h1 data-ui>Keeper</h1><p class="small muted" data-ui>Scripts, credenciais, links e anotações da equipe.</p></div><span class="grow"></span><div class="kseg kpmode" id="kpMode" role="group" aria-label="Exibição das notas"><button type="button" data-km="compacto" aria-pressed="${KP.mode==='compacto'}">${ksvg(KIC.grid,'')}Compacto</button><button type="button" data-km="completo" aria-pressed="${KP.mode==='completo'}">${ksvg(KIC.full,'')}Completo</button></div><input type="search" class="kpq" id="kpQ" placeholder="Buscar nota" aria-label="Buscar nota" value="${esc(KP.q)}"></div>
  <button type="button" class="kpnew" id="kpNew">${ksvg(KIC.plus,'')}<span>Criar uma nota…</span><span class="kphint">ou cole direto com Ctrl+V</span></button>
  <div class="kpbar" id="kpChips" role="group" aria-label="Filtrar por classificação"></div><div id="kpGrid"></div></div>`}
function paintKeeper(){const host=$('#kpGrid');if(!host||st.view!=='keeper')return;if(KP.editing||KP.dragging){KP.dirty=true;return}const all=kpAll();const cnt=k=>all.filter(n=>(KTYPES[n.tipo]?n.tipo:'anotacao')===k).length;
  const chips=`<button type="button" class="kpchip" data-kf="" aria-pressed="${!KP.f}">Todas <b>${all.length}</b></button>`+Object.entries(KTYPES).map(([k,T])=>`<button type="button" class="kpchip" data-kf="${k}" aria-pressed="${KP.f===k}">${ksvg(T.ic,'')}${T.pl} <b>${cnt(k)}</b></button>`).join('');
  const q=norm(KP.q).trim();const list=all.filter(n=>(!KP.f||(KTYPES[n.tipo]?n.tipo:'anotacao')===KP.f)&&(!q||norm((n.titulo||'')+' '+(n.tipo==='credencial'?'':n.texto||'')+' '+(KTYPES[n.tipo]?.l||'')).includes(q)));
  let h;
  if(KP.err&&!KP.loaded)h=`<div class="kpempty"><b>${esc(KP.err)}</b></div>`;
  else if(!KP.loaded)h=`<div class="kpgrid">${'<div class="kn skel"></div>'.repeat(6)}</div>`;
  else if(!all.length)h=`<div class="kpempty">${ksvg(KIC.note,'')}<b>Nenhuma nota ainda</b><span>Cole um script, uma credencial ou um link, ou clique em "Criar uma nota".</span></div>`;
  else if(!list.length)h=`<div class="kpempty"><b>Nenhuma nota encontrada</b><span>Tente outra busca ou outro filtro.</span></div>`;
  else{const fx=list.filter(n=>n.fixada),ot=list.filter(n=>!n.fixada);h=(fx.length?`<h3 class="kpsec">Fixadas</h3>${kpGrid(fx)}${ot.length?'<h3 class="kpsec">Outras</h3>':''}`:'')+(ot.length?kpGrid(ot):'')}
  const sig=KP.mode+kpCols()+chips+h;if(sig===KP.html)return;KP.html=sig;$('#kpChips').innerHTML=chips;host.innerHTML=h}
function kpCols(){if(KP.mode!=='completo')return 0;const w=($('#kpGrid')||document.body).clientWidth||960;const min=innerWidth<=560?160:250;return Math.max(1,Math.min(6,Math.floor((w+14)/(min+14))))}
function kpEst(n){const t=(n.tipo==='credencial'&&!KP.reveal.has((n._p?'p:':'s:')+n.id))?kpMask(n.texto):String(n.texto||'');const lines=t.split('\n').reduce((s,l)=>s+Math.max(1,Math.ceil(l.length/34)),0);return 70+(n.titulo?24:0)+Math.min(lines,900)*19}
function kpGrid(arr){if(KP.mode!=='completo')return `<div class="kpgrid">${arr.map(kpCard).join('')}</div>`;
  const N=kpCols();const cols=Array.from({length:N},()=>({h:0,a:[]}));for(const n of arr){const c=cols.reduce((m,x)=>x.h<m.h?x:m,cols[0]);c.a.push(n);c.h+=kpEst(n)+14}
  return `<div class="kpmas" style="--kc:${N}">${cols.map(c=>`<div class="kpcol">${c.a.map(kpCard).join('')}</div>`).join('')}</div>`}
let kpRz=0;addEventListener('resize',()=>{if(st.view!=='keeper'||KP.mode!=='completo')return;clearTimeout(kpRz);kpRz=setTimeout(paintKeeper,120)});
function kpFind(key){const p=key.startsWith('p:');const id=key.slice(2);const n=(p?KP.priv:KP.shared).find(x=>x.id===id);return n?{...n,_p:p}:null}
async function kpCopy(t){try{await navigator.clipboard.writeText(t);toast('Copiado.')}catch(e){try{const ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;opacity:0';document.body.append(ta);ta.select();document.execCommand('copy');ta.remove();toast('Copiado.')}catch(err){toast('Não foi possível copiar aqui. Abra a nota e copie o texto.')}}}
function bindKeeper(sc){const q=$('#kpQ');q.oninput=()=>{KP.q=q.value;paintKeeper()};q.onkeydown=e=>{if(e.key==='Escape'){q.value='';KP.q='';paintKeeper()}};
  $('#kpNew').onclick=()=>kpOpen(null);
  $('#kpMode').onclick=e=>{const b=e.target.closest('[data-km]');if(!b||b.dataset.km===KP.mode)return;KP.mode=b.dataset.km;try{localStorage.setItem('sb-kpmode',KP.mode)}catch(err){}$('#kpMode').querySelectorAll('[data-km]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.km===KP.mode)));paintKeeper()};
  $('#kpChips').onclick=e=>{const b=e.target.closest('[data-kf]');if(!b)return;KP.f=b.dataset.kf;paintKeeper()};
  const g=$('#kpGrid');
  g.onclick=async e=>{if(e.target.closest('[data-kstop]'))return;if(KP.justDragged){KP.justDragged=false;return}if(e.target.closest('[data-kedit]'))return;const ko=e.target.closest('[data-kopen]');if(ko){e.stopPropagation();const n=kpFind(ko.dataset.kopen);if(n)kpOpen(n);return}const t=e.target.closest('[data-kpin],[data-kshow],[data-kcopy]');
    if(t){e.stopPropagation();const key=t.dataset.kpin||t.dataset.kshow||t.dataset.kcopy;const n=kpFind(key);if(!n)return;
      if(t.dataset.kcopy)return kpCopy(n.texto||'');
      if(t.dataset.kshow){KP.reveal.has(key)?KP.reveal.delete(key):KP.reveal.add(key);return paintKeeper()}
      try{await kpCol(n._p).doc(n.id).update({fixada:!n.fixada})}catch(err){toast('Não foi possível fixar: '+(err.code||err.message))}return}
    const c=e.target.closest('[data-kn]');if(c){const n=kpFind(c.dataset.kn);if(n)kpOpen(n)}};
  kpBindInline(g);kpBindDrag(g);
  g.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-kn]')){e.preventDefault();const n=kpFind(e.target.dataset.kn);if(n)kpOpen(n)}}}
function kpOpen(n,preset){const m=$('#modal');const isNew=!n;KE={n,isNew,cor:kpCor(n?.cor),tipo:n&&KTYPES[n.tipo]?n.tipo:'anotacao',p:n?!!n._p:false,fix:n?!!n.fixada:false};
  m.innerHTML=`<div class="box kedit" role="dialog" aria-modal="true" aria-label="${isNew?'Nova nota':'Editar nota'}">
  <input type="text" id="keT" placeholder="Título" maxlength="120" value="${esc(n?.titulo||'')}" aria-label="Título da nota">
  <div class="kcode" id="keCode"><div class="kcodeh"><span class="klang" id="keLang">Texto</span><span class="grow"></span><button type="button" class="cpy" id="keCodeCp">${ksvg(KIC.copy,'')}Copiar</button></div><textarea id="keX" rows="8" placeholder="Escreva ou cole aqui: script, credencial, link ou anotação…" aria-label="Conteúdo da nota" spellcheck="false">${esc(n?.texto||preset||'')}</textarea></div>
  <div class="kerow"><span class="kelbl">Classificação</span><div class="kechips" id="keTipos" role="group" aria-label="Classificação da nota"></div></div>
  <div class="kerow"><span class="kelbl">Cor</span><div class="kecores" id="keCores" role="radiogroup" aria-label="Cor da nota"></div></div>
  ${me?.id?`<div class="kerow"><span class="kelbl">Quem vê</span><div class="kseg" id="keVis" role="group" aria-label="Quem vê a nota"><button type="button" data-kv="0">${ksvg(KIC.team,'')}Equipe</button><button type="button" data-kv="1">${ksvg(KIC.lock,'')}Só eu</button></div><span class="small muted" id="keVisH"></span></div>`:''}
  <div class="row kefoot"><span class="small muted" id="keMeta">${n?esc('Editada por '+nameOf(n.atualizadoPor||n.criadoPor,n.atualizadoPorNome||n.criadoPorNome||'alguém')+' em '+fmtDT(n.atualizadoEm||n.criadoEm)):''}</span><span class="grow"></span>${kib('pin','Fixar no topo','id="kePin"')}${kib('copy','Copiar conteúdo','id="keCopy"')}${isNew?'':kib('trash','Apagar nota','id="keDel"','ib-bad')}<button type="button" class="pri" id="keOk">Concluído</button></div></div>`;
  m.hidden=false;m.onclick=e=>{if(e.target===m&&KE&&$('#modal .kedit'))kpSave()};
  const x=$('#keX');const grow=()=>{x.style.height='auto';x.style.height=Math.min(x.scrollHeight+2,innerHeight*.48)+'px'};
  x.oninput=()=>{grow();if(KE.tipo==='script')kePaint()};x.onkeydown=e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();kpSave()}};$('#keT').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();x.focus()}};
  $('#keTipos').onclick=e=>{const b=e.target.closest('[data-kt]');if(!b)return;KE.tipo=b.dataset.kt;kePaint()};
  $('#keCores').onclick=e=>{const b=e.target.closest('[data-kc]');if(!b)return;KE.cor=b.dataset.kc;kePaint()};
  const vis=$('#keVis');if(vis)vis.onclick=e=>{const b=e.target.closest('[data-kv]');if(!b)return;KE.p=b.dataset.kv==='1';kePaint()};
  $('#kePin').onclick=()=>{KE.fix=!KE.fix;kePaint()};$('#keCopy').onclick=()=>kpCopy(x.value);$('#keCodeCp').onclick=()=>{try{x.focus();x.setSelectionRange(0,x.value.length)}catch(err){}kpCopy(x.value)};$('#keOk').onclick=()=>kpSave();
  const del=$('#keDel');if(del)del.onclick=async()=>{const {id,_p,...data}=n;KE=null;m.hidden=true;try{await kpCol(_p).doc(id).delete();toastUndo('Nota apagada.','Desfazer',async()=>{await kpCol(_p).doc(id).set(data)})}catch(e){toast('Não foi possível apagar a nota: '+(e.code||e.message))}};
  kePaint();grow();if(isNew||!x.value)(preset?$('#keT'):x).focus();else x.focus({preventScroll:true})}
function kePaint(){if(!KE)return;const box=$('#modal .kedit');if(!box)return;box.className='box kedit nc-'+KE.cor;const x=$('#keX');const g=kpGuess(x.value);const eff=KE.tipo;
  x.classList.toggle('mono',eff==='script'||eff==='credencial');
  {const code=$('#keCode');const isCode=eff==='script'&&!!x.value.trim();code.classList.toggle('on',isCode);
   if(isCode)$('#keLang').textContent=((KE.n&&KE.n.lang&&x.value===(KE.n.texto||'')?KE.n.lang:g.lang)||'texto')}
  $('#keTipos').innerHTML=Object.entries(KTYPES).map(([k,T])=>`<button type="button" class="kpchip" data-kt="${k}" aria-pressed="${KE.tipo===k}">${ksvg(T.ic,'')}${T.l}</button>`).join('');
  $('#keCores').innerHTML=KCORES.map(([k,l])=>`<button type="button" class="kcor nc-${k}" role="radio" aria-checked="${KE.cor===k}" data-kc="${k}" title="${l}" aria-label="${l}">${ksvg(KIC.check,'')}</button>`).join('');
  const vis=$('#keVis');if(vis){vis.querySelectorAll('[data-kv]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.kv==='1')===KE.p)));$('#keVisH').textContent=KE.p?'Só você vê esta nota.':'Todos que abrem o Sprintboard veem esta nota.'}
  const pin=$('#kePin');pin.classList.toggle('on',KE.fix);pin.dataset.tip=KE.fix?'Desafixar':'Fixar no topo';pin.setAttribute('aria-label',pin.dataset.tip)}
async function kpSave(){const E=KE;if(!E)return;const m=$('#modal');const titulo=$('#keT').value.trim(),texto=$('#keX').value.replace(/\s+$/,'');KE=null;m.hidden=true;
  if(!titulo&&!texto.trim())return;const g=kpGuess(texto);const tipo=KTYPES[E.tipo]?E.tipo:'anotacao';const lang=tipo==='script'?g.lang:'';const quem={atualizadoEm:nowISO(),atualizadoPor:me?.id||null,atualizadoPorNome:me?.name||''};
  try{
    if(E.isNew){await kpCol(E.p).add({titulo,texto,tipo,tipoPor:'manual',lang,cor:E.cor,fixada:E.fix,criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||'',...quem});
      toast('Nota salva.');return}
    const n=E.n;const txt=texto!==(n.texto||''),tit=titulo!==(n.titulo||'');const tipoMud=tipo!==n.tipo;const mover=E.p!==!!n._p;
    if(!txt&&!tit&&!tipoMud&&!mover&&E.cor===(n.cor||'')&&E.fix===!!n.fixada)return;
    const up={titulo,texto,cor:E.cor,fixada:E.fix,...(txt||tit?quem:{})};if(tit&&titulo)up.tituloPor='manual';
    up.tipo=tipo;up.tipoPor='manual';up.lang=lang;
    if(mover){const {id:_i,_p,...rest}=n;await kpCol(E.p).add({...rest,...up});await kpCol(n._p).doc(n.id).delete();toast(E.p?'Nota movida para "Só eu".':'Nota compartilhada com a equipe.')}
    else await kpCol(n._p).doc(n.id).update(up);
  }catch(e){toast('Não foi possível salvar a nota: '+(e.code||e.message))}}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&KE&&!$('#modal').hidden&&$('#modal .kedit')&&$('#ask').hidden){e.preventDefault();e.stopImmediatePropagation();kpSave()}},true);
document.addEventListener('paste',e=>{if(st.view!=='keeper'||!$('#modal').hidden||!$('#ask').hidden||!cap.db)return;const a=document.activeElement;if(a&&(/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)||a.isContentEditable))return;const t=e.clipboardData?.getData('text/plain');if(!t||!t.trim())return;e.preventDefault();kpOpen(null,t)});


/* ---------- editar a nota direto no cartão ---------- */
function kpBindInline(g){
  g.addEventListener('focusin',e=>{const ed=e.target.closest('[data-kedit]');if(!ed)return;KP.editing=true;ed.dataset.orig=ed.textContent;ed.closest('.kn')?.classList.add('editing')});
  g.addEventListener('focusout',async e=>{const ed=e.target.closest('[data-kedit]');if(!ed)return;const card=ed.closest('.kn');card?.classList.remove('editing');KP.editing=false;
    const f=ed.dataset.kedit;const val=f==='titulo'?ed.textContent.replace(/\s+/g,' ').trim():ed.textContent.replace(/\s+$/,'');const orig=ed.dataset.orig??'';
    const n=card&&kpFind(card.dataset.kn);
    if(n&&val!==(f==='titulo'?orig.replace(/\s+/g,' ').trim():orig.replace(/\s+$/,''))){const prev={[f]:n[f]||''};
      const up={[f]:val,atualizadoEm:nowISO(),atualizadoPor:me?.id||null,atualizadoPorNome:me?.name||''};if(f==='titulo'&&val)up.tituloPor='manual';
      const loc=(n._p?KP.priv:KP.shared).find(x=>x.id===n.id);if(loc)Object.assign(loc,up);
      try{await kpCol(n._p).doc(n.id).update(up);toastUndo('Nota atualizada.','Desfazer',async()=>{await kpCol(n._p).doc(n.id).update(prev)},6000,{kind:'ok'})}catch(err){toast('Não foi possível salvar a nota: '+(err.code||err.message))}}
    setTimeout(()=>{if(!KP.editing&&KP.dirty){KP.dirty=false;KP.html=null;paintKeeper()}},60)});
  g.addEventListener('keydown',e=>{const ed=e.target.closest&&e.target.closest('[data-kedit]');if(!ed)return;e.stopPropagation();
    if(e.key==='Escape'){e.preventDefault();ed.textContent=ed.dataset.orig??ed.textContent;ed.blur()}
    else if(e.key==='Enter'&&(ed.dataset.kedit==='titulo'||e.ctrlKey||e.metaKey)){e.preventDefault();ed.blur()}},true)}
/* ---------- modo completo: arrastar os cartões para ordenar ---------- */
function kpBindDrag(g){let D=null;
  const clear=()=>g.querySelectorAll('.kdrop-b,.kdrop-a').forEach(x=>x.classList.remove('kdrop-b','kdrop-a'));
  g.addEventListener('pointerdown',e=>{if(KP.mode!=='completo'||e.button!==0)return;const card=e.target.closest('.kn.kdrag');if(!card||e.target.closest('button,a,[data-kedit]:focus,[contenteditable]:focus'))return;
    D={card,x:e.clientX,y:e.clientY,on:false,pid:e.pointerId}});
  g.addEventListener('pointermove',e=>{if(!D||e.pointerId!==D.pid)return;
    if(!D.on){if(Math.hypot(e.clientX-D.x,e.clientY-D.y)<7)return;D.on=true;KP.dragging=true;const r=D.card.getBoundingClientRect();D.dx=D.x-r.left;D.dy=D.y-r.top;
      const gh=D.card.cloneNode(true);gh.classList.add('kghost');gh.style.width=r.width+'px';gh.removeAttribute('data-kn');document.body.appendChild(gh);D.gh=gh;D.card.classList.add('kdragging');try{g.setPointerCapture(e.pointerId)}catch(err){}document.getSelection()?.removeAllRanges()}
    e.preventDefault();D.gh.style.transform=`translate(${e.clientX-D.dx}px,${e.clientY-D.dy}px) rotate(1.5deg)`;
    const el=document.elementFromPoint(e.clientX,e.clientY);const t=el&&el.closest('.kn[data-kn]');clear();D.t=null;
    if(t&&t!==D.card&&t.closest('.kpmas')===D.card.closest('.kpmas')){const r=t.getBoundingClientRect();D.after=e.clientY>r.top+r.height/2;D.t=t;t.classList.add(D.after?'kdrop-a':'kdrop-b')}});
  const end=async e=>{if(!D)return;const d=D;D=null;if(!d.on)return;KP.justDragged=true;setTimeout(()=>{KP.justDragged=false},50);d.gh?.remove();d.card.classList.remove('kdragging');clear();KP.dragging=false;
    if(!d.t){if(KP.dirty){KP.dirty=false;KP.html=null;paintKeeper()}return}
    const fix=!!kpFind(d.card.dataset.kn)?.fixada;const all=kpAll().filter(n=>!!n.fixada===fix);const keys=all.map(n=>(n._p?'p:':'s:')+n.id);
    const from=keys.indexOf(d.card.dataset.kn);if(from<0)return;keys.splice(from,1);let to=keys.indexOf(d.t.dataset.kn);if(to<0)return;if(d.after)to++;keys.splice(to,0,d.card.dataset.kn);
    const ups=[];keys.forEach((k,i)=>{const n=kpFind(k);const o=(i+1)*10;if(n&&n.ordem!==o){ups.push([n,o]);const loc=(n._p?KP.priv:KP.shared).find(x=>x.id===n.id);if(loc)loc.ordem=o}});
    KP.dirty=false;KP.html=null;paintKeeper();
    try{await Promise.all(ups.map(([n,o])=>kpCol(n._p).doc(n.id).update({ordem:o})))}catch(err){toast('Não foi possível guardar a nova ordem: '+(err.code||err.message))}};
  g.addEventListener('pointerup',end);g.addEventListener('pointercancel',end)}
