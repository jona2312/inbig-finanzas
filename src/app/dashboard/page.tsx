import { CockpitHome } from '@/components/cockpit/CockpitHome'

/**
 * /dashboard — Cockpit principal del trader
 * Renderiza el componente dinámico que detecta estado de mercado,
 * datos del diario, check-in y copiloto.
 */
export default function DashboardPage() {
  return <CockpitHome />
}

export const metadata = {
  title: 'Cockpit | INbig Finanzas',
  description: 'Tu panel de control de trading',
}
