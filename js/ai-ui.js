/* ---------- cada ação do Claude tem a sua própria animação de carregamento ---------- */
const AIA={
 chat:['O Claude está respondendo','<rect class="a-b" x="6" y="10" width="36" height="24" rx="8"/><path class="a-b" d="M14 34l-4 8 10-8"/><circle class="a-d a-d1" cx="16" cy="22" r="2.6"/><circle class="a-d a-d2" cx="24" cy="22" r="2.6"/><circle class="a-d a-d3" cx="32" cy="22" r="2.6"/>'],
 concluir:['Revisando os testes da atividade','<path class="a-l" d="M20 13h20M20 24h20M20 35h20"/><path class="a-c a-c1" d="M7 13l3 3 5-6"/><path class="a-c a-c2" d="M7 24l3 3 5-6"/><path class="a-c a-c3" d="M7 35l3 3 5-6"/>'],
 finalizar:['Escrevendo os comentários da rodada','<path class="a-pole" d="M12 6v38"/><path class="a-flag" d="M12 8c8-4 14 4 24 0v16c-10 4-16-4-24 0z"/>'],
 rascunho:['Rascunhando o apontamento','<path class="a-ln" d="M6 40h36"/><g class="a-pen"><path d="M30 10l6 6-16 16-7 1 1-7z"/><path d="M27 13l6 6"/></g>'],
 conferir:['Conferindo o cenário com os requisitos','<rect class="a-pg" x="10" y="5" width="28" height="38" rx="4"/><path class="a-pl" d="M16 14h16M16 21h16M16 28h10"/><path class="a-x a-x1" d="M28 30l8 8"/><path class="a-x a-x2" d="M36 30l-8 8"/>'],
 revisar:['Revisando o cenário','<rect class="a-cd" x="5" y="12" width="30" height="28" rx="4"/><path class="a-cl" d="M11 21h18M11 28h12"/><g class="a-pc"><path d="M34 6l6 6-12 12-7 1 1-7z"/></g>'],
 estiloPn:['Estudando as versões anteriores','<path class="a-bk" d="M24 12c-6-4-12-4-18-2v28c6-2 12-2 18 2 6-4 12-4 18-2V10c-6-2-12-2-18 2z"/><path class="a-bk" d="M24 12v28"/><path class="a-pgf" d="M24 12c4-3 9-3 14-2v28c-5-1-10-1-14 2z"/>'],
 ajusteAtv:['Ajustando a atividade','<path class="a-tr" d="M8 12h32M8 24h32M8 36h32"/><circle class="a-k a-k1" cx="14" cy="12" r="4"/><circle class="a-k a-k2" cx="32" cy="24" r="4"/><circle class="a-k a-k3" cx="20" cy="36" r="4"/>'],
 design:['Aprendendo o design do sistema','<rect class="a-sw a-s1" x="6" y="16" width="8" height="16" rx="3"/><rect class="a-sw a-s2" x="16" y="16" width="8" height="16" rx="3"/><rect class="a-sw a-s3" x="26" y="16" width="8" height="16" rx="3"/><rect class="a-sw a-s4" x="36" y="16" width="6" height="16" rx="3"/>'],
 validar:['Pesando o resultado com o esperado','<path class="a-ps" d="M24 8v34M14 42h20"/><g class="a-bm"><path d="M8 14h32"/><path d="M8 14l-4 10h8zM40 14l-4 10h8z"/></g>'],
 itemPn:['Escrevendo o item da versão','<rect class="a-dc" x="9" y="5" width="30" height="38" rx="4"/><path class="a-wl a-w1" d="M15 14h18"/><path class="a-wl a-w2" d="M15 21h18"/><path class="a-wl a-w3" d="M15 28h18"/><path class="a-wl a-w4" d="M15 35h10"/>'],
 triagem:['Separando as atividades da sprint','<path class="a-fn" d="M6 8h36L28 26v14l-8 4V26z"/><circle class="a-fd a-f1" cx="16" cy="4" r="2.4"/><circle class="a-fd a-f2" cx="24" cy="4" r="2.4"/><circle class="a-fd a-f3" cx="32" cy="4" r="2.4"/>'],
 reescrever:['Reescrevendo o apontamento','<g class="a-rot"><path d="M36 16a14 14 0 0 0-24 2"/><path d="M12 10v8h8"/><path d="M12 32a14 14 0 0 0 24-2"/><path d="M36 38v-8h-8"/></g>'],
 retificar:['Retificando o comentário','<path class="a-old" d="M6 30h36"/><g class="a-er"><rect x="10" y="20" width="14" height="10" rx="2" transform="rotate(-20 17 25)"/></g>'],
 dados:['Trocando os dados para o ambiente atual','<rect class="a-r1" x="6" y="10" width="36" height="10" rx="3"/><rect class="a-r2" x="6" y="28" width="36" height="10" rx="3"/>'],
 analisar:['Comparando o retorno com o esperado','<path class="a-tx" d="M6 12h36M6 20h28M6 28h36M6 36h22"/><g class="a-mg"><circle cx="18" cy="22" r="8"/><path d="M24 28l7 7"/></g>'],
 ajusteReq:['Ajustando os requisitos','<rect class="a-li a-l1" x="8" y="7" width="32" height="8" rx="3"/><rect class="a-li a-l2" x="8" y="20" width="32" height="8" rx="3"/><rect class="a-li a-l3" x="8" y="33" width="32" height="8" rx="3"/>'],
 novaAtv:['Pensando na nova atividade','<rect class="a-na" x="8" y="8" width="32" height="32" rx="6"/><path class="a-pl2" d="M24 16v16M16 24h16"/>'],
 quebrar:['Quebrando a sprint em atividades','<rect class="a-q0" x="8" y="16" width="32" height="16" rx="3"/><rect class="a-qa" x="8" y="16" width="9" height="16" rx="3"/><rect class="a-qb" x="19.5" y="16" width="9" height="16" rx="3"/><rect class="a-qc" x="31" y="16" width="9" height="16" rx="3"/>'],
 base:['Guardando o que a sprint ensinou','<rect class="a-bl a-b1" x="10" y="34" width="28" height="7" rx="2"/><rect class="a-bl a-b2" x="13" y="25" width="22" height="7" rx="2"/><rect class="a-bl a-b3" x="16" y="16" width="16" height="7" rx="2"/>'],
 prototipo:['Desenhando o protótipo','<rect class="a-wf" x="5" y="7" width="38" height="34" rx="3"/><path class="a-wi a-w5" d="M5 15h38"/><path class="a-wi a-w6" d="M11 22h12M11 28h20M11 34h8"/><rect class="a-wi a-w7" x="29" y="21" width="9" height="15" rx="2"/>'],
 perguntas:['Preparando as perguntas','<path class="a-qm" d="M17 16a7 7 0 1 1 10 6c-2 1-3 2-3 5"/><circle class="a-qd" cx="24" cy="35" r="2.4"/>'],
 geral:['O Claude está trabalhando','<g class="a-orb"><circle cx="24" cy="10" r="3"/><circle cx="36" cy="30" r="3"/><circle cx="12" cy="30" r="3"/></g>']};
AIA.blocoPn=['Editando o bloco do documento',AIA.itemPn[1]];AIA.script=['Montando o script da versão',AIA.base[1]];AIA.passosPm=['Escrevendo os passos de modelagem',AIA.rascunho[1]];
/* palavras que giram enquanto o Claude trabalha */
const AIW0=['Matutando','Sopesando','Ruminando','Cogitando','Esmiuçando','Destrinchando','Garimpando','Cismando','Maquinando','Elucubrando','Ponderando','Conjecturando','Deslindando','Esquadrinhando','Perscrutando','Remoendo','Tateando','Peneirando','Decantando','Destilando','Aquilatando','Cotejando','Burilando','Lapidando','Alinhavando','Engendrando','Escarafunchando','Fuçando','Ciscando','Desembaraçando','Desenrolando o novelo','Botando os pingos nos is','Pesando os prós e contras','Virando a casa do avesso','Separando o joio do trigo','Puxando o fio da meada','Procurando agulha no palheiro','Costurando as pontas soltas','Lendo as entrelinhas','Medindo duas vezes antes de cortar','Montando o quebra-cabeça','Passando a limpo','Dando uma olhada no mapa','Vendo onde o calo aperta'];
const AIWK={blocoPn:['Reescrevendo','Burilando','Lapidando'],chat:['Proseando','Matutando','Cogitando'],concluir:['Conferindo','Pente-finando','Sopesando'],finalizar:['Redigindo','Alinhavando','Costurando'],rascunho:['Rascunhando','Rabiscando','Garatujando'],keeper:['Arrumando','Catalogando','Etiquetando'],conferir:['Confrontando','Cotejando','Esmiuçando'],revisar:['Retocando','Burilando','Lapidando'],estiloPn:['Folheando','Estudando','Ruminando'],ajusteAtv:['Calibrando','Afinando','Ajeitando'],design:['Observando','Aquarelando','Destrinchando'],validar:['Sopesando','Aquilatando','Ponderando'],itemPn:['Redigindo','Tecendo','Lapidando'],triagem:['Peneirando','Joeirando','Separando'],reescrever:['Reescrevendo','Remodelando','Repensando'],retificar:['Retificando','Corrigindo','Aparando'],dados:['Trocando','Ajeitando','Garimpando'],analisar:['Esquadrinhando','Perscrutando','Comparando'],ajusteReq:['Afinando','Reordenando','Lapidando'],novaAtv:['Matutando','Arquitetando','Engendrando'],quebrar:['Destrinchando','Fatiando','Desmembrando'],base:['Guardando','Catalogando','Anotando'],prototipo:['Rabiscando','Esboçando','Desenhando'],perguntas:['Cismando','Indagando','Matutando'],geral:[]};
function aiWord(k,i){const L=[...(AIWK[k]||[]),...AIW0];return L[i%L.length]}
let AIK=null;const AIRUN=new Map();let aiSeq=0;
/* quem o usuário PRECISA esperar abre o pop-up no centro; o que roda em segundo plano usa a notificação rápida do canto */
const AIBLOCK=new Set(['script','triagem','estiloPn','design','perguntas','ajusteReq','ajusteAtv','novaAtv','quebrar','base','prototipo','analisar','revisar','conferir']);
const WAITRUN=new Map();let waitSeq=0,waitTimer=null,waitK=null;
function waitPop(k){const id=++waitSeq;WAITRUN.set(id,{k,t0:Date.now()});waitPaint();return()=>{WAITRUN.delete(id);waitPaint()}}
/* espera que não é do Claude (ler arquivos, criar versão, importar): mesmo pop-up no centro */
function waitBox(msg){const id=++waitSeq;WAITRUN.set(id,{k:'geral',t0:Date.now(),label:msg});waitPaint();return{done(){WAITRUN.delete(id);waitPaint()},set(m){const r=WAITRUN.get(id);if(r){r.label=m;waitPaint()}}}}
function waitFmt(ms){const s=Math.round(ms/1000);return s<60?s+'s':Math.floor(s/60)+'min '+String(s%60).padStart(2,'0')+'s'}
function waitPaint(){let w=document.getElementById('waitpop');if(!w){w=document.createElement('div');w.id='waitpop';w.hidden=true;document.body.appendChild(w)}
  if(!WAITRUN.size){clearInterval(waitTimer);waitTimer=null;waitK=null;w.classList.add('out');setTimeout(()=>{if(!WAITRUN.size){w.hidden=true;w.innerHTML='';w.classList.remove('out')}},180);return}
  const r=[...WAITRUN.values()][0];w.classList.remove('out');
  const wk=r.k+'|'+(r.label||'');if(w.hidden||waitK!==wk){waitK=wk;w.hidden=false;w.innerHTML=`<div class="box genbox" role="alertdialog" aria-modal="true" aria-labelledby="wpT" tabindex="-1"><div class="wpart ak-${r.k}"><svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${AIA[r.k][1]}</svg></div><b id="wpT" style="font-size:18px">${esc(r.label||AIA[r.k][0])}</b><div class="small muted" id="wpS" role="status"></div></div>`;const b=w.querySelector('.box');if(b)b.focus({preventScroll:true})}
  const tick=()=>{const e=document.getElementById('wpS');const rs=[...WAITRUN.values()];if(e&&rs.length)e.textContent=waitFmt(Date.now()-rs[0].t0)+(rs.length>1?` · mais ${rs.length-1} em andamento`:'')};tick();
  if(!waitTimer)waitTimer=setInterval(tick,1000)}
function aiOn(k){if(!AIA[k])k='geral';if(AIBLOCK.has(k)&&!genBoxOpen())return waitPop(k);const id=++aiSeq;AIRUN.set(id,{k,t0:Date.now()});aiPaint();return()=>{AIRUN.delete(id);aiPaint()}}
function aiPaint(){let host=document.getElementById('aiLoad');if(!host){host=document.createElement('div');host.id='aiLoad';host.setAttribute('role','status');host.setAttribute('aria-live','polite');document.body.appendChild(host)}
  const by=new Map();for(const r of AIRUN.values()){const o=by.get(r.k)||{n:0,t0:r.t0};o.n++;o.t0=Math.min(o.t0,r.t0);by.set(r.k,o)}
  document.body.classList.toggle('ai-on',by.size>0);
  const have=new Set([...host.children].map(c=>c.dataset.k));
  for(const [k,o] of by){let el=host.querySelector(`[data-k="${k}"]`);if(!el){el=document.createElement('div');el.className='aiw ak-'+k;el.dataset.k=k;el.dataset.w0=Math.floor(Math.random()*7);el.innerHTML=`<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${AIA[k][1]}</svg><div class="aiwt"><b class="aiwd">${esc(aiWord(k,+el.dataset.w0))}…</b><span class="aiws"></span></div>`;host.appendChild(el)}
    el.dataset.t0=o.t0;el.dataset.n=o.n;have.delete(k)}
  for(const k of have){const el=host.querySelector(`[data-k="${k}"]`);if(el){el.classList.add('out');setTimeout(()=>{el.remove();aiStack()},220)}}
  aiStack();aiTick()}
function aiStack(){const host=document.getElementById('aiLoad');const vis=host&&!document.body.classList.contains('ai-center')?[...host.children].filter(c=>!c.classList.contains('out')):[];
  document.body.style.setProperty('--aih',vis.length?(host.getBoundingClientRect().height+10)+'px':'0px')}
const AIWLONG=['Sopesando','Destrinchando'];
function aiIdxAt(k,w0,ms){let i=0,acc=0;for(;;){const d=AIWLONG.includes(aiWord(k,w0+i))?8000:3000;if(acc+d>ms)return w0+i;acc+=d;i++}}
function genBoxOpen(){return document.querySelector('#modal:not([hidden]) .genbox')}
function aiCenter(){const gb=genBoxOpen();const was=document.body.classList.contains('ai-center');document.body.classList.toggle('ai-center',!!gb);if(was!==!!gb)aiStack();if(!gb)return;
  /* tela cheia aberta: a notificação do canto sai, o texto dela passa para o centro */if(!was){const t=document.getElementById('toast');if(t&&!t.hidden&&!t.querySelector('.tundo')){const tx=t.querySelector('.ttx');if(tx&&tx.textContent.trim()){let n=gb.querySelector('.gnote');if(!n){n=document.createElement('div');n.className='gnote';n.setAttribute('role','status');const sp=gb.querySelector('.gsteps');if(sp)sp.before(n);else gb.append(n)}n.textContent=tx.textContent.trim()}hideToast()}}
  const els=[...document.querySelectorAll('#aiLoad .aiw:not(.out)')];let g=gb.querySelector('.gai');
  if(!els.length){if(g)g.textContent='';return}
  if(!g){g=document.createElement('div');g.className='gai';g.setAttribute('aria-live','off');const sub=gb.querySelector('#gSub');if(sub)sub.after(g);else gb.append(g)}
  const el=els[0];g.textContent=(el.querySelector('.aiws')?.textContent||'').split(' · ').slice(1).join(' · ')}
let aiTimer=null;function aiTick(){clearTimeout(aiTimer);const host=document.getElementById('aiLoad');if(!host)return;let any=false;
  host.querySelectorAll('.aiw:not(.out)').forEach(el=>{any=true;const s=Math.round((Date.now()-(+el.dataset.t0))/1000);const n=+el.dataset.n;const k=el.dataset.k;
    const w0=el.getBoundingClientRect().width;
    el.querySelector('.aiws').textContent=AIA[k][0]+' · '+(n>1?`${n} em andamento · `:'')+(s<60?`${s}s`:`${Math.floor(s/60)}min ${s%60}s`);
    const w=el.querySelector('.aiwd');const idx=aiIdxAt(k,+el.dataset.w0,Date.now()-(+el.dataset.t0));if(w&&w.dataset.i!==String(idx)){w.dataset.i=idx;w.classList.remove('aiwsw');void w.offsetWidth;w.classList.add('aiwsw');w.textContent=aiWord(k,idx)+'…'}
    aiResize(el,w0)});
  aiCenter();if(any)aiTimer=setTimeout(aiTick,1000)}
function aiResize(el,w0){const w1=el.getBoundingClientRect().width;if(Math.abs(w1-w0)<1)return;
  el.style.transition='none';el.style.width=w0+'px';void el.offsetWidth;
  el.style.transition='width .28s cubic-bezier(.3,.7,.2,1)';el.style.width=w1+'px';
  clearTimeout(el._aiRt);el._aiRt=setTimeout(()=>{el.style.transition='';el.style.width=''},300)}
/* aviso antes de gastar o limite do Claude em ações caras; "não perguntar de novo" vale só nesta sessão do navegador */
const COSTOK=new Set();
function costAsk(key,titulo,msg,go,later){if(COSTOK.has(key)){go();return}const m=$('#modal');
  m.innerHTML=`<div class="box" style="max-width:460px" role="dialog" aria-modal="true" aria-labelledby="csT"><b id="csT" style="font-size:17px">${esc(titulo)}</b><div class="small">${esc(msg)}</div><label class="chk small"><input type="checkbox" id="csNo"><span>Não perguntar de novo nesta sessão</span></label><div class="row"><span class="grow"></span><button id="csN">Cancelar</button>${later&&cap.db?'<button id="csL" title="Guarda na fila para você rodar tudo de uma vez à noite">Deixar para a noite</button>':''}<button class="pri" id="csY">Continuar</button></div></div>`;m.hidden=false;
  const cl=$('#csL');if(cl)cl.onclick=async()=>{m.hidden=true;m.innerHTML='';await filaAdd(later)};
  $('#csN').onclick=()=>{m.hidden=true;m.innerHTML=''};$('#csY').onclick=()=>{if($('#csNo').checked)COSTOK.add(key);m.hidden=true;m.innerHTML='';go()};setTimeout(()=>$('#csY').focus(),30)}
/* memória de respostas: a mesma pergunta (mesma entrada) não é paga duas vezes na sessão */
const AIMEMO=new Map();const AIMEMO_K=new Set(['triagem','estiloPn','design','conferir','dados','analisar','validar','perguntas','concluir']);
function aiJ(k,input,opts){if(AIMEMO_K.has(k)&&typeof input==='string'&&!(opts&&opts.images)){const key=k+'|'+input.length+'|'+input;if(AIMEMO.has(key)){return Promise.resolve(JSON.parse(AIMEMO.get(key)))}
    AIK=k;return cap.sample.json(input,opts).then(r=>{try{AIMEMO.set(key,JSON.stringify(r));if(AIMEMO.size>40)AIMEMO.delete(AIMEMO.keys().next().value)}catch(e){}return r})}
  AIK=k;return cap.sample.json(input,opts)}
function aiS(k,input,opts){AIK=k;return cap.sample(input,opts)}
function aiWrap(){if(!cap.sample||cap.sample.__ai)return;const orig=cap.sample;
  const w=async(input,opts)=>{const k=AIK;AIK=null;const off=k==='cenarios'?()=>{}:aiOn(k||'geral');try{return await orig(input,opts)}finally{off()}};
  w.json=async(input,opts)=>{const k=AIK;AIK=null;const off=k==='cenarios'?()=>{}:aiOn(k||'geral');try{return await orig.json(input,opts)}finally{off()}};
  for(const p of Object.keys(orig))if(!(p in w))w[p]=typeof orig[p]==='function'?orig[p].bind(orig):orig[p];if(orig.limits&&!w.limits)w.limits=orig.limits.bind(orig);w.__ai=true;cap.sample=w}
(function aiWait(n){if(cap.sample){aiWrap();return}if(n<120)setTimeout(()=>aiWait(n+1),250)})(0);

/* ---------- marca do Claude ao lado do nome ---------- */
const CL_ICON='<svg class="clogo" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1l1.5 5.5L15 8l-5.5 1.5L8 15 6.5 9.5 1 8l5.5-1.5z" fill="currentColor"/></svg>';
const CL_TITLES='.who2,.askbox .from,h1,h2,h3';
const CL_SKIP='textarea,input,select,option,script,style,pre,code,.cl-name,[contenteditable],.pnpaper';
function decorateClaude(root){if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeValue.includes('Claude')&&n.parentElement&&n.parentElement.closest(CL_TITLES)&&!n.parentElement.closest(CL_SKIP)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});const ns=[];while(w.nextNode())ns.push(w.currentNode);
  for(const n of ns){const f=document.createDocumentFragment();n.nodeValue.split(/(Claude)/).forEach(part=>{if(part==='Claude'){const s=document.createElement('span');s.className='cl-name';s.innerHTML=CL_ICON+'Claude';f.append(s)}else if(part)f.append(document.createTextNode(part))});n.replaceWith(f)}}
let clRaf=0;new MutationObserver(()=>{if(clRaf)return;clRaf=requestAnimationFrame(()=>{clRaf=0;decorateClaude(document.body)})}).observe(document.body,{childList:true,subtree:true,characterData:true});
decorateClaude(document.body);

/* campo sendo atualizado pelo Claude: shimmer e bloqueio até terminar */
function fieldLock(...els){const list=els.flat().filter(Boolean);list.forEach(el=>{el.inert=true;el.classList.add('flocked');el.setAttribute('aria-busy','true')});
  return()=>list.forEach(el=>{el.inert=false;el.classList.remove('flocked');el.removeAttribute('aria-busy')})}
