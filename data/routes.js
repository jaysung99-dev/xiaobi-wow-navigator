// World of Warcraft: Forever. Rank costs are relative routing weights, never minutes.
import {expansionMaps,expansionLocations,expansionSources,transportServices} from './transport-expansion.js';
import {sourceFlightPairs,sourceEndpointIds} from './flight-network.js';
export {sourceFlightPairs,sourceEndpointIds,transportServices};
export const version = '魔獸世界：永恆';
export const checkedAt = '2026-11-16';
export const coverage = '聯盟、部落與中立交通骨幹；142 對表列飛行連接及 13 條公共交通服務';

export const sources = [
  {id:'forever-transport', title:'永恆船班與飛行連接表', url:'https://foreverwow.com/boats-and-zeppelins/', checkedAt, note:'社群依客戶端資料整理；包含單向船班。相對權重不代表實際分鐘。'},
  {id:'forever-waypoints', title:'Wowhead 永恆飛行點、碼頭與地鐵座標', url:'https://www.wowhead.com/forever/guide/flight-points-zeppelins-and-ships', checkedAt, note:'提供上船點、地鐵入口與飛行管理員座標。'},
  {id:'forever-map', title:'永恆區域地圖與城鎮點位', url:'https://wowfdb.com/zones/', checkedAt, note:'每個座標以該區域地圖為準；節點為城鎮代表點或飛行管理員。'},
  {id:'forever-dunmorogh-walk', title:'永恆丹莫洛步行道路', url:'https://www.foreverwisp.com/guides/wow-forever-dwarf-gnome-leveling-guide', checkedAt},
  {id:'forever-lochmodan-walk', title:'永恆南門小徑至塞爾薩瑪', url:'https://dailyrespawn.com/article/loch-modan-leveling-guide-wow-forever-thelsamar-quest-order-levels-10-20', checkedAt},
  {id:'forever-alliance-roads', title:'永恆聯盟區域道路與城鎮連接', url:'https://bytetavern.com/wow-forever-alliance-leveling-route/', checkedAt},
  {id:'darnassus-portal', title:'永恆達納蘇斯與魯瑟蘭村傳送門', url:'https://wowcalc.net/en/forever/map/kalimdor/darnassus', checkedAt, note:'達納蘇斯 29.1、41.2；泰達希爾的魯瑟蘭村入口 55.9、89.3。'}
  ,...expansionSources
];

export const maps = [
  [1455,'鐵爐堡','ironforge'], [1453,'暴風城','stormwind-city'],
  [1437,'濕地','wetlands'], [1445,'塵泥沼澤','dustwallow-marsh'],
  [1413,'貧瘠之地','the-barrens'], [1434,'荊棘谷','stranglethorn-vale'],
  [1424,'希爾斯布萊德丘陵','hillsbrad-foothills'], [1439,'黑海岸','darkshore'],
  [1438,'泰達希爾','teldrassil'], [1457,'達納蘇斯','darnassus'],
  [1440,'梣谷','ashenvale'], [1426,'丹莫洛','dun-morogh'],
  [1432,'洛克莫丹','loch-modan'], [1429,'艾爾文森林','elwynn-forest'],
  [1436,'西部荒野','westfall'], [1433,'赤脊山','redridge-mountains'],
  [1431,'暮色森林','duskwood'], [1442,'石爪山脈','stonetalon-mountains']
].map(([id,name,slug])=>({id,name,image:`assets/maps/${slug}.webp`,sourceId:'forever-map'})).concat(expansionMaps);

const loc = (id,name,zone,mapId,x,y,hasFlight,continent,aliases=[],extra={}) => ({id,name,zone,mapId,x,y,hasFlight,continent,aliases,type:'town',faction:'alliance',sourceId:'forever-map',checkedAt,...extra});
export const locations = [
  loc('ironforge','鐵爐堡','鐵爐堡',1455,55.9,47.9,true,'eastern',['鐵盧堡','IF','Ironforge'],{type:'capital',pointLabel:'獅鷲管理員'}),
  loc('stormwind','暴風城','暴風城',1453,71.6,72.3,true,'eastern',['暴風','SW','Stormwind'],{type:'capital',pointLabel:'獅鷲管理員'}),
  loc('menethil','米奈希爾港','濕地',1437,9.5,59.7,true,'eastern',['米港','Menethil Harbor'],{type:'port',pointLabel:'獅鷲管理員'}),
  loc('theramore','塞拉摩','塵泥沼澤',1445,67.5,51.2,true,'kalimdor',['塞拉摩島','Theramore'],{type:'port',pointLabel:'獅鷲管理員'}),
  loc('ratchet','棘齒城','貧瘠之地',1413,63.1,37.1,true,'kalimdor',['及齒城','棘齿城','Ratchet'],{type:'port',faction:'neutral',pointLabel:'飛行管理員'}),
  loc('bootybay','藏寶海灣','荊棘谷',1434,27.5,77.7,true,'eastern',['藏寶灣','Booty Bay'],{type:'port',faction:'neutral',flightFactions:['alliance'],pointLabel:'聯盟飛行管理員'}),
  loc('southshore','南海鎮','希爾斯布萊德丘陵',1424,49.4,52.1,true,'eastern',['南海','Southshore'],{type:'port',pointLabel:'獅鷲管理員'}),
  loc('auberdine','奧伯丁','黑海岸',1439,36.4,45.6,true,'kalimdor',['奥伯丁','Auberdine'],{type:'port',pointLabel:'角鷹獸管理員'}),
  loc('ruttheran','魯瑟蘭村','泰達希爾',1438,58.4,93.9,true,'kalimdor',['魯瑟蘭','鲁瑟兰村',"Rut'theran Village"],{type:'port',pointLabel:'角鷹獸管理員'}),
  loc('darnassus','達納蘇斯','達納蘇斯',1457,29.1,41.2,false,'kalimdor',['達那蘇斯','達納','Darnassus'],{type:'capital',pointLabel:'通往魯瑟蘭村的傳送門',sourceId:'darnassus-portal'}),
  loc('astranaar','亞斯特蘭納','梣谷',1440,34.5,48,true,'kalimdor',['阿斯特蘭納','阿斯特兰纳','灰谷','梣谷','Astranaar'],{pointLabel:'角鷹獸管理員'}),
  loc('kharanos','卡拉諾斯','丹莫洛',1426,46.4,52,false,'eastern',['卡拉诺斯','丹莫羅','Kharanos']),
  loc('thelsamar','塞爾薩瑪','洛克莫丹',1432,33.9,50.8,true,'eastern',['塞爾薩馬','塞尔萨玛','Thelsamar'],{pointLabel:'獅鷲管理員'}),
  loc('goldshire','閃金鎮','艾爾文森林',1429,42.4,66.6,false,'eastern',['闪金镇','Goldshire']),
  loc('sentinelhill','哨兵嶺','西部荒野',1436,56.6,52.7,true,'eastern',['哨兵岭','Sentinel Hill'],{pointLabel:'獅鷲管理員'}),
  loc('lakeshire','湖畔鎮','赤脊山',1433,25.3,59,true,'eastern',['湖畔镇','Lakeshire'],{pointLabel:'獅鷲管理員'}),
  loc('darkshire','夜色鎮','暮色森林',1431,77.6,44.4,true,'eastern',['夜色镇','Darkshire'],{pointLabel:'獅鷲管理員'}),
  loc('stonetalonpeak','石爪峰','石爪山脈',1442,36.5,7.2,true,'kalimdor',['石爪山','Stonetalon Peak'],{pointLabel:'角鷹獸管理員'}),
  ...expansionLocations
];
// The shared port can be neutral while its representative flight master is not.
for(const location of locations)location.flightFactions=location.hasFlight?(location.flightFactions||(location.faction==='neutral'?['alliance','horde']:[location.faction])):[];

const byId = new Map(locations.map(l=>[l.id,l]));
const coord = (mapId,x,y,label) => ({mapId,x,y,label});
const flightPoint = id => {const l=byId.get(id);return coord(l.mapId,l.x,l.y,`${l.name} ${l.pointLabel || '飛行點'}`)};
const connections = [];
const add = (from,to,mode,instructions,rankCost,extra={}) => connections.push({id:`${mode}-${from}-${to}`,from,to,mode,instructions,rankCost,sourceId:'forever-transport',faction:'alliance',checkedAt,...extra});
const flight = (a,b,cost=7,faction='alliance',extra={}) => {
  for(const [from,to] of [[a,b],[b,a]]) {
    add(from,to,'flight',`前往${byId.get(from).name}的${byId.get(from).pointLabel || '飛行管理員'}，選擇「${byId.get(to).name.replace(/（[^）]*）/g,'')}」。抵達後再依下一段指引轉乘。`,cost,{faction,requiresFlights:[from,to],boarding:flightPoint(from),arrival:flightPoint(to),...extra});
  }
};
// Direct, faction-appropriate connections from the linked Forever transport table.
[
 ['ironforge','menethil',5],['ironforge','thelsamar',4],['ironforge','southshore',7],
 ['stormwind','ironforge',7],['stormwind','sentinelhill',4],['stormwind','lakeshire',5],['stormwind','darkshire',5],['stormwind','bootybay',9],
 ['menethil','thelsamar',5],['menethil','southshore',6],
 ['sentinelhill','lakeshire',5],['sentinelhill','darkshire',5],['sentinelhill','bootybay',8],
 ['lakeshire','darkshire',4],['darkshire','bootybay',7],
 ['auberdine','astranaar',5],['auberdine','theramore',12],['auberdine','stonetalonpeak',7],
 ['astranaar','stonetalonpeak',6],['theramore','ratchet',5]
].forEach(([a,b,c])=>flight(a,b,c));
flight('auberdine','ruttheran',4);
// Import every remaining verified direct pair, preserving existing stable edge IDs.
for(const pair of sourceFlightPairs){
  const existing=connections.filter(e=>e.mode==='flight'&&((e.from===pair.from&&e.to===pair.to)||(e.from===pair.to&&e.to===pair.from)));
  if(existing.length){for(const e of existing){e.faction=pair.faction;e.sourceTablePair=true;e.isNew=pair.isNew;}}
  else flight(pair.from,pair.to,7,pair.faction,{sourceTablePair:true,isNew:pair.isNew});
}

const dock = {
  stormwind:coord(1453,21.8,56.9,'暴風港往奧伯丁碼頭'),
  auberdineSW:coord(1439,30.5,40.9,'奧伯丁往暴風城碼頭'),
  auberdineMenethil:coord(1439,32.3,44.1,'奧伯丁往米奈希爾港碼頭'),
  auberdineRut:coord(1439,33.3,39.8,'奧伯丁往魯瑟蘭村碼頭'),
  menethilLoop:coord(1437,4.5,56.7,'米奈希爾港往南海鎮碼頭'),
  menethilTheramore:coord(1437,4.7,63.8,'米奈希爾港往塞拉摩碼頭'),
  southshore:coord(1424,50.7,70.4,'南海鎮往奧伯丁碼頭'),
  theramore:coord(1445,71.7,56.7,'塞拉摩往米奈希爾港碼頭'),
  ratchet:coord(1413,63.8,38.8,'棘齒城往藏寶海灣碼頭'),
  bootybay:coord(1434,25.7,73.1,'藏寶海灣往棘齒城碼頭'),
  ruttheran:coord(1438,54.8,97.2,'魯瑟蘭村往奧伯丁碼頭')
};
const boat = (from,to,boarding,arrival,instructions,cost=9,extra={}) => add(from,to,'boat',instructions,cost,{boarding,arrival,coordinateSourceId:'forever-waypoints',...extra});
boat('stormwind','auberdine',dock.stormwind,dock.auberdineSW,'到暴風港的奧伯丁碼頭，確認目的地後登船；在奧伯丁下船。',11);
boat('auberdine','stormwind',dock.auberdineSW,dock.stormwind,'到奧伯丁往暴風城的碼頭，確認目的地後登船；在暴風港下船。',11);
// This ship is a directed loop, NOT three bidirectional routes.
boat('menethil','southshore',dock.menethilLoop,dock.southshore,'到往南海鎮的碼頭登船；船抵南海鎮時下船。這條船循序行經米奈希爾港、南海鎮、奧伯丁。',8,{serviceId:'menethil-southshore-auberdine-loop',warning:'單向循環船班：米奈希爾港 → 南海鎮 → 奧伯丁 → 米奈希爾港。'});
boat('southshore','auberdine',dock.southshore,dock.auberdineMenethil,'到南海鎮碼頭登船；下一站為奧伯丁，在奧伯丁下船。',10,{serviceId:'menethil-southshore-auberdine-loop',warning:'若要從南海鎮搭船去米奈希爾港，需要經過奧伯丁，不能把這條船反向搭。'});
boat('auberdine','menethil',dock.auberdineMenethil,dock.menethilLoop,'在奧伯丁往米奈希爾港碼頭登船；抵米奈希爾港後下船。',10,{serviceId:'menethil-southshore-auberdine-loop'});
boat('menethil','theramore',dock.menethilTheramore,dock.theramore,'前往米奈希爾港往塞拉摩的碼頭，確認船的目的地是塞拉摩再登船；抵達後下船。',9,{warning:'米奈希爾港另有經南海鎮往奧伯丁的船，請確認碼頭與目的地。'});
boat('theramore','menethil',dock.theramore,dock.menethilTheramore,'前往塞拉摩長碼頭，搭往米奈希爾港的船；抵達後下船。',9);
boat('ratchet','bootybay',dock.ratchet,dock.bootybay,'到棘齒城海邊碼頭，搭往藏寶海灣的船；在藏寶海灣下船。',10,{faction:'neutral'});
boat('bootybay','ratchet',dock.bootybay,dock.ratchet,'到藏寶海灣碼頭，搭往棘齒城的船；在棘齒城下船。',10,{faction:'neutral'});
boat('auberdine','ruttheran',dock.auberdineRut,dock.ruttheran,'到奧伯丁往魯瑟蘭村碼頭等船，抵魯瑟蘭村後下船。',8);
boat('ruttheran','auberdine',dock.ruttheran,dock.auberdineRut,'到魯瑟蘭村往奧伯丁碼頭登船，在奧伯丁下船。',8);

const ifTram=coord(1455,63.6,29.3,'鐵爐堡地精區：礦道地鐵入口');
const swTram=coord(1453,69.6,30.3,'暴風城矮人區：礦道地鐵入口');
add('ironforge','stormwind','tram','前往鐵爐堡地精區的「礦道地鐵」入口，進站候車；搭到暴風城後出站，會進入矮人區。',5,{boarding:ifTram,arrival:swTram,coordinateSourceId:'forever-waypoints'});
add('stormwind','ironforge','tram','前往暴風城矮人區的「礦道地鐵」入口，進站候車；搭到鐵爐堡後出站，會進入地精區。',5,{boarding:swTram,arrival:ifTram,coordinateSourceId:'forever-waypoints'});

add('darnassus','ruttheran','portal','到達納蘇斯銀行西側、發粉紅光的傳送樹（29.1，41.2），穿過傳送門抵達魯瑟蘭村，再沿路下到碼頭。',3,{sourceId:'darnassus-portal',boarding:coord(1457,29.1,41.2,'達納蘇斯傳送樹'),arrival:coord(1438,55.9,89.3,'魯瑟蘭村傳送門')});
add('ruttheran','darnassus','portal','沿魯瑟蘭村上坡走到粉紅傳送門（55.9，89.3），穿過傳送門進入達納蘇斯。',3,{sourceId:'darnassus-portal',boarding:coord(1438,55.9,89.3,'魯瑟蘭村傳送門'),arrival:coord(1457,29.1,41.2,'達納蘇斯傳送樹')});

// Walking connections describe verified road corridors, not fabricated GPS polylines.
const walk=(a,b,forward,reverse,sourceId,cost=16,warning,faction='alliance')=>{
  add(a,b,'walk',forward,cost,{sourceId,warning,faction,geometry:'road-corridor'});
  add(b,a,'walk',reverse,cost,{sourceId,warning,faction,geometry:'road-corridor'});
};
walk('ironforge','kharanos','從鐵爐堡大門出城，沿山坡道路下山，再沿雪地大路向南到卡拉諾斯。','從卡拉諾斯沿大路往北，沿山坡道路上山，由鐵爐堡大門進城。','forever-dunmorogh-walk',12);
walk('kharanos','thelsamar','從卡拉諾斯沿丹莫洛大路往東，經南門小徑穿越隧道進洛克莫丹，再沿大路往北到塞爾薩瑪。','從塞爾薩瑪沿大路南行，經南門小徑的隧道進丹莫洛，沿大路往西到卡拉諾斯。','forever-lochmodan-walk',24,'沿道路通過山口，請勿照兩地直線翻山。');
walk('stormwind','goldshire','從暴風城貿易區大門出城，沿艾爾文森林大路往東南走到閃金鎮。','從閃金鎮沿通往暴風城的大路往西北走，穿過城門進入貿易區。','forever-alliance-roads',12);
walk('goldshire','sentinelhill','從閃金鎮沿大路往西，經西泉要塞後過河進西部荒野；沿主路向南到哨兵嶺。','從哨兵嶺沿主路往北，過河回艾爾文森林，經西泉要塞後沿大路向東到閃金鎮。','forever-alliance-roads',22);
walk('goldshire','lakeshire','從閃金鎮沿大路往東，經東谷伐木場方向進赤脊山，抵三角路口後沿道路往東北到湖畔鎮。','從湖畔鎮沿路往西南到三角路口，再往西進艾爾文森林，沿大路回閃金鎮。','forever-alliance-roads',24);
walk('lakeshire','darkshire','從湖畔鎮沿路往西南到三角路口，沿南方道路進暮色森林，再沿大路到夜色鎮。','從夜色鎮沿東方道路離鎮，往北接赤脊山的三角路口，再沿路往東北到湖畔鎮。','forever-alliance-roads',22,'暮色森林的野外怪物等級較高，請沿道路行進。');

// The complete remaining published boat/airship services. A city endpoint may
// use a dock outside its city map; boarding/arrival always identify the true map.
const featherDock=coord(1444,31.0,39.5,'羽月要塞往被遺忘的海岸碼頭');
const forgottenDock=coord(1444,43.1,42.8,'被遺忘的海岸往羽月要塞渡船碼頭');
boat('feathermoon','forgottencoast',featherDock,forgottenDock,'從羽月要塞沿路到島北側碼頭，搭渡船前往菲拉斯本土的被遺忘的海岸；抵岸下船。',5,{serviceId:'feathermoon-ferry',coordinateSourceId:'forever-feralas-map'});
boat('forgottencoast','feathermoon',forgottenDock,featherDock,'到被遺忘的海岸渡船碼頭（43.1，42.8），搭往羽月要塞的船；抵島後下船，沿路進要塞。',5,{serviceId:'feathermoon-ferry',coordinateSourceId:'forever-feralas-map'});
const steamDock=coord(1446,68.6,23.0,'熱砂港往大河林地的船碼頭');
const powderDock=coord(2548,80.6,54.6,'火線港往熱砂港的船碼頭');
boat('steamwheedleport','powderfuseport',steamDock,powderDock,'到熱砂港海邊碼頭，搭往大河林地火線港（Powderfuse Port）的船；抵港下船。',10,{serviceId:'steamwheedle-powderfuse',faction:'neutral',warning:'火線港沒有已核對可用的鳥點；下船後需步行到自己陣營的據點。'});
boat('powderfuseport','steamwheedleport',powderDock,steamDock,'到火線港海邊碼頭，確認目的地為塔納利斯熱砂港再登船；抵達後下船。',10,{serviceId:'steamwheedle-powderfuse',faction:'neutral'});
const air=(from,to,boarding,arrival,instructions,serviceId,faction='horde',cost=10)=>add(from,to,'zeppelin',instructions,cost,{boarding,arrival,serviceId,faction,coordinateSourceId:'forever-waypoints'});
const dalaranDock=coord(1416,12.8,51.2,'達拉然紫羅蘭城堡上層天空飛船碼頭');
const valanaarAlliance=coord(2521,65.8,83.8,'瓦拉納聯盟天空飛船碼頭');
const valanaarHorde=coord(2521,57.7,81.0,'瓦拉納往觀天者高原的部落飛船碼頭');
const skywatcherDock=coord(1412,34.3,26.1,'觀天者高原南側飛船碼頭');
air('valanaar','dalaran',valanaarAlliance,dalaranDock,'到瓦拉納天空碼頭東側的聯盟飛空艇（65.8，83.8），確認往達拉然後登船；抵達拉然紫羅蘭城堡上層後下船。','valanaar-dalaran','alliance');
air('dalaran','valanaar',dalaranDock,valanaarAlliance,'進達拉然的紫羅蘭城堡，走到上層天空飛船碼頭（12.8，51.2），搭往微風島瓦拉納的飛空艇。','valanaar-dalaran','alliance');
air('valanaar','skywatcherplateau',valanaarHorde,skywatcherDock,'到瓦拉納天空碼頭西側的部落飛船（57.7，81.0），確認往觀天者高原後登船；在莫高雷西北高原下船。','valanaar-skywatcher');
air('skywatcherplateau','valanaar',skywatcherDock,valanaarHorde,'沿觀天者高原的道路走到南側飛船碼頭（34.3，26.1），搭往微風島瓦拉納的飛船。','valanaar-skywatcher');
const orgUC=coord(1411,51.0,13.9,'奧格瑪城外往幽暗城飛艇塔');
const orgGG=coord(1411,50.5,12.7,'奧格瑪城外往格羅姆高飛艇塔');
const ucORG=coord(1420,60.6,58.9,'幽暗城北方往奧格瑪飛艇塔');
const ucGG=coord(1420,61.9,58.9,'幽暗城北方往格羅姆高飛艇塔');
const ggORG=coord(1434,31.2,30.4,'格羅姆高往奧格瑪飛艇塔');
const ggUC=coord(1434,31.5,29.1,'格羅姆高往幽暗城飛艇塔');
air('orgrimmar','undercity',orgUC,ucORG,'從奧格瑪正門出城，在杜洛塔的飛艇塔選往幽暗城的班次（51.0，13.9）；抵提里斯法林地後下塔，沿路往南進幽暗城。','orgrimmar-undercity');
air('undercity','orgrimmar',ucORG,orgUC,'從幽暗城搭升降梯到地面，往北到提里斯法林地飛艇塔（60.6，58.9），搭往奧格瑪的飛艇；下塔後沿路進城。','orgrimmar-undercity');
air('orgrimmar','gromgol',orgGG,ggORG,'從奧格瑪正門出城，到杜洛塔的格羅姆高飛艇塔（50.5，12.7）登船；抵荊棘谷格羅姆高營地後下塔。','orgrimmar-gromgol');
air('gromgol','orgrimmar',ggORG,orgGG,'到格羅姆高營地飛艇塔的奧格瑪停靠處（31.2，30.4）登船；抵杜洛塔後下塔，沿路進奧格瑪。','orgrimmar-gromgol');
air('undercity','gromgol',ucGG,ggUC,'從幽暗城回地面，往北到提里斯法林地飛艇塔（61.9，58.9），確認往格羅姆高再登船；抵營地下塔。','undercity-gromgol');
air('gromgol','undercity',ggUC,ucGG,'到格羅姆高飛艇塔的幽暗城停靠處（31.5，29.1）登船；抵提里斯法林地下塔，沿路往南進幽暗城。','undercity-gromgol');

walk('bootybay','bootybay-horde','從藏寶海灣碼頭沿鎮內木棧道走到部落飛行管理員（26.8，77.0）。','從藏寶海灣部落鳥點沿鎮內木棧道走到往棘齒城的碼頭（25.7，73.1）。','forever-map',2,undefined,'horde');
walk('gadgetzan-alliance','steamwheedleport','從加基森沿東方通往海岸的道路前往熱砂港，再走到海邊碼頭。','從熱砂港沿通往內陸的道路往西回加基森，找聯盟飛行管理員。','forever-transport',10);
walk('gadgetzan-horde','steamwheedleport','從加基森沿東方通往海岸的道路前往熱砂港，再走到海邊碼頭。','從熱砂港沿通往內陸的道路往西回加基森，找部落飛行管理員。','forever-transport',10,undefined,'horde');
walk('powderfuseport','farholdekeep','從火線港出港後沿道路往南，前往大河林地南部的遠境堡要塞；避開西北方的部落羅格瑪。','從遠境堡要塞沿道路往北再往東，到大河林地東岸的火線港。','forever-riverglades-roads',18,'大河林地是中高等區域；低等角色請避免離開道路。');
walk('powderfuseport','rogmar','從火線港沿道路往西，到主河流附近的羅格瑪，找部落飛行管理員。','從羅格瑪沿道路往東前往火線港，再走到港口碼頭。','forever-riverglades-roads',12,'大河林地是中高等區域；低等角色請避免離開道路。','horde');
walk('southshore','dalaran','從南海鎮沿路往北出鎮，往西接希爾斯布萊德農田道路，再沿北方道路前往達拉然；進紫羅蘭城堡走到上層天空飛船碼頭。','從達拉然紫羅蘭城堡下到地面，沿南方道路經希爾斯布萊德農田，接回通往南海鎮的道路，進鎮往海邊碼頭。','forever-dalaran-road',22,'達拉然沒有一般鳥點；這是地面道路，別把「達拉然城」副本入口當成碼頭。途中怪物對低等角色有風險。');
walk('thunderbluff','skywatcherplateau','從雷霆崖搭升降梯到莫高雷地面，沿雷霆崖西北方上山道路到觀天者高原，再循高原道路到南側飛船碼頭。','從觀天者高原循原道路下山，往雷霆崖的升降梯，搭上城市後沿橋梁到中央高地。','forever-skywatcher-road',15,'請走上山道路；碼頭在莫高雷地面區域，並不在雷霆崖城市頂層。','horde');

// Link each scheduled service to every directed edge for coverage auditing.
const oldServices={
 'stormwind-auberdine':['stormwind-auberdine','auberdine-stormwind'],
 'menethil-theramore':['menethil-theramore','theramore-menethil'],
 'ratchet-bootybay':['ratchet-bootybay','bootybay-ratchet'],
 'ruttheran-auberdine':['ruttheran-auberdine','auberdine-ruttheran']
};
for(const [serviceId,pairs] of Object.entries(oldServices))for(const e of connections)if(e.mode==='boat'&&pairs.includes(`${e.from}-${e.to}`))e.serviceId=serviceId;
for(const e of connections)if(e.mode==='tram')e.serviceId='deeprun-tram';

export const sourceCoverage={
 checkedAt,sourceId:'forever-transport',sourceUrl:'https://foreverwow.com/boats-and-zeppelins/',
 sourceUpdatedAt:'2026-11-07',sourceBuild:'1.60.1.70862',
 flights:{sourcePairs:142,includedPairs:sourceFlightPairs.length,sourceEndpoints:64,extraVerifiedPairs:1,extraVerifiedPairSource:'https://wowfdb.com/zones/teldrassil/map/',note:'每對包含兩個方向；聯盟與部落同名鳥點分開處理。額外1對為魯瑟蘭村↔奧伯丁。'},
 services:{sourceTotal:13,includedTotal:transportServices.length,
  boats:{sourceTotal:7,includedTotal:7},zeppelins:{sourceTotal:5,includedTotal:5},tram:{sourceTotal:1,includedTotal:1},
  included:transportServices.map(s=>({...s,sourceId:'forever-transport',checkedAt})),unverified:[]},
 gaps:[
  '涵蓋指定來源的公共交通表；不是全世界村落、任務NPC、副本入口或每一條步行道路。',
  '火線港與丹莫洛海岸的未啟用鳥點未加入飛行網；不採用已移除的測試服航線。',
  '德魯伊限定永夜港飛行、職業傳送、爐石與需任務／種族條件的傳送門未加入一般導航。',
  '達拉然至暴風城的天空裔限定傳送不適用所有角色；本版保留由南海鎮走地面道路。',
  '船班、飛船即時運行狀態與等待時間未連線監測；上船前請以遊戲內目的地為準。'
 ]
};

export const edges = connections;
export const flightLocations = locations.filter(l=>l.hasFlight);
export const locationById = Object.fromEntries(locations.map(l=>[l.id,l]));
export const modeLabels = {walk:'步行',flight:'飛行',boat:'搭船',zeppelin:'飛船',tram:'地鐵',portal:'傳送門'};
export const dataNotes = [
  '已納入來源表142對一般飛行連接、7條船班、5條飛船與礦道地鐵；另核對魯瑟蘭村飛行連接。',
  '預設全部鳥點可用；從規劃結果排除尚未開通的鳥點後自動重算。',
  '地圖連線表示交通連接；步行按文字道路指引，不是可自動行走的逐公尺路徑。',
  '候船、飛行時間與票價尚未逐段實測，因此不顯示固定 ETA 或金額。'
];
