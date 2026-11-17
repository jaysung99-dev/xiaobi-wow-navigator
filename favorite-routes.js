// Browser storage is untrusted input, including data written by older versions.
export function normalizeFavoriteRoutes(input, locations) {
  if (!Array.isArray(input)) return [];
  return input.filter(item => item && locations.has(item.from) && locations.has(item.to)
    && (item.faction == null || item.faction === '' || ['alliance', 'horde'].includes(item.faction)))
    .slice(0, 20)
    .map(item => ({
      from: item.from,
      to: item.to,
      faction: item.faction || (locations.get(item.from).faction === 'horde' ? 'horde' : 'alliance')
    }));
}
