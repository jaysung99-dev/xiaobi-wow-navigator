const equivalent = {'铁':'鐵','炉':'爐','卢':'盧','风':'風','奥':'奧','尔':'爾','萨':'薩','玛':'瑪','湾':'灣','兰':'蘭','苏':'蘇','纳':'納','齿':'齒','荆':'荊','镇':'鎮','银':'銀','辉':'輝','岗':'崗','湿':'濕','岛':'島','龙':'龍','达':'達','诺':'諾','营':'營','贫':'貧','费':'費','鹰':'鷹','桥':'橋','荫':'蔭','头':'頭','狮':'獅','墙':'牆'};
export const continentNames={eastern:'東部王國',kalimdor:'卡林多',other:'其他地區'};
export function normalizeSearch(value='') {
  return String(value).normalize('NFKC').toLowerCase().replace(/[\s’'·・\-]/g,'').replace(/[\u3400-\u9fff]/g,c=>equivalent[c]||c);
}
export function isLocationAvailable(location,faction='alliance') {
  return !location.faction||location.faction==='neutral'||location.faction===faction;
}
export function hasFlightForFaction(location,faction='alliance') {
  return Boolean(location.hasFlight)&&(!location.flightFactions||location.flightFactions.includes(faction));
}
export function searchLocations(items,{query='',category='all',continent='all',faction='alliance'}={}) {
  const term=normalizeSearch(query);
  return items.filter(l=>isLocationAvailable(l,faction))
    .filter(l=>continent==='all'||l.continent===continent)
    .filter(l=>category==='all'||category==='flight'&&hasFlightForFaction(l,faction)||category==='capital'&&l.type==='capital'||category==='port'&&(l.type==='port'||l.type==='dock'))
    .map(l=>{
      const name=normalizeSearch(l.name),zone=normalizeSearch(l.zone);
      const aliases=(l.aliases||[]).map(normalizeSearch);
      const values=[name,zone,...aliases];
      const rank=!term?0:name===term?100:name.startsWith(term)?90:aliases.some(v=>v.startsWith(term))?80:zone.startsWith(term)?70:values.some(v=>v.includes(term))?60:0;
      return {location:l,rank};
    }).filter(v=>!term||v.rank>0)
    .sort((a,b)=>b.rank-a.rank||String(a.location.continent).localeCompare(String(b.location.continent))||a.location.zone.localeCompare(b.location.zone,'zh-Hant')||a.location.name.localeCompare(b.location.name,'zh-Hant'))
    .map(v=>v.location);
}
export function groupLocations(items) {
  const groups=new Map();
  for(const l of items){const title=`${continentNames[l.continent]||continentNames.other} · ${l.zone}`;if(!groups.has(title))groups.set(title,[]);groups.get(title).push(l);}
  return [...groups].map(([title,locations])=>({title,locations}));
}
