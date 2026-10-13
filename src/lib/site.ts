// URL canonique du site (surchargeable en prod via NEXT_PUBLIC_SITE_URL).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://tryvelocita.eurinhash.com'

export function canonical(path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${clean === '/' ? '' : clean}`
}
