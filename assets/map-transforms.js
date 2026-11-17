// Native WoW map coordinates, not longitude/latitude. Sources in asset-manifest.json.
export function projectMapPoint(point, fromMapId, toMapId, mapEntries) {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return null;
  if (Number(fromMapId) === Number(toMapId)) return {x: point.x, y: point.y};
  const source = mapEntries.find(m => Number(m.mapId) === Number(fromMapId));
  const target = mapEntries.find(m => Number(m.mapId) === Number(toMapId));
  if (!source?.worldRegions || !target?.worldRegions) return null;
  const px=point.x/100, py=point.y/100;
  const sr=source.worldRegions.find(r => px>=r.ui[0]-1e-6 && px<=r.ui[2]+1e-6 && py>=r.ui[1]-1e-6 && py<=r.ui[3]+1e-6);
  if (!sr) return null;
  const tr=target.worldRegions.find(r => r.map===sr.map);
  if (!tr) return null;
  const sw=sr.world,su=sr.ui,tw=tr.world,tu=tr.ui;
  const gx=sw[2]-((py-su[1])/(su[3]-su[1]))*(sw[2]-sw[0]);
  const gy=sw[3]-((px-su[0])/(su[2]-su[0]))*(sw[3]-sw[1]);
  const x=100*(tu[0]+((tw[3]-gy)/(tw[3]-tw[1]))*(tu[2]-tu[0]));
  const y=100*(tu[1]+((tw[2]-gx)/(tw[2]-tw[0]))*(tu[3]-tu[1]));
  return Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null;
}
