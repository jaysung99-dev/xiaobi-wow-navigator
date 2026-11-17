import {classes,metadata} from './data.js';

export const classById=new Map(classes.map(c=>[c.id,c]));
export const talentsOf=c=>c.trees.flatMap(t=>t.talents);
export const spent=ranks=>Object.values(ranks).reduce((sum,n)=>sum+n,0);
export function pointBudget(level,talented=0){
 if(!Number.isInteger(level)||level<1||level>60||!Number.isInteger(talented)||talented<0||talented>5)return 0;
 return Math.min(51,Math.max(0,level-9+talented));
}
export function treePoints(tree,ranks){return tree.talents.reduce((sum,t)=>sum+(ranks[t.id]||0),0);}
export function minimumLevel(ranks,talented=0){return Math.max(1,spent(ranks)?spent(ranks)+9-talented:1);}
export function validateBuild(c,ranks,level=60,talented=0){
 if(!c)return {ok:false,reason:'找不到這個職業。'};
 if(!ranks||typeof ranks!=='object'||Array.isArray(ranks))return {ok:false,reason:'配點格式不正確。'};
 if(!Number.isInteger(level)||level<1||level>60||!Number.isInteger(talented)||talented<0||talented>5)return {ok:false,reason:'等級或傳承設定不正確。'};
 const all=talentsOf(c),byId=new Map(all.map(t=>[String(t.id),t]));
 for(const [id,rank]of Object.entries(ranks)){
  const t=byId.get(id);if(!t||!Number.isInteger(rank)||rank<0||rank>t.max)return {ok:false,reason:'配點含有未知天賦或超過上限的階級。'};
 }
 if(spent(ranks)>pointBudget(level,talented))return {ok:false,reason:'已超過這個等級可用的天賦點數。'};
 for(const tree of c.trees)for(const t of tree.talents){
  if(!(ranks[t.id]>0))continue;
  const prior=tree.talents.filter(p=>p.row<t.row).reduce((n,p)=>n+(ranks[p.id]||0),0);
  if(prior<t.requiredPoints)return {ok:false,reason:`${tree.name}前面各列須先投入 ${t.requiredPoints} 點，才能點「${t.name}」。`};
  for(const req of t.requires){const pre=byId.get(String(req.id));if((ranks[req.id]||0)<req.qty)return {ok:false,reason:`「${t.name}」需要「${pre?.name||'前置天賦'}」${req.qty} 點。`};}
 }
 return {ok:true,reason:''};
}
export function changeRank(c,ranks,id,delta,level=60,talented=0){
 const t=talentsOf(c).find(t=>t.id===Number(id));if(!t)return {ok:false,ranks,reason:'找不到這個天賦。'};
 const rank=ranks[id]||0;if(delta!==1&&delta!==-1)return {ok:false,ranks,reason:'配點操作不正確。'};
 if(rank+delta<0)return {ok:false,ranks,reason:'這個天賦還沒加點。'};
 if(rank+delta>t.max)return {ok:false,ranks,reason:'這個天賦已點滿。'};
 const next={...ranks};if(rank+delta)next[id]=rank+delta;else delete next[id];
 const v=validateBuild(c,next,level,talented);return {ok:v.ok,ranks:v.ok?next:ranks,reason:v.reason};
}
export function resetTree(c,ranks,treeId,level=60,talented=0){
 const tree=c.trees.find(t=>t.id===treeId);if(!tree)return {ok:false,ranks,reason:'找不到這個天賦系。'};
 const next={...ranks};for(const t of tree.talents)delete next[t.id];const v=validateBuild(c,next,level,talented);return {ok:v.ok,ranks:v.ok?next:ranks,reason:v.reason};
}
export function encodeBuild({classId,level,talented=0,ranks}){
 const c=classById.get(classId),v=validateBuild(c,ranks,level,talented);if(!v.ok)throw Error(v.reason);
 const p=new URLSearchParams({class:classId,level:String(level),v:'1',d:metadata.dataRevision});if(talented)p.set('talented',String(talented));
 const allocation=Object.entries(ranks).filter(([,n])=>n>0).sort((a,b)=>Number(a[0])-Number(b[0])).map(([id,n])=>`${id}:${n}`).join(',');if(allocation)p.set('p',allocation);return p.toString();
}
export function decodeBuild(search){
 const p=new URLSearchParams(search),hasBuild=['class','level','v','d','talented','p'].some(k=>p.has(k));
 const fail=reason=>({ok:false,hasBuild,reason});
 if(!hasBuild)return {ok:true,hasBuild:false,build:{classId:'warrior',level:60,talented:0,ranks:{}}};
 for(const key of ['class','level','v','d','talented','p'])if(p.getAll(key).length>1)return fail('分享連結有重複參數，請重新複製。');
 if(p.get('v')&&p.get('v')!=='1')return fail('這個分享連結使用尚未支援的版本。');
 if(p.get('d')&&p.get('d')!==metadata.dataRevision)return fail('分享連結的天賦資料版本與目前不同，未自動套用舊配點。');
 const classId=p.get('class')||'warrior',c=classById.get(classId);if(!c)return fail('分享連結的職業不存在。');
 const levelText=p.get('level')||'60',talentText=p.get('talented')||'0';if(!/^\d{1,2}$/.test(levelText)||!/^\d$/.test(talentText))return fail('分享連結的等級設定不正確。');
 const level=Number(levelText),talented=Number(talentText),ranks={};const encoded=p.get('p')||'';
 if(encoded.length>6000)return fail('分享連結太長，無法讀取。');
 if(encoded)for(const item of encoded.split(',')){if(!/^\d{1,8}:[1-5]$/.test(item))return fail('分享連結的配點格式不正確。');const [id,n]=item.split(':');if(Object.hasOwn(ranks,id))return fail('分享連結有重複天賦。');ranks[id]=Number(n);}
 const valid=validateBuild(c,ranks,level,talented);if(!valid.ok)return fail(valid.reason);
 return {ok:true,hasBuild:true,build:{classId,level,talented,ranks}};
}
export function buildText({classId,level,talented=0,ranks},url=''){
 const c=classById.get(classId),valid=validateBuild(c,ranks,level,talented);if(!valid.ok)throw Error(valid.reason);
 const totals=c.trees.map(t=>treePoints(t,ranks));const lines=[`小比百貨｜魔獸世界：永恆`,`${c.name} ${level} 級｜${c.trees.map((t,i)=>`${t.name} ${totals[i]}`).join('／')}`,`已分配 ${spent(ranks)}／${pointBudget(level,talented)} 點${talented?`｜傳承「天賦異稟」${talented} 階`:''}`];
 for(const tree of c.trees){const selected=tree.talents.filter(t=>ranks[t.id]);if(!selected.length)continue;lines.push('',`【${tree.name}】`);for(const t of selected)lines.push(`${t.name}${t.provisionalName?`（${t.nameEn}，暫譯）`:''} ${ranks[t.id]}/${t.max}`);}
 if(!spent(ranks))lines.push('尚未配點。');lines.push('',`永恆 ${metadata.version}｜資料核對 ${metadata.checkedAt}`);if(url)lines.push(url);return lines.join('\n');
}
