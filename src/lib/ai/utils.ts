/** Helpers partagés entre providers. */

/** Détecte un échec de quota / limite (partagé par tous les providers). */
export function isQuotaError(status: number): boolean {
  return status === 429 || status === 402 || status === 403
}
