import type { Metadata } from 'next'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

export const metadata: Metadata = { title: 'Iniciar sesión' }

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl mb-4">
            <TrendingUp className="h-6 w-6 text-emerald-500" />
            IN<span className="text-emerald-500">big</span> Finanzas
          </Link>
          <h1 className="text-2xl font-bold">Bienvenido de nuevo</h1>
          <p className="text-muted-foreground mt-1">Ingresá a tu cuenta</p>
        </div>

        {/* TODO: implementar LoginForm con Supabase Auth */}
        <div className="border border-border/40 rounded-xl p-6 space-y-4 bg-card">
          <p className="text-center text-muted-foreground text-sm">
            Formulario de login — próximamente
          </p>
          <p className="text-center text-sm">
            ¿No tenés cuenta?{' '}
            <Link href="/registro" className="text-emerald-400 hover:underline">
              Registrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
