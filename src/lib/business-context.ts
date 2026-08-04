import { createClient } from '@supabase/supabase-js'

export interface BusinessConfig {
  name: string
  description: string
  rubrosProspectar: string[]
  zona: string
}

const DEFAULTS: BusinessConfig = {
  name: 'Onnismeeks',
  description: 'Onnismeeks es una productora audiovisual en Buenos Aires. Producimos reels, comerciales, documentales y contenido para marcas. Ayudamos a negocios a destacar con video de calidad para redes y campañas. Tono creativo, cercano y profesional; mensajes que invitan a charlar un proyecto, sin venta agresiva.',
  rubrosProspectar: [], // sin rubros predeterminados: se cargan a mano en Prospección
  zona: 'Buenos Aires Argentina',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getBusinessConfig(db?: any): Promise<BusinessConfig> {
  const client = db ?? createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
  )

  const { data } = await client
    .from('settings')
    .select('key, value')
    .in('key', ['BUSINESS_NAME', 'BUSINESS_DESCRIPTION', 'BUSINESS_RUBROS_PROSPECTAR', 'BUSINESS_ZONA'])

  const map = Object.fromEntries((data || []).map((r: { key: string; value: string }) => [r.key, r.value]))

  const rubrosRaw = map.BUSINESS_RUBROS_PROSPECTAR || ''
  const rubros = rubrosRaw
    .split('\n')
    .map((l: string) => l.trim())
    .filter(Boolean)

  return {
    name: map.BUSINESS_NAME || DEFAULTS.name,
    description: map.BUSINESS_DESCRIPTION || DEFAULTS.description,
    rubrosProspectar: rubros.length ? rubros : DEFAULTS.rubrosProspectar,
    zona: map.BUSINESS_ZONA || DEFAULTS.zona,
  }
}
