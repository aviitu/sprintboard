/* =====================================================================
   Fila da noite: ações caras guardadas para rodar todas de uma vez
   + troca de tema (Padrão / Caramelo)
   ===================================================================== */
const FILA={itens:[],sub:null};
const FILA_MOD={gen:'Tester',retri:'Patch Notes',tkpm:'Thinker',tkscript:'Thinker'};
function filaSub(){if(FILA.sub||!cap.db)return;FILA.sub=cap.db.collection('filaClaude').onSnapshot(sn=>{FILA.itens=sn.docs.map(d=>({id:d.id,...d.data()})).filter(x=>!x.por||!me||x.por===me.id).sort((a,b)=>String(a.criadoEm).localeCompare(String(b.criadoEm)));filaBadge();if(!$('#modal').hidden&&$('#filaBox'))openFila()},()=>{})}
{let n=0;const t=setInterval(()=>{if(cap&&cap.db){clearInterval(t);filaSub()}else if(++n>40)clearInterval(t)},500)}
function filaBadge(){const b=$('#filaBtn');if(!b)return;const n=FILA.itens.length;b.hidden=!n;$('#filaN').textContent=n;b.title=n?`Fila da noite: ${n} ${n>1?'ações':'ação'}`:'Fila da noite'}
$('#filaBtn').onclick=()=>openFila();
async function filaAdd(it){if(!cap.db)return;const dup=FILA.itens.find(x=>x.tipo===it.tipo&&(x.ativId||x.verId)===(it.ativId||it.verId));if(dup){toast('Isso já está na fila da noite.',3200,{kind:'info'});return}
  try{await cap.db.collection('filaClaude').add({...it,por:me?.id||null,porNome:me?.name||'',criadoEm:nowISO()});toast(`Guardado na fila da noite (${FILA.itens.length+1}).`,3600,{kind:'ok'});const b=$('#filaBtn');if(b){b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')}}
  catch(e){toast('Não foi possível guardar na fila: '+(e.code||e.message))}}
const filaHora=iso=>{const d=new Date(iso);if(isNaN(d))return'';const hoje=new Date().toDateString()===d.toDateString();return (hoje?'hoje ':d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' ')+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})};
function openFila(){const m=$('#modal');const L=FILA.itens;
  m.innerHTML=`<div class="box" id="filaBox" style="max-width:560px" role="dialog" aria-modal="true" aria-labelledby="flT"><div class="row"><b id="flT" class="grow" style="font-size:17px">Fila da noite</b>${ib('close','Fechar','id="flX"')}</div>
  <div class="small muted">Ações que você deixou para depois. Ao rodar, elas vão uma por vez, sem pedir confirmação de novo.</div>
  ${L.length?`<ol class="flist">${L.map(x=>`<li${x.erro?' class="flerr"':''}><span class="flt"><b>${esc(x.titulo||x.tipo)}</b><span class="small muted">${esc(FILA_MOD[x.tipo]||'')} · guardada ${esc(filaHora(x.criadoEm))}${x.erro?' · falhou: '+esc(x.erro):''}</span></span>${ib('trash','Tirar da fila','data-flrm="'+esc(x.id)+'"','ib-bad')}</li>`).join('')}</ol>`
    :'<div class="kpempty"><b>Nada na fila</b><span class="small">Quando o aviso de custo aparecer, escolha "Deixar para a noite".</span></div>'}
  <div class="row"><button id="flAdd">${ICO('plus')}Adicionar</button><span class="grow"></span><button id="flN">Fechar</button>${L.length?`<button class="pri" id="flGo">Rodar fila (${L.length})</button>`:''}</div></div>`;
  m.hidden=false;$('#flX').onclick=$('#flN').onclick=()=>m.hidden=true;
  m.querySelectorAll('[data-flrm]').forEach(b=>b.onclick=async()=>{const it=L.find(x=>x.id===b.dataset.flrm);try{await cap.db.collection('filaClaude').doc(b.dataset.flrm).delete();if(it)toastUndo('Tirada da fila.','Desfazer',async()=>{const {id,...d}=it;await cap.db.collection('filaClaude').doc(id).set(d)})}catch(e){toast('Não foi possível tirar: '+(e.code||e.message))}});
  const g=$('#flGo');if(g)g.onclick=()=>filaRodar();$('#flAdd').onclick=()=>openFilaAdd()}
const espera=(fn,ms=9000)=>new Promise(r=>{const t0=Date.now();const k=()=>{const v=fn();if(v||Date.now()-t0>ms)r(v);else setTimeout(k,150)};k()});
const FILA_RUN={
  async gen(it){if(st.sprint!==it.sprintId){st.sprint=it.sprintId;subscribeSprint()}
    const a=await espera(()=>S.atividades.find(x=>x.id===it.ativId));if(!a)throw new Error('a atividade não foi encontrada');await new Promise(r=>setTimeout(r,700));await generate(a,null)},
  async tkpm(it){tkSubscribe();tkSubAtiv(it.tkSprintId);await espera(()=>TK.aLoaded&&TK.subS===it.tkSprintId);const a=TK.ativ.find(x=>x.id===it.tkAtivId);if(!a)throw new Error('a atividade do Thinker não foi encontrada');await tkPmGen(a)},
  async tkscript(it){tkSubscribe();const s=await espera(()=>TK.spr.find(x=>x.id===it.tkSprintId));if(!s)throw new Error('a sprint do Thinker não foi encontrada');tkSubAtiv(s.id);await espera(()=>TK.aLoaded&&TK.subS===s.id);await tkScriptGen(s)},
  async retri(it){pnSubscribe();const v=await espera(()=>PN.vers.find(x=>x.id===it.verId));if(!v)throw new Error('a versão não foi encontrada');await pnTriage(v,null)}};
async function filaRodar(){const L=[...FILA.itens];if(!L.length)return;$('#modal').hidden=true;
  if(L.some(x=>x.tipo==='gen')&&typeof ensureAmb==='function'&&!await ensureAmb())return;
  const wb=waitBox('Rodando a fila da noite…');let ok=0;const falhas=[];
  for(let i=0;i<L.length;i++){const it=L[i];wb.set(`${i+1} de ${L.length} · ${it.titulo||it.tipo}`);
    try{const f=FILA_RUN[it.tipo];if(!f)throw new Error('tipo desconhecido');await f(it);ok++;await cap.db.collection('filaClaude').doc(it.id).delete().catch(()=>{})}
    catch(e){falhas.push(it);await cap.db.collection('filaClaude').doc(it.id).update({erro:String(e.code||e.message||e).slice(0,160)}).catch(()=>{})}}
  wb.done();toast(falhas.length?`Fila rodada: ${ok} ok, ${falhas.length} com falha (continuam na fila).`:`Fila rodada: ${ok} ${ok>1?'ações concluídas':'ação concluída'}.`,6000,{kind:falhas.length?'warn':'ok'})}

/* ---------- aparência: tema + modo claro/escuro ---------- */
const TEMAS=[{k:'padrao',l:'Padrão',d:'Marfim, ardósia e argila',c:{l:['#FAF9F5','#FFFFFF','#B8532F','#141413'],e:['#141413','#1F1E1C','#E08A6C','#FAF9F5']}},
  {k:'caramelo',l:'Caramelo',d:'Bege, caramelo e café, com ar de foto antiga',c:{l:['#EDE2D5','#F8F1E9','#8A4A2E','#2B1A12'],e:['#1B110C','#271A13','#DCB08A','#F2E5D8']}}];
const MODOS=[{k:'sistema',l:'Sistema',ic:'<rect x="3.5" y="4.5" width="17" height="12" rx="2"/><path d="M9 20h6M12 16.5V20"/>'},{k:'claro',l:'Claro',ic:'<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2M12 19.2v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.8 12h2M19.2 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>'},{k:'escuro',l:'Escuro',ic:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'}];
const lsGet=(k,d)=>{try{return localStorage.getItem(k)||d}catch(e){return d}};const lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const temaAtual=()=>lsGet('sb-skin','padrao');const modoAtual=()=>lsGet('sb-mode','sistema');
function temaAplica(k){if(k==='padrao')delete document.documentElement.dataset.skin;else document.documentElement.dataset.skin=k}
function modoAplica(m){if(m==='claro')document.documentElement.dataset.theme='light';else if(m==='escuro')document.documentElement.dataset.theme='dark';else delete document.documentElement.dataset.theme}
temaAplica(temaAtual());modoAplica(modoAtual());
const escuroAgora=()=>{const m=modoAtual();return m==='escuro'||(m==='sistema'&&matchMedia('(prefers-color-scheme: dark)').matches)};
function aparTroca(fn){const r=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){r.classList.add('tema-troca');setTimeout(()=>r.classList.remove('tema-troca'),450)}fn()}
function aparResumo(){return (TEMAS.find(t=>t.k===temaAtual())||TEMAS[0]).l+' · '+(MODOS.find(m=>m.k===modoAtual())||MODOS[0]).l}
function temaRowHTML(){return `<button class="profrow" id="pfApar"><span class="pic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17" fill="currentColor" stroke="none"/></svg></span><span class="pt">Aparência</span><span class="small muted">${esc(aparResumo())}</span></button>`}
function bindTemaRow(p){const b=p.querySelector('#pfApar');if(b)b.onclick=e=>{e.stopPropagation();closeProf();openAparencia()}}
function openAparencia(){const m=$('#modal');
  const prev=t=>{const c=escuroAgora()?t.c.e:t.c.l;return `<span class="apprev" aria-hidden="true" style="--pb:${c[0]};--ps:${c[1]};--pa:${c[2]};--pf:${c[3]}"><i class="apb"></i><i class="apc"><b></b><b></b><b class="apa"></b></i></span>`};
  const paint=()=>{const t=temaAtual(),md=modoAtual();
    m.innerHTML=`<div class="box apbox" style="max-width:520px" role="dialog" aria-modal="true" aria-labelledby="apT"><div class="row"><b id="apT" class="grow" style="font-size:17px">Aparência</b>${ib('close','Fechar','id="apX"')}</div>
    <div class="aplbl" id="apTl">Tema</div><div class="aptemas" role="radiogroup" aria-labelledby="apTl">${TEMAS.map(x=>`<button type="button" role="radio" class="aptema" data-tema="${x.k}" aria-checked="${t===x.k}">${prev(x)}<span class="aptn">${x.l}</span><span class="small muted">${x.d}</span></button>`).join('')}</div>
    <div class="aplbl" id="apMl">Modo</div><div class="kseg apmodos" role="radiogroup" aria-labelledby="apMl">${MODOS.map(x=>`<button type="button" role="radio" data-modo="${x.k}" aria-checked="${md===x.k}" aria-pressed="${md===x.k}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${x.ic}</svg>${x.l}</button>`).join('')}</div>
    <div class="small muted">${md==='sistema'?'Segue o modo claro ou escuro do seu computador.':'Fica assim mesmo que o sistema mude.'} A escolha vale neste navegador.</div></div>`;
    $('#apX').onclick=()=>m.hidden=true;
    m.querySelectorAll('[data-tema]').forEach(b=>b.onclick=()=>{lsSet('sb-skin',b.dataset.tema);aparTroca(()=>temaAplica(b.dataset.tema));paint();m.querySelector(`[data-tema="${b.dataset.tema}"]`).focus()});
    m.querySelectorAll('[data-modo]').forEach(b=>b.onclick=()=>{lsSet('sb-mode',b.dataset.modo);aparTroca(()=>modoAplica(b.dataset.modo));paint();m.querySelector(`[data-modo="${b.dataset.modo}"]`).focus()})};
  paint();m.hidden=false;setTimeout(()=>{const c=m.querySelector('[aria-checked="true"]');if(c)c.focus()},30)}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(!$('#modal').hidden&&$('.apbox'))openAparencia()});

/* adicionar à fila pela própria fila: escolhe a ação e onde */
const dbOnce=q=>new Promise((res,rej)=>{let u=null,done=false;u=q.onSnapshot(sn=>{if(done)return;done=true;res(sn.docs.map(d=>({id:d.id,...d.data()})));setTimeout(()=>{try{u&&u()}catch(e){}},0)},e=>{if(!done){done=true;rej(e)}})});
const FILA_ACOES=[{k:'gen',l:'Gerar mais cenários',m:'Tester'},{k:'retri',l:'Refazer a triagem',m:'Patch Notes'},{k:'tkpm',l:'Passos de modelagem',m:'Thinker'},{k:'tkscript',l:'Script de versão',m:'Thinker'}];
function openFilaAdd(){try{pnSubscribe();tkSubscribe()}catch(e){}const m=$('#modal');let ac='gen';
  const opt=(v,l,sel)=>`<option value="${esc(v)}"${sel?' selected':''}>${esc(l)}</option>`;
  const paint=()=>{m.innerHTML=`<div class="box" style="max-width:520px" role="dialog" aria-modal="true" aria-labelledby="faT"><div class="row"><b id="faT" class="grow" style="font-size:17px">Adicionar à fila da noite</b>${ib('close','Fechar','id="faX"')}</div>
    <div class="faacs" role="radiogroup" aria-label="Ação">${FILA_ACOES.map(x=>`<button type="button" role="radio" class="faac" data-fac="${x.k}" aria-checked="${ac===x.k}"><b>${x.l}</b><span class="small muted">${x.m}</span></button>`).join('')}</div>
    <div class="formgrid" id="faAlvo"></div><div class="small muted" id="faMsg" role="status"></div>
    <div class="row"><button id="faV">Voltar para a fila</button><span class="grow"></span><button class="pri" id="faGo" disabled>Adicionar à fila</button></div></div>`;
    m.hidden=false;$('#faX').onclick=()=>m.hidden=true;$('#faV').onclick=()=>openFila();
    m.querySelectorAll('[data-fac]').forEach(b=>b.onclick=()=>{ac=b.dataset.fac;paint()});alvo()};
  const alvo=async()=>{const A=document.getElementById('faAlvo');const ok=document.getElementById('faGo');const msg=document.getElementById('faMsg');ok.disabled=true;msg.textContent='';
    if(ac==='gen'){const sps=S.sprints;if(!sps.length){msg.textContent='Nenhuma sprint no Tester.';return}
      A.innerHTML=`<label class="full">Sprint<select id="faSp">${sps.map(x=>opt(x.id,(x.codigo?x.codigo+' · ':'')+x.nome,x.id===st.sprint)).join('')}</select></label><label class="full">Atividade<select id="faAt"></select></label>`;
      const fill=()=>{const sp=document.getElementById('faSp').value;const as=sorted((S.allAtiv||[]).filter(a=>a.sprintId===sp&&a.status!=='Cancelada'));document.getElementById('faAt').innerHTML=as.map(a=>opt(a.id,a.titulo,a.id===st.ativ)).join('');ok.disabled=!as.length;msg.textContent=as.length?'':'Essa sprint não tem atividades.'};
      document.getElementById('faSp').onchange=fill;fill();
      ok.onclick=()=>{const a=(S.allAtiv||[]).find(x=>x.id===document.getElementById('faAt').value);if(!a)return;add({tipo:'gen',sprintId:a.sprintId,ativId:a.id,titulo:'Gerar mais cenários · '+a.titulo})};return}
    if(ac==='retri'){const vs=await espera(()=>PN.loaded&&PN.vers,4000)||[];if(!vs.length){A.innerHTML='';msg.textContent='Nenhuma versão no Patch Notes.';return}
      A.innerHTML=`<label class="full">Versão<select id="faVe">${vs.map(v=>opt(v.id,'Versão '+(v.versao||'')+(v.triado?'':' · ainda sem triagem'))).join('')}</select></label>`;ok.disabled=false;
      ok.onclick=()=>{const v=vs.find(x=>x.id===document.getElementById('faVe').value);if(v)add({tipo:'retri',verId:v.id,titulo:'Refazer a triagem · versão '+(v.versao||'')})};return}
    const ts=await espera(()=>TK.loaded&&TK.spr,4000)||[];if(!ts.length){A.innerHTML='';msg.textContent='Nenhuma sprint no Thinker.';return}
    A.innerHTML=`<label class="full">Sprint do Thinker<select id="faTs">${ts.map(x=>opt(x.id,x.nome||'(sem nome)',x.id===TK.id)).join('')}</select></label>${ac==='tkpm'?'<label class="full">Atividade com modelagem<select id="faTa"></select></label>':''}`;
    if(ac==='tkscript'){ok.disabled=false;ok.onclick=()=>{const t=ts.find(x=>x.id===document.getElementById('faTs').value);if(t)add({tipo:'tkscript',tkSprintId:t.id,titulo:'Script de versão · '+(t.nome||'')})};return}
    const fill=async()=>{const sid=document.getElementById('faTs').value;const sel=document.getElementById('faTa');sel.innerHTML='<option>Carregando…</option>';ok.disabled=true;
      let as=[];try{as=(await dbOnce(cap.db.collection('tkativ').where('sprintId','==',sid))).filter(tkTemModeloA).sort((a,b)=>(a.ordem||0)-(b.ordem||0))}catch(e){}
      sel.innerHTML=as.map(a=>opt(a.id,a.titulo)).join('');ok.disabled=!as.length;msg.textContent=as.length?'':'Nenhuma atividade dessa sprint tem modelagem de dados.';
      ok.onclick=()=>{const a=as.find(x=>x.id===sel.value);if(a)add({tipo:'tkpm',tkSprintId:sid,tkAtivId:a.id,titulo:'Passos de modelagem · '+a.titulo})}};
    document.getElementById('faTs').onchange=fill;fill()};
  const add=async it=>{await filaAdd(it);openFila()};
  paint()}
