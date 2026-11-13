/* ---------- telas: início, sprints, kanban ---------- */
const MODS=[
  {k:'tester',t:'Tester',d:'Gere cenários de testes, valide conforme as atividades e envie as observações para o Artia.',ok:true,
   ic:'<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4.5h6v2.5H9z"/><path d="M8.5 12.5l2 2 4-4.5"/><path d="M8.5 17.5h7"/>'},
  {k:'patch',t:'Patch Notes',d:'Monte a documentação da versão a partir do CSV da sprint e grave no Google Doc, no padrão do modelo.',ok:true,
   ic:'<path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z"/><path d="M14 3.5V8h4"/><path d="M9 12.5h6M9 16h4"/>'},
  {k:'thinker',t:'Thinker',d:'Conte a demanda e receba a sprint quebrada em atividades para o Artia, com modelagem e protótipo.',ok:true,
   ic:'<path d="M9 17.5h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.2 1.1 2V17h5v-1.2c0-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z"/>'},
  {k:'keeper',t:'Keeper',d:'Armazene as principais informações compartilhadas da equipe, como scripts, links e tokens.',ok:true,
   ic:'<rect x="4" y="10.5" width="16" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><path d="M12 14.5v2.5"/>'}
];
const KCOLS=['A testar','Em teste','Reteste','Revisão','Reprovada','Aprovada','Cancelada'];
const KICO={'A testar':'<circle cx="12" cy="12" r="8.5" stroke-dasharray="3.2 3"/>','Em teste':'<path d="M8.5 5.8v12.4l9.8-6.2z"/>','Reteste':'<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.8 4.5v4.2h-4.2"/>','Revisão':'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>','Reprovada':'<circle cx="12" cy="12" r="8.5"/><path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6"/>','Aprovada':'<circle cx="12" cy="12" r="8.5"/><path d="M8 12.3l2.8 2.8 5.4-5.6"/>','Cancelada':'<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>'};
const kicon=col=>`<span class="kic s-${slug(col)}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${KICO[col]||''}</svg></span>`;
/* arrastar o card entre colunas muda a situação; Cancelada abre o pedido de motivo */
let KLAND=null;
async function moveAtiv(a,col){const from=kcolOf(a);if(from===col)return;
  if(col==='Cancelada'){openCancelAtiv(a);return}
  const st0=a.status||'A testar';const status=col==='Revisão'?(st0==='Cancelada'?(a.statusAntesCancelamento&&a.statusAntesCancelamento!=='Cancelada'?a.statusAntesCancelamento:'Em teste'):st0):col;
  let rodada=a.rodada||1;if(status==='Reteste'&&st0==='Em desenvolvimento')rodada+=1;
  const prev={status:st0,rodada:a.rodada||1,historico:a.historico||[],kcolManual:a.kcolManual||null,kcolManualSt:a.kcolManualSt||null,motivoCancelamento:a.motivoCancelamento||''};
  const up={status,rodada,kcolManual:col,kcolManualSt:status,historico:[...prev.historico,{status:col==='Revisão'?'Revisão':status,em:nowISO(),por:me?.id||null,porNome:me?.name||'',nota:'Movida no kanban de '+from+' para '+col,rodada}]};
  if(st0==='Cancelada')up.motivoCancelamento='';
  KLAND=a.id;setTimeout(()=>{if(KLAND===a.id)KLAND=null},1500);
  try{await cap.db.collection('atividades').doc(a.id).update(up);
    toastUndo(modPend(a)?`Situação: ${status}. Ela continua em Revisão até a modelagem ser marcada como validada.`:`Movida para ${col}.`,'Desfazer',async()=>{await cap.db.collection('atividades').doc(a.id).update(prev)},6000)}
  catch(e){toast('Não foi possível mover: '+(e.code||e.message))}}
function bindKanbanDnD(sc){const kb=sc.querySelector('.kanban');if(!kb||!cap.db)return;
  sc.querySelectorAll('.kcard[data-ka]').forEach(c=>{c.draggable=true;
    c.ondragstart=e=>{e.dataTransfer.setData('text/plain',c.dataset.ka);e.dataTransfer.effectAllowed='move';c.classList.add('drag');kb.classList.add('dragging')};
    c.ondragend=()=>{c.classList.remove('drag');kb.classList.remove('dragging');kb.querySelectorAll('.kcol.over').forEach(x=>x.classList.remove('over'))}});
  kb.querySelectorAll('.kcol[data-col]').forEach(col=>{
    col.ondragover=e=>{if(!kb.classList.contains('dragging'))return;e.preventDefault();e.dataTransfer.dropEffect='move';col.classList.add('over')};
    col.ondragleave=e=>{if(!col.contains(e.relatedTarget))col.classList.remove('over')};
    col.ondrop=e=>{e.preventDefault();col.classList.remove('over');kb.classList.remove('dragging');const a=S.atividades.find(x=>x.id===e.dataTransfer.getData('text/plain'));if(a)moveAtiv(a,col.dataset.col)}})}
/* coluna do kanban: Revisão junta o que depende de decisão (validar com dev, validar regra, bug de análise) */
function emRevisao(a){const ab=byAtiv('comentarios',a.id).filter(c=>c.status==='aberto');const ce=byAtiv('cenarios',a.id);
  /* modelagem anotada pelo tester: vai para Revisão até ele marcar como revisada */
  if(modPend(a))return true;
  /* bug de código manda: enquanto houver correção pendente, a atividade fica em Reprovada */
  if(ab.some(c=>['BUG-DEV','BUG-BACK'].includes(c.classificacao)))return false;
  if(ce.some(c=>c.resultado==='reprovado'))return false;
  if(ce.some(c=>c.resultado==='validar'))return true;
  return ab.some(c=>['VALIDAR','BUG-ANALISE'].includes(c.classificacao))}
function kcolOf(a){const st=a.status||'A testar';
  if(st==='Cancelada')return st;
  if(modPend(a))return 'Revisão';
  if(a.kcolManual&&a.kcolManualSt===st&&KCOLS.includes(a.kcolManual))return a.kcolManual;
  if(st==='Aprovada')return st;
  if(emRevisao(a))return 'Revisão';
  if(st==='Em desenvolvimento'||st==='Bloqueada')return 'Reprovada';
  return KCOLS.includes(st)?st:'A testar'}
function hashFor(v){const sp=encodeURIComponent(st.sprint||'');if(v==='home')return'#/';if(v==='keeper')return'#/keeper';if(v==='patch')return'#/patch';if(v==='thinker')return'#/thinker';if(v==='tkspr')return'#/thinker/'+encodeURIComponent(TK.id||'');if(v==='pnver')return'#/patch/'+encodeURIComponent(PN.ver||'');if(v==='sprints')return'#/tester';if(v==='import')return'#/tester/nova';if(v==='kanban')return'#/tester/'+sp;return'#/tester/'+sp+'/'+encodeURIComponent(st.ativ||'')}
const TABS={open:[],last:{},scroll:{}};
try{const t=JSON.parse(localStorage.getItem('bancada.tabs')||'{}');if(Array.isArray(t.open))TABS.open=t.open.filter(k=>k==='tester'||k==='keeper'||k==='patch'||k==='thinker');if(t.last)TABS.last=t.last}catch(e){}
const saveTabs=()=>{try{localStorage.setItem('bancada.tabs',JSON.stringify({open:TABS.open,last:TABS.last}))}catch(e){}};
const modOf=v=>v==='keeper'?'keeper':(v==='patch'||v==='pnver')?'patch':(v==='thinker'||v==='tkspr')?'thinker':['sprints','import','kanban','ativ'].includes(v)?'tester':null;
function tabSub(k){if(k==='thinker'){const p=(TABS.last.thinker||'').replace(/^#\/?/,'').split('/').filter(Boolean).map(decodeURIComponent);const x=p[1]&&TK.spr.find(y=>y.id===p[1]);return x?(x.tag?'['+x.tag+']':(x.nome||'').slice(0,24)):''}if(k==='patch'){const p=(TABS.last.patch||'').replace(/^#\/?/,'').split('/').filter(Boolean).map(decodeURIComponent);const v=p[1]&&PN.vers.find(x=>x.id===p[1]);return v?v.versao||'':''}if(k!=='tester')return'';const h=TABS.last.tester||'';const p=h.replace(/^#\/?/,'').split('/').filter(Boolean).map(decodeURIComponent);
  if(p[1]==='nova')return'Nova sprint';if(!p[1])return'';const sp=S.sprints.find(x=>x.id===p[1]);let t=sp?(sp.codigo||sp.nome||''):'';
  if(p[2]){const a=(S.atividades||[]).find(x=>x.id===p[2]);if(a){const n=String(a.titulo||'').match(/^\s*([\d.]+)/);t=n?n[1].replace(/\.$/,''):a.titulo}}return t}
let TABSEEN=null;
function renderTabs(){const n=$('#appTabs');if(!n)return;const cur=modOf(st.view);const seen=TABSEEN;TABSEEN=new Set(TABS.open);
  n.hidden=false;
  n.innerHTML=TABS.open.map(k=>{const m=MODS.find(x=>x.k===k);const sub=tabSub(k);
    return `<div class="atab${seen&&!seen.has(k)?' tin':''}" role="tab" tabindex="0" data-tab="${k}" aria-selected="${cur===k}" title="${esc(m.t)}${sub?' · '+esc(sub):''}"><svg class="atic" viewBox="0 0 24 24" aria-hidden="true">${m.ic}</svg><span>${esc(m.t)}</span>${sub?`<span class="asub">${esc(sub)}</span>`:''}<button class="ax" data-tabx="${k}" aria-label="Fechar ${esc(m.t)}">×</button></div>`}).join('')
    +`<button class="atab anew" id="tabNew" aria-label="Abrir outra aplicação" title="Abrir outra aplicação"${cur?'':' aria-selected="true"'}>+</button>`+(TABS.open.length?'':'<span class="athint">Os módulos que você abrir ficam aqui como abas</span>');
  n.querySelectorAll('[data-tab]').forEach(t=>{const go=()=>openTab(t.dataset.tab);t.onclick=e=>{if(e.target.closest('[data-tabx]'))return;go()};t.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}});
  n.querySelectorAll('[data-tabx]').forEach(b=>b.onclick=e=>{e.stopPropagation();closeTab(b.dataset.tabx)});
  $('#tabNew').onclick=()=>nav('home');
  /* as abas que ficam deslizam para o lugar da que saiu */
  if(TABPOS){const P=TABPOS;TABPOS=null;n.querySelectorAll('.atab[data-tab],#tabNew').forEach(t=>{const x0=P.get(t.dataset.tab||'+');if(x0==null)return;const dx=x0-t.getBoundingClientRect().left;if(Math.abs(dx)<1)return;t.animate([{transform:`translateX(${dx}px)`},{transform:'none'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'})})}}
let TABPOS=null;
function openTab(k){const h=TABS.last[k]||(k==='keeper'?'#/keeper':k==='patch'?'#/patch':k==='thinker'?'#/thinker':'#/tester');if(location.hash===h)applyRoute();else location.hash=h}
function closeTab(k){const i0=TABS.open.indexOf(k);if(i0<0)return;const el=document.querySelector(`.atab[data-tab="${k}"]`);
  if(el&&!el.classList.contains('popx')&&!matchMedia('(prefers-reduced-motion:reduce)').matches){el.classList.add('popx');el.setAttribute('aria-hidden','true');tabBurst(el);setTimeout(()=>{TABPOS=new Map([...document.querySelectorAll('.atab[data-tab],#tabNew')].map(t=>[t.dataset.tab||'+',t.getBoundingClientRect().left]));closeTab2(k)},240);return}closeTab2(k)}
/* aba fechando: estoura em partículas */
function tabBurst(el){const r=el.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;const N=14;
  for(let i=0;i<N;i++){const p=document.createElement('i');p.className='tpart';const ang=(i/N)*Math.PI*2+Math.random()*.4;const d=26+Math.random()*30;
    p.style.cssText=`left:${cx}px;top:${cy}px;--dx:${Math.cos(ang)*d*1.5}px;--dy:${Math.sin(ang)*d}px;--s:${.6+Math.random()*.8};animation-delay:${Math.random()*30}ms`;if(i%3===0)p.classList.add('tp2');document.body.appendChild(p);setTimeout(()=>p.remove(),600)}}
function closeTab2(k){const i=TABS.open.indexOf(k);if(i<0)return;const wasCur=modOf(st.view)===k;TABS.open.splice(i,1);delete TABS.last[k];delete TABS.scroll[k];saveTabs();
  if(wasCur){const nx=TABS.open[i]||TABS.open[i-1];if(nx)openTab(nx);else nav('home')}else renderTabs()}
function applyRoute(){const prevMod=modOf(st.view);if(prevMod)TABS.scroll[prevMod]=window.scrollY;const p=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean).map(decodeURIComponent);
  if(p[0]==='keeper')st.view='keeper';else if(p[0]==='thinker'){if(p[1]){TK.id=p[1];st.view='tkspr'}else st.view='thinker'}else if(p[0]==='patch'){if(p[1]){PN.ver=p[1];st.view='pnver'}else st.view='patch'}else if(p[0]!=='tester')st.view='home';else if(!p[1])st.view='sprints';else if(p[1]==='nova')st.view='import';else{st.sprint=p[1];if(p[2]){st.ativ=p[2];st.view='ativ'}else st.view='kanban'}
  if(cap.db&&st.sprint)subscribeSprint();saveUI();
  const m=modOf(st.view);if(m){if(!TABS.open.includes(m))TABS.open.push(m);TABS.last[m]=location.hash||hashFor(st.view==='ativ'?'ativ':st.view)}saveTabs();
  const y=m&&m!==prevMod?(TABS.scroll[m]||0):0;window.scrollTo(0,0);render();renderTabs();if(y)requestAnimationFrame(()=>window.scrollTo(0,y))}
window.addEventListener('hashchange',applyRoute);
function nav(v){const h=hashFor(v);if(location.hash===h)applyRoute();else location.hash=h}
function renderCrumbs(){const c=$('#crumbs');if(!c)return;const sp=S.sprints.find(x=>x.id===st.sprint);const a=S.atividades.find(x=>x.id===st.ativ);const parts=[];
  if(st.view==='keeper')parts.push([null,'Keeper']);else if(st.view==='patch')parts.push([null,'Patch Notes']);else if(st.view==='thinker')parts.push([null,'Thinker']);else if(st.view==='tkspr'){const tx=TK.spr.find(x=>x.id===TK.id);parts.push(['thinker','Thinker']);parts.push([null,tx&&tx.nome?tx.nome:'Nova sprint'])}else if(st.view==='pnver'){const pv=PN.vers.find(x=>x.id===PN.ver);parts.push(['patch','Patch Notes']);parts.push([null,'Versão '+(pv?pv.versao:'')])}else if(st.view!=='home'){parts.push(['sprints','Tester']);if(st.view==='import')parts.push([null,'Nova sprint']);if(['kanban','ativ'].includes(st.view)&&sp)parts.push(['kanban',sp.codigo||sp.nome]);if(st.view==='ativ'&&a)parts.push([null,a.titulo])}
  c.innerHTML=parts.map(([v,l],i)=>`<span class="sep" aria-hidden="true">›</span>${v&&i<parts.length-1?`<button class="crumb" data-nav="${v}">${esc(l)}</button>`:`<span class="crumb cur" aria-current="page">${esc(l)}</span>`}`).join('');
  c.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>nav(b.dataset.nav))}
let lastScreen='';
function renderScreen(){const sc=$('#screen');const key=st.view+'|'+st.sprint;
  if(st.view==='import'){if(sc.dataset.v!=='import'){sc.dataset.v='import';sc.innerHTML='<div class="scrin" id="impHost"></div>';renderImport($('#impHost'))}return}
  if(st.view==='patch'||st.view==='pnver'){renderPatch(sc);return}
  if(st.view==='thinker'||st.view==='tkspr'){renderThinker(sc);return}
  if(st.view==='keeper'){if(sc.dataset.v!=='keeper'){sc.dataset.v='keeper';sc.innerHTML=keeperHTML();bindKeeper(sc);KP.html=null;lastScreen='keeper';enterAnim(sc)}kpSubscribe();paintKeeper();return}
  sc.dataset.v=st.view;
  if(st.view==='home')sc.innerHTML=homeHTML();else if(st.view==='sprints')sc.innerHTML=sprintsHTML();else if(st.view==='kanban')sc.innerHTML=kanbanHTML();
  bindScreen(sc);if(st.view==='home'){bindHome(sc);homeWatch()}if(key!==lastScreen){lastScreen=key;enterAnim(sc)}}
/* número do app na página inicial: 1.<versão publicada>.0 — atualizar a cada publicação */
const APP_VER='1.131.0 Alpha';
/* ---------- página inicial: saudação, recentes de todos os módulos e os módulos ---------- */
const HG={madrugada:['Pensamentos noturnos','Plantão da madrugada','Madrugada produtiva','Olá, coruja'],manha:['Bom dia','Saudações matinais','Café e cenários','Bom dia, bom deploy'],tarde:['Boa tarde','Tarde de testes','Saudações vespertinas','Pós-almoço produtivo'],noite:['Boa noite','Pensamentos noturnos','Turno da noite','Saudações noturnas']};
const HJ=['Erro 400: Bad Request. Mas a sprint está ótima.',"SELECT * FROM tarefas WHERE pronto = 'S'; -- 0 linhas",'INSERT INTO cafe (xicaras) VALUES (3);','404: bug não encontrado. Ainda.','COMMIT; -- antes que alguém mude de ideia','ORA-00942: a tabela não existe. A motivação também não.','200 OK. Por enquanto.','Funciona na minha máquina.','Status: Em teste. Humor: em desenvolvimento.',"DELETE FROM bugs; -- se fosse fácil assim",'Cenário aprovado de primeira? Desconfie.','Validar com dev: o estado natural de todo requisito.','NullPointerException no café da manhã.','Timeout de 30s. A reunião, de 1 hora.','git blame hoje não aponta para você.','ROLLBACK; -- respira e tenta de novo','UPDATE sprint SET prazo = prazo + 1; -- sem WHERE','503: o dev está em reunião.','Rodada 1 de N.','Ctrl+C, Ctrl+V, Ctrl+Z. Nessa ordem.'];
const HSEED=Math.random();
function homeGreet(){const h=new Date().getHours();const k=h<5?'madrugada':h<12?'manha':h<18?'tarde':'noite';const L=HG[k];const nm=String(me?.name||'').trim().split(/\s+/)[0];
  return {g:L[Math.floor(HSEED*L.length)],nm,j:HJ[Math.floor(HSEED*997)%HJ.length]}}
function relTime(iso){if(!iso)return'';const d=(Date.now()-new Date(iso))/1000;if(isNaN(d))return'';if(d<60)return'agora';if(d<3600)return'há '+Math.floor(d/60)+' min';if(d<86400)return'há '+Math.floor(d/3600)+' h';const n=Math.floor(d/86400);return n===1?'ontem':n<30?'há '+n+' dias':fmtDT(iso).slice(0,10)}
const hashId=h=>{const p=String(h||'').replace(/^#\/?/,'').split('/').filter(Boolean).map(decodeURIComponent);return p[1]||''};
function homeRecents(){const R=[];const mi=k=>MODS.find(x=>x.k===k);
  /* Tester: a última sprint e a última atividade abertas */
  const spId=hashId(TABS.last.tester)||st.sprint;const sp=S.sprints.find(x=>x.id===spId)||S.sprints[0];
  if(sp){const as=(S.allAtiv||[]).filter(a=>a.sprintId===sp.id);const ab=as.filter(a=>!['Aprovada','Cancelada'].includes(a.status||'A testar')).length;
    const a=st.ativ&&as.find(x=>x.id===st.ativ);
    R.push({k:'tester',m:mi('tester'),t:sp.nome||sp.codigo||'Sprint',d:`${as.length} atividade${as.length===1?'':'s'}${as.length?` · ${ab} em aberto`:''}`,sub:a?'Última atividade: '+a.titulo:'',go:`sp:${sp.id}`,go2:a?`at:${sp.id}:${a.id}`:''})}
  else R.push({k:'tester',m:mi('tester'),t:'Nenhuma sprint ainda',d:'Importe a sprint do Artia para gerar os cenários.',go:'nav:sprints',vazio:true});
  /* Patch Notes */
  const pv=PN.vers.find(x=>x.id===hashId(TABS.last.patch))||PN.vers[0];
  if(pv)R.push({k:'patch',m:mi('patch'),t:'Versão '+(pv.versao||''),d:[pv.sistema||'JMJ CRM',relTime(pv.atualizadoEm||pv.criadoEm)].filter(Boolean).join(' · '),go:'pn:'+pv.id});
  else R.push({k:'patch',m:mi('patch'),t:PN.loaded?'Nenhuma versão ainda':'Carregando…',d:PN.loaded?'Monte a documentação da próxima versão.':'',go:'nav:patch',vazio:true});
  /* Thinker */
  const tk=TK.spr.find(x=>x.id===hashId(TABS.last.thinker))||TK.spr[0];
  if(tk)R.push({k:'thinker',m:mi('thinker'),t:tk.nome||(tk.tag?'['+tk.tag+']':'Sprint sem nome'),d:[tk.sistema||'',relTime(tk.atualizadoEm||tk.criadoEm)].filter(Boolean).join(' · '),go:'tk:'+tk.id});
  else R.push({k:'thinker',m:mi('thinker'),t:TK.loaded?'Nenhuma sprint ainda':'Carregando…',d:TK.loaded?'Conte a demanda e o Claude quebra em atividades.':'',go:'nav:thinker',vazio:true});
  /* Keeper: as notas mexidas por último */
  const ns=KP.loaded?kpAll().slice(0,3):[];
  R.push({k:'keeper',m:mi('keeper'),t:ns.length?(ns[0].titulo||KTYPES[ns[0].tipo]?.l||'Nota'):KP.loaded?'Nenhuma nota ainda':'Carregando…',d:ns.length?relTime(ns[0].atualizadoEm||ns[0].criadoEm):'',notas:ns.slice(0,3),go:'nav:keeper',vazio:!ns.length});
  return R}
function homeRecentHTML(){return homeRecents().map(r=>`<article class="hrec${r.vazio?' vazio':''}" data-k="${r.k}"><button class="hrmain" data-hgo="${esc(r.go)}"><span class="hric"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${r.m.ic}</svg></span><span class="hrmod">${esc(r.m.t)}</span><span class="hrt">${esc(r.t)}</span>${r.d?`<span class="hrd">${esc(r.d)}</span>`:''}</button>
  ${r.go2?`<button class="hrsub" data-hgo="${esc(r.go2)}"><span>${esc(r.sub)}</span></button>`:''}
  ${r.notas&&r.notas.length?`<div class="hrnotes">${r.notas.map(n=>`<button class="hrnote nc-${esc(kpCor(n.cor))}" data-hgo="kp:${n._p?'p':'s'}:${esc(n.id)}"><b>${esc(n.titulo||KTYPES[n.tipo]?.l||'Nota')}</b><span>${esc(n.tipo==='credencial'?'••••••':String(n.texto||'').slice(0,90))}</span></button>`).join('')}</div>`:''}</article>`).join('')}
function homeHTML(){const G=homeGreet();
  return `<div class="scrin home"><div class="hero hhero"><h1>${esc(G.g)}${G.nm?`, <span class="hnm">${esc(G.nm)}</span>`:''}</h1><p class="hjoke"><code>${esc(G.j)}</code></p></div>
  <section class="hsec" aria-labelledby="hmT"><h2 class="hsect" id="hmT">Módulos</h2><div class="mods">${MODS.map(m=>`<button class="mod" data-mod="${m.k}"><span class="modic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${m.ic}</svg></span>
  <span class="modt">${m.t}</span><span class="modd">${m.d}</span></button>`).join('')}</div></section>
  <section class="hsec" aria-labelledby="hrT"><h2 class="hsect" id="hrT">Continue de onde parou</h2><div class="hrecs" id="hRecs">${homeRecentHTML()}</div></section><div class="verapp">${APP_VER}</div></div>`}
/* os dados dos outros módulos chegam depois: atualiza só os recentes, sem refazer a tela */
let homePoll=0;function homeWatch(){clearInterval(homePoll);try{pnSubscribe();tkSubscribe();kpSubscribe()}catch(e){}let n=0,last='';
  homePoll=setInterval(()=>{if(st.view!=='home'||++n>40){clearInterval(homePoll);return}const h=homeRecentHTML();if(h!==last){last=h;const el=$('#hRecs');if(el&&el.innerHTML!==h){el.innerHTML=h;bindHome($('#screen'))}}},500)}
function homeGo(g){const [t,a,b]=g.split(':');
  if(t==='nav')return nav(a);
  if(t==='sp'){st.sprint=a;st.ativ=null;return nav('kanban')}
  if(t==='at'){st.sprint=a;st.ativ=b;setMod();return nav('ativ')}
  if(t==='pn'){location.hash='#/patch/'+encodeURIComponent(a);return}
  if(t==='tk'){location.hash='#/thinker/'+encodeURIComponent(a);return}
  if(t==='kp'){nav('keeper');setTimeout(()=>{const n=kpFind(a+':'+b);if(n)kpOpen(n)},120)}}
function bindHome(sc){sc.querySelectorAll('[data-hgo]').forEach(b=>b.onclick=()=>homeGo(b.dataset.hgo))}
function sprintsHTML(){const sps=S.sprints;
  return `<div class="scrin"><div class="scrhead"><div><h1 data-ui>Sprints</h1><p class="small muted">Escolha a sprint para ver as atividades em teste.</p></div><span class="grow"></span><button class="pri" data-nav="import">Nova sprint</button></div>
  ${sps.length?`<div class="splist">${sps.map(sp=>{const as=(S.allAtiv||[]).filter(a=>a.sprintId===sp.id);const n=as.length;const cnt=s=>as.filter(a=>(a.status||'A testar')===s).length;const ap=cnt('Aprovada'),rp=cnt('Reprovada');
    return `<button class="spcard" data-sp="${esc(sp.id)}"><span class="sptop"><span class="spcod">${esc(sp.codigo||'')}</span>${st.sprint===sp.id?'<span class="badge cur">Última aberta</span>':''}</span><span class="spname">${esc(sp.nome)}</span>
    <span class="small muted">${n} atividade${n===1?'':'s'}${n?` · ${ap} aprovada${ap===1?'':'s'} · ${rp} reprovada${rp===1?'':'s'}`:''}${sp.criadoEm?` · criada em ${fmtDT(sp.criadoEm).slice(0,10)}`:''}</span>
    ${n?`<span class="bar">${STATUS.map(s=>{const k=cnt(s);return k?`<i class="d-${slug(s)}" style="width:${k/n*100}%" title="${esc(s)}: ${k}"></i>`:''}).join('')}</span>`:''}</button>`}).join('')}</div>`
  :`<div class="card empty">Nenhuma sprint ainda. <button class="linkbtn" data-nav="import">Importar a primeira sprint do Artia</button></div>`}</div>`}
function kanbanHTML(){const sp=S.sprints.find(x=>x.id===st.sprint);if(!sp)return '<div class="scrin"><div class="sk" style="height:60px"></div><div class="sk" style="height:300px;margin-top:16px"></div></div>';
  const acts=sorted(S.atividades);const abertos=S.comentarios.filter(c=>c.status==='aberto').length;const totMin=S.cenarios.reduce((x,c)=>x+(+c.estimativaMin||0),0);
  const card=a=>{const ce=byAtiv('cenarios',a.id);const dn=ce.filter(c=>(c.resultado||'pendente')!=='pendente').length;const ab=byAtiv('comentarios',a.id).filter(c=>c.status==='aberto').length;
    return `<button class="kcard${modPend(a)?' kmod':''}${KLAND===a.id?' kland':''}" data-ka="${esc(a.id)}" data-st="${esc(a.status||'A testar')}" data-k="k:${esc(a.id)}"><span class="kt">${esc(a.titulo)}</span>
    <span class="kmeta">${(a.rodada||1)>1?`<span class="pill">Rodada ${a.rodada}</span>`:''}${a.novoEm?'<span class="pill p-novo">Novo</span>':''}${modPend(a)?'<span class="pill s-modelagem">Validar modelagem</span>':''}${ab?`<span class="pill st-aberto">${ab} apontamento${ab>1?'s':''}</span>`:''}</span>
    ${ce.length?`<span class="kprog"><span class="prog-bar"><i style="width:${Math.round(dn/ce.length*100)}%"></i></span><span class="small muted">${dn}/${ce.length} cenários</span></span>`:'<span class="small muted">Sem cenários</span>'}</button>`};
  return `<div class="scrin"><div class="scrhead"><div><div class="small muted">${esc(sp.codigo||'')}${sp.artiaUrl?` · <a href="${esc(sp.artiaUrl)}" target="_blank" rel="noopener">abrir no Artia</a>`:''}</div><h1>${esc(sp.nome)}</h1>
  <div class="kpis"><span><b>${acts.length}</b> atividades</span><span><b>${abertos}</b> apontamentos abertos</span><span><b>${fmtMin(totMin)}</b> de teste estimado</span></div></div><span class="grow"></span>
  <div class="kacts"><input type="search" id="kq" placeholder="Buscar atividade" aria-label="Buscar atividade nesta sprint" value="${esc(actQ)}"><button class="pri" id="kadd" title="Criar uma atividade nesta sprint, com comentários e arquivos">Adicionar atividade</button><button id="kupd" title="Importar de novo o CSV do Artia e trazer as atividades que entraram na sprint">Atualizar sprint</button><button id="kpn" title="Montar a documentação da versão com as atividades desta sprint">Levar ao Patch Notes</button></div></div>
  <div class="kanban">${KCOLS.map(col=>{const its=acts.filter(a=>kcolOf(a)===col);return `<section class="kcol${its.length?'':' empty'}" data-col="${esc(col)}" aria-label="${esc(col)}"><header>${kicon(col)}<b>${esc(col)}</b><span class="kcount">${its.length}</span></header><div class="kitems">${its.map(card).join('')||'<div class="kempty">Nenhuma atividade</div>'}</div></section>`}).join('')}</div></div>`}
function bindScreen(sc){
  sc.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>nav(b.dataset.nav));
  sc.querySelectorAll('[data-mod]').forEach(b=>b.onclick=()=>{const m=MODS.find(x=>x.k===b.dataset.mod);if(m){nav(m.k==='keeper'?'keeper':m.k==='patch'?'patch':m.k==='thinker'?'thinker':'sprints');return}toast('Ele está sendo construído e será liberado em breve.',4200,{kind:'soon',title:m.t+' ainda não está pronto'});b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake')});
  sc.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>{st.sprint=b.dataset.sp;st.ativ=null;subSprint=subSprint===st.sprint?subSprint:null;nav('kanban')});
  sc.querySelectorAll('[data-ka]').forEach(b=>b.onclick=()=>{st.ativ=b.dataset.ka;const a=S.atividades.find(x=>x.id===st.ativ);st.mod=a&&(a.status||'A testar')==='A testar'?'reg':(st.mod||'ler');setMod();nav('ativ')});
  const ku=$('#kupd');if(ku)ku.onclick=()=>openUpdSprint();const kp=$('#kpn');if(kp)kp.onclick=()=>toPatchNotes(st.sprint);const kd=$('#kadd');if(kd)kd.onclick=()=>openAddAtiv();bindKanbanDnD(sc);
  const kq=$('#kq');if(kq){const f=()=>{const q=norm(kq.value).trim();actQ=kq.value;sc.querySelectorAll('.kcard').forEach(c=>c.hidden=!!q&&!norm(c.textContent).includes(q))};kq.oninput=f;f()}}
$('#homeBtn').onclick=()=>nav('home');


/* Tester → Patch Notes: abre a versão já ligada à sprint ou cria uma nova com as atividades dela */
function toPatchNotes(spId){if(!spId)return;pnSubscribe();const go=n=>{const v=PN.vers.find(x=>x.sprintId===spId);
  if(v){PN.ver=v.id;nav('pnver');return}if(!PN.loaded&&n<20){setTimeout(()=>go(n+1),150);return}nav('patch');setTimeout(()=>openPnNew(spId),200)};go(0)}
