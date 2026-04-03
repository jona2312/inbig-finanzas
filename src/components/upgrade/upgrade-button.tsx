'use client'

/**
 * UpgradeButton — Botón que inicia el flujo de checkout de Stripe.
 * Requiere usuario autenticado. Redirige a Stripe Checkout.
 *
 * Uso:
 *   <UpgradeButton plan="basic" label="Empezar Basic" />
 *   <UpgradeButton plan="plus" label="Empezar Plus" className="..." />
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UpgradeButtonProps {
  plan: 'basic' | 'plus' | 'premium'
  label?: string
  className?: string
  disabled?: boolean
}

export default function UpgradeButton({
  plan,
  label,
  className = '',
  disabled = false,
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const router = useRouter()

  async function handleClick() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Si no está autenticado → mandar a login
        if (res.status === 401) {
          router.push(`/login?redirect=/planes&plan=${plan}`)
          return
        }
        throw new Error(data.error ?? 'Error al iniciar pago')
      }

      if (data.url) {
        window.location.href = data.url  // Redirect a Stripe Checkout
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        disabled={loading || disabled}
        className={`w-full text-center text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Redirigiendo...
          </span>
        ) : (
          label ?? `Empezar ${plan}`
        )}
      </button>
      {error && (
        <p className="text-xs text-red-400 text-center mt-2">{error}</p>
      )}
    </div>
  )
}
