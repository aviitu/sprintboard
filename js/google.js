/* ---------- conectores (Google Docs e Google Drive) ---------- */
async function pnMcp(){if(PN.mcp===undefined){try{PN.mcp=window.claude&&window.claude.use?await window.claude.use('mcp'):null}catch(e){PN.mcp=null}}return PN.mcp}
async function pnCall(srv,tool,input){const m=await pnMcp();if(!m)throw {code:'capability_disabled',message:'Conectores indisponíveis nesta visualização.'};
  const r=await m.callTool(srv,tool,input);let p=r&&typeof r==='object'&&'payload' in r?r.payload:r;
  if(typeof p==='string'){try{p=JSON.parse(p)}catch(e){}}
  /* o conector do Google Docs devolve {content:{title,revisionId,tabs:[…]}} */
  for(const k of ['content','document'])if(p&&typeof p==='object'&&!p.body&&!p.tabs&&p[k]&&typeof p[k]==='object'&&!Array.isArray(p[k])&&(p[k].body||p[k].tabs))p=p[k];return p}
function pnErr(e,srv){const c=e&&e.code;const s=srv||(e&&e.server)||'conector';
  if(c==='server_not_connected')return `Conecte o ${s} em Configurações → Conectores do claude.ai e tente de novo.`;
  if(c==='needs_reauth')return `A conexão com o ${s} expirou. Reconecte em Configurações → Conectores do claude.ai.`;
  if(c==='not_in_manifest')return `O ${s} não foi liberado para esta página. Libere nas permissões do artifact e tente de novo.`;
  if(c==='approval_required'||c==='consent_required')return `O claude.ai precisa da sua aprovação para usar o ${s}. Clique de novo e permita.`;
  if(c==='selection_required')return `Escolha, no aviso do claude.ai, qual conexão do ${s} usar.`;
  if(c==='blocked_by_policy')return `A organização bloqueou o ${s} aqui.`;
  if(c==='server_unavailable'||c==='rate_limited')return `O ${s} não respondeu agora. Tente de novo em instantes.`;
  if(c==='not_granted'||c==='capability_disabled'||c==='capability_removed')return 'Os conectores do Google não estão disponíveis nesta visualização. Abra o Sprintboard no claude.ai.';
  if(c==='tool_error')return `O ${s} recusou a operação: ${String(e.message||'').slice(0,300)}`;
  return `Falha ao falar com o ${s}${c?' ('+c+')':''}: ${String((e&&e.message)||e).slice(0,240)}`}
async function pnReadDoc(id){const d=await pnCall(PN_SRV.docs,'read_doc',{documentId:id});if(!d||(!d.body&&!d.tabs))throw {code:'tool_error',server:PN_SRV.docs,message:'O documento veio sem conteúdo.'};return d}
function pnB64Text(b){const bin=atob(String(b||'').replace(/\s+/g,''));const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new TextDecoder('utf-8').decode(u).replace(/^﻿/,'')}
async function pnDocText(id){const p=await pnCall(PN_SRV.drive,'download_file_content',{fileId:id,exportMimeType:'text/plain'});const c=p&&(p.content||p.data);if(!c)throw {code:'tool_error',server:PN_SRV.drive,message:'Arquivo sem conteúdo.'};return {titulo:p.title||'',txt:pnB64Text(c).replace(/\r/g,'')}}

