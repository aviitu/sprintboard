/* ---------- perfil e modo privacidade ---------- */
const EYEOFF='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.3-2.3 3.5M6.6 6.6C4.6 8 3.1 10 2.5 12c1 2.5 4.5 7 9.5 7 1.9 0 3.6-.6 5-1.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
let priv=false;try{priv=localStorage.getItem('sb-priv')==='1'}catch(e){}
function mkAvatar(){const ph=()=>Object.assign(document.createElement('span'),{className:'avatar ph',innerHTML:FACE});
  if(me&&me.avatarUrl){const av=document.createElement('img');av.className='avatar';av.alt='';av.src=me.avatarUrl;av.onerror=()=>av.replaceWith(ph());return av}return ph()}
const PV_ROOTS='#screen,#side,#pane,#modal,#ask,#crumbs';
const PV_KEEP='button:not(.act):not(.kcard):not(.spcard):not(.crumb),.ib,h3,th,label,.lbl,.pill,.badge,.tabs,.hero,.mod,.kcol>header,.kempty,.who2,.kpis,.genbox,.sep,.crumb[data-nav=sprints],summary,[data-ui],.prog,.finend>.small';
function privMark(){document.querySelectorAll('.pv').forEach(e=>e.classList.remove('pv'));if(!priv)return;
  document.querySelectorAll(PV_ROOTS).forEach(r=>{const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeValue.trim()?1:2});let n;
    while(n=w.nextNode()){const el=n.parentElement;if(el&&!el.closest(PV_KEEP)&&!el.closest('script,style'))el.classList.add('pv')}})}
let pvRaf=0;const pvObs=new MutationObserver(()=>{if(!priv||pvRaf)return;pvRaf=requestAnimationFrame(()=>{pvRaf=0;pvObs.disconnect();privMark();pvWatch()})});
function pvWatch(){if(priv)document.querySelectorAll(PV_ROOTS).forEach(r=>pvObs.observe(r,{childList:true,subtree:true,characterData:true}))}
function setPriv(on,quiet){priv=!!on;try{localStorage.setItem('sb-priv',priv?'1':'0')}catch(e){}
  document.body.classList.toggle('priv',priv);pvObs.disconnect();privMark();pvWatch();
  const w=$('#whoami');let d=w.querySelector('.pvdot');if(priv&&!d){d=Object.assign(document.createElement('span'),{className:'pvdot',innerHTML:EYEOFF});w.prepend(d)}else if(!priv&&d)d.remove();
  const sw=$('#pvSw');if(sw)sw.setAttribute('aria-checked',priv);
  if(!quiet)toast(priv?'Modo privacidade ativado. Os dados do projeto estão desfocados.':'Modo privacidade desativado.')}
function openProf(){const p=$('#prof'),w=$('#whoami');
  p.innerHTML=`<div class="pid"></div><hr><div class="pvrow" id="pvRow"><span class="pic">${EYEOFF}</span><span class="pt" id="pvLbl">Modo privacidade</span><button class="sw" id="pvSw" role="switch" aria-checked="${priv}" aria-labelledby="pvLbl" aria-describedby="pvDesc"></button><span class="pd" id="pvDesc">Desfoca as informações do projeto para você tirar prints e compartilhar.</span></div>${temaRowHTML()}<button class="profrow" id="pfFila"><span class="pic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg></span><span class="pt">Fila da noite</span><span class="small muted">${FILA.itens.length?FILA.itens.length+' na fila':'vazia'}</span></button>`;
  const id=p.querySelector('.pid');const pn=Object.assign(document.createElement('b'),{className:'pname',textContent:me?.name||'Você'});let taps=0,tapT=0;
  pn.onclick=()=>{clearTimeout(tapT);taps++;tapT=setTimeout(()=>taps=0,1500);if(taps>=5&&!id.querySelector('.pfav')){taps=0;showFav(pn)}};
  id.append(mkAvatar(),pn,Object.assign(document.createElement('span'),{className:'small muted',textContent:cap.db?'Conectado à base da equipe':'Base indisponível nesta visualização'}));
  p.hidden=false;w.setAttribute('aria-expanded','true');
  bindTemaRow(p);$('#pfFila').onclick=()=>{closeProf();openFila()};$('#pvRow').onclick=e=>{if(e.target.id!=='pvSw')setPriv(!priv)};$('#pvSw').onclick=()=>setPriv(!priv);$('#pvSw').focus()}
let favCache=null,favRef=null;
async function favDoc(){if(favRef)return favRef;if(!cap.db||!cap.user)return null;try{const uid=await cap.user.id();if(!uid)return null;favRef=cap.db.collection('data/users/'+uid).doc('perfil');return favRef}catch(e){return null}}
async function showFav(after){const box=document.createElement('div');box.className='pfav';box.innerHTML='<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="ftx" contenteditable="plaintext-only" spellcheck="false" role="textbox" aria-label="Sua música favorita" data-ph="Sua música favorita…"></span>';
  after.after(box);const tx=box.querySelector('.ftx');if(favCache!==null)tx.textContent=favCache;
  const ref=await favDoc();if(ref&&favCache===null){try{const d=await ref.get();favCache=d.exists?String(d.data().musica||''):'';if(document.activeElement!==tx)tx.textContent=favCache}catch(e){}}
  let saved=tx.textContent;const save=async()=>{const v=tx.textContent.replace(/\s+/g,' ').trim().slice(0,200);tx.textContent=v;if(v===saved)return;saved=v;favCache=v;const r=await favDoc();if(!r){toast('Não foi possível guardar a música aqui.');return}try{await r.set({musica:v,atualizadoEm:new Date().toISOString()})}catch(e){toast('Não foi possível guardar a música: '+(e.code||e.message))}};
  tx.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();tx.blur()}else if(e.key==='Escape'){e.stopPropagation();tx.textContent=saved;tx.blur()}};tx.onblur=save}
function closeProf(f){const p=$('#prof');if(p.hidden)return;p.hidden=true;$('#whoami').setAttribute('aria-expanded','false');if(f)$('#whoami').focus()}
$('#whoami').onclick=e=>{e.stopPropagation();$('#prof').hidden?openProf():closeProf()};
document.addEventListener('click',e=>{if(!$('#prof').hidden&&!e.target.closest('#prof,#whoami'))closeProf()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#prof').hidden&&!(e.target.closest&&e.target.closest('.ftx'))){e.preventDefault();e.stopImmediatePropagation();closeProf(true)}},true);


/* ---------- lateral ---------- */
let actQ='',sidePending=false;const norm=t=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function applyActFilter(){const q=norm(actQ).trim();let n=0,tot=0;$('#side').querySelectorAll('.act[data-a]').forEach(b=>{if(b.dataset.a==='__import')return;tot++;const ok=!q||norm(b.textContent).includes(q);b.hidden=!ok;if(ok)n++});const em=$('#actEmpty');if(em)em.hidden=!(q&&!n)}
function renderSide(){
  if(document.activeElement&&document.activeElement.id==='actQ'){sidePending=true;return}sidePending=false;$('#side').removeAttribute('aria-busy');
  const sp=S.sprints.find(s=>s.id===st.sprint);
  if(!sp){$('#side').innerHTML='<div class="empty">Nenhuma sprint ainda. Use “Importar nova sprint” no seletor acima.</div>';return}
  const todas=sorted(S.atividades);const acts=todas.filter(a=>a.status!=='Cancelada');const ncan=todas.length-acts.length;
  const totMin=S.cenarios.filter(c=>acts.some(a=>a.id===c.atividadeId)).reduce((a,c)=>a+(+c.estimativaMin||0),0);
  const cnt=s=>acts.filter(a=>(a.status||'A testar')===s).length;
  const abertos=S.comentarios.filter(c=>c.status==='aberto').length;
  let h=`<div class="sprinthead"><h2>${esc(sp.nome)}</h2><div class="small muted">${esc(sp.codigo||'')}${sp.artiaUrl?` · <a href="${esc(sp.artiaUrl)}" target="_blank" rel="noopener">abrir no Artia</a>`:''}</div>
  <div class="kpis"><span><b>${acts.length}</b> atividades</span><span><b>${abertos}</b> apontamentos abertos</span><span><b>${fmtMin(totMin)}</b> de teste estimado</span></div>
  <div class="bar" title="Situação das atividades">${STATUS.map(s=>{const n=cnt(s);return n?`<i class="d-${slug(s)}" style="width:${n/acts.length*100}%" title="${esc(s)}: ${n}"></i>`:''}).join('')}</div></div>`;
  h+=`<div class="actsearch"><input type="search" id="actQ" placeholder="Buscar atividade nesta sprint" aria-label="Buscar atividade nesta sprint" value="${esc(actQ)}"></div><div id="actEmpty" class="small muted" hidden style="padding:8px">Nenhuma atividade encontrada.</div>`;
  h+=acts.map(a=>{const s=a.status||'A testar';const ab=byAtiv('comentarios',a.id).filter(c=>c.status==='aberto').length;const ce=byAtiv('cenarios',a.id);const mins=ce.reduce((x,c)=>x+(+c.estimativaMin||0),0);
    return `<button class="act" data-a="${esc(a.id)}"${st.ativ===a.id?' aria-current="true"':''}><span class="dot d-${slug(s)}"></span><span class="t">${esc(a.titulo)}</span><span class="m">${a.novoEm?'<span class="novo">Novo</span>':''}<span>${esc(s)}</span>${a.rodada>1?`<span>rodada ${a.rodada}</span>`:''}${ce.length?`<span>${ce.length} cenários · ${fmtMin(mins)}</span>`:''}${ab?`<span style="color:var(--bad)">${ab} aberto${ab>1?'s':''}</span>`:''}${modPend(a)?'<span style="color:var(--warn)">validar modelagem</span>':''}</span></button>`}).join('');
  if(ncan)h+=`<div class="small muted" style="padding:10px 8px 4px">${ncan} atividade${ncan>1?'s':''} cancelada${ncan>1?'s':''} fora da lista. <button class="linkbtn" id="sideCanc">Ver no kanban</button></div>`;
  $('#side').innerHTML=h;{const sc=$('#sideCanc');if(sc)sc.onclick=()=>nav('kanban')}applyActFilter();{const q=$('#actQ');q.oninput=()=>{actQ=q.value;applyActFilter()};q.onblur=()=>setTimeout(()=>{if(sidePending)renderSide()},120);q.onkeydown=e=>{if(e.key==='Escape'){q.value='';actQ='';applyActFilter()}else if(e.key==='Enter'){const f=[...$('#side').querySelectorAll('.act[data-a]:not([hidden])')].find(b=>b.dataset.a!=='__import');if(f)f.click()}}}
  $('#side').querySelectorAll('.act').forEach(b=>b.onclick=()=>{st.ativ=b.dataset.a;try{history.replaceState(null,'',hashFor('ativ'))}catch(e){}if(innerWidth<=860){$('#side').classList.add('collapsed');$('#sideTg').setAttribute('aria-expanded','false')}const ac=S.atividades.find(x=>x.id===st.ativ);if(ac&&(ac.status||'A testar')==='A testar'&&st.mod!=='reg'){st.mod='reg';setMod()}saveUI();render();if(innerWidth<860)$('#pane').scrollIntoView({behavior:'smooth'})});
}

/* ---------- textos do Artia ---------- */
function commentText(c,num){
  const cl=CL(c.classificacao);let t=`${cl.art}\n${num?num+'. ':''}${c.titulo||''}\n\n${(c.texto||'').trim()}`;
  if(c.request)t+=String(c.retornoRequest||'').trim()?`\n\nTestado via API com o request:\n${fmtEmbedded(c.request.trim())}\n\ne obtido o retorno:\n${fmtEmbedded(c.retornoRequest.trim())}`:`\n\nExemplo de request:\n${fmtEmbedded(c.request.trim())}`;
  if(c.sql)t+=String(c.retornoSql||'').trim()?`\n\nTestado com a consulta:\n${fmtSQL(c.sql.trim())}\n\ne obtido o retorno:\n${c.retornoSql.trim()}`:`\n\nConsulta para validar no banco:\n${fmtSQL(c.sql.trim())}`;
  if(c.obtido||c.esperado)t+=`\n\n${c.obtido?'- Resultado obtido: '+c.obtido.trim()+'\n':''}${c.esperado?'- Esperado: '+c.esperado.trim():''}`.replace(/\n$/,'');
  return t.trim();
}
function numberFor(c){const same=sorted(S.comentarios.filter(x=>x.atividadeId===c.atividadeId&&x.rodada===c.rodada&&x.classificacao===c.classificacao));return same.findIndex(x=>x.id===c.id)+1}
function roundText(aid,rod){const cs=S.comentarios.filter(c=>c.atividadeId===aid&&c.rodada===rod);let out=[];
  for(const cl of CLASSES){const g=sorted(cs.filter(c=>c.classificacao===cl.k));if(!g.length)continue;out.push(cl.art+'\n\n'+g.map((c,i)=>commentText(c,i+1).split('\n').slice(1).join('\n')).join('\n\n'))}
  return out.join('\n\n')}
async function copy(text,btn){try{const html=esc(text).split('\n').map(l=>l.replace(/^ +/,m=>'&nbsp;'.repeat(m.length))).join('<br>');let ok=false;try{if(window.ClipboardItem&&navigator.clipboard.write){await navigator.clipboard.write([new ClipboardItem({'text/plain':new Blob([text],{type:'text/plain'}),'text/html':new Blob([html],{type:'text/html'})})]);ok=true}}catch(err){}if(!ok)await navigator.clipboard.writeText(text);toast('Copiado. Cole no comentário da atividade no Artia.')}catch(e){const m=$('#modal');m.innerHTML=`<div class="box"><b>Copie o texto abaixo</b><textarea id="cpy" rows="16" readonly>${esc(text)}</textarea><div class="row"><button class="pri" id="mclose">Fechar</button></div></div>`;m.hidden=false;const ta=$('#cpy');ta.focus();ta.select();$('#mclose').onclick=()=>m.hidden=true}}
const ICONS={
  edit:'<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M14.5 7.5l3 3"/>',
  undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',
  copy:'<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.2"/><path d="M15.5 8.5V6.2A2.2 2.2 0 0 0 13.3 4H6.2A2.2 2.2 0 0 0 4 6.2v7.1a2.2 2.2 0 0 0 2.2 2.2h2.3"/>',
  copyall:'<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.2"/><path d="M15.5 8.5V6.2A2.2 2.2 0 0 0 13.3 4H6.2A2.2 2.2 0 0 0 4 6.2v7.1a2.2 2.2 0 0 0 2.2 2.2h2.3"/><path d="M11.5 12.5h5M11.5 16h5"/>',
  download:'<path d="M12 4v10.5"/><path d="M7.5 10.5l4.5 4.5 4.5-4.5"/><path d="M5 19.5h14"/>',
  eye:'<path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
  block:'<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>'};
const ICO=n=>`<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
const ib=(n,tip,attrs='',cls='')=>`<button type="button" class="ib ${cls}" data-tip="${esc(tip)}" aria-label="${esc(tip)}" ${attrs}>${ICO(n)}</button>`;
const ICON_COPY='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>';

/* ---------- evidências ---------- */
const isImg=e=>/^image\//.test(e.tipo||'');
const evUrl=e=>e.url||('/_blob/'+e.assetId);
function evChip(e){return `<button class="ev" data-ev="${esc(e.id)}" title="${esc(e.descricao||e.nome)}"><span class="k">${esc((e.nome.split('.').pop()||'arq').slice(0,4))}</span><span>${esc(e.nome)}</span></button>`}
function bindEv(root){root.querySelectorAll('[data-ev]').forEach(b=>b.onclick=()=>openEv(b.dataset.ev))}
function openEv(id){const e=S.evidencias.find(x=>x.id===id);if(!e)return;const m=$('#modal');
  const usos=S.comentarios.filter(c=>(c.evidencias||[]).includes(id));const cens=S.cenarios.filter(c=>(c.evidencias||[]).includes(id));
  m.innerHTML=`<div class="box"><div class="row"><b class="grow" style="overflow-wrap:anywhere">${esc(e.nome)}</b>${ib('download','Baixar','id="evdl"')}${ib('close','Fechar','id="mclose"')}</div>
  ${e.descricao?`<div class="small muted">${esc(e.descricao)}</div>`:''}
  ${isImg(e)?`<img src="${esc(evUrl(e))}" alt="${esc(e.nome)}">`:/pdf/.test(e.tipo||'')?`<iframe src="${esc(evUrl(e))}" title="${esc(e.nome)}" style="width:100%;height:70vh;border:1px solid var(--line);border-radius:6px;background:#fff"></iframe>`:`<div class="small muted">${esc(e.tipoOriginal||e.tipo||'')} · ${fmtSize(e.tamanho)} · enviado por ${esc(nameOf(e.criadoPor,e.criadoPorNome))} em ${fmtDT(e.criadoEm)}</div>`}
  <div><div class="lbl">Usada em</div>${usos.length||cens.length?`<ul class="small">${usos.map(c=>`<li><span class="pill ${CL(c.classificacao).css}">${CL(c.classificacao).l}</span> ${esc(c.titulo)} (rodada ${c.rodada})</li>`).join('')}${cens.map(c=>`<li>Cenário ${esc(c.codigo)} — ${esc(c.titulo)}</li>`).join('')}</ul>`:'<div class="small muted">Ainda não vinculada a comentário ou cenário.</div>'}</div></div>`;
  m.hidden=false;$('#mclose').onclick=()=>m.hidden=true;$('#evdl').onclick=()=>download(e)}
document.addEventListener('keydown',ev=>{if(ev.key!=='Escape')return;const m=$('#modal');if(!m.hidden&&$('#ask').hidden&&!$('#modal .genbox')){ev.preventDefault();m.hidden=true}});
$('#modal').addEventListener('click',ev=>{if(ev.target.id==='modal'&&!$('#modal .genbox'))$('#modal').hidden=true});
async function download(e){const name=e.nomeDownload||e.nome;
  if(cap.downloads){try{const r=await fetch(evUrl(e));const b=await r.blob();try{await cap.downloads.save({filename:name,data:b})}catch(err){if(err&&err.code==='rejected_extension'){await cap.downloads.save({filename:name+'.txt',data:b})}else if(err&&err.code==='declined'){return}else throw err}toast('Arquivo enviado para download.');return}catch(err){}}
  window.open(evUrl(e),'_blank','noopener');}
const UPS=new Map();let upTimer=0;
const UPIC={run:'<path d="M12 16V5M7.5 9.5 12 5l4.5 4.5"/><path d="M5 19.5h14"/>',ok:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',err:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.4v.1"/>'};
function paintUps(){document.querySelectorAll('[data-upk]').forEach(h=>{const its=UPS.get(h.dataset.upk)||[];
  const html=its.map(u=>`<div class="upi ${u.st}${u.gone?' gone':''}" data-up="${u.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${UPIC[u.st]}</svg><span class="upn">${esc(u.nome)}</span><span class="upp">${u.st==='err'?'Falhou':u.st==='ok'?'Anexado':u.pct>=90?'Salvando…':Math.round(u.pct)+'%'}</span><div class="upb" role="progressbar" aria-label="Enviando ${esc(u.nome)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(u.pct)}"><i style="width:${u.pct}%"></i></div></div>`).join('');
  const keys=its.map(u=>u.id+u.st+(u.gone?1:0)).join();
  if(h.dataset.upsig===keys){its.forEach(u=>{const el=h.querySelector(`[data-up="${u.id}"]`);if(!el)return;el.querySelector('.upb i').style.width=u.pct+'%';el.querySelector('.upb').setAttribute('aria-valuenow',Math.round(u.pct));el.querySelector('.upp').textContent=u.st==='err'?'Falhou':u.st==='ok'?'Anexado':u.pct>=90?'Salvando…':Math.round(u.pct)+'%'});return}
  h.dataset.upsig=keys;h.innerHTML=html})}
function upTick(){let live=false;const now=performance.now();for(const its of UPS.values())for(const u of its)if(u.st==='run'){live=true;u.pct=Math.min(90,92*(1-Math.exp(-(now-u.t0)/u.T)))}
  paintUps();if(live)upTimer=setTimeout(upTick,120);else upTimer=0}
function upStart(key,nome,size){const u={id:Math.random().toString(36).slice(2,9),nome,pct:2,st:'run',t0:performance.now(),T:Math.max(500,size/1.4e6*1000*0.6)};if(!UPS.has(key))UPS.set(key,[]);UPS.get(key).push(u);if(!upTimer)upTick();else paintUps();return u}
function upEnd(key,u,ok){u.st=ok?'ok':'err';u.pct=100;paintUps();setTimeout(()=>{u.gone=true;paintUps();setTimeout(()=>{const l=UPS.get(key)||[];const i=l.indexOf(u);if(i>=0)l.splice(i,1);if(!l.length)UPS.delete(key);paintUps()},320)},ok?1100:2600)}
/* arquivos de texto (html, log, xrebel, csv…) vão sempre em UTF-8: detecta BOM, UTF-16 sem BOM e Windows-1252 */
async function toUtf8Text(f){const b=new Uint8Array(await f.arrayBuffer());
  if(b[0]===0xEF&&b[1]===0xBB&&b[2]===0xBF)return new TextDecoder('utf-8').decode(b.subarray(3));
  if(b[0]===0xFF&&b[1]===0xFE)return new TextDecoder('utf-16le').decode(b.subarray(2));
  if(b[0]===0xFE&&b[1]===0xFF)return new TextDecoder('utf-16be').decode(b.subarray(2));
  const n=Math.min(b.length,4000);let z0=0,z1=0;for(let i=0;i<n;i++)if(!b[i]){if(i%2)z1++;else z0++}
  if(n>8&&z1>n*.3&&z0<n*.05)return new TextDecoder('utf-16le').decode(b);
  if(n>8&&z0>n*.3&&z1<n*.05)return new TextDecoder('utf-16be').decode(b);
  try{return new TextDecoder('utf-8',{fatal:true}).decode(b)}catch(e){return new TextDecoder('windows-1252').decode(b)}}
async function uploadFiles(files,aid,desc,extra={}){
  if(!cap.assets){toast('Seu acesso não permite anexar arquivos nesta página.');return[]}
  const out=[];
  for(const f of files){
    let blob=f,tipo=f.type||'application/octet-stream',nome=f.name||('print-'+new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')+'.png');
    if(/\.pdf$/i.test(nome)&&tipo!=='application/pdf'){tipo='application/pdf';blob=new Blob([f],{type:'application/pdf'})}
    if(f.size>20*1048576){toast(nome+' tem '+fmtSize(f.size)+'. O limite por arquivo é 20 MB.',6000);continue}
    const okType=/^(image\/(png|jpeg|gif|webp)|video\/(mp4|webm)|application\/pdf|application\/json|text\/(plain|csv|markdown))$/.test(tipo);
    const media=/^(image\/(png|jpeg|gif|webp)|video\/(mp4|webm)|application\/pdf)$/.test(tipo);
    if(!media){try{blob=new Blob([(await toUtf8Text(f)).replace(/\u0000/g,'')],{type:okType?tipo+';charset=utf-8':'text/plain;charset=utf-8'})}catch(err){toast('Não foi possível ler '+nome+' como texto.');continue}}
    const up=extra.upk?upStart(extra.upk,nome,blob.size):null;const bz=up?{done(){}}:busy('Enviando '+nome+'…');let okUp=false;try{const r=await cap.assets.upload(blob,{type:media?undefined:(okType?tipo:'text/plain')});
      const ref=await cap.db.collection('evidencias').add({...(extra.categoria?{categoria:extra.categoria}:{}),sprintId:extra.sprintId||st.sprint,atividadeId:aid,nome,nomeDownload:nome,assetId:r.id,url:r.url,tipo:r.contentType,tipoOriginal:tipo,tamanho:r.sizeBytes,descricao:desc||'',criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||''});
      out.push(ref.id);okUp=true}catch(err){toast('Não foi possível anexar '+nome+': '+(err.message||err.code))}finally{bz.done();if(up)upEnd(extra.upk,up,okUp)}
  }
  if(out.length&&!extra.quiet)toast(out.length+(extra.categoria?' print(s) anexado(s).':' evidência(s) anexada(s).'));return out}

/* ---------- painel ---------- */
function renderPane(){
  const pane=$('#pane');
  if(!st.sprint&&st.ativ!=='__import'){pane.innerHTML=st.mod==='reg'?'':'<div class="card empty">Importe a primeira sprint na aba Testes.</div>';if(st.mod==='reg'){st.ativ='__import';renderImport(pane)}return}
  if(st.ativ==='__import'&&st.mod==='reg'){renderImport(pane);return}
  const a=S.atividades.find(x=>x.id===st.ativ);
  if(!a){pane.innerHTML='<div class="card empty">Escolha uma atividade na lista.</div>';return}
  if(st.mod==='ler')renderLer(pane,a);else renderReg(pane,a);
}
function ambOk(){const x=ambOf();return !!(String(x.unimed||'').trim()&&String(x.beneficiarios||'').trim())}
let CTXOPEN=false;
function headCard(a,reg){const s=a.status||'A testar';const ce=byAtiv('cenarios',a.id);const mins=ce.reduce((x,c)=>x+(+c.estimativaMin||0),0);const ok=ce.filter(c=>c.resultado==='aprovado').length,bad=ce.filter(c=>c.resultado==='reprovado').length,dn=ce.filter(c=>(c.resultado||'pendente')!=='pendente').length;
  const warnCtx=modPend(a)||(reg&&!ambOk());
  return `<header class="ahead" data-k="head:${esc(a.id)}"><div class="ahtop"><h1>${esc(a.titulo)}</h1><div class="ahact">
    <button class="ctxbtn" data-ctxopen aria-haspopup="dialog">${warnCtx?'<span class="ctxdot" aria-hidden="true"></span>':''}Contexto${warnCtx?'<span class="sr"> (tem algo para revisar)</span>':''}</button>
    ${reg&&ce.some(c=>(c.resultado||'pendente')!=='pendente')?`<button id="btnReteste" title="Nova rodada depois da correção do dev">Iniciar reteste</button>`:''}
    ${s==='Cancelada'?`<button id="btnReativar">Reativar atividade</button>`:''}</div></div>
  <div class="ahmeta"><span class="pill s-${slug(s)}">${esc(s)}</span>${a.novoEm?'<span class="pill p-novo">Novo</span>':''}<span>Rodada ${a.rodada||1}</span>
    ${ce.length?`<span class="ahprog" title="${dn} de ${ce.length} cenários com resultado"><span class="prog-bar"><i style="width:${Math.round(dn/ce.length*100)}%"></i></span>${dn} de ${ce.length} testados</span><span>${ok} aprovado${ok===1?'':'s'}${bad?`, ${bad} reprovado${bad===1?'':'s'}`:''}</span><span>${fmtMin(mins)} estimados</span>`:''}
    ${modPend(a)?`<span class="pill s-modelagem" title="${esc(a.validarModelagem.trecho||'')}">Validar modelagem</span>${reg?`<button data-modok class="ghost">Marcar como validada</button>`:''}`:''}</div>
  ${s==='Cancelada'&&a.motivoCancelamento?`<p class="ahobs"><b>Motivo do cancelamento:</b> ${esc(a.motivoCancelamento)}</p>`:''}
  ${a.observacao?`<p class="ahobs">${esc(a.observacao)}</p>`:''}</header>`}
/* gaveta com tudo que é contexto da atividade; a tela principal fica só com o que se faz agora */
function ctxDrawer(a,reg){const s=a.status||'A testar';
  const desc=`<section class="card"><h3>Descrição no Artia</h3>${a.descricao?`<div class="desctext">${esc(a.descricao)}</div>`:'<div class="small muted">Sem descrição no CSV.</div>'}${printsStrip(a,reg)}</section>`;
  const body=desc+notasCard(a,reg)+orientCard(a,reg)+modelCard(a,reg)+(reg?ambCard()+knowCard()+docCard()+flowCard(a):'');
  return `<div class="ctxbg" data-ctxclose${CTXOPEN?'':' hidden'}></div><aside class="ctxdr${CTXOPEN?' on':''}" role="dialog" aria-modal="false" aria-labelledby="ctxT"${CTXOPEN?'':' inert'}>
  <div class="ctxhd"><b id="ctxT">Contexto da atividade</b><span class="grow"></span>${ib('close','Fechar','data-ctxclose')}</div>
  <div class="ctxbody">${body}${s!=='Cancelada'?`<div class="ctxfoot"><button class="danger" id="btnCancelAtiv" title="Tirar a atividade da sprint sem testar">Cancelar atividade</button></div>`:''}</div></aside>`}
function setCtx(on){CTXOPEN=on;const d=document.querySelector('.ctxdr'),bg=document.querySelector('.ctxbg');if(!d)return;d.classList.toggle('on',on);if(on){d.removeAttribute('inert');bg.hidden=false;setTimeout(()=>{const x=d.querySelector('[data-ctxclose]');if(x)x.focus()},40)}else{d.setAttribute('inert','');bg.hidden=true;const b=document.querySelector('[data-ctxopen]');if(b)b.focus()}}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&CTXOPEN&&$('#modal').hidden&&$('#ask').hidden){e.preventDefault();setCtx(false)}});
function timelineCard(a){const hs=a.historico||[];if(!hs.length)return'';return `<details class="card knbox" data-open="tl"${OPEN.tl?' open':''}><summary><h3 style="display:inline;margin:0">Ida e volta do desenvolvimento</h3> <span class="small muted">· ${hs.length} mudança${hs.length>1?'s':''}</span></summary><div style="margin-top:12px"><div class="timeline">${hs.map((h,i)=>`<div class="step${i===hs.length-1?' cur':''}"><b>${esc(h.status)}</b><span class="muted">${fmtDT(h.em)}${h.rodada?` · rodada ${h.rodada}`:''}</span><span class="muted">${esc(nameOf(h.por,h.porNome))}</span>${h.nota?`<span>${esc(h.nota)}</span>`:''}</div>`).join('')}</div></div></details>`}

function balloon(c,editable){const cl=CL(c.classificacao);const n=numberFor(c);const evs=(c.evidencias||[]).map(id=>S.evidencias.find(e=>e.id===id)).filter(Boolean);const cens=(c.cenarios||[]).map(id=>S.cenarios.find(x=>x.id===id)).filter(Boolean);const st0=c.status||'aberto';
  return `<details class="comx cs-${st0}" data-k="com:${esc(c.id)}" data-open="com:${esc(c.id)}"${OPEN['com:'+c.id]?' open':''}><summary><span class="pill ${cl.css}">${cl.l} ${n}</span><span class="comt">${esc(c.titulo)}</span><span class="grow"></span><span class="pill st-${st0}">${CST[st0]}</span>${ib('copy','Copiar para o Artia',`data-copy="${esc(c.id)}"`)}</summary>
  <div class="combody">
  ${c.texto?`<div class="ctext">${inlineCode(c.texto)}</div>`:''}
  ${c.esperado?`<div class="cexpect"><span class="csec">Esperado</span><div>${inlineCode(c.esperado)}</div></div>`:''}
  ${c.obtido?`<div class="obt"><span class="csec">Resultado obtido</span><div>${inlineCode(c.obtido)}</div></div>`:''}
  ${c.request?`<div><span class="csec">${String(c.retornoRequest||'').trim()?'Testado via API com o request':'Request'}</span>${richText(fmtEmbedded(c.request))}${String(c.retornoRequest||'').trim()?`<span class="csec">e obtido o retorno</span>${codeBox(c.retornoRequest,/^\s*[\[{]/.test(c.retornoRequest)?'json':'texto')}`:''}</div>`:''}
  ${c.sql?`<div><span class="csec">${String(c.retornoSql||'').trim()?'Testado com a consulta':'Consulta para validar no banco'}</span>${codeBox(c.sql,'sql')}${String(c.retornoSql||'').trim()?`<span class="csec">e obtido o retorno</span>${codeBox(c.retornoSql,'texto')}`:''}</div>`:''}
  ${evs.length?`<div><span class="csec">Evidências</span><div class="row">${evs.map(evChip).join('')}</div></div>`:''}
  <div class="comfoot"><span class="small muted">${esc(nameOf(c.criadoPor,c.criadoPorNome))} · ${fmtDT(c.criadoEm)}${cens.length?` · cenários ${cens.map(x=>esc(x.codigo)).join(', ')}`:''}</span><span class="grow"></span>${editable?`<select data-cst="${esc(c.id)}" aria-label="Situação do apontamento">${Object.entries(CST).map(([k,v])=>`<option value="${k}"${st0===k?' selected':''}>${v}</option>`).join('')}</select>${ib('edit','Editar comentário',`data-cedit="${esc(c.id)}"`)}${cap.sample?ib('undo','Retificar com o Claude',`data-retif="${esc(c.id)}"`):''}`:''}</div></div></details>`}

function renderLer(pane,a){
  const cs=S.comentarios.filter(c=>c.atividadeId===a.id);const rods=[...new Set(cs.map(c=>c.rodada||1))].sort((x,y)=>y-x);
  const ce=byAtiv('cenarios',a.id);const evs=testEvs(a.id);
  let h=headCard(a);
  const rodAtual=a.rodada||1;const rodsAll=[...new Set([rodAtual,...rods])].sort((x,y)=>y-x);
  const semComRod=(r)=>byAtiv('cenarios',a.id).filter(c=>['reprovado','validar'].includes(c.resultado)&&(c.rodada||1)===r&&!cs.some(m=>(m.rodada||1)===r&&(m.cenarios||[]).includes(c.id)));
  h+=`<section class="card coms"><h2 class="sech">Comentários para o Artia</h2><div id="comForm"></div>${rodsAll.length?rodsAll.map(r=>{const lista=sorted(cs.filter(c=>(c.rodada||1)===r)).sort((x,y)=>CLASSES.findIndex(k=>k.k===x.classificacao)-CLASSES.findIndex(k=>k.k===y.classificacao));const sem=semComRod(r);return `<div class="rodx"><div class="rodh"><b>Rodada ${r}</b>${r===rodAtual?'<span class="small muted">atual</span>':''}<span class="grow"></span>${lista.length?`<button class="ghost cpall" data-copyround="${r}">${ICO('copyall')}Copiar rodada</button>`:''}</div>${lista.map(c=>balloon(c,true)+retifBlock(c)).join('')}${sem.length?`<div class="small muted">Sem comentário nesta rodada: <b>${sem.map(c=>esc(c.codigo)).join(', ')}</b>. Finalize a rodada para o Claude escrever, ou escreva manualmente.</div>`:''}${!lista.length&&!sem.length?'<div class="small muted">Nenhum comentário nesta rodada ainda.</div>':''}</div>`}).join(''):'<div class="small muted">Nenhum comentário ainda. <button class="linkbtn" data-goreg>Abrir a aba Testes</button></div>'}</section>`;
  h+=concludeCard(a);
  h+=timelineCard(a);
  h+=`<div class="card"><h3>Evidências da atividade</h3>${evs.length?`<div class="evgrid">${evs.map(e=>{const us=S.comentarios.filter(c=>(c.evidencias||[]).includes(e.id));return `<div class="evcard" data-k="ev:${esc(e.id)}">${isImg(e)?`<img src="${esc(evUrl(e))}" alt="${esc(e.nome)}" data-ev="${esc(e.id)}">`:''}<div class="nm">${esc(e.nome)}</div>${e.descricao?`<div class="small muted">${esc(e.descricao)}</div>`:''}<div class="small muted">${fmtSize(e.tamanho)} · ${fmtDT(e.criadoEm)}</div><div class="row">${us.map(c=>`<span class="pill ${CL(c.classificacao).css}" title="${esc(c.titulo)}">${CL(c.classificacao).l} ${numberFor(c)} · R${c.rodada}</span>`).join('')||'<span class="small muted">sem vínculo</span>'}</div><div class="row" style="justify-content:flex-end">${ib('eye','Ver evidência',`data-ev="${esc(e.id)}"`)}${ib('download','Baixar',`data-dl="${esc(e.id)}"`)}</div></div>`}).join('')}</div>`:'<div class="small muted">Nenhuma evidência anexada.</div>'}</div>`;
  h+=`<details class="card knbox" id="cenBox"${cenOpen?' open':''}><summary><h3 style="display:inline;margin:0">Cenários testados</h3> <span class="small muted">(${ce.length})</span></summary><div style="margin-top:10px">${ce.length?`<div class="tblw"><table><thead><tr><th>Cenário</th><th>O que valida</th><th>Resultado</th><th>Rodada</th><th class="num">Estimativa</th></tr></thead><tbody>${ce.map(c=>`<tr><td><b>${esc(c.codigo)}</b></td><td>${esc(c.titulo)}${(c.divergencias||[]).length?' <span class="pill r-bloqueado">divergência com a documentação</span>':''}${c.resposta?`<div class="small muted" style="white-space:pre-wrap;margin-top:4px">${esc(c.resposta.length>260?c.resposta.slice(0,260)+'…':c.resposta)}</div>`:''}${(c.evidencias||[]).length?`<div class="row" style="margin-top:6px">${c.evidencias.map(id=>S.evidencias.find(e=>e.id===id)).filter(Boolean).map(evChip).join('')}</div>`:''}</td><td><span class="pill r-${c.resultado||'pendente'}">${RES[c.resultado||'pendente']}</span></td><td class="num">${c.rodada||1}</td><td class="num">${fmtMin(c.estimativaMin)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="small muted">Sem cenários ainda. <button class="linkbtn" data-goreg>Gerar cenários na aba Testes</button></div>'}</div></details>`;
  h+=ctxDrawer(a,false);
  pane.innerHTML=h;bindCommon(pane,a);bindOrient(pane,a);bindModel(pane,a);bindConclude(pane,a);const cb=$('#cenBox');if(cb)cb.ontoggle=()=>{cenOpen=cb.open};
}
function openCancelAtiv(a){const m=$('#modal');
  m.innerHTML=`<div class="box" role="dialog" aria-modal="true" aria-labelledby="caT"><b id="caT" style="font-size:17px">Cancelar a atividade?</b><div class="small muted">"${esc(a.titulo)}" sai da fila de testes e vai para a coluna Cancelada do kanban. Cenários, respostas, evidências e comentários continuam guardados.</div>
  <label class="small" style="display:grid;gap:4px">Motivo (opcional)<textarea id="caMot" rows="3" placeholder="Ex.: removida da sprint pelo PO"></textarea></label>
  <div class="row"><span class="grow"></span><button id="caNo">Voltar</button><button class="dangerfill" id="caOk">Cancelar atividade</button></div></div>`;
  m.hidden=false;$('#caMot').focus();$('#caNo').onclick=()=>m.hidden=true;
  $('#caOk').onclick=async e=>{const b=e.currentTarget;const mot=$('#caMot').value.trim();btnLoad(b,true);const prev={status:a.status||'A testar',historico:a.historico||[],motivoCancelamento:a.motivoCancelamento||'',statusAntesCancelamento:a.statusAntesCancelamento||null};
    try{const h=[...(a.historico||[]),{status:'Cancelada',em:nowISO(),por:me?.id||null,porNome:me?.name||'',nota:mot||'Atividade cancelada',rodada:a.rodada||1}];
      const ativas=sorted(S.atividades.filter(x=>x.status!=='Cancelada'));const pos=ativas.findIndex(x=>x.id===a.id);const prox=ativas.filter(x=>x.id!==a.id)[pos>=0?Math.min(pos,ativas.length-2):0];
      await cap.db.collection('atividades').doc(a.id).update({status:'Cancelada',historico:h,motivoCancelamento:mot,statusAntesCancelamento:prev.status});m.hidden=true;
      if(st.ativ===a.id){if(prox){st.ativ=prox.id;saveUI();try{history.replaceState(null,'',hashFor('ativ'))}catch(err){}render();window.scrollTo({top:0,behavior:'smooth'})}else nav('kanban')}
      toastUndo('Atividade cancelada e retirada da lista.','Desfazer',async()=>{await cap.db.collection('atividades').doc(a.id).update(prev);st.ativ=a.id;saveUI();if(st.view==='ativ'){try{history.replaceState(null,'',hashFor('ativ'))}catch(err){}render()}else nav('ativ')},12000,{kind:'cancel'})}
    catch(err){btnLoad(b,false);toast('Não foi possível cancelar: '+(err.code||err.message))}}}
async function reativarAtiv(a,b){btnLoad(b,true);const volta=a.statusAntesCancelamento&&a.statusAntesCancelamento!=='Cancelada'?a.statusAntesCancelamento:'A testar';
  try{const h=[...(a.historico||[]),{status:volta,em:nowISO(),por:me?.id||null,porNome:me?.name||'',nota:'Atividade reativada',rodada:a.rodada||1}];await cap.db.collection('atividades').doc(a.id).update({status:volta,historico:h,motivoCancelamento:''});toast('Atividade reativada: '+volta+'.')}
  catch(err){btnLoad(b,false);toast('Não foi possível reativar: '+(err.code||err.message))}}
function bindCommon(pane,a){bindNotas(pane,a);pane.querySelectorAll('[data-ctxopen]').forEach(b=>b.onclick=()=>setCtx(true));pane.querySelectorAll('[data-ctxclose]').forEach(b=>b.onclick=()=>setCtx(false));{const cb=pane.querySelector('#btnCancelAtiv');if(cb)cb.onclick=()=>openCancelAtiv(a);const rb=pane.querySelector('#btnReativar');if(rb)rb.onclick=()=>reativarAtiv(a,rb)}bindEv(pane);pane.querySelectorAll('[data-goreg]').forEach(b=>b.onclick=()=>{st.mod='reg';setMod();render()});bindRetif(pane,a);
  pane.querySelectorAll('[data-cst]').forEach(s=>s.onchange=async()=>{try{await cap.db.collection('comentarios').doc(s.dataset.cst).update({status:s.value});toast('Situação do apontamento atualizada.')}catch(e){toast('Erro: '+e.code)}});
  pane.querySelectorAll('[data-cedit]').forEach(b=>b.onclick=()=>openComForm(a,b.dataset.cedit));
  pane.querySelectorAll('[data-copy]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();const c=S.comentarios.find(x=>x.id===b.dataset.copy);copy(commentText(c,numberFor(c)),b)});
  pane.querySelectorAll('[data-copyround]').forEach(b=>b.onclick=()=>copy(roundText(a.id,+b.dataset.copyround),b));
  pane.querySelectorAll('[data-dl]').forEach(b=>b.onclick=()=>download(S.evidencias.find(e=>e.id===b.dataset.dl)));
}

/* ---------- registro ---------- */
function renderReg(pane,a){
  const ce=byAtiv('cenarios',a.id);const rod=a.rodada||1;
  let h=headCard(a,true);
  h+=`<section class="card cens"><div class="row cenh"><h2 class="sech">Cenários</h2><span class="grow"></span>${cap.sample?`<button class="${ce.length?'':'pri'}" id="gen">${ce.length?'Gerar mais':'Gerar cenários com o Claude'}</button>`:''}${ce.length&&cap.sample?`<button id="reDados" title="Troca os dados dos passos (URL, Unimeds, carteirinha) pelos do ambiente atual, sem mudar o que o cenário testa">Atualizar dados</button>`:''}</div>
  <div id="genOut" class="small muted"></div>
  ${ce.length?`<div class="cenlist">${ce.map(c=>cenBlock(c,rod)).join('')}</div>`:'<div class="small muted">Nenhum cenário ainda. O Claude monta os cenários a partir da descrição da atividade.</div>'}
  </section>`;
  const cs=S.comentarios.filter(c=>c.atividadeId===a.id);const rods=[...new Set(cs.map(c=>c.rodada||1))].sort((x,y)=>y-x);
  if(ce.length){const fp=finishInfo(a).pend;h+=`<div class="finend">${fp.length?`<span class="small muted">${fp.length>1?'Faltam '+fp.length+' cenários':'Falta 1 cenário'}: ${fp.map(c=>esc(c.codigo)).join(', ')}</span>`:''}<button class="pri" id="finRod"${fp.length?` disabled aria-disabled="true" data-tip="Teste todos os cenários para finalizar a rodada"`:''}>Finalizar teste</button></div>`}
  h+=ctxDrawer(a,true);
  pane.innerHTML=h;bindCommon(pane,a);bindReg(pane,a);bindModel(pane,a);bindAmb(pane);bindKnow(pane);bindDocs(pane);bindPrints(pane,a);bindOrient(pane,a);
}
const retsOf=(c,d)=>({...(c.retornos||{}),...((d||drafts[c.id]||{}).retornos||{})});
function hasAns(c,d){d=d||drafts[c.id]||{};return !!String(d.resposta??c.resposta??'').trim()||!!(c.evidencias||[]).length||Object.values(retsOf(c,d)).some(v=>String(v||'').trim())}
function refreshActs(cid){const c=S.cenarios.find(x=>x.id===cid);if(!c)return;const has=hasAns(c);document.querySelectorAll('[data-act][data-cid="'+CSS.escape(cid)+'"]').forEach(b=>{if(b.dataset.act==='aprovado')return;b.classList.toggle('off',!has);if(has){b.removeAttribute('aria-disabled');delete b.dataset.tip}else{b.setAttribute('aria-disabled','true');b.dataset.tip='Escreva o que aconteceu, cole o retorno ou anexe uma evidência'}})}
function divBlock(c){const dv=(c.divergencias||[]).filter(x=>x&&(String(x.atividade||'').trim()||String(x.documentacao||'').trim()));if(!dv.length)return'';
  const docs=[...new Set(dv.map(x=>String(x.documento||'documentação anexada').trim()))].join(', ');
  return `<details class="diverg"><summary>Existem divergências na atividade com a documentação anexada: ${esc(docs)}</summary><div class="dv">${dv.map(x=>`<div>${x.ponto?`<b>${esc(x.ponto)}</b>`:''}<div class="lbl" style="margin-top:4px">O que fala na atividade</div><div class="trecho">${esc(x.atividade||'(a atividade não trata deste ponto)')}</div><div class="lbl" style="margin-top:8px">O que fala na documentação · ${esc(x.documento||'')}${x.secao?' · '+esc(x.secao):''}</div><div class="trecho">${esc(x.documentacao||'')}</div></div>`).join('')}</div><div class="small muted" style="margin-top:8px">O cenário segue o que está na atividade. Confirme com o analista qual das duas vale.</div></details>`}
function prevBug(c){const hs=c.historicoRespostas||[];if(!hs.length)return'';const last=hs[hs.length-1];const r=last.rodada||((c.rodada||2)-1);
  const coms=S.comentarios.filter(m=>m.atividadeId===c.atividadeId&&(m.rodada||1)===r&&(m.cenarios||[]).includes(c.id));
  let body='';if(coms.length)body=coms.map(m=>`<div>${m.titulo?`<b>${esc(m.titulo)}</b>`:''}${m.obtido?`<div>${inlineCode(m.obtido)}</div>`:(m.texto?`<div>${inlineCode(m.texto)}</div>`:'')}</div>`).join('');
  else if(String(last.resposta||'').trim())body=`<div>${inlineCode(last.resposta)}</div>`;
  if(last.motivo)body=`<div><b>Divergência ao concluir os testes</b><div>${inlineCode(last.motivo)}</div></div>`+body;
  if(!body)return'';return `<div class="cprev"><span class="csec">Cenário anterior · rodada ${r}${last.resultado?' · '+esc(RES[last.resultado]||last.resultado):''}</span>${body}</div>`}
function refSteps(c){const cods=[...new Set((String(c.pergunta||'')+' '+String(c.esperado||'')).match(/\b(?:CT|RT)\d+\b/gi)||[])].map(x=>x.toUpperCase()).filter(x=>x!==String(c.codigo||'').toUpperCase());if(!cods.length)return'';
  const all=byAtiv('cenarios',c.atividadeId);return cods.map(k=>all.find(x=>String(x.codigo||'').toUpperCase()===k)).filter(Boolean).map(r=>`<div class="cref"><span class="csec">Passos do ${esc(r.codigo)}, citado acima</span>${richText(r.pergunta)}</div>`).join('')}
function cenBlock(c,rod){const d=drafts[c.id]||{};const res=c.resultado||'pendente';const lock=res!=='pendente';const evs=(c.evidencias||[]).map(id=>S.evidencias.find(e=>e.id===id)).filter(Boolean);
  const ov=OPEN['cen:'+c.id];const op=ov===undefined?!lock:ov;const quem=c.atualizadoEm?`Respondido por ${esc(nameOf(c.atualizadoPor,c.atualizadoPorNome))} em ${fmtDT(c.atualizadoEm)} · rodada ${c.rodada||1}`:'';
  return `<details class="cenx" data-cen="${esc(c.id)}" data-k="cen:${esc(c.id)}" data-open="cen:${esc(c.id)}"${op?' open':''}>
  <summary><span class="cnum">${esc(c.codigo)}</span><span class="ctit">${esc(c.titulo)}</span><span class="grow"></span><span class="pill r-${res}">${RES[res]}</span></summary>
  <div class="cbody">${divBlock(c)}<div class="cpart"><div class="cpah"><span class="csec">Passos</span><span class="grow"></span>${cpyBtns(c)}</div>${richText(c.pergunta,{paste:{cid:c.id,vals:retsOf(c,d),lock}})}</div>${refSteps(c)}${c.esperado?`<div class="cexpect"><span class="csec">Esperado</span><div>${inlineCode(c.esperado)}</div></div>`:''}${prevBug(c)}
  <div class="resp cres"><div class="chead"><span class="csec">Resultado</span><span class="grow"></span>${lock?`<button data-retest="${esc(c.id)}" title="Reabre este cenário para você mudar a resposta e registrar o resultado de novo">Editar resultado</button>`:''}</div><textarea id="r-${esc(c.id)}" rows="4" data-resp="${esc(c.id)}"${lock?' readonly class="locked"':''} aria-label="Resultado do ${esc(c.codigo)}" placeholder="O que aconteceu? Cole aqui o retorno ou um print (Ctrl+V).">${esc(d.resposta??c.resposta??'')}</textarea>${lock?'':quickChips(c)}${!lock&&d.sug?`<div class="sugbox"><b>Sugestão do Claude: ${esc(RES[d.sug.v]||d.sug.v)}.</b> ${inlineCode(d.sug.motivo||'')}</div>`:''}
  ${lock?`${c.analise?.motivo?`<div class="analise"><b>Análise do Claude:</b> ${inlineCode(c.analise.motivo)}</div>`:''}`:`<div class="row"><label class="attach"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${TIC.clip}</svg><span>Anexar arquivo</span><input type="file" multiple data-file="${esc(c.id)}" hidden></label><div class="upq" data-upk="cen:${esc(c.id)}"></div>
  <span class="grow"></span>${ACTS.map(([k,l])=>{const need=k!=='aprovado'&&!hasAns(c,d);return `<button class="actb act-${k}${need?' off':''}${d.sug&&(d.sug.v===k||(k==='analisar'&&d.sug.v==='validar'))?' sug':''}" data-act="${k}" data-cid="${esc(c.id)}"${need?` aria-disabled="true" data-tip="Escreva o que aconteceu, cole o retorno ou anexe uma evidência"`:''}>${l}</button>`}).join('')}</div>`}
  ${evs.length?`<div class="row">${evs.map(e=>`<span class="evrm">${evChip(e)}${lock?'':`<button class="x" data-evrm="${esc(c.id)}|${esc(e.id)}" aria-label="Remover anexo ${esc(e.nome)}" data-tip="Remover anexo">×</button>`}</span>`).join('')}</div>`:''}</div>
  <div class="cfoot"><span class="small">≈ ${fmtMin(c.estimativaMin)}${quem?' · '+quem:''}</span><span class="grow"></span>${!lock?`<button class="ghost tcb" data-tclaude="${esc(c.id)}" title="Copia um pedido pronto para colar numa conversa com o Claude; ele executa no seu Chrome e devolve o resultado">Testar com o Claude</button>`:''}${ib('edit','Editar cenário',`data-cedit="${esc(c.id)}"`)}${res!=='aprovado'?ib('block','Cancelar cenário',`data-cancel="${esc(c.id)}"`,'ib-bad'):''}</div></div></details>`}

/* ---------- registro mais rápido ---------- */
const SB_URL='https://claude.ai/artifact/543Xqq7GRBN5tbdmxf5fVJ';
function pickJSON(t){t=String(t||'');for(let i=t.indexOf('{');i>=0;i=t.indexOf('{',i+1)){let dep=0,inS=false,esc2=false;for(let j=i;j<t.length;j++){const ch=t[j];if(inS){if(esc2)esc2=false;else if(ch==='\\')esc2=true;else if(ch==='"')inS=false;continue}if(ch==='"')inS=true;else if(ch==='{')dep++;else if(ch==='}'){dep--;if(dep===0){const cand=t.slice(i,j+1);try{JSON.parse(cand);if(cand.length>20)return cand}catch(e){}break}}}}return ''}
function pickSQL(t){const m=String(t||'').match(/\b(?:SELECT|WITH|UPDATE|INSERT|DELETE)\b[\s\S]*?;/i);return m?m[0].trim():''}
function pickURL(t){const m=String(t||'').match(/\b(?:(GET|POST|PUT|PATCH|DELETE)\s+)?(https?:\/\/[^\s"'<>]+)/i);return m?m[2].replace(/[.,;)]+$/,''):''}
function cpyBtns(c){const j=pickJSON(c.pergunta),q=pickSQL(c.pergunta),u=pickURL(c.pergunta);const b=[];
  if(u)b.push(`<button class="ghost cpyb" data-cpyurl="${esc(c.id)}">${ICO('copy')}URL</button>`);if(j)b.push(`<button class="ghost cpyb" data-cpyreq="${esc(c.id)}">${ICO('copy')}Request</button>`);if(q)b.push(`<button class="ghost cpyb" data-cpysql="${esc(c.id)}">${ICO('copy')}SQL</button>`);return b.join('')}
const QK_DEF=['Passou como esperado.','Mesmo comportamento da rodada anterior.','Retornou erro: '];
function quickList(c){const freq=new Map();for(const x of S.cenarios){if(x.sprintId&&c.sprintId&&x.sprintId!==c.sprintId)continue;const r=String(x.resposta||'').trim();if(!r||r.length>90||/\n/.test(r))continue;const k=norm(r);const o=freq.get(k)||{t:r,n:0};o.n++;freq.set(k,o)}
  const top=[...freq.values()].filter(o=>o.n>1).sort((a,b)=>b.n-a.n).map(o=>o.t);return [...new Set([...top,...QK_DEF])].slice(0,5)}
function quickChips(c){return `<div class="qkrow" aria-label="Respostas rápidas">${quickList(c).map(t=>`<button type="button" class="qk" data-qk="${esc(c.id)}" data-t="${esc(t)}">${esc(t.length>48?t.slice(0,47)+'…':t)}</button>`).join('')}</div>`}
function nextCen(a,id){const ce=byAtiv('cenarios',a.id);const i=ce.findIndex(c=>c.id===id);const pend=c=>(c.resultado||'pendente')==='pendente'&&c.id!==id;return ce.slice(i+1).find(pend)||ce.slice(0,i).find(pend)||null}
function goNext(a,id){OPEN['cen:'+id]=false;const nx=nextCen(a,id);if(nx)OPEN['cen:'+nx.id]=true;
  setTimeout(()=>{const cur=document.querySelector('[data-cen="'+CSS.escape(id)+'"]');if(cur)cur.open=false;
    if(!nx){const f=$('#finRod');toast('Todos os cenários têm resultado. Pode finalizar o teste.',4200,{kind:'ok'});if(f)f.focus();return}
    const el=document.querySelector('[data-cen="'+CSS.escape(nx.id)+'"]');if(!el)return;el.open=true;el.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>{const t=el.querySelector('textarea[data-resp]');if(t)t.focus({preventScroll:true})},380)},260)}
let LASTCEN=null;document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.dataset&&d.dataset.cen&&d.open)LASTCEN=d.dataset.cen},true);
document.addEventListener('focusin',e=>{const d=e.target.closest&&e.target.closest('[data-cen]');if(d)LASTCEN=d.dataset.cen});
document.addEventListener('paste',async ev=>{if(ev.defaultPrevented||st.view!=='ativ'||st.mod!=='reg')return;const t=ev.target;if(t&&t.closest&&(t.closest('#modal')||t.closest('#ask')||t.closest('.ctxdr')))return;
  const files=[...(ev.clipboardData?.items||[])].filter(i=>i.kind==='file').map(i=>i.getAsFile()).filter(f=>f&&/^image\//.test(f.type));if(!files.length)return;
  const own=t&&t.closest&&t.closest('[data-cen]');const cid=own?own.dataset.cen:LASTCEN;const el=cid&&document.querySelector('[data-cen="'+CSS.escape(cid)+'"]');const c=cid&&S.cenarios.find(x=>x.id===cid);
  if(!el||!c||(c.resultado||'pendente')!=='pendente'){toast('Abra o cenário que vai receber o print e cole de novo.');return}
  ev.preventDefault();const a=S.atividades.find(x=>x.id===c.atividadeId);const ids=await uploadFiles(files,a?a.id:c.atividadeId,'Print colado no cenário',{upk:'cen:'+cid});await addEvToCen(cid,ids);toast('Print anexado ao '+c.codigo+'.',2600,{kind:'ok'})});
async function sugest(a,id,b){const t=$('#r-'+CSS.escape(id));const c=S.cenarios.find(x=>x.id===id);if(!c||!t)return;const d=drafts[id]||{};
  const raw=[t.value,...Object.entries(retsOf(c,d)).filter(([k,v])=>String(v||'').trim()).map(([k,v])=>k+':\n'+v)].join('\n\n').trim();
  if(!raw){toast('Cole o retorno ou escreva o que aconteceu no campo Resultado antes de pedir a análise.');t.focus();return}
  const ctxt=/<html|xrebel/i.test(raw)&&typeof evidenceTextFromString==='function'?evidenceTextFromString(raw,'retorno colado'):raw;
  btnLoad(b,true);try{const r=await aiJ('analisar',`Você ajuda um tester a registrar o resultado de um cenário de teste do CRM JMJ. Compare o que aconteceu com o esperado e responda APENAS com JSON {"veredito":"aprovado|reprovado|validar","resumo":"","motivo":""}.
- "resumo": 1 a 3 frases objetivas do que aconteceu, com os valores que importam (ids, datas, códigos, mensagens), em português, sem opinião. É o que fica registrado como resultado.
- "veredito": aprovado se o comportamento bate com o esperado; reprovado se diverge; validar se o retorno não permite concluir ou se depende de regra que precisa ser confirmada.
- "motivo": uma frase dizendo por que.
${typeof EVID_RULE!=='undefined'?EVID_RULE+'\n':''}
Cenário ${c.codigo}: ${c.titulo}
Passos:
${String(c.pergunta||'').slice(0,6000)}
Esperado: ${c.esperado||'(não informado)'}

O que o tester colou/escreveu:
${String(ctxt).slice(0,30000)}`,{modelTier:'default'});
    const v=['aprovado','reprovado','validar'].includes(r&&r.veredito)?r.veredito:'validar';const resumo=String(r&&r.resumo||'').trim();
    const novo=resumo?(resumo+(raw.length>resumo.length+20?'\n\n---\n'+t.value.trim():'')).trim():t.value;
    const dd=(drafts[id]??={});dd.resposta=novo;dd.sug={v,motivo:String(r&&r.motivo||'').trim()};t.value=novo;syncSave(id);refreshActs(id);render()}
  catch(e){toast(e.code==='not_granted'?'O acesso ao Claude não foi liberado nesta página.':'Não consegui analisar agora ('+(e.code||e.message)+').')}finally{btnLoad(b,false)}}
function claudeTestPrompt(a,c){const am=typeof ambShort==='function'?ambShort():'';return `Use o Claude in Chrome para executar este cenário de teste no CRM, no meu Chrome (já estou logado).

Atividade: ${a.titulo}
Cenário ${c.codigo}: ${c.titulo}${am?`\nAmbiente: ${am}`:''}

Passos:
${c.pergunta||''}

Esperado:
${c.esperado||'(não informado)'}

Depois de executar:
1. Tire prints das telas que comprovam o resultado e me mande aqui na conversa.
2. Grave o que aconteceu no Sprintboard (artifact ${SB_URL}): coleção "cenarios", documento "${c.id}", campo "resposta". Escreva de forma objetiva, com os valores vistos (protocolo, datas, mensagens). Não mude o campo "resultado": eu aprovo ou reprovo.
3. Me diga em uma frase se o comportamento bateu com o esperado.
Se algum passo depender de request ou SQL, me avise em vez de improvisar.`}

function isDirty(c){const d=drafts[c.id];if(!d)return false;return (d.resposta!==undefined&&d.resposta!==(c.resposta||''))||(d.resultado!==undefined&&d.resultado!==(c.resultado||'pendente'))}
function syncSave(id){const c0=S.cenarios.find(x=>x.id===id);if(c0)document.querySelectorAll('[data-act][data-cid="'+CSS.escape(id)+'"]').forEach(b=>b.classList.toggle('on',!isDirty(c0)&&c0.resultado===b.dataset.act))}
function flowCard(a){const s=a.status||'A testar';const hs=a.historico||[];
  return `<details class="card knbox" data-open="fl"${OPEN.fl?' open':''}><summary><h3 style="display:inline;margin:0">Fluxo com o desenvolvimento</h3> <span class="small muted">· ${esc(s)} · rodada ${a.rodada||1}</span></summary>  <div class="row" style="margin-bottom:10px"><span>Situação atual:</span><span class="pill s-${slug(s)}">${esc(s)}</span><span class="small muted">rodada ${a.rodada||1}</span></div>
  <label class="small muted" for="flowNote">Observação da mudança</label><input type="text" id="flowNote" placeholder="Ex.: enviada para correção do e-mail_usuario nulo" style="width:100%;margin:4px 0 10px">
  <div class="flowbtns"><button data-flow="Em teste">Iniciar teste</button><button data-flow="Em desenvolvimento">Enviar para desenvolvimento</button><button data-flow="Reteste">Voltou do desenvolvimento</button><button data-flow="Aprovada">Aprovar</button><button data-flow="Reprovada">Reprovar</button></div>
  ${hs.length?`<div class="tblw" style="margin-top:12px"><table><thead><tr><th>Quando</th><th>Situação</th><th>Rodada</th><th>Quem</th><th>Observação</th></tr></thead><tbody>${[...hs].reverse().map(h=>`<tr><td>${fmtDT(h.em)}</td><td><span class="pill s-${slug(h.status)}">${esc(h.status)}</span></td><td class="num">${h.rodada||''}</td><td>${esc(nameOf(h.por,h.porNome))}</td><td>${esc(h.nota||'')}</td></tr>`).join('')}</tbody></table></div>`:''}</details>`}

function bindReg(pane,a){
  pane.querySelectorAll('[data-ret]').forEach(t=>{const [cid,k]=t.dataset.ret.split('|');t.oninput=()=>{const d=(drafts[cid]??={});(d.retornos??={})[k]=t.value;refreshActs(cid)};t.onblur=()=>saveRet(cid)});
  pane.querySelectorAll('[data-resp]').forEach(t=>{t.oninput=()=>{(drafts[t.dataset.resp]??={}).resposta=t.value;syncSave(t.dataset.resp);refreshActs(t.dataset.resp)};
    t.addEventListener('paste',async ev=>{if(t.readOnly)return;const items=[...(ev.clipboardData?.items||[])].filter(i=>i.kind==='file');if(!items.length)return;ev.preventDefault();const files=items.map(i=>i.getAsFile()).filter(Boolean);const ids=await uploadFiles(files,a.id,'Print colado na resposta do cenário',{upk:'cen:'+t.dataset.resp});await addEvToCen(t.dataset.resp,ids)})});
  pane.querySelectorAll('[data-evrm]').forEach(b=>b.onclick=async()=>{const [cid,eid]=b.dataset.evrm.split('|');const c=S.cenarios.find(x=>x.id===cid);const e=S.evidencias.find(x=>x.id===eid);b.disabled=true;
    try{await cap.db.collection('cenarios').doc(cid).update({evidencias:(c?.evidencias||[]).filter(x=>x!==eid)});
      const emUso=S.cenarios.some(x=>x.id!==cid&&(x.evidencias||[]).includes(eid))||S.comentarios.some(x=>(x.evidencias||[]).includes(eid));
      if(!emUso)await cap.db.collection('evidencias').doc(eid).delete();
      const prevEv=[...(c?.evidencias||[])];const eData=e?(({id,...r})=>r)(e):null;
      toastUndo((e?.nome||'Anexo')+' removido'+(emUso?' deste cenário.':'.'),'Desfazer anexo',async()=>{if(!emUso&&eData)await cap.db.collection('evidencias').doc(eid).set(eData);await cap.db.collection('cenarios').doc(cid).update({evidencias:prevEv})})}catch(err){b.disabled=false;toast('Não foi possível remover: '+(err.code||err.message))}});
  pane.querySelectorAll('[data-file]').forEach(f=>{const zone=f.closest('.resp');if(!zone)return;let dc=0;
    zone.addEventListener('dragenter',e=>{if(![...(e.dataTransfer?.types||[])].includes('Files'))return;e.preventDefault();dc++;zone.classList.add('dropon')});
    zone.addEventListener('dragover',e=>{if([...(e.dataTransfer?.types||[])].includes('Files')){e.preventDefault();e.dataTransfer.dropEffect='copy'}});
    zone.addEventListener('dragleave',()=>{if(--dc<=0){dc=0;zone.classList.remove('dropon')}});
    zone.addEventListener('drop',async e=>{const files=[...(e.dataTransfer?.files||[])];if(!files.length)return;e.preventDefault();dc=0;zone.classList.remove('dropon');const ids=await uploadFiles(files,a.id,'Anexado na resposta do cenário',{upk:'cen:'+f.dataset.file});await addEvToCen(f.dataset.file,ids);if(pendingRender&&!typing())render()})});
  pane.querySelectorAll('[data-file]').forEach(f=>f.onchange=async()=>{const files=[...f.files];f.value='';f.blur();const ids=await uploadFiles(files,a.id,'Anexado na resposta do cenário',{upk:'cen:'+f.dataset.file});await addEvToCen(f.dataset.file,ids);if(pendingRender&&!typing())render()});
  pane.querySelectorAll('[data-act]').forEach(b=>b.onclick=async()=>{const id=b.dataset.cid,act=b.dataset.act;const resposta=$('#r-'+CSS.escape(id)).value;const c=S.cenarios.find(x=>x.id===id);
    if(act!=='aprovado'&&c&&!hasAns(c,{...(drafts[id]||{}),resposta})){toast('Escreva na resposta o que aconteceu, cole o retorno ou anexe a evidência antes de '+(act==='reprovado'?'reprovar.':'validar.'));$('#r-'+CSS.escape(id)).focus();return}
    await saveRet(id);
    if(act==='analisar'){openValidar(a,id,resposta,b);return}
    btnLoad(b,true);let ok=false;try{ok=await saveResult(a,id,act,resposta)}finally{btnLoad(b,false)}if(ok)goNext(a,id)});
  pane.querySelectorAll('[data-retest]').forEach(b=>b.onclick=async()=>{const id=b.dataset.retest;const c=S.cenarios.find(x=>x.id===id);if(!c)return;btnLoad(b,true);
    try{const hist=[...(c.historicoRespostas||[]),{resposta:c.resposta||'',resultado:c.resultado||'pendente',retornos:c.retornos||{},evidencias:c.evidencias||[],em:c.atualizadoEm||null,por:c.atualizadoPor||null,rodada:c.rodada||1,refeitoEm:nowISO()}];
      await cap.db.collection('cenarios').doc(id).update({resposta:c.resposta||'',resultado:'pendente',retificado:true,historicoRespostas:hist,atualizadoEm:null,atualizadoPor:null,atualizadoPorNome:''});delete drafts[id];const prev={resposta:c.resposta||'',resultado:c.resultado||'pendente',retificado:!!c.retificado,historicoRespostas:c.historicoRespostas||[],atualizadoEm:c.atualizadoEm||null,atualizadoPor:c.atualizadoPor||null,atualizadoPorNome:c.atualizadoPorNome||''};toastUndo('Ajuste a resposta do '+c.codigo+' e registre o resultado de novo. A versão anterior foi guardada.','Desfazer retificação',async()=>{await cap.db.collection('cenarios').doc(id).update(prev)});setTimeout(()=>{const t=$('#r-'+CSS.escape(id));if(t){t.focus();const n=t.value.length;try{t.setSelectionRange(n,n)}catch(e){}}},300)}catch(e){toast('Não foi possível limpar: '+(e.code||e.message));btnLoad(b,false)}});
  pane.querySelectorAll('[data-sug]').forEach(b=>b.onclick=()=>sugest(a,b.dataset.sug,b));
  pane.querySelectorAll('[data-qk]').forEach(b=>b.onclick=()=>{const id=b.dataset.qk;const t=$('#r-'+CSS.escape(id));if(!t||t.readOnly)return;const v=b.dataset.t;const cur=t.value.trim();t.value=cur?cur+(/[.:]$/.test(cur)?' ':'. ')+v:v;t.dispatchEvent(new Event('input'));t.focus();t.setSelectionRange(t.value.length,t.value.length)});
  const cx=id=>S.cenarios.find(x=>x.id===id)||{};
  pane.querySelectorAll('[data-cpyreq]').forEach(b=>b.onclick=()=>copy(JSON.stringify(JSON.parse(pickJSON(cx(b.dataset.cpyreq).pergunta)),null,4),b));
  pane.querySelectorAll('[data-cpysql]').forEach(b=>b.onclick=()=>copy(pickSQL(cx(b.dataset.cpysql).pergunta),b));
  pane.querySelectorAll('[data-cpyurl]').forEach(b=>b.onclick=()=>copy(pickURL(cx(b.dataset.cpyurl).pergunta),b));
  pane.querySelectorAll('[data-tclaude]').forEach(b=>b.onclick=()=>{copy(claudeTestPrompt(a,cx(b.dataset.tclaude)),b);toast('Pedido copiado. Cole numa conversa com o Claude que tenha o Claude in Chrome ligado.',5200,{kind:'ok'})});
  const g=$('#gen');if(g)g.onclick=()=>{const go=()=>generate(a,g);if(S.cenarios.some(c=>c.atividadeId===a.id))costAsk('gen','Gerar mais cenários?','O Claude vai ler a atividade e os cenários atuais para criar novos. Isso usa o seu limite do Claude.',go,{tipo:'gen',sprintId:a.sprintId,ativId:a.id,titulo:'Gerar mais cenários · '+a.titulo});else go()};
  {const rd=$('#reDados');if(rd)rd.onclick=()=>openReDados(a)}
  const rt=$('#btnReteste');if(rt)rt.onclick=()=>openReteste(a);
  const mk=pane.querySelector('[data-modok]');if(mk)mk.onclick=async()=>{btnLoad(mk,true);try{await cap.db.collection('atividades').doc(a.id).update({validarModelagem:{...a.validarModelagem,ok:true,okEm:nowISO(),okPor:me?.id||null},modelagemResolvidaEm:nowISO()});toast('Modelagem marcada como validada.')}catch(e){toast('Não foi possível salvar: '+(e.code||e.message));btnLoad(mk,false)}};
  pane.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=()=>openCancel(a,b.dataset.cancel));
  pane.querySelectorAll('[data-cedit]').forEach(b=>b.onclick=()=>openEditCen(a,b.dataset.cedit));
  const fr=$('#finRod');if(fr)fr.onclick=()=>costAsk('finrod','Finalizar a rodada de testes?','O Claude vai ler os cenários e as evidências para escrever os comentários da rodada. Isso usa o seu limite do Claude.',()=>openFinish(a));
  pane.querySelectorAll('[data-flow]').forEach(b=>b.onclick=()=>{if(b.dataset.flow==='Reteste'&&byAtiv('cenarios',a.id).some(c=>(c.resultado||'pendente')!=='pendente'))openReteste(a);else setStatus(a,b.dataset.flow,$('#flowNote').value)});
}
async function saveRet(cid){const d=drafts[cid];if(!d||!d.retornos)return;const c=S.cenarios.find(x=>x.id===cid);if(!c)return;const merged={...(c.retornos||{}),...d.retornos};
  if(JSON.stringify(merged)===JSON.stringify(c.retornos||{})){delete d.retornos;return}
  try{await cap.db.collection('cenarios').doc(cid).update({retornos:merged});c.retornos=merged;delete d.retornos}catch(e){toast('Não foi possível salvar o retorno colado: '+(e.code||e.message))}}
async function addEvToCen(cid,ids){if(!ids.length)return;const c=S.cenarios.find(x=>x.id===cid);try{await cap.db.collection('cenarios').doc(cid).update({evidencias:[...new Set([...(c?.evidencias||[]),...ids])]})}catch(e){toast('Evidência anexada, mas não vinculada ao cenário: '+e.code)}}
async function setStatus(a,status,nota){let rodada=a.rodada||1;if(status==='Reteste'&&(a.status==='Em desenvolvimento'))rodada+=1;
  const h=[...(a.historico||[]),{status,em:nowISO(),por:me?.id||null,porNome:me?.name||'',nota:nota||'',rodada}];
  try{await cap.db.collection('atividades').doc(a.id).update({status,rodada,historico:h});toast(status==='Reteste'&&rodada>(a.rodada||1)?'Nova rodada '+rodada+' aberta.':'Situação: '+status)}catch(e){toast('Não foi possível mudar a situação: '+e.code)}}

/* ---------- concluir testes: o Claude confere resultados e cobertura em segundo plano ---------- */
const VJ=new Map();
function vtPaint(){const t=$('#vtoast');if(!t)return;if(!VJ.size){t.hidden=true;t.innerHTML='';return}const j=[...VJ.values()].pop();t.hidden=false;
  t.innerHTML=`<span class="tic info"><span class="spin"></span></span><div class="ttx"><b>Concluindo testes${VJ.size>1?' ('+VJ.size+')':''}</b><span>${esc(j.tit)} · ${esc(j.msg)}</span></div><div class="tact"></div>`}
function conclState(a){const ce=byAtiv('cenarios',a.id);const pend=ce.filter(c=>!['aprovado','na'].includes(c.resultado||'pendente'));return{ce,pend,ok:ce.length&&!pend.length&&a.status!=='Cancelada'}}
function concludeCard(a){const {ce,pend,ok}=conclState(a);if(!ce.length||a.status==='Cancelada')return'';const cj=a.conclusao||null;const run=VJ.has(a.id);
  let h='';
  if(cj&&cj.ok===false&&(cj.divergencias||[]).length&&!cj.resolvidoEm)h+=`<div class="card concbox"><h3 style="margin:0">Divergências ao concluir os testes</h3>${cj.resumo?`<div class="small muted">${esc(cj.resumo)}</div>`:''}<div class="dvlist">${dvRows(a,cj.divergencias,cj.retestados||[])}</div><div class="row"><span class="grow"></span><button id="dvOk2">Aprovar mesmo assim</button><button class="pri" id="dvRet2">Iniciar reteste</button></div></div>`;
  const done=cj&&cj.ok&&a.status==='Aprovada';
  h+=`<div class="finend">${done?`<span class="small muted">Testes concluídos em ${fmtDT(cj.em)}${cj.resumo?' · '+esc(cj.resumo):''}</span>`:pend.length?`<span class="small muted">${pend.length>1?'Faltam '+pend.length+' cenários aprovados':'Falta 1 cenário aprovado'}: ${pend.map(c=>esc(c.codigo)).join(', ')}</span>`:''}
  <button class="${done?'':'pri'}" id="concBtn"${!ok||run?' disabled aria-disabled="true"':''}>${run?'Concluindo…':done?'Conferir de novo':'Concluir testes'}</button></div>`;return h}
function dvIds(a,dv){const ce=byAtiv('cenarios',a.id);return dv.map(x=>ce.find(y=>String(y.codigo||'').toUpperCase()===String(x.codigo||'').toUpperCase())).filter(Boolean).map(c=>c.id)}
function dvRows(a,dv,rt){const ce=byAtiv('cenarios',a.id);return dv.map((x,i)=>{const c=ce.find(y=>String(y.codigo||'').toUpperCase()===String(x.codigo||'').toUpperCase());const feito=c&&rt.includes(c.id);
  return `<div class="dvrow${feito?' done':''}"><div class="dvt">${c?`<b>${esc(c.codigo)}</b><span class="small muted">${esc(c.titulo)}</span>`:`<b>${x.tipo==='cobertura'?'Cobertura da atividade':x.tipo==='apontamento'?'Apontamento aberto':'Atividade'}</b>`}</div><div class="dvm">${inlineCode(x.motivo)}</div>
  <div class="dvb">${c?(feito?'<span class="small muted">Em reteste</span>':''):''}</div></div>`}).join('')}
async function retestCen(a,cid,motivo){const c=S.cenarios.find(x=>x.id===cid);if(!c)return;const cur=S.atividades.find(x=>x.id===a.id)||a;const rod=cur.rodada||1;
  const hist=[...(c.historicoRespostas||[]),{resposta:c.resposta||'',resultado:c.resultado,retornos:c.retornos||{},evidencias:c.evidencias||[],em:c.atualizadoEm||null,por:c.atualizadoPor||null,rodada:c.rodada||rod,motivo:motivo||'',refeitoEm:nowISO()}];
  await cap.db.collection('cenarios').doc(c.id).update({resposta:'',resultado:'pendente',retornos:{},retificado:false,historicoRespostas:hist,evidencias:[],atualizadoEm:null,atualizadoPor:null,atualizadoPorNome:''});
  const cj=cur.conclusao||{};const rt=[...new Set([...(cj.retestados||[]),c.id])];
  const upd={conclusao:{...cj,retestados:rt}};if(cur.status!=='Reteste'){upd.status='Reteste';upd.historico=[...(cur.historico||[]),{status:'Reteste',em:nowISO(),por:me?.id||null,porNome:me?.name||'',nota:'Divergência ao concluir os testes: '+c.codigo,rodada:rod}]}
  else upd.historico=cur.historico||[];
  await cap.db.collection('atividades').doc(a.id).update(upd)}
function goRetest(a,cid){st.sprint=a.sprintId||st.sprint;st.ativ=a.id;st.mod='reg';OPEN['cen:'+cid]=true;setMod();nav('ativ');setTimeout(()=>{const el=document.querySelector('[data-cen="'+CSS.escape(cid)+'"]');if(el){el.open=true;el.scrollIntoView({behavior:'smooth',block:'start'})}},450)}
function openDiverg(a,dv,resumo){const m=$('#modal');let mexeu=false;
  const paint=()=>{const cur=S.atividades.find(x=>x.id===a.id)||a;
    m.innerHTML=`<div class="box" style="max-width:640px;position:relative" role="dialog" aria-modal="true" aria-labelledby="dvT"><button class="boxx" id="dvX" aria-label="Ignorar divergências" title="Ignorar: a atividade fica Reprovada">×</button>
    <b id="dvT" style="font-size:17px;padding-right:36px">${dv.length>1?dv.length+' divergências':'Divergência'} em ${esc(cur.titulo)}</b>${resumo?`<div class="small muted">${esc(resumo)}</div>`:''}
    <div class="dvlist">${dvRows(cur,dv,(cur.conclusao||{}).retestados||[])}</div>
    <div class="row"><span class="small muted grow">Fechar no × ignora as divergências e deixa a atividade como Reprovada.</span><button id="dvOk">Aprovar mesmo assim</button><button class="pri" id="dvRet">Iniciar reteste</button></div></div>`;
    $('#dvX').onclick=async()=>{m.hidden=true;if(mexeu)return;await ignoreDiverg(a)};
    $('#dvOk').onclick=async e=>{btnLoad(e.currentTarget,true);await approveAnyway(a,dv);m.hidden=true};
    $('#dvRet').onclick=()=>{mexeu=true;openReteste(cur,dvIds(cur,dv))};
    m.querySelectorAll('[data-dvret]').forEach(b=>b.onclick=async()=>{btnLoad(b,true);try{await retestCen(a,b.dataset.dvret,dv[+b.dataset.dvi]?.motivo);mexeu=true;m.hidden=true;goRetest(a,b.dataset.dvret);toast('Cenário reaberto para reteste. A divergência aparece em vermelho no cenário.',5000,{kind:'undo',title:'Retestar'})}catch(e){btnLoad(b,false);toast('Não foi possível reabrir: '+(e.code||e.message))}})};
  paint();m.hidden=false}
async function ignoreDiverg(a){const cur=S.atividades.find(x=>x.id===a.id)||a;const cj=cur.conclusao||{};
  try{await cap.db.collection('atividades').doc(a.id).update({status:'Reprovada',conclusao:{...cj,ignoradoEm:nowISO()},historico:[...(cur.historico||[]),{status:'Reprovada',em:nowISO(),por:me?.id||null,porNome:me?.name||'',nota:'Divergências ignoradas ao concluir os testes',rodada:cur.rodada||1}]});
    toast('A atividade ficou Reprovada. As divergências continuam no fim do Resumo.',5200,{kind:'warn',title:'Divergências ignoradas'})}catch(e){toast('Não foi possível salvar: '+(e.code||e.message))}}
async function approveAnyway(a,dv){const cur=S.atividades.find(x=>x.id===a.id)||a;const cj=cur.conclusao||{};dv=dv||cj.divergencias||[];
  try{await cap.db.collection('atividades').doc(a.id).update({status:'Aprovada',conclusao:{...cj,ok:true,em:nowISO(),divergencias:dv,aprovadoComDivergencias:true,resolvidoEm:nowISO(),por:me?.id||null,resumo:`Aprovada mesmo com ${dv.length} divergência${dv.length>1?'s':''}`},
      historico:[...(cur.historico||[]),{status:'Aprovada',em:nowISO(),por:me?.id||null,porNome:me?.name||'',nota:`Aprovada mesmo com ${dv.length} divergência${dv.length>1?'s':''}: `+dv.map(x=>(x.codigo?x.codigo+' ':'')+x.motivo).join(' | ').slice(0,1500),rodada:cur.rodada||1}]});
    toast('A atividade foi aprovada. As divergências ficam registradas no histórico.',5200,{kind:'ok',title:'Aprovada mesmo assim'})}catch(e){toast('Não foi possível aprovar: '+(e.code||e.message))}}
function bindConclude(pane,a){const b=pane.querySelector('#concBtn');if(b)b.onclick=()=>concludeTests(a);
  const rt2=pane.querySelector('#dvRet2');if(rt2)rt2.onclick=()=>openReteste(a,dvIds(a,(a.conclusao||{}).divergencias||[]));const ok2=pane.querySelector('#dvOk2');if(ok2)ok2.onclick=async()=>{btnLoad(ok2,true);await approveAnyway(a)};
  pane.querySelectorAll('.concbox [data-dvret]').forEach(x=>x.onclick=async()=>{const cj=a.conclusao||{};btnLoad(x,true);try{await retestCen(a,x.dataset.dvret,(cj.divergencias||[])[+x.dataset.dvi]?.motivo);goRetest(a,x.dataset.dvret)}catch(e){btnLoad(x,false);toast('Não foi possível reabrir: '+(e.code||e.message))}})}
async function concludeTests(a){if(VJ.has(a.id)||!cap.sample)return;const {ce,ok}=conclState(a);if(!ok){toast('Todos os cenários precisam estar aprovados para concluir.',4200,{kind:'warn'});return}
  const n=String(a.titulo||'').match(/^\s*([\d.]+)/);const j={tit:n?'Atividade '+n[1].replace(/\.$/,''):String(a.titulo||'').slice(0,40),msg:'lendo os cenários'};VJ.set(a.id,j);vtPaint();render();
  try{const evTxt={};
    for(const c of ce)for(const id of (c.evidencias||[])){const e=S.evidencias.find(x=>x.id===id);if(!e||evTxt[id]!==undefined||isImg(e)||/pdf/.test(e.tipo||''))continue;j.msg='lendo '+e.nome;vtPaint();try{evTxt[id]=evidenceTextFromString(await (await fetch(evUrl(e))).text(),e.nome).slice(0,8000)}catch(err){evTxt[id]=''}}
    const cens=ce.map(c=>`### ${c.codigo} — ${c.titulo}\nResultado: ${RES[c.resultado]} (rodada ${c.rodada||1})\nPassos:\n${c.pergunta}\nEsperado: ${c.esperado||''}\nResposta registrada:\n${c.resposta||'(sem texto)'}\n${retTxt(c)}\nEvidências: ${evNames(c.evidencias||[])||'(nenhuma)'}${(c.evidencias||[]).map(id=>evTxt[id]?'\n'+evTxt[id]:'').join('')}`).join('\n\n').slice(0,60000);
    const coms=S.comentarios.filter(m=>m.atividadeId===a.id).map(m=>`- rodada ${m.rodada||1} | ${CL(m.classificacao).l} | ${CST[m.status]||m.status||'Aberto'} | ${m.titulo}`).join('\n');
    j.msg='o Claude está conferindo os resultados';vtPaint();
    const prompt=`Você faz a revisão final dos testes de uma atividade do CRM JMJ antes de ela ser dada como concluída. ${ctxFull()}\n\n${orientTxt(a)}Atividade: ${a.titulo}\nDescrição (Artia):\n${String(a.descricao||'').slice(0,30000)}\n\nApontamentos já feitos:\n${coms||'(nenhum)'}\n\nCenários e resultados:\n${cens}\n\nConfira:\n1) Cada cenário aprovado: a resposta registrada, os retornos e as evidências comprovam o esperado? ${EVID_RULE} É divergência só quando a resposta do tester ou uma evidência anexada mostra comportamento, mensagem ou valor diferente do esperado; quando só funcionou depois de um ajuste manual feito pelo tester (INSERT, UPDATE, dado alterado na mão) que não faz parte da entrega; ou quando o próprio tester escreve que falta validar ou que não deu certo.\n2) Cobertura: os cenários cobrem o que a descrição da atividade pede? É divergência um requisito sem nenhum cenário.\n3) Apontamentos ainda com status Aberto.\nNão invente problema: se a resposta do tester diz que o esperado aconteceu, está certo e não é divergência. Cenário "Não se aplica" não é divergência. Cenário sem nenhuma resposta escrita também não é divergência aqui. Responda APENAS com JSON {"ok":true,"resumo":"uma frase","divergencias":[{"codigo":"CT01, ou vazio se não for de um cenário","tipo":"resultado|cobertura|apontamento","motivo":"o que diverge, objetivo, em português"}]}.`;
    const r=await aiJ('concluir',prompt,{modelTier:'default'});
    const dv=(Array.isArray(r?.divergencias)?r.divergencias:[]).filter(x=>x&&String(x.motivo||'').trim()).map(x=>({codigo:String(x.codigo||''),tipo:String(x.tipo||'resultado'),motivo:String(x.motivo)}));
    VJ.delete(a.id);vtPaint();const cur=S.atividades.find(x=>x.id===a.id)||a;const resumo=String(r?.resumo||'');
    if(r&&r.ok!==false&&!dv.length){
      await cap.db.collection('atividades').doc(a.id).update({status:'Aprovada',conclusao:{ok:true,em:nowISO(),resumo,por:me?.id||null},historico:[...(cur.historico||[]),{status:'Aprovada',em:nowISO(),por:me?.id||null,porNome:me?.name||'',nota:'Testes concluídos'+(resumo?': '+resumo:''),rodada:cur.rodada||1}]});
      toast(resumo||'Os resultados conferem com a atividade.',7000,{kind:'ok',title:j.tit+' · testes concluídos'})}
    else{await cap.db.collection('atividades').doc(a.id).update({conclusao:{ok:false,em:nowISO(),resumo,divergencias:dv,retestados:[],por:me?.id||null}});
      const cur2=S.atividades.find(x=>x.id===a.id)||cur;openDiverg({...cur2,conclusao:{ok:false,divergencias:dv,retestados:[]}},dv,resumo)}
    render()
  }catch(e){VJ.delete(a.id);vtPaint();render();toast('Não foi possível concluir os testes: '+(e.message||e.code),6000)}}

/* ---------- comentários ---------- */
function openComForm(a,editId,fromCen){
  const c=editId?S.comentarios.find(x=>x.id===editId):null;const cen=fromCen?S.cenarios.find(x=>x.id===fromCen):null;
  const evs=testEvs(a.id);const ces=byAtiv('cenarios',a.id);
  const sel=new Set(c?.evidencias||cen?.evidencias||[]);const selC=new Set(c?.cenarios||(cen?[cen.id]:[]));
  const prev=S.comentarios.filter(x=>x.atividadeId===a.id&&(x.rodada||1)<(a.rodada||1)&&x.status!=='encerrado');
  const defCl=c?.classificacao||((a.rodada||1)>1&&prev.length?'BUG-BACK':'BUG-DEV');
  const box=$('#comForm');
  box.innerHTML=`<div class="card" style="background:var(--sunk);margin-bottom:14px"><div class="formgrid">
  <label>Classificação<select id="cf-cl">${CLASSES.map(k=>`<option value="${k.k}"${defCl===k.k?' selected':''}>${k.l} — ${k.d}</option>`).join('')}</select></label>
  <label>Rodada<input type="text" id="cf-rod" value="${c?.rodada||a.rodada||1}" inputmode="numeric"></label>
  <label class="full">Título (ex.: Registro com id_uni_abe diferente de 1 e 2)<input type="text" id="cf-tit" value="${esc(c?.titulo||'')}"></label>
  <label class="full">Texto (Ao registrar …, a aplicação …. O esperado é …)<textarea id="cf-txt" rows="4">${esc(c?.texto||'')}</textarea></label>
  <label class="full">Exemplo de request<textarea id="cf-req" rows="5" style="font-family:var(--mono);font-size:12px">${esc(c?.request||'')}</textarea></label>
  <label class="full">Retorno obtido no request (vira "Testado via API com o request … e obtido o retorno …")<textarea id="cf-rreq" rows="4" style="font-family:var(--mono);font-size:12px">${esc(c?.retornoRequest||'')}</textarea></label>
  <label class="full">Consulta SQL para validar<textarea id="cf-sql" rows="3" style="font-family:var(--mono);font-size:12px">${esc(c?.sql||'')}</textarea></label>
  <label class="full">Resultado obtido na consulta (vira "Testado com a consulta … e obtido o retorno …")<textarea id="cf-rsql" rows="4" style="font-family:var(--mono);font-size:12px">${esc(c?.retornoSql||'')}</textarea></label>
  <label>Resultado obtido<input type="text" id="cf-obt" value="${esc(c?.obtido||'')}"></label>
  <label>Esperado<input type="text" id="cf-esp" value="${esc(c?.esperado||'')}"></label>
  <div class="full"><div class="lbl">Evidências que comprovam</div><div class="split">${evs.map(e=>`<label class="chk"><input type="checkbox" value="${esc(e.id)}" class="cf-ev"${sel.has(e.id)?' checked':''}><span style="overflow-wrap:anywhere">${esc(e.nome)}</span></label>`).join('')||'<span class="small muted">Nenhuma evidência na atividade ainda.</span>'}</div>
   <label class="drop" style="display:block;margin-top:8px">Anexar nova evidência <input type="file" multiple id="cf-file"></label><div class="upq" data-upk="cf" style="margin-top:8px"></div></div>
  <div class="full"><div class="lbl">Cenários relacionados</div><div class="row">${ces.map(x=>`<label class="chk"><input type="checkbox" class="cf-cen" value="${esc(x.id)}"${selC.has(x.id)?' checked':''}>${esc(x.codigo)}</label>`).join('')||'<span class="small muted">—</span>'}</div></div>
  </div><div class="row" style="margin-top:12px">${cap.sample&&cen?`<button id="cf-ai">Rascunhar com o Claude</button>`:''}<span class="grow"></span><button id="cf-cancel">Cancelar</button><button class="pri" id="cf-save">${c?'Salvar alterações':'Salvar comentário'}</button></div><div id="cf-msg" class="small muted"></div></div>`;
  box.scrollIntoView({behavior:'smooth',block:'start'});
  $('#cf-cancel').onclick=()=>box.innerHTML='';
  $('#cf-file').onchange=async e=>{const ids=await uploadFiles([...e.target.files],a.id,'Anexado ao comentário',{upk:'cf'});ids.forEach(i=>sel.add(i));setTimeout(()=>{openComFormKeep(a,editId,fromCen,sel,selC)},600)};
  const ai=$('#cf-ai');if(ai)ai.onclick=()=>draftWithClaude(a,cen,ai);
  $('#cf-save').onclick=async()=>{const data={sprintId:st.sprint,atividadeId:a.id,classificacao:$('#cf-cl').value,rodada:parseInt($('#cf-rod').value)||a.rodada||1,titulo:$('#cf-tit').value.trim(),texto:$('#cf-txt').value.trim(),request:$('#cf-req').value.trim(),retornoRequest:$('#cf-rreq').value.trim(),sql:$('#cf-sql').value.trim(),retornoSql:$('#cf-rsql').value.trim(),obtido:$('#cf-obt').value.trim(),esperado:$('#cf-esp').value.trim(),
      evidencias:[...document.querySelectorAll('.cf-ev:checked')].map(i=>i.value).concat([...sel].filter(id=>!document.querySelector(`.cf-ev[value="${CSS.escape(id)}"]`))),cenarios:[...document.querySelectorAll('.cf-cen:checked')].map(i=>i.value)};
    if(!data.titulo){$('#cf-msg').textContent='Dê um título ao comentário.';return}
    try{if(c)await cap.db.collection('comentarios').doc(c.id).update(data);else await cap.db.collection('comentarios').add({...data,status:'aberto',ordem:Date.now(),criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||''});box.innerHTML='';toast('Comentário salvo.')}catch(e){$('#cf-msg').textContent='Não foi possível salvar: '+(e.code||e.message)}};
}
function openComFormKeep(a,editId,fromCen,sel,selC){const keep={tit:$('#cf-tit')?.value,txt:$('#cf-txt')?.value,req:$('#cf-req')?.value,rreq:$('#cf-rreq')?.value,sql:$('#cf-sql')?.value,rsql:$('#cf-rsql')?.value,obt:$('#cf-obt')?.value,esp:$('#cf-esp')?.value,cl:$('#cf-cl')?.value};openComForm(a,editId,fromCen);
  for(const [k,v] of Object.entries(keep))if(v!=null&&$('#cf-'+k))$('#cf-'+k).value=v;document.querySelectorAll('.cf-ev').forEach(i=>{if(sel.has(i.value))i.checked=true})}

const CONTEXTO=`Contexto fixo: CRM JMJ (Java/Spring, Oracle 19c) integrado ao GPU da Unimed do Brasil (PTU, layout 003, vigência 01/12/2026). Testes em homologação via Postman, XRebel e consultas SQL. Cada Unimed tem a sua própria instalação do CRM e a sua própria base; o endpoint de recebimento é <URL do CRM da Unimed>/crm/public/api/gpu/solicitar-protocolo e só aceita protocolos endereçados a ela. O gateway do GPU em homologação é https://gateway-hml.unimed.coop.br/gpu-core/v1/ e exige o token GIU da Unimed que está enviando. Toda mensagem/descrição de protocolo de teste começa com "Testes JMJ, favor, desconsiderar" seguida da sinalização da atividade. Cada envio usa um nr_transacao_prestadora novo. Colunas conhecidas da PROTOCOLO: AUTOID, NUMERO_PROTOCOLO, STATUS_MANIFESTACAO, SALVAR_FINALIZADO, DATA_REGISTRO, DATA_FECHAMENTO, ID_UNIMED_ABERTURA, NR_VERSAO_GPU, EMAIL_USUARIO, CODIGO_OPERADORA_INTERCAMBIO. Parâmetro de versão: CONFIGURACOES.VERSAO_VIGENTE_GPU.`;
/* ---------- ambiente e entidades de teste da sprint ---------- */
const ambOf=()=>(S.sprints.find(x=>x.id===st.sprint)||{}).ambiente||{};
function ambTxt(){const a=ambOf();if(!String(a.unimed||'').trim()&&!String(a.beneficiarios||'').trim())return'';const L=[];
  if(String(a.unimed||'').trim())L.push(`- Unimed local, onde o tester abre os protocolos pela tela e acompanha o XRebel: ${a.unimed}${a.nome?' '+a.nome:''}${a.ans?', ANS '+a.ans:''}${a.url?', CRM em '+a.url:''}. É dela o token do GPU que o tester tem.`);
  if(String(a.destinos||'').trim())L.push('- Unimeds de destino/contraparte dos testes:\n'+String(a.destinos).trim());
  if(String(a.beneficiarios||'').trim())L.push('- Beneficiários que o tester usa (use SOMENTE estes):\n'+String(a.beneficiarios).trim());
  if(String(a.obs||'').trim())L.push('- Observações do ambiente: '+String(a.obs).trim());
  if(String(a.ans||'').trim())L.push(`- Para pegar o último protocolo aberto nesta base: NUMERO_PROTOCOLO LIKE '${a.ans}%' ORDER BY NUMERO_PROTOCOLO DESC (não use MAX(AUTOID)).`);
  return `\n\nAmbiente desta sprint. Use exatamente estes dados nos requests e nas consultas:\n${L.join('\n')}\nA carteirinha, o nome, a Unimed, o ANS e a URL que aparecerem na descrição da atividade são exemplo do analista: não use nos cenários, troque pelos dados acima. Monte cada request com a Unimed local no papel que o cenário exige (quem abre, quem recebe) e escolha o beneficiário da Unimed correta para esse papel.`}
function ambFields(amb,p){amb=amb||{};const v=k=>esc(amb[k]||'');
  return `<div class="formgrid" style="margin-top:12px">
  <label>Unimed local (código)<input type="text" id="${p}-uni" value="${v('unimed')}" placeholder="0139"></label>
  <label>Nome<input type="text" id="${p}-nome" value="${v('nome')}" placeholder="Rondonópolis"></label>
  <label>Registro ANS<input type="text" id="${p}-ans" value="${v('ans')}" placeholder="359777"></label>
  <label>URL do CRM local<input type="text" id="${p}-url" value="${v('url')}" placeholder="http://localhost:8080"></label>
  <label class="full">Unimeds de destino (uma por linha: código · nome · ANS · URL se tiver)<textarea id="${p}-dest" rows="3" placeholder="0279 · Norte do Mato Grosso · ANS 353663">${v('destinos')}</textarea></label>
  <label class="full">Beneficiários do teste (um por linha: carteirinha · nome · Unimed)<textarea id="${p}-ben" rows="3" placeholder="01392016000059007 · SABRINA DENISE FACIROLLI DA SILVA · 0139">${v('beneficiarios')}</textarea></label>
  <label class="full">Observações (token, parâmetros, o que mais o Claude precisa saber)<textarea id="${p}-obs" rows="2">${v('obs')}</textarea></label></div>`}
function ambRead(p){const g=k=>String($('#'+p+'-'+k)?.value||'').trim();
  return {unimed:g('uni'),nome:g('nome'),ans:g('ans'),url:g('url'),destinos:g('dest'),beneficiarios:g('ben'),obs:g('obs')}}
async function ambSave(d){await cap.db.collection('sprints').doc(st.sprint).update({ambiente:{...d,em:nowISO(),por:me?.id||null,porNome:me?.name||''}});
  const sp=S.sprints.find(x=>x.id===st.sprint);if(sp)sp.ambiente={...d}}
function ambCard(){const a=ambOf();const ok=String(a.unimed||'').trim()&&String(a.beneficiarios||'').trim();
  return `<details class="card knbox" data-open="amb"${OPEN.amb||!ok?' open':''}><summary><h3 style="display:inline;margin:0">Ambiente e entidades de teste</h3> <span class="small muted">· ${ok?esc(a.unimed+(a.nome?' '+a.nome:''))+' · '+String(a.beneficiarios).trim().split('\n').length+' beneficiário(s)':'não preenchido'}</span></summary>
  <p class="small muted" style="margin:10px 0">Em qual base você testa e com quais clientes. O Claude usa estes dados para montar os requests e as consultas, no lugar das carteirinhas de exemplo que aparecem nas atividades. Troque aqui quando mudar de ambiente.</p>
  ${ambFields(a,'am')}
  <div class="row" style="margin-top:10px"><span class="small muted grow">${a.em?`Atualizado por ${esc(nameOf(a.por,a.porNome))} em ${fmtDT(a.em)}`:''}</span><button class="pri" id="amSave">Salvar ambiente</button></div></details>`}
function bindAmb(pane){const b=$('#amSave');if(!b)return;
  b.onclick=async()=>{const d=ambRead('am');if(!d.unimed||!d.beneficiarios){toast('Informe pelo menos a Unimed local e um beneficiário.');return}
    btnLoad(b,true);try{await ambSave(d);toast('Ambiente salvo. O Claude passa a usar estes dados nos próximos cenários.')}catch(e){toast('Não foi possível salvar: '+(e.code||e.message))}finally{btnLoad(b,false)}}}
function ensureAmb(){const a=ambOf();if(String(a.unimed||'').trim()&&String(a.beneficiarios||'').trim())return Promise.resolve(true);
  return new Promise(res=>{const m=$('#modal');
    m.innerHTML=`<div class="box" style="max-width:640px" role="dialog" aria-modal="true" aria-labelledby="abT"><b id="abT" style="font-size:17px">Com quais entidades você vai testar?</b>
    <div class="small muted">A carteirinha e a Unimed que aparecem na atividade são exemplo do analista. Diga em qual base você está testando e com quais clientes, que eu monto os cenários com esses dados.</div>
    ${ambFields(a,'ab')}<div class="row"><span class="grow"></span><button id="abNo">Cancelar</button><button class="pri" id="abOk">Salvar e gerar cenários</button></div></div>`;
    m.hidden=false;setTimeout(()=>$('#ab-uni')?.focus(),30);
    $('#abNo').onclick=()=>{m.hidden=true;res(false)};
    $('#abOk').onclick=async e=>{const b=e.currentTarget;const d=ambRead('ab');
      if(!d.unimed||!d.beneficiarios){toast('Informe pelo menos a Unimed local e um beneficiário.');return}
      btnLoad(b,true);try{await ambSave(d);m.hidden=true;res(true)}catch(err){btnLoad(b,false);toast('Não foi possível salvar: '+(err.code||err.message))}}})}
/* ---------- salvar resultado e validar com o Claude ---------- */
async function saveResult(a,id,resultado,resposta,extra={}){
  try{await cap.db.collection('cenarios').doc(id).update({resposta,resultado,rodada:a.rodada||1,atualizadoEm:nowISO(),atualizadoPor:me?.id||null,atualizadoPorNome:me?.name||'',...extra});delete drafts[id];toast('Cenário '+RES[resultado].toLowerCase()+'.');
    const c1=S.cenarios.find(x=>x.id===id);if(c1&&c1.retificado){await cap.db.collection('cenarios').doc(id).update({retificado:false});if((a.rodadaFinalizada||0)>=(a.rodada||1))await regenFor(a,{...c1,resposta,resultado})}
    if((a.status||'A testar')==='A testar')await setStatus(a,'Em teste','Primeira resposta registrada');return true}
  catch(e){toast('Não foi possível salvar: '+(e.code||e.message));return false}}
async function openValidar(a,id,resposta,btn){const c=S.cenarios.find(x=>x.id===id);if(!c)return;
  if(!cap.sample){toast('O Claude não está disponível nesta página. Use Aprovar ou Reprovar.');return}
  const m=$('#modal');m.innerHTML='<div class="box" style="max-width:560px" role="dialog" aria-modal="true" aria-labelledby="vT"></div>';m.hidden=false;const box=$('#modal .box');
  const expl=[];let evT=null,imgs=null,anterior=null;
  const run=async()=>{
  const G=genAnim(box,{art:'val',title:(expl.length?'Revalidando o ':'Validando o ')+c.codigo,sub:expl.length?'O Claude está reavaliando o resultado com a sua explicação.':'O Claude está comparando o resultado obtido com o esperado.',steps:[expl.length?'Lendo a sua explicação':'Lendo a resposta e as evidências','Comparando com o esperado e a atividade','Classificando o resultado']});
  try{const lim=aiLimits?.images;
    if(!evT){evT=[];imgs=[];for(const eid of (c.evidencias||[])){const e=S.evidencias.find(x=>x.id===eid);if(!e)continue;
      if(isImg(e)){if(lim&&imgs.length<(lim.maxCount||0)){try{const bl=await (await fetch(evUrl(e))).blob();if((!lim.mediaTypes||lim.mediaTypes.includes(bl.type))&&(!lim.maxInputBytes||bl.size<=lim.maxInputBytes))imgs.push(bl)}catch(err){}}continue}
      if(/pdf/.test(e.tipo||''))continue;try{evT.push(evidenceTextFromString(await (await fetch(evUrl(e))).text(),e.nome).slice(0,20000))}catch(err){}}}
    G.step(1);
    const disc=expl.length?`\n\nSua análise anterior foi "${RES[anterior.res]}": ${anterior.motivo}\nO tester NÃO concordou e explicou o conceito/regra abaixo:\n${expl.map((x,i)=>`${i+1}. ${x}`).join('\n')}\nTrate a explicação do tester como a regra correta do sistema e do negócio e reavalie o resultado com ela. No "motivo", diga em uma ou duas frases o que mudou na sua conclusão por causa da explicação (ou, se ainda divergir, o ponto exato que falta esclarecer).`:'';
    const rt=retTxt(c);const dtx=await docsText(a,40000);
    const prompt=`Você valida resultados de teste. ${EVID_RULE} ${ctxFull()}\n\n${orientTxt(a)}Atividade: ${a.titulo}\nDescrição (Artia):\n${(a.descricao||'').slice(0,20000)}\n\n${dtx?'Trechos da documentação anexada à sprint:\n'+dtx+'\n\n':''}Cenário ${c.codigo} — ${c.titulo}\nInstrução: ${c.pergunta}\nEsperado: ${c.esperado||''}\n\nResultado obtido pelo tester:\n${resposta||'(sem texto)'}\n\n${rt?rt+'\n\n':''}${evT.length?'Evidências:\n'+evT.join('\n\n'):''}${imgs.length?`\n\n(${imgs.length} print(s) anexado(s) seguem como imagem.)`:''}${disc}\n\nCompare o obtido com o esperado e com a atividade. A referência é a descrição da atividade: se o resultado segue a atividade mas diverge da documentação, classifique pela atividade e cite a divergência (o que diz a atividade e o que diz a documentação, com o nome do documento) no "motivo". Classifique:\n- "aprovado": o comportamento bate com o esperado.\n- "reprovado": a aplicação claramente faz algo diferente do que a atividade pede (bug).\n- "validar": há divergência que depende de decisão do dev, do analista ou do GPU (regra não clara, retorno fora do PTU, comportamento não descrito).\nSe faltar dado essencial para decidir, pergunte ao tester com a ferramenta. Responda APENAS com JSON {"resultado":"aprovado|reprovado|validar","motivo":"uma ou duas frases objetivas citando o que foi obtido x esperado","obtido":"","esperado":""}.`;
    const r=await aiJ('validar',prompt,{modelTier:'default',images:imgs.length?imgs:undefined,tools:[askTool('Validando '+c.codigo)]});
    G.step(2);const res=['aprovado','reprovado','validar'].includes(r?.resultado)?r.resultado:'validar';const motivo=String(r?.motivo||'');G.done();
    box.classList.remove('genbox');
    box.innerHTML=`<b id="vT" style="font-size:17px">Resultado do ${esc(c.codigo)}</b><div class="verdict"><div><span class="pill vpill r-${res}">${RES[res]}</span>${expl.length?` <span class="small muted">· reavaliado com a sua explicação</span>`:''}</div><div>${inlineCode(motivo)}</div>${r?.obtido||r?.esperado?`<div class="small">${r.obtido?`<div><b>Obtido:</b> ${inlineCode(r.obtido)}</div>`:''}${r.esperado?`<div><b>Esperado:</b> ${inlineCode(r.esperado)}</div>`:''}</div>`:''}</div>
    <label class="small" style="display:grid;gap:4px">Não concorda? Explique o que o Claude não considerou e o conceito ou regra por trás. Ele reavalia o cenário e guarda a explicação para a sprint.<textarea id="vDisc" rows="3" placeholder="Ex.: o retorno 4002 é o esperado quando o e-mail_usuario não existe no GPU; não é bug do CRM"></textarea></label>
    <div class="row"><span class="small muted grow" id="vHint">Concorda? Clique em OK para registrar como ${esc(RES[res])}.</span><button class="pri" id="vOk">OK</button></div>`;
    const ta=$('#vDisc'),ok=$('#vOk');
    ta.oninput=()=>{const t=!!ta.value.trim();ok.textContent=t?'Enviar ao Claude':'OK';$('#vHint').textContent=t?'O Claude vai reavaliar com a sua explicação.':'Concorda? Clique em OK para registrar como '+RES[res]+'.'};
    ta.onkeydown=e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();ok.click()}};
    ok.onclick=async()=>{const t=ta.value.trim();
      if(t){btnLoad(ok,true);ta.readOnly=true;
        if(st.sprint&&cap.db){try{await cap.db.collection('contexto').add({sprintId:st.sprint,pergunta:`Regra explicada ao validar o ${c.codigo} da atividade "${String(a.titulo).slice(0,200)}"`,resposta:t.slice(0,6000),origem:'validar-cenario',criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||''})}catch(err){}}
        expl.push(t);anterior={res,motivo};run();return}
      btnLoad(ok,true);await saveResult(a,id,res,resposta,{analise:{resultado:res,motivo,obtido:String(r?.obtido||''),esperado:String(r?.esperado||''),em:nowISO(),confirmado:true,explicacoesTester:expl.slice()}});m.hidden=true};
    setTimeout(()=>ok.focus(),30)
  }catch(e){G.fail('Não foi possível validar: '+(e.code||e.message))}};
  run()}

/* ---------- blocos de código com botão de copiar ---------- */
function hl(code,lang){const rx=lang==='json'?/("(?:\\.|[^"\\])*")(\s*:)?|(-?\b\d+(?:\.\d+)?\b)|\b(true|false|null)\b/g:lang==='sql'?/('(?:''|[^'])*')|\b(SELECT|FROM|WHERE|AND|OR|NOT|IN|IS|NULL|LIKE|ORDER|BY|GROUP|HAVING|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|DESC|ASC|FETCH|FIRST|NEXT|ROWS|ONLY|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|ALTER|TABLE|VIEW|WITH|DISTINCT|COUNT|MAX|MIN|NVL|CASE|WHEN|THEN|ELSE|END|BETWEEN|EXISTS|UNION|ALL|COMMIT|ROWNUM|SYSDATE|TRUNC|TO_CHAR|TO_DATE)\b|(\b\d+\b)/gi:null;
  if(!rx)return esc(code);let out='',last=0,m;
  while((m=rx.exec(code))){out+=esc(code.slice(last,m.index));
    if(lang==='json'){if(m[1])out+=m[2]?`<span class="hk">${esc(m[1])}</span>${esc(m[2])}`:`<span class="hs">${esc(m[1])}</span>`;else if(m[3])out+=`<span class="hn">${esc(m[3])}</span>`;else out+=`<span class="hb">${esc(m[4])}</span>`}
    else{if(m[1])out+=`<span class="hs">${esc(m[1])}</span>`;else if(m[2])out+=`<span class="hq">${esc(m[2])}</span>`;else out+=`<span class="hn">${esc(m[3])}</span>`}
    last=rx.lastIndex}
  return out+esc(code.slice(last))}
function prettyJSON(t){try{const o=JSON.parse(t);return (o&&typeof o==='object')?JSON.stringify(o,null,2):null}catch(e){return null}}
function fmtEmbedded(t){t=String(t??'');let out='',i=0;
  while(i<t.length){const ch=t[i];
    if(ch==='{'||ch==='['){let d=0,q=false,e=false,j=i;for(;j<t.length;j++){const c=t[j];if(e){e=false;continue}if(c==='\\'){e=true;continue}if(c==='"'){q=!q;continue}if(q)continue;if(c==='{'||c==='[')d++;else if(c==='}'||c===']'){d--;if(d===0)break}}
      if(d===0&&j<t.length){const p=prettyJSON(t.slice(i,j+1));if(p!==null){out+=p;i=j+1;continue}}}
    out+=ch;i++}
  return out}
function fmtSQL(q){q=String(q??'').trim();if(!q||/\n/.test(q))return q;
  const lits=[];let x=q.replace(/'(?:''|[^'])*'/g,m=>{lits.push(m);return '\u0001'+(lits.length-1)+'\u0001'}).replace(/\s+/g,' ');
  x=x.replace(/^(\s*SELECT\s+(?:DISTINCT\s+)?)(.*?)(\s+FROM\s)/i,(m,a,cols,f)=>{if(cols.length<=70)return m;const parts=[];let d=0,cur='';for(const ch of cols){if(ch==='(')d++;if(ch===')')d--;if(ch===','&&d===0){parts.push(cur.trim());cur=''}else cur+=ch}parts.push(cur.trim());return a.trim()+' '+parts.join(',\n       ')+f});
  x=x.replace(/\s+(FROM|WHERE|GROUP BY|ORDER BY|HAVING|UNION ALL|UNION|FETCH FIRST|VALUES|SET)\s+/gi,(m,k)=>'\n'+k.toUpperCase()+' ');
  x=x.replace(/\s+((?:LEFT|RIGHT|FULL)(?:\s+OUTER)?\s+JOIN|INNER\s+JOIN|CROSS\s+JOIN|JOIN)\s+/gi,(m,k)=>'\n  '+k.toUpperCase().replace(/\s+/g,' ')+' ');
  let btw=false;x=x.replace(/\s+(BETWEEN|AND|OR)\s+/gi,(m,k)=>{k=k.toUpperCase();if(k==='BETWEEN'){btw=true;return ' BETWEEN '}if(k==='AND'&&btw){btw=false;return ' AND '}return '\n   '+k+' '});
  return x.replace(/\u0001(\d+)\u0001/g,(m,i)=>lits[+i])}
function codeBox(code,lang,copyTxt){code=String(code||'').replace(/\s+$/,'');if(!code)return'';const L=(lang||'texto').toLowerCase();if(L==='json'){const pj=prettyJSON(code);if(pj!==null)code=pj}else if(L==='sql')code=fmtSQL(code);
  return `<div class="codebox${L==='url'?' url':''}"><div class="cbh"><span>${esc(L==='url'?'endpoint':L)}</span><button type="button" class="ib cpy" data-cpy="${esc(copyTxt??code)}" data-tip="Copiar" aria-label="Copiar">${ICO('copy')}</button></div><pre class="code">${hl(code,L)}</pre></div>`}
function inlineCode(line){line=String(line??'');const rx=/`([^`\n]+)`|(\b(?:SELECT\s[^;\n]+?\bFROM\b[^;\n]*;?|UPDATE\s+[\w.]+\s+SET\s[^;\n]+;?|INSERT\s+INTO\s[^;\n]+;?|DELETE\s+FROM\s[^;\n]+;?))|((?:GET|POST|PUT|PATCH|DELETE)\s+https?:\/\/[^\s"'<>)]+|https?:\/\/[^\s"'<>)]+)|(\{[^{}\n]*"[^"\n]+"\s*:[^{}\n]*\})|([“"][^”"\n]{3,200}[”"])|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|(\b\d{10,}\b)/g;
  let out='',last=0,m;while((m=rx.exec(line))){let code=m[1]||m[2]||m[3]||m[4]||m[5]||m[6]||m[7];let tail='';if(m[2]&&!/;$/.test(code)){const t=code.match(/[.,]+$/);if(t){tail=t[0];code=code.slice(0,-tail.length)}}if(m[3]){const t=code.match(/[.,;:]+$/);if(t){tail=t[0];code=code.slice(0,-tail.length)}}
    let copyTxt=m[3]?code.replace(/^(GET|POST|PUT|PATCH|DELETE)\s+/,''):code;let q0='',q1='';if(m[5]){copyTxt=code.slice(1,-1);code=copyTxt;q0='“';q1='”'}
    out+=esc(line.slice(last,m.index))+q0+`<span class="icw"><code class="ic">${esc(code)}</code><button type="button" class="ib cpy icb" data-cpy="${esc(copyTxt)}" data-tip="Copiar" aria-label="Copiar">${ICO('copy')}</button></span>`+q1+esc(tail);last=m.index+m[0].length}
  return out+esc(line.slice(last))}
/* blocos de request (json) e de SELECT recebem um campo para o tester colar o retorno */
function retBox(P,k,label){const id='ret-'+P.cid+'-'+k;const v=String((P.vals||{})[k]||'');
  return `<div class="retbox"><label class="csec" for="${esc(id)}">${esc(label)}</label><textarea id="${esc(id)}" rows="${v?Math.min(10,Math.max(3,v.split('\n').length+1)):3}" data-ret="${esc(P.cid)}|${k}"${P.lock?' readonly class="locked"':''} placeholder="${P.lock?'':label.includes('consulta')?'Rode a consulta acima e cole aqui o resultado (pode copiar direto da grid do banco)':'Envie o request acima e cole aqui o retorno completo da API'}">${esc(v)}</textarea></div>`}
const isSelect=c=>/^\s*(--[^\n]*\n\s*)*(SELECT|WITH)\b/i.test(c);
function blocksOf(t){const a=[];richText(t,{collect:a});return a}
function retTxt(c){const r=c.retornos||{};return blocksOf(c.pergunta).filter(b=>String(r[b.k]||'').trim()).map(b=>b.lang==='json'?`Request enviado pelo tester:\n${b.code}\nRetorno da API colado pelo tester:\n${String(r[b.k]).slice(0,15000)}`:`Consulta executada pelo tester:\n${b.code}\nResultado colado pelo tester:\n${String(r[b.k]).slice(0,15000)}`).join('\n\n')}
function richText(t,opt){const lines=String(t||'').split('\n');const out=[];let buf=[];let i=0;opt=opt||{};let bi=0;
  const box=(code,lang,cp)=>{let h=codeBox(code,lang,cp);if(lang==='json'||(lang==='sql'&&isSelect(code))){const k='b'+(bi++);if(opt.collect)opt.collect.push({k,lang,code});if(opt.paste)h+=retBox(opt.paste,k,lang==='json'?'Retorno da API':'Resultado da consulta')}return h};
  const flush=()=>{while(buf.length&&!buf[buf.length-1].trim())buf.pop();if(buf.length)out.push(`<div class="q">${buf.map(inlineCode).join('\n')}</div>`);buf=[]};
  const depth=s=>{let d=0,q=false,e=false;for(const ch of s){if(e){e=false;continue}if(ch==='\\'){e=true;continue}if(ch==='"'){q=!q;continue}if(q)continue;if(ch==='{'||ch==='[')d++;else if(ch==='}'||ch===']')d--}return d};
  while(i<lines.length){const L=lines[i];let m;
    if((m=L.match(/^\s*```\s*(\w*)\s*$/))){flush();const lang=(m[1]||'').toLowerCase();const code=[];i++;while(i<lines.length&&!/^\s*```\s*$/.test(lines[i]))code.push(lines[i++]);i++;const c=code.join('\n');out.push(box(c,lang||(/^\s*[\[{]/.test(c)?'json':/^\s*(select|with|insert|update|delete|create|alter)\b/i.test(c)?'sql':'texto')));continue}
    if((m=L.match(/^\s*(?:\d+[.)]\s*)?(GET|POST|PUT|PATCH|DELETE)\s+(https?:\/\/\S+)\s*(\(.*\))?\s*$/i))){flush();out.push(codeBox(m[1].toUpperCase()+' '+m[2],'url',m[2])+(m[3]?`<div class="reqnote">${esc(m[3].replace(/^\(|\)$/g,''))}</div>`:''));i++;continue}
    if(/^\s*[\[{]/.test(L)){let d=0;const code=[];let j=i;do{d+=depth(lines[j]);code.push(lines[j]);j++}while(j<lines.length&&d>0);if(d<=0){flush();out.push(box(code.join('\n'),'json'));i=j;continue}}
    if(/^\s*(SELECT|WITH|INSERT\s+INTO|UPDATE|DELETE\s+FROM|MERGE|ALTER|CREATE|BEGIN|DECLARE)\b/i.test(L)){flush();const code=[];let j=i;while(j<lines.length){const x=lines[j];if(code.length&&(!x.trim()||/^\s*\d+[.)]\s/.test(x)))break;code.push(x);j++;if(/;\s*$/.test(x))break}out.push(box(code.join('\n'),'sql'));i=j;continue}
    buf.push(L);i++}
  flush();return out.join('')}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-cpy]');if(!b)return;const txt=b.dataset.cpy;
  try{await navigator.clipboard.writeText(txt);if(b.classList.contains('ic')||b.classList.contains('ib')){const t0=b.dataset.tip;b.dataset.tip='Copiado ✓';b.classList.add('ok');setTimeout(()=>{b.dataset.tip=t0;b.classList.remove('ok')},1600)}else{b.textContent='Copiado ✓';b.classList.add('ok');setTimeout(()=>{b.textContent='Copiar';b.classList.remove('ok')},1600)}}
  catch(err){const pre=b.closest('.codebox')?.querySelector('pre');if(pre){const r=document.createRange();r.selectNodeContents(pre);const sel=getSelection();sel.removeAllRanges();sel.addRange(r)}toast('Código selecionado. Pressione Ctrl+C para copiar.')}});

/* ---------- cancelar cenário ---------- */
function openEditCen(a,cid){const c=S.cenarios.find(x=>x.id===cid);if(!c)return;const m=$('#modal');
  m.innerHTML=`<div class="box" style="max-width:620px" role="dialog" aria-modal="true" aria-labelledby="edT"><b id="edT" style="font-size:17px">Editar o ${esc(c.codigo)}</b><div class="small muted">${esc(c.titulo)}</div>
  <label class="small" style="display:grid;gap:4px">O que impede você de executar este cenário? Escreva a dúvida ou o que precisa mudar.<textarea id="edMot" rows="3" placeholder="Ex.: não existe o botão de atualizar intercâmbio em beneficiário local; não sei qual carteira usar"></textarea></label>
  <div id="edBody"></div>
  <details class="knbox" data-open="edm" style="border:1px solid var(--line);border-radius:10px;padding:10px 12px"><summary><b style="font-size:13px">Editar na mão</b></summary>
    <div style="display:grid;gap:10px;margin-top:12px">
    <label class="small" style="display:grid;gap:4px">Título<input type="text" id="edTit" value="${esc(c.titulo||'')}"></label>
    <label class="small" style="display:grid;gap:4px">Passos<textarea id="edPas" rows="6">${esc(c.pergunta||'')}</textarea></label>
    <label class="small" style="display:grid;gap:4px">Esperado<textarea id="edEsp" rows="2">${esc(c.esperado||'')}</textarea></label>
    <div class="row"><span class="grow"></span><button id="edSave">Salvar alterações</button></div></div></details>
  <div class="row" id="edRow"><span class="grow"></span><button id="edNo">Voltar</button>${cap.sample?'<button class="pri" id="edGo">Pedir ajuste ao Claude</button>':''}</div></div>`;
  m.hidden=false;$('#edMot').focus();$('#edNo').onclick=()=>m.hidden=true;
  $('#edSave').onclick=async e=>{const b=e.currentTarget;const t=$('#edTit').value.trim(),ps=$('#edPas').value.trim(),ex=$('#edEsp').value.trim();
    if(!t||!ps){toast('O cenário precisa de título e passos.');return}
    btnLoad(b,true);try{await cap.db.collection('cenarios').doc(c.id).update({titulo:t,pergunta:ps,esperado:ex,editadoEm:nowISO(),editadoPor:me?.id||null,editadoPorNome:me?.name||''});m.hidden=true;toast(c.codigo+' atualizado.')}
    catch(err){btnLoad(b,false);toast('Não foi possível salvar: '+(err.code||err.message))}};
  const go=$('#edGo');if(!go)return;go.disabled=true;$('#edMot').oninput=()=>{go.disabled=!$('#edMot').value.trim()};
  go.onclick=async()=>{const mot=$('#edMot').value.trim();if(!mot)return;btnLoad(go,true);$('#edMot').readOnly=true;
    $('#edBody').innerHTML='<div class="small"><span class="spin sm"></span> O Claude está relendo a atividade…';
    let r=null;try{r=await aiJ('revisar',`Você revisa cenários de teste de software. ${ctxFull()}

Atividade: ${a.titulo}
Descrição (Artia):
${(a.descricao||'').slice(0,40000)}

${orientTxt(a)}${sprintAtivTxt(a)}Cenário atual:
Código: ${c.codigo}
Título: ${c.titulo}
Passos:
${c.pergunta}
Esperado: ${c.esperado||''}

O tester não conseguiu executar e relatou:
---
${mot}
---

Decida uma ação:
- "ajustar": dá para reescrever o cenário para ficar executável. Corrija passos, dados ou o esperado. Os passos devem ser objetivos, só o que fazer, sem explicar o porquê.
- "duvida_dev": a dúvida depende do desenvolvedor ou do analista e não dá para resolver só com a atividade.
- "manter": o cenário já está correto e dá para executar; explique em uma frase como.
Responda APENAS com JSON {"acao":"ajustar|duvida_dev|manter","titulo":"","passos":"","esperado":"","motivo":"uma frase"}.`,{modelTier:'default'})}
    catch(e){btnLoad(go,false);$('#edMot').readOnly=false;$('#edBody').innerHTML='';toast('O Claude não conseguiu responder: '+(e.code||e.message));return}
    btnLoad(go,false);$('#edRow').hidden=true;const ac=r&&r.acao||'manter';
    const dev=`<button data-ed="dev">Marcar para validar com o dev</button>`,volta=`<button data-ed="volta">Voltar e reescrever</button>`;
    if(ac==='ajustar'){$('#edBody').innerHTML=`<div class="rprop" style="display:grid;gap:8px">${r.motivo?`<div class="small muted">${esc(r.motivo)}</div>`:''}<div><b>${esc(r.titulo||c.titulo)}</b></div>${richText(r.passos||c.pergunta)}${(r.esperado||c.esperado)?`<div class="cexp"><span class="lbl">Esperado</span><span>${inlineCode(r.esperado||c.esperado)}</span></div>`:''}</div>
      <div class="cbtns"><button class="pri" data-ed="aplicar">Aplicar este ajuste</button>${dev}${volta}</div>`}
    else if(ac==='duvida_dev'){$('#edBody').innerHTML=`<div class="trecho">${esc(r.motivo||'Essa dúvida precisa do desenvolvedor.')}</div><div class="cbtns">${dev}${volta}</div>`}
    else{$('#edBody').innerHTML=`<div class="trecho">${esc(r.motivo||'O cenário está correto e dá para executar.')}</div><div class="cbtns">${dev}${volta}</div>`}
    m.querySelectorAll('[data-ed]').forEach(b=>b.onclick=()=>edApply(a,c,mot,r,b.dataset.ed,b))}}
async function edApply(a,c,mot,r,op,btn){const m=$('#modal');
  if(op==='volta'){$('#edBody').innerHTML='';$('#edRow').hidden=false;$('#edMot').readOnly=false;$('#edMot').focus();return}
  btnLoad(btn,true);
  try{
    if(op==='dev'){await cap.db.collection('cenarios').doc(c.id).update({resultado:'validar',resposta:`Dúvida que impediu a execução: ${mot}`,rodada:a.rodada||1,atualizadoEm:nowISO(),atualizadoPor:me?.id||null,atualizadoPorNome:me?.name||''});m.hidden=true;toast(c.codigo+' marcado para validar com o dev.',3800,{kind:'flag'});return}
    const prev={titulo:c.titulo,pergunta:c.pergunta,esperado:c.esperado||''};
    await cap.db.collection('cenarios').doc(c.id).update({titulo:r.titulo||c.titulo,pergunta:r.passos||c.pergunta,esperado:r.esperado??c.esperado??'',editadoEm:nowISO(),editadoPor:me?.id||null,editadoPorNome:me?.name||''});
    cap.db.collection('contexto').add({sprintId:st.sprint,pergunta:`Ajuste pedido no cenário "${c.titulo}" da atividade "${a.titulo}"`,resposta:mot,origem:'editar-cenario',criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||''}).catch(()=>{});
    m.hidden=true;toastUndo(c.codigo+' ajustado.','Desfazer',async()=>{await cap.db.collection('cenarios').doc(c.id).update(prev)})
  }catch(e){btnLoad(btn,false);toast('Não foi possível salvar: '+(e.code||e.message))}}
function openCancel(a,cid){const c=S.cenarios.find(x=>x.id===cid);if(!c)return;const m=$('#modal');
  m.innerHTML=`<div class="box" style="max-width:540px" role="dialog" aria-modal="true" aria-labelledby="cnT"><b id="cnT" style="font-size:17px">Cancelar o ${esc(c.codigo)}?</b><div class="small muted">${esc(c.titulo)}</div>
  <label class="small" style="display:grid;gap:4px">Por que este cenário não precisa ser testado? O Claude guarda o motivo para não gerar de novo.<textarea id="cnMot" rows="3" placeholder="Ex.: o CRM não envia o 027 em contingência, essa tela não existe para protocolo fora do GPU"></textarea></label>
  <div id="cnBody"></div><div class="row" id="cnRow"><span class="grow"></span><button id="cnNo">Voltar</button><button class="pri" id="cnGo">Continuar</button></div></div>`;
  m.hidden=false;$('#cnMot').focus();$('#cnNo').onclick=()=>m.hidden=true;$('#cnGo').disabled=true;$('#cnMot').oninput=()=>{$('#cnGo').disabled=!$('#cnMot').value.trim()};
  $('#cnGo').onclick=async()=>{const mot=$('#cnMot').value.trim();if(!mot){toast('Explique o motivo para o Claude guardar.');$('#cnMot').focus();return}
    const btn=$('#cnGo');btnLoad(btn,true);$('#cnMot').readOnly=true;let chk=null;
    if(cap.sample){$('#cnBody').innerHTML='<div class="small"><span class="spin"></span> O Claude está conferindo se a atividade pede esse teste…</div>';
      try{chk=await aiJ('conferir',`Você confere requisitos de teste. ${ctxFull()}\n\nAtividade: ${a.titulo}\nDescrição (Artia):\n${(a.descricao||'').slice(0,40000)}\n\n${orientTxt(a)}Cenário que o tester quer cancelar:\n${c.codigo} — ${c.titulo}\n${c.pergunta}\nEsperado: ${c.esperado||''}\n\nMotivo do tester: ${mot}\n\nO cenário cobre algo que a descrição da atividade pede explicitamente? (Os comentários dos devs servem só de contexto; não contam como requisito.) Se sim, copie o trecho exato (curto) que pede isso. Responda APENAS com JSON {"requisito":true|false,"trecho":"","explicacao":"uma frase"}.`,{modelTier:'quick'})}catch(e){chk=null}}
    btnLoad(btn,false);
    if(chk&&chk.requisito&&String(chk.trecho||'').trim()){
      $('#cnRow').hidden=true;
      $('#cnBody').innerHTML=`<div style="display:grid;gap:10px"><div>Esse cenário contempla o requisito da atividade no trecho:</div><div class="trecho">"${esc(chk.trecho)}"</div>${chk.explicacao?`<div class="small muted">${esc(chk.explicacao)}</div>`:''}<b>Deseja cancelar?</b>
      <div class="cbtns"><button class="danger" data-cn="sim">Sim, cancelar o cenário</button><button data-cn="nao">Não, manter o cenário</button><button data-cn="obs">Cancelar e inserir observação na atividade</button><button data-cn="dev">Validar com o dev</button></div></div>`;
      m.querySelectorAll('[data-cn]').forEach(b=>b.onclick=()=>doCancel(a,c,mot,b.dataset.cn,chk.trecho,b))}
    else doCancel(a,c,mot,'sim','',btn)}}
async function doCancel(a,c,mot,op,trecho,btn){const m=$('#modal');if(op==='nao'){m.hidden=true;return}btnLoad(btn,true);
  try{
    if(op==='dev'){await cap.db.collection('cenarios').doc(c.id).update({resultado:'validar',resposta:`Cenário possivelmente desnecessário. Motivo do tester: ${mot}${trecho?`\nA atividade pede: "${trecho}"`:''}\nValidar com o dev se o teste é necessário.`,rodada:a.rodada||1,atualizadoEm:nowISO(),atualizadoPor:me?.id||null,atualizadoPorNome:me?.name||''});m.hidden=true;toast(c.codigo+' marcado para validar com o dev. Vira comentário VALIDAR ao finalizar.');return}
    await cap.db.collection('contexto').add({sprintId:st.sprint,pergunta:`Cenário cancelado na atividade "${a.titulo}": ${c.titulo}`,resposta:`Não gerar este teste. Motivo: ${mot}`,origem:'cancelar-cenario',criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||''});
    if(op==='obs'){const obs=((a.observacao||'').trim()+`\n${c.codigo} (${c.titulo}) cancelado: ${mot}${trecho?` — requisito da atividade: "${trecho}"`:''}`).trim();await cap.db.collection('atividades').doc(a.id).update({observacao:obs})}
    for(const k of S.comentarios.filter(x=>(x.cenarios||[]).includes(c.id)))await cap.db.collection('comentarios').doc(k.id).update({cenarios:(k.cenarios||[]).filter(x=>x!==c.id)});
    await cap.db.collection('cenarios').doc(c.id).delete();delete drafts[c.id];m.hidden=true;toast(c.codigo+' cancelado'+(op==='obs'?' e observação registrada na atividade.':'.'))
  }catch(e){toast('Não foi possível cancelar: '+(e.code||e.message));btnLoad(btn,false)}}

/* ---------- atualizar os dados dos cenários para o ambiente atual ---------- */
function ambShort(){const a=ambOf();if(!String(a.unimed||'').trim())return'';
  const d=String(a.destinos||'').trim().split('\n').map(x=>x.split('·').slice(0,2).map(y=>y.trim()).filter(Boolean).join(' ')).filter(Boolean).join(', ');
  return `${a.unimed}${a.nome?' '+a.nome:''}${d?' → '+d:''}`}
function openReDados(a,preSel){const ce=byAtiv('cenarios',a.id);
  if(!ambShort()){toast('Preencha o ambiente e as entidades de teste antes de atualizar os cenários.');return}
  if(!ce.length){toast('Esta atividade ainda não tem cenários.');return}
  const m=$('#modal');
  m.innerHTML=`<div class="box" style="max-width:680px" role="dialog" aria-modal="true" aria-labelledby="rdT"><b id="rdT" style="font-size:17px">Atualizar os dados dos cenários</b>
  <div class="small muted">O Claude troca só os dados dos passos (URL, códigos de Unimed, ANS, carteirinha e nome do beneficiário) pelos do ambiente atual: <b>${esc(ambShort())}</b>. O que o cenário testa, os passos e o esperado continuam iguais. Os resultados já registrados não são apagados.</div>
  <div class="updsum" id="rdList">${ce.map(c=>`<label class="updrow"><input type="checkbox" class="rd-c" value="${esc(c.id)}"${!preSel||preSel.includes(c.id)?' checked':''}><span class="t"><b>${esc(c.codigo)}</b> ${esc(c.titulo)}${(c.resultado||'pendente')!=='pendente'?` <span class="pill r-${c.resultado}">${RES[c.resultado]}</span>`:''}</span></label>`).join('')}</div>
  <div id="rdBody"></div>
  <div class="row" id="rdRow"><span class="grow"></span><button id="rdNo">Cancelar</button><button class="pri" id="rdGo">Atualizar com o Claude</button></div></div>`;
  m.hidden=false;$('#rdNo').onclick=()=>m.hidden=true;
  $('#rdGo').onclick=()=>runReDados(a)}
async function runReDados(a){
  const ids=[...document.querySelectorAll('.rd-c:checked')].map(i=>i.value);
  if(!ids.length){toast('Marque pelo menos um cenário.');return}
  const sel=byAtiv('cenarios',a.id).filter(c=>ids.includes(c.id));
  const box=$('#modal .box');
  const G=genAnim(box,{art:'cen',title:'Atualizando os dados',sub:`Trocando os dados de ${sel.length} cenário(s) para ${ambShort()}.`,steps:['Lendo os cenários e o ambiente','Reescrevendo os dados','Conferindo o que mudou']});
  try{
    G.step(1);
    const prompt=`Você atualiza os dados dos cenários de teste para o ambiente atual. ${ctxFull()}\n\n${orientTxt(a)}Atividade: ${a.titulo}\nDescrição (Artia):\n${(a.descricao||'').slice(0,20000)}\n\nCenários para atualizar:\n${sel.map(c=>`### ${c.codigo} — ${c.titulo}\nPassos:\n${c.pergunta}\nEsperado: ${c.esperado||''}`).join('\n\n')}\n\nReescreva APENAS os dados de ambiente: URL do endpoint, códigos de Unimed (cd_uni_origem, cd_uni_destino, cd_uni_atendimento, cd_unimed), nr_ans, carteirinha (id_benef) e nome do beneficiário, e o que mais for dado do ambiente. Troque pelos dados do ambiente desta sprint e escolha o beneficiário da Unimed correta para o papel de cada cenário.\nMantenha exatamente o mesmo teste: a mesma quantidade e ordem de passos, o mesmo texto das instruções, os mesmos campos do JSON, a mesma consulta SQL (só mudam os valores do WHERE) e o mesmo "esperado". Não acrescente nem remova passos, não mude o que está sendo validado e não reescreva o cenário para "melhorar". Use um nr_transacao_prestadora novo em cada request. Se um cenário não tiver nenhum dado de ambiente para trocar, devolva "mudou": false e repita os passos como estão.\nResponda APENAS com um array JSON [{"codigo":"CT01","mudou":true,"resumo":"o que trocou, em uma frase","pergunta":"passos completos","esperado":"..."}].`;
    const arr=await aiJ('dados',prompt,{modelTier:'default',tools:[askTool('Atualizando os dados dos cenários')]});
    if(!Array.isArray(arr))throw{message:'resposta vazia'};
    G.step(2);const props=[];
    for(const j of arr){const c=sel.find(x=>String(x.codigo).toLowerCase()===String(j.codigo||'').toLowerCase());if(!c)continue;
      const ps=String(j.pergunta||'').trim(),ex=String(j.esperado??c.esperado??'').trim();
      if(!ps)continue;const mudou=j.mudou!==false&&(ps!==String(c.pergunta||'').trim()||ex!==String(c.esperado||'').trim());
      props.push({c,pergunta:ps,esperado:ex,resumo:String(j.resumo||''),mudou})}
    G.done();box.classList.remove('genbox');
    const muda=props.filter(x=>x.mudou);
    box.innerHTML=`<b style="font-size:17px">${muda.length?'Confira antes de aplicar':'Nada para atualizar'}</b>
    <div class="small muted">Ambiente atual: <b>${esc(ambShort())}</b>.</div>
    ${muda.length?`<div style="display:grid;gap:12px;max-height:52vh;overflow:auto">${muda.map(x=>`<div class="rprop"><div class="row"><b>${esc(x.c.codigo)}</b> <span class="small muted">${esc(x.c.titulo)}</span></div>${x.resumo?`<div class="small">${esc(x.resumo)}</div>`:''}${richText(x.pergunta)}${x.esperado?`<div class="cexp"><span class="lbl">Esperado</span><span>${inlineCode(x.esperado)}</span></div>`:''}</div>`).join('')}</div>`:'<div class="small">Os cenários marcados já estão com os dados do ambiente atual.</div>'}
    ${props.length>muda.length?`<div class="small muted">Sem mudança: ${props.filter(x=>!x.mudou).map(x=>esc(x.c.codigo)).join(', ')}.</div>`:''}
    <div class="row"><span class="grow"></span><button id="rdNo2">${muda.length?'Descartar':'Fechar'}</button>${muda.length?'<button class="pri" id="rdOk">Aplicar nos cenários</button>':''}</div>`;
    $('#rdNo2').onclick=()=>{$('#modal').hidden=true};
    const ok=$('#rdOk');if(ok)ok.onclick=async()=>{btnLoad(ok,true);
      try{for(const x of muda){const hist=[...(x.c.historicoCenario||[]),{pergunta:x.c.pergunta||'',esperado:x.c.esperado||'',em:nowISO(),motivo:'dados trocados para '+ambShort()}];
          await cap.db.collection('cenarios').doc(x.c.id).update({pergunta:x.pergunta,esperado:x.esperado,historicoCenario:hist,dadosEm:nowISO(),dadosPor:me?.id||null,dadosAmbiente:ambShort()})}
        $('#modal').hidden=true;toast(muda.length+' cenário(s) com os dados de '+ambShort()+'. Os resultados anteriores continuam guardados.',5200)}
      catch(e){btnLoad(ok,false);toast('Não foi possível aplicar: '+(e.code||e.message))}}
  }catch(e){G.fail('Não foi possível atualizar: '+(e.message||e.code))}}

/* ---------- reteste (nova rodada) e retificação por cenário ---------- */
function openReteste(a,pre){const cur0=S.atividades.find(x=>x.id===a.id)||a;a=cur0;const rod=a.rodada||1;const todos=byAtiv('cenarios',a.id);const sel0=new Set((pre&&pre.length?pre:todos.filter(c=>['reprovado','validar'].includes(c.resultado)).map(c=>c.id)));const m=$('#modal');
  const resL=c=>RES[c.resultado||'pendente']||'Pendente';
  m.innerHTML=`<div class="box" style="max-width:560px" role="dialog" aria-modal="true" aria-labelledby="rtT"><b id="rtT" style="font-size:17px">Iniciar reteste · rodada ${rod+1}</b>
  <div class="small">Use depois que o dev corrigir. Marque os cenários que voltam para teste: eles são zerados (resposta, resultado, retornos e prints). O que foi preenchido na rodada ${rod} fica guardado no histórico do cenário.</div>
  <div class="rtlist" role="group" aria-label="Cenários que voltam para teste">${todos.map(c=>`<label class="chk rtrow"><input type="checkbox" class="rt-c" value="${esc(c.id)}"${sel0.has(c.id)?' checked':''}><span><b>${esc(c.codigo)}</b> ${esc(c.titulo)} <span class="pill r-${esc(c.resultado||'pendente')}">${esc(resL(c))}</span></span></label>`).join('')}</div>
  <label class="small" style="display:grid;gap:4px">Observação<textarea id="rtNota" rows="4" style="min-height:90px;resize:vertical;white-space:pre-wrap" placeholder="Ex.: dev corrigiu o id_uni_abe e o e-mail_usuario"></textarea></label>
  ${ambShort()&&cap.sample?`<label class="chk"><input type="checkbox" id="rtDados" checked><span>Atualizar os dados desses cenários para o ambiente atual (${esc(ambShort())})</span></label>`:''}
  <div class="row"><span class="grow"></span><button id="rtNo">Cancelar</button><button class="pri" id="rtGo">Iniciar reteste</button></div></div>`;
  m.hidden=false;$('#rtNo').onclick=()=>m.hidden=true;
  const upd=()=>{$('#rtGo').disabled=!m.querySelector('.rt-c:checked')};m.querySelectorAll('.rt-c').forEach(x=>x.onchange=upd);upd();
  $('#rtGo').onclick=async()=>{const ids=[...m.querySelectorAll('.rt-c:checked')].map(x=>x.value);const back=todos.filter(c=>ids.includes(c.id));if(!back.length)return;const btn=$('#rtGo');btnLoad(btn,true);const nota=$('#rtNota').value.trim();const nr=rod+1;
    try{for(const c of back){const hist=[...(c.historicoRespostas||[]),{resposta:c.resposta||'',resultado:c.resultado,retornos:c.retornos||{},evidencias:c.evidencias||[],em:c.atualizadoEm||null,por:c.atualizadoPor||null,rodada:c.rodada||rod,refeitoEm:nowISO()}];
        await cap.db.collection('cenarios').doc(c.id).update({resposta:'',resultado:'pendente',retornos:{},retificado:false,rodada:nr,historicoRespostas:hist,evidencias:[],atualizadoEm:null,atualizadoPor:null,atualizadoPorNome:''});delete drafts[c.id]}
      const h=[...(a.historico||[]),{status:'Reteste',em:nowISO(),por:me?.id||null,porNome:me?.name||'',nota:nota||`Reteste de ${back.map(c=>c.codigo).join(', ')}`,rodada:nr}];
      const comDados=!!$('#rtDados')?.checked;
      await cap.db.collection('atividades').doc(a.id).update({status:'Reteste',rodada:nr,historico:h,conclusao:{__delete__:true}});m.hidden=true;toast(`Rodada ${nr} aberta. Refaça os cenários liberados.`);
      if(comDados&&back.length)setTimeout(()=>openReDados(a,back.map(c=>c.id)),400)}
    catch(e){toast('Não foi possível iniciar o reteste: '+(e.code||e.message));btnLoad(btn,false)}}}
async function regenFor(a,c){const rod=a.rodada||1;const coms=S.comentarios.filter(m=>m.atividadeId===a.id&&(m.rodada||1)===rod&&(m.cenarios||[]).includes(c.id));
  const mo=$('#modal');mo.innerHTML='<div class="box"></div>';mo.hidden=false;
  const G=genAnim($('#modal .box'),{title:'Retificando o '+c.codigo,sub:'O Claude está ajustando o comentário deste cenário com a nova resposta.',steps:['Lendo a nova resposta','Reescrevendo o comentário','Salvando']});
  try{
    if(c.resultado==='aprovado'){G.step(1,coms.length?'Cenário aprovado: removendo o comentário':'Cenário aprovado: nada a apontar');
      for(const m of coms){const rest=(m.cenarios||[]).filter(x=>x!==c.id);if(rest.length)await cap.db.collection('comentarios').doc(m.id).update({cenarios:rest});else await cap.db.collection('comentarios').doc(m.id).delete()}}
    else{const evT=[];for(const id of (c.evidencias||[])){const e=S.evidencias.find(x=>x.id===id);if(!e||isImg(e)||/pdf/.test(e.tipo||''))continue;try{evT.push(evidenceTextFromString(await (await fetch(evUrl(e))).text(),e.nome).slice(0,15000))}catch(err){}}
      G.step(1);const prev=S.comentarios.filter(m=>m.atividadeId===a.id&&(m.rodada||1)<rod).map(m=>`- rodada ${m.rodada} | ${CL(m.classificacao).l} | ${m.titulo}`).join('\n');
      const prompt=`Você escreve apontamentos de teste para o Artia. ${COM_RULE} ${EVID_RULE} ${ctxFull()}\n\n${orientTxt(a)}Atividade: ${a.titulo}\nRodada: ${rod}\n\nComentários de rodadas anteriores:\n${prev||'(nenhum)'}\n\nO tester refez o cenário abaixo (o teste anterior estava errado).\n### ${c.codigo} — ${c.titulo}\nResultado marcado: ${RES[c.resultado]}\nInstrução: ${c.pergunta}\nEsperado: ${c.esperado||''}\nNova resposta do tester: ${c.resposta||''}\n${retTxt(c)}\n${evT.join('\n\n')}\n\n${coms.length?'Comentário atual deste cenário (reescreva):\n'+coms.map(m=>commentText(m,numberFor(m))).join('\n\n'):'Ainda não há comentário para este cenário.'}\n\nEscreva UM comentário objetivo no padrão (título "Registro com …" ou da ação; texto "Ao registrar …, a aplicação (comportamento). O esperado é …"). Classificação: VALIDAR se o resultado é "Validar com dev"; BUG-BACK se o mesmo problema já foi apontado em rodada anterior; BUG-ANALISE se o requisito precisa mudar; senão BUG-DEV. Responda APENAS com JSON {"classificacao":"","titulo":"","texto":"","request":"","retornoRequest":"","sql":"","retornoSql":"","obtido":"","esperado":""}.`;
      const j=await aiJ('reescrever',prompt,{modelTier:'default',tools:[askTool('Retificando '+c.codigo)]});G.step(2);
      const data={classificacao:CLASSES.some(k=>k.k===j.classificacao)?j.classificacao:(c.resultado==='validar'?'VALIDAR':'BUG-DEV'),titulo:String(j.titulo||c.titulo),texto:String(j.texto||''),request:String(j.request||''),retornoRequest:String(j.retornoRequest||''),sql:String(j.sql||''),retornoSql:String(j.retornoSql||''),obtido:String(j.obtido||''),esperado:String(j.esperado||''),evidencias:c.evidencias||[],retificadoEm:nowISO()};
      if(coms.length){await cap.db.collection('comentarios').doc(coms[0].id).update(data);for(const m of coms.slice(1)){const rest=(m.cenarios||[]).filter(x=>x!==c.id);if(rest.length)await cap.db.collection('comentarios').doc(m.id).update({cenarios:rest});else await cap.db.collection('comentarios').doc(m.id).delete()}}
      else await cap.db.collection('comentarios').add({...data,sprintId:st.sprint,atividadeId:a.id,rodada:rod,cenarios:[c.id],status:'aberto',ordem:Date.now(),origem:'retificar-cenario',criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||''})}
    G.step(3);await new Promise(r=>setTimeout(r,500));G.done();mo.hidden=true;toast('Comentário do '+c.codigo+' atualizado. Confira no Resumo.')
  }catch(e){G.fail('Não foi possível reescrever o comentário: '+(e.code||e.message))}}

/* ---------- retificar comentário (mini chat com o Claude) ---------- */
const RT={};
function retifBlock(c){const R=RT[c.id];if(!R||!R.open)return'';const p=R.prop;
  const prev=p&&p.acao!=='manter'?(p.acao==='apagar'?`Apagar este comentário.`:commentText({...c,...(p.comentario||{}),evidencias:c.evidencias},numberFor(c))):'';
  return `<div class="retif" id="rt-${esc(c.id)}"><div class="row"><b class="grow">Retificar com o Claude</b>${ib('close','Fechar',`data-rtclose="${esc(c.id)}"`)}</div>
  <div class="rlog">${R.msgs.length?R.msgs.map(m=>`<div class="msg ${m.role}">${esc(m.text)}</div>`).join(''):'<div class="small muted">Diga o que o Claude errou neste comentário ou a regra que ele não sabia. Ele reescreve o comentário ou propõe apagá-lo, se não for mais bug.</div>'}${R.busy?'<div class="msg a"><span class="spin"></span> Analisando…</div>':''}</div>
  ${p&&p.acao!=='manter'&&!R.busy?`<div class="rprop"><b>${p.acao==='apagar'?'Proposta: apagar o comentário':'Proposta: comentário reescrito'}</b><pre>${esc(prev)}</pre><div class="row"><label class="chk grow"><input type="checkbox" id="rtKeep-${esc(c.id)}" checked><span>Lembrar o que eu disse como regra para a sprint</span></label><button data-rtno="${esc(c.id)}">Descartar</button><button class="${p.acao==='apagar'?'danger':'pri'}" data-rtok="${esc(c.id)}">${p.acao==='apagar'?'Confirmar e apagar':'Confirmar e substituir'}</button></div></div>`:''}
  <textarea id="rtIn-${esc(c.id)}" rows="3" placeholder="Ex.: o id_erro 1000 é o retorno padrão do GPU quando não há anexo; não é bug do CRM" ${R.busy?'disabled':''}>${esc(R.draft||'')}</textarea>
  <div class="row"><span class="grow"></span><button class="pri" data-rtsend="${esc(c.id)}" ${R.busy?'disabled':''}>Enviar</button></div></div>`}
function paintRetif(a,cid){const c=S.comentarios.find(x=>x.id===cid);const el=document.getElementById('rt-'+cid);if(!c)return;
  if(el){const tmp=document.createElement('div');tmp.innerHTML=retifBlock(c)||'';const nw=tmp.firstElementChild;if(nw)el.replaceWith(nw);else el.remove()}else render();
  bindRetif($('#pane'),a)}
function bindRetif(pane,a){
  pane.querySelectorAll('[data-retif]').forEach(b=>b.onclick=()=>{const id=b.dataset.retif;RT[id]=RT[id]||{msgs:[],open:false};RT[id].open=true;
    if(!document.getElementById('rt-'+id)){const bal=b.closest('.balloon');const tmp=document.createElement('div');tmp.innerHTML=retifBlock(S.comentarios.find(x=>x.id===id));bal.after(tmp.firstElementChild)}
    bindRetif(pane,a);$('#rtIn-'+CSS.escape(id))?.focus()});
  pane.querySelectorAll('[data-rtclose]').forEach(b=>b.onclick=()=>{const id=b.dataset.rtclose;if(RT[id]){RT[id].open=false;RT[id].draft=$('#rtIn-'+CSS.escape(id))?.value||''}document.getElementById('rt-'+id)?.remove()});
  pane.querySelectorAll('.retif textarea').forEach(t=>{t.oninput=()=>{const id=t.id.slice(5);if(RT[id])RT[id].draft=t.value};t.onkeydown=e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();retifSend(a,t.id.slice(5))}}});
  pane.querySelectorAll('[data-rtsend]').forEach(b=>b.onclick=()=>retifSend(a,b.dataset.rtsend));
  pane.querySelectorAll('[data-rtno]').forEach(b=>b.onclick=()=>{const R=RT[b.dataset.rtno];R.prop=null;R.msgs.push({role:'sys',text:'Proposta descartada. Explique melhor ou feche.'});paintRetif(a,b.dataset.rtno)});
  pane.querySelectorAll('[data-rtok]').forEach(b=>b.onclick=()=>retifApply(a,b.dataset.rtok,b))}
async function retifSend(a,cid){const R=RT[cid];const c=S.comentarios.find(x=>x.id===cid);const ta=$('#rtIn-'+CSS.escape(cid));const txt=(ta?.value||'').trim();if(!R||!c||!txt||R.busy)return;
  R.msgs.push({role:'u',text:txt});R.draft='';R.prop=null;R.busy=true;ta.blur();paintRetif(a,cid);const bz=busy('O Claude está revisando o comentário…');
  try{
    if(!R.data){const cens=(c.cenarios||[]).map(id=>S.cenarios.find(x=>x.id===id)).filter(Boolean);const evT=[];
      for(const id of (c.evidencias||[])){const e=S.evidencias.find(x=>x.id===id);if(!e||isImg(e)||/pdf/.test(e.tipo||''))continue;try{evT.push(evidenceTextFromString(await (await fetch(evUrl(e))).text(),e.nome).slice(0,15000))}catch(err){}}
      R.data=`Atividade: ${a.titulo}\nDescrição (Artia):\n${(a.descricao||'').slice(0,20000)}\n\n${orientTxt(a)}Comentário atual (rodada ${c.rodada}, ${CL(c.classificacao).l}):\n${commentText(c,numberFor(c))}\n\nCenários relacionados:\n${cens.map(x=>`### ${x.codigo} — ${x.titulo}\nInstrução: ${x.pergunta}\nEsperado: ${x.esperado||''}\nResposta do tester: ${x.resposta||''}\n${retTxt(x)}`).join('\n\n')||'(nenhum)'}\n\n${evT.length?'Evidências:\n'+evT.join('\n\n'):''}`.slice(0,60000)}
    const inst=`Você revisa apontamentos de teste para o Artia. ${COM_RULE} ${ctxFull()}\n\n${R.data}\n\nO tester disse que o comentário está errado ou trouxe uma regra que você não sabia. Releia tudo considerando a correção dele. Decida:\n- "atualizar": reescreva o comentário no padrão (título "Registro com …" ou da ação; texto "Ao registrar …, a aplicação (comportamento). O esperado é …"; classificação BUG-DEV, BUG-ANALISE, BUG-BACK ou VALIDAR).\n- "apagar": se, com a correção, não há mais bug a apontar.\n- "manter": se o comentário já está certo; explique por quê.\nResponda APENAS com JSON {"acao":"atualizar|apagar|manter","motivo":"uma ou duas frases para o tester","comentario":{"classificacao":"","titulo":"","texto":"","request":"","retornoRequest":"","sql":"","retornoSql":"","obtido":"","esperado":""}}.`;
    const turns=[];R.msgs.filter(m=>m.role!=='sys').forEach((m,i)=>{if(m.role==='u')turns.push({role:'user',content:(turns.length?'':inst+'\n\n---\n\nCorreção do tester:\n')+m.text+(turns.length?'\n\n(Responda só com o JSON.)':'')});else turns.push({role:'assistant',content:m.raw||m.text})});
    const r=await aiJ('retificar',turns,{modelTier:'default',tools:[askTool('Retificando comentário')]});
    const acao=['atualizar','apagar','manter'].includes(r?.acao)?r.acao:'manter';
    R.prop={acao,comentario:r?.comentario||{}};R.msgs.push({role:'a',text:(r?.motivo||'')+(acao==='manter'?'':' Confira a proposta abaixo.'),raw:JSON.stringify(r)});
  }catch(e){R.msgs.push({role:'sys',text:'Não consegui revisar: '+(e.message||e.code)})}
  finally{R.busy=false;bz.done();paintRetif(a,cid)}}
async function retifApply(a,cid,btn){const R=RT[cid];const c=S.comentarios.find(x=>x.id===cid);if(!R?.prop||!c)return;btnLoad(btn,true);
  const keep=$('#rtKeep-'+CSS.escape(cid))?.checked;const regra=R.msgs.filter(m=>m.role==='u').map(m=>m.text).join('\n');
  try{
    if(keep&&regra&&st.sprint)await cap.db.collection('contexto').add({sprintId:st.sprint,pergunta:'Regra informada ao retificar o comentário "'+String(c.titulo).slice(0,120)+'"',resposta:regra.slice(0,6000),origem:'retificar',criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||''});
    if(R.prop.acao==='apagar'){await cap.db.collection('comentarios').doc(cid).delete();toast('Comentário apagado.')}
    else{const n=R.prop.comentario||{};const up={retificadoEm:nowISO(),retificadoPor:me?.id||null};for(const k of ['titulo','texto','request','retornoRequest','sql','retornoSql','obtido','esperado'])if(typeof n[k]==='string')up[k]=n[k];if(CLASSES.some(x=>x.k===n.classificacao))up.classificacao=n.classificacao;
      await cap.db.collection('comentarios').doc(cid).update(up);toast('Comentário substituído.')}
    delete RT[cid];document.getElementById('rt-'+cid)?.remove()
  }catch(e){toast('Não foi possível aplicar: '+(e.code||e.message));btnLoad(btn,false)}}

/* ---------- finalizar rodada ---------- */
const GSTEPS=['Salvando as respostas','Escrevendo os comentários','Atualizando a situação','Abrindo o Resumo'];
function genAnim(box,opt={}){const STEPS=opt.steps||GSTEPS;box.classList.add('genbox');
  const ART=opt.art==='val'?`<div class="genart sval" aria-hidden="true"><div class="vcol"><small>Esperado</small><i></i><i></i><i></i></div><div class="vmid"><span class="vbadge"><svg class="veq" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9.5h12M6 14.5h12"/></svg><svg class="vok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span></div><div class="vcol"><small>Obtido</small><i></i><i></i><i></i></div></div>`:opt.art==='cen'?`<div class="genart scen" aria-hidden="true"><div class="sdoc"><i></i><i></i><i></i><i></i><i></i><i></i><span class="sscan"></span></div><div class="sflow"><span></span><span></span><span></span></div><div class="scards">${['CT01','CT02','CT03'].map(c=>`<div class="sc"><em>${c}</em><b></b><span class="ck"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span></div>`).join('')}</div></div>`:null;
  box.innerHTML=ART?ART+`<b style="font-size:18px">${esc(opt.title||'')}</b><div class="small muted" id="gSub">${esc(opt.sub||'')}</div>
  <div class="gsteps" role="status" aria-live="polite">${STEPS.map((t,i)=>`<div class="gstep" data-g="${i}"><span class="gi" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span class="tx">${t}</span></div>`).join('')}</div><div id="gErr"></div>`:`<div class="genart" aria-hidden="true"><div class="gb"><i style="background:var(--dev)"></i><b></b></div><div class="gb"><i style="background:var(--back)"></i><b></b></div><div class="gb"><i style="background:var(--val)"></i><b></b></div><span class="gpen"></span></div>
  <b style="font-size:18px">${esc(opt.title||'Gerando o resumo')}</b><div class="small muted" id="gSub">${esc(opt.sub||'O Claude está escrevendo os comentários para o Artia.')}</div>
  <div class="gsteps" role="status" aria-live="polite">${STEPS.map((t,i)=>`<div class="gstep" data-g="${i}"><span class="gi" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span class="tx">${t}</span></div>`).join('')}</div><div id="gErr"></div>`;
  let cur=-1;
  const set=(i,txt)=>{box.querySelectorAll('.gstep').forEach(el=>{const k=+el.dataset.g;el.classList.toggle('ok',k<i);el.classList.toggle('cur',k===i);if(k===i&&txt)el.querySelector('.tx').textContent=txt})};
  set(0);
  return{step(i,txt){if(i>=cur){cur=i;set(i,txt)}},done(){set(STEPS.length);box.classList.remove('genbox')},
    fail(m){box.querySelector('.genart').classList.add('stop');box.querySelectorAll('.gstep.cur').forEach(el=>{el.classList.remove('cur');el.classList.add('fail')});$('#gSub').textContent='';$('#gErr').innerHTML=`<div class="small" style="color:var(--bad);margin-bottom:10px">${esc(m)}</div><button id="gClose">Fechar</button>`;$('#gClose').onclick=()=>{box.classList.remove('genbox');$('#modal').hidden=true}}}}

function finishInfo(a){const rod=a.rodada||1;const ce=byAtiv('cenarios',a.id);const res=c=>(drafts[c.id]?.resultado??c.resultado)||'pendente';const by=k=>ce.filter(c=>res(c)===k);
  const comR=S.comentarios.filter(c=>c.atividadeId===a.id&&(c.rodada||1)===rod);
  const falhas=[...by('reprovado'),...by('validar'),...by('pendente').filter(c=>String(drafts[c.id]?.resposta??c.resposta??'').trim())];const semCom=falhas.filter(c=>!comR.some(m=>(m.cenarios||[]).includes(c.id)));
  return{rod,ce,ok:by('aprovado'),bad:by('reprovado'),val:by('validar'),blk:by('bloqueado'),na:by('na'),pend:by('pendente'),semCom,comCom:falhas.filter(c=>!semCom.includes(c)),dirty:ce.filter(isDirty)}}
function openFinish(a){const f=finishInfo(a);if(f.pend.length){toast('Faltam '+f.pend.map(c=>c.codigo).join(', ')+'. Teste todos os cenários ou cancele os que não se aplicam.',5000,{kind:'warn',title:'Rodada incompleta'});return}const def=f.bad.length||f.val.length?'Reprovada':f.blk.length?'Bloqueada':'';const m=$('#modal');
  const lst=arr=>arr.map(c=>esc(c.codigo)).join(', ');
  m.innerHTML=`<div class="box" style="max-width:560px" role="dialog" aria-modal="true" aria-labelledby="finT"><b id="finT" style="font-size:17px">Finalizar teste · rodada ${f.rod}</b>
  <div class="finsum"><span class="pill r-aprovado">${f.ok.length} aprovados</span><span class="pill r-reprovado">${f.bad.length} reprovados</span><span class="pill r-validar">${f.val.length} validar com dev</span>${f.blk.length?`<span class="pill r-bloqueado">${f.blk.length} bloqueados</span>`:''}${f.na.length?`<span class="pill r-na">${f.na.length} não se aplica</span>`:''}<span class="pill r-pendente">${f.pend.length} pendentes</span></div>
  ${f.pend.length?`<div class="small" style="color:var(--warn)">Ainda sem resultado: ${lst(f.pend)}.</div>`:''}
  ${f.dirty.length?`<div class="small">Respostas não salvas em ${lst(f.dirty)} serão salvas antes.</div>`:''}
  <div class="small">${f.semCom.length?`O Claude vai analisar as respostas e evidências e escrever os comentários de: <b>${lst(f.semCom)}</b>.`:'Nenhum comentário novo para escrever.'}${f.comCom.length?` Já têm comentário nesta rodada: ${lst(f.comCom)}.`:''}</div>
  <label class="small" style="display:grid;gap:4px">Situação da atividade depois desta rodada<select id="finSt">${STATUS.map(s=>`<option${s===def?' selected':''}>${esc(s)}</option>`).join('')}<option value=""${def?'':' selected'}>Não mudar (${esc(a.status||'A testar')})</option></select></label>${def?'':'<div class="small muted">Tudo aprovado. No Resumo, use Concluir testes para o Claude conferir os resultados e aprovar a atividade.</div>'}
  <label class="small" style="display:grid;gap:4px">Observação<input type="text" id="finNota" placeholder="Ex.: rodada ${f.rod} finalizada, enviada para correção"></label>
  <div id="finMsg" class="small muted"></div>
  <div class="row"><span class="grow"></span><button id="finNo">Cancelar</button><button class="pri" id="finGo">Finalizar e ir para o Resumo</button></div></div>`;
  m.hidden=false;$('#finNo').onclick=()=>m.hidden=true;$('#finGo').onclick=()=>doFinish(a,$('#finGo'))}
async function doFinish(a,btn){const stSel=$('#finSt').value,nota=$('#finNota').value.trim();const G=genAnim($('#modal .box'));
  try{
    for(const c of byAtiv('cenarios',a.id))await saveRet(c.id);
    for(const c of byAtiv('cenarios',a.id).filter(isDirty)){G.step(0,'Salvando a resposta de '+c.codigo);const d=drafts[c.id];await cap.db.collection('cenarios').doc(c.id).update({resposta:d.resposta??c.resposta??'',resultado:d.resultado??c.resultado??'pendente',rodada:a.rodada||1,atualizadoEm:nowISO(),atualizadoPor:me?.id||null,atualizadoPorNome:me?.name||''});delete drafts[c.id]}
    G.step(1);const f=finishInfo(a);let criados=0;if(!f.semCom.length)G.step(1,'Nenhum cenário reprovado sem comentário');
    if(f.semCom.length){
      const prev=S.comentarios.filter(c=>c.atividadeId===a.id&&(c.rodada||1)<f.rod).map(c=>`- rodada ${c.rodada} | ${CL(c.classificacao).l} | ${c.titulo}: ${(c.texto||'').slice(0,300)}`).join('\n');
      const evTxt={};for(const c of f.semCom)for(const id of (c.evidencias||[])){const e=S.evidencias.find(x=>x.id===id);if(!e||evTxt[id]!==undefined||isImg(e)||/pdf/.test(e.tipo||''))continue;G.step(1,'Lendo a evidência '+e.nome);try{evTxt[id]=evidenceTextFromString(await (await fetch(evUrl(e))).text(),e.nome).slice(0,20000)}catch(err){evTxt[id]=''}}
      const cens=f.semCom.map(c=>`### ${c.codigo} — ${c.titulo}\nResultado marcado: ${RES[c.resultado||'pendente']}${c.analise?.motivo?'\nAnálise do Claude: '+c.analise.motivo:''}\nInstrução: ${c.pergunta}\nEsperado: ${c.esperado||''}\nResposta do tester: ${c.resposta||'(sem texto)'}\n${retTxt(c)}\nEvidências: ${evNames(c.evidencias||[])||'(nenhuma)'}${(c.evidencias||[]).map(id=>evTxt[id]?'\n'+evTxt[id]:'').join('')}`).join('\n\n').slice(0,60000);
      let arr=null;
      if(cap.sample){G.step(1,`Escrevendo ${f.semCom.length} comentário(s) com o Claude`);
        const prompt=`Você escreve apontamentos de teste para o Artia. ${COM_RULE} ${EVID_RULE} ${ctxFull()}\n\nAtividade: ${a.titulo}\nRodada atual: ${f.rod}\n\n${orientTxt(a)}Comentários de rodadas anteriores:\n${prev||'(nenhum)'}\n\nCenários desta rodada com problema ou com resposta a analisar:\n${cens}\n\nAnalise a resposta do tester e as evidências (requests, responses, exceções do XRebel, resultados de SELECT). Escreva comentários objetivos só para comportamentos errados da aplicação, um comentário por problema; quando o mesmo problema aparecer em mais de um cenário, faça um só comentário e liste os códigos no campo "cenarios" (o campo é interno, não vai para o texto). ${COM_RULE} Se o cenário não pôde ser executado ou passou, não escreva comentário para ele. Cite números de protocolo, códigos de erro e mensagens exatamente como aparecem. Classificação: cenário marcado "Validar com dev" vira VALIDAR; BUG-BACK se o mesmo problema já foi apontado em rodada anterior; BUG-ANALISE se o requisito precisa mudar; senão BUG-DEV. Cenário marcado "Aprovado" não gera comentário. Título curto "Registro com …" ou da ação. Texto: conte só o cenário, na ordem em que aconteceu — onde o tester clicou ou o que enviou, o que a aplicação mostrou na tela, e o que apareceu no XRebel ou no retorno (exceção, classe e linha, id_erro, mensagem). Termine sempre com uma última frase começando por "O esperado é que ", dizendo o comportamento que a atividade pede. Seja direto e factual: nada de justificar para que serve, de explicar o objetivo do requisito, de falar em benefício, em usuário final ou em outra Unimed ("para que a outra Unimed consulte", "garantindo que…", "dessa forma o atendente…"). O dev já conhece a regra; ele quer o cenário e o que corrigir. Sem introdução, sem conclusão e sem repetir o esperado no meio do texto. Inclua o request e a consulta SQL só se estiverem na instrução ou na resposta. Não invente valores. Responda APENAS com um array JSON [{"codigo":"CT01","cenarios":["CT01","CT02"],"classificacao":"BUG-DEV","titulo":"","texto":"","request":"","retornoRequest":"","sql":"","retornoSql":"","obtido":"","esperado":""}] (array vazio [] se não houver problema).`;
        try{arr=await aiJ('finalizar',prompt,{modelTier:'default',tools:[askTool('Finalizando rodada')]})}catch(e){toast('O Claude não conseguiu escrever os comentários ('+(e.code||e.message)+'). Finalize de novo para tentar outra vez.',6000,{kind:'warn'})}}
      const usados=new Set();
      const grava=async(lista,items)=>{for(const j of items){if(!j||typeof j!=='object')continue;const cods=[...new Set([j.codigo,...(Array.isArray(j.cenarios)?j.cenarios:[])].filter(Boolean).map(x=>String(x).toLowerCase()))];const cs=lista.filter(c=>cods.includes(String(c.codigo).toLowerCase()));if(!cs.length)continue;cs.forEach(c=>usados.add(c.id));
        const cl=CLASSES.some(k=>k.k===j.classificacao)?j.classificacao:'BUG-DEV';
        await cap.db.collection('comentarios').add({sprintId:st.sprint,atividadeId:a.id,rodada:f.rod,classificacao:cl,titulo:String(j.titulo||cs[0].titulo),texto:String(j.texto||''),request:String(j.request||''),retornoRequest:String(j.retornoRequest||''),sql:String(j.sql||''),retornoSql:String(j.retornoSql||''),obtido:String(j.obtido||''),esperado:String(j.esperado||''),evidencias:[...new Set(cs.flatMap(c=>c.evidencias||[]))],cenarios:cs.map(c=>c.id),status:'aberto',ordem:Date.now()+criados,origem:'finalizar-rodada',criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||''});criados++}};
      if(Array.isArray(arr))await grava(f.semCom,arr);
      const falt=f.semCom.filter(c=>!usados.has(c.id)&&['reprovado','validar'].includes(c.resultado));
      if(falt.length&&cap.sample){G.step(1,'Analisando de novo '+falt.map(c=>c.codigo).join(', '));
        const cens2=falt.map(c=>`### ${c.codigo} — ${c.titulo}\nResultado marcado: ${RES[c.resultado]}\nInstrução: ${c.pergunta}\nEsperado: ${c.esperado||''}\nResposta do tester (só o que ele viu, não copie): ${c.resposta||'(sem texto)'}\n${retTxt(c)}\nEvidências: ${evNames(c.evidencias||[])||'(nenhuma)'}${(c.evidencias||[]).map(id=>evTxt[id]?'\n'+evTxt[id]:'').join('')}`).join('\n\n').slice(0,50000);
        const p2=`Você escreve apontamentos de teste para o Artia. ${COM_RULE} ${EVID_RULE} ${ctxFull()}\n\nAtividade: ${a.titulo}\n\n${orientTxt(a)}Cenários reprovados ou com validação pendente:\n${cens2}\n\nPara cada cenário, leia as evidências (requests e responses completos, exceções do XRebel, resultados de SELECT, anexos) e descreva o que a aplicação fez de errado e o que era esperado. Não copie a resposta do tester: ela é só o que ele observou. Se a evidência mostrar que o problema está no teste e não na aplicação, não escreva comentário para ele. Responda APENAS com um array JSON no mesmo formato: [{"codigo":"CT01","cenarios":["CT01"],"classificacao":"BUG-DEV","titulo":"","texto":"","request":"","retornoRequest":"","sql":"","retornoSql":"","obtido":"","esperado":""}].`;
        try{const arr2=await aiJ('finalizar',p2,{modelTier:'default',tools:[askTool('Analisando a rodada')]});if(Array.isArray(arr2))await grava(falt,arr2)}catch(e){}}
      const sem=f.semCom.filter(c=>!usados.has(c.id)&&['reprovado','validar'].includes(c.resultado));
      if(sem.length)toast('Não consegui analisar '+sem.map(c=>c.codigo).join(', ')+' a partir das evidências. Finalize de novo ou escreva o comentário manualmente.',7000,{kind:'warn',title:'Comentário pendente'});
    }
    await cap.db.collection('atividades').doc(a.id).update({rodadaFinalizada:f.rod});a.rodadaFinalizada=f.rod;
    if(stSel&&stSel!==(a.status||'A testar')){G.step(2,'Atualizando a situação para '+stSel);await setStatus(a,stSel,nota||`Rodada ${f.rod} finalizada`)}
    G.step(3);await new Promise(r=>setTimeout(r,900));G.done();$('#modal').hidden=true;st.mod='ler';setMod();render();window.scrollTo({top:0,behavior:'smooth'});
    toast(`Rodada ${f.rod} finalizada${criados?` · ${criados} comentário(s) criados`:''}. Revise e copie para o Artia.`,5000)
  }catch(e){G.fail('Não foi possível finalizar: '+(e.code||e.message))}}

/* ---------- perguntas do Claude ao tester ---------- */
const EVID_RULE='O relato do tester é evidência. Ele executou o teste na aplicação e sabe o que viu: quando ele escreve que o comportamento aconteceu ("abri pela tela e vi o anexo", "gravou certo", "a mensagem apareceu", "o campo veio preenchido"), aceite como comprovado, mesmo sem consulta SQL, sem retorno colado e sem print anexado. Falta de consulta, de retorno, de print ou de qualquer evidência anexada NUNCA é motivo para reprovar nem para apontar divergência: muito comportamento se verifica direto na tela e não precisa de consulta. Nunca peça comprovação adicional nem registre que faltou evidência. Só aponte problema quando o que o tester escreveu, ou uma evidência anexada, mostrar de fato algo diferente do esperado.';
const COM_RULE='Regras do texto que vai para o Artia: os devs não conhecem esta ferramenta. Não cite códigos de cenário (CT01, CT02, "passo 6"), rodadas, resultado marcado pelo tester, "Validar com dev", o Claude, a análise do Claude nem nada interno da ferramenta; descreva só o que foi feito na aplicação, o que ela fez e o que era esperado, como o próprio tester escrevendo. Não liste nomes de arquivos de evidência no texto. Cada comentário trata de um único problema e tem uma única classificação: nunca misture no mesmo comentário classificações diferentes (um bug de código e um requisito que precisa mudar viram dois comentários, um BUG-DEV e um BUG-ANALISE) nem problemas diferentes; só junte o mesmo problema visto em mais de um cenário. Quando o tester colou o retorno de um request ou o resultado de uma consulta, use exatamente o que ele colou: "request" com o request enviado e "retornoRequest" com o retorno colado; "sql" com a consulta executada e "retornoSql" com o resultado colado (sem resumir, sem inventar). A ferramenta monta o texto do Artia como "Testado via API com o request: … e obtido o retorno: …" e "Testado com a consulta: … e obtido o retorno: …", então não repita request, retorno nem resultado dentro do "texto". Sem retorno colado, deixe "retornoRequest" e "retornoSql" vazios.';
const PRONTO_RULE='Passos de teste prontos para copiar e colar: sempre que o passo envolver um request, escreva o método, a URL completa e o JSON completo do body já preenchido com os valores do ambiente (cabeçalho e corpo inteiros, indentados), nunca uma lista de campos para o tester montar ou trocar. Sempre que precisar de consulta, escreva o SQL completo e formatado, que rode sem edição (sem placeholders como :ID ou <AUTOID>; use subconsulta, filtro por data enviada ou ORDER BY ... FETCH FIRST 1 ROWS ONLY para achar o registro). O tester só copia, cola e executa.';
const ASK_RULE='Quando tiver dúvida sobre algo que não está na descrição da atividade nem nas respostas já confirmadas (nome de tabela, view ou coluna, ambiente, URL da Unimed de destino, parâmetro de configuração, regra de negócio), chame a ferramenta perguntar_ao_tester com 2 a 5 opções prováveis antes de continuar. Não invente nomes de tabela ou coluna: quando precisar descobrir tabela, view ou coluna, mande no campo "consulta" um SELECT Oracle de descoberta (ex.: em ALL_TAB_COLUMNS, ALL_VIEWS, ALL_TABLES filtrando por nome parecido) para o tester rodar e colar o resultado; não peça para ele procurar sozinho. Faça uma pergunta por vez e só o que for necessário. Se o ambiente da sprint não disser qual é a Unimed local ou quais beneficiários o tester usa, pergunte isso antes de montar os cenários: nunca suponha a carteirinha nem a Unimed a partir da descrição da atividade, porque ali é só exemplo.';
function ctxFull(){const k=S.contexto.filter(x=>x.resposta).map(x=>`- ${x.pergunta} → ${String(x.resposta).slice(0,6000)}`).join('\n');return CONTEXTO+ambTxt()+(k?`\n\nRespostas já confirmadas pelo time nesta sprint (use sem perguntar de novo):\n${k}`:'')+'\n\n'+ASK_RULE+'\n\n'+PRONTO_RULE}
const askQueue=[];let askOpen=null;
function askUser(q){return new Promise(res=>{askQueue.push({q,res});askNext()})}
function askNext(){if(askOpen||!askQueue.length)return;const item=askOpen=askQueue.shift();const {q}=item;const box=$('#ask');const multi=!!q.multipla;const opts=(Array.isArray(q.opcoes)?q.opcoes:[]).map(String).filter(Boolean).slice(0,8);
  box.innerHTML=`<div class="askbox"><div class="from">O Claude precisa de uma informação${q.origem?' · '+esc(q.origem):''}</div><div class="qq" id="askQ">${esc(q.pergunta)}</div>${q.contexto?`<div class="small muted">${esc(q.contexto)}</div>`:''}
  ${opts.length?`<div class="opts" role="${multi?'group':'radiogroup'}" aria-labelledby="askQ">${opts.map((o,i)=>`<label class="opt"><input type="${multi?'checkbox':'radio'}" name="askopt" value="${i}"><span>${esc(o)}</span></label>`).join('')}</div>`:''}
  ${q.consulta?`<div class="askrun"><div class="small"><b>Rode esta consulta e cole o resultado abaixo:</b></div>${codeBox(q.consulta,'sql')}<textarea id="askRes" rows="6" style="font-family:var(--mono);font-size:12px" placeholder="Cole aqui o resultado da consulta (pode copiar direto da grid do banco)"></textarea></div>`:''}
  ${!q.semContexto&&!q.consulta&&(q.tipo==='sql'||/tabela|view|coluna|\bsql\b|select|ddl/i.test(q.pergunta+' '+(q.contexto||'')))?`<div class="sqlimp"><button type="button" id="askSqlBtn">Importar SQL</button><span class="small muted">Cole ou escolha o script da tabela/view (CREATE, DDL ou resultado do ALL_TAB_COLUMNS).</span><div id="askSqlBox" hidden style="display:grid;gap:6px;flex-basis:100%"><textarea id="askSql" rows="7" style="font-family:var(--mono);font-size:12px" placeholder="CREATE TABLE … / CREATE VIEW … / colunas"></textarea><label class="small" style="display:flex;gap:6px;align-items:center">ou arquivo .sql <input type="file" id="askSqlFile" accept=".sql,.txt,.ddl,.csv,text/plain"></label></div></div>`:''}
  <label class="small" style="display:grid;gap:4px">${opts.length?'Outra resposta ou complemento':'Sua resposta'}<input type="text" id="askOther" placeholder="${opts.length?'Opcional se escolheu uma opção':'Escreva a resposta'}"></label>
  ${q.semContexto?'':`<label class="chk"><input type="checkbox" id="askKeep" checked><span>Lembrar esta resposta para a sprint (o Claude não pergunta de novo)</span></label>`}
  <div id="askLate" class="small" style="color:var(--warn)" hidden>O Claude já seguiu sem esta resposta. Se responder agora, ela fica guardada para as próximas vezes.</div>
  <div class="row"><span class="small muted grow">${askQueue.length?askQueue.length+' outra(s) pergunta(s) na fila':''}</span><button class="ghost" id="askSkip">Pular</button><button class="pri" id="askOk">Responder</button></div></div>`;
  box.hidden=false;setTimeout(()=>($('#askRes')||box.querySelector('input[name=askopt]')||$('#askOther')).focus(),30);
  const finish=async ans=>{box.hidden=true;box.innerHTML='';box.onkeydown=null;askOpen=null;
    if(ans&&$keep&&!q.semContexto&&st.sprint&&cap.db){try{await cap.db.collection('contexto').add({sprintId:st.sprint,pergunta:String(q.pergunta).slice(0,500),resposta:ans.slice(0,20000),origem:q.origem||'',criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||''})}catch(e){toast('Não foi possível guardar a resposta: '+(e.code||e.message))}}
    if(item.late&&ans)toast('Resposta guardada para a sprint.');
    item.res(ans?'Resposta do tester: '+ans:'O tester pulou a pergunta. Siga com a opção mais provável e deixe claro qual suposição fez.');askNext()};
  let $keep=true;
  $('#askSkip').onclick=()=>{$keep=false;finish('')};
  $('#askOk').onclick=()=>{const sel=[...box.querySelectorAll('input[name=askopt]:checked')].map(i=>opts[+i.value]);const other=$('#askOther').value.trim();
    const sql=($('#askSql')?.value||'').trim();const res=($('#askRes')?.value||'').trim();
    if(!sel.length&&!other&&!sql&&!res){toast(q.consulta?'Cole o resultado da consulta ou escolha uma opção.':opts.length?'Escolha uma opção, escreva ou importe o SQL.':'Escreva a resposta ou importe o SQL.');return}
    $keep=!!($('#askKeep')&&$('#askKeep').checked)||!!item.late;let ans=[...sel,other].filter(Boolean).join(' · ');
    if(res)ans+=(ans?'\n':'')+'Resultado da consulta '+q.consulta.replace(/\s+/g,' ').slice(0,300)+':\n'+res.slice(0,20000);
    if(sql)ans+=(ans?'\n':'')+'SQL importado pelo tester:\n'+sql.slice(0,20000);
    finish(ans)};
  const sb=$('#askSqlBtn');if(sb)sb.onclick=()=>{const bx=$('#askSqlBox');bx.hidden=false;$('#askSql').focus()};
  const sf=$('#askSqlFile');if(sf)sf.onchange=async()=>{const f=sf.files[0];if(!f)return;try{$('#askSql').value=(await f.text()).slice(0,20000)}catch(e){toast('Não consegui ler o arquivo.')}};
  box.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();$keep=false;finish('')}else if(e.key==='Enter'&&e.target.id==='askOther'){e.preventDefault();$('#askOk').click()}};
  item.markLate=()=>{item.late=true;const l=$('#askLate');if(l)l.hidden=false}}
function askTool(origem){return {name:'perguntar_ao_tester',description:'Abre um pop-up na tela do tester com uma pergunta de múltipla escolha e devolve a resposta dele. Use quando tiver dúvida sobre nome de tabela, view ou coluna, ambiente, URL da Unimed de destino, parâmetro ou regra que não esteja na descrição nem nas respostas já confirmadas. Dê de 2 a 5 opções prováveis; o tester também pode escrever outra resposta.',
  inputSchema:{type:'object',properties:{pergunta:{type:'string',description:'pergunta curta e direta'},contexto:{type:'string',description:'em uma frase, por que precisa saber'},opcoes:{type:'array',items:{type:'string'},description:'2 a 5 respostas prováveis'},multipla:{type:'boolean',description:'true quando mais de uma opção pode valer'},tipo:{type:'string',enum:['geral','sql'],description:'sql quando precisa da estrutura de uma tabela ou view'},consulta:{type:'string',description:'SELECT Oracle que o tester roda para descobrir a tabela/coluna (ex.: SELECT TABLE_NAME, COLUMN_NAME FROM ALL_TAB_COLUMNS WHERE COLUMN_NAME LIKE \'%EMAIL%\' ORDER BY 1,2); ele cola o resultado como resposta'}},required:['pergunta','opcoes']},
  async execute(i,ctx){const pergunta=String(i.pergunta||'').trim();if(!pergunta)throw new Error('pergunta vazia');
    const ja=S.contexto.find(x=>x.resposta&&String(x.pergunta).trim().toLowerCase()===pergunta.toLowerCase());if(ja)return 'Resposta do tester (já confirmada antes): '+ja.resposta;
    const p=askUser({pergunta,contexto:i.contexto?String(i.contexto):'',opcoes:Array.isArray(i.opcoes)?i.opcoes:[],multipla:!!i.multipla,tipo:String(i.tipo||''),consulta:String(i.consulta||'').trim(),origem});
    const item=askOpen&&askOpen.q.pergunta===pergunta?askOpen:askQueue.find(x=>x.q.pergunta===pergunta);
    if(!ctx?.signal)return await p;
    return await Promise.race([p,new Promise(res=>{const on=()=>{const it=askOpen&&askOpen.q.pergunta===pergunta?askOpen:item;if(it&&it.markLate)it.markLate();else if(it)it.late=true;res('O tester não respondeu a tempo. Siga com a opção mais provável e deixe claro a suposição.')};if(ctx.signal.aborted)on();else ctx.signal.addEventListener('abort',on,{once:true})})])}}}
function knowCard(){const k=sorted(S.contexto.filter(x=>x.resposta));
  return `<details class="card knbox" id="knBox"${knOpen?' open':''}><summary><h3 style="display:inline;margin:0">O que o time já confirmou para o Claude</h3> <span class="small muted">(${k.length})</span></summary>  ${k.length?`<div class="kn">${k.map(x=>`<div><span class="grow"><b>${esc(x.pergunta)}</b><br>${esc(x.resposta)}<br><span class="small muted">${esc(nameOf(x.criadoPor,x.criadoPorNome))} · ${fmtDT(x.criadoEm)}</span></span><button class="ghost" data-kdel="${esc(x.id)}">Remover</button></div>`).join('')}</div>`:'<div class="small muted">Nada ainda.</div>'}
  <div class="row" style="margin-top:10px"><input type="text" id="knNew" class="grow" placeholder="Ex.: tabela de usuários é TB_USUARIO, coluna EMAIL"><button id="knAdd">Adicionar</button></div></details>`}
const OPEN={};document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.dataset&&d.dataset.open)OPEN[d.dataset.open]=d.open},true);
let knOpen=false,cenOpen=false;
function bindKnow(pane){const kb=$('#knBox');if(kb)kb.ontoggle=()=>{knOpen=kb.open};pane.querySelectorAll('[data-kdel]').forEach(b=>b.onclick=async()=>{try{await cap.db.collection('contexto').doc(b.dataset.kdel).delete()}catch(e){toast('Não foi possível remover: '+(e.code||e.message))}});
  const add=$('#knAdd');if(add)add.onclick=async()=>{const v=$('#knNew').value.trim();if(!v)return;add.disabled=true;try{await cap.db.collection('contexto').add({sprintId:st.sprint,pergunta:'Informação do time',resposta:v.slice(0,2000),origem:'manual',criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||''});$('#knNew').value=''}catch(e){toast('Não foi possível salvar: '+(e.code||e.message))}finally{add.disabled=false}}}

/* ---------- orientação / comentários dos devs ---------- */
const MODEL_RX=/\b(CREATE\s+(OR\s+REPLACE\s+)?(TABLE|VIEW|SEQUENCE|INDEX|TRIGGER|PACKAGE|PROCEDURE|FUNCTION)|ALTER\s+TABLE|ADD\s+(COLUMN|CONSTRAINT)|DROP\s+(TABLE|COLUMN|VIEW)|RENAME\s+COLUMN|MODIFY\s*\(|INSERT\s+INTO|modelagem|modelo\s+de\s+dados|nova\s+coluna|novo\s+campo\s+na\s+tabela|script\s+(de\s+)?banco)\b/i;
function modelagemTrecho(t){const l=String(t||'').split('\n').find(x=>MODEL_RX.test(x));return l?l.trim().slice(0,200):''}
const modPend=a=>a.validarModelagem&&!a.validarModelagem.ok;
function sprintAtivTxt(a){const all=sorted(S.atividades.filter(x=>(x.sprintId===a.sprintId||!x.sprintId)&&(x.status!=='Cancelada'||x.id===a.id)));const pos=all.findIndex(x=>x.id===a.id);const others=all.filter(x=>x.id!==a.id);if(!others.length)return'';let budget=90000;const parts=[];
  for(const x of others){if(budget<=0)break;const i=all.findIndex(y=>y.id===x.id);const d=String(x.descricao||'').trim().slice(0,Math.min(9000,budget));const o=String(x.orientacao||'').trim().slice(0,3000);const p=`### ${x.titulo} (${pos>=0&&i<pos?'anterior a esta':'posterior a esta'}; situação: ${x.status||'A testar'})\n${d||'(sem descrição)'}${o?`\nComentários dos devs: ${o}`:''}`;budget-=p.length;parts.push(p)}
  return `Outras atividades da mesma sprint. A funcionalidade costuma estar dividida entre elas, então leia todas antes de montar os cenários. Uma atividade pode descrever algo de forma incompleta, desatualizada ou diferente, e outra (em geral posterior) trazer a regra corrigida ou completa: nesse caso siga a versão mais recente ou mais específica e não trate a diferença como erro. Use-as só como contexto: não crie cenários para o que é escopo de outra atividade.\n\n${parts.join('\n\n')}\n\n`}
function orientTxt(a){return orientTxt0(a)+notasTxt(a)}
function orientTxt0(a){const m=modelTxt(a);const t=String(a.orientacao||'').trim();const n=orientPrints(a.id).filter(isImg).length;if(!t&&!n)return m;
  return m+`Comentários dos devs/analistas na atividade (o Artia não exporta no CSV). NÃO são requisitos de teste: não crie cenários só por causa deles. Use como informação para entender e validar o comportamento da aplicação (como foi implementado, regras explicadas, limitações conhecidas) e para decidir se um resultado é bug ou comportamento esperado:\n${t.slice(0,30000)}${modPend(a)?'\nOs devs atualizaram a modelagem nesses comentários; ao montar SQL, use as estruturas novas.':''}${n?`\n(${n} print(s) desses comentários seguem como imagem)`:''}\n\n`}
/* ---------- modelagem: o que o tester precisa mudar no modelo de dados ---------- */
function modelTxt(a){const t=String(a.modelagem||'').trim();if(!t)return'';
  return `Modelagem a revisar nesta atividade, anotada pelo tester (o que precisa mudar no modelo de dados: tabela, coluna, view, insert):\n${t.slice(0,8000)}\nA atividade está em Revisão por causa disso. Se algum cenário ou apontamento depender dessa mudança, trate como requisito a revisar (BUG-ANÁLISE), não como bug de código.\n\n`}
let mdDraft={};
function modelCard(a,reg){const t=String(a.modelagem||'').trim();const pend=modPend(a)&&!!t;
  if(!reg){if(!t)return'';
    return `<details class="card knbox" data-open="mdl"${OPEN.mdl?' open':''}><summary><h3 style="display:inline;margin:0">Modelagem</h3> ${pend?'<span class="pill s-modelagem">a revisar</span>':'<span class="small muted">· revisada</span>'}</summary><div style="white-space:pre-wrap;font-size:13px;margin-top:10px">${esc(t)}</div>${a.modelagemEm?`<div class="small muted" style="margin-top:8px">Anotado por ${esc(nameOf(a.modelagemPor,a.modelagemPorNome))} em ${fmtDT(a.modelagemEm)}</div>`:''}</details>`}
  const val=mdDraft[a.id]??t;const dirty=mdDraft[a.id]!==undefined&&mdDraft[a.id]!==t;
  return `<details class="card knbox" data-open="mdl"${OPEN.mdl||dirty||pend?' open':''}><summary><h3 style="display:inline;margin:0">Modelagem</h3> <span class="small muted">· ${t?(pend?'a revisar':'revisada'):'vazia'}</span></summary>
  <p class="small muted" style="margin:10px 0">O que precisa mudar no modelo de dados desta atividade: tabela, coluna, view, insert. Ao salvar com texto, a atividade vai para <b>Revisão</b> no kanban e o Claude passa a considerar isso nos cenários e nos comentários. Quando estiver resolvido, use "Marcar modelagem como validada" no topo.</p>
  <textarea id="mdTxt" rows="4" placeholder="Ex.: a VW_NOTIFICACAO_PROCESSO_JUD_GPU precisa trazer DATA_REGISTRO e DATA_FECHAMENTO do protocolo">${esc(val)}</textarea>
  <div class="row" style="margin-top:10px"><span class="small muted grow">${a.modelagemEm?`Anotado por ${esc(nameOf(a.modelagemPor,a.modelagemPorNome))} em ${fmtDT(a.modelagemEm)}`:''}</span><button class="pri${!dirty&&a.modelagemEm?' saved':''}" id="mdSave">${!dirty&&a.modelagemEm?'Modelagem salva':'Salvar modelagem'}</button></div></details>`}
function bindModel(pane,a){const ta=$('#mdTxt');if(!ta)return;const btn=$('#mdSave');
  const sync=()=>{const d=ta.value!==(a.modelagem||'');btn.classList.toggle('saved',!d&&!!a.modelagemEm);btn.textContent=!d&&a.modelagemEm?'Modelagem salva':'Salvar modelagem'};
  ta.oninput=()=>{mdDraft[a.id]=ta.value;sync()};
  btn.onclick=async()=>{const v=ta.value.trim();btnLoad(btn,true);
    try{const up={modelagem:v,modelagemEm:nowISO(),modelagemPor:me?.id||null,modelagemPorNome:me?.name||'',
        validarModelagem:v?{em:nowISO(),trecho:v.split('\n')[0].slice(0,200),ok:false,manual:true,por:me?.id||null,porNome:me?.name||''}:null};
      await cap.db.collection('atividades').doc(a.id).update(up);Object.assign(a,up);delete mdDraft[a.id];
      toast(v?'Modelagem salva. A atividade foi para Revisão no kanban.':'Modelagem apagada.',5000,{kind:v?'flag':'ok'})}
    catch(e){toast('Não foi possível salvar: '+(e.code||e.message))}finally{btnLoad(btn,false);sync()}}}

let orDraft={};
function orientCard(a,reg){const t=a.orientacao||'';const ps=orientPrints(a.id);
  if(!reg){if(!t.trim()&&!ps.length)return'';return `<details class="card knbox" id="orBox"${orOpen?' open':''}><summary><h3 style="display:inline;margin:0">Orientação / comentários dos devs</h3></summary><div style="white-space:pre-wrap;font-size:13px;margin-top:10px">${esc(t)}</div>${ps.length?`<div class="prints">${ps.map(e=>`<div class="th"><img src="${esc(evUrl(e))}" alt="${esc(e.nome)}" data-ev="${esc(e.id)}" loading="lazy"></div>`).join('')}</div>`:''}${a.orientacaoEm?`<div class="small muted" style="margin-top:8px">Atualizado por ${esc(nameOf(a.orientacaoPor,a.orientacaoPorNome))} em ${fmtDT(a.orientacaoEm)}</div>`:''}</details>`}
  const val=orDraft[a.id]??t;const dirty=orDraft[a.id]!==undefined&&orDraft[a.id]!==t;
  return `<details class="card knbox" data-open="or"${OPEN.or||dirty?' open':''}><summary><h3 style="display:inline;margin:0">Orientação / comentários dos devs</h3> <span class="small muted">· ${t.trim()?'preenchida':'vazia'}</span></summary>  <textarea id="orTxt" rows="5" placeholder="Ex.: Dev (05/11): o município de residência passa a ser obrigatório quando id_resposta = 3…">${esc(val)}</textarea>
  <div class="prints" style="margin-top:8px"${ps.length?'':' hidden'}>${ps.map(e=>`<div class="th">${isImg(e)?`<img src="${esc(evUrl(e))}" alt="${esc(e.nome)}" data-ev="${esc(e.id)}" loading="lazy">`:`<button data-ev="${esc(e.id)}" style="width:100%;height:100%">${esc(e.nome)}</button>`}<button class="x" data-prdel="${esc(e.id)}" aria-label="Remover ${esc(e.nome)}" data-tip="Remover print">×</button></div>`).join('')}
  </div>
  <div class="row" style="margin-top:10px"><span class="small muted grow">${a.orientacaoEm?`Atualizado por ${esc(nameOf(a.orientacaoPor,a.orientacaoPorNome))} em ${fmtDT(a.orientacaoEm)}`:''}</span><button class="${!dirty&&a.orientacaoEm?'saved':''}" id="orSave">${!dirty&&a.orientacaoEm?'Orientação salva':'Salvar orientação'}</button></div></details>`}
let orOpen=false;
function bindOrient(pane,a){const ob=$('#orBox');if(ob)ob.ontoggle=()=>{orOpen=ob.open};
  const ta=$('#orTxt');if(!ta)return;const btn=$('#orSave');
  const sync=()=>{const dirty=ta.value!==(a.orientacao||'');btn.classList.toggle('saved',!dirty&&!!a.orientacaoEm);btn.textContent=!dirty&&a.orientacaoEm?'Orientação salva':'Salvar orientação'};
  ta.oninput=()=>{orDraft[a.id]=ta.value;sync()};
  btn.onclick=async()=>{btnLoad(btn,true);try{const old=a.orientacao||'';const added=ta.value.startsWith(old)?ta.value.slice(old.length):ta.value.split('\n').filter(l=>!old.includes(l)).join('\n');const mod=modelagemTrecho(added);
    await cap.db.collection('atividades').doc(a.id).update({orientacao:ta.value,orientacaoEm:nowISO(),orientacaoPor:me?.id||null,orientacaoPorNome:me?.name||'',...(mod?{validarModelagem:{em:nowISO(),trecho:mod,ok:false}}:{})});if(mod)toast('Os devs mexeram na modelagem: a atividade ficou marcada com "Validar modelagem".',5000);delete orDraft[a.id];a.orientacao=ta.value;a.orientacaoEm=nowISO();toast('Orientação salva. O Claude passa a usar nos próximos cenários e comentários.')}catch(e){toast('Não foi possível salvar: '+(e.code||e.message))}finally{btnLoad(btn,false);sync()}};
  const f=$('#orFile');if(f)f.onchange=async()=>{const files=[...f.files];f.value='';f.blur();await uploadFiles(files,a.id,'Print de comentário do dev/analista no Artia',{categoria:'orientacao'})};
  const pb=$('#orPaste');if(pb)pb.addEventListener('paste',async ev=>{const files=[...(ev.clipboardData?.items||[])].filter(i=>i.kind==='file').map(i=>i.getAsFile()).filter(x=>x&&/^image\//.test(x.type));if(!files.length){toast('Nenhuma imagem na área de transferência.');return}ev.preventDefault();await uploadFiles(files,a.id,'Print de comentário do dev/analista no Artia',{categoria:'orientacao'})})}

/* ---------- prints da atividade (imagens da descrição no Artia) ---------- */
const printsOf=aid=>byAtiv('evidencias',aid).filter(e=>e.categoria==='artia');
const testEvs=aid=>byAtiv('evidencias',aid).filter(e=>e.categoria!=='artia'&&e.categoria!=='orientacao');
const orientPrints=aid=>byAtiv('evidencias',aid).filter(e=>e.categoria==='orientacao');
function printsStrip(a,reg){const ps=printsOf(a.id);if(!ps.length&&!(reg&&cap.assets))return'';
  return `<div class="prints" aria-label="Prints da atividade">${ps.length||reg?`<div class="lbl" style="flex-basis:100%">Prints da atividade (Artia)${ps.length?' · '+ps.length:''}</div>`:''}${ps.map(e=>`<div class="th">${isImg(e)?`<img src="${esc(evUrl(e))}" alt="${esc(e.nome)}" data-ev="${esc(e.id)}" loading="lazy">`:`<button data-ev="${esc(e.id)}" style="width:100%;height:100%">${esc(e.nome)}</button>`}${reg?`<button class="x" data-prdel="${esc(e.id)}" aria-label="Remover print ${esc(e.nome)}" data-tip="Remover print">×</button>`:''}</div>`).join('')}
  ${reg&&cap.assets?`<div class="pastebox" tabindex="0" id="prPaste" title="Clique e cole com Ctrl+V">Clique aqui e cole o print (Ctrl+V)</div><label class="pastebox" style="cursor:pointer">Escolher imagens<input type="file" id="prFile" accept="image/*" multiple hidden></label><div class="upq" data-upk="pr:${esc(a.id)}"></div>`:''}</div>`}
function bindPrints(pane,a){const f=$('#prFile');if(f)f.onchange=async()=>{const fs=[...f.files];f.value='';await uploadFiles(fs,a.id,'Print da descrição da atividade no Artia',{categoria:'artia',upk:'pr:'+a.id})};
  const pb=$('#prPaste');if(pb){pb.onclick=e=>{if(!e.target.closest('.pzbtn'))pb.focus()};pb.ondragover=e=>{e.preventDefault();pb.classList.add('over')};pb.ondragleave=()=>pb.classList.remove('over');pb.ondrop=async e=>{e.preventDefault();pb.classList.remove('over');const files=[...(e.dataTransfer?.files||[])].filter(f=>/^image\//.test(f.type));if(files.length)await uploadFiles(files,a.id,'Print da descrição da atividade no Artia',{categoria:'artia',upk:'pr:'+a.id})}}if(pb)pb.addEventListener('paste',async ev=>{const files=[...(ev.clipboardData?.items||[])].filter(i=>i.kind==='file').map(i=>i.getAsFile()).filter(f=>f&&/^image\//.test(f.type));if(!files.length){toast('Nenhuma imagem na área de transferência.');return}ev.preventDefault();await uploadFiles(files,a.id,'Print da descrição da atividade no Artia',{categoria:'artia',upk:'pr:'+a.id})});
  pane.querySelectorAll('[data-prdel]').forEach(b=>b.onclick=async ev=>{ev.stopPropagation();const id=b.dataset.prdel;const e=S.evidencias.find(x=>x.id===id);const data=e?(({id:_,...r})=>r)(e):null;try{await cap.db.collection('evidencias').doc(id).delete();toastUndo('Print removido.','Desfazer',async()=>{if(data)await cap.db.collection('evidencias').doc(id).set(data)})}catch(e){toast('Não foi possível remover: '+(e.code||e.message))}})}
async function printImages(a,max){const lim=aiLimits?.images;if(!lim||!a)return{blobs:[],nomes:[]};const n=Math.min(max??lim.maxCount??0,lim.maxCount??0);const blobs=[],nomes=[];
  for(const e of [...orientPrints(a.id),...printsOf(a.id)].filter(isImg)){if(blobs.length>=n)break;try{const b=await (await fetch(evUrl(e))).blob();if(lim.mediaTypes&&!lim.mediaTypes.includes(b.type))continue;if(lim.maxInputBytes&&b.size>lim.maxInputBytes)continue;blobs.push(b);nomes.push(e.nome)}catch(err){}}
  return{blobs,nomes}}
/* ---------- documentação anexada à sprint ---------- */
const docCache={};
async function docBody(d){if(docCache[d.id]!=null)return docCache[d.id];try{docCache[d.id]=await (await fetch(d.url||('/_blob/'+d.assetId))).text()}catch(e){docCache[d.id]=''}return docCache[d.id]}
async function docsText(a,max){const ds=sorted(S.documentos||[]);if(!ds.length)return'';max=max||60000;
  const src=((a?.titulo||'')+'\n'+(a?.descricao||'')+'\n'+(a?.orientacao||''));
  const terms=[...new Set((src.match(/[A-Za-z_][\w\-]{2,}/g)||[]).map(t=>t.toLowerCase()).filter(t=>/[_\d-]/.test(t)||t.length>=7))];
  const chunks=[];for(const d of ds){const t=String(await docBody(d)||'');if(!t.trim())continue;const parts=t.split(/\n{2,}|\n(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9][^\n]{0,80}\n)/);let cur='';
    const push=()=>{if(cur.trim())chunks.push({doc:d,txt:cur,ord:chunks.length});cur=''};
    for(const p of parts){if((cur+'\n'+p).length>2600)push();cur+=(cur?'\n':'')+p}push()}
  const total=chunks.reduce((x,c)=>x+c.txt.length,0);let sel=chunks;
  if(total>max){for(const c of chunks){const low=c.txt.toLowerCase();c.score=terms.reduce((s,t)=>s+(low.includes(t)?(/[_\d-]/.test(t)?3:1):0),0)}
    const by=[...chunks].sort((x,y)=>y.score-x.score);sel=[];let n=0;for(const c of by){if(!c.score)break;if(n+c.txt.length>max)continue;sel.push(c);n+=c.txt.length}sel.sort((x,y)=>x.ord-y.ord)}
  let out='',last=null;for(const c of sel){if(c.doc!==last){out+=`\n\n### Documento: ${c.doc.nome}${c.doc.secao?' ('+c.doc.secao+')':''}\n`;last=c.doc}out+=c.txt+'\n…\n'}return out.trim()}
function docCard(){const ds=sorted(S.documentos||[]);
  return `<details class="card knbox" data-open="docs"${OPEN.docs?' open':''}><summary><h3 style="display:inline;margin:0">Documentação anexada à sprint</h3> <span class="small muted">(${ds.length})</span></summary><p class="small muted" style="margin:10px 0">O Claude confere os cenários contra estes documentos. Quando a atividade divergir de algum deles, o cenário mostra o aviso com o que fala na atividade e o que fala na documentação.</p>
  ${ds.length?`<div class="doclist">${ds.map(d=>`<div><span class="ev"><span class="k">doc</span><span>${esc(d.nome)}</span></span>${d.secao?`<span class="small muted">${esc(d.secao)}</span>`:''}<span class="grow"></span><span class="small muted">${fmtSize(d.tamanho)}</span><button class="ghost" data-docdel="${esc(d.id)}">Remover</button></div>`).join('')}</div>`:'<div class="small muted">Nenhum documento ainda.</div>'}
  ${cap.assets?`<label class="attach" style="margin-top:10px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${TIC.clip}</svg><span>Anexar documento (PDF, TXT, MD, JSON)</span><input type="file" id="docFile" accept=".pdf,.txt,.md,.json,.csv,application/pdf,text/plain" multiple hidden></label>`:''}</details>`}
async function loadScript(src){await new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>ko(new Error('não carregou '+src));document.head.append(s)})}
async function pdfText(file){if(!window.pdfjsLib){await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js')}
  const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;let out='';
  for(let i=1;i<=pdf.numPages;i++){const p=await pdf.getPage(i);const tc=await p.getTextContent();out+=tc.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join('')+'\n'}return out}
function bindDocs(pane){pane.querySelectorAll('[data-docdel]').forEach(b=>b.onclick=async()=>{const d=S.documentos.find(x=>x.id===b.dataset.docdel);const data=d?(({id,...r})=>r)(d):null;try{await cap.db.collection('documentos').doc(b.dataset.docdel).delete();toastUndo('Documento removido.','Desfazer',async()=>{if(data)await cap.db.collection('documentos').doc(d.id).set(data)})}catch(e){toast('Não foi possível remover: '+(e.code||e.message))}});
  const f=$('#docFile');if(f)f.onchange=async()=>{const files=[...f.files];f.value='';for(const file of files){const bz=waitBox('Lendo '+file.name+'…');
    try{const txt=/\.pdf$/i.test(file.name)||file.type==='application/pdf'?await pdfText(file):await toUtf8Text(file);if(!txt.trim())throw new Error('o arquivo não tem texto legível');
      const r=await cap.assets.upload(new Blob([txt],{type:'text/plain'}));await cap.db.collection('documentos').add({sprintId:st.sprint,nome:file.name,secao:'',assetId:r.id,url:r.url,tamanho:txt.length,ordem:Date.now(),criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||''});toast(file.name+' anexado à documentação da sprint.')}
    catch(e){toast('Não foi possível anexar '+file.name+': '+(e.message||e.code))}finally{bz.done()}}}}
async function generate(a,btn){
  if(!await ensureAmb())return;
  const ex=byAtiv('cenarios',a.id).map(c=>c.codigo+' '+c.titulo).join('\n');
  const dtx=await docsText(a,70000);const docNames=(S.documentos||[]).map(d=>d.nome).join(', ');
  const prompt=`Você é analista de testes. ${ctxFull()}\n\nAtividade: ${a.titulo}\n\nDescrição da atividade (Artia):\n${(a.descricao||'').slice(0,60000)}\n\n${orientTxt(a)}${sprintAtivTxt(a)}${dtx?`Documentação anexada à sprint (${docNames}), trechos relevantes:\n${dtx}\n\n`:''}${ex?'Cenários que já existem (não repita):\n'+ex+'\n\n':''}Cada cenário é completo e independente: escreva por extenso todos os passos, requests e SELECTs dele, nunca "os mesmos SELECTs do CT01", "como no cenário anterior" ou "repita o CT02". Seja fiel à atividade: cada cenário testa exatamente o que a descrição da atividade pede, com os campos, valores, condições e mensagens que ela traz. Os dados do ambiente acima (Unimed local, Unimeds de destino, beneficiários, URLs) substituem qualquer exemplo que apareça na atividade. Não acrescente regras que não estão nela e não troque o que ela diz pelo que você acha certo.
${dtx?`Compare a atividade com a documentação anexada. Quando a atividade divergir da documentação (campo, bloco do JSON, obrigatoriedade, valores aceitos, versão, endpoint, código de erro, regra), o cenário continua seguindo a atividade e você registra a divergência no campo "divergencias" daquele cenário: {"documento":"nome exato do documento","secao":"seção ou serviço do documento","ponto":"o assunto em poucas palavras","atividade":"o trecho exato da atividade","documentacao":"o trecho exato da documentação"}. Só registre divergência real e citável; se a atividade não fala de algo que a documentação exige e isso muda o resultado do teste, registre também, com "atividade" vazio. Diferença entre atividades da mesma sprint não é divergência com a documentação. Sem divergência, use [].
`:''}O tester tem pouco tempo: monte o MENOR conjunto de cenários que cobre os critérios de aceite principais (normalmente 2 a 4, no máximo 5). Junte o que puder ser conferido no mesmo teste; não crie cenário de pré-condição, de regressão genérica nem um cenário por tipo de erro. Na "pergunta" escreva só os passos numerados, curtos e no imperativo (o que fazer). Quando aplicável, traga o request de exemplo pronto, com valores que devem funcionar no ambiente (URL, origem/destino, beneficiário e campos conforme a atividade), e o SELECT que confere o resultado no banco. Peça para o tester enviar o request e colar o retorno, e rodar a consulta e colar o resultado: a tela abre um campo para colar logo abaixo de cada bloco de request e de cada SELECT, então não peça para ele escrever o retorno em outro lugar. Coloque cada JSON em um bloco \`\`\`json e cada SQL em um bloco \`\`\`sql, sem texto dentro do bloco; a URL do endpoint fica em uma linha própria no formato "POST https://…". Não explique o porquê nem dê contexto. No "esperado", só o resultado esperado, em uma ou duas frases. Estime em minutos quanto tempo o cenário leva. Responda APENAS com um array JSON de objetos {"codigo":"CT01","titulo":"...","pergunta":"...","esperado":"...","estimativaMin":15,"divergencias":[]}. Escreva em português do Brasil.`;
  const out=$('#genOut');btnLoad(btn,true);out.textContent='';const m=$('#modal');m.innerHTML='<div class="box"></div>';m.hidden=false;
  const G=genAnim($('#modal .box'),{art:'cen',title:'Gerando os cenários',sub:'O Claude está lendo a atividade e montando os testes. Se ele tiver dúvida, vai perguntar aqui.',steps:['Lendo a atividade, a documentação e a orientação dos devs','Olhando os prints da atividade','Escrevendo os cenários','Salvando os cenários']});
  let parou=false,pararRes;const parar=new Promise(r=>pararRes=r);
  {const row=document.createElement('div');row.className='row';row.style.cssText='justify-content:center;margin-top:4px';row.innerHTML='<button type="button" class="danger" id="genStop">Interromper</button>';$('#modal .box').append(row);
   $('#genStop').onclick=()=>{if(parou)return;parou=true;pararRes('__parou');m.hidden=true;btnLoad(btn,false);out.textContent='Geração interrompida. Nenhum cenário foi salvo.';toast('Geração de cenários interrompida.',3600,{kind:'cancel'})}}
  G.step(1);const pi=await printImages(a);if(parou)return;G.step(2,pi.blobs.length?`Escrevendo os cenários (com ${pi.blobs.length} print(s))`:'Escrevendo os cenários');const fullPrompt=prompt+(pi.blobs.length?`\n\nSeguem ${pi.blobs.length} print(s) que estão dentro da descrição da atividade no Artia (${pi.nomes.join(', ')}). Use o que aparece neles (telas, campos, mensagens, regras) para montar os cenários.`:'');
  try{const arr=await Promise.race([aiJ('cenarios',fullPrompt,{model:'claude-sonnet-5-5',modelTier:'complex',images:pi.blobs.length?pi.blobs:undefined,tools:[askTool('Gerando cenários')]}),parar]);
    if(parou||arr==='__parou')return;
    if(!Array.isArray(arr)||!arr.length)throw{message:'resposta vazia'};
    {const sb=$('#genStop');if(sb)sb.closest('.row').remove()}
    G.step(3,`Salvando ${arr.length} cenário(s)`);const base=byAtiv('cenarios',a.id).length;let i=0;
    for(const c of arr){i++;const dv=(Array.isArray(c.divergencias)?c.divergencias:[]).filter(x=>x&&typeof x==='object').map(x=>({documento:String(x.documento||''),secao:String(x.secao||''),ponto:String(x.ponto||''),atividade:String(x.atividade||''),documentacao:String(x.documentacao||'')})).filter(x=>x.atividade||x.documentacao);
      await cap.db.collection('cenarios').add({sprintId:st.sprint,atividadeId:a.id,codigo:String(c.codigo||'CT'+String(base+i).padStart(2,'0')),titulo:String(c.titulo||''),pergunta:String(c.pergunta||''),esperado:String(c.esperado||''),divergencias:dv,estimativaMin:Math.max(1,parseInt(c.estimativaMin)||10),resultado:'pendente',ordem:base+i,rodada:a.rodada||1,origem:'claude',criadoEm:nowISO(),criadoPor:me?.id||null})}
    if((a.status||'A testar')==='A testar')await setStatus(a,'Em teste','Cenários gerados pelo Claude');
    G.step(4);await new Promise(r=>setTimeout(r,500));G.done();m.hidden=true;
    out.textContent=`${arr.length} cenários criados · ${fmtMin(arr.reduce((x,c)=>x+(parseInt(c.estimativaMin)||0),0))} estimados.`;
  }catch(e){if(parou)return;{const sb=$('#genStop');if(sb)sb.closest('.row').remove()}const t=e.code==='not_granted'?'O acesso ao Claude não foi liberado nesta página.':e.code==='rate_limited'?'Muitas chamadas seguidas. Tente de novo em alguns minutos.':'Não foi possível gerar: '+(e.message||e.code);G.fail(t);out.textContent=t}finally{btnLoad(btn,false)}}
async function draftWithClaude(a,cen,btn){
  const prompt=`Você escreve apontamentos de teste para o Artia. ${COM_RULE} ${EVID_RULE} ${ctxFull()}\n\n${orientTxt(a)}Atividade: ${a.titulo}\nCenário ${cen.codigo}: ${cen.titulo}\nInstrução do cenário:\n${cen.pergunta}\nEsperado: ${cen.esperado}\n\nResposta do tester (o que aconteceu):\n${($('#r-'+CSS.escape(cen.id))?.value||cen.resposta||'')}\n${retTxt(cen)}\n\nEscreva o apontamento no padrão: título curto começando com "Registro com …" ou descrevendo a ação; texto objetivo "Ao registrar …, a aplicação (comportamento). O esperado é …". Inclua o request usado (se houver) e uma consulta SQL de validação. Responda APENAS com JSON {"titulo":"","texto":"","request":"","retornoRequest":"","sql":"","retornoSql":"","obtido":"","esperado":""}.`;
  btnLoad(btn,true);$('#cf-msg').textContent='O Claude está rascunhando…';const bz=busy('O Claude está rascunhando o comentário…');
  const unlock=fieldLock(['tit','txt','req','rreq','sql','rsql','obt','esp'].map(i=>$('#cf-'+i)));
  try{const j=await aiJ('rascunho',prompt,{tools:[askTool('Rascunhando comentário de '+cen.codigo)]});for(const [k,id] of [['titulo','tit'],['texto','txt'],['request','req'],['retornoRequest','rreq'],['sql','sql'],['retornoSql','rsql'],['obtido','obt'],['esperado','esp']])if(j[k])$('#cf-'+id).value=j[k];$('#cf-msg').textContent='Rascunho pronto. Revise antes de salvar.'}catch(e){$('#cf-msg').textContent='Não foi possível rascunhar: '+(e.message||e.code)}finally{unlock();btnLoad(btn,false);bz.done()}}

/* ---------- importação ---------- */
const PROC=/question[aá]rio|reuni[aã]o|atualiza[cç][aã]o em|documenta[cç][aã]o da vers|gera[cç][aã]o de war|mensura[cç][aã]o|preparando ambiente|testes da vers|revis[aã]o de requisitos|quebra de requisitos|an[aá]lise dos requisitos|modelo de dados|cancelada/i;
let imp=null;
const canonTit=t=>{let x=String(t||'');const i=x.lastIndexOf('>');if(i>=0)x=x.slice(i+1);return x.replace(/^[^0-9A-Za-zÀ-ÿ]+/,'').trim()};
const normTit=t=>String(t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
function ordKey(t){const c=canonTit(t);const m=c.match(/^(\d+)(?:\.(\d+))?\s*[.)\-]?\s/);return m?[0,+m[1],+(m[2]||0)]:[1,0,0]}
function reordenar(list){return [...list].sort((a,b)=>{const ka=ordKey(a.titulo),kb=ordKey(b.titulo);return ka[0]-kb[0]||ka[1]-kb[1]||ka[2]-kb[2]||(a.ordem??999)-(b.ordem??999)||String(a.titulo).localeCompare(String(b.titulo),'pt',{numeric:true})})}
let UPD=null;

/* ---------- adicionar atividade + comentários e arquivos da atividade ---------- */
const NOTA_MAX_MB=20;
function notasOf(a){const cur=(S.atividades||[]).find(x=>x.id===a.id)||a;return Array.isArray(cur.notas)?cur.notas:[]}
function notasTxt(a){const ns=notasOf(a);if(!ns.length)return'';
  return 'Comentários e arquivos adicionados pelo tester nesta atividade (informação de contexto, não são requisitos de teste):\n'+ns.map(n=>`- ${String(n.txt||'').trim().slice(0,3000)}${(n.arquivos||[]).length?` (arquivos: ${n.arquivos.map(f=>f.nome).join(', ')})`:''}`).join('\n').slice(0,12000)+'\n\n'}
function notasCard(a,reg){const ns=notasOf(a);
  const fh=f=>`<a class="ntf" href="${esc(f.url)}" target="_blank" rel="noopener" download="${esc(f.nome)}">${esc(f.nome)}${f.tam?` <span class="muted">${fmtSize(f.tam)}</span>`:''}</a>`;
  const list=ns.map(n=>`<div class="ntitem"><div class="small muted">${esc(n.porNome||'')}${n.porNome?' · ':''}${esc(new Date(n.em).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}))}${true?`<button class="linkbtn" data-ntdel="${esc(n.id)}" aria-label="Excluir comentário" style="margin-left:8px">Excluir</button>`:''}</div>${n.txt?`<div class="desctext">${esc(n.txt)}</div>`:''}${(n.arquivos||[]).length?`<div class="ntfiles">${n.arquivos.map(fh).join('')}</div>`:''}</div>`).join('');
  const form=true?`<div class="ntform"><textarea id="ntTxt" rows="3" placeholder="Escreva um comentário sobre esta atividade" aria-label="Novo comentário"></textarea>
    <div class="row" style="margin-top:6px;gap:8px;flex-wrap:wrap">${cap.assets?`<label class="attach"><span>Anexar arquivos</span><input type="file" id="ntFiles" multiple hidden></label><span class="small muted" id="ntSel"></span>`:'<span class="small muted">Seu acesso não permite anexar arquivos.</span>'}<span class="grow"></span><button class="pri" id="ntAdd">Adicionar</button></div></div>`:'';
  return `<section class="card"><h3>Comentários e arquivos</h3>${list||'<div class="small muted">Nenhum comentário ainda.</div>'}${form}</section>`}
function bindNotas(pane,a){const add=pane.querySelector('#ntAdd');
  const fi=pane.querySelector('#ntFiles');if(fi)fi.onchange=()=>{const n=fi.files.length;const l=pane.querySelector('#ntSel');if(l)l.textContent=n?n+' arquivo'+(n>1?'s':''):''};
  if(add)add.onclick=async()=>{const txt=(pane.querySelector('#ntTxt').value||'').trim();const files=fi?[...fi.files]:[];
    if(!txt&&!files.length){toast('Escreva um comentário ou escolha um arquivo.');return}
    const big=files.find(f=>f.size>NOTA_MAX_MB*1048576);if(big){toast(big.name+' passa de '+NOTA_MAX_MB+' MB.');return}
    btnLoad(add,true);
    try{const arq=[];for(const f of files){const r=await cap.assets.upload(f);arq.push({id:r.id,nome:f.name,tipo:f.type||r.contentType||'',tam:f.size,url:r.url})}
      const nota={id:'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),txt:txt.slice(0,20000),em:nowISO(),por:me?.id||null,porNome:me?.name||'',arquivos:arq};
      await cap.db.collection('atividades').doc(a.id).update({notas:[...notasOf(a),nota]});toast('Comentário adicionado.')}
    catch(e){btnLoad(add,false);toast('Não foi possível adicionar: '+(e.code||e.message))}};
  pane.querySelectorAll('[data-ntdel]').forEach(b=>b.onclick=async()=>{const prev=notasOf(a);const id=b.dataset.ntdel;
    try{await cap.db.collection('atividades').doc(a.id).update({notas:prev.filter(n=>n.id!==id)});toastUndo('Comentário excluído.','Desfazer',async()=>{await cap.db.collection('atividades').doc(a.id).update({notas:prev})})}catch(e){toast('Não foi possível excluir: '+(e.code||e.message))}})}
function openAddAtiv(){const sp=S.sprints.find(x=>x.id===st.sprint);if(!sp)return;const m=$('#modal');
  m.innerHTML=`<div class="box" style="max-width:620px" role="dialog" aria-modal="true" aria-labelledby="adT"><b id="adT" style="font-size:17px">Adicionar atividade</b><div class="small muted">Na sprint ${esc(sp.nome)}. Depois de criar, abra a atividade para adicionar comentários e arquivos.</div>
  <div class="formgrid"><label class="full">Título<input type="text" id="adTit" placeholder="11. [GPU] Nome da atividade"></label><label class="full">Descrição<textarea id="adDesc" rows="8" placeholder="Cole a descrição da atividade do Artia"></textarea></label><label class="full">Link no Artia (opcional)<input type="url" id="adUrl" placeholder="https://app2.artia.com/…"></label></div>
  <div class="row"><span class="grow"></span><button id="adN">Cancelar</button><button class="pri" id="adY">Adicionar atividade</button></div></div>`;m.hidden=false;
  const close=()=>{m.hidden=true;m.innerHTML=''};$('#adN').onclick=close;setTimeout(()=>$('#adTit').focus(),30);
  $('#adY').onclick=async()=>{const t=$('#adTit').value.trim();if(!t){toast('Informe o título da atividade.');$('#adTit').focus();return}
    const b=$('#adY');btnLoad(b,true);const url=$('#adUrl').value.trim();let d=$('#adDesc').value.trim();if(url)d=(d?d+'\n\n':'')+url;
    const ordem=Math.max(0,...S.atividades.map(x=>+x.ordem||0))+1;
    try{await cap.db.collection('atividades').add({sprintId:sp.id,titulo:t.slice(0,300),descricao:d.slice(0,200000),status:'A testar',rodada:1,ordem,historico:[],novoEm:nowISO(),criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||'',notas:[]});close();toast('Atividade adicionada à sprint.')}
    catch(e){btnLoad(b,false);toast('Não foi possível adicionar: '+(e.code||e.message))}}}
function openUpdSprint(){const sp=S.sprints.find(x=>x.id===st.sprint);if(!sp)return;const m=$('#modal');UPD=null;
  m.innerHTML=`<div class="box" style="max-width:640px" role="dialog" aria-modal="true" aria-labelledby="upT"><b id="upT" style="font-size:17px">Atualizar a sprint</b>
  <div class="small muted">Exporte de novo o CSV da sprint "${esc(sp.nome)}" no Artia e escolha o arquivo (pode ser um PDF, que o Claude lê). As atividades que já estão aqui continuam como estão, com cenários, respostas e comentários. Só entram as que faltam.</div>
  <label class="full drop">Arquivo CSV ou PDF do Artia <input type="file" id="up-file" accept=".csv,text/csv,.pdf,application/pdf"></label>
  <div id="up-sum"></div><div class="row" id="up-row"><span class="grow"></span><button id="up-no">Voltar</button></div></div>`;
  m.hidden=false;$('#up-no').onclick=()=>{m.hidden=true;UPD=null};
  $('#up-file').onchange=async e=>{const f=e.target.files[0];if(!f)return;
    let linhas;try{linhas=await lerLinhas(f)}catch(err){toast('Não foi possível ler '+f.name+': '+(err.message||err.code));e.target.value='';return}
    const atuais=S.atividades;const porFull=new Map(),porCanon=new Map();
    atuais.forEach(a=>{porFull.set(normTit(a.titulo),a);const k=normTit(canonTit(a.titulo));if(!porCanon.has(k))porCanon.set(k,a)});
    const novas=[],renom=[],descMud=[];let iguais=0;
    for(const l of linhas){const ex=porFull.get(normTit(l.titulo))||porCanon.get(normTit(canonTit(l.titulo)));
      if(!ex){novas.push({...l,sel:!PROC.test(l.titulo)});continue}
      let mud=false;
      if(normTit(ex.titulo)!==normTit(l.titulo)){renom.push({a:ex,de:ex.titulo,para:l.titulo});mud=true}
      if(l.descricao&&l.descricao!==(ex.descricao||'')){descMud.push({a:ex,descricao:l.descricao});mud=true}
      if(!mud)iguais++}
    UPD={novas,renom,descMud,iguais};
    const h=[];
    h.push(`<div class="updsum">`);
    if(novas.length){h.push(`<div class="updsec">${novas.length} atividade${novas.length>1?'s':''} nova${novas.length>1?'s':''} — marque as que serão testadas</div>`);
      h.push(novas.map((n,i)=>`<label class="updrow"><input type="checkbox" class="up-c" data-i="${i}"${n.sel?' checked':''}><span class="t">${esc(n.titulo)}</span></label>`).join(''))}
    else h.push(`<div class="updnone">Nenhuma atividade nova no arquivo.</div>`);
    if(renom.length){h.push(`<div class="updsec">${renom.length} com o título mudado no Artia</div>`);
      h.push(`<label class="updrow"><input type="checkbox" id="up-ren" checked><span class="t">Atualizar o título delas aqui</span></label>`);
      h.push(renom.map(r=>`<div class="updrow"><span class="t small muted">${esc(r.de)} → <b>${esc(r.para)}</b></span></div>`).join(''))}
    if(descMud.length){h.push(`<div class="updsec">${descMud.length} com a descrição mudada no Artia</div>`);
      h.push(`<label class="updrow"><input type="checkbox" id="up-desc" checked><span class="t">Atualizar a descrição delas. Cenários, respostas e comentários continuam.</span></label>`);
      h.push(descMud.map(r=>`<div class="updrow"><span class="t small muted">${esc(r.a.titulo)}</span></div>`).join(''))}
    h.push(`<div class="updsec">${iguais} já estão aqui, sem mudança</div></div>`);
    $('#up-sum').innerHTML=h.join('');
    $('#up-row').innerHTML=`<span class="grow"></span><button id="up-no2">Voltar</button><button class="pri" id="up-go">Atualizar sprint</button>`;
    $('#up-no2').onclick=()=>{m.hidden=true;UPD=null};$('#up-go').onclick=()=>doUpdSprint(sp)};
}
function doUpdSprint(sp){if(!UPD)return;const U=UPD;UPD=null;
  const escolhidas=[...document.querySelectorAll('.up-c:checked')].map(i=>U.novas[+i.dataset.i]);
  const fazRen=!!document.querySelector('#up-ren:checked'),fazDesc=!!document.querySelector('#up-desc:checked');
  $('#modal').hidden=true;
  if(!escolhidas.length&&!(fazRen&&U.renom.length)&&!(fazDesc&&U.descMud.length)){toast('Nada a atualizar: a sprint já está em dia.',3600,{kind:'ok'});return}
  toast('As alterações aparecem aqui em instantes. Pode continuar usando o app.',60000,{kind:'info',title:'Atualizando a sprint'});
  (async()=>{let add=0;
    try{
      for(const n of escolhidas){await cap.db.collection('atividades').add({sprintId:sp.id,titulo:n.titulo,descricao:String(n.descricao||'').slice(0,200000),status:'A testar',rodada:1,ordem:999,historico:[],novoEm:nowISO(),criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||''});add++}
      if(fazRen)for(const r of U.renom)await cap.db.collection('atividades').doc(r.a.id).update({titulo:r.para});
      if(fazDesc)for(const r of U.descMud)await cap.db.collection('atividades').doc(r.a.id).update({descricao:String(r.descricao).slice(0,200000)});
      await new Promise(r=>setTimeout(r,700));
      const ord=reordenar(S.atividades);let i=0;
      for(const a of ord){i++;if((a.ordem??null)!==i)await cap.db.collection('atividades').doc(a.id).update({ordem:i})}
      hideToast();render();
      toast(add?`${add} atividade${add>1?'s':''} nova${add>1?'s':''} na sprint, marcada${add>1?'s':''} como Novo.`:'Sprint atualizada.',5200,{kind:'ok',title:'Sprint atualizada'})
    }catch(e){hideToast();toast('Não foi possível atualizar a sprint: '+(e.code||e.message))}})()}
/* lê o arquivo do Artia: CSV (sem Claude) ou PDF (o Claude separa as atividades do texto) */
const isPdfF=f=>/\.pdf$/i.test(f.name)||f.type==='application/pdf';
async function lerLinhas(f){
  if(!isPdfF(f)){const buf=await f.arrayBuffer();let txt=new TextDecoder('utf-8').decode(buf);if(txt.includes(String.fromCharCode(65533)))txt=new TextDecoder('windows-1252').decode(buf);
    const rows=parseCSV(txt);const hdr=rows.shift()||[];const ti=Math.max(0,hdr.findIndex(h=>/t[ií]tulo/i.test(h))),di=hdr.findIndex(h=>/descri/i.test(h));
    return rows.filter(r=>r[ti]&&r[ti].trim()).map(r=>({titulo:r[ti].trim(),descricao:di>=0?(r[di]||'').trim():''}))}
  if(!cap.sample)throw new Error('o Claude não está disponível nesta página');
  const bz=waitBox('Lendo '+f.name+'…');let txt;try{txt=await pdfText(f)}finally{bz.done()}
  txt=String(txt||'').replace(/[ \t]+\n/g,'\n').trim();if(txt.length<20)throw new Error('o PDF não tem texto legível (talvez seja imagem escaneada)');
  const prompt=`Você recebe o texto de um PDF exportado do Artia com as atividades de uma sprint. Separe cada atividade. Devolva SOMENTE JSON no formato {"atividades":[{"titulo":"...","descricao":"..."}]}. Regras: mantenha o título exatamente como está no PDF (com a numeração, se houver); a descrição é todo o texto da atividade, sem resumir nem reescrever; não invente atividades; ignore cabeçalho, rodapé e numeração de página.\n\nTexto do PDF:\n${txt.slice(0,60000)}`;
  const r=await aiJ('geral',prompt,{modelTier:'default'});
  const l=(r&&r.atividades||[]).filter(x=>x&&String(x.titulo||'').trim()).map(x=>({titulo:String(x.titulo).trim(),descricao:String(x.descricao||'').trim()}));
  if(!l.length)throw new Error('não encontrei atividades nesse PDF');return l}
function renderImport(pane){
  pane.innerHTML=`<div class="card"><h1 style="font-size:20px;margin:0 0 6px">Importar sprint do Artia</h1><p class="small muted" style="margin-top:0">Exporte as atividades da sprint em CSV no Artia (colunas Título e Descrição) e escolha o arquivo. Também dá para escolher um PDF: o Claude lê o texto e separa as atividades. Depois de importar, abra cada atividade na aba Testes e peça ao Claude os cenários.</p>
  <div class="formgrid"><label>Nome da sprint<input type="text" id="im-nome" placeholder="[4.117.0] - [Nova Versão GPU]"></label><label>Código<input type="text" id="im-cod" placeholder="344-0F16"></label><label class="full">Link da sprint no Artia<input type="url" id="im-url" placeholder="https://app2.artia.com/…"></label>
  <label class="full drop">Arquivo CSV ou PDF do Artia <input type="file" id="im-file" accept=".csv,text/csv,.pdf,application/pdf"></label></div><div id="im-list" style="margin-top:12px"></div></div>`;
  $('#im-file').onchange=async e=>{const f=e.target.files[0];if(!f)return;
    let linhas;try{linhas=await lerLinhas(f)}catch(err){toast('Não foi possível ler '+f.name+': '+(err.message||err.code));e.target.value='';return}
    imp=linhas.map(r=>({...r,sel:!PROC.test(r.titulo)}));
    $('#im-list').innerHTML=`<div class="lbl">${imp.length} linhas — marque as atividades que serão testadas</div><div style="display:grid;gap:4px;margin:8px 0">${imp.map((r,i)=>`<div class="imrow"><label class="chk" style="flex:1 1 260px"><input type="checkbox" class="im-c" data-i="${i}"${r.sel?' checked':''}><span>${esc(r.titulo)}</span></label>${cap.assets?`<label class="impprint">Prints da atividade <input type="file" accept="image/*" multiple data-imp="${i}"><span id="imp-n-${i}"></span></label>`:''}</div>`).join('')}</div>${cap.assets?'<p class="small muted" style="margin:0 0 10px">O CSV do Artia não traz as imagens da descrição. Anexe os prints de cada atividade aqui; eles ficam na atividade e o Claude olha para eles ao gerar os cenários. Dá para anexar depois também, no topo da atividade na aba Testes.</p>':''}<button class="pri" id="im-go">Importar sprint</button> <span id="im-msg" class="small muted"></span>`;
    document.querySelectorAll('[data-imp]').forEach(inp=>inp.onchange=()=>{const r=imp[+inp.dataset.imp];r.prints=[...inp.files];$('#imp-n-'+inp.dataset.imp).textContent=r.prints.length?r.prints.length+' print(s)':'';if(r.prints.length){r.sel=true;const c=document.querySelector('.im-c[data-i="'+inp.dataset.imp+'"]');if(c)c.checked=true}});
    $('#im-go').onclick=doImport};
}
function parseCSV(t){const rows=[];let row=[],f='',q=false;const sep=(t.split('\n')[0].match(/;/g)||[]).length>=(t.split('\n')[0].match(/,/g)||[]).length?';':',';
  for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=ch}else if(ch==='"')q=true;else if(ch===sep){row.push(f);f=''}else if(ch==='\n'){row.push(f.replace(/\r$/,''));rows.push(row);row=[];f=''}else f+=ch}
  if(f||row.length){row.push(f);rows.push(row)}return rows}
async function doImport(){const nome=$('#im-nome').value.trim();if(!nome){$('#im-msg').textContent='Informe o nome da sprint.';return}
  const chosen=[...document.querySelectorAll('.im-c:checked')].map(i=>imp[+i.dataset.i]);if(!chosen.length){$('#im-msg').textContent='Marque pelo menos uma atividade.';return}
  btnLoad($('#im-go'),true);$('#im-msg').textContent='Importando…';const bz=waitBox('Importando a sprint…');
  try{const sref=await cap.db.collection('sprints').add({nome,codigo:$('#im-cod').value.trim(),artiaUrl:$('#im-url').value.trim(),criadoEm:nowISO(),criadoPor:me?.id||null});
    let i=0,np=0;for(const r of chosen){i++;$('#im-msg').textContent=`Importando ${i} de ${chosen.length}…`;const aref=await cap.db.collection('atividades').add({sprintId:sref.id,titulo:r.titulo,descricao:r.descricao.slice(0,200000),status:'A testar',rodada:1,ordem:i,historico:[],criadoEm:nowISO()});
      if(r.prints&&r.prints.length){const ids=await uploadFiles(r.prints,aref.id,'Print da descrição da atividade no Artia',{sprintId:sref.id,categoria:'artia',quiet:true});np+=ids.length}}
    if(np)toast(np+' print(s) anexado(s) às atividades.');
    st.sprint=sref.id;st.ativ=null;subSprint=null;saveUI();subscribeSprint();toast('Sprint importada com '+chosen.length+' atividades.');$('#screen').dataset.v='';location.hash=hashFor('kanban')}catch(e){$('#im-msg').textContent='Não foi possível importar: '+(e.code||e.message);btnLoad($('#im-go'),false)}finally{bz.done()}}

/* ---------- assistente de testes ---------- */
let aiLimits=null;
const AI={msgs:[],ev:[],pend:[],busy:false};
const aiAct=()=>S.atividades.find(a=>a.id===st.ativ);
function aiCtx(){const a=aiAct();$('#aiCtx').textContent=a?'Atividade: '+a.titulo+' · rodada '+(a.rodada||1):'Escolha uma atividade na lista para dar contexto ao assistente.'}
function aiAdd(role,text){const d=document.createElement('div');d.className='msg '+role;d.textContent=text;$('#aiLog').append(d);$('#aiLog').scrollTop=1e9;return d}
function aiWelcome(){aiAdd('a','Estou vendo a atividade aberta na tela. Me conte o que está testando, cole o print ou anexe o XRebel/log. Vamos tentar fazer funcionar; se for comportamento da aplicação, eu proponho registrar o apontamento com a evidência vinculada.')}
function aiChips(){$('#aiChips').innerHTML=AI.pend.map(p=>`<span class="ev"><span class="k">${p.isImg?'img':esc((p.nome.split('.').pop()||'').slice(0,4))}</span><span>${esc(p.nome)}</span></span>`).join('')+(AI.ev.length?`<span class="small muted">${AI.ev.length} evidência(s) nesta conversa</span>`:'')}
$('#aiFab').onclick=()=>{$('#ai').hidden=false;$('#aiFab').hidden=true;aiCtx();if(!$('#aiLog').children.length)aiWelcome();$('#aiIn').focus()};
$('#aiClose').onclick=()=>{$('#ai').hidden=true;$('#aiFab').hidden=false};
$('#aiClear').onclick=()=>{AI.msgs=[];AI.ev=[];AI.pend=[];$('#aiLog').innerHTML='';aiChips();aiWelcome()};
$('#aiSend').onclick=()=>aiSend();
$('#aiIn').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();aiSend()}});
$('#aiIn').addEventListener('paste',e=>{const fs=[...(e.clipboardData?.items||[])].filter(i=>i.kind==='file').map(i=>i.getAsFile()).filter(Boolean);if(!fs.length)return;e.preventDefault();aiAttach(fs)});
$('#aiFile').onchange=e=>{aiAttach([...e.target.files]);e.target.value=''};

function unesc(s){try{return JSON.parse('"'+s+'"')}catch(e){return s}}
function evidenceTextFromString(t,nome){
  if(/__xrRequests|XRebel/.test(t.slice(0,6000))){const out=[];
    const ex=[...t.matchAll(/"exceptions":\[\{"id":"[^"]+","requestId":"[^"]+","message":"((?:[^"\\]|\\.){0,1500})/g)].map(m=>unesc(m[1]).replace(/<EOL>/g,'\n'));
    [...new Set(ex)].forEach(x=>out.push('Exceção: '+x));
    for(const m of t.matchAll(/"url":"(https:\/\/[^"]*(?:unimed\.coop|jmjsistemas)[^"]*)"/g)){if(/token/.test(m[1]))continue;const seg=t.slice(m.index,m.index+9000);const rb=seg.match(/"requestBody":"((?:[^"\\]|\\.)*)"/),rp=seg.match(/"responseBody":"((?:[^"\\]|\\.)*)"/);out.push('Chamada '+m[1]+'\nRequest: '+(rb?unesc(rb[1]):'-')+'\nResponse: '+(rp?unesc(rp[1]):'-'))}
    const ora=t.match(/ORA-\d{5}[^"\\]{0,160}/);if(ora)out.push('Erro Oracle: '+ora[0]);
    const eps=[...new Set([...t.matchAll(/"sourceInfo":\{"type":"http","method":"([A-Z]+)","url":"(\/crm\/[^"]+)"/g)].map(m=>m[1]+' '+m[2]))].slice(0,40);if(eps.length)out.push('Chamadas da aplicação: '+eps.join(' | '));
    return ('Resumo do XRebel '+nome+':\n'+(out.join('\n\n')||'(nada relevante encontrado)')).slice(0,40000)}
  if(t.length>40000){const ls=t.split('\n').filter(l=>/ERROR|ORA-|id_erro|mensagem|Exception:/.test(l)&&!/^\s*at /.test(l));return ('Linhas de erro de '+nome+':\n'+ls.slice(0,250).join('\n')).slice(0,40000)}
  return t}
async function aiAttach(files){const a=aiAct();if(!a){toast('Escolha uma atividade antes de anexar.');return}
  for(const f of files){const isImg=/^image\//.test(f.type);const nome=f.name||('print-'+Date.now()+'.png');const ids=await uploadFiles([f],a.id,'Enviado ao assistente de testes');let text=null;
    if(!isImg&&!/\.pdf$/i.test(nome)&&f.type!=='application/pdf'){try{text=evidenceTextFromString(await toUtf8Text(f),nome)}catch(e){}}
    AI.pend.push({nome,isImg,blob:f,text});if(ids[0])AI.ev.push(ids[0])}
  aiChips()}
function aiSnapshot(a){if(!a)return'Nenhuma atividade selecionada.';
  const ce=byAtiv('cenarios',a.id).map(c=>{const r=retTxt(c);return `- ${c.codigo} [${RES[c.resultado||'pendente']}] ${c.titulo} | esperado: ${c.esperado||''}${c.resposta?' | resposta: '+c.resposta.slice(0,300):''}${r?'\n'+r.slice(0,3000):''}`}).join('\n');
  const cs=S.comentarios.filter(c=>c.atividadeId===a.id).map(c=>`- id ${c.id} | rodada ${c.rodada} | ${CL(c.classificacao).l} | ${CST[c.status||'aberto']} | ${c.titulo}`).join('\n');
  const ev=byAtiv('evidencias',a.id).map(e=>`- ${e.id}: ${e.nome}${e.descricao?' ('+e.descricao+')':''}`).join('\n');
  return `Atividade: ${a.titulo}\nSituação: ${a.status||'A testar'} · rodada ${a.rodada||1}\n${a.observacao?'Observação: '+a.observacao+'\n':''}\nDescrição (Artia):\n${(a.descricao||'').slice(0,20000)}\n\nCenários:\n${ce||'(nenhum)'}\n\nComentários já registrados:\n${cs||'(nenhum)'}\n\nEvidências da atividade:\n${ev||'(nenhuma)'}`}
function aiSystem(a){return `Você é o assistente de testes da Sprintboard, conversando com o tester ${me?.name||''}. ${ctxFull()}

Como trabalhar:
- Ajude a investigar o que está acontecendo no teste: leia as evidências (requests, responses, logs, prints), aponte a causa provável e proponha o próximo passo concreto (request corrigido, SQL de conferência, configuração a revisar).
- Diferencie problema do teste (request, URL ou ambiente) de comportamento da aplicação. Se o tester fizer funcionar, registre o cenário como aprovado.
- Se depois das tentativas continuar falhando por comportamento da aplicação, proponha registrar o apontamento com criar_comentario, que vincula as evidências desta conversa. Classificação: BUG-DEV para bug de código; BUG-BACK quando o mesmo apontamento já foi feito em rodada anterior e voltou com erro; BUG-ANALISE quando o requisito precisa mudar; VALIDAR para regra a confirmar com o dev.
- Não tire conclusão sem evidência; quando faltar dado, peça. Consulte a documentação (descrição da atividade) antes de perguntar regra ao tester.
- As ferramentas de alteração mostram um cartão para o tester confirmar. Antes de chamar, diga em uma frase o que vai registrar.
- Comentário no padrão: título "Registro com …" ou da ação; texto "Ao registrar …, a aplicação (comportamento). O esperado é …"; inclua o request e a consulta SQL quando houver.
- Responda em português do Brasil, curto e direto, sem tabelas.

Contexto atual da tela:
${aiSnapshot(a)}`}
function aiConfirm(title,detail){return new Promise(res=>{const c=document.createElement('div');c.className='act-card';c.innerHTML=`<b>${esc(title)}</b><pre>${esc(detail)}</pre><div class="row"><span class="grow"></span><button class="ghost">Descartar</button><button class="pri">Confirmar</button></div>`;const [no,yes]=c.querySelectorAll('button');
  no.onclick=()=>{c.querySelector('.row').innerHTML='<span class="small muted">Descartado.</span>';res(false)};yes.onclick=()=>{c.querySelector('.row').innerHTML='<span class="small muted">Confirmado e salvo.</span>';res(true)};$('#aiLog').append(c);$('#aiLog').scrollTop=1e9})}
const evNames=ids=>ids.map(id=>S.evidencias.find(e=>e.id===id)?.nome).filter(Boolean).join(', ');
function aiTools(a){if(!a)return[];const cenBy=cod=>byAtiv('cenarios',a.id).find(c=>String(c.codigo).toLowerCase()===String(cod).toLowerCase());
 return [
 askTool('Assistente de testes'),
 {name:'registrar_resultado_cenario',description:'Registra a resposta e o resultado de um cenário da atividade atual e, se pedido, vincula as evidências enviadas nesta conversa.',inputSchema:{type:'object',properties:{codigo:{type:'string',description:'código do cenário, ex. CT03'},resposta:{type:'string'},resultado:{type:'string',enum:['aprovado','reprovado','validar','na','pendente']},vincular_evidencias:{type:'boolean'}},required:['codigo','resultado']},
  async execute(i){const c=cenBy(i.codigo);if(!c)throw new Error('Cenário '+i.codigo+' não existe nesta atividade.');const evs=i.vincular_evidencias?AI.ev.slice():[];
   if(!await aiConfirm('Registrar '+c.codigo+' como '+(RES[i.resultado]||i.resultado),(i.resposta||'')+(evs.length?'\nEvidências: '+evNames(evs):'')))return 'O tester descartou a alteração.';
   await cap.db.collection('cenarios').doc(c.id).update({resposta:i.resposta??c.resposta??'',resultado:i.resultado,rodada:a.rodada||1,evidencias:[...new Set([...(c.evidencias||[]),...evs])],atualizadoEm:nowISO(),atualizadoPor:me?.id||null,atualizadoPorNome:me?.name||''});return 'Registrado.'}},
 {name:'criar_comentario',description:'Cria um apontamento (comentário para o Artia) na rodada atual da atividade, já com as evidências desta conversa vinculadas.',inputSchema:{type:'object',properties:{classificacao:{type:'string',enum:['BUG-DEV','BUG-ANALISE','BUG-BACK','VALIDAR']},titulo:{type:'string'},texto:{type:'string'},request:{type:'string'},retornoRequest:{type:'string',description:'retorno exato colado pelo tester para o request'},sql:{type:'string'},retornoSql:{type:'string',description:'resultado exato colado pelo tester para a consulta'},obtido:{type:'string'},esperado:{type:'string'},cenarios:{type:'array',items:{type:'string'},description:'códigos dos cenários relacionados'}},required:['classificacao','titulo','texto']},
  async execute(i){const evs=AI.ev.slice();const cens=(i.cenarios||[]).map(cenBy).filter(Boolean).map(c=>c.id);const d={classificacao:i.classificacao,titulo:i.titulo,texto:i.texto,request:i.request||'',retornoRequest:i.retornoRequest||'',sql:i.sql||'',retornoSql:i.retornoSql||'',obtido:i.obtido||'',esperado:i.esperado||'',evidencias:evs};
   if(!await aiConfirm('Criar comentário '+CL(i.classificacao).l,commentText({...d,atividadeId:a.id},null)))return 'O tester descartou a alteração.';
   const ref=await cap.db.collection('comentarios').add({...d,sprintId:st.sprint,atividadeId:a.id,rodada:a.rodada||1,cenarios:cens,status:'aberto',ordem:Date.now(),origem:'assistente',criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||''});return 'Comentário criado (id '+ref.id+').'}},
 {name:'atualizar_situacao_comentario',description:'Muda a situação de um comentário existente da atividade (aberto, corrigido, encerrado).',inputSchema:{type:'object',properties:{id:{type:'string'},status:{type:'string',enum:['aberto','corrigido','encerrado']}},required:['id','status']},
  async execute(i){const c=S.comentarios.find(x=>x.id===i.id&&x.atividadeId===a.id);if(!c)throw new Error('Comentário não encontrado nesta atividade.');
   if(!await aiConfirm('Marcar como '+CST[i.status],c.titulo))return 'O tester descartou a alteração.';await cap.db.collection('comentarios').doc(c.id).update({status:i.status});return 'Atualizado.'}},
 {name:'criar_cenario',description:'Adiciona um cenário de teste novo à atividade atual.',inputSchema:{type:'object',properties:{titulo:{type:'string'},pergunta:{type:'string',description:'instrução completa, com request e SQL quando houver'},esperado:{type:'string'},estimativaMin:{type:'number'}},required:['titulo','pergunta']},
  async execute(i){const n=byAtiv('cenarios',a.id).length+1;const cod='CT'+String(n).padStart(2,'0');
   if(!await aiConfirm('Criar cenário '+cod,i.titulo+'\n\n'+i.pergunta))return 'O tester descartou a alteração.';
   await cap.db.collection('cenarios').add({sprintId:st.sprint,atividadeId:a.id,codigo:cod,titulo:i.titulo,pergunta:i.pergunta,esperado:i.esperado||'',estimativaMin:Math.max(1,Math.round(i.estimativaMin||10)),resultado:'pendente',ordem:n,rodada:a.rodada||1,origem:'assistente',criadoEm:nowISO(),criadoPor:me?.id||null});return 'Cenário '+cod+' criado.'}},
 {name:'mudar_situacao_atividade',description:'Muda a situação da atividade no fluxo com o desenvolvimento.',inputSchema:{type:'object',properties:{status:{type:'string',enum:STATUS},nota:{type:'string'}},required:['status']},
  async execute(i){if(!await aiConfirm('Mudar situação para '+i.status,i.nota||''))return 'O tester descartou a alteração.';await setStatus(a,i.status,i.nota||'');return 'Situação atualizada.'}},
 {name:'ler_evidencia',description:'Lê o conteúdo de uma evidência já anexada à atividade (XRebel resumido ou linhas de erro de log). Use o id da lista de evidências.',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id']},
  async execute(i){const e=S.evidencias.find(x=>x.id===i.id);if(!e)throw new Error('Evidência não encontrada.');if(isImg(e))return 'É uma imagem; peça ao tester para colar o print na conversa.';if(/pdf/.test(e.tipo||''))return 'É um PDF; não consigo ler o conteúdo aqui.';
   const t=await (await fetch(evUrl(e))).text();return evidenceTextFromString(t,e.nome).slice(0,30000)}}
 ]}
async function aiSend(){if(AI.busy)return;const txt=$('#aiIn').value.trim();if(!txt&&!AI.pend.length)return;const a=aiAct();
  let content=txt||'(segue evidência)';const imgs=[];
  for(const p of AI.pend){if(p.text)content+=`\n\n[Evidência anexada: ${p.nome}]\n${p.text}`;else if(p.isImg){if(aiLimits?.images)imgs.push(p.blob);content+=`\n\n[Print anexado: ${p.nome}]`}else content+=`\n\n[Arquivo anexado: ${p.nome}]`}
  aiAdd('u',(txt||'')+(AI.pend.length?`${txt?'\n':''}Anexos: ${AI.pend.map(p=>p.nome).join(', ')}`:''));
  AI.msgs.push({role:'user',content});AI.pend=[];$('#aiIn').value='';aiChips();
  AI.busy=true;$('#aiSend').disabled=true;const bubble=aiAdd('a','');bubble.innerHTML='<span class="spin"></span> Pensando…';btnLoad($('#aiSend'),true);
  if(AI.msgs.length===1&&a&&aiLimits?.images){const room=(aiLimits.images.maxCount||0)-imgs.length;if(room>0){const pi=await printImages(a,room);if(pi.blobs.length){imgs.push(...pi.blobs);AI.msgs[0].content+=`\n\n[Também seguem ${pi.blobs.length} print(s) da descrição da atividade no Artia: ${pi.nomes.join(', ')}]`}}}
  try{const input=[{role:'user',content:aiSystem(a)+'\n\n---\n\nMensagem do tester:\n'+AI.msgs[0].content},...AI.msgs.slice(1)];
    const r=await aiS('chat',input,{tools:aiTools(a),images:imgs.length?imgs:undefined,model:'claude-sonnet-5-5',modelTier:'default',cache:false,onText:u=>{if(u.text){bubble.textContent=u.text;$('#aiLog').scrollTop=1e9}}});
    bubble.textContent=r.text||'(sem resposta)';$('#aiLog').append(bubble);AI.msgs.push({role:'assistant',content:r.text||'(sem resposta)'})}
  catch(e){const m=e.code==='not_granted'?'O acesso ao Claude não foi liberado nesta página.':e.code==='rate_limited'?'Muitas mensagens seguidas. Espere um pouco e tente de novo.':e.code==='prompt_too_large'?'A conversa ficou grande demais. Clique em “Nova conversa”.':'Não consegui responder: '+(e.message||e.code);bubble.textContent=e.text?e.text:m;AI.msgs.push({role:'assistant',content:e.text||m})}
  finally{AI.busy=false;btnLoad($('#aiSend'),false);$('#aiLog').scrollTop=1e9}}
