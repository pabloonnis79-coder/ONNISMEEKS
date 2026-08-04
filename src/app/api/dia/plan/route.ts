import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ask } from '@/lib/ai/client'
import { getBlueMarketCatalog } from '@/lib/bluemarket'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

function inicioDiaARiso(): string {
  const ar = new Date(Date.now() - 3 * 3600 * 1000)
  return new Date(Date.UTC(ar.getUTCFullYear(), ar.getUTCMonth(), ar.getUTCDate(), 3, 0, 0)).toISOString()
}

export async function GET() {
  const db = await createClient()
  const desde = inicioDiaARiso()
  const hace20 = new Date(Date.now() - 20 * 86400000).toISOString()

  const [histRes, nuevosRes, ordersRes, inactivosRes, productos] = await Promise.all([
    db.from('client_history').select('accion').gte('fecha', desde).in('accion', ['WhatsApp enviado', 'Instagram enviado', 'Instagram seguido']),
    db.from('clients').select('*', { count: 'exact', head: true }).gte('created_at', desde),
    db.from('orders').select('id, total').gte('created_at', desde),
    db.from('clients').select('name, rubro, city, last_contact').in('status', ['cliente', 'cliente_recurrente']).lt('last_contact', hace20).order('last_contact', { ascending: true }).limit(4),
    getBlueMarketCatalog(),
  ])

  const rows = histRes.data || []
  const md = rows.filter(r => r.accion !== 'Instagram seguido').length
  const follows = rows.filter(r => r.accion === 'Instagram seguido').length
  const nuevos = nuevosRes.count || 0
  const pedidos = (ordersRes.data || []).length
  const facturado = (ordersRes.data || []).reduce((s, o) => s + (Number(o.total) || 0), 0)

  const dias = (iso: string | null) => iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : '?'
  const inactivos = (inactivosRes.data || []).map(c => `${c.name} (${c.rubro || 's/rubro'}, no compra hace ${dias(c.last_contact)} días)`).join('; ') || 'ninguno detectado'
  const destacados = ((productos || []).filter(p => p.featured).slice(0, 3).map(p => p.name).join(', ')) || ((productos || []).slice(0, 3).map(p => p.name).join(', ')) || 'sin datos de stock'

  const prompt = `Sos el coordinador comercial de ONNISMEEKS, productora audiovisual de Buenos Aires (reels, comerciales, documentales y contenido para marcas). Prospectamos marcas que necesitan video.

Tono: directo, sin felicitaciones, sin vueltas. El único objetivo es CERRAR PROYECTOS y generar clientes recurrentes. Si algo no ayuda a vender, no lo menciones.

ESTADO DE HOY:
- MD enviados a marcas: ${md}/20
- Cuentas seguidas: ${follows}/30
- Marcas nuevas agregadas: ${nuevos}/10
- Proyectos cerrados: ${pedidos} (facturado $${Math.round(facturado)})
- Clientes a reactivar: ${inactivos}

Dame el PLAN DE ACCIÓN de HOY: máximo 6 puntos, cada uno concreto y accionable, priorizado por impacto en facturación. Decí a qué rubros/marcas mandar MD, qué contenido propio publicar para mostrar el portfolio, y a qué clientes reactivar por nombre. No preguntes, ordená. No felicites. Español rioplatense, breve.`

  try {
    const plan = await ask(prompt, 600)
    return NextResponse.json({ plan })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'No se pudo generar el plan' }, { status: 500 })
  }
}
