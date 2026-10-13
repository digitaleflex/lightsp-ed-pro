import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email: string = (body?.email ?? '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }
    await db.subscriber.upsert({
      where: { email },
      create: { email },
      update: {},
    })
    const count = await db.subscriber.count()
    return NextResponse.json({ success: true, subscribers: count })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erreur d'inscription" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const count = await db.subscriber.count()
    return NextResponse.json({ success: true, subscribers: count })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
