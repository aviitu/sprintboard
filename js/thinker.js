/* =====================================================================
   Thinker: criador de sprints. Contexto → rodadas de perguntas →
   requisitos → atividades no formato do Artia (com modelagem e protótipo)
   ===================================================================== */
const TK={spr:[],ativ:[],kb:[],design:[],sub:false,subS:null,unsubA:null,id:null,sel:{},tab:{},loaded:false,aLoaded:false,work:'',err:'',draft:{}};
const TK_SIS0=['JMJ CRM','JMJ Conecta'];
const TK_SEC=[['analise','REQUISITOS DE ANÁLISE'],['desenvolvimento','REQUISITOS DE DESENVOLVIMENTO'],['evidencias','EVIDÊNCIAS'],['prototipo','PROTÓTIPO'],['teste','REQUISITOS DE TESTE'],['banco','BANCO DE DADOS'],['modelo','MODELO DE DADOS']];
const tkView=()=>st.view==='thinker'||st.view==='tkspr';
const tkS=()=>TK.spr.find(x=>x.id===TK.id);
const tkSis=()=>[...new Set([...TK_SIS0,...TK.design.map(d=>d.sistema),...TK.spr.map(s=>s.sistema)].filter(Boolean))];
function tkSubscribe(){if(TK.sub||!cap.db)return;TK.sub=true;const t=setTimeout(()=>{if(!TK.loaded){TK.err='A base demorou para responder. Recarregue a página.';if(tkView())render()}},10000);
  cap.db.collection('tkspr').onSnapshot(s=>{clearTimeout(t);TK.spr=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(b.criadoEm||'').localeCompare(String(a.criadoEm||'')));TK.loaded=true;if(tkView())render()},e=>{TK.err='Não foi possível ler as sprints ('+(e.code||e.message)+').';if(tkView())render()});
  cap.db.collection('tkkb').onSnapshot(s=>{TK.kb=s.docs.map(d=>({id:d.id,...d.data()}));if(tkView())render()},()=>{});
  cap.db.collection('tkdesign').onSnapshot(s=>{TK.design=s.docs.map(d=>({id:d.id,...d.data()}));if(tkView())render()},()=>{})}
function tkSubAtiv(sid){if(TK.subS===sid)return;TK.subS=sid;if(TK.unsubA){try{TK.unsubA()}catch(e){}TK.unsubA=null}TK.ativ=[];TK.aLoaded=false;if(!sid||!cap.db)return;
  TK.unsubA=cap.db.collection('tkativ').where('sprintId','==',sid).onSnapshot(s=>{TK.ativ=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.ordem||0)-(b.ordem||0));TK.aLoaded=true;if(tkView())render()},e=>toast('Não foi possível ler as atividades: '+(e.code||e.message)))}
async function tkUpd(col,id,up){const arr=col==='tkativ'?TK.ativ:col==='tkspr'?TK.spr:col==='tkkb'?TK.kb:TK.design;const o=arr.find(x=>x.id===id);if(o)Object.assign(o,up);
  try{await cap.db.collection(col).doc(id).update(up)}catch(e){toast('Não foi possível salvar: '+(e.code||e.message));throw e}}
/* ---------- texto no formato do Artia: **negrito**, *itálico*, __sublinhado__, "- " listas ---------- */
function tkInline(t){return esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/__(.+?)__/g,'<u>$1</u>').replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g,'$1<i>$2</i>')}
function tkHTML(t,code){t=String(t||'').replace(/\r/g,'');if(!t.trim())return '';if(code)return `<pre class="tkcode">${esc(t)}</pre>`;
  const out=[];let ul=null;const ind=l=>(l.match(/^\s*/)[0].length>=2?1:0);
  for(const raw of t.split('\n')){const m=raw.match(/^\s*[-•*]\s+(.*)$/);if(m){if(!ul){ul=[];}ul.push({lv:ind(raw),t:m[1]});continue}
    if(ul){out.push(tkUl(ul));ul=null}if(raw.trim())out.push(`<p>${tkInline(raw.trim())}</p>`)}
  if(ul)out.push(tkUl(ul));return out.join('')}
function tkUl(items){let h='<ul>',lv=0;for(const it of items){if(it.lv>lv){h+='<ul>';lv=it.lv}else if(it.lv<lv){h+='</ul>';lv=it.lv}h+=`<li>${tkInline(it.t)}</li>`}while(lv-->0)h+='</ul>';return h+'</ul>'}
function tkPlain(t){return String(t||'').replace(/\*\*(.+?)\*\*/g,'$1').replace(/__(.+?)__/g,'$1').replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g,'$1$2')}
function tkArtiaHTML(a){return TK_SEC.map(([k,l])=>{const v=String((a.secoes||{})[k]||'').trim();return `<p><b>${l}</b></p>${k==='banco'?'<p></p>':k==='modelo'&&/^\s*(CREATE|ALTER|INSERT|COMMENT|--)/im.test(v)?v.split('\n').map(x=>`<p>${esc(x)||'&nbsp;'}</p>`).join(''):tkHTML(v)||'<p></p>'}`}).join('')}
function tkArtiaText(a){return TK_SEC.map(([k,l])=>`${l}\n${k==='banco'?'':tkPlain((a.secoes||{})[k]||'').trim()}`).join('\n\n')}
async function tkCopyArtia(a,btn){const html=tkArtiaHTML(a),txt=tkArtiaText(a);
  try{await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([txt],{type:'text/plain'})})]);toast('Atividade copiada no formato do Artia. Cole na descrição.',3600,{kind:'ok'})}
  catch(e){copy(txt,btn)}}
/* ---------- telas ---------- */
const TK_STEPS=[['ctx','Contexto'],['per','Perguntas'],['req','Requisitos'],['atv','Atividades']];
function thinkerHTML(){if(!TK.loaded)return `<div class="scrin"><div class="sk" style="height:64px;max-width:420px"></div><div class="splist"><div class="sk" style="height:140px"></div><div class="sk" style="height:140px"></div></div>${TK.err?`<div class="card empty">${esc(TK.err)}</div>`:''}</div>`;
  return `<div class="scrin"><div class="scrhead"><div><h1>Thinker</h1><p class="small muted" style="margin:0">Conte a demanda, responda as perguntas e receba a sprint quebrada em atividades prontas para o Artia.</p></div><span class="grow"></span><button id="tkKb">Base de conhecimento <span class="small muted">${TK.kb.length}</span></button><button id="tkDs">Kits de design</button><button id="tkImp">Trazer sprint do Tester</button><button class="pri" id="tkNew">Nova sprint</button></div>
  ${TK.spr.length?`<div class="splist">${TK.spr.map(s=>{const n=s.nAtiv||0;const et=s.etapa||'ctx';return `<button class="spcard" data-tks="${esc(s.id)}"><span class="sptop"><span class="spcod">${esc(s.sistema||'')}</span><span class="pill ${et==='atv'?'p-ok':'p-acc'}">${esc((TK_STEPS.find(x=>x[0]===et)||TK_STEPS[0])[1])}</span></span><span class="spname">${esc(s.nome||'Sprint sem nome')}</span>${s.testerSprintId?'<span class="small muted">ligada ao Tester</span>':''}<span class="small muted">${n?`${n} atividade${n>1?'s':''} · `:''}${(s.rodadas||[]).length} rodada${(s.rodadas||[]).length===1?'':'s'} de perguntas · ${esc(fmtDT(s.criadoEm).slice(0,10))}</span></button>`}).join('')}</div>`
   :`<div class="card empty tkempty"><b>Nenhuma sprint ainda.</b><span class="small muted">Comece com um chamado de cliente, uma ata de reunião ou um descritivo curto. O Claude pergunta o que faltar.</span><button class="pri" id="tkNew2">Criar a primeira sprint</button></div>`}</div>`}
function bindThinker(sc){[$('#tkNew'),$('#tkNew2')].forEach(b=>b&&(b.onclick=()=>tkNewSprint()));const kb=$('#tkKb');if(kb)kb.onclick=()=>openTkKb();const im=$('#tkImp');if(im)im.onclick=()=>openTkImport();const ds=$('#tkDs');if(ds)ds.onclick=()=>openTkDesign();
  sc.querySelectorAll('[data-tks]').forEach(b=>b.onclick=()=>{TK.id=b.dataset.tks;nav('tkspr')})}
async function tkNewSprint(){try{const r=await cap.db.collection('tkspr').add({nome:'',tag:'',sistema:'JMJ CRM',contexto:'',fontes:[],usaSprints:[],rodadas:[],resumo:'',etapa:'ctx',criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||''});TK.id=r.id;TK.tab[r.id]='ctx';nav('tkspr')}catch(e){toast('Não foi possível criar: '+(e.code||e.message))}}

function tksprHTML(){const s=tkS();if(!s)return TK.loaded?'<div class="scrin"><div class="card empty">Sprint não encontrada. <button class="linkbtn" data-nav="thinker">Voltar</button></div></div>':'<div class="scrin"><div class="sk" style="height:300px"></div></div>';
  const tab=TK.tab[s.id]||s.etapa||'ctx';const can={ctx:true,per:(s.rodadas||[]).length>0,req:!!s.resumo,atv:TK.ativ.length>0||!!s.resumoOk||!!s.testerSprintId};
  return `<div class="scrin tkw"><div class="scrhead"><div><div class="small muted">${esc(s.sistema||'')}${s.tag?` · [${esc(s.tag)}]`:''}</div><h1>${esc(s.nome||'Nova sprint')}</h1></div><span class="grow"></span>${tab==='atv'&&TK.ativ.length?`<button id="tkCsv">Exportar CSV</button>`:''}${tkTemModelo(s)?'<button id="tkScript">Script de versão</button>':''}${ib('trash','Apagar sprint','id="tkDel"','ib-bad')}</div>
  <div class="pnseg" role="tablist" aria-label="Etapas da sprint">${TK_STEPS.map(([k,l],i)=>`<button role="tab" aria-selected="${tab===k}" data-tkt="${k}"${can[k]?'':' disabled'}><span class="pnstep-n">${i+1}</span>${l}</button>`).join('')}</div>
  ${TK.work?`<div class="pnwork">${esc(TK.work)}</div>`:''}
  <div>${tab==='ctx'?tkCtxHTML(s):tab==='per'?tkPerHTML(s):tab==='req'?tkReqHTML(s):tkAtvHTML(s)}</div></div>`}
function bindTkspr(sc){const s=tkS();if(!s)return;sc.querySelectorAll('[data-tkt]').forEach(b=>b.onclick=()=>{TK.tab[s.id]=b.dataset.tkt;render()});
  const dl=$('#tkDel');if(dl)dl.onclick=()=>tkDelSprint(s);const sv=$('#tkScript');if(sv)sv.onclick=()=>openTkScript(s);const cv=$('#tkCsv');if(cv)cv.onclick=()=>tkCsv(s);
  const tab=TK.tab[s.id]||s.etapa||'ctx';if(tab==='ctx'){bindTkCtx(sc,s);bindTkCtxDet(sc,s)}else if(tab==='per')bindTkPer(sc,s);else if(tab==='req')bindTkReq(sc,s);else bindTkAtv(sc,s)}

/* ---------- 1. contexto ---------- */
function tkCtxHTML(s){const fs=s.fontes||[];const refs=[...S.sprints.map(x=>({id:'t:'+x.id,l:(x.codigo?x.codigo+' · ':'')+x.nome,o:'Tester'})),...TK.spr.filter(x=>x.id!==s.id&&x.resumo).map(x=>({id:'k:'+x.id,l:x.nome||'Sprint sem nome',o:'Thinker'}))];
  return `<div class="tkgrid"><section class="card tkctx"><h2 class="sech">O que precisa ser feito?</h2>
  <div class="formgrid"><label class="full">Nome da sprint<input type="text" id="tkNome" value="${esc(s.nome||'')}" placeholder="Ex.: [4.118.0] - Monitoramento de Integrações"></label>
  <label>Sistema<input type="text" id="tkSis" list="tkSisDL" value="${esc(s.sistema||'JMJ CRM')}"></label><label>Tag das atividades<input type="text" id="tkTag" value="${esc(s.tag||'')}" placeholder="Ex.: GPU"></label></div>
  <datalist id="tkSisDL">${tkSis().map(x=>`<option value="${esc(x)}">`).join('')}</datalist>
  <label class="small" style="display:grid;gap:6px">Chamado, descritivo ou ata<textarea id="tkCtx" rows="10" placeholder="Cole o chamado do cliente, o e-mail ou descreva a demanda com suas palavras. Pode ser curto: o Claude pergunta o que faltar.">${esc(s.contexto||'')}</textarea></label>${tkCtxDetHTML(s)}</section>
  <aside class="tkside"><section class="card"><h3>Materiais</h3>
   ${fs.length?`<ul class="tkfs">${fs.map((f,i)=>`<li><span class="grow"><b>${esc(f.nome)}</b><span class="small muted"> · ${esc(f.tipo==='drive'?'Google Drive':f.tipo==='img'?'imagem':'arquivo')}${f.texto?` · ${Math.round(f.texto.length/1000)||1} mil caracteres`:''}</span></span>${ib('trash','Remover',`data-tkfrm="${i}"`,'ib-bad')}</li>`).join('')}</ul>`:'<p class="small muted" style="margin:0 0 10px">Documentação, prints, ata da daily, collection da API…</p>'}
   <div class="row"><label class="pastebox" style="cursor:pointer;flex:1">Anexar arquivos<input type="file" id="tkFile" multiple hidden accept=".txt,.md,.csv,.json,.sql,.html,.htm,.xml,.yaml,.yml,image/*"></label></div>
   <div class="row" style="margin-top:8px"><input type="url" id="tkDrive" placeholder="Link do Google Drive (Doc, PDF, Word)" style="flex:1"><button id="tkDriveGo">Ler</button></div>
   <p class="small muted" style="margin:8px 0 0">PDF e Word: envie pelo Google Drive. Prints entram como imagem para o Claude ver.</p></section>
  <section class="card"><h3>Usar como referência</h3>${refs.length?`<div class="tkrefs">${refs.map(r=>`<label class="chk"><input type="checkbox" data-tkref="${esc(r.id)}"${(s.usaSprints||[]).includes(r.id)?' checked':''}><span>${esc(r.l)} <span class="small muted">${r.o}</span></span></label>`).join('')}</div>`:'<p class="small muted" style="margin:0">Sem sprints anteriores.</p>'}
   <p class="small muted" style="margin:10px 0 0">A base de conhecimento (${TK.kb.length} ${TK.kb.length===1?'item':'itens'}: tabelas, telas e regras) entra sempre.</p></section></aside></div>
  <div class="tkfoot"><span class="grow small muted">${(s.rodadas||[]).length?'Mudou o contexto? As próximas perguntas já consideram a mudança.':''}</span><button class="pri" id="tkStart">${(s.rodadas||[]).length?'Continuar as perguntas':'Começar as perguntas'}</button></div>`}
function tkReadCtx(s){return {...tkCtxExtra(),nome:$('#tkNome').value.trim(),sistema:$('#tkSis').value.trim()||'JMJ CRM',tag:$('#tkTag').value.trim().replace(/^\[|\]$/g,''),contexto:$('#tkCtx').value}}
function bindTkCtx(sc,s){const save=async()=>{const up=tkReadCtx(s);if(Object.keys(up).some(k=>up[k]!==(s[k]||(k==='sistema'?'JMJ CRM':''))))await tkUpd('tkspr',s.id,up).catch(()=>{})};
  ['#tkNome','#tkSis','#tkTag','#tkCtx'].forEach(q=>{const el=$(q);if(el)el.onchange=save});
  sc.querySelectorAll('[data-tkref]').forEach(c=>c.onchange=()=>{const set=new Set(s.usaSprints||[]);c.checked?set.add(c.dataset.tkref):set.delete(c.dataset.tkref);tkUpd('tkspr',s.id,{usaSprints:[...set]}).catch(()=>{})});
  sc.querySelectorAll('[data-tkfrm]').forEach(b=>b.onclick=()=>{const fs=[...(s.fontes||[])];fs.splice(+b.dataset.tkfrm,1);tkUpd('tkspr',s.id,{fontes:fs}).then(render).catch(()=>{})});
  $('#tkFile').onchange=async e=>{const files=[...e.target.files];e.target.value='';if(!files.length)return;await save();const fs=[...(s.fontes||[])];const bz=waitBox('Lendo os arquivos…');
    try{for(const f of files){if(/^image\//.test(f.type)){if(!cap.assets){toast('Envio de imagens indisponível aqui.');continue}const r=await cap.assets.upload(f);fs.push({tipo:'img',nome:f.name||'print.png',assetId:r.id,url:r.url})}
        else{let t=await f.text();if(/\.html?$/i.test(f.name))t=t.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');fs.push({tipo:'arq',nome:f.name,texto:t.slice(0,120000)})}}
      await tkUpd('tkspr',s.id,{fontes:fs});render()}catch(err){toast('Não foi possível anexar: '+(err.code||err.message))}finally{bz.done()}};
  $('#tkDriveGo').onclick=async()=>{const id=pnDocId($('#tkDrive').value);if(!id){toast('Cole o link de um arquivo do Google Drive.');return}const b=$('#tkDriveGo');btnLoad(b,true);
    try{await save();const p=await pnCall(PN_SRV.drive,'read_file_content',{fileId:id});const txt=typeof p==='string'?p:(p&&(p.fileContent||p.content||p.text))||'';if(!String(txt).trim())throw {code:'tool_error',server:PN_SRV.drive,message:'o arquivo veio vazio'};
      await tkUpd('tkspr',s.id,{fontes:[...(s.fontes||[]),{tipo:'drive',nome:(p&&p.title)||'Arquivo do Drive',url:$('#tkDrive').value.trim(),texto:String(txt).slice(0,120000)}]});render()}
    catch(err){toast(pnErr(err,PN_SRV.drive),7000)}finally{btnLoad(b,false)}};
  $('#tkStart').onclick=async()=>{const up=tkReadCtx(s);if(!up.contexto.trim()&&!(s.fontes||[]).length){toast('Escreva o que precisa ser feito ou anexe um material.');$('#tkCtx').focus();return}
    await tkUpd('tkspr',s.id,{...up,etapa:'per'}).catch(()=>{});TK.tab[s.id]='per';const last=(s.rodadas||[]).slice(-1)[0];if(!last||last.respondidaEm)tkRound(s);else render()}}

/* ---------- 2. perguntas em rodadas ---------- */
function tkPerHTML(s){const R=s.rodadas||[];const cur=R.length&&!R[R.length-1].respondidaEm?R[R.length-1]:null;const done=R.filter(r=>r.respondidaEm);
  return `${done.length?`<details class="card knbox tkpast"><summary><h3 style="display:inline;margin:0">Respostas anteriores</h3> <span class="small muted">· ${done.reduce((n,r)=>n+r.perguntas.length,0)} perguntas em ${done.length} rodada${done.length>1?'s':''}</span></summary><div class="tkqa">${done.map(r=>r.perguntas.map(q=>`<div><b>${esc(q.titulo)}</b><div class="small">${esc(tkAns(q))}</div></div>`).join('')).join('')}</div></details>`:''}
  ${cur?`<section class="card tkround"><div class="row"><h2 class="sech">Rodada ${R.length}</h2><span class="small muted">${cur.perguntas.length} pergunta${cur.perguntas.length>1?'s':''} · a recomendação já vem marcada</span></div>
   ${cur.perguntas.map((q,i)=>{const sel=(q.resp&&q.resp.sel)||(q.rec!=null?[q.rec]:[]);return `<fieldset class="tkq" data-tkq="${i}"><legend><span class="tkqn">${i+1}</span>${esc(q.titulo)}</legend>${q.texto?`<p class="tkqt">${esc(q.texto)}</p>`:''}
     <div class="tkopts">${(q.opcoes||[]).map((o,j)=>`<label class="tkopt${sel.includes(j)?' on':''}"><input type="${q.multipla?'checkbox':'radio'}" name="tkq${i}" value="${j}"${sel.includes(j)?' checked':''}><span>${esc(o)}${q.rec===j?' <span class="tkrec">recomendada</span>':''}</span></label>`).join('')}
     <label class="tkopt tkother"><input type="${q.multipla?'checkbox':'radio'}" name="tkq${i}" value="o"${q.resp&&q.resp.outro?' checked':''}><input type="text" data-tkout="${i}" placeholder="Outra resposta" value="${esc((q.resp&&q.resp.outro)||'')}"></label></div></fieldset>`}).join('')}
   <div class="tkfoot"><button class="ghost" id="tkSkip">Já basta, gerar os requisitos</button><span class="grow"></span><button class="pri" id="tkAnswer">Responder rodada</button></div></section>`
  :`<div class="card empty">${s.resumo?'As perguntas terminaram. <button class="linkbtn" data-tkt="req">Ver os requisitos</button>':'<button class="pri" id="tkMore">Fazer mais perguntas</button>'}</div>`}`}
const tkAns=q=>{const r=q.resp||{};const t=(r.sel||[]).map(j=>(q.opcoes||[])[j]).filter(Boolean);if(r.outro)t.push(r.outro);return t.join('; ')||'(sem resposta)'};
function bindTkPer(sc,s){sc.querySelectorAll('[data-tkt]').forEach(b=>b.onclick=()=>{TK.tab[s.id]=b.dataset.tkt;render()});
  sc.querySelectorAll('.tkq').forEach(fs=>{fs.querySelectorAll('input[type=radio],input[type=checkbox]').forEach(i=>i.onchange=()=>fs.querySelectorAll('.tkopt').forEach(l=>l.classList.toggle('on',l.querySelector('input').checked)));
    const o=fs.querySelector('[data-tkout]');if(o)o.oninput=()=>{const r=fs.querySelector('input[value=o]');if(o.value.trim()&&r&&!r.checked){r.checked=true;r.dispatchEvent(new Event('change'))}}});
  const collect=()=>{const R=JSON.parse(JSON.stringify(s.rodadas||[]));const cur=R[R.length-1];cur.perguntas.forEach((q,i)=>{const fs=sc.querySelector(`[data-tkq="${i}"]`);const sel=[...fs.querySelectorAll('input:checked')].map(x=>x.value).filter(v=>v!=='o').map(Number);const other=fs.querySelector('input[value=o]');q.resp={sel,outro:other&&other.checked?fs.querySelector('[data-tkout]').value.trim():''}});return R};
  const an=$('#tkAnswer');if(an)an.onclick=async()=>{const R=collect();const cur=R[R.length-1];const vazio=cur.perguntas.findIndex(q=>!q.resp.sel.length&&!q.resp.outro);if(vazio>=0){toast('Responda a pergunta '+(vazio+1)+'.');return}
    cur.respondidaEm=nowISO();await tkUpd('tkspr',s.id,{rodadas:R}).catch(()=>{});tkRound(tkS())};
  const sk=$('#tkSkip');if(sk)sk.onclick=async()=>{const R=collect();R[R.length-1].respondidaEm=nowISO();await tkUpd('tkspr',s.id,{rodadas:R}).catch(()=>{});tkRound(tkS(),true)};
  const mo=$('#tkMore');if(mo)mo.onclick=()=>tkRound(s)}

/* ---------- 3. requisitos ---------- */
function tkReqHTML(s){return `<section class="card tkreq"><div class="row"><h2 class="sech">Requisitos da sprint</h2><span class="grow"></span><span class="small muted">${s.resumoOk?'Confirmados':'Revise e ajuste antes de gerar'}</span></div>
  <textarea id="tkRes" rows="22" spellcheck="true">${esc(s.resumo||'')}</textarea>
  <div class="row tkadj"><input type="text" id="tkResAdj" placeholder="Pedir ajuste ao Claude (ex.: separe a regra de permissão por perfil)" style="flex:1"><button id="tkResAdjGo">Ajustar</button></div>
  <div class="tkfoot"><button class="ghost" id="tkBackPer">Fazer mais perguntas</button><span class="grow"></span><button class="pri" id="tkGenAtv">${TK.ativ.length?'Gerar as atividades de novo':'Confirmar e gerar as atividades'}</button></div></section>`}
function bindTkReq(sc,s){const ta=$('#tkRes');ta.onchange=()=>tkUpd('tkspr',s.id,{resumo:ta.value}).catch(()=>{});
  $('#tkBackPer').onclick=async()=>{await tkUpd('tkspr',s.id,{resumo:ta.value}).catch(()=>{});TK.tab[s.id]='per';tkRound(tkS())};
  $('#tkResAdjGo').onclick=()=>tkAdjustReq(s,$('#tkResAdj').value.trim(),$('#tkResAdjGo'));
  $('#tkGenAtv').onclick=async()=>{if(TK.ativ.length&&!confirm2)return tkConfirmRegen(s);await tkUpd('tkspr',s.id,{resumo:ta.value,resumoOk:true}).catch(()=>{});tkGenAtiv(tkS())}}
let confirm2=false;
function tkConfirmRegen(s){const m=$('#modal');m.innerHTML=`<div class="box" role="dialog" aria-modal="true" aria-labelledby="tkRgT"><b id="tkRgT" style="font-size:17px">Gerar as atividades de novo?</b><div class="small">As ${TK.ativ.length} atividades atuais desta sprint, com as suas edições e protótipos, serão substituídas.</div><div class="row"><span class="grow"></span><button id="tkRgNo">Cancelar</button><button class="dangerfill" id="tkRgGo">Substituir</button></div></div>`;
  m.hidden=false;$('#tkRgNo').onclick=()=>m.hidden=true;$('#tkRgGo').onclick=async()=>{m.hidden=true;await tkUpd('tkspr',s.id,{resumo:$('#tkRes').value,resumoOk:true}).catch(()=>{});tkGenAtiv(tkS(),true)}}
/* ---------- 4. atividades (com as da sprint do Tester como referência) ---------- */
const tkNum=t=>{const m=String(t||'').match(/^\s*(\d+)/);return m?+m[1]:0};
function tkTesterAtiv(s){return s.testerSprintId?(S.allAtiv||[]).filter(x=>x.sprintId===s.testerSprintId&&x.status!=='Cancelada').sort((a,b)=>tkNum(a.titulo)-tkNum(b.titulo)||String(a.titulo).localeCompare(String(b.titulo),'pt',{numeric:true})):[]}
const tkSentIds=()=>new Set(TK.ativ.map(a=>a.testerAtivId).filter(Boolean));
function tkPend(s){return TK.ativ.filter(a=>a.etapa!=='conversa'&&(!a.testerAtivId||a.enviadoTexto!==tkArtiaText(a)||a.enviadoTitulo!==a.titulo))}
function tkAtvHTML0(s){const A=TK.ativ;if(!TK.aLoaded)return '<div class="sk" style="height:300px"></div>';const sent=tkSentIds();const T=tkTesterAtiv(s).filter(x=>!sent.has(x.id));
  if(!A.length&&!T.length)return `<div class="card empty">${s.resumoOk?'Nenhuma atividade ainda. <button class="pri" id="tkGenNow">Gerar as atividades</button>':'Confirme os requisitos para gerar as atividades, ou crie uma atividade avulsa.'} <button id="tkAddA">Nova atividade</button></div>`;
  const key=TK.sel[s.id];const selT=key&&key.startsWith('t:')?T.find(x=>'t:'+x.id===key):null;const sel=selT?null:(A.find(x=>x.id===key)||(A.length?A[0]:null));const selT2=selT||(!sel&&T[0])||null;
  const pend=tkPend(s);const sp=s.testerSprintId&&S.sprints.find(x=>x.id===s.testerSprintId);
  return `<div class="tkbar row">${sp?`<span class="small muted">Ligada à sprint do Tester <b>${esc(sp.nome)}</b></span>`:'<span class="small muted">Ainda não está no Tester</span>'}<span class="grow"></span><button class="${pend.length?'pri':''}" id="tkSend"${pend.length?'':' disabled data-tip="Nada novo para enviar"'}>Enviar para o Tester${pend.length?` (${pend.length})`:''}</button></div>
  <div class="tkatv"><nav class="tklist" aria-label="Atividades da sprint">
   ${T.length?`<div class="tklh small muted">No Tester · ${T.length}</div>${T.map(x=>`<button class="tkli tkref${selT2&&selT2.id===x.id?' on':''}" data-tka="t:${esc(x.id)}"><span class="tkli-t">${esc(x.titulo)}</span><span class="small muted">${esc(x.status||'A testar')} · só leitura</span></button>`).join('')}`:''}
   ${T.length?`<div class="tklh small muted">Criadas no Thinker · ${A.length}</div>`:''}
   ${A.map(a=>{const dep=(a.dep||[]).filter(n=>n!==tkNum(a.titulo));const est=a.etapa==='conversa'?'em conversa':a.testerAtivId?(pend.includes(a)?'alterada, falta reenviar':'no Tester'):'falta enviar';return `<button class="tkli${sel&&a.id===sel.id&&!selT2?' on':''}" data-tka="${esc(a.id)}"><span class="tkli-t">${esc(a.titulo)}</span><span class="small muted">${esc(est)}${dep.length?` · depende da ${dep.join(', ')}`:''}${a.prototipo&&a.prototipo.html?' · protótipo':''}</span></button>`}).join('')}
   <button class="ghost tkadd" id="tkAddA">${ICO('plus')}Nova atividade</button></nav>
  ${selT2?tkRefDet(selT2):sel?(sel.etapa==='conversa'?tkConvDet(s,sel):tkDet(s,sel,T)):''}</div>`}
function tkRefDet0(x){return `<article class="card tkdet"><div class="tkdh"><h2 class="tktit" style="margin:0">${esc(x.titulo)}</h2></div><div class="row"><span class="pill s-${slug(x.status||'A testar')}">${esc(x.status||'A testar')}</span><span class="small muted">Atividade da sprint do Tester · só leitura</span><span class="grow"></span><button id="tkOpenT" data-tid="${esc(x.id)}">Abrir no Tester</button></div>
  <section class="tksec"><div class="tksech"><b>DESCRIÇÃO NO ARTIA</b></div><div class="tkbody" style="white-space:pre-wrap">${esc(x.descricao||'Sem descrição.')}</div></section></article>`}
function tkConvDet(s,a){const R=a.rodadas||[];const cur=R.length&&!R[R.length-1].respondidaEm?R[R.length-1]:null;
  return `<article class="card tkdet"><div class="tkdh"><h2 class="tktit" style="margin:0">${esc(a.titulo)}</h2></div>
  <section class="tksec"><div class="tksech"><b>O QUE PEDIRAM</b></div><div class="tkbody" style="white-space:pre-wrap">${esc(a.pedido||'')}</div></section>
  ${R.filter(r=>r.respondidaEm).length?`<details class="knbox"><summary><span class="small">Respostas anteriores</span></summary><div class="tkqa">${R.filter(r=>r.respondidaEm).flatMap(r=>r.perguntas).map(q=>`<div><b>${esc(q.titulo)}</b><div class="small">${esc(tkAns(q))}</div></div>`).join('')}</div></details>`:''}
  ${cur?`<div class="tkround">${tkQHTML(cur.perguntas)}<div class="tkfoot"><button class="ghost" id="tkAvSkip">Já basta, escrever a atividade</button><span class="grow"></span><button class="pri" id="tkAvAns">Responder</button></div></div>`
    :TK.work?'':`<div class="row"><span class="grow small muted">O Claude parou antes de perguntar.</span><button class="pri" id="tkAvGo">Continuar</button></div>`}
  <div class="row"><span class="grow"></span>${ib('trash','Excluir atividade','id="tkDelA"','ib-bad')}</div></article>`}
function tkQHTML(qs){return qs.map((q,i)=>{const sel=(q.resp&&q.resp.sel)||(q.rec!=null?[q.rec]:[]);return `<fieldset class="tkq" data-tkq="${i}"><legend><span class="tkqn">${i+1}</span>${esc(q.titulo)}</legend>${q.texto?`<p class="tkqt">${esc(q.texto)}</p>`:''}
  <div class="tkopts">${(q.opcoes||[]).map((o,j)=>`<label class="tkopt${sel.includes(j)?' on':''}"><input type="${q.multipla?'checkbox':'radio'}" name="tkq${i}" value="${j}"${sel.includes(j)?' checked':''}><span>${esc(o)}${q.rec===j?' <span class="tkrec">recomendada</span>':''}</span></label>`).join('')}
  <label class="tkopt tkother"><input type="${q.multipla?'checkbox':'radio'}" name="tkq${i}" value="o"${q.resp&&q.resp.outro?' checked':''}><input type="text" data-tkout="${i}" placeholder="Outra resposta" value="${esc((q.resp&&q.resp.outro)||'')}"></label></div></fieldset>`}).join('')}
function tkQBind(root){root.querySelectorAll('.tkq').forEach(fs=>{fs.querySelectorAll('input[type=radio],input[type=checkbox]').forEach(i=>i.onchange=()=>fs.querySelectorAll('.tkopt').forEach(l=>l.classList.toggle('on',l.querySelector('input').checked)));
  const o=fs.querySelector('[data-tkout]');if(o)o.oninput=()=>{const r=fs.querySelector('input[value=o]');if(o.value.trim()&&r&&!r.checked){r.checked=true;r.dispatchEvent(new Event('change'))}}})}
function tkQCollect(root,qs){qs.forEach((q,i)=>{const fs=root.querySelector(`[data-tkq="${i}"]`);if(!fs)return;const sel=[...fs.querySelectorAll('input:checked')].map(x=>x.value).filter(v=>v!=='o').map(Number);const other=fs.querySelector('input[value=o]');q.resp={sel,outro:other&&other.checked?fs.querySelector('[data-tkout]').value.trim():''}});return qs}
function tkDet0(s,sel,T){const all=[...T.map(x=>({n:tkNum(x.titulo)})),...TK.ativ.filter(x=>x.id!==sel.id).map(x=>({n:tkNum(x.titulo)}))].map(x=>x.n).filter(n=>n&&n!==tkNum(sel.titulo));
  return `<article class="card tkdet" data-tkdet="${esc(sel.id)}"><div class="tkdh"><input class="tktit" id="tkTit" value="${esc(sel.titulo)}" aria-label="Título da atividade"></div>
   <div class="row tkacts"><button class="pri" id="tkCopy">${ICO('copy')}Copiar para o Artia</button>${sel.temTela||(sel.prototipo&&sel.prototipo.html)?`<button id="tkProto">${sel.prototipo&&sel.prototipo.html?'Ver protótipo':'Gerar protótipo'}</button>`:`<button class="ghost" id="tkProto">Gerar protótipo</button>`}${cap.sample?`<button class="ghost" id="tkAdj">Pedir ajuste</button>`:''}<span class="grow"></span>${sel.testerAtivId?`<span class="small muted">No Tester${sel.enviadoEm?' desde '+esc(fmtDT(sel.enviadoEm).slice(0,10)):''}</span>`:''}${ib('trash','Excluir atividade','id="tkDelA"','ib-bad')}</div>
   <div class="tkdeps small"><span class="muted">Depende de:</span> ${[...new Set(all)].sort((a,b)=>a-b).map(n=>`<label class="chk tkdep"><input type="checkbox" data-tkdep="${n}"${(sel.dep||[]).includes(n)?' checked':''}><span>${n}</span></label>`).join('')||'<span class="muted">nenhuma outra atividade</span>'}</div>
   ${TK_SEC.map(([k,l])=>{const v=String((sel.secoes||{})[k]||'');const ed=TK.edit===sel.id+':'+k;return `<section class="tksec" data-tksec="${k}"><div class="tksech"><b>${l}</b><span class="grow"></span>${k!=='banco'?ib('edit','Editar '+l.toLowerCase(),`data-tked="${k}"`):''}</div>
     ${ed?`<textarea data-tkta="${k}" rows="${Math.min(24,Math.max(4,v.split('\n').length+2))}"${k==='modelo'?' class="mono"':''}>${esc(v)}</textarea><div class="row"><span class="small muted grow">Negrito com **texto**, itálico com *texto*, sublinhado com __texto__ e listas com "- ".</span><button data-tkcan>Cancelar</button><button class="pri" data-tksv="${k}">Salvar</button></div>`
       :k==='banco'?'<p class="small muted">Em branco.</p>':v.trim()?`<div class="tkbody">${tkHTML(v,k==='modelo'&&/^\s*(CREATE|ALTER|INSERT|COMMENT|--)/im.test(v))}</div>`:'<p class="small muted">Vazio.</p>'}</section>`}).join('')}
  </article>`}
function bindTkAtv0(sc,s){sc.querySelectorAll('[data-tkt]').forEach(b=>b.onclick=()=>{TK.tab[s.id]=b.dataset.tkt;render()});const g=$('#tkGenNow');if(g)g.onclick=()=>tkGenAtiv(s);
  sc.querySelectorAll('[data-tka]').forEach(b=>b.onclick=()=>{TK.sel[s.id]=b.dataset.tka;TK.edit=null;render()});
  sc.querySelectorAll('#tkAddA').forEach(b=>b.onclick=()=>openTkNewAtiv(s));
  const sd=$('#tkSend');if(sd)sd.onclick=()=>openTkSend(s);
  const ot=$('#tkOpenT');if(ot)ot.onclick=()=>{const x=(S.allAtiv||[]).find(y=>y.id===ot.dataset.tid);if(!x)return;st.sprint=x.sprintId;st.ativ=x.id;st.mod='ler';saveUI();nav('ativ')};
  const det=sc.querySelector('.tkdet');if(!det)return;const key=TK.sel[s.id];
  const a=TK.ativ.find(x=>x.id===(det.dataset.tkdet||key))||(!key||!key.startsWith('t:')?TK.ativ.find(x=>x.etapa==='conversa'&&(x.id===key||!key)):null);
  const dl=$('#tkDelA');if(dl&&a)dl.onclick=async()=>{const prev={...a};delete prev.id;await cap.db.collection('tkativ').doc(a.id).delete();toastUndo('Atividade excluída'+(a.testerAtivId?' do Thinker (no Tester ela continua).':'.'),'Desfazer',async()=>{await cap.db.collection('tkativ').doc(a.id).set(prev)},8000)};
  if(a&&a.etapa==='conversa'){tkQBind(det);const R=()=>JSON.parse(JSON.stringify(a.rodadas||[]));
    const an=$('#tkAvAns');if(an)an.onclick=async()=>{const r=R();const cur=r[r.length-1];tkQCollect(det,cur.perguntas);const v=cur.perguntas.findIndex(q=>!q.resp.sel.length&&!q.resp.outro);if(v>=0){toast('Responda a pergunta '+(v+1)+'.');return}cur.respondidaEm=nowISO();await tkUpd('tkativ',a.id,{rodadas:r}).catch(()=>{});tkAtivRound(s,TK.ativ.find(x=>x.id===a.id)||a)};
    const sk=$('#tkAvSkip');if(sk)sk.onclick=async()=>{const r=R();const cur=r[r.length-1];tkQCollect(det,cur.perguntas);cur.respondidaEm=nowISO();await tkUpd('tkativ',a.id,{rodadas:r}).catch(()=>{});tkAtivRound(s,TK.ativ.find(x=>x.id===a.id)||a,true)};
    const go=$('#tkAvGo');if(go)go.onclick=()=>tkAtivRound(s,a);return}
  if(!a)return;
  $('#tkTit').onchange=e=>tkUpd('tkativ',a.id,{titulo:e.target.value.trim()||a.titulo}).catch(()=>{});
  $('#tkCopy').onclick=e=>tkCopyArtia(a,e.currentTarget);
  $('#tkProto').onclick=()=>a.prototipo&&a.prototipo.html?openTkProto(s,a):tkGenProto(s,a,'',$('#tkProto'));
  const aj=$('#tkAdj');if(aj)aj.onclick=()=>openTkAdj(s,a);
  sc.querySelectorAll('[data-tkdep]').forEach(c=>c.onchange=()=>{const set=new Set(a.dep||[]);const n=+c.dataset.tkdep;c.checked?set.add(n):set.delete(n);tkUpd('tkativ',a.id,{dep:[...set].sort((x,y)=>x-y)}).catch(()=>{})});
  sc.querySelectorAll('[data-tked]').forEach(b=>b.onclick=()=>{TK.edit=a.id+':'+b.dataset.tked;render();setTimeout(()=>{const t=sc.querySelector('[data-tkta]');if(t)t.focus()},30)});
  sc.querySelectorAll('[data-tkcan]').forEach(b=>b.onclick=()=>{TK.edit=null;render()});
  sc.querySelectorAll('[data-tksv]').forEach(b=>b.onclick=async()=>{const k=b.dataset.tksv;const v=sc.querySelector(`[data-tkta="${k}"]`).value;TK.edit=null;await tkUpd('tkativ',a.id,{secoes:{...(a.secoes||{}),[k]:v},editadoEm:nowISO()}).catch(()=>{});render()})}
function tkNextNum(s){const ns=[...tkTesterAtiv(s).map(x=>tkNum(x.titulo)),...TK.ativ.map(x=>tkNum(x.titulo))];return (ns.length?Math.max(...ns):0)+1}
function tkTagOf(s){if(s.tag)return s.tag;const m=tkTesterAtiv(s).map(x=>(String(x.titulo).match(/\[([A-Za-zÀ-ú0-9 _-]{2,20})\]/)||[])[1]).filter(Boolean);const c={};m.forEach(t=>c[t]=(c[t]||0)+1);return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(x=>x[0])[0]||''}
function openTkNewAtiv0(s){const m=$('#modal');const n=tkNextNum(s);const tag=tkTagOf(s);
  m.innerHTML=`<div class="box" style="max-width:600px" role="dialog" aria-modal="true" aria-labelledby="tkNaT"><b id="tkNaT" style="font-size:17px">Nova atividade · ${n}. ${tag?'['+esc(tag)+'] ':''}</b>
  <div class="small muted">O Claude já conhece as outras atividades da sprint e pergunta só o que faltar para escrever esta.</div>
  <label class="small" style="display:grid;gap:4px">O que pediram?<textarea id="tkNaTxt" rows="7" placeholder="Cole o pedido, o chamado ou descreva com suas palavras."></textarea></label>
  <div class="row"><span class="grow"></span><button id="tkNaNo">Cancelar</button><button class="pri" id="tkNaGo"${cap.sample?'':' disabled'}>Começar</button></div></div>`;
  m.hidden=false;setTimeout(()=>$('#tkNaTxt').focus(),30);$('#tkNaNo').onclick=()=>m.hidden=true;
  $('#tkNaGo').onclick=async()=>{const p=$('#tkNaTxt').value.trim();if(!p){$('#tkNaTxt').focus();return}m.hidden=true;
    try{const r=await cap.db.collection('tkativ').add({sprintId:s.id,ordem:n,titulo:`${n}. ${tag?'['+tag+'] ':''}(em definição)`,tipo:'funcionalidade',dep:[],etapa:'conversa',pedido:p,rodadas:[],secoes:{},criadoEm:nowISO()});
      if(tag&&!s.tag)tkUpd('tkspr',s.id,{tag}).catch(()=>{});TK.sel[s.id]=r.id;const a={id:r.id,sprintId:s.id,ordem:n,titulo:`${n}. ${tag?'['+tag+'] ':''}(em definição)`,pedido:p,rodadas:[],etapa:'conversa'};tkAtivRound(s,a)}
    catch(e){toast('Não foi possível criar: '+(e.code||e.message))}}}
async function tkAtivRound(s,a,forceEnd){if(!cap.sample){toast('O acesso ao Claude não está disponível nesta página.');return}const n0=tkNum(a.titulo)||tkNextNum(s);const tag=tkTagOf(s);const R=a.rodadas||[];if(R.length>=4)forceEnd=true;
  TK.work=forceEnd?'O Claude está escrevendo a atividade…':'O Claude está lendo a sprint e o pedido…';render();
  const T=tkTesterAtiv(s);let left=40000;const outras=[];for(const x of T){const t=`- ${x.titulo}: ${String(x.descricao||'').replace(/\s+/g,' ').slice(0,1800)}`;if(t.length>left)break;left-=t.length;outras.push(t)}
  TK.ativ.filter(x=>x.id!==a.id&&x.etapa!=='conversa').forEach(x=>outras.push(`- ${x.titulo}: ${tkPlain((x.secoes||{}).analise||'').replace(/\s+/g,' ').slice(0,1200)}`));
  const qa=R.filter(r=>r.respondidaEm).flatMap(r=>r.perguntas).map(q=>`- ${q.titulo} → ${tkAns(q)}`).join('\n');
  const prompt=`${TK_ROLE}

Pediram uma atividade nova para uma sprint que já está em andamento. Ela será a atividade ${n0}${tag?` (tag [${tag}])`:''}. ${forceEnd?'Não faça perguntas: escreva a atividade com o que existe e marque "a definir" o que faltar.':`Pergunte só o que falta para escrever ESTA atividade (${tkDetQA(a.detalhe)}, de múltipla escolha, com recomendação). O que já está nas outras atividades da sprint, no pedido, na base de conhecimento ou nas respostas não se pergunta. Se já der para escrever, escreva.`}

${TK_FMT}

Responda APENAS com JSON:
{"pronto":false,"perguntas":[{"titulo":"","texto":"","opcoes":["",""],"multipla":false,"recomendada":0}],"atividade":{"titulo":"sem número e sem tag","tipo":"funcionalidade|ajuste|correção|modelagem","temTela":false,"dependencias":[1],"secoes":{"analise":"","desenvolvimento":"","evidencias":"","prototipo":"","teste":"","modelo":"","paraModelagem":""}}}
- Com "pronto": false, mande só "perguntas". Com "pronto": true, mande só "atividade". "dependencias" usa os números das atividades da sprint.

Sistema: ${s.sistema||'JMJ CRM'} · Sprint: ${s.nome||''}
Pedido:
${String(a.pedido||'').slice(0,20000)}
${qa?`\nRespostas do analista:\n${qa}\n`:''}
Atividades que já existem na sprint (não repita o que elas fazem; aproveite nomes de telas, campos e tabelas):
${outras.join('\n')||'(nenhuma)'}
${s.resumo?`\nRequisitos da sprint:\n${String(s.resumo).slice(0,10000)}\n`:''}${TK.kb.length?`\nBase de conhecimento:\n${tkKbTxt(s.sistema,12000)}\n`:''}`;
  try{const r=await aiJ('novaAtv',prompt,{model:'claude-sonnet-5-5',modelTier:'complex'});const cur=TK.ativ.find(x=>x.id===a.id)||a;
    const ps=(Array.isArray(r&&r.perguntas)?r.perguntas:[]).filter(q=>q&&q.titulo&&Array.isArray(q.opcoes)&&q.opcoes.length).slice(0,6).map((q,i)=>({id:'a'+(R.length+1)+'-'+i,titulo:String(q.titulo).slice(0,300),texto:String(q.texto||'').slice(0,600),opcoes:q.opcoes.map(o=>String(o).slice(0,240)).slice(0,6),multipla:!!q.multipla,rec:Number.isInteger(q.recomendada)&&q.recomendada>=0&&q.recomendada<q.opcoes.length?q.recomendada:null}));
    if(!forceEnd&&!r.pronto&&ps.length){await tkUpd('tkativ',a.id,{rodadas:[...(cur.rodadas||[]),{n:R.length+1,perguntas:ps,em:nowISO()}]})}
    else{const at=r&&r.atividade;if(!at||!at.secoes)throw new Error('o Claude não devolveu a atividade');const sec=at.secoes;
      await tkUpd('tkativ',a.id,{titulo:`${n0}. ${tag?'['+tag+'] ':''}${String(at.titulo||'Nova atividade').replace(/^\s*\d+[.)]\s*/,'').replace(/^\[[^\]]+\]\s*/,'').trim()}`,tipo:String(at.tipo||'funcionalidade'),temTela:!!at.temTela,dep:(at.dependencias||[]).map(Number).filter(x=>x>0&&x!==n0),
        secoes:{analise:String(sec.analise||''),desenvolvimento:String(sec.desenvolvimento||''),evidencias:String(sec.evidencias||'Não se aplica'),prototipo:String(sec.prototipo||(at.temTela?'A definir':'Não se aplica')),teste:String(sec.teste||''),banco:'',modelo:String(sec.modelo||'Não se aplica'),paraModelagem:String(sec.paraModelagem||'')},etapa:'pronta',geradoEm:nowISO()});
      tkUpd('tkspr',s.id,{nAtiv:TK.ativ.length,etapa:'atv'}).catch(()=>{});toast('Atividade pronta. Revise e envie para o Tester.',4200,{kind:'ok'})}}
  catch(e){toast(e.code==='not_granted'?'O acesso ao Claude não foi liberado nesta página.':'Não consegui continuar ('+(e.code||e.message)+').',6000)}finally{TK.work='';render()}}
function openTkSend(s){const pend=tkPend(s);if(!pend.length)return;const sp=s.testerSprintId&&S.sprints.find(x=>x.id===s.testerSprintId);const m=$('#modal');const novas=pend.filter(a=>!a.testerAtivId),alt=pend.filter(a=>a.testerAtivId);
  m.innerHTML=`<div class="box" style="max-width:560px" role="dialog" aria-modal="true" aria-labelledby="tkSdT"><b id="tkSdT" style="font-size:17px">Enviar para o Tester</b>
  <div class="small">${sp?`Sprint <b>${esc(sp.nome)}</b>.`:`Ainda não existe sprint no Tester para esta: vou criar <b>${esc(s.nome||'Sprint do Thinker')}</b>.`}</div>
  ${novas.length?`<div class="small"><b>Entram como novas</b> (A testar, com o selo Novo):<ul>${novas.map(a=>`<li>${esc(a.titulo)}</li>`).join('')}</ul></div>`:''}
  ${alt.length?`<div class="small"><b>Atualizam a descrição</b> (cenários e comentários ficam como estão):<ul>${alt.map(a=>`<li>${esc(a.titulo)}</li>`).join('')}</ul></div>`:''}
  <div class="row"><span class="grow"></span><button id="tkSdNo">Cancelar</button><button class="pri" id="tkSdGo">Enviar</button></div></div>`;
  m.hidden=false;$('#tkSdNo').onclick=()=>m.hidden=true;
  $('#tkSdGo').onclick=async()=>{const b=$('#tkSdGo');btnLoad(b,true);
    try{let sid=s.testerSprintId;if(!sid||!S.sprints.find(x=>x.id===sid)){const r=await cap.db.collection('sprints').add({nome:s.nome||'Sprint do Thinker',codigo:'',artiaUrl:'',criadoEm:nowISO(),criadoPor:me?.id||null,origem:'thinker'});sid=r.id;await tkUpd('tkspr',s.id,{testerSprintId:sid})}
      let n=0,u=0;for(const a of pend){const desc=tkArtiaText(a).slice(0,200000);
        if(a.testerAtivId&&(S.allAtiv||[]).some(x=>x.id===a.testerAtivId)){await cap.db.collection('atividades').doc(a.testerAtivId).update({titulo:a.titulo,descricao:desc,atualizadoPeloThinkerEm:nowISO()});u++}
        else{const r=await cap.db.collection('atividades').add({sprintId:sid,titulo:a.titulo,descricao:desc,status:'A testar',rodada:1,ordem:tkNum(a.titulo)||999,historico:[],novoEm:nowISO(),criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||'',origem:'thinker',thinkerAtivId:a.id});await tkUpd('tkativ',a.id,{testerAtivId:r.id}).catch(()=>{});n++}
        await tkUpd('tkativ',a.id,{enviadoEm:nowISO(),enviadoTexto:tkArtiaText(a),enviadoTitulo:a.titulo}).catch(()=>{})}
      m.hidden=true;toastUndo(`${n?n+' atividade'+(n>1?'s':'')+' nova'+(n>1?'s':''):''}${n&&u?' e ':''}${u?u+' atualizada'+(u>1?'s':''):''} no Tester.`,'Abrir no Tester',()=>{st.sprint=sid;saveUI();nav('kanban')},9000,{kind:'ok'});render()}
    catch(e){btnLoad(b,false);toast('Não foi possível enviar: '+(e.code||e.message))}}}
function openTkImport(){const m=$('#modal');const linked=new Set(TK.spr.map(x=>x.testerSprintId).filter(Boolean));
  m.innerHTML=`<div class="box" style="max-width:560px" role="dialog" aria-modal="true" aria-labelledby="tkImT"><div class="row"><b id="tkImT" class="grow" style="font-size:17px">Trazer sprint do Tester</b>${ib('close','Fechar','id="tkImX"')}</div>
  <div class="small muted">As atividades que já existem entram como referência, só leitura. No Thinker você cria as novas e envia de volta para a mesma sprint.</div>
  <div class="tkimpl">${S.sprints.map(sp=>{const n=(S.allAtiv||[]).filter(a=>a.sprintId===sp.id).length;const ln=linked.has(sp.id);return `<button class="tkkbi" data-tkimp="${esc(sp.id)}"><span class="grow"><b>${esc(sp.nome)}</b><span class="small muted">${sp.codigo?esc(sp.codigo)+' · ':''}${n} atividade${n===1?'':'s'}${ln?' · já está no Thinker':''}</span></span></button>`}).join('')||'<div class="small muted">Nenhuma sprint no Tester.</div>'}</div></div>`;
  m.hidden=false;$('#tkImX').onclick=()=>m.hidden=true;
  m.querySelectorAll('[data-tkimp]').forEach(b=>b.onclick=async()=>{const id=b.dataset.tkimp;const ex=TK.spr.find(x=>x.testerSprintId===id);m.hidden=true;if(ex){TK.id=ex.id;TK.tab[ex.id]='atv';nav('tkspr');return}
    const sp=S.sprints.find(x=>x.id===id);const tmp={testerSprintId:id};const tag=tkTagOf(tmp);
    try{const r=await cap.db.collection('tkspr').add({nome:sp.nome,tag,sistema:'JMJ CRM',contexto:'',fontes:[],usaSprints:[],rodadas:[],resumo:'',etapa:'atv',testerSprintId:id,importada:true,criadoEm:nowISO(),criadoPor:me?.id||null,criadoPorNome:me?.name||''});TK.id=r.id;TK.tab[r.id]='atv';nav('tkspr')}
    catch(e){toast('Não foi possível trazer: '+(e.code||e.message))}})}

async function tkDelSprint(s){const m=$('#modal');m.innerHTML=`<div class="box" role="dialog" aria-modal="true" aria-labelledby="tkDsT"><b id="tkDsT" style="font-size:17px">Apagar a sprint?</b><div class="small">“${esc(s.nome||'Sprint sem nome')}”, as perguntas, os requisitos e as ${TK.ativ.length} atividades somem. A base de conhecimento fica.</div><div class="row"><span class="grow"></span><button id="tkDsNo">Cancelar</button><button class="dangerfill" id="tkDsGo">Apagar</button></div></div>`;
  m.hidden=false;$('#tkDsNo').onclick=()=>m.hidden=true;$('#tkDsGo').onclick=async()=>{btnLoad($('#tkDsGo'),true);try{for(const a of TK.ativ)await cap.db.collection('tkativ').doc(a.id).delete();await cap.db.collection('tkspr').doc(s.id).delete();m.hidden=true;nav('thinker');toast('Sprint apagada.')}catch(e){toast('Não foi possível apagar: '+(e.code||e.message))}}}
async function tkCsv(s){const q=v=>'"'+String(v||'').replace(/"/g,'""')+'"';const csv='﻿'+['Título;Descrição',...TK.ativ.map(a=>q(a.titulo)+';'+q(tkArtiaText(a)))].join('\r\n');
  const name=`sprint-${(s.tag||s.nome||'thinker').normalize('NFD').replace(/[^\w]+/g,'-').replace(/^-|-$/g,'').toLowerCase().slice(0,40)||'thinker'}.csv`;
  try{if(cap.downloads)await cap.downloads.save({filename:name,data:new Blob([csv],{type:'text/csv;charset=utf-8'})});else{await navigator.clipboard.writeText(csv);toast('CSV copiado (download indisponível aqui).')}}catch(e){if(e&&e.code!=='declined')toast('Não foi possível exportar: '+(e.code||e.message))}}

/* ---------- prompts ---------- */
function tkKbTxt(sis,budget){let left=budget||20000;const its=[...TK.kb].sort((a,b)=>(a.sistema===sis?0:1)-(b.sistema===sis?0:1));const out=[];
  for(const k of its){const t=`- [${k.tipo}] ${k.nome}${k.sistema?` (${k.sistema})`:''}: ${String(k.conteudo||'').slice(0,2500)}`;if(t.length>left)break;left-=t.length;out.push(t)}return out.join('\n')}
function tkRefsTxt(s){const out=[];for(const r of s.usaSprints||[]){const [t,id]=r.split(':');
    if(t==='t'){const sp=S.sprints.find(x=>x.id===id);if(!sp)continue;const as=(S.allAtiv||[]).filter(a=>a.sprintId===id);out.push(`### Sprint do Tester: ${sp.nome}\n${as.map(a=>`- ${a.titulo}: ${String(a.descricao||'').replace(/\s+/g,' ').slice(0,700)}`).join('\n')}`)}
    else{const sp=TK.spr.find(x=>x.id===id);if(sp)out.push(`### Sprint do Thinker: ${sp.nome}\n${String(sp.resumo||'').slice(0,6000)}`)}}
  return out.join('\n\n').slice(0,30000)}
function tkBase(s){const fs=(s.fontes||[]).filter(f=>f.texto);let left=60000;const mats=[];for(const f of fs){const t=String(f.texto).slice(0,Math.min(left,30000));if(!t)break;left-=t.length;mats.push(`### ${f.nome}\n${t}`)}
  const qa=(s.rodadas||[]).filter(r=>r.respondidaEm).flatMap(r=>r.perguntas).map(q=>`- ${q.titulo} → ${tkAns(q)}`).join('\n');
  return `Sistema: ${s.sistema||'JMJ CRM'}${s.tag?` · tag das atividades: [${s.tag}]`:''}
Sprint: ${s.nome||'(sem nome)'}

Demanda (chamado, descritivo ou ata):
${String(s.contexto||'(vazio)').slice(0,30000)}
${mats.length?`\nMateriais anexados:\n${mats.join('\n\n')}\n`:''}${(s.fontes||[]).some(f=>f.tipo==='img')?'\n(Os prints anexados seguem como imagem.)\n':''}
${tkRefsTxt(s)?`\nSprints de referência (para manter nomes de telas, tabelas e não repetir o que já existe):\n${tkRefsTxt(s)}\n`:''}
${TK.kb.length?`\nBase de conhecimento (fatos já confirmados; não pergunte o que está aqui):\n${tkKbTxt(s.sistema)}\n`:''}
${qa?`\nRespostas já dadas pelo analista:\n${qa}\n`:''}`}
async function tkImgs(s){const imgs=[];for(const f of (s.fontes||[]).filter(f=>f.tipo==='img').slice(0,5)){try{imgs.push(await (await fetch(f.url)).blob())}catch(e){}}return imgs}
const TK_ROLE='Você é analista de sistemas sênior da JMJ Sistemas (CRM JMJ e outros sistemas para operadoras Unimed). Você transforma demandas em sprints bem especificadas para o time de desenvolvimento, no padrão de atividades do Artia.';
async function tkRound(s,forceEnd){if(!s)return;if(!cap.sample){toast('O acesso ao Claude não está disponível nesta página.');return}
  TK.work=forceEnd?'O Claude está consolidando os requisitos…':'O Claude está lendo o contexto e preparando as perguntas…';TK.tab[s.id]=forceEnd?'req':'per';render();
  const n=(s.rodadas||[]).length;
  const prompt=`${TK_ROLE}

Entreviste o analista até não sobrar decisão em aberto, como uma árvore de decisões: a cada rodada pergunte só o que já dá para perguntar sem depender de respostas que ainda não vieram (a fronteira). Fatos que estão no material, na base de conhecimento ou nas respostas não se perguntam. Decisões são do analista.

Cubra, quando fizer sentido: objetivo e problema; escopo e o que fica fora; regras de negócio (condições, exceções, mensagens); telas exatas do sistema, pelo nome (nunca "todas as telas onde aparece"); perfis e permissões; APIs e integrações (endpoint, request, response, erros); modelagem de dados no Oracle 19c (tabelas existentes x novas, colunas, tipos, chaves, índices, carga inicial); parâmetros e configurações; relatórios e dashboards; critérios de aceite; se precisa de protótipo de tela.

${forceEnd?'O analista pediu para encerrar as perguntas. Não faça perguntas: consolide os requisitos com o que existe e marque como "a definir" o que faltar.':`Esta é a rodada ${n+1}. ${tkDetQS(s.detalhe)}, objetivas, de múltipla escolha (2 a 5 opções curtas e concretas, usando nomes reais do sistema quando houver), cada uma com a sua recomendação. Se não houver mais nada relevante a decidir, não pergunte: encerre.`}

Responda APENAS com JSON:
{"pronto":false,"perguntas":[{"titulo":"pergunta curta","texto":"contexto em 1 frase, opcional","opcoes":["",""],"multipla":false,"recomendada":0}],"resumo":""}
- "pronto": true quando não há mais o que perguntar; aí "perguntas" vem vazio e "resumo" traz os requisitos consolidados.
- "resumo" (só quando pronto): texto puro, com estes blocos em MAIÚSCULAS, cada um seguido de linhas "- ": OBJETIVO; ESCOPO; FORA DO ESCOPO; REGRAS DE NEGÓCIO; TELAS AFETADAS; APIS E INTEGRAÇÕES; MODELAGEM DE DADOS; PERFIS E PERMISSÕES; CRITÉRIOS DE ACEITE; PROTÓTIPO (quais telas precisam); PENDÊNCIAS (o que ficou a definir e com quem). Não invente: o que não foi dito vira "a definir".

${tkCampos(s)}${tkBase(s)}`;
  try{const imgs=await tkImgs(s);const r=await aiJ('perguntas',prompt,{model:'claude-sonnet-5-5',modelTier:'default',...(imgs.length?{images:imgs}:{})});
    const ps=(Array.isArray(r&&r.perguntas)?r.perguntas:[]).filter(q=>q&&q.titulo&&Array.isArray(q.opcoes)&&q.opcoes.length).slice(0,8).map((q,i)=>({id:'q'+(n+1)+'-'+i,titulo:String(q.titulo).slice(0,300),texto:String(q.texto||'').slice(0,600),opcoes:q.opcoes.map(o=>String(o).slice(0,240)).slice(0,6),multipla:!!q.multipla,rec:Number.isInteger(q.recomendada)&&q.recomendada>=0&&q.recomendada<q.opcoes.length?q.recomendada:null}));
    const cur=tkS()||s;
    if(!forceEnd&&!r.pronto&&ps.length){await tkUpd('tkspr',s.id,{rodadas:[...(cur.rodadas||[]),{n:n+1,perguntas:ps,em:nowISO()}],etapa:'per'});TK.tab[s.id]='per'}
    else{const res=String(r.resumo||'').trim();if(!res)throw new Error('o Claude não devolveu os requisitos');await tkUpd('tkspr',s.id,{resumo:res,resumoOk:false,etapa:'req'});TK.tab[s.id]='req';toast('Requisitos prontos. Revise antes de gerar as atividades.',4200,{kind:'ok'})}}
  catch(e){toast(e.code==='not_granted'?'O acesso ao Claude não foi liberado nesta página.':'Não consegui continuar ('+(e.code||e.message)+'). Tente de novo.',6000);if(!(s.rodadas||[]).length&&!forceEnd)TK.tab[s.id]='ctx'}
  finally{TK.work='';render()}}
async function tkAdjustReq(s,instr,btn){if(!instr){toast('Escreva o ajuste.');return}const cur=$('#tkRes').value;btnLoad(btn,true);
  try{const t=await aiS('ajusteReq',`${TK_ROLE}\n\nAjuste os requisitos abaixo conforme o pedido do analista. Mantenha os mesmos blocos em MAIÚSCULAS e as linhas "- ". Não invente. Responda só com o texto final.\n\nPedido: ${instr}\n\nRequisitos atuais:\n${cur}\n\nContexto:\n${tkBase(s).slice(0,40000)}`,{model:'claude-sonnet-5-5',modelTier:'default'});
    const txt=String(t&&t.text||'').replace(/^```\w*\n?|```$/g,'').trim();if(!txt)throw new Error('resposta vazia');await tkUpd('tkspr',s.id,{resumo:txt,resumoOk:false});$('#tkResAdj').value='';render()}
  catch(e){toast('Não consegui ajustar ('+(e.code||e.message)+').')}finally{btnLoad(btn,false)}}
const TK_FMT=`Formato de cada seção (o Artia só aceita negrito, itálico, sublinhado e listas com marcadores):
- Use **negrito**, *itálico*, __sublinhado__ e linhas começando com "- " (sub-itens com dois espaços antes do "- "). Proibido: tabelas, cabeçalhos com #, blocos de código (exceto no MODELO DE DADOS).
- "analise" (REQUISITOS DE ANÁLISE): contexto e objetivo, regras de negócio e a lista das telas afetadas pelo nome.
- "desenvolvimento" (REQUISITOS DE DESENVOLVIMENTO): o que implementar, item a item, por tela/API (campos, validações, mensagens, endpoints com request e response).
- "evidencias" (EVIDÊNCIAS): só em correção/bug, os prints necessários; senão "Não se aplica".
- "prototipo" (PROTÓTIPO): "A definir" quando a atividade tem tela nova ou alterada; senão "Não se aplica".
- "teste" (REQUISITOS DE TESTE): passo a passo para um tester que não conhece a demanda, tela por tela, com o resultado esperado em cada passo; requests e SQL de conferência completos, prontos para copiar.
- "modelo" (MODELO DE DADOS): scripts Oracle 19c. Tabela nova: CREATE TABLE com tipos, PK, FKs, COMMENT ON. Tabela que já existe: bloco separado só com ALTER TABLE (com uma linha "-- Alterações em tabelas existentes" antes). Sem mudança de estrutura: "Não se aplica".
- "paraModelagem" (PARA MODELAGEM, uso interno, NÃO vai para o Artia): só quando o MODELO DE DADOS tiver script. Passos objetivos e numerados do que o analista faz no banco, na ordem: em qual ambiente/schema rodar, quais scripts, conferências (SELECT que prova que deu certo), grants, sinônimos, carga inicial e o que avisar ao dev. Sem script: vazio.
- Nunca invente link, regra, tela ou tabela: use "a definir".`;
async function tkGenAtiv(s,replace){if(!cap.sample){toast('O acesso ao Claude não está disponível nesta página.');return}
  TK.work='O Claude está quebrando a sprint em atividades…';TK.tab[s.id]='atv';render();
  try{const r=await aiJ('quebrar',`${TK_ROLE}

Quebre a sprint em atividades por funcionalidade, ponta a ponta: cada atividade entrega algo testável (tela + regra + API + banco). Quando a modelagem for grande ou base para várias atividades, crie uma atividade de modelagem no início. Ordene pela sequência de desenvolvimento e indique dependências pelo número de ordem. Títulos curtos e funcionais, sem número e sem tag (o sistema coloca).

${TK_FMT}

Responda APENAS com JSON: {"atividades":[{"titulo":"","tipo":"funcionalidade|ajuste|correção|modelagem","temTela":false,"dependencias":[1],"secoes":{"analise":"","desenvolvimento":"","evidencias":"","prototipo":"","teste":"","modelo":"","paraModelagem":""}}]}

REQUISITOS CONFIRMADOS:
${String(s.resumo||'').slice(0,40000)}

CONTEXTO:
${tkCampos(s)}${tkBase(s).slice(0,60000)}`,{model:'claude-sonnet-5-5',modelTier:'complex'});
    const L=(Array.isArray(r&&r.atividades)?r.atividades:[]).filter(a=>a&&a.titulo);if(!L.length)throw new Error('o Claude não devolveu atividades');
    if(replace||TK.ativ.length)for(const a of TK.ativ)await cap.db.collection('tkativ').doc(a.id).delete();
    let i=0;for(const a of L){i++;const sec=a.secoes||{};await cap.db.collection('tkativ').add({sprintId:s.id,ordem:i,titulo:`${i}. ${s.tag?`[${s.tag}] `:''}${String(a.titulo).replace(/^\s*\d+[.)]\s*/,'').replace(/^\[[^\]]+\]\s*/,'').trim()}`,tipo:String(a.tipo||'funcionalidade'),temTela:!!a.temTela,dep:(a.dependencias||[]).map(Number).filter(n=>n>0&&n<i),
      secoes:{analise:String(sec.analise||''),desenvolvimento:String(sec.desenvolvimento||''),evidencias:String(sec.evidencias||'Não se aplica'),prototipo:String(sec.prototipo||(a.temTela?'A definir':'Não se aplica')),teste:String(sec.teste||''),banco:'',modelo:String(sec.modelo||'Não se aplica'),paraModelagem:String(sec.paraModelagem||'')},criadoEm:nowISO()})}
    await tkUpd('tkspr',s.id,{etapa:'atv',nAtiv:L.length,resumoOk:true});TK.sel[s.id]=null;toast(`${L.length} atividades prontas.`,3600,{kind:'ok'});tkLearn(s,L)}
  catch(e){toast(e.code==='not_granted'?'O acesso ao Claude não foi liberado nesta página.':'Não consegui gerar as atividades ('+(e.code||e.message)+').',6000)}
  finally{TK.work='';render()}}
/* base de conhecimento: o que a sprint confirmou vira fato para as próximas */
async function tkLearn(s,L){try{const r=await aiJ('base',`Extraia da sprint abaixo os fatos duráveis do sistema ${s.sistema||'JMJ CRM'} para uma base de conhecimento: tabelas (nome e colunas principais com tipo), telas (nome, caminho no menu, campos), APIs (endpoint, finalidade) e regras de negócio confirmadas. Só o que foi confirmado; nada "a definir". Responda APENAS com JSON {"itens":[{"tipo":"tabela|tela|api|regra","nome":"","conteudo":""}]} (conteúdo em texto puro, até 1500 caracteres).

REQUISITOS:
${String(s.resumo||'').slice(0,20000)}

MODELAGEM:
${L.map(a=>String((a.secoes||{}).modelo||'')).filter(x=>!/^não se aplica/i.test(x.trim())).join('\n\n').slice(0,20000)}`,{modelTier:'default'});
    let n=0;for(const it of (r&&r.itens)||[]){if(!it||!it.nome)continue;const tipo=['tabela','tela','api','regra'].includes(it.tipo)?it.tipo:'regra';const ex=TK.kb.find(k=>k.tipo===tipo&&norm(k.nome)===norm(it.nome)&&(k.sistema||'')===(s.sistema||''));
      const data={tipo,nome:String(it.nome).slice(0,200),sistema:s.sistema||'',conteudo:String(it.conteudo||'').slice(0,4000),origem:'sprint:'+s.id,origemNome:s.nome||'',atualizadoEm:nowISO()};
      if(ex){if(!ex.manual)await cap.db.collection('tkkb').doc(ex.id).update(data)}else await cap.db.collection('tkkb').add({...data,criadoEm:nowISO()});n++}
    if(n)toast(`Base de conhecimento atualizada com ${n} ite${n===1?'m':'ns'} desta sprint.`,4200)}catch(e){}}
function openTkAdj(s,a){const m=$('#modal');m.innerHTML=`<div class="box" style="max-width:560px" role="dialog" aria-modal="true" aria-labelledby="tkAjT"><b id="tkAjT" style="font-size:17px">Pedir ajuste ao Claude</b><div class="small muted">${esc(a.titulo)}</div>
  <label class="small" style="display:grid;gap:4px">O que mudar<textarea id="tkAjTxt" rows="4" placeholder="Ex.: inclua a validação de CPF no cadastro e o SELECT de conferência no teste"></textarea></label>
  <div class="row"><span class="grow"></span><button id="tkAjNo">Cancelar</button><button class="pri" id="tkAjGo">Ajustar</button></div></div>`;
  m.hidden=false;setTimeout(()=>$('#tkAjTxt').focus(),30);$('#tkAjNo').onclick=()=>m.hidden=true;
  $('#tkAjGo').onclick=async()=>{const instr=$('#tkAjTxt').value.trim();if(!instr)return;m.hidden=true;TK.work='O Claude está ajustando a atividade…';render();
    try{const r=await aiJ('ajusteAtv',`${TK_ROLE}\n\nAjuste a atividade conforme o pedido e mantenha o resto.\n\n${TK_FMT}\n\nResponda APENAS com JSON {"titulo":"","secoes":{"analise":"","desenvolvimento":"","evidencias":"","prototipo":"","teste":"","modelo":"","paraModelagem":""}}\n\nPedido: ${instr}\n\nAtividade atual:\n${JSON.stringify({titulo:a.titulo,secoes:a.secoes})}\n\nRequisitos da sprint:\n${String(s.resumo||'').slice(0,20000)}`,{model:'claude-sonnet-5-5',modelTier:'default'});
      const sec=r&&r.secoes;if(!sec)throw new Error('resposta vazia');await tkUpd('tkativ',a.id,{titulo:String(r.titulo||a.titulo).trim()||a.titulo,secoes:{...a.secoes,...Object.fromEntries(Object.entries(sec).map(([k,v])=>[k,String(v||'')])),banco:''},editadoEm:nowISO()})}
    catch(e){toast('Não consegui ajustar ('+(e.code||e.message)+').')}finally{TK.work='';render()}}}
/* ---------- protótipo interativo no design do sistema ---------- */
const tkDesignOf=sis=>TK.design.find(d=>norm(d.sistema)===norm(sis||''));
async function tkGenProto(s,a,instr,btn){if(!cap.sample){toast('O acesso ao Claude não está disponível nesta página.');return}const d=tkDesignOf(s.sistema);
  if(!d||!d.guia){const m=$('#modal');m.innerHTML=`<div class="box" style="max-width:520px" role="dialog" aria-modal="true" aria-labelledby="tkPdT"><b id="tkPdT" style="font-size:17px">Falta o kit de design do ${esc(s.sistema||'sistema')}</b><div class="small">Para o protótipo sair com a cara do ${esc(s.sistema||'sistema')}, o Thinker precisa aprender o design dele uma vez: você copia o HTML e o CSS de uma tela pelo console do navegador e envia alguns prints.</div><div class="row"><button id="tkPdAny">Gerar mesmo assim</button><span class="grow"></span><button class="pri" id="tkPdGo">Configurar o kit</button></div></div>`;
    m.hidden=false;$('#tkPdGo').onclick=()=>openTkDesign(s.sistema);$('#tkPdAny').onclick=()=>{m.hidden=true;tkProtoRun(s,a,instr,null)};return}
  tkProtoRun(s,a,instr,d)}
async function tkProtoRun(s,a,instr,d){TK.work='O Claude está desenhando o protótipo…';render();
  try{const imgs=[];if(d)for(const p of (d.prints||[]).slice(0,3)){try{imgs.push(await (await fetch(p.url)).blob())}catch(e){}}
    const r=await aiS('prototipo',`Você é designer de produto e front-end da JMJ Sistemas. Gere um protótipo de tela interativo para a atividade abaixo, do sistema ${s.sistema||'JMJ CRM'}.

${d?`Siga exatamente o design do sistema (cores, fontes, espaçamentos, componentes, cabeçalho, menu, tabelas, botões, campos):\n${String(d.guia).slice(0,8000)}\n\nTrecho do CSS real do sistema (reaproveite variáveis e classes):\n${String(d.css||'').slice(0,20000)}\n\nTrecho do HTML real de uma tela (reaproveite a estrutura do layout):\n${String(d.html||'').slice(0,15000)}\n${imgs.length?'\nOs prints do sistema seguem como imagem.\n':''}`:'Ainda não há kit de design deste sistema: use um visual neutro e sóbrio de sistema web corporativo.'}

Regras do protótipo:
- Um único documento HTML completo, autocontido (CSS e JS embutidos, sem nenhum recurso externo, sem fontes externas), em português do Brasil.
- Interativo de verdade: navegação entre as telas envolvidas, filtros, modais, abas, validações e mensagens descritas nas regras de negócio; dados de exemplo realistas (nomes, protocolos, datas, Unimeds), nunca "Lorem ipsum".
- Mostre só o que a atividade muda ou cria, dentro do layout do sistema (menu e cabeçalho podem ser simplificados).
- Responsivo e acessível (rótulos nos campos, foco visível).
Responda SOMENTE com o HTML, começando por <!doctype html>.
${instr?`\nAjuste pedido pelo analista: ${instr}\n\nProtótipo atual:\n${String((a.prototipo&&a.prototipo.html)||'').slice(0,60000)}\n`:''}
ATIVIDADE ${a.titulo}
${TK_SEC.filter(([k])=>['analise','desenvolvimento','teste'].includes(k)).map(([k,l])=>`${l}\n${tkPlain((a.secoes||{})[k]||'')}`).join('\n\n').slice(0,20000)}`,{model:'claude-sonnet-5-5',modelTier:'complex',...(imgs.length?{images:imgs}:{})});
    let html=String(r&&r.text||'').trim().replace(/^```(?:html)?\s*/i,'').replace(/```\s*$/,'').trim();const i0=html.search(/<!doctype html|<html/i);if(i0>0)html=html.slice(i0);
    if(!/<html|<body|<div/i.test(html))throw new Error('o Claude não devolveu HTML');if(html.length>400000)throw new Error('protótipo grande demais');
    const sec={...(a.secoes||{})};if(!sec.prototipo||/^(a definir|não se aplica)/i.test(sec.prototipo.trim()))sec.prototipo=`Protótipo no Sprintboard: Thinker › ${s.nome||'sprint'} › ${a.titulo} (HTML interativo, disponível para baixar).`;
    await tkUpd('tkativ',a.id,{prototipo:{html,sistema:s.sistema||'',em:nowISO(),comKit:!!d},secoes:sec,temTela:true});TK.work='';render();openTkProto(s,TK.ativ.find(x=>x.id===a.id)||a)}
  catch(e){toast(e.code==='not_granted'?'O acesso ao Claude não foi liberado nesta página.':'Não consegui gerar o protótipo ('+(e.code||e.message)+').',6000)}finally{TK.work='';render()}}
function openTkProto(s,a){const p=a.prototipo||{};const m=$('#modal');
  m.innerHTML=`<div class="box tkpbox" role="dialog" aria-modal="true" aria-labelledby="tkPT"><div class="row"><b id="tkPT" class="grow" style="font-size:16px">Protótipo · ${esc(a.titulo)}</b>${p.comKit===false?'<span class="small muted">sem kit de design</span>':''}<button id="tkPDl">${ICO('download')}Baixar HTML</button>${ib('close','Fechar','id="tkPX"')}</div>
  <iframe class="tkframe" sandbox="allow-scripts allow-forms allow-modals" title="Protótipo ${esc(a.titulo)}"></iframe>
  <div class="row"><input type="text" id="tkPAdj" placeholder="Pedir ajuste (ex.: o filtro de datas fica acima da tabela)" style="flex:1"><button class="pri" id="tkPAdjGo">Ajustar</button></div></div>`;
  m.hidden=false;m.querySelector('.tkframe').srcdoc=p.html||'';const close=()=>{m.hidden=true;m.innerHTML=''};$('#tkPX').onclick=close;
  $('#tkPDl').onclick=async()=>{const name=a.titulo.normalize('NFD').replace(/[^\w]+/g,'-').replace(/^-|-$/g,'').toLowerCase().slice(0,50)+'.html';try{if(cap.downloads)await cap.downloads.save({filename:name,data:new Blob([p.html||''],{type:'text/html'})});else copy(p.html||'',$('#tkPDl'))}catch(e){if(e&&e.code!=='declined')toast('Não foi possível baixar: '+(e.code||e.message))}};
  $('#tkPAdjGo').onclick=()=>{const t=$('#tkPAdj').value.trim();if(!t)return;close();tkGenProto(s,a,t)}}

/* ---------- kits de design por sistema ---------- */
const TK_SNIP=`copy('<style>\\n'+[...document.styleSheets].map(s=>{try{return [...s.cssRules].map(r=>r.cssText).join('\\n')}catch(e){return ''}}).join('\\n')+'\\n</style>\\n'+document.body.outerHTML)`;
function openTkDesign(foco){const m=$('#modal');let cur=foco||tkSis()[0];
  const paint=()=>{const d=tkDesignOf(cur)||{};m.innerHTML=`<div class="box" style="max-width:760px" role="dialog" aria-modal="true" aria-labelledby="tkDsT"><div class="row"><b id="tkDsT" class="grow" style="font-size:17px">Kits de design</b>${ib('close','Fechar','id="tkDsX"')}</div>
    <div class="row tksis">${tkSis().map(x=>`<button class="chipbtn${x===cur?' on':''}" data-tksis="${esc(x)}">${esc(x)}${tkDesignOf(x)&&tkDesignOf(x).guia?' ✓':''}</button>`).join('')}<input type="text" id="tkSisNew" placeholder="Outro sistema" style="width:150px"><button class="chipbtn" id="tkSisAdd">+</button></div>
    <section class="tkkit"><b>${esc(cur)}</b><span class="small muted">${d.guia?` · aprendido em ${esc(fmtDT(d.atualizadoEm))}`:' · ainda sem kit'}</span>
     <ol class="small tksteps"><li>Abra uma tela representativa do ${esc(cur)} no navegador (de preferência uma com menu, tabela, filtros e formulário).</li><li>Aperte F12, vá em <b>Console</b>, cole o comando abaixo e tecle Enter: ele copia o CSS e o HTML da tela.</li><li>Cole aqui embaixo. Repita em outra tela se quiser e envie 1 a 3 prints.</li></ol>
     <div class="tksnip"><code>${esc(TK_SNIP)}</code>${ib('copy','Copiar comando','id="tkSnip"')}</div>
     <textarea id="tkDsHtml" rows="6" class="mono" placeholder="Cole aqui o que o comando copiou (ou envie arquivos .html e .css)">${esc(d.raw?String(d.raw).slice(0,4000)+(String(d.raw).length>4000?'\n…':''):'')}</textarea>
     <div class="row"><label class="pastebox" style="cursor:pointer">Arquivos .html/.css<input type="file" id="tkDsF" accept=".html,.htm,.css" multiple hidden></label><label class="pastebox" style="cursor:pointer">Prints (${(d.prints||[]).length})<input type="file" id="tkDsP" accept="image/*" multiple hidden></label><span class="grow"></span><button class="pri" id="tkDsGo"${cap.sample?'':' disabled'}>${d.guia?'Aprender de novo':'Aprender o design'}</button></div>
     ${d.guia?`<details class="knbox"><summary><span class="small">Guia de design aprendido</span></summary><textarea id="tkDsG" rows="10">${esc(d.guia)}</textarea><div class="row"><span class="grow"></span><button id="tkDsGs">Salvar guia</button></div></details>`:''}
     <div class="small muted" id="tkDsMsg"></div></section></div>`;
    m.hidden=false;$('#tkDsX').onclick=()=>{m.hidden=true;m.innerHTML=''};
    m.querySelectorAll('[data-tksis]').forEach(b=>b.onclick=()=>{cur=b.dataset.tksis;paint()});
    $('#tkSisAdd').onclick=()=>{const v=$('#tkSisNew').value.trim();if(v){cur=v;TK_SIS0.includes(v)||TK_SIS0.push(v);paint()}};
    $('#tkSnip').onclick=e=>copy(TK_SNIP,e.currentTarget);
    let files='';$('#tkDsF').onchange=async e=>{for(const f of e.target.files)files+=`\n/* ${f.name} */\n`+await f.text();$('#tkDsMsg').textContent=`${e.target.files.length} arquivo(s) prontos para aprender.`};
    $('#tkDsP').onchange=async e=>{if(!cap.assets)return;const ps=[...((tkDesignOf(cur)||{}).prints||[])];for(const f of e.target.files){const r=await cap.assets.upload(f);ps.push({assetId:r.id,url:r.url,nome:f.name})}await tkSaveDesign(cur,{prints:ps.slice(-3)});paint()};
    const gs=$('#tkDsGs');if(gs)gs.onclick=async()=>{await tkSaveDesign(cur,{guia:$('#tkDsG').value});$('#tkDsMsg').textContent='Guia salvo.'};
    $('#tkDsGo').onclick=async()=>{const typed=$('#tkDsHtml').value;const raw=(files+'\n'+(/\n…$/.test(typed)?(tkDesignOf(cur)||{}).raw||'':typed)).trim();if(!raw){$('#tkDsMsg').textContent='Cole o que o comando copiou ou envie os arquivos.';return}
      const b=$('#tkDsGo');btnLoad(b,true);$('#tkDsMsg').textContent='O Claude está estudando o design…';
      try{const css=(raw.match(/<style[\s\S]*?<\/style>/gi)||[]).join('\n').replace(/<\/?style>/gi,'')+'\n'+(raw.match(/\/\* [^*]+\.css \*\/[\s\S]*?(?=\n\/\* [^*]+\.(?:css|html?) \*\/|$)/gi)||[]).join('\n');
        const html=raw.replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<svg[\s\S]*?<\/svg>/gi,'<svg/>').replace(/\s{2,}/g,' ');
        const cssKeep=tkCssKeep(css);const imgs=[];for(const p of ((tkDesignOf(cur)||{}).prints||[]))try{imgs.push(await (await fetch(p.url)).blob())}catch(e){}
        const r=await aiS('design',`Estude o design do sistema "${cur}" a partir do CSS, do HTML${imgs.length?' e dos prints':''} abaixo e escreva um guia de design para outro designer recriar telas idênticas. Seja concreto, com valores reais: paleta (hex de fundo, superfícies, texto, primária, estados), tipografia (família, tamanhos, pesos), espaçamentos e raios, cabeçalho e menu (posição, cores, itens), botões (variações), campos e filtros, tabelas e paginação, abas, modais, mensagens e badges, ícones, densidade geral e padrões de layout. Cite as classes e variáveis CSS que devem ser reaproveitadas. Texto puro em tópicos "- ", até 60 tópicos.\n\nCSS:\n${cssKeep.slice(0,40000)}\n\nHTML:\n${html.slice(0,30000)}`,{model:'claude-sonnet-5-5',modelTier:'default',...(imgs.length?{images:imgs.slice(0,3)}:{})});
        const guia=String(r&&r.text||'').trim();if(!guia)throw new Error('resposta vazia');
        await tkSaveDesign(cur,{guia:guia.slice(0,16000),css:cssKeep.slice(0,40000),html:html.slice(0,40000),raw:raw.slice(0,60000)});files='';paint();$('#tkDsMsg').textContent='Design aprendido. Os próximos protótipos do '+cur+' usam este kit.'}
      catch(e){$('#tkDsMsg').textContent=e.code==='not_granted'?'O acesso ao Claude não foi liberado nesta página.':'Não consegui aprender ('+(e.code||e.message)+').'}finally{btnLoad(b,false)}}};
  paint()}
function tkCssKeep(css){const rules=String(css||'').split(/(?<=\})\s*/);const pri=[],rest=[];for(const r of rules){if(/@font-face|@keyframes/.test(r))continue;(/:root|--[\w-]+\s*:|body|header|nav|menu|btn|button|table|th|td|input|select|modal|card|tab|badge|form|label|sidebar|navbar/i.test(r)?pri:rest).push(r)}return pri.join('\n')+'\n'+rest.join('\n')}
async function tkSaveDesign(sis,up){const ex=tkDesignOf(sis);const id=ex?ex.id:('ds-'+norm(sis).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')).slice(0,60);
  const data={...(ex||{}),sistema:sis,...up,atualizadoEm:nowISO(),atualizadoPor:me?.id||null};delete data.id;await cap.db.collection('tkdesign').doc(id).set(data);if(ex)Object.assign(ex,up);else TK.design.push({id,...data})}

/* ---------- base de conhecimento ---------- */
function openTkKb(){const m=$('#modal');let q='',edit=null;const TIPOS={tabela:'Tabela',tela:'Tela',api:'API',regra:'Regra'};
  const paint=()=>{const list=TK.kb.filter(k=>!q||norm(k.nome+' '+k.conteudo+' '+(k.sistema||'')).includes(norm(q))).sort((a,b)=>String(a.tipo).localeCompare(b.tipo)||String(a.nome).localeCompare(b.nome));
    m.innerHTML=`<div class="box" style="max-width:780px" role="dialog" aria-modal="true" aria-labelledby="tkKbT"><div class="row"><b id="tkKbT" class="grow" style="font-size:17px">Base de conhecimento</b>${ib('close','Fechar','id="tkKbX"')}</div>
    <p class="small muted" style="margin:0">Tabelas, telas, APIs e regras que o Claude consulta em toda sprint. Cada sprint confirmada acrescenta o que aprendeu; o que você edita aqui fica protegido.</p>
    <div class="row"><input type="search" id="tkKbQ" placeholder="Buscar" value="${esc(q)}" style="flex:1"><button id="tkKbAdd">${ICO('plus')}Novo item</button><button id="tkKbDdl">Importar CREATE TABLE</button></div>
    ${edit?`<div class="tkkbf card"><div class="formgrid"><label>Tipo<select id="kbTipo">${Object.entries(TIPOS).map(([k,l])=>`<option value="${k}"${edit.tipo===k?' selected':''}>${l}</option>`).join('')}</select></label><label>Sistema<input type="text" id="kbSis" list="tkSisDL2" value="${esc(edit.sistema||'JMJ CRM')}"></label><label class="full">Nome<input type="text" id="kbNome" value="${esc(edit.nome||'')}"></label><label class="full">Conteúdo<textarea id="kbCont" rows="7" class="${edit.tipo==='tabela'?'mono':''}">${esc(edit.conteudo||'')}</textarea></label></div><datalist id="tkSisDL2">${tkSis().map(x=>`<option value="${esc(x)}">`).join('')}</datalist><div class="row">${edit.id?ib('trash','Apagar item','id="kbDel"','ib-bad'):''}<span class="grow"></span><button id="kbNo">Cancelar</button><button class="pri" id="kbOk">Salvar</button></div></div>`:''}
    <div class="tkkbl">${list.map(k=>`<button class="tkkbi" data-kb="${esc(k.id)}"><span class="pill">${TIPOS[k.tipo]||k.tipo}</span><span class="grow"><b>${esc(k.nome)}</b><span class="small muted"> · ${esc(k.sistema||'')}${k.manual?' · editado por você':k.origemNome?' · de '+esc(k.origemNome):''}</span><span class="small tkkbc">${esc(String(k.conteudo||'').slice(0,160))}</span></span></button>`).join('')||'<div class="small muted">Nada por aqui ainda.</div>'}</div></div>`;
    m.hidden=false;$('#tkKbX').onclick=()=>{m.hidden=true;m.innerHTML=''};const qi=$('#tkKbQ');qi.oninput=()=>{q=qi.value;const pos=qi.selectionStart;paint();const n=$('#tkKbQ');n.focus();n.setSelectionRange(pos,pos)};
    $('#tkKbAdd').onclick=()=>{edit={tipo:'tabela',sistema:'JMJ CRM'};paint()};
    m.querySelectorAll('[data-kb]').forEach(b=>b.onclick=()=>{edit={...TK.kb.find(k=>k.id===b.dataset.kb)};paint()});
    $('#tkKbDdl').onclick=()=>{const box=m.querySelector('.box');box.insertAdjacentHTML('beforeend',`<div class="card tkkbf"><label class="small" style="display:grid;gap:4px">Cole um ou mais CREATE TABLE (Oracle)<textarea id="kbDdl" rows="8" class="mono"></textarea></label><div class="row"><input type="text" id="kbDdlSis" list="tkSisDL" value="JMJ CRM" style="width:180px"><span class="grow"></span><button class="pri" id="kbDdlGo">Importar</button></div></div>`);
      $('#kbDdlGo').onclick=async()=>{const t=$('#kbDdl').value;const sis=$('#kbDdlSis').value.trim()||'JMJ CRM';const parts=t.split(/(?=CREATE\s+TABLE)/i).filter(x=>/CREATE\s+TABLE/i.test(x));let n=0;
        for(const p of parts){const nm=(p.match(/CREATE\s+TABLE\s+([\w$."]+)/i)||[])[1];if(!nm)continue;const nome=nm.replace(/"/g,'').split('.').pop().toUpperCase();const ex=TK.kb.find(k=>k.tipo==='tabela'&&norm(k.nome)===norm(nome));
          const data={tipo:'tabela',nome,sistema:sis,conteudo:p.trim().slice(0,4000),manual:true,atualizadoEm:nowISO()};if(ex)await cap.db.collection('tkkb').doc(ex.id).update(data);else await cap.db.collection('tkkb').add({...data,criadoEm:nowISO()});n++}
        toast(n?`${n} tabela${n>1?'s':''} importada${n>1?'s':''}.`:'Não encontrei CREATE TABLE no texto.',3600,{kind:n?'ok':undefined});setTimeout(paint,300)}};
    if(edit){$('#kbNo').onclick=()=>{edit=null;paint()};const dl=$('#kbDel');if(dl)dl.onclick=async()=>{await cap.db.collection('tkkb').doc(edit.id).delete();edit=null;setTimeout(paint,200)};
      $('#kbOk').onclick=async()=>{const data={tipo:$('#kbTipo').value,sistema:$('#kbSis').value.trim(),nome:$('#kbNome').value.trim(),conteudo:$('#kbCont').value,manual:true,atualizadoEm:nowISO()};if(!data.nome){$('#kbNome').focus();return}
        if(edit.id)await cap.db.collection('tkkb').doc(edit.id).update(data);else await cap.db.collection('tkkb').add({...data,criadoEm:nowISO()});edit=null;setTimeout(paint,200)}}};
  paint()}

/* ---------- tela ---------- */
function renderThinker(sc){tkSubscribe();if(st.view==='tkspr')tkSubAtiv(TK.id);const key=st.view+'|'+TK.id;sc.dataset.v=st.view;
  sc.innerHTML=st.view==='thinker'?thinkerHTML():tksprHTML();sc.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>nav(b.dataset.nav));
  if(st.view==='thinker')bindThinker(sc);else bindTkspr(sc);if(key!==lastScreen){lastScreen=key;enterAnim(sc)}}

