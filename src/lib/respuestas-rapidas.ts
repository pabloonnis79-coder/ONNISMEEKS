// Respuestas rápidas (2º mensaje): lo que se manda DESPUÉS de que el prospecto
// responde, para avanzar el proyecto. Onnismeeks — productora audiovisual.
// Tono creativo, cercano y profesional.

export interface RespuestaRapida { id: string; emoji: string; label: string; texto: string }

export function respuestasRapidas(nombre?: string | null, _rubro?: string | null, _extra?: string | null): RespuestaRapida[] {
  const lugar = (nombre || '').trim()
  const vos = lugar ? lugar : 'ustedes'

  return [
    {
      id: 'portfolio', emoji: '📽️', label: 'Portfolio',
      texto: `¡Genial! 🙌 Te paso algunos trabajos nuestros para que veas el estilo de Onnismeeks. Contame qué tipo de contenido tenés en mente (reels, comercial, video de marca) y te armo una propuesta pensada para ustedes.`,
    },
    {
      id: 'propuesta', emoji: '💲', label: 'Propuesta',
      texto: `Perfecto 👌 ¿Qué necesitás — reels mensuales para redes, un comercial, un documental de marca? Con eso te armo una propuesta y presupuesto a medida, sin compromiso.`,
    },
    {
      id: 'reunion', emoji: '📅', label: 'Reunión',
      texto: `¿Coordinamos una llamada corta esta semana para charlar la idea? 🎬 En 15 minutos te muestro cómo lo encararíamos y qué resultados buscamos. ¿Qué día te queda cómodo?`,
    },
    {
      id: 'ideas', emoji: '💡', label: 'Idea concreta',
      texto: `Se me ocurre algo para ${vos}: un formato de reels que muestre lo mejor de la marca de forma dinámica y con gancho para redes. Si querés te lo desarrollo en una propuesta corta. ¿Avanzamos?`,
    },
    {
      id: 'seguimiento', emoji: '🔁', label: 'Seguimiento suave',
      texto: `¡Hola${lugar ? ' ' + vos : ''}! 😊 ¿Pudieron ver lo que les mandé? Sin apuro — cuando quieran armamos algo para su próxima campaña. Quedo atento a lo que necesiten 🎬`,
    },
  ]
}
