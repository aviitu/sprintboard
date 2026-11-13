const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STATUS=['A testar','Em teste','Em desenvolvimento','Reteste','Aprovada','Reprovada','Cancelada'];
const CLASSES=[{k:'BUG-DEV',l:'BUG-DEV',art:'[BUG-DEV]',css:'c-BUG-DEV',d:'Bug de código'},{k:'BUG-ANALISE',l:'BUG-ANÁLISE',art:'[BUG-ANÁLISE]',css:'c-BUG-ANALISE',d:'Requisito que precisa mudar'},{k:'BUG-BACK',l:'BUG-BACK',art:'[BUG-BACK]',css:'c-BUG-BACK',d:'Voltou da correção ainda com erro'},{k:'VALIDAR',l:'VALIDAR REGRA',art:'[PARA DEV - Validar regra]',css:'c-VALIDAR',d:'Ponto a validar com o dev'}];
const CL=k=>CLASSES.find(c=>c.k===k)||CLASSES[0];
const RES={pendente:'Pendente',aprovado:'Aprovado',reprovado:'Reprovado',validar:'Validar com dev',na:'Não se aplica',bloqueado:'Bloqueado'};
const ACTS=[['aprovado','Aprovar'],['reprovado','Reprovar'],['analisar','Validar com o Claude']];
const CST={aberto:'Aberto',corrigido:'Corrigido',encerrado:'Encerrado'};
const slug=s=>String(s).replace(/\s+/g,'-');
const fmtDT=iso=>{if(!iso)return'';const d=new Date(iso);if(isNaN(d))return iso;return d.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})};
const fmtMin=m=>{m=Math.round(m||0);if(m<60)return m+' min';const h=Math.floor(m/60),r=m%60;return h+'h'+(r?String(r).padStart(2,'0'):'')};
const fmtSize=b=>!b?'':b<1024?b+' B':b<1048576?(b/1024).toFixed(0)+' KB':(b/1048576).toFixed(1)+' MB';
const nowISO=()=>new Date().toISOString();

let cap={},me=null,names={};
const S={sprints:[],atividades:[],cenarios:[],comentarios:[],evidencias:[],contexto:[],documentos:[],allAtiv:[]};
let st={mod:'ler',sprint:null,ativ:null,view:'home'};
try{const v=JSON.parse(localStorage.getItem('bancada.ui')||'{}');Object.assign(st,v);st.view='home'}catch(e){}
const saveUI=()=>{try{localStorage.setItem('bancada.ui',JSON.stringify({mod:st.mod,sprint:st.sprint,ativ:st.ativ}))}catch(e){}};
const drafts={}; // textos digitados que ainda não foram salvos
let subs=[],pendingRender=false,loadTimer=null,routed=false;

const TIC={ok:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',err:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.4v.1"/>',warn:'<path d="M12 3.8 2.8 19.5h18.4z"/><path d="M12 9.5v4.5M12 17v.1"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>',
  copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',download:'<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19.5h14"/>',undo:'<path d="M9 14 4.5 9.5 9 5"/><path d="M4.5 9.5H14a5.5 5.5 0 0 1 0 11h-3"/>',
  del:'<path d="M4.5 7h15M9.5 7V4.5h5V7"/><path d="M6.5 7l1 13h9l1-13"/>',clip:'<path d="M20 11.5l-7.8 7.8a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.4 8.4a1.7 1.7 0 0 1-2.4-2.4l7.6-7.6"/>',
  priv:'<path d="M3 3l18 18"/><path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.3-2.3 3.5M6.6 6.6C4.6 8 3.1 10 2.5 12c1 2.5 4.5 7 9.5 7 1.9 0 3.6-.6 5-1.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  soon:'<path d="M7 3.5h10M7 20.5h10"/><path d="M8 3.5c0 4 8 4.5 8 8.5s-8 4.5-8 8.5M16 3.5c0 4-8 4.5-8 8.5s8 4.5 8 8.5"/>',
  claude:'<path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/>',flag:'<path d="M5.5 21V4M5.5 4.5h12l-2.5 4 2.5 4h-12"/>',cancel:'<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>'};
const TKIND={ok:'ok',err:'err',warn:'warn',info:'info',copy:'info',download:'info',undo:'info',del:'del',clip:'ok',priv:'priv',soon:'soon',claude:'info',flag:'warn',cancel:'warn'};
function toastKind(m){m=String(m||'');
  if(/^(Não foi possível|Não consegui|Erro|O Claude não)|falhou/i.test(m))return'err';
  if(/^Seu acesso não|tem .*(acima|limite|maior)|^Escreva|^Escolha|^Explique|^Cole o resultado|^Nenhuma imagem|mas não vinculada/i.test(m))return'warn';
  if(/privacidade/i.test(m))return'priv';
  if(/^Copiado|Código selecionado/i.test(m))return'copy';
  if(/download/i.test(m))return'download';
  if(/^Desfeito|^Refaça/i.test(m))return'undo';
  if(/cancelad/i.test(m))return'cancel';
  if(/removid|apagad/i.test(m))return'del';
  if(/print|anexad|evidência/i.test(m))return'clip';
  if(/validar com o dev|Validar modelagem/i.test(m))return'flag';
  if(/O Claude/i.test(m))return'claude';
  return'ok'}
function toastFill(t,m,o){o=o||{};const k=o.kind||toastKind(m);t.innerHTML='';
  const ic=document.createElement('span');ic.className='tic '+(TKIND[k]||'info');ic.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${TIC[k]||TIC.info}</svg>`;
  const tx=document.createElement('div');tx.className='ttx';if(o.title)tx.append(Object.assign(document.createElement('b'),{textContent:o.title}));tx.append(Object.assign(document.createElement('span'),{textContent:m}));
  const act=document.createElement('div');act.className='tact';
  const x=document.createElement('button');x.type='button';x.className='tclose';x.setAttribute('aria-label','Fechar aviso');x.textContent='×';x.onclick=()=>hideToast();
  t.append(ic,tx,act);clearTimeout(t._o);t.classList.remove('anim','out');void t.offsetWidth;t.classList.add('anim');return {act,x}}
function hideToast(){const t=$('#toast');clearTimeout(toast._t);if(t.hidden||t.classList.contains('out'))return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){t.hidden=true;return}
  t.classList.remove('anim');t.classList.add('out');const done=()=>{clearTimeout(t._o);t.removeEventListener('animationend',done);if(t.classList.contains('out')){t.classList.remove('out');t.hidden=true}};t.addEventListener('animationend',done);t._o=setTimeout(done,400)}
function toast(m,ms=3200,o){const gb=typeof genBoxOpen==='function'&&genBoxOpen();if(gb&&!(o&&o.force)){let n=gb.querySelector('.gnote');if(!n){n=document.createElement('div');n.className='gnote';n.setAttribute('role','status');const st=gb.querySelector('.gsteps');if(st)st.before(n);else gb.append(n)}n.textContent=String(m);return}const t=$('#toast');const {act,x}=toastFill(t,m,o);act.append(x);t.hidden=false;clearTimeout(toast._t);toast._ms=ms;toast._t=setTimeout(hideToast,ms)}
$('#toast').addEventListener('mouseenter',()=>clearTimeout(toast._t));$('#toast').addEventListener('mouseleave',()=>{clearTimeout(toast._t);toast._t=setTimeout(hideToast,2500)});
function toastUndo(m,label,fn,ms=12000,o){const t=$('#toast');const {act,x:_x}=toastFill(t,m,o);const b=document.createElement('button');b.type='button';b.className='tundo';b.textContent=label;
  b.onclick=async()=>{b.disabled=true;try{await fn();toast('Desfeito.')}catch(e){toast('Não foi possível desfazer: '+(e.code||e.message))}};act.append(b,_x);t.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(hideToast,ms)}
const FACE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8"/><path d="M9 9.8v.2M15 9.8v.2"/></svg>';
const busyQ=new Map();let busyN=0;
function busy(msg){const id=++busyN;busyQ.set(id,msg);busyShow();return{set(m){if(busyQ.has(id)){busyQ.set(id,m);busyShow()}},done(){busyQ.delete(id);busyShow()}}}
function busyShow(){const b=$('#busy');if(!busyQ.size){b.hidden=true;return}b.hidden=false;$('#busyMsg').textContent=[...busyQ.values()].pop()+(busyQ.size>1?` (+${busyQ.size-1})`:'')}
function btnLoad(btn,on){if(!btn)return;btn.disabled=!!on;btn.setAttribute('aria-busy',on?'true':'false');
  if(btn.classList.contains('ib')||!btn.textContent.trim()){btn.classList.toggle('loading',!!on);return}
  if(on){if(btn._html==null)btn._html=btn.innerHTML;const t=btn.textContent.trim().replace(/…$/,'');btn.innerHTML='<span class="spin sm" aria-hidden="true"></span>'+esc(BUSYLBL[t]||t)+'…';btn.classList.add('working')}
  else if(btn._html!=null){btn.innerHTML=btn._html;btn._html=null;btn.classList.remove('working')}}
const BUSYLBL={'Aprovar':'Aprovando','Reprovar':'Reprovando','Salvar orientação':'Salvando','Gerar cenários com o Claude':'Gerando','Gerar mais cenários com o Claude':'Gerando','Iniciar reteste':'Iniciando','Finalizar e ir para o Resumo':'Finalizando','Continuar':'Conferindo','Responder':'Enviando','Enviar':'Enviando','Adicionar':'Adicionando','Importar':'Importando','Confirmar e substituir':'Substituindo','Confirmar e apagar':'Apagando','OK':'Salvando','Enviar ao Claude':'Enviando'};
function typing(){const a=document.activeElement;return a&&($('#pane').contains(a)||$('#screen').contains(a))&&(a.tagName==='TEXTAREA'||(a.tagName==='INPUT'&&/^(text|url|search|email|number|)$/.test(a.type||'')))}
let vistas=new Set();
function marcaVista(a){if(!a||!a.novoEm||vistas.has(a.id)||!cap.db)return;vistas.add(a.id);cap.db.collection('atividades').doc(a.id).update({novoEm:null}).catch(()=>{})}
function render(){if(typing()){pendingRender=true;return}pendingRender=false;renderTabs();document.body.classList.toggle('v-ativ',st.view==='ativ');renderCrumbs();if(st.view!=='ativ'){renderScreen();return}renderSide();renderPane();$('#pane').removeAttribute('aria-busy');marcaVista(S.atividades.find(x=>x.id===st.ativ));if(typeof aiCtx==='function')aiCtx();animDiff();paintUps()}
/* anima só o que mudou: itens novos sobem, itens alterados piscam a borda */
const SIG=new Map();let sigView='',sigQuiet=0;
let sigSprint=null;
function enterAnim(el){if(!el)return;el.classList.remove('enter');void el.offsetWidth;el.classList.add('enter');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('enter'),1000)}
function animDiff(){const view=st.sprint+'|'+st.mod+'|'+st.ativ;if(view!==sigView){const first=!sigView;sigView=view;sigQuiet=Date.now()+1500;if(!first)enterAnim($('#pane'));if(sigSprint!==null&&sigSprint!==st.sprint)enterAnim($('#side'));sigSprint=st.sprint}const fresh=Date.now()<sigQuiet;
  document.querySelectorAll('#side .act[data-a], #pane [data-k]').forEach(el=>{const k=(el.dataset.a?'a:'+el.dataset.a:el.dataset.k);const sig=el.textContent.replace(/\s+/g,' ').trim();const prev=SIG.get(k);SIG.set(k,sig);
    if(fresh)return;if(prev===undefined)el.classList.add('fx-new');else if(prev!==sig)el.classList.add('fx-upd')})}
document.addEventListener('focusout',()=>setTimeout(()=>{if(pendingRender&&!typing())render()},150));

function nameOf(uid,fallback){if(!uid)return fallback||'Importado';if(me&&uid===me.id)return me.name||'Você';return (names[uid]&&names[uid].name)||fallback||'Alguém'}
async function resolveNames(){if(!cap.user)return;const ids=new Set();for(const k of ['comentarios','cenarios','evidencias'])S[k].forEach(d=>{if(d.criadoPor)ids.add(d.criadoPor);if(d.atualizadoPor)ids.add(d.atualizadoPor)});S.atividades.forEach(a=>(a.historico||[]).forEach(h=>h.por&&ids.add(h.por)));const miss=[...ids].filter(i=>!names[i]);if(!miss.length)return;try{Object.assign(names,await cap.user.profiles(miss.slice(0,64)));render()}catch(e){}}

/* ---------- conexão ---------- */
(async()=>{
  const [db,user,assets,sample,downloads]=await Promise.all(['db','user','assets','sample','downloads'].map(n=>window.claude?.use?window.claude.use(n).catch(()=>null):Promise.resolve(null)));
  cap={db,user,assets,sample,downloads};
  if(sample){try{aiLimits=await sample.limits()}catch(e){aiLimits=null}}
  if(user){try{me=await user.me()}catch(e){}}
  {const w=$('#whoami');w.innerHTML='';
    if(me){const nm=document.createElement('span');nm.className='whoname';nm.textContent=(me.name||'Você')+(db?'':' · sem base');w.append(mkAvatar(),nm);w.title='Perfil'}
    else{w.append(mkAvatar(),Object.assign(document.createElement('span'),{className:'whoname',textContent:db?'Conectado':'Base indisponível'}))}
    setPriv(priv,true)}
  if(!db){$('#screen').innerHTML='<div class="card empty">A base compartilhada não está disponível aqui. Abra a página no claude.ai, conectado à sua conta.</div>';$('#side').innerHTML='<div class="empty">A base compartilhada não está disponível aqui. Abra a página no claude.ai, conectado à sua conta.</div>';$('#pane').innerHTML='';return}
  loadTimer=setTimeout(()=>{if(!S.sprints.length&&!routed){routed=true;applyRoute()}if(!S.sprints.length)$('#side').innerHTML='<div class="empty">A base demorou para responder. Recarregue a página.</div>'},10000);
  db.collection('atividades').onSnapshot(snap=>{S.allAtiv=snap.docs.map(d=>({id:d.id,...d.data()}));if(st.view==='sprints')render()},()=>{});
  db.collection('sprints').onSnapshot(snap=>{clearTimeout(loadTimer);S.sprints=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(b.criadoEm||'').localeCompare(String(a.criadoEm||'')));
    if(!st.sprint||!S.sprints.find(s=>s.id===st.sprint))st.sprint=S.sprints[0]?.id||null;fillSprintSel();if(!routed){routed=true;applyRoute();return}subscribeSprint();render()},
    e=>{$('#side').innerHTML='<div class="empty">Não foi possível ler as sprints ('+esc(e.code)+').</div>'});
})();
function fillSprintSel(){const sel=$('#sprintSel');sel.innerHTML=S.sprints.map(s=>`<option value="${esc(s.id)}"${s.id===st.sprint?' selected':''}>${esc(s.codigo?s.codigo+' · ':'')}${esc(s.nome)}</option>`).join('')+'<option value="__new">+ Importar nova sprint…</option>'}
$('#sprintSel').onchange=e=>{if(e.target.value==='__new'){st.mod='reg';st.ativ='__import';setMod();fillSprintSel();render();return}st.sprint=e.target.value;st.ativ=null;saveUI();subscribeSprint();render()};
let subSprint=null;
function subscribeSprint(){if(subSprint===st.sprint)return;subSprint=st.sprint;subs.forEach(u=>u());subs=[];for(const k of ['atividades','cenarios','comentarios','evidencias','contexto','documentos'])S[k]=[];
  if(!st.sprint)return;
  for(const k of ['atividades','cenarios','comentarios','evidencias','contexto','documentos'])subs.push(cap.db.collection(k).where('sprintId','==',st.sprint).onSnapshot(snap=>{S[k]=snap.docs.map(d=>({id:d.id,...d.data()}));if(k==='atividades'&&(!st.ativ||(st.ativ!=='__import'&&!S.atividades.find(a=>a.id===st.ativ))))st.ativ=(sorted(S.atividades.filter(a=>a.status!=='Cancelada'))[0]||sorted(S.atividades)[0])?.id||null;render();resolveNames()},e=>toast('Erro ao ler '+k+': '+e.code)))}
function setMod(){$('#tabLer').setAttribute('aria-pressed',st.mod==='ler');$('#tabReg').setAttribute('aria-pressed',st.mod==='reg');saveUI()}
$('#tabLer').onclick=()=>{st.mod='ler';if(st.ativ==='__import')st.ativ=sorted(S.atividades)[0]?.id||null;setMod();render()};
$('#tabReg').onclick=()=>{st.mod='reg';setMod();render()};
setMod();
$('#sideTg').onclick=()=>{const sd=$('#side');const c=sd.classList.toggle('collapsed');$('#sideTg').setAttribute('aria-expanded',String(!c))};if(innerWidth<=860&&st.ativ)$('#side').classList.add('collapsed');
const sorted=arr=>[...arr].sort((a,b)=>(a.ordem??999)-(b.ordem??999)||String(a.titulo||a.codigo||'').localeCompare(String(b.titulo||b.codigo||''),'pt',{numeric:true}));
const byAtiv=(k,aid)=>sorted(S[k].filter(x=>x.atividadeId===aid));


/* fechar um diálogo: a caixa sai com um fade em vez de sumir de uma vez */
(function(){const d=Object.getOwnPropertyDescriptor(HTMLElement.prototype,'hidden');if(!d||!d.set)return;const m=document.getElementById('modal');if(!m)return;
  Object.defineProperty(m,'hidden',{configurable:true,get(){return d.get.call(this)},set(v){
    if(v&&!d.get.call(this)&&this.firstElementChild&&!matchMedia('(prefers-reduced-motion: reduce)').matches){try{const g=this.cloneNode(true);g.removeAttribute('id');g.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));g.classList.add('mghost');g.setAttribute('aria-hidden','true');g.inert=true;document.body.appendChild(g);setTimeout(()=>g.remove(),220)}catch(e){}}
    d.set.call(this,v)}})})();
