import { ask, parseJSON } from './client'
import type { ClientType, Channel } from '@/lib/types'

interface ClassifyResult {
  type: ClientType
  score: number
  reason: string
  channel: Channel
}

const FALLBACK: ClassifyResult = { type: 'b2b', score: 50, reason: 'Clasificación manual pendiente', channel: 'whatsapp' }

export async function classifyLead(data: {
  name: string
  rubro?: string
  description?: string
}): Promise<ClassifyResult> {
  try {
    const prompt = `Sos experto en ventas B2B en Argentina para una PRODUCTORA AUDIOVISUAL (Onnismeeks: reels, comerciales, documentales y contenido para marcas).
Tu tarea es puntuar qué tan buen prospecto es un negocio para contratar producción de video.

REGLA PRINCIPAL: si es un negocio/marca con local o presencia comercial, es B2B.
B2C = persona particular sin actividad comercial.

Qué hace bueno a un prospecto (subí el score):
- Marca con identidad visual fuerte o producto "fotogénico" (gastronomía, indumentaria, estética, fitness, hotelería, autos, inmobiliarias, e-commerce, eventos).
- Negocio que vive de mostrarse: vende por redes, hace campañas, tiene sucursales o franquicias.
- Tamaño mediano/grande o en crecimiento (presupuesto para invertir en contenido).

Qué lo hace flojo (bajá el score):
- Negocio muy chico, informal o sin nada visual para mostrar.
- Rubro que no comunica por redes ni invierte en publicidad.

Score 80-100: marca con mucho para mostrar y presupuesto probable.
Score 60-79: buen candidato, presupuesto medio.
Score 40-59: chico o incierto.
Score 0-39: poco potencial para contenido audiovisual.

Respondé SOLO JSON sin markdown:
{"type":"b2b o b2c","score":0-100,"reason":"breve","channel":"whatsapp|email|telefono"}

Negocio: ${data.name}
Rubro: ${data.rubro || 'desconocido'}
Info: ${data.description || '-'}`

    const text = await ask(prompt, 150)
    return parseJSON<ClassifyResult>(text)
  } catch {
    return FALLBACK
  }
}

export async function classifyMessage(message: string) {
  try {
    const prompt = `Clasificá este mensaje de un cliente comercial. SOLO JSON sin markdown:
{"type":"compra|consulta|reclamo|otro","urgency":"alta|media|baja","reply":"respuesta sugerida max 50 palabras"}

Mensaje: "${message}"`

    const text = await ask(prompt, 200)
    return parseJSON<{ type: string; urgency: string; reply: string }>(text)
  } catch {
    return { type: 'otro', urgency: 'baja', reply: '' }
  }
}
