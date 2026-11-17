// Unspecified bird points are available. Only explicit exclusions restrict a route.
export function normalizeExcludedFlightIds(allFlightIds, input) {
  const known = new Set(allFlightIds);
  return [...new Set(Array.isArray(input) ? input : [])].filter(id => typeof id === 'string' && known.has(id));
}

export function availableFlightIds(allFlightIds, excludedInput = []) {
  const excluded = new Set(normalizeExcludedFlightIds(allFlightIds, excludedInput));
  return [...new Set(allFlightIds)].filter(id => !excluded.has(id));
}
