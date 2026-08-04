// Rubros que el sistema NO debe prospectar (decisión de negocio).
// Se aplica tanto a la prospección manual como al cron automático.
// Vacío: no hay rubros excluidos por defecto. Los rubros se manejan a mano.
export const RUBROS_EXCLUIDOS: string[] = []

// Raíces normalizadas (sin acentos, minúsculas) que marcan un rubro excluido.
const STEMS: string[] = []

// Saca acentos (elimina los diacríticos combinantes U+0300–U+036F) sin usar regex.
function norm(s: string): string {
  return s.toLowerCase().normalize('NFD')
    .split('')
    .filter(c => { const code = c.charCodeAt(0); return code < 0x300 || code > 0x36f })
    .join('')
}

export function rubroExcluido(rubro: string | null | undefined): boolean {
  if (!rubro) return false
  const n = norm(rubro)
  return STEMS.some(s => n.includes(s))
}
