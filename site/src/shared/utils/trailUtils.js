import {
  MAIN_TRAILS,
  TRAILS_BY_KEY,
  TRAILS_BY_SLUG,
} from '../constants/trails.js';

export function getTrailByKey(key) {
  return TRAILS_BY_KEY[key] || null;
}

export function getTrailBySlug(slug) {
  return TRAILS_BY_SLUG[slug] || null;
}

export function isKnownTrailSlug(slug) {
  return Boolean(getTrailBySlug(slug));
}

export function getNextTrail(currentSlug) {
  const currentTrail = getTrailBySlug(currentSlug);

  if (!currentTrail) {
    return null;
  }

  return (
    MAIN_TRAILS.find(
      (trail) => trail.order === currentTrail.order + 1,
    ) || null
  );
}

export function normalizeTrailProgress(progressPercent) {
  const progress = Number(progressPercent);

  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.max(0, Math.min(100, progress));
}

export function isTrailCompleted(progress) {
  if (!progress) {
    return false;
  }

  const status = String(progress.status || '')
    .trim()
    .toLowerCase();

  return (
    status === 'completed' ||
    status === 'concluido' ||
    status === 'concluído' ||
    normalizeTrailProgress(progress.progressPercent) >= 100
  );
}