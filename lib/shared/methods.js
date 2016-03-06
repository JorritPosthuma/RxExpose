import _ from 'lodash';

export function messageToData(message) {
  try { return JSON.parse(message); }
  catch(e) { console.error(e); }

  return undefined;
}

export function filterEnvelope(data) {
  if (!data) return false;
  if (!_.has(data, 'type')) return false;
  if (!_.has(data, 'id')) return false;
  if (!_.isFinite(data.id)) return false;

  return true;
}
