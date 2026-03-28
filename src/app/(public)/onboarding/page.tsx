/**
 * /onboarding — Wizard de armado del trading plan
 *
 * Post-registro: el usuario configura su terminal personalizada.
 * La IA tiene 24hs para generar su dashboard a medida.
 *
 * Pasos:
 * 1. ¿Qué mercados operás? (AR / US / Cripto / Forex / Commodities)
 * 2. ¿Cuáles son tus activos favoritos? (watchlist inicial)
 * 3. ¿Qué información necesitás? (noticias, macro, señales, etc.)
 * 4. ¿Cuál es tu perfil? (conservador / moderado / agresivo)
 * 5. Confirmación — "Tu plan está siendo generado"
 */

import type { Metadata } from 'next'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

export const metadata: Metadata = {
  title: 'Armá tu trading plan — INBIG Finanzas',
  description: 'Configurá tu terminal a medida. Tardamos menos de 24hs en preparar tu dashboard personalizado.',
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6 py-12">
      <OnboardingWizard />
    </div>
  )
}
