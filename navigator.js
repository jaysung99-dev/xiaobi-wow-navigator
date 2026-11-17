import {locations,edges,sources,maps,sourceCoverage,checkedAt} from './data/routes.js';
import {findRoute} from './route-engine.js?v=6';
import {searchLocations,groupLocations,normalizeSearch,isLocationAvailable,hasFlightForFaction} from './location-search.js';
import {normalizeExcludedFlightIds} from './flight-profile.js';
import {projectMapPoint} from './assets/map-transforms.js';
import {pickerPlacement} from './picker-layout.js';
import {normalizeFavoriteRoutes} from './favorite-routes.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId=new Map(locations.map(l=>[l.id,l])),name=id=>byId.get(id)?.name||'未選擇';
const MODE={flight:'飛行',boat:'搭船',zeppelin:'飛船',tram:'地鐵',walk:'步行',portal:'傳送'};
const ICON={flight:'flight',boat:'boat',zeppelin:'flight',tram:'tram',walk:'walk',portal:'go'};
const CAT={all:'all',city:'capital',fp:'flight',port:'port'},CONT={all:'all',ek:'eastern',kal:'kalimdor',other:'other'};
const load=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{toast('本次設定可用，但瀏覽器無法保存。')}};
const query=new URLSearchParams(location.search);
let faction=query.get('faction')||load('xiaobi-faction','alliance');if(!['alliance','horde'].includes(faction))faction='alliance';
const allFlights=locations.filter(l=>l.hasFlight).map(l=>l.id);
const rawEx=query.has('exclude')?query.get('exclude').split(','):load('xiaobi-excluded-flights-v1',[]);
const savedFavs=load('xiaobi-favorites',[]);
const rawAvoid=query.has('avoid')?query.get('avoid').split(','):load('xiaobi-avoided-nodes-v1',[]);
const state={faction,from:query.get('from')||'ironforge',to:query.get('to')||'ratchet',cat:'all',cont:'all',zone:'all',term:'',side:'from',active:0,done:new Set(),excluded:new Set(normalizeExcludedFlightIds(allFlights,rawEx)),favs:normalizeFavoriteRoutes(savedFavs,byId),preference:load('xiaobi-preference','recommended'),result:null,route:null,mapMode:'world',mapSide:'start'};
state.avoided=new Set((Array.isArray(rawAvoid)?rawAvoid:[]).filter(id=>typeof id==='string'&&byId.has(id)));
if(query.has('preference'))state.preference=query.get('preference');
if(!['recommended','few-transfers'].includes(state.preference))state.preference='recommended';
const available=l=>l&&isLocationAvailable(l,state.faction);
const accessible=()=>locations.filter(available);
const flightPoints=()=>accessible().filter(l=>hasFlightForFaction(l,state.faction));
const currentEx=()=>[...state.excluded].filter(id=>available(byId.get(id))&&hasFlightForFaction(byId.get(id),state.faction));
const currentAvoid=()=>[...state.avoided].filter(id=>available(byId.get(id))&&id!==state.from&&id!==state.to);
function normalizeEndpoints(){if(!available(byId.get(state.from)))state.from=accessible().find(l=>l.type==='capital')?.id||accessible()[0].id;if(!available(byId.get(state.to)))state.to=accessible().find(l=>l.id!==state.from&&l.type==='port')?.id||state.from;}
normalizeEndpoints();
let mapEntries=[];try{const r=await fetch('assets/asset-manifest.json?v=8');if(!r.ok)throw Error('maps');mapEntries=await r.json();}catch{mapEntries=[];}
let toastTimer;function toast(text){const t=$('#toast');t.textContent=text;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.hidden=true,3000);}
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
async function copy(text){try{await navigator.clipboard.writeText(text);toast('已複製')}catch{const t=document.createElement('textarea');t.value=text;document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();toast(ok?'已複製':'無法自動複製，請手動選取文字。');}}

/* The picker lives directly under body, outside the blurred planbar's stacking context. */
const picker=$('#picker'),pickList=$('#pickList'),pickQuery=$('#pickQuery');document.body.append(picker);
const inputs={from:$('#fromInput'),to:$('#toInput')};let activeOption=-1,optionIds=[],suppressFocus=false;
function syncInputs(){for(const side of ['from','to'])inputs[side].value=byId.has(state[side])?name(state[side]):'';}
function positionPicker(){if(picker.hidden)return;const r=inputs[state.side].closest('.field').getBoundingClientRect(),v=window.visualViewport;const box=pickerPlacement({anchor:{left:r.left,top:r.top,bottom:r.bottom},viewport:{left:v?.offsetLeft||0,top:v?.offsetTop||0,width:v?.width||document.documentElement.clientWidth,height:v?.height||innerHeight},mobile:innerWidth<=760});Object.assign(picker.style,{left:box.left+'px',top:box.top+'px',width:box.width+'px',height:box.height+'px',right:'auto',bottom:'auto'});}
function highlight(text,term){const at=text.toLowerCase().indexOf(term.toLowerCase());return term&&at>=0?esc(text.slice(0,at))+'<mark>'+esc(text.slice(at,at+term.length))+'</mark>'+esc(text.slice(at+term.length)):esc(text);}
function renderZoneOptions(){const cont=CONT[state.cont],zones=[...new Set(accessible().filter(l=>cont==='all'||l.continent===cont).map(l=>l.zone))].sort((a,b)=>a.localeCompare(b,'zh-Hant'));if(!zones.includes(state.zone))state.zone='all';$('#zoneFilter').innerHTML='<option value="all">全部區域</option>'+zones.map(z=>`<option value="${esc(z)}">${esc(z)}</option>`).join('');$('#zoneFilter').value=state.zone;}
function pickerResults(category=state.cat){return searchLocations(locations,{query:state.term,category:CAT[category],continent:CONT[state.cont],faction:state.faction}).filter(l=>state.zone==='all'||l.zone===state.zone);}
function renderPicker(){
 $('#pickFor').textContent=state.side==='from'?'選擇起點':'選擇終點';
 $$('.cat-tabs button').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.cat===state.cat));b.querySelector('small').textContent=pickerResults(b.dataset.cat).length;});
 $$('.cont-tabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cont===state.cont)));
 const groups=groupLocations(pickerResults());optionIds=groups.flatMap(g=>g.locations.map(l=>l.id));activeOption=-1;inputs[state.side].removeAttribute('aria-activedescendant');pickQuery.removeAttribute('aria-activedescendant');
 $('#pickMeta').textContent=(state.term?`「${state.term}」找到 `:'共 ')+optionIds.length+' 處';
 pickList.innerHTML=groups.length?groups.map((g,i)=>`<div class="p-group" role="group" aria-labelledby="pg-${i}"><div class="p-group-title" id="pg-${i}">${esc(g.title)}</div><div class="p-grid">${g.locations.map(l=>{const fp=hasFlightForFaction(l,state.faction),port=['port','dock'].includes(l.type),kind=l.type==='capital'?'city':port?'port':'fp';return `<div class="opt" role="option" tabindex="-1" id="opt-${esc(l.id)}" data-id="${esc(l.id)}" aria-selected="false"><span class="opt-ic ${kind}"><svg class="ico" aria-hidden="true"><use href="#i-${kind==='city'?'city':kind==='port'?'boat':'flight'}"/></svg></span><span class="opt-txt"><strong>${highlight(l.name,state.term)}</strong><small>${[l.type==='capital'?'主城':port?'港口':'',fp?'鳥點':'',l.faction==='neutral'?'中立':''].filter(Boolean).join('・')||'城鎮'}</small></span></div>`;}).join('')}</div></div>`).join(''):'<div class="no-result">沒有符合的地點。可換個區域或輸入別名。<button type="button" data-clear-filters>清除篩選</button></div>';
 positionPicker();
}
function openPicker(side,reset=true){state.side=side;if(reset){state.cat='all';state.cont='all';state.zone='all';}state.term=inputs[side].value.trim()===name(state[side])?'':inputs[side].value.trim();pickQuery.value=state.term;picker.hidden=false;Object.entries(inputs).forEach(([s,i])=>i.setAttribute('aria-expanded',String(s===side)));renderZoneOptions();renderPicker();if(innerWidth<=760)pickQuery.focus({preventScroll:true});}
function closePicker(restore=true){picker.hidden=true;for(const i of Object.values(inputs)){i.setAttribute('aria-expanded','false');i.removeAttribute('aria-activedescendant');}if(restore)syncInputs();}
function choose(id){if(!available(byId.get(id)))return;state[state.side]=id;closePicker();suppressFocus=true;inputs[state.side].focus({preventScroll:true});suppressFocus=false;plan(false);}
function moveOption(delta){if(!optionIds.length)return;activeOption=(activeOption+delta+optionIds.length)%optionIds.length;$$('.opt').forEach(el=>el.setAttribute('aria-selected',String(el.dataset.id===optionIds[activeOption])));const el=$('#opt-'+optionIds[activeOption]);el?.scrollIntoView({block:'nearest'});inputs[state.side].setAttribute('aria-activedescendant',el.id);pickQuery.setAttribute('aria-activedescendant',el.id);}
function pickerKey(e){if(e.isComposing)return;if(e.key==='Escape'){e.preventDefault();closePicker();suppressFocus=true;inputs[state.side].focus({preventScroll:true});suppressFocus=false;}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(picker.hidden)openPicker(state.side);moveOption(e.key==='ArrowDown'?1:-1);}else if(e.key==='Enter'&&!picker.hidden){e.preventDefault();const id=optionIds[activeOption<0?0:activeOption];if(id)choose(id);}}
for(const [side,input] of Object.entries(inputs)){input.addEventListener('focus',()=>{if(suppressFocus)return;openPicker(side);if(innerWidth>760)input.select();});input.addEventListener('click',()=>{if(picker.hidden)openPicker(side);});input.addEventListener('input',()=>{state.side=side;state.term=input.value.trim();pickQuery.value=state.term;if(picker.hidden)openPicker(side,false);else renderPicker();});input.addEventListener('keydown',pickerKey);}
pickQuery.addEventListener('input',()=>{state.term=pickQuery.value.trim();inputs[state.side].value=pickQuery.value;renderPicker();});pickQuery.addEventListener('keydown',pickerKey);
picker.addEventListener('pointerdown',e=>{if(e.target.closest('button')&&!e.target.closest('input,select'))e.preventDefault();});
pickList.addEventListener('click',e=>{const opt=e.target.closest('[data-id]');if(opt)choose(opt.dataset.id);if(e.target.closest('[data-clear-filters]')){state.cat='all';state.cont='all';state.zone='all';state.term='';pickQuery.value='';inputs[state.side].value='';renderZoneOptions();renderPicker();}});
$$('.cat-tabs button').forEach(b=>b.addEventListener('click',()=>{state.cat=b.dataset.cat;renderPicker();}));
$$('.cont-tabs button').forEach(b=>b.addEventListener('click',()=>{state.cont=b.dataset.cont;state.zone='all';renderZoneOptions();renderPicker();}));
$('#zoneFilter').addEventListener('change',e=>{state.zone=e.target.value;renderPicker();});$('#pickClose').onclick=()=>closePicker();
document.addEventListener('pointerdown',e=>{if(!picker.hidden&&!picker.contains(e.target)&&!e.target.closest('#planForm'))closePicker();});
addEventListener('resize',positionPicker);addEventListener('scroll',e=>{if(!picker.hidden&&!picker.contains(e.target))positionPicker();},true);window.visualViewport?.addEventListener('resize',positionPicker);window.visualViewport?.addEventListener('scroll',positionPicker);
$$('[data-clear]').forEach(b=>b.onclick=()=>{const side=b.dataset.clear;inputs[side].value='';suppressFocus=true;inputs[side].focus();suppressFocus=false;openPicker(side);});
function resolveInputs(){for(const side of ['from','to']){const text=inputs[side].value.trim();if(byId.has(state[side])&&text===name(state[side]))continue;const hit=searchLocations(locations,{query:text,faction:state.faction}),exact=hit.find(l=>normalizeSearch(l.name)===normalizeSearch(text)||(l.aliases||[]).some(a=>normalizeSearch(a)===normalizeSearch(text)));if(text&&(exact||hit.length===1))state[side]=(exact||hit[0]).id;else{openPicker(side,false);toast('請從候選清單選擇'+(side==='from'?'起點':'終點'));return false;}}return true;}
$('#planForm').addEventListener('submit',e=>{e.preventDefault();if(!resolveInputs())return;closePicker();plan(true);});
$('#swapBtn').onclick=()=>{closePicker();[state.from,state.to]=[state.to,state.from];syncInputs();plan();};

/* Real, directed transport graph; no demo routes or fabricated fallbacks. */
function plan(scroll=false){state.result=findRoute({from:state.from,to:state.to,excludedFlights:[...state.excluded],excludedNodes:currentAvoid(),preference:state.preference,faction:state.faction});state.route=state.result.status==='ok'?state.result.edges.map(e=>({...e,a:e.from,b:e.to})):null;state.active=0;state.done.clear();state.mapMode='world';state.mapSide='start';state.mapLocation=state.from;syncInputs();render();fitMap();save('xiaobi-faction',state.faction);save('xiaobi-preference',state.preference);try{const u=new URL(location);u.searchParams.set('faction',state.faction);u.searchParams.set('from',state.from);u.searchParams.set('to',state.to);if(currentEx().length)u.searchParams.set('exclude',currentEx().join(','));else u.searchParams.delete('exclude');if(currentAvoid().length)u.searchParams.set('avoid',currentAvoid().join(','));else u.searchParams.delete('avoid');u.searchParams.set('preference',state.preference);history.replaceState(null,'',u);}catch{}if(scroll&&innerWidth<=980)$('#desk').scrollIntoView({behavior:reduced()?'auto':'smooth'});}
function usedFlights(){return [...new Set((state.route||[]).filter(l=>l.mode==='flight').flatMap(l=>l.requiresFlights||[l.a,l.b]))];}
function pointFor(leg,side=state.mapSide){return (side==='end'?leg.arrival:leg.boarding)||byId.get(side==='end'?leg.b:leg.a);}
function mapName(id){return maps.find(m=>Number(m.id)===Number(id))?.name||mapEntries.find(m=>Number(m.mapId)===Number(id))?.name||'區域';}
function coordinate(p){return p&&Number.isFinite(p.x)&&Number.isFinite(p.y)?`${mapName(p.mapId)}（${p.x.toFixed(1)}，${p.y.toFixed(1)}）`:'尚無已核對座標';}
function updateControls(){const fps=flightPoints();$('#fpCount').textContent=`${fps.length-currentEx().length}／${fps.length}`;$$('.faction button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.faction===state.faction)));$$('.seg button').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.pref==='few'?'few-transfers':'recommended')===state.preference)));$('#coverageNote').textContent=`已核對 ${locations.length} 個地點・${edges.length} 條交通連接・${checkedAt}`;}
/* ---- 精簡導航：節點與步驟合一 ---- */
function legEnds(l){return[pointFor(l,'start'),pointFor(l,'end')];}
function avoidedIds(){return currentAvoid();}
function exclusionsHTML(){
 const ex=currentEx(),av=avoidedIds();if(!ex.length&&!av.length)return'';
 return `<div class="struck" aria-label="已劃掉的節點"><span class="struck-k">已劃掉</span>${
  ex.map(id=>`<button type="button" class="struck-chip" data-restore="${esc(id)}" aria-label="恢復${esc(name(id))}鳥點"><s>${esc(name(id))}</s><small>鳥點</small><span aria-hidden="true">↺</span></button>`).join('')}${
  av.map(id=>`<button type="button" class="struck-chip" data-unavoid="${esc(id)}" aria-label="恢復經過${esc(name(id))}"><s>${esc(name(id))}</s><span aria-hidden="true">↺</span></button>`).join('')
 }<button type="button" class="link-btn" data-restore-all>全部恢復</button></div>`;
}
function nodeHTML(id,role,flights){
 const fp=flights.has(id),tag={start:'起點',via:'轉乘',end:'終點'}[role]+(fp?'・鳥點':'');
 let x='';
 if(fp)x=`<button type="button" class="node-x" data-ex="${esc(id)}" title="鳥點還沒開" aria-label="${esc(name(id))}鳥點未開通，劃掉並重算">×</button>`;
 else if(role==='via')x=`<button type="button" class="node-x" data-avoid="${esc(id)}" title="不經過這裡" aria-label="不經過${esc(name(id))}，劃掉並重算">×</button>`;
 return `<li class="node ${role}"><span class="node-dot" aria-hidden="true"></span><span class="node-txt"><strong>${esc(name(id))}</strong><small>${tag}</small></span>${x}</li>`;
}
function endHTML(label,place,p,i,side){
 return `<div class="end-pt"><dt>${label}</dt><dd><span class="end-place">${esc(place)}</span><code>${esc(coordinate(p))}</code><span class="end-act"><button type="button" data-leg="${i}" data-map-side="${side}">地圖</button><button type="button" data-leg="${i}" data-side="${side}" data-copy-coordinate>複製</button></span></dd></div>`;
}
function stepHTML(l,i,n){
 const[ps,pe]=legEnds(l),done=state.done.has(i);
 return `<li class="step ${esc(l.mode)}${done?' done':''}${i===state.active?' current':''}"><span class="step-ico" aria-hidden="true"><svg class="ico"><use href="#i-${ICON[l.mode]}"/></svg></span><div class="step-card">`+
  `<p class="step-k"><b>${i+1}</b>${MODE[l.mode]}<span>${esc(name(l.a))} → ${esc(name(l.b))}</span></p>`+
  `<p class="step-ins">${esc(l.instructions.replace('抵達後再依下一段指引轉乘。',''))}</p>${l.warning?`<p class="step-warn">${esc(l.warning)}</p>`:''}`+
  `<dl class="step-ends">${endHTML('出發',l.boarding?.label||name(l.a),ps,i,'start')}${endHTML('抵達',l.arrival?.label||name(l.b),pe,i,'end')}</dl>`+
  `<button type="button" class="step-done" data-next="${i}" aria-pressed="${done}">${done?'✓ 已到達':i===n-1?'標記抵達終點':'到了，標記這步'}</button></div></li>`;
}
function render(){
 updateControls();renderSave();
 const body=$('#journalBody'),r=state.route;
 $('#jTitle').textContent=`${name(state.from)} → ${name(state.to)}`;
 $('#saveBtn').disabled=!r;$('#copyBtn').disabled=!r;
 const beats=$('#beats');if(beats){beats.innerHTML='';beats.hidden=true;}
 const sl=$('#sheetLabel');if(sl)sl.textContent='';
 if(!r){
  const same=state.result?.status==='same',struck=currentEx().length||avoidedIds().length;
  $('#jMeta').textContent=same?'已在目的地':'目前條件沒有完整路線';
  body.innerHTML=`${exclusionsHTML()}<div class="route-empty"><h3>${same?'你已經在目的地':'接不出完整路線'}</h3><p>${esc(state.result?.reason||'請選擇起點與終點。')}</p>${!same&&struck?'<p>試著還原上方劃掉的節點。</p>':''}${!same?'<button type="button" class="link-btn" data-open-flights>查看鳥點總表</button>':''}</div>`;
  drawMap();return;
 }
 $('#jMeta').textContent=`${r.length} 步・${[...new Set(r.map(l=>MODE[l.mode]))].join('・')}`;
 const flights=new Set(usedFlights());
 let h=`<p class="route-tip">沒開的鳥點或不想經過的地點，按 × 劃掉就會重算。</p>${exclusionsHTML()}<ol class="route">`;
 h+=nodeHTML(r[0].a,'start',flights);
 r.forEach((l,i)=>{h+=stepHTML(l,i,r.length)+nodeHTML(l.b,i===r.length-1?'end':'via',flights);});
 body.innerHTML=h+'</ol>';
 drawMap();
}


function revealStep(){if(innerWidth<=760)setSheet(true);else $('#journalBody .leg.active')?.scrollIntoView({block:'nearest',behavior:reduced()?'auto':'smooth'});}
function updateExclusions(message){save('xiaobi-excluded-flights-v1',[...state.excluded]);save('xiaobi-avoided-nodes-v1',[...state.avoided]);plan();toast(message);}
document.addEventListener('click',e=>{const t=e.target.closest('[data-go],[data-ex],[data-restore],[data-restore-all],[data-next],[data-map-side],[data-copy-coordinate],[data-open-flights],[data-avoid],[data-unavoid]');if(!t)return;if(t.dataset.leg!==undefined&&state.route)state.active=Number(t.dataset.leg);if(t.dataset.go!==undefined&&state.route){state.active=Number(t.dataset.go);state.mapSide='start';render();focusLeg();revealStep();}else if(t.dataset.ex){state.excluded.add(t.dataset.ex);updateExclusions(`已排除「${name(t.dataset.ex)}」，路線已重算`);}else if(t.dataset.avoid){if(t.dataset.avoid!==state.from&&t.dataset.avoid!==state.to){state.avoided.add(t.dataset.avoid);updateExclusions('已避開'+name(t.dataset.avoid)+'，路線已更新');}}else if(t.dataset.unavoid){state.avoided.delete(t.dataset.unavoid);updateExclusions('已恢復'+name(t.dataset.unavoid));}else if(t.dataset.restore){state.excluded.delete(t.dataset.restore);updateExclusions('鳥點已恢復，路線已重算');}else if(t.hasAttribute('data-restore-all')){state.excluded.clear();state.avoided.clear();updateExclusions('已恢復全部節點');}else if(t.dataset.next!==undefined&&state.route){const arrived=Number(t.dataset.next);state.done.add(arrived);state.active=Math.min(arrived+1,state.route.length-1);if(arrived===state.route.length-1)toast('已標記抵達，旅途愉快！');state.mapSide='start';render();focusLeg();revealStep();}else if(t.dataset.mapSide&&state.route){state.mapSide=t.dataset.mapSide;state.mapMode='region';render();fitMap();if(innerWidth<=760)setSheet(false);}else if(t.hasAttribute('data-copy-coordinate')&&state.route){const p=pointFor(state.route[state.active]);copy(`/mappin ${p.mapId} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);}else if(t.hasAttribute('data-open-flights'))openFlights();});

/* Every marker uses native map transforms; separate islands open their own map. */
const svg=$('#routeSvg'),marks=$('#marks'),stage=$('#stage'),vp=$('#viewport'),image=$('#mapImage');let view={s:1,x:0,y:0},currentMap=947,displayPoints=[];
function projected(p,mapId){if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return null;const point=projectMapPoint(p,p.mapId,mapId,mapEntries);return point&&point.x>=0&&point.x<=100&&point.y>=0&&point.y<=100?[point.x*10.02,point.y*6.68]:null;}
function routeNodes(){return state.route?[byId.get(state.route[0].a),...state.route.map(l=>byId.get(l.b))]:[byId.get(state.from),byId.get(state.to)].filter((l,i,a)=>l&&a.findIndex(x=>x?.id===l.id)===i);}
function linePath(a,b,mode){const dx=b[0]-a[0],dy=b[1]-a[1],k=mode==='flight'?.12:mode==='boat'?-.06:0;return `M${a[0]} ${a[1]} Q${(a[0]+b[0])/2-dy*k} ${(a[1]+b[1])/2+dx*k} ${b[0]} ${b[1]}`;}
function drawMap(){
 const leg=state.route?.[state.active],region=state.mapMode==='region',selected=byId.get(state.mapLocation)||byId.get(state.from);currentMap=region?(leg?pointFor(leg).mapId:selected.mapId):947;const map=mapEntries.find(m=>Number(m.mapId)===Number(currentMap));image.hidden=!map;if(map)image.src=map.file+'?v=8';image.alt=mapName(currentMap)+'地圖';
 $('#worldMap').setAttribute('aria-pressed',String(!region));$('#regionMap').setAttribute('aria-pressed',String(region));$('#mapCaption').textContent=region?`${mapName(currentMap)}・原生區域座標`:'交通連接示意；依手記座標轉乘';
 const detached=!region?routeNodes().filter(l=>!projected(l,947)):[];const notice=$('#detachedNotice');notice.hidden=map&&detached.length===0;notice.innerHTML=!map?'地圖暫時無法載入，仍可查看手記的文字與座標。':detached.map(l=>`<span>路線包含獨立地區</span><button data-detached="${esc(l.id)}">查看${esc(l.name)}區域位置 ↗</button>`).join('');
 let points=[];if(region){const p=leg?pointFor(leg):selected,id=leg?(state.mapSide==='end'?leg.b:leg.a):selected.id;points.push({p,id,label:p.label||name(id),role:'start'});if(leg){const q=pointFor(leg,state.mapSide==='end'?'start':'end');if(q.mapId===p.mapId&&(q.x!==p.x||q.y!==p.y))points.push({p:q,id:state.mapSide==='end'?leg.a:leg.b,label:q.label||'另一端',role:'end'});}}else points=routeNodes().map((l,i,a)=>({p:l,id:l.id,label:l.name,role:i===0?'start':i===a.length-1?'end':'via'}));
 displayPoints=points.map(o=>({...o,xy:projected(o.p,currentMap)})).filter(o=>o.xy);let lines='';if(!region&&state.route)lines=state.route.map((l,i)=>{const a=projected(byId.get(l.a),947),b=projected(byId.get(l.b),947);if(!a||!b)return '';const d=linePath(a,b,l.mode),dim=i===state.active?'':' dim';return `<path class="r-under${dim}" d="${d}" stroke-width="${i===state.active?8:6}" vector-effect="non-scaling-stroke"/><path class="r-line ${l.mode}${i===state.active?' active':''}${dim}" d="${d}" stroke-width="${i===state.active?4:3}" vector-effect="non-scaling-stroke"/>`;}).join('');
 svg.innerHTML=lines;marks.innerHTML=displayPoints.map((o,i)=>{const [x,y]=o.xy,pos=x>700?'l':i%2?'rt':'r';return `<button type="button" class="mark ${o.role} ${pos}" data-marker="${esc(o.id)}" style="left:${x/10.02}%;top:${y/6.68}%" aria-label="查看${esc(o.label)}區域位置"><i></i><span>${esc(o.label)}</span></button>`;}).join('');applyView();
}
image.addEventListener('error',()=>{image.hidden=true;const notice=$('#detachedNotice');notice.hidden=false;notice.textContent='中文地圖暫時無法載入，請依步驟座標移動。';});
function clampView(){const w=vp.clientWidth,h=vp.clientHeight;view.x=Math.min(0,Math.max(w-w*view.s,view.x));view.y=Math.min(0,Math.max(h-h*view.s,view.y));}
function applyView(){clampView();stage.style.transform=`translate(${view.x}px,${view.y}px) scale(${view.s})`;stage.style.setProperty('--inv',1/view.s);}
function centerOn(x,y,s){const w=vp.clientWidth,h=vp.clientHeight;view={s,x:w/2-x/1002*w*s,y:h/2-y/668*h*s};applyView();}
function fitPoints(points,max=2.2){if(!points.length){view={s:1,x:0,y:0};applyView();return;}const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),a=Math.min(...xs),b=Math.max(...xs),c=Math.min(...ys),d=Math.max(...ys),s=Math.max(1,Math.min(max,1/Math.max((b-a)*1.4/1002,(d-c)*1.4/668,.01)));centerOn((a+b)/2,(c+d)/2,s);}
function fitMap(){fitPoints(displayPoints.map(p=>p.xy),state.mapMode==='region'?1.6:innerWidth<=760?1.5:2.2);}
function focusLeg(){if(!state.route)return;state.mapMode='region';drawMap();fitMap();}
function zoomBy(f){const w=vp.clientWidth,h=vp.clientHeight,s=Math.min(4,Math.max(1,view.s*f)),x=(w/2-view.x)/view.s,y=(h/2-view.y)/view.s;view={s,x:w/2-x*s,y:h/2-y*s};applyView();}
$('#zoomIn').onclick=()=>zoomBy(1.4);$('#zoomOut').onclick=()=>zoomBy(1/1.4);$('#zoomFit').onclick=fitMap;$('#worldMap').onclick=()=>{state.mapMode='world';drawMap();fitMap();};$('#regionMap').onclick=()=>{state.mapMode='region';drawMap();fitMap();};
function selectMapLocation(id){if(!byId.has(id))return;state.mapLocation=id;const i=state.route?.findIndex(l=>l.a===id||l.b===id);if(i>=0){state.active=i;state.mapSide=state.route[i].a===id?'start':'end';}else state.mapSide='start';state.mapMode='region';render();fitMap();}
marks.addEventListener('click',e=>{const b=e.target.closest('[data-marker]');if(b)selectMapLocation(b.dataset.marker);});$('#detachedNotice').addEventListener('click',e=>{const b=e.target.closest('[data-detached]');if(b)selectMapLocation(b.dataset.detached);});
let drag=null;vp.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag={x:e.clientX,y:e.clientY,vx:view.x,vy:view.y};vp.setPointerCapture(e.pointerId);vp.classList.add('dragging');});vp.addEventListener('pointermove',e=>{if(!drag)return;view.x=drag.vx+e.clientX-drag.x;view.y=drag.vy+e.clientY-drag.y;applyView();});for(const event of ['pointerup','pointercancel'])vp.addEventListener(event,()=>{drag=null;vp.classList.remove('dragging');});vp.addEventListener('wheel',e=>{e.preventDefault();zoomBy(e.deltaY<0?1.15:1/1.15);},{passive:false});vp.addEventListener('keydown',e=>{if(e.key==='+'||e.key==='=')zoomBy(1.3);else if(e.key==='-')zoomBy(1/1.3);else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){view.x+=e.key==='ArrowLeft'?40:e.key==='ArrowRight'?-40:0;view.y+=e.key==='ArrowUp'?40:e.key==='ArrowDown'?-40:0;applyView();}else return;e.preventDefault();});addEventListener('resize',()=>applyView());

function setSheet(open){$('#journal').classList.toggle('open',open);$('#sheetToggle').setAttribute('aria-expanded',String(open));if(open)$('#sheetLabel').textContent='收合手記';else if(state.route)$('#sheetLabel').textContent=`第 ${state.active+1}／${state.route.length} 段：${MODE[state.route[state.active].mode]}到${name(state.route[state.active].b)}・點此展開`;}
$('#sheetToggle').onclick=()=>setSheet(!$('#journal').classList.contains('open'));

/* Persistent favorites, shared routes, faction controls and complete flight conditions. */
const favoriteKey=(a,b,f)=>`${f||state.faction}:${a}>${b}`;
function renderSave(){const on=state.favs.some(f=>f.from===state.from&&f.to===state.to&&(f.faction||state.faction)===state.faction);$('#saveBtn').setAttribute('aria-pressed',String(on));$('#saveBtn').textContent=on?'★ 已收藏':'☆ 收藏路線';$('#favCount').textContent=state.favs.length;renderCards();}
$('#saveBtn').onclick=()=>{if(!state.route)return;const i=state.favs.findIndex(f=>f.from===state.from&&f.to===state.to&&(f.faction||state.faction)===state.faction);if(i>=0)state.favs.splice(i,1);else state.favs.unshift({from:state.from,to:state.to,faction:state.faction});state.favs=state.favs.slice(0,20);save('xiaobi-favorites',state.favs);renderSave();toast(i>=0?'已取消收藏':'已收藏這條路線');};
$('#copyBtn').onclick=()=>{if(!state.route)return;copy([`小比百貨｜魔獸世界：永恆`,`${state.faction==='horde'?'部落':'聯盟'}：${name(state.from)} → ${name(state.to)}`,...state.route.map((l,i)=>`${i+1}. ${MODE[l.mode]}：${name(l.a)} → ${name(l.b)}\n${l.instructions}\n出發：${coordinate(pointFor(l,'start'))}\n抵達：${coordinate(pointFor(l,'end'))}${l.warning?'\n提醒：'+l.warning:''}`),currentEx().length?'已排除鳥點：'+currentEx().map(name).join('、'):'依全部鳥點可用規劃。',currentAvoid().length?'避開節點：'+currentAvoid().map(name).join('、'):'',location.href].filter(Boolean).join('\n\n'));};
$('#favJump').onclick=()=>$('#shelf').scrollIntoView({behavior:reduced()?'auto':'smooth'});
$$('.faction button').forEach(b=>b.onclick=()=>{closePicker();state.faction=b.dataset.faction;normalizeEndpoints();syncInputs();plan();toast(`已切換${state.faction==='horde'?'部落':'聯盟'}交通路線`);});$$('.seg button').forEach(b=>b.onclick=()=>{state.preference=b.dataset.pref==='few'?'few-transfers':'recommended';plan();});
function quickRoutes(){return state.faction==='horde'?[['orgrimmar','undercity'],['thunderbluff','orgrimmar'],['orgrimmar','gromgol'],['ratchet','bootybay']]:[['ironforge','ratchet'],['ironforge','stormwind'],['menethil','theramore'],['ruttheran','auberdine']];}
function routeCard(a,b,fav=false,f=state.faction,index=-1){return `<div class="saved-item"><button class="card" data-quick="${esc(a)},${esc(b)}" data-faction="${esc(f)}"><strong>${fav?'★ ':''}${esc(name(a))} → ${esc(name(b))}</strong><span>${f==='horde'?'部落':'聯盟'}與中立交通</span><em>${fav?'我的收藏':'查看路線'}</em></button>${fav?`<button class="remove-favorite" data-remove-fav="${index}" aria-label="移除收藏${esc(name(a))}到${esc(name(b))}">移除</button>`:''}</div>`;}
function renderCards(){const quick=quickRoutes();$('#cards').innerHTML=quick.map(([a,b])=>routeCard(a,b)).join('')+state.favs.map((f,i)=>routeCard(f.from,f.to,true,f.faction||(byId.get(f.from).faction==='horde'?'horde':'alliance'),i)).join('');}
$('#cards').addEventListener('click',e=>{const remove=e.target.closest('[data-remove-fav]');if(remove){state.favs.splice(Number(remove.dataset.removeFav),1);save('xiaobi-favorites',state.favs);renderSave();return;}const b=e.target.closest('[data-quick]');if(!b)return;state.faction=b.dataset.faction;[state.from,state.to]=b.dataset.quick.split(',');normalizeEndpoints();syncInputs();plan(true);});
const fpDialog=$('#fpDialog');let flightDraft=new Set();
function renderFlights(){const term=normalizeSearch($('#fpFilter').value);$('#fpList').innerHTML=flightPoints().filter(l=>!term||[l.name,l.zone,...l.aliases||[]].some(v=>normalizeSearch(v).includes(term))).map(l=>`<label class="fp-item"><input type="checkbox" value="${esc(l.id)}" ${flightDraft.has(l.id)?'checked':''}><span>${esc(l.name)}<small>${esc(l.zone)}</small></span></label>`).join('')||'<p>沒有符合的鳥點。</p>';}
function openFlights(){closePicker();flightDraft=new Set(state.excluded);$('#fpFilter').value='';renderFlights();fpDialog.showModal();}
$('#fpOpen').onclick=openFlights;$('#fpFilter').addEventListener('input',renderFlights);$('#fpList').addEventListener('change',e=>{if(e.target.type!=='checkbox')return;e.target.checked?flightDraft.add(e.target.value):flightDraft.delete(e.target.value);});$('#fpReset').onclick=()=>{flightDraft.clear();renderFlights();};
fpDialog.addEventListener('click',e=>{const b=e.target.closest('[data-close]');if(b){const commit=b.classList.contains('primary');if(commit){state.excluded=new Set(flightDraft);updateExclusions('鳥點條件已儲存，路線已重算');}fpDialog.close();}else if(e.target===fpDialog){const r=fpDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)fpDialog.close();}});
$('#sourcesOpen').onclick=()=>{closePicker();const c=sourceCoverage;$('#sourceBody').innerHTML=`<h3>已查證公共交通表</h3><p>${locations.length} 個地點、${allFlights.length} 個鳥點、${edges.length} 條有向連接。</p><p>飛行 ${c.flights.includedPairs}/${c.flights.sourcePairs} 組；船 ${c.services.boats.includedTotal}/${c.services.boats.sourceTotal} 條；飛船 ${c.services.zeppelins.includedTotal}/${c.services.zeppelins.sourceTotal} 條；地鐵 ${c.services.tram.includedTotal}/${c.services.tram.sourceTotal} 條。</p><p>來源更新：${esc(c.sourceUpdatedAt)}・本次核對：${esc(c.checkedAt)}</p><ul>${c.gaps.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><h3>資料來源</h3>${sources.map(s=>`<article><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a><small>核對：${esc(s.checkedAt||checkedAt)}</small>${s.note?`<p>${esc(s.note)}</p>`:''}</article>`).join('')}`;$('#sourcesDialog').showModal();};$('#sourcesDialog').addEventListener('click',e=>{if(e.target.closest('[data-close]'))$('#sourcesDialog').close();});
/* 每步自己的地圖／複製：在原 data-map-side、data-copy-coordinate handler 之前先設定 active 與 side */
document.addEventListener('click',e=>{const t=e.target.closest('[data-leg]');if(!t)return;state.active=+t.dataset.leg;if(t.dataset.side)state.mapSide=t.dataset.side;},true);

/* 手機地圖展開 */
function setMap(open){document.body.classList.toggle('map-open',open);const b=$('#mapToggle');if(b){b.setAttribute('aria-expanded',String(open));b.textContent=open?'收起地圖':'顯示地圖';}requestAnimationFrame(()=>{drawMap();fitMap();});}
$('#mapToggle')?.addEventListener('click',()=>setMap(!document.body.classList.contains('map-open')));
document.addEventListener('click',e=>{if(!e.target.closest('[data-map-side]')||innerWidth>900)return;setMap(true);setTimeout(()=>$('#atlasPage')?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}),60);});

/* 更多設定：點外面或 Esc 關閉；從選單開啟對話框時一併收起 */
document.addEventListener('click',e=>{const m=$('#moreMenu');if(m?.open&&(!e.target.closest('#moreMenu')||e.target.closest('#fpOpen,#sourcesOpen,[data-quick]')))m.open=false;});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const m=$('#moreMenu');if(m?.open){m.open=false;m.querySelector('summary').focus();}}});
syncInputs();plan();
