// Source-backed Forever transport catalog, checked 2026-11-16.
// Zone x/y are native client map coordinates, not Classic Era coordinates.
const checkedAt='2026-11-16';
export const expansionMaps=[
 [1411,'杜洛塔','durotar'],[1412,'莫高雷','mulgore'],[1416,'奧特蘭克山脈','alterac-mountains'],
 [1417,'阿拉希高地','arathi-highlands'],[1418,'荒蕪之地','badlands'],[1419,'詛咒之地','blasted-lands'],
 [1420,'提里斯法林地','tirisfal-glades'],[1421,'銀松森林','silverpine-forest'],[1422,'西瘟疫之地','western-plaguelands'],
 [1423,'東瘟疫之地','eastern-plaguelands'],[1425,'辛特蘭','the-hinterlands'],[1427,'灼熱峽谷','searing-gorge'],
 [1428,'燃燒平原','burning-steppes'],[1435,'悲傷沼澤','swamp-of-sorrows'],[1441,'千針石林','thousand-needles'],
 [1443,'淒涼之地','desolace'],[1444,'菲拉斯','feralas'],[1446,'塔納利斯','tanaris'],[1447,'艾薩拉','azshara'],
 [1448,'費伍德森林','felwood'],[1449,'安戈洛環形山','ungoro-crater'],[1450,'月光林地','moonglade'],
 [1451,'希利蘇斯','silithus'],[1452,'冬泉谷','winterspring'],[1454,'奧格瑪','orgrimmar'],
 [1456,'雷霆崖','thunder-bluff'],[1458,'幽暗城','undercity'],[2482,'海加爾山','mount-hyjal'],
 [2521,'微風島','zephras-isle'],[2548,'大河林地','riverglades']
].map(([id,name,slug])=>({id,name,image:`assets/maps/${slug}.webp`,sourceId:'forever-map'}));

// Each record is a usable public flight endpoint. Druid-only Nighthaven and
// unconnected Powderfuse/Tidegear flight masters are deliberately not offered.
const flightRows=[
 ['aeriepeak','鷹巢山',1425,11.1,46.1,'alliance','eastern','Aerie Peak'],
 ['refugepointe','避難谷地',1417,45.8,46.1,'alliance','eastern','Refuge Pointe'],
 ['chillwindcamp','冰風崗哨',1422,42.9,85.0,'alliance','eastern','Chillwind Camp'],
 ['lightshope-alliance','聖光之願禮拜堂（聯盟）',1423,71.7,49.6,'alliance','eastern',"Light's Hope Chapel"],
 ['thoriumpoint-alliance','瑟銀哨塔（聯盟）',1427,37.9,30.4,'alliance','eastern','Thorium Point'],
 ['nethergardekeep','守望堡',1419,65.5,24.4,'alliance','eastern','Nethergarde Keep'],
 ['morgansvigil','摩根的崗哨',1428,84.4,68.3,'alliance','eastern',"Morgan's Vigil"],
 ['farholdekeep','遠境堡要塞',2548,60.6,81.6,'alliance','eastern','Farholde Keep'],
 ['talrendispoint','塔倫迪斯營地',1447,11.9,77.5,'alliance','kalimdor','Talrendis Point'],
 ['nijelspoint','尼耶爾前哨站',1443,64.7,10.4,'alliance','kalimdor',"Nijel's Point"],
 ['feathermoon','羽月要塞',1444,30.3,43.3,'alliance','kalimdor','Feathermoon'],
 ['thalanaar','薩蘭納爾',1444,89.5,45.9,'alliance','kalimdor','Thalanaar'],
 ['moonglade-alliance','月光林地（聯盟鳥點）',1450,47.9,67.1,'alliance','kalimdor','Moonglade'],
 ['cenarionhold-alliance','塞納里奧城堡（聯盟）',1451,50.7,34.6,'alliance','kalimdor','Cenarion Hold'],
 ['gadgetzan-alliance','加基森（聯盟）',1446,51.0,29.3,'alliance','kalimdor','Gadgetzan'],
 ['everlook-alliance','永望鎮（聯盟）',1452,62.3,36.6,'alliance','kalimdor','Everlook'],
 ['talonbranchglade','刺枝林地',1448,62.5,24.2,'alliance','kalimdor','Talonbranch Glade'],
 ['marshalsrefuge','馬紹爾營地',1449,45.3,6.0,'neutral','kalimdor',"Marshal's Refuge"],
 ['summitofeternity','永恆山峰',2482,68.6,44.1,'neutral','kalimdor','Summit of Eternity'],
 ['taintedfoothills','污化丘陵',2482,55.1,82.5,'neutral','kalimdor','Tainted Foothills'],
 ['orgrimmar','奧格瑪',1454,45.3,63.7,'horde','kalimdor','Orgrimmar'],
 ['thunderbluff','雷霆崖',1456,46.7,49.9,'horde','kalimdor','Thunder Bluff'],
 ['undercity','幽暗城',1458,63.1,48.3,'horde','eastern','Undercity'],
 ['hammerfall','落錘鎮',1417,73.1,32.6,'horde','eastern','Hammerfall'],
 ['revantuskvillage','惡齒村',1425,81.7,81.9,'horde','eastern','Revantusk Village'],
 ['lightshope-horde','聖光之願禮拜堂（部落）',1423,70.4,47.6,'horde','eastern',"Light's Hope Chapel"],
 ['thoriumpoint-horde','瑟銀哨塔（部落）',1427,34.8,30.6,'horde','eastern','Thorium Point'],
 ['flamecrest','烈焰峰',1428,65.6,24.2,'horde','eastern','Flame Crest'],
 ['kargath','卡加斯',1418,4.1,44.9,'horde','eastern','Kargath'],
 ['stonard','斯通納德',1435,46.1,54.7,'horde','eastern','Stonard'],
 ['sepulcher','瑟伯切爾',1421,45.6,42.4,'horde','eastern','The Sepulcher'],
 ['tarrenmill','塔倫米爾',1424,60.2,18.8,'horde','eastern','Tarren Mill'],
 ['gromgol','格羅姆高營地',1434,32.5,29.3,'horde','eastern',"Grom'gol"],
 ['bootybay-horde','藏寶海灣（部落鳥點）',1434,26.8,77.0,'horde','eastern','Booty Bay'],
 ['rogmar','羅格瑪',2548,59.6,45.1,'horde','eastern',"Rog'mar"],
 ['bloodvenompost','血毒崗哨',1448,34.4,53.9,'horde','kalimdor','Bloodvenom Post'],
 ['brackenwallvillage','蕨牆村',1445,35.6,31.8,'horde','kalimdor','Brackenwall Village'],
 ['campmojache','莫沙徹營地',1444,75.4,44.3,'horde','kalimdor','Camp Mojache'],
 ['camptaurajo','陶拉祖營地',1413,44.5,59.1,'horde','kalimdor','Camp Taurajo'],
 ['crossroads','十字路口',1413,51.5,30.4,'horde','kalimdor','Crossroads'],
 ['freewindpost','亂風崗',1441,45.0,49.1,'horde','kalimdor','Freewind Post'],
 ['shadowpreyvillage','葬影村',1443,21.6,74.0,'horde','kalimdor','Shadowprey Village'],
 ['sunrockretreat','烈日石居',1442,45.2,59.9,'horde','kalimdor','Sun Rock Retreat'],
 ['splintertreepost','碎木崗哨',1440,73.3,61.7,'horde','kalimdor','Splintertree Post'],
 ['zoramgaroutpost','佐拉姆加前哨站',1440,12.2,33.8,'horde','kalimdor',"Zoram'gar Outpost"],
 ['valormok','瓦羅莫克',1447,22.0,49.7,'horde','kalimdor','Valormok'],
 ['moonglade-horde','月光林地（部落鳥點）',1450,32.2,66.3,'horde','kalimdor','Moonglade'],
 ['cenarionhold-horde','塞納里奧城堡（部落）',1451,48.8,36.7,'horde','kalimdor','Cenarion Hold'],
 ['gadgetzan-horde','加基森（部落）',1446,51.6,25.5,'horde','kalimdor','Gadgetzan'],
 ['everlook-horde','永望鎮（部落）',1452,60.5,36.3,'horde','kalimdor','Everlook']
];
const mapRows=[...expansionMaps,
 {id:1424,name:'希爾斯布萊德丘陵',image:'assets/maps/hillsbrad-foothills.webp'},
 {id:1434,name:'荊棘谷',image:'assets/maps/stranglethorn-vale.webp'},
 {id:1442,name:'石爪山脈',image:'assets/maps/stonetalon-mountains.webp'},
 {id:1440,name:'梣谷',image:'assets/maps/ashenvale.webp'},
 {id:1445,name:'塵泥沼澤',image:'assets/maps/dustwallow-marsh.webp'},
 {id:1413,name:'貧瘠之地',image:'assets/maps/the-barrens.webp'}];
const mapById=new Map(mapRows.map(m=>[m.id,m]));
const pageFor=id=>`https://wowfdb.com/zones/${id===1449?'un-goro-crater':mapById.get(id).image.split('/').at(-1).replace('.webp','')}/map/`;
const aliases={
 orgrimmar:['奧格瑞瑪','奥格瑞玛','奧格','OG'],thunderbluff:['雷霆','TB'],undercity:['幽暗','UC'],
 aeriepeak:['鷹巢','鹰巢山'],refugepointe:['避難谷','避难谷地'],nijelspoint:['尼耶爾','尼耶尔前哨站'],
 farholdekeep:['遠境堡','远境堡','Farholde'],rogmar:['羅格','罗格玛'],
 feathermoon:['羽月','Feathermoon Stronghold'],gromgol:['格羅姆高','格羅姆高地','格罗姆高'],
 summitofeternity:['永恆','永恆之巔','海加爾山頂'],taintedfoothills:['山麓','汙染山麓','腐化山麓'],
 sepulcher:['瑟伯','墓地'],marshalsrefuge:['馬紹爾','马绍尔营地']
};
export const expansionLocations=flightRows.map(([id,name,mapId,x,y,faction,continent,english])=>({
 id,name,zone:mapById.get(mapId).name,mapId,x,y,faction,continent,hasFlight:true,
 type:['orgrimmar','thunderbluff','undercity'].includes(id)?'capital':id==='feathermoon'?'port':'flight',
 aliases:[english,...(aliases[id]||[])],pointLabel:faction==='alliance'?'聯盟飛行管理員':faction==='horde'?'部落飛行管理員':'中立飛行管理員',
 sourceId:'forever-map',coordinateSourceUrl:pageFor(mapId),checkedAt
}));
const port=(id,name,zone,mapId,x,y,faction,continent,aliases,type='port',sourceId='forever-waypoints')=>({
 id,name,zone,mapId,x,y,faction,continent,aliases,type,hasFlight:false,
 pointLabel:type==='dock'?'飛船碼頭':'碼頭',sourceId,checkedAt
});
expansionLocations.push(
 port('steamwheedleport','熱砂港','塔納利斯',1446,68.6,23.0,'neutral','kalimdor',['Steamwheedle Port','熱砂','热砂港']),
 port('powderfuseport','火線港','大河林地',2548,80.6,54.6,'neutral','eastern',['Powderfuse Port','火藥引信港','火药引信港','火線','火线港']),
 port('forgottencoast','被遺忘的海岸','菲拉斯',1444,43.1,42.8,'alliance','kalimdor',['Forgotten Coast','遺忘海岸','被遗忘的海岸'],'port','forever-feralas-map'),
 port('dalaran','達拉然','奧特蘭克山脈',1416,12.8,51.2,'alliance','eastern',['Dalaran','达拉然','天空飛船碼頭'],'dock'),
 port('valanaar','瓦拉納天空碼頭','微風島',2521,65.8,83.8,'neutral','other',['Valanaar','Valanaar Skydocks','微風島','微风岛','Zephras Isle','瓦拉納'],'dock'),
 port('skywatcherplateau','觀天者高原','莫高雷',1412,34.3,26.1,'horde','kalimdor',['Skywatcher Plateau','天空觀察者高地','觀天者','观天者高原'],'dock')
);

export const expansionSources=[
 {id:'forever-feralas-map',title:'永恆菲拉斯：羽月渡船兩端座標',url:'https://wowcalc.net/zh-TW/forever/map/kalimdor/feralas',checkedAt,note:'永恆客戶端70790；羽月31.0,39.5、被遺忘的海岸43.1,42.8。'},
 {id:'forever-riverglades-roads',title:'永恆大河林地：港口與兩陣營據點道路',url:'https://bytetavern.com/wow-forever-riverglades/',checkedAt,note:'現行客戶端70790；火線港沒有可用飛行連接，從港口步行至自己陣營據點。'},
 {id:'forever-dalaran-road',title:'永恆達拉然：南海鎮至天空飛船的地面走法',url:'https://www.reddit.com/r/wowforever/comments/1xih8ew/how_do_alliance_players_get_to_the_zephrus_isle/',checkedAt,note:'玩家現場走法；由南海鎮經希爾斯布萊德農田道路往達拉然，再進紫羅蘭城堡上層搭船。不是副本入口。'},
 {id:'forever-skywatcher-road',title:'永恆觀天者高原：雷霆崖西北方地面道路',url:'https://wowforeverleveling.com/guides/skyborne-leveling-guide',checkedAt,note:'高原在雷霆崖西北方；部落飛船抵達地面高原，不在雷霆崖頂層。'},
 {id:'forever-localization',title:'永恆繁中地名與新區域交通',url:'https://wowcalc.net/zh-TW/forever/map/eastern-kingdoms/riverglades',checkedAt,note:'新區域使用繁中地名；另保留英文原名供候選搜尋。'}
];

export const transportServices=[
 {id:'stormwind-auberdine',name:'暴風港 ↔ 奧伯丁',mode:'boat',faction:'alliance'},
 {id:'menethil-southshore-auberdine-loop',name:'米奈希爾港 → 南海鎮 → 奧伯丁 → 米奈希爾港',mode:'boat',faction:'alliance',directed:true},
 {id:'steamwheedle-powderfuse',name:'熱砂港 ↔ 火線港',mode:'boat',faction:'neutral'},
 {id:'menethil-theramore',name:'米奈希爾港 ↔ 塞拉摩',mode:'boat',faction:'alliance'},
 {id:'ratchet-bootybay',name:'棘齒城 ↔ 藏寶海灣',mode:'boat',faction:'neutral'},
 {id:'ruttheran-auberdine',name:'魯瑟蘭村 ↔ 奧伯丁',mode:'boat',faction:'alliance'},
 {id:'feathermoon-ferry',name:'羽月要塞 ↔ 被遺忘的海岸',mode:'boat',faction:'alliance'},
 {id:'valanaar-dalaran',name:'瓦拉納 ↔ 達拉然',mode:'zeppelin',faction:'alliance',vehicle:'skycutter'},
 {id:'valanaar-skywatcher',name:'瓦拉納 ↔ 觀天者高原',mode:'zeppelin',faction:'horde',vehicle:'zeppelin'},
 {id:'orgrimmar-undercity',name:'奧格瑪 ↔ 幽暗城',mode:'zeppelin',faction:'horde'},
 {id:'orgrimmar-gromgol',name:'奧格瑪 ↔ 格羅姆高營地',mode:'zeppelin',faction:'horde'},
 {id:'undercity-gromgol',name:'幽暗城 ↔ 格羅姆高營地',mode:'zeppelin',faction:'horde'},
 {id:'deeprun-tram',name:'鐵爐堡 ↔ 暴風城礦道地鐵',mode:'tram',faction:'alliance'}
];
