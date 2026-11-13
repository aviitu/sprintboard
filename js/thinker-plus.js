/* =====================================================================
   Thinker+: grau de detalhe, criar atividade (manual ou com o Claude),
   kanban, editar a sprint com o Claude, editar atividade do Tester,
   script de versão e "para modelagem"
   ===================================================================== */

/* ---------- grau de detalhe: quanto o usuário quer contar antes das perguntas ---------- */
const TK_DET=[
  {l:'Rápido',d:'Você conta o essencial e o Claude pergunta o resto.'},
  {l:'Básico',d:'Você já diz as telas e as regras principais.'},
  {l:'Detalhado',d:'Você descreve também APIs e como testar. O Claude pergunta pouco.'},
  {l:'Completo',d:'Você entrega até a modelagem. O Claude só confere o que faltar.'}];
/* campos que aparecem a partir de cada nível */
const TK_CAMPOS=[
  {k:'telas',lv:2,l:'Telas afetadas',ph:'Ex.: Protocolo Beneficiário > Novo protocolo; Cadastros > Operadoras'},
  {k:'regras',lv:2,l:'Regras de negócio',ph:'Condições, exceções e mensagens que a aplicação deve mostrar'},
  {k:'apis',lv:3,l:'APIs e integrações',ph:'Endpoints, request e response, erros esperados'},
  {k:'teste',lv:3,l:'Como validar',ph:'O que precisa acontecer para considerar pronto'},
  {k:'modelo',lv:4,l:'Modelagem de dados',ph:'Tabelas novas ou alteradas, colunas, tipos, scripts',mono:true},
  {k:'evid',lv:4,l:'Evidências e protótipo',ph:'Prints necessários ou link do protótipo'}];
const tkLv=v=>Math.min(4,Math.max(1,+v||1));
function tkDetQS(v){return ['Faça de 4 a 7 perguntas','Faça de 3 a 5 perguntas','Faça de 2 a 4 perguntas, só sobre o que os campos preenchidos não responderam','Faça no máximo 3 perguntas, só se faltar algo crítico; o analista já detalhou'][tkLv(v)-1]}
function tkDetQA(v){return ['1 a 5 perguntas','1 a 4 perguntas','no máximo 3 perguntas','no máximo 2 perguntas, só se faltar algo crítico'][tkLv(v)-1]}
/* tela em branco sendo montada: cada nível acende mais blocos */
function tkMockHTML(id,lv){const B=['t','l1','l2','in','in2','tb','tb2','bt'];
  return `<div class="tkmock lv-${lv}" id="${id}" aria-hidden="true"><div class="tkmbar"><i></i><i></i><i></i></div><div class="tkmbody">${B.map((b,i)=>`<span class="mb mb-${b}" style="--i:${i}"></span>`).join('')}</div></div>`}
function tkDetBar(id,lv){lv=tkLv(lv);return `<div class="tkdl"><div class="tkdlh"><label for="${id}"><b>Quanto detalhe você quer dar?</b></label><span class="tkdlv" id="${id}V">${TK_DET[lv-1].l}</span></div>
  <div class="tkdlg">${tkMockHTML(id+'M',lv)}<div class="tkdlr"><input type="range" min="1" max="4" step="1" value="${lv}" id="${id}" aria-valuetext="${TK_DET[lv-1].l}"><div class="tkdlt" aria-hidden="true">${TK_DET.map(x=>`<span>${x.l}</span>`).join('')}</div><p class="small muted" id="${id}D">${TK_DET[lv-1].d}</p></div></div></div>`}
function tkCampoHTML(c,lv,val,pre){return `<label class="tkcampo${lv>=c.lv?' on':''}" data-lv="${c.lv}" ${lv>=c.lv?'':'hidden'}>${c.l}<textarea id="${pre}${c.k}" rows="3"${c.mono?' class="mono"':''} placeholder="${esc(c.ph)}">${esc(val||'')}</textarea></label>`}
/* liga a barra: troca o nível, anima a tela e mostra/esconde os campos */
function tkDetWire(root,id,onLv){const r=root.querySelector('#'+id);if(!r)return;
  const upd=()=>{const lv=tkLv(r.value);const m=root.querySelector('#'+id+'M');if(m)m.className='tkmock lv-'+lv;root.querySelector('#'+id+'V').textContent=TK_DET[lv-1].l;root.querySelector('#'+id+'D').textContent=TK_DET[lv-1].d;r.setAttribute('aria-valuetext',TK_DET[lv-1].l);
    root.querySelectorAll('.tkcampo[data-lv]').forEach(f=>{const on=lv>=+f.dataset.lv;if(on&&f.hidden){f.hidden=false;f.classList.remove('on');void f.offsetWidth;f.classList.add('on')}else if(!on){f.hidden=true;f.classList.remove('on')}});onLv&&onLv(lv)};
  r.oninput=upd;r.onchange=()=>{upd();onLv&&onLv(tkLv(r.value),true)}}

/* contexto da sprint: barra + campos extras, salvos como campos simples */
function tkCtxDetHTML(s){const lv=tkLv(s.detalhe);return `<div class="tkctxdet">${tkDetBar('tkDetS',lv)}<div class="tkcampos">${TK_CAMPOS.map(c=>tkCampoHTML(c,lv,s['ctx_'+c.k],'tkC_')).join('')}</div></div>`}
function tkCtxExtra(){const r=$('#tkDetS');if(!r)return {};const o={detalhe:tkLv(r.value)};TK_CAMPOS.forEach(c=>{const el=$('#tkC_'+c.k);if(el)o['ctx_'+c.k]=el.value});return o}
function bindTkCtxDet(sc,s){tkDetWire(sc,'tkDetS',(lv,fim)=>{if(fim)tkUpd('tkspr',s.id,{detalhe:lv}).catch(()=>{})});
  TK_CAMPOS.forEach(c=>{const el=$('#tkC_'+c.k);if(el)el.onchange=()=>tkUpd('tkspr',s.id,{['ctx_'+c.k]:el.value}).catch(()=>{})})}
function tkCampos(s){const lv=tkLv(s.detalhe);const t=TK_CAMPOS.filter(c=>lv>=c.lv&&String(s['ctx_'+c.k]||'').trim()).map(c=>`${c.l.toUpperCase()}:\n${String(s['ctx_'+c.k]).trim().slice(0,12000)}`).join('\n\n');
  return t?`O ANALISTA JÁ DETALHOU (trate como decidido, não pergunte de novo):\n${t}\n\n`:''}

/* ---------- nova atividade: criar direto ou com o Claude ---------- */
function openTkNewAtiv(s){const m=$('#modal');const n=tkNextNum(s);const tag=tkTagOf(s);let lv=tkLv(TK.detA||2);
  m.innerHTML=`<div class="box tknew" style="max-width:680px" role="dialog" aria-modal="true" aria-labelledby="tkNaT"><div class="row"><b id="tkNaT" class="grow" style="font-size:17px">Nova atividade · ${n}. ${tag?'['+esc(tag)+'] ':''}</b>${ib('close','Fechar','id="tkNaX"')}</div>
  ${tkDetBar('tkDetA',lv)}
  <div class="formgrid"><label class="full">Título<input type="text" id="tkNaTit" placeholder="Ex.: Consultar anexos antes de baixar"></label>
  <label class="full">O que precisa ser feito<textarea id="tkNaTxt" rows="5" placeholder="Cole o pedido, o chamado ou descreva com suas palavras."></textarea></label></div>
  <div class="tkcampos">${TK_CAMPOS.map(c=>tkCampoHTML(c,lv,'','tkNa_')).join('')}</div>
  <div class="row tknewf"><span class="small muted grow" id="tkNaMsg">Criar: entra como você escreveu. Com o Claude: ele pergunta o que faltar e escreve no padrão do Artia.</span><button id="tkNaManual">Criar</button><button class="pri" id="tkNaGo"${cap.sample?'':' disabled'}>Criar com o Claude</button></div></div>`;
  m.hidden=false;setTimeout(()=>$('#tkNaTxt').focus(),30);const close=()=>{m.hidden=true;m.innerHTML=''};$('#tkNaX').onclick=close;
  tkDetWire(m,'tkDetA',v=>{lv=v;TK.detA=v});
  const val=k=>(($('#tkNa_'+k)||{}).value||'').trim();const visivel=c=>lv>=c.lv;
  const ler=()=>{const tit=$('#tkNaTit').value.trim(),txt=$('#tkNaTxt').value.trim();if(!txt&&!tit){$('#tkNaMsg').textContent='Escreva o que precisa ser feito.';$('#tkNaTxt').focus();return null}return {tit,txt}};
  const nomeT=t=>`${n}. ${tag?'['+tag+'] ':''}${String(t||'').replace(/^\s*\d+[.)]\s*/,'').replace(/^\[[^\]]+\]\s*/,'').trim()}`;
  $('#tkNaManual').onclick=async()=>{const d=ler();if(!d)return;const b=$('#tkNaManual');btnLoad(b,true);
    const lista=t=>t?t.split('\n').map(x=>x.trim()).filter(Boolean).map(x=>/^-\s/.test(x)?x:'- '+x).join('\n'):'';
    const md=visivel(TK_CAMPOS[4])?val('modelo'):'';const ev=visivel(TK_CAMPOS[5])?val('evid'):'';
    const sec={analise:[d.txt,visivel(TK_CAMPOS[1])&&val('regras')?'**Regras de negócio**\n'+lista(val('regras')):'',visivel(TK_CAMPOS[0])&&val('telas')?'**Telas afetadas**\n'+lista(val('telas')):''].filter(Boolean).join('\n\n'),
      desenvolvimento:visivel(TK_CAMPOS[2])&&val('apis')?val('apis'):'',evidencias:ev&&!/^https?:/i.test(ev)?ev:'Não se aplica',prototipo:ev&&/^https?:/i.test(ev)?ev:'Não se aplica',teste:visivel(TK_CAMPOS[3])?val('teste'):'',banco:'',modelo:md||'Não se aplica',paraModelagem:''};
    try{const r=await cap.db.collection('tkativ').add({sprintId:s.id,ordem:n,titulo:nomeT(d.tit||d.txt.split('\n')[0].slice(0,80)),tipo:'funcionalidade',dep:[],etapa:'pronta',manual:true,detalhe:lv,secoes:sec,criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||''});
      if(tag&&!s.tag)tkUpd('tkspr',s.id,{tag}).catch(()=>{});TK.sel[s.id]=r.id;close();tkUpd('tkspr',s.id,{nAtiv:TK.ativ.length+1,etapa:'atv'}).catch(()=>{});
      toastUndo('Atividade criada. O Claude pode revisar e completar o que faltar.','Revisar',async()=>{const a=TK.ativ.find(x=>x.id===r.id);if(a)tkReview(s,a)},9000,{kind:'ok'})}
    catch(e){btnLoad(b,false);toast('Não foi possível criar: '+(e.code||e.message))}};
  $('#tkNaGo').onclick=async()=>{const d=ler();if(!d)return;const b=$('#tkNaGo');btnLoad(b,true);
    const extra=TK_CAMPOS.filter(c=>visivel(c)&&val(c.k)).map(c=>`${c.l}:\n${val(c.k)}`).join('\n\n');const pedido=[d.tit?'Título sugerido: '+d.tit:'',d.txt,extra].filter(Boolean).join('\n\n');
    try{const r=await cap.db.collection('tkativ').add({sprintId:s.id,ordem:n,titulo:nomeT(d.tit||'(em definição)'),tipo:'funcionalidade',dep:[],etapa:'conversa',pedido,detalhe:lv,rodadas:[],secoes:{},criadoEm:nowISO()});
      if(tag&&!s.tag)tkUpd('tkspr',s.id,{tag}).catch(()=>{});TK.sel[s.id]=r.id;close();
      tkAtivRound(s,{id:r.id,sprintId:s.id,ordem:n,titulo:nomeT(d.tit||'(em definição)'),pedido,detalhe:lv,rodadas:[],etapa:'conversa'})}
    catch(e){btnLoad(b,false);toast('Não foi possível criar: '+(e.code||e.message))}}}

/* revisão de uma atividade escrita à mão */
function tkReview(s,a){openTkAdj(s,a);const t=$('#tkAjTxt');if(t)t.value='Revise a atividade: complete no padrão do Artia o que faltar (regras, telas, passos de teste com resultado esperado, modelagem se houver) sem mudar o que já foi decidido. Marque como "a definir" o que não dá para saber.'}

/* ---------- atividades: lista ou kanban ---------- */
TK.vista=TK.vista||{};
function tkEst(a,pend){return a.etapa==='conversa'?'conversa':!a.testerAtivId?'enviar':pend.includes(a)?'alterada':'tester'}
const TK_KCOL=[['conversa','Em conversa'],['enviar','Falta enviar'],['alterada','Alterada'],['tester','No Tester']];
function tkKanbanHTML(s){const pend=tkPend(s);const sent=tkSentIds();const T=tkTesterAtiv(s).filter(x=>!sent.has(x.id));
  const card=a=>{const dep=(a.dep||[]).filter(n=>n!==tkNum(a.titulo));return `<button class="kcard tkkc" data-tkk="${esc(a.id)}"><span class="kt">${esc(a.titulo)}</span><span class="kmeta">${a.tipo?`<span class="pill">${esc(a.tipo)}</span>`:''}${dep.length?`<span class="pill">depende da ${dep.join(', ')}</span>`:''}${tkTemModeloA(a)&&a.tipo!=='modelagem'?'<span class="pill s-modelagem">modelagem</span>':''}${a.prototipo&&a.prototipo.html?'<span class="pill">protótipo</span>':''}</span></button>`};
  const cols=TK_KCOL.map(([k,l])=>{const its=TK.ativ.filter(a=>tkEst(a,pend)===k);return `<section class="kcol${its.length?'':' empty'}" aria-label="${l}"><header><b>${l}</b><span class="kcount">${its.length}</span></header><div class="kitems">${its.map(card).join('')||'<div class="kempty">Nenhuma</div>'}</div></section>`});
  if(T.length)cols.push(`<section class="kcol" aria-label="Já existiam no Tester"><header><b>Já no Tester</b><span class="kcount">${T.length}</span></header><div class="kitems">${T.map(x=>`<button class="kcard tkkc tkref" data-tkk="t:${esc(x.id)}"><span class="kt">${esc(x.titulo)}</span><span class="kmeta"><span class="pill s-${slug(x.status||'A testar')}">${esc(x.status||'A testar')}</span></span></button>`).join('')}</div></section>`);
  return `<div class="kanban tkkan">${cols.join('')}</div>`}
function tkAtvHTML(s){const v=TK.vista[s.id]||'lista';const tem=TK.ativ.length||tkTesterAtiv(s).length;
  const bar=tem&&TK.aLoaded?`<div class="tkvbar row"><div class="kseg" role="group" aria-label="Exibição das atividades"><button type="button" data-tkv="lista" aria-pressed="${v==='lista'}">Lista</button><button type="button" data-tkv="kanban" aria-pressed="${v==='kanban'}">Kanban</button></div><span class="grow"></span>${cap.sample&&TK.ativ.length?'<button id="tkEdSpr">Editar sprint com o Claude</button>':''}${v==='kanban'?`<button id="tkAddA2">${ICO('plus')}Nova atividade</button>`:''}</div>`:'';
  if(v==='kanban'&&tem){const pend=tkPend(s);const sp=s.testerSprintId&&S.sprints.find(x=>x.id===s.testerSprintId);
    return bar+`<div class="tkbar row">${sp?`<span class="small muted">Ligada à sprint do Tester <b>${esc(sp.nome)}</b></span>`:'<span class="small muted">Ainda não está no Tester</span>'}<span class="grow"></span><button class="${pend.length?'pri':''}" id="tkSend"${pend.length?'':' disabled'}>Enviar para o Tester${pend.length?` (${pend.length})`:''}</button></div>`+tkKanbanHTML(s)}
  return bar+tkAtvHTML0(s)}
function bindTkAtv(sc,s){
  sc.querySelectorAll('[data-tkv]').forEach(b=>b.onclick=()=>{TK.vista[s.id]=b.dataset.tkv;render()});
  const a2=$('#tkAddA2');if(a2)a2.onclick=()=>openTkNewAtiv(s);const es=$('#tkEdSpr');if(es)es.onclick=()=>openTkEditSprint(s);
  if((TK.vista[s.id]||'lista')==='kanban'){sc.querySelectorAll('[data-tkt]').forEach(b=>b.onclick=()=>{TK.tab[s.id]=b.dataset.tkt;render()});const sd=$('#tkSend');if(sd)sd.onclick=()=>openTkSend(s);
    sc.querySelectorAll('[data-tkk]').forEach(b=>b.onclick=()=>{TK.sel[s.id]=b.dataset.tkk;TK.vista[s.id]='lista';TK.edit=null;render()});return}
  bindTkAtv0(sc,s);
  const det=sc.querySelector('.tkdet[data-tkdet]');if(det){const a=TK.ativ.find(x=>x.id===det.dataset.tkdet);if(a)bindTkPm(det,s,a)}
  const ed=$('#tkEditRef');if(ed)ed.onclick=()=>tkTrazerRef(s,ed.dataset.tid,ed);
  const rv=$('#tkRev');if(rv){const a=TK.ativ.find(x=>x.id===rv.dataset.id);if(a)rv.onclick=()=>tkReview(s,a)}}

/* ---------- detalhe: "para modelagem" e revisar ---------- */
const tkTemModeloA=a=>{const m=String((a.secoes||{}).modelo||'').trim();return !!m&&!/^não se aplica/i.test(m)};
function tkDet(s,sel,T){let h=tkDet0(s,sel,T);
  if(sel.manual&&cap.sample)h=h.replace('<span class="grow"></span>',`<button class="ghost" id="tkRev" data-id="${esc(sel.id)}">Revisar com o Claude</button><span class="grow"></span>`);
  if(!tkTemModeloA(sel))return h;const pm=String((sel.secoes||{}).paraModelagem||'').trim();const ed=TK.edit===sel.id+':paraModelagem';
  const box=`<section class="tksec tkpm" data-tksec="paraModelagem"><div class="tksech"><b>PARA MODELAGEM</b><span class="pill tkint">Só aqui · não vai para o Artia</span><span class="grow"></span>${pm?ib('edit','Editar os passos de modelagem','data-tkpmed'):''}</div>
    ${ed?`<textarea data-tkpmta rows="${Math.min(20,Math.max(5,pm.split('\n').length+2))}">${esc(pm)}</textarea><div class="row"><span class="grow"></span><button data-tkpmcan>Cancelar</button><button class="pri" data-tkpmsv>Salvar</button></div>`
      :pm?`<div class="tkbody">${tkHTML(pm)}</div>`:`<div class="row"><span class="small muted grow">Passos objetivos do que o analista faz no banco para esta atividade.</span>${cap.sample?'<button id="tkPmGen">Gerar os passos</button>':''}<button class="ghost" data-tkpmed>Escrever</button></div>`}</section>`;
  const i=h.lastIndexOf('</article>');return h.slice(0,i)+box+h.slice(i)}
function bindTkPm(det,s,a){det.querySelectorAll('[data-tkpmed]').forEach(b=>b.onclick=()=>{TK.edit=a.id+':paraModelagem';render();setTimeout(()=>{const t=document.querySelector('[data-tkpmta]');if(t)t.focus()},30)});
  const c=det.querySelector('[data-tkpmcan]');if(c)c.onclick=()=>{TK.edit=null;render()};
  const sv=det.querySelector('[data-tkpmsv]');if(sv)sv.onclick=async()=>{const v=det.querySelector('[data-tkpmta]').value;TK.edit=null;await tkUpd('tkativ',a.id,{secoes:{...(a.secoes||{}),paraModelagem:v},editadoEm:nowISO()}).catch(()=>{});render()};
  const g=det.querySelector('#tkPmGen');if(g)g.onclick=async()=>{const box=det.querySelector('.tkpm');const un=fieldLock(box);
    try{await tkPmGen(a);render()}
    catch(e){toast('Não consegui gerar os passos ('+(e.code||e.message)+').')}finally{un()}}}

/* ---------- atividade que já está no Tester: trazer para o Thinker e editar ---------- */
function tkRefDet(x){return tkRefDet0(x).replace('<button id="tkOpenT"',`${cap.sample?`<button class="pri" id="tkEditRef" data-tid="${esc(x.id)}">Editar com o Claude</button>`:''}<button id="tkOpenT"`)}
function tkParseArtia(txt){const sec={analise:'',desenvolvimento:'',evidencias:'',prototipo:'',teste:'',banco:'',modelo:''};const keys=TK_SEC.map(([k,l])=>[k,l]);
  let cur='analise',found=false;for(const ln of String(txt||'').replace(/\r/g,'').split('\n')){const t=ln.replace(/\*\*/g,'').trim().toUpperCase();const k=keys.find(([,l])=>t===l||t===l+':');if(k){cur=k[0];found=true;continue}sec[cur]+=(sec[cur]?'\n':'')+ln}
  for(const k in sec)sec[k]=sec[k].trim();if(!found)sec.analise=String(txt||'').trim();return sec}
async function tkTrazerRef(s,tid,btn){const x=(S.allAtiv||[]).find(y=>y.id===tid);if(!x)return;btnLoad(btn,true);
  try{const sec=tkParseArtia(x.descricao);const base={titulo:x.titulo,secoes:sec};const txt=tkArtiaText(base);
    const r=await cap.db.collection('tkativ').add({sprintId:s.id,ordem:tkNum(x.titulo)||999,titulo:x.titulo,tipo:'ajuste',dep:[],etapa:'pronta',secoes:{...sec,paraModelagem:''},testerAtivId:x.id,enviadoTexto:txt,enviadoTitulo:x.titulo,enviadoEm:nowISO(),trazidaDoTester:true,criadoEm:nowISO()});
    TK.sel[s.id]=r.id;render();setTimeout(()=>{const a=TK.ativ.find(y=>y.id===r.id)||{id:r.id,titulo:x.titulo,secoes:sec};openTkAdj(s,a)},250)}
  catch(e){btnLoad(btn,false);toast('Não foi possível trazer: '+(e.code||e.message))}}

/* ---------- editar a sprint inteira com o Claude ---------- */
function openTkEditSprint(s){const m=$('#modal');
  m.innerHTML=`<div class="box" style="max-width:600px" role="dialog" aria-modal="true" aria-labelledby="tkEsT"><b id="tkEsT" style="font-size:17px">Editar a sprint com o Claude</b>
  <div class="small muted">Explique o que mudar. O Claude propõe e você confere antes de aplicar.</div>
  <label class="small" style="display:grid;gap:4px">O que mudar<textarea id="tkEsTxt" rows="5" placeholder="Ex.: não precisa de 3 atividades, junte tudo numa só; separe a modelagem em uma atividade no começo"></textarea></label>
  <div class="row"><span class="grow"></span><button id="tkEsNo">Cancelar</button><button class="pri" id="tkEsGo">Propor mudanças</button></div></div>`;
  m.hidden=false;setTimeout(()=>$('#tkEsTxt').focus(),30);$('#tkEsNo').onclick=()=>m.hidden=true;
  $('#tkEsGo').onclick=async()=>{const instr=$('#tkEsTxt').value.trim();if(!instr){$('#tkEsTxt').focus();return}m.hidden=true;
    const atuais=TK.ativ.filter(a=>a.etapa!=='conversa').map(a=>({id:a.id,titulo:a.titulo,tipo:a.tipo||'',dep:a.dep||[],secoes:a.secoes||{}}));
    try{const r=await aiJ('ajusteAtv',`${TK_ROLE}

Reorganize as atividades da sprint conforme o pedido do analista. Você pode editar, juntar, separar, criar e remover atividades. O que o pedido não toca fica igual.

${TK_FMT}

Responda APENAS com JSON:
{"resumo":"1 a 3 frases do que mudou","atividades":[{"id":"id de uma atividade atual, ou null se for nova","acao":"manter|editar|criar","titulo":"sem número e sem tag","tipo":"funcionalidade|ajuste|correção|modelagem","temTela":false,"dependencias":[1],"secoes":{"analise":"","desenvolvimento":"","evidencias":"","prototipo":"","teste":"","modelo":"","paraModelagem":""}}]}
- A lista final está na ordem nova. Atividades atuais que não aparecerem serão removidas.
- Em "manter", mande só id e acao.

Pedido: ${instr}

Atividades atuais:
${JSON.stringify(atuais).slice(0,90000)}

Requisitos da sprint:
${String(s.resumo||'').slice(0,15000)}`,{modelTier:'complex'});
      const L=(Array.isArray(r&&r.atividades)?r.atividades:[]).filter(Boolean);if(!L.length)throw new Error('o Claude não devolveu as atividades');tkEsPreview(s,L,String(r.resumo||''),atuais)}
    catch(e){toast(e.code==='not_granted'?'O acesso ao Claude não foi liberado nesta página.':'Não consegui editar a sprint ('+(e.code||e.message)+').',6000)}}}
function tkEsPreview(s,L,resumo,atuais){const m=$('#modal');const ids=new Set(L.map(x=>x.id).filter(Boolean));const rem=atuais.filter(a=>!ids.has(a.id));
  const tag=s.tag?`[${s.tag}] `:'';const lab={manter:'Mantida',editar:'Editada',criar:'Nova'};
  m.innerHTML=`<div class="box" style="max-width:640px" role="dialog" aria-modal="true" aria-labelledby="tkEpT"><b id="tkEpT" style="font-size:17px">Conferir as mudanças</b>${resumo?`<div class="small">${esc(resumo)}</div>`:''}
  <ol class="tkeslist">${L.map(x=>{const at=atuais.find(a=>a.id===x.id);const ac=x.id&&at?(x.acao==='manter'?'manter':'editar'):'criar';return `<li class="tkes-${ac}"><span class="pill">${lab[ac]}</span> ${esc(ac==='manter'?at.titulo.replace(/^\s*\d+[.)]\s*/,''):String(x.titulo||at?.titulo||'').replace(/^\s*\d+[.)]\s*/,''))}</li>`}).join('')}</ol>
  ${rem.length?`<div class="small"><b>Saem da sprint:</b><ul>${rem.map(a=>`<li>${esc(a.titulo)}${(TK.ativ.find(y=>y.id===a.id)||{}).testerAtivId?' <span class="muted">(no Tester ela continua)</span>':''}</li>`).join('')}</ul></div>`:''}
  <div class="row"><span class="grow"></span><button id="tkEpNo">Descartar</button><button class="pri" id="tkEpGo">Aplicar</button></div></div>`;
  m.hidden=false;$('#tkEpNo').onclick=()=>m.hidden=true;
  $('#tkEpGo').onclick=async()=>{const b=$('#tkEpGo');btnLoad(b,true);const snap=TK.ativ.map(a=>JSON.parse(JSON.stringify(a)));
    try{let i=0;for(const x of L){i++;const at=TK.ativ.find(a=>a.id===x.id);const tit=`${i}. ${tag}${String(x.titulo||at?.titulo||'').replace(/^\s*\d+[.)]\s*/,'').replace(/^\[[^\]]+\]\s*/,'').trim()}`;
        if(at&&x.acao==='manter'){await tkUpd('tkativ',at.id,{ordem:i,titulo:`${i}. ${tag}${at.titulo.replace(/^\s*\d+[.)]\s*/,'').replace(/^\[[^\]]+\]\s*/,'').trim()}`});continue}
        const sec=x.secoes||{};const up={ordem:i,titulo:tit,tipo:String(x.tipo||at?.tipo||'funcionalidade'),temTela:!!x.temTela,dep:(x.dependencias||[]).map(Number).filter(n=>n>0&&n<i),secoes:{analise:String(sec.analise||''),desenvolvimento:String(sec.desenvolvimento||''),evidencias:String(sec.evidencias||'Não se aplica'),prototipo:String(sec.prototipo||'Não se aplica'),teste:String(sec.teste||''),banco:'',modelo:String(sec.modelo||'Não se aplica'),paraModelagem:String(sec.paraModelagem||'')},editadoEm:nowISO()};
        if(at)await tkUpd('tkativ',at.id,up);else await cap.db.collection('tkativ').add({sprintId:s.id,etapa:'pronta',criadoEm:nowISO(),...up})}
      const keep=new Set(L.map(x=>x.id).filter(Boolean));for(const a of TK.ativ.filter(a=>a.etapa!=='conversa'&&!keep.has(a.id)))await cap.db.collection('tkativ').doc(a.id).delete();
      await tkUpd('tkspr',s.id,{nAtiv:L.length}).catch(()=>{});m.hidden=true;
      toastUndo('Sprint atualizada.','Desfazer',async()=>{for(const a of TK.ativ)if(!snap.some(x=>x.id===a.id))await cap.db.collection('tkativ').doc(a.id).delete();for(const a of snap){const {id,...d}=a;await cap.db.collection('tkativ').doc(id).set(d)}},12000,{kind:'ok'})}
    catch(e){btnLoad(b,false);toast('Não foi possível aplicar: '+(e.code||e.message))}}}

/* ---------- script de versão: toda a modelagem da sprint num .sql ---------- */
function tkModeloRefs(s){const sent=tkSentIds();return tkTesterAtiv(s).filter(x=>!sent.has(x.id)).map(x=>({titulo:x.titulo,modelo:tkParseArtia(x.descricao).modelo})).filter(x=>x.modelo&&!/^não se aplica/i.test(x.modelo.trim()))}
function tkTemModelo(s){return TK.ativ.some(tkTemModeloA)||tkModeloRefs(s).length>0}
function tkScriptFontes(s){return [...TK.ativ.filter(tkTemModeloA).map(a=>({titulo:a.titulo,modelo:a.secoes.modelo})),...tkModeloRefs(s)].sort((a,b)=>tkNum(a.titulo)-tkNum(b.titulo))}
function openTkScript(s){const F=tkScriptFontes(s);const sig=F.map(f=>f.titulo+'|'+f.modelo).join('\n');const pronto=s.scriptVersao&&s.scriptSig===sig?s.scriptVersao:'';
  const m=$('#modal');const show=sql=>{m.innerHTML=`<div class="box" style="max-width:860px" role="dialog" aria-modal="true" aria-labelledby="tkScT"><div class="row"><b id="tkScT" class="grow" style="font-size:17px">Script de versão</b>${ib('close','Fechar','id="tkScX"')}</div>
    <div class="small muted">${F.length} atividade${F.length>1?'s':''} com modelagem: ${F.map(f=>esc(f.titulo.match(/^\s*\d+/)?.[0]||f.titulo)).join(', ')}.${s.scriptSig&&s.scriptSig!==sig?' A modelagem mudou desde o último script.':''}</div>
    ${sql?codeBox(sql,'sql'):'<div class="small">Ainda não montei o script desta sprint.</div>'}
    <div class="row"><span class="grow"></span>${cap.sample?`<button id="tkScGen">${sql?'Montar de novo':'Montar o script'}</button>`:''}${sql?`<button class="pri" id="tkScDl">Baixar .sql</button>`:''}</div></div>`;
    m.hidden=false;$('#tkScX').onclick=()=>m.hidden=true;
    const dl=$('#tkScDl');if(dl)dl.onclick=async()=>{const name=`script_${String(s.nome||'versao').replace(/[^\w.-]+/g,'_').slice(0,60)}.sql`;const blob=new Blob([sql],{type:'application/sql'});
      try{if(cap.downloads){await cap.downloads.save({filename:name,data:blob});toast('Download pronto.')}else{await navigator.clipboard.writeText(sql);toast('Copiado. Esta visualização não permite baixar arquivos.')}}catch(e){if(e&&e.code!=='dismissed')toast('Não foi possível baixar: '+(e.code||e.message))}};
    const g=$('#tkScGen');if(g)g.onclick=()=>gerar()};
  const gerar=async()=>{m.hidden=true;
    try{const sql=await tkScriptGen(s,F,sig);show(sql)}
    catch(e){toast('Não consegui montar o script ('+(e.code||e.message)+').',6000)}};
  show(pronto)}

/* passos de modelagem (também usado pela fila da noite) */
async function tkPmGen(a){const r=await aiS('passosPm',`${TK_ROLE}\n\nEscreva os passos objetivos e numerados que o analista de modelagem executa no banco Oracle 19c para esta atividade: ambiente/schema, ordem dos scripts, SELECT de conferência que prova que deu certo, grants e sinônimos se houver, carga inicial e o que avisar ao dev. Só o necessário. Use linhas "- " ou "1. ". Responda só com o texto.\n\nAtividade: ${a.titulo}\n\nMODELO DE DADOS:\n${String(a.secoes.modelo).slice(0,20000)}\n\nREQUISITOS DE DESENVOLVIMENTO:\n${tkPlain(a.secoes.desenvolvimento||'').slice(0,8000)}`,{modelTier:'default'});
      const t=String(r&&r.text||'').replace(/^```\w*\n?|```$/g,'').trim();if(!t)throw new Error('resposta vazia');await tkUpd('tkativ',a.id,{secoes:{...(a.secoes||{}),paraModelagem:t},editadoEm:nowISO()})}

/* monta o script de versão (também usado pela fila da noite) */
async function tkScriptGen(s,F,sig){if(!F)F=tkScriptFontes(s);if(!F.length)throw new Error('nenhuma atividade com modelagem');if(sig==null)sig=F.map(f=>f.titulo+'|'+f.modelo).join('\n');const r=await aiS('script',`Você é DBA Oracle 19c da JMJ Sistemas. Junte a modelagem de dados de todas as atividades da sprint em UM script de versão, pronto para rodar no SQL Developer.
Regras:
- Cabeçalho em comentário: sprint, sistema, data de hoje e a lista das atividades incluídas.
- Ordem de execução: CREATE TABLE (na ordem das dependências de FK), depois ALTER TABLE de tabelas existentes (num bloco "-- Alterações em tabelas existentes"), índices, COMMENT ON, cargas (INSERT) e por fim GRANT/SYNONYM se houver.
- Antes de cada bloco, um comentário "-- Atividade N: título" dizendo de qual atividade veio.
- Junte comandos repetidos (mesma tabela/coluna em duas atividades) num só e avise em comentário. Não invente colunas nem tabelas; o que estiver "a definir" vira comentário TODO.
- Identidade: prefira GENERATED BY DEFAULT ON NULL AS IDENTITY no AUTOID.
- Termine cada comando com ";" e o arquivo com "COMMIT;" se houver INSERT/UPDATE.
Responda só com o SQL, sem markdown.

Sprint: ${s.nome||''} · Sistema: ${s.sistema||'JMJ CRM'} · Hoje: ${new Date().toLocaleDateString('pt-BR')}

${F.map(f=>`### ${f.titulo}\n${String(f.modelo).slice(0,20000)}`).join('\n\n').slice(0,90000)}`,{modelTier:'default'});
      const sql=String(r&&r.text||'').replace(/^```\w*\n?|```\s*$/g,'').trim();if(!sql)throw new Error('resposta vazia');await tkUpd('tkspr',s.id,{scriptVersao:sql,scriptSig:sig,scriptEm:nowISO()}).catch(()=>{});return sql}
