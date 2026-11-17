import {locations,edges,sources,locationById} from './data/routes.js';
import {availableFlightIds} from './flight-profile.js';

const baseResult = (status,reason,extra={}) => ({status,reason,edges:[],locations:[],nodes:[],usedSources:[],usedSourceIds:[],...extra});
const routeCost=(edge,preference)=>edge.rankCost+(preference==='few-transfers' && edge.mode!=='walk' ? 1000 : 0);

/** Directed, deterministic route search. Rank costs are preferences, not travel times. */
export function findRoute({from,to,learnedFlights,excludedFlights=[],excludedNodes=[],preference='recommended',faction='alliance'}={}) {
  if(!locationById[from] || !locationById[to]) return baseResult('unavailable','請從清單選擇已支援的起點與終點。',{reasonCode:'unsupported_location'});
  if(!['alliance','horde'].includes(faction)) return baseResult('unavailable','請選擇聯盟或部落。',{reasonCode:'unsupported_faction'});
  const accessible=l=>!l.faction||l.faction==='neutral'||l.faction===faction;
  if(!accessible(locationById[from])||!accessible(locationById[to]))return baseResult('unavailable','這個地點不屬於目前陣營的交通網，請切換陣營或選擇其他地點。',{reasonCode:'wrong_faction'});
  const blocked=new Set(Array.isArray(excludedNodes)?excludedNodes.filter(id=>typeof id==='string'&&locationById[id]):[]);
  if(blocked.has(from)||blocked.has(to))return baseResult('unavailable','起點或終點已排除，請恢復該地點或另選起終點。',{reasonCode:'excluded_endpoint'});
  if(from===to) return baseResult('same','起點就是目的地。',{locations:[locationById[from]],nodes:[locationById[from]]});
  const knownFlightIds=locations.filter(l=>l.hasFlight).map(l=>l.id);
  const initiallyAvailable=Array.isArray(learnedFlights)?learnedFlights:knownFlightIds;
  const learned=new Set(availableFlightIds(initiallyAvailable,excludedFlights));
  const allowed=edges.filter(e=>(e.faction==='neutral'||e.faction===faction) && accessible(locationById[e.from]) && accessible(locationById[e.to]) && !blocked.has(e.from) && !blocked.has(e.to) && !(e.requiresFlights||[]).some(id=>blocked.has(id)) && (e.mode!=='flight'||(e.requiresFlights||[]).every(id=>learned.has(id))));
  const adjacency=new Map(locations.map(l=>[l.id,[]]));
  for(const edge of allowed) adjacency.get(edge.from)?.push(edge);
  const distance=new Map([[from,0]]),previous=new Map(),visited=new Set();
  while(visited.size<locations.length) {
    let current=null,best=Infinity;
    for(const [id,cost] of distance) if(!visited.has(id)&&cost<best){current=id;best=cost;}
    if(current===null||current===to) break;
    visited.add(current);
    for(const edge of adjacency.get(current)||[]) {
      const candidate=best+routeCost(edge,preference);
      if(candidate<(distance.get(edge.to)??Infinity)) {distance.set(edge.to,candidate);previous.set(edge.to,edge);}
    }
  }
  if(!previous.has(to)) {
    return baseResult('unavailable',excludedFlights.length||blocked.size?'排除這些節點後暫無可用路線，請恢復部分節點或改選起終點。':'目前已核對的交通資料無法連成完整路線；部分步行道路或特殊交通尚未涵蓋。',{reasonCode:'no_verified_connection'});
  }
  const path=[];
  let cursor=to;
  for(let guard=0;cursor!==from&&guard<=locations.length;guard++) {
    const edge=previous.get(cursor);
    if(!edge) return baseResult('unavailable','交通資料尚未形成完整路線。',{reasonCode:'incomplete_connection'});
    path.unshift(edge);cursor=edge.from;
  }
  const routeLocations=[locationById[from],...path.map(e=>locationById[e.to])];
  const usedSourceIds=[...new Set([...path.flatMap(e=>[e.sourceId,e.coordinateSourceId]),...routeLocations.map(l=>l.sourceId)].filter(Boolean))];
  return {status:'ok',edges:path,locations:routeLocations,nodes:routeLocations,usedSourceIds,usedSources:sources.filter(s=>usedSourceIds.includes(s.id)),rankCost:distance.get(to),transferCount:path.filter(e=>e.mode!=='walk').length};
}

export function describeRoute(result) {
  if(result.status!=='ok') return result.reason||'請選擇起點與終點。';
  return `${result.locations.map(l=>l.name).join(' → ')}\n${result.edges.map((e,i)=>`${i+1}. ${e.instructions}`).join('\n')}`;
}
