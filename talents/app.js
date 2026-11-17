import {TalentTapController} from './tap-controller.js';
import {classes} from './data.js';
import {classById,talentsOf,spent,pointBudget,treePoints,validateBuild,changeRank,resetTree,encodeBuild,decodeBuild,buildText} from './engine.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const decoded=decodeBuild(location.search),defaults={classId:'warrior',level:60,talented:0,ranks:{}};
let state=decoded.ok?decoded.build:defaults,selected=null,mobileTree=0,remove=false,noticeTimer,tooltipAnchor=null;
const cache=new Map(),current=()=>classById.get(state.classId);
const tapInput=new TalentTapController();
const compactInput=matchMedia('(max-width:800px)');
const coarseInput=matchMedia('(hover:none) and (pointer:coarse)');
let lastPointerType='';
function updateInputGuide(){const touch=compactInput.matches||coarseInput.matches;$('#howto').textContent=touch?'點一下看說明，再點同一天賦配點；減點請切換「減點」。':'移到天賦看效果，點一下加點；用「減點」扣除，配好後複製分享。';}
compactInput.addEventListener('change',updateInputGuide);coarseInput.addEventListener('change',updateInputGuide);
function announce(text,error=false){clearTimeout(noticeTimer);const n=$('#notice');n.textContent=text;n.dataset.error=String(error);n.hidden=false;if(!error)noticeTimer=setTimeout(()=>n.hidden=true,4200);}
function updateURL(){const u=new URL(location);u.search=encodeBuild(state);u.hash='';history.replaceState(null,'',u);cache.set(state.classId,structuredClone(state));}
function shareURL(){const u=new URL(location);u.search=encodeBuild(state);u.hash='';return u.href;}
function rank(id){return state.ranks[id]||0;}
function find(id){return talentsOf(current()).find(t=>t.id===Number(id));}
function addReason(t){return changeRank(current(),state.ranks,t.id,1,state.level,state.talented).reason;}
function apply(id,delta){selected=Number(id);const r=changeRank(current(),state.ranks,id,delta,state.level,state.talented);if(r.ok){state.ranks=r.ranks;$('#notice').hidden=true;updateURL();refresh();}else{showDetail();announce(r.reason,true);}}
function arrowLines(tree){
 const talents=new Map(tree.talents.map(t=>[t.id,t]));
 return `<svg class="tree-lines" viewBox="0 0 400 620" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="arrow-${tree.id}" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L6 4L1 7" fill="none"/></marker></defs>${tree.talents.flatMap(t=>t.requires.map(req=>{const pre=talents.get(req.id);if(!pre)return '';const x1=pre.column*100+50,y1=pre.row*89+23,x2=t.column*100+50,y2=t.row*89+23;const xmid=x1===x2?x1:x2;return `<path data-arrow="${t.id}" class="${rank(pre.id)>=req.qty?'learned':''}" d="M${x1} ${y1+22} V${(y1+y2)/2} H${xmid} V${y2-24}" marker-end="url(#arrow-${tree.id})"/>`;})).join('')}</svg>`;
}
function makeTrees(){
 const c=current();document.documentElement.style.setProperty('--class',c.color);
 $('#trees').innerHTML=c.trees.map((tree,i)=>`<article class="tree${i===mobileTree?' mobile-active':''}" id="tree-${tree.id}" aria-label="${esc(tree.name)}天賦"><header class="tree-title"><h2>${esc(tree.name)}<span data-tree-points="${tree.id}">0</span></h2><button type="button" data-reset-tree="${tree.id}" aria-label="重置${esc(tree.name)}系">重置</button></header><div class="talent-grid">${arrowLines(tree)}${tree.talents.map(t=>`<button type="button" class="talent" data-talent="${t.id}" style="grid-column:${t.column+1};grid-row:${t.row+1}" aria-label="${esc(t.name)}，0／${t.max}"><span class="talent-icon"><img src="${esc(t.icon)}" alt="" width="39" height="39" loading="lazy"><span class="icon-fallback" aria-hidden="true">${esc(t.name.slice(0,1))}</span><span class="talent-rank">0/${t.max}</span></span><span class="talent-name">${esc(t.name)}</span></button>`).join('')}</div></article>`).join('');
 $('#specTabs').innerHTML=c.trees.map((t,i)=>`<button type="button" role="tab" data-tree-tab="${i}" aria-selected="${i===mobileTree}" aria-controls="tree-${t.id}">${esc(t.name)} <span data-tab-points="${t.id}">0</span></button>`).join('');
 for(const image of $$('.talent img'))image.addEventListener('error',()=>image.closest('.talent').dataset.missingIcon='true',{once:true});
 refresh();
}
function refresh(){
 const c=current(),budget=pointBudget(state.level,state.talented);
 $('#classSelect').value=state.classId;$('#levelInput').value=state.level;$('#talentedSelect').value=state.talented;$('#spentCount').textContent=`${spent(state.ranks)}／${budget}`;
 $('#treeSummary').textContent=c.trees.map(t=>`${t.name} ${treePoints(t,state.ranks)}`).join(' ／ ');
 for(const tree of c.trees){const total=treePoints(tree,state.ranks);$(`[data-tree-points="${tree.id}"]`).textContent=total;$(`[data-tab-points="${tree.id}"]`).textContent=total;for(const t of tree.talents){const el=$(`[data-talent="${t.id}"]`),r=rank(t.id),blocked=Boolean(addReason(t)),locked=remove?r===0:blocked;el.classList.toggle('has-points',r>0);el.classList.toggle('maxed',r===t.max);el.classList.toggle('selected',selected===t.id);el.dataset.locked=String(locked);el.removeAttribute('aria-disabled');el.setAttribute('aria-label',`${t.name}，${r}／${t.max}，${locked?'查看效果與解鎖條件':remove?'減少一點':'增加一點'}`);el.setAttribute('aria-description',locked?'目前無法配點，可查看解鎖條件。':compactInput.matches||coarseInput.matches?'先點一下查看效果，再點同一天賦配點。':'移到這裡查看效果，點選加點。');el.querySelector('.talent-rank').textContent=`${r}/${t.max}`;el.removeAttribute('title');for(const path of $$(`[data-arrow="${t.id}"]`))path.classList.toggle('learned',t.requires.every(req=>rank(req.id)>=req.qty));}}
 showDetail();
}
function hideDetail(){
 const d=$('#detail');d.hidden=true;selected=null;tooltipAnchor=null;tapInput.clear();
 for(const el of $$('.talent')){el.removeAttribute('aria-describedby');el.classList.remove('selected');}
}
function positionDetail(){
 const d=$('#detail');if(d.hidden||!tooltipAnchor?.isConnected)return;
 const a=tooltipAnchor.querySelector('.talent-icon').getBoundingClientRect(),r=d.getBoundingClientRect(),gap=12,margin=12;
 const w=document.documentElement.clientWidth,h=innerHeight;
 let left=a.right+gap,top=a.top;
 if(left+r.width>w-margin){left=a.left-r.width-gap;if(left<margin){left=Math.max(margin,Math.min(a.left,w-r.width-margin));top=a.bottom+gap;if(top+r.height>h-margin)top=a.top-r.height-gap;}}
 d.style.left=Math.max(margin,Math.min(left,w-r.width-margin))+'px';
 d.style.top=Math.max(margin,Math.min(top,h-r.height-margin))+'px';
}
function showDetail(){
 const d=$('#detail'),t=find(selected);if(!t||!tooltipAnchor?.isConnected){hideDetail();return;}
 const r=rank(t.id),tree=current().trees.find(tree=>tree.talents.some(n=>n.id===t.id));
 const requirements=[t.requiredPoints?tree.name+'前面各列投入 '+t.requiredPoints+' 點':'第一列可直接加點',...t.requires.map(req=>(find(req.id)?.name||'前置天賦')+' '+req.qty+' 點')];
 d.innerHTML='<div class="detail-heading"><img src="'+esc(t.icon)+'" alt="" width="32" height="32"><div><h3>'+esc(t.name)+' <span>'+r+'/'+t.max+'</span></h3><small>'+esc(tree.name)+(t.provisionalName?'・名稱暫譯：'+esc(t.nameEn):'')+'</small></div></div><div class="detail-copy">'+(r?'<p><strong>目前效果</strong>'+esc(t.descriptions[r-1])+'</p>':'')+(r<t.max?'<p><strong>'+(r?'下一階':'第 1 階效果')+'</strong>'+esc(t.descriptions[r])+'</p>':'<p class="max-rank">已點滿</p>')+'</div><p class="requirement">需要：'+requirements.map(esc).join('・')+'</p>';
 d.hidden=false;tooltipAnchor.setAttribute('aria-describedby','detail');positionDetail();
}
function inspectTalent(el){if(!el)return;for(const b of $$('.talent.selected,.talent[aria-describedby]')){b.removeAttribute('aria-describedby');b.classList.remove('selected');}tooltipAnchor=el;selected=Number(el.dataset.talent);el.classList.add('selected');showDetail();}
$('#classSelect').innerHTML=classes.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
$('#classSelect').addEventListener('change',e=>{cache.set(state.classId,structuredClone(state));const classId=e.target.value;state=structuredClone(cache.get(classId)||{classId,level:state.level,talented:state.talented,ranks:{}});selected=null;mobileTree=0;$('#notice').hidden=true;updateURL();makeTrees();});
function changeSettings(level,talented){const v=validateBuild(current(),state.ranks,level,talented);if(v.ok){state.level=level;state.talented=talented;updateURL();refresh();}else{refresh();announce(`${v.reason} 請先減點或重置。`,true);}}
$('#levelInput').addEventListener('change',e=>changeSettings(Number(e.target.value),state.talented));$('#talentedSelect').addEventListener('change',e=>changeSettings(state.level,Number(e.target.value)));
$('#removeMode').onclick=()=>{remove=!remove;$('#removeMode').setAttribute('aria-pressed',String(remove));$('#removeMode').textContent=remove?'減點中':'減點';refresh();};
$('#resetAll').onclick=()=>{state.ranks={};selected=null;updateURL();refresh();announce('已重置所有天賦。');};
$('#trees').addEventListener('click',e=>{const b=e.target.closest('[data-talent]');if(b){const touch=compactInput.matches||coarseInput.matches||(e.detail!==0&&(e.pointerType==='touch'||lastPointerType==='touch'));const confirmed=tapInput.shouldAdjust(Number(b.dataset.talent),touch);inspectTalent(b);if(!confirmed)return;const delta=e.shiftKey?-1:remove?-1:1;if(delta===1&&addReason(find(b.dataset.talent)))return;apply(Number(b.dataset.talent),delta);return;}const reset=e.target.closest('[data-reset-tree]');if(reset){const r=resetTree(current(),state.ranks,Number(reset.dataset.resetTree),state.level,state.talented);if(r.ok){state.ranks=r.ranks;updateURL();refresh();announce('這一系已重置。');}else announce(r.reason,true);}});
$('#trees').addEventListener('contextmenu',e=>{const b=e.target.closest('[data-talent]');if(b){e.preventDefault();inspectTalent(b);if(compactInput.matches||coarseInput.matches||lastPointerType==='touch')return;apply(Number(b.dataset.talent),-1);}});
$('#trees').addEventListener('pointerover',e=>{if(e.pointerType!=='touch')inspectTalent(e.target.closest('[data-talent]'));});
$('#trees').addEventListener('pointerout',e=>{if(e.pointerType==='touch')return;const b=e.target.closest('[data-talent]');if(b&&!b.contains(e.relatedTarget))hideDetail();});
$('#trees').addEventListener('focusin',e=>inspectTalent(e.target.closest('[data-talent]')));
$('#trees').addEventListener('focusout',e=>{if(e.target.closest('[data-talent]'))hideDetail();});
document.addEventListener('pointerdown',e=>{lastPointerType=e.pointerType||'';if(!e.target.closest('[data-talent]'))hideDetail();},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')hideDetail();});
addEventListener('resize',hideDetail);addEventListener('scroll',hideDetail,true);
$('#specTabs').addEventListener('click',e=>{const b=e.target.closest('[data-tree-tab]');if(!b)return;mobileTree=Number(b.dataset.treeTab);$$('[data-tree-tab]').forEach(el=>el.setAttribute('aria-selected',String(Number(el.dataset.treeTab)===mobileTree)));current().trees.forEach((t,i)=>$('#tree-'+t.id).classList.toggle('mobile-active',i===mobileTree));selected=null;showDetail();});
async function copy(text){try{await navigator.clipboard.writeText(text);announce('已複製，可以貼到 Discord 或傳給朋友。');}catch{const dialog=$('#shareFallback');$('#shareContent').value=text;dialog.showModal();$('#shareContent').focus();$('#shareContent').select();}}
$('#copyLink').onclick=()=>copy(shareURL());$('#copyText').onclick=()=>copy(buildText(state,shareURL()));
updateInputGuide();makeTrees();if(!decoded.ok)announce('未載入這組配點：'+decoded.reason,true);else if(decoded.hasBuild)announce('已載入分享的完整配點。');
if(decoded.ok)updateURL();
