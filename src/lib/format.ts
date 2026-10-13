/** Formate un poids (en Ko) en « 850 Ko » ou « 1,4 Mo ». Jamais de mélange d'unités. */
export function formatWeight(kb: number): string {
  if (!Number.isFinite(kb) || kb < 0) return '—'
  if (kb < 1024) return `${Math.round(kb)} Ko`
  return `${(kb / 1024).toFixed(1).replace('.', ',')} Mo`
}

/** Libellé de gain : « -1,4 Mo » ou « 0 — objectif atteint » (jamais « -0.0 »). */
export function formatSaving(kb: number): string {
  if (!Number.isFinite(kb) || kb <= 0) return '0 — objectif atteint'
  return `-${formatWeight(kb)}`
}
