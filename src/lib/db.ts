import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/**
 * Crée un SpeedTest en écrivant `inp` quand le client/DB le supporte.
 * Tolérant à la migration : si la colonne `inp` n'existe pas encore
 * (client Prisma non régénéré ou `db:push` en attente), rejoue sans `inp`.
 * `fid` reste toujours écrit comme miroir pour compatibilité.
 */
export async function createSpeedTest(data: Record<string, unknown>) {
  const create = db.speedTest.create as unknown as (
    args: { data: Record<string, unknown> }
  ) => Promise<{ id: string }>
  try {
    return await create({ data })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if ('inp' in data && /unknown argument|unknown field|column .*inp|inp.*column/i.test(msg)) {
      const { inp: _dropped, ...rest } = data
      return await create({ data: rest })
    }
    throw e
  }
}

/** Lecture tolérante : `inp` si présent (nouveau client), sinon miroir `fid`. */
export function pickInp(row: { inp?: unknown; fid?: unknown }): number | undefined {
  if (typeof row.inp === 'number') return row.inp
  if (typeof row.fid === 'number') return row.fid
  return undefined
}