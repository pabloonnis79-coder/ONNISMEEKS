import ClientesReactivar from '@/components/clients/ClientesReactivar'

export const dynamic = 'force-dynamic'

export default function ClientesReactivarPage() {
  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 2 }}>💰 Reactivar clientes</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
          Marcas que ya trabajaron con vos y hace rato no vuelven. Por cada una decidí: le escribís hoy, o la posponés. El cliente que repite es el que sostiene la productora.
        </p>
      </div>
      <ClientesReactivar />
    </div>
  )
}
