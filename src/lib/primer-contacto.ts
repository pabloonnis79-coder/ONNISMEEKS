// Lógica compartida del primer mensaje de contacto y del @instagram.
//
// Onnismeeks — PRODUCTORA AUDIOVISUAL. Mensajes cortos, creativos y no invasivos,
// con una pregunta abierta que invita a charlar un proyecto (sin venta agresiva,
// sin precios ni links). [marca] se reemplaza por el nombre real del negocio.

const GENERAL = [
  `¡Hola [marca]! 🎬 Somos Onnismeeks, productora audiovisual en Buenos Aires. Nos gustó su marca y creemos que un buen reel/comercial la llevaría a otro nivel. ¿Les interesaría ver un par de ideas para su próximo contenido?`,
  `Buenas! Soy de Onnismeeks 🎥 — hacemos reels, comerciales y contenido para marcas. Vimos lo que están haciendo en [marca] y nos encantaría sumar video que enganche. ¿Charlamos de un proyecto?`,
  `¡Hola equipo de [marca]! 👋 En Onnismeeks producimos contenido audiovisual para marcas (reels, spots, documentales). Si les sirve, les paso ejemplos y una idea pensada para ustedes, sin compromiso. ¿Les interesa?`,
  `Buen día! Les escribo de Onnismeeks 🎬 — productora audiovisual. Creemos que [marca] tiene mucho para mostrar y un buen contenido de video puede potenciarla en redes. ¿Les gustaría que les acerquemos una propuesta?`,
  `¡Buenas! De Onnismeeks — reels, comerciales y documentales de marca. Nos encantaría ayudar a [marca] a destacar con video de calidad. ¿Estarían abiertos a una charla corta para ver ideas?`,
]

function normalizar(s: string): string {
  return s.toLowerCase().normalize('NFD').split('').filter(c => { const x = c.charCodeAt(0); return x < 0x300 || x > 0x36f }).join('')
}

// Onnismeeks trabaja con marcas de cualquier rubro — mismo set para todos.
// (se deja el parámetro para compatibilidad con quienes lo llaman)
function setPorRubro(_rubro?: string | null): string[] {
  void normalizar
  return GENERAL
}

export function elegirPrimerContacto(id: string, nombre: string, rubro?: string | null): string {
  // Hash estable del id: el mismo contacto siempre ve la misma variante y los
  // distintos se reparten (rotación sin mandar todo igual).
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  const lugar = nombre.trim()
  const set = setPorRubro(rubro)
  if (lugar) return set[h % set.length].replace(/\[marca\]/g, lugar)
  return set[h % set.length].replace(/\s*en \[marca\]/g, '').replace(/\[marca\]/g, 'ustedes')
}

// Normaliza el campo instagram a un usuario limpio (soporta @user, url, etc.)
export function igHandle(raw?: string | null): string | null {
  if (!raw) return null
  let s = raw.trim()
  if (!s) return null
  s = s.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
  s = s.replace(/^@/, '').replace(/[/?].*$/, '').trim()
  return s || null
}
