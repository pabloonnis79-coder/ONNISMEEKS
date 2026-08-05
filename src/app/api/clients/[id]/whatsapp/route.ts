import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSetting } from '@/lib/settings'
import { elegirPrimerContacto, igHandle } from '@/lib/primer-contacto'
import { respuestasRapidas } from '@/lib/respuestas-rapidas'

type Params = Promise<{ id: string }>

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params
  const db = await createClient()
  const { data: client } = await db.from('clients').select('*').eq('id', id).single()
  if (!client) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const [companyName, companyDesc, portfolioUrl] = await Promise.all([
    getSetting('COMPANY_NAME'),
    getSetting('COMPANY_DESCRIPTION'),
    getSetting('PORTFOLIO_URL'),
  ])

  const nombre = companyName || 'Onnismeeks'
  const descripcion = companyDesc || 'producción audiovisual: reels, comerciales y contenido para marcas'

  const clap  = String.fromCodePoint(0x1F3AC)
  const cam   = String.fromCodePoint(0x1F3A5)
  const wave  = String.fromCodePoint(0x1F44B)
  const spark = String.fromCodePoint(0x2728)

  const nombreLugar = (client.name || '').trim()
  // Primer contacto → mensaje rotativo. Si ya lo contactaste, un re-contacto cordial.
  const esPrimerContacto = !client.fecha_primer_contacto && !client.last_contact
  const whatsapp = esPrimerContacto
    ? elegirPrimerContacto(id, nombreLugar, client.rubro)
    : `¡Hola${nombreLugar ? ' ' + nombreLugar : ''}! ${wave} ¿Cómo va?\n\nTe escribimos de *${nombre}* — ${descripcion}.\n\n${clap} Producimos contenido pensado para que la marca destaque en redes.\n${cam} Reels, comerciales y videos de marca, de la idea al montaje final.${portfolioUrl ? `\n\nPodés ver nuestros trabajos acá:\n${portfolioUrl}` : ''}\n\n${spark} Si tienen algo en mente para este mes, con gusto les armamos una propuesta.\n\n¿Charlamos?`

  const phone = (client.phone || '').replace(/\D/g, '')
  const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(whatsapp)}` : null

  const respuestas = respuestasRapidas(nombreLugar, client.rubro)

  return NextResponse.json({ url, message: whatsapp, instagram: igHandle(client.instagram), respuestas })
}
