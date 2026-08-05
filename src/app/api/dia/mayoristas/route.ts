import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBusinessConfig } from '@/lib/business-context'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function inicioDiaARiso(): string {
  const ar = new Date(Date.now() - 3 * 3600 * 1000)
  return new Date(Date.UTC(ar.getUTCFullYear(), ar.getUTCMonth(), ar.getUTCDate(), 3, 0, 0)).toISOString()
}
const norm = (s: string) => s.toLowerCase().normalize('NFD').split('').filter(c => { const x = c.charCodeAt(0); return x < 0x300 || x > 0x36f }).join('')

// ¿Contactaste hoy cada rubro? Los rubros salen de la config (Prospección),
// no hay ninguno hardcodeado.
export async function GET() {
  const db = await createClient()
  const desde = inicioDiaARiso()

  const biz = await getBusinessConfig(db)
  const buckets = biz.rubrosProspectar.map(r => ({ key: norm(r), label: r, needle: norm(r) })).filter(b => b.needle)
  if (!buckets.length) return NextResponse.json({ rubros: [] })

  const { data: hist } = await db.from('client_history').select('client_id')
    .gte('fecha', desde).in('accion', ['WhatsApp enviado', 'Instagram enviado'])
  const ids = [...new Set((hist || []).map(h => h.client_id).filter(Boolean))]

  const rubroById = new Map<string, string>()
  if (ids.length) {
    const { data: cli } = await db.from('clients').select('id, rubro').in('id', ids)
    for (const c of cli || []) rubroById.set(c.id, norm((c.rubro as string) || ''))
  }

  const conteo: Record<string, Set<string>> = Object.fromEntries(buckets.map(b => [b.key, new Set<string>()]))
  for (const id of ids) {
    const r = rubroById.get(id) || ''
    // Match flexible en ambos sentidos (ej. "gimnasio" vs "gimnasios")
    for (const b of buckets) if (r && (r.includes(b.needle) || b.needle.includes(r))) conteo[b.key].add(id)
  }

  const rubros = buckets.map(b => ({ key: b.key, label: b.label, contactados: conteo[b.key].size, ok: conteo[b.key].size > 0 }))
  return NextResponse.json({ rubros })
}
