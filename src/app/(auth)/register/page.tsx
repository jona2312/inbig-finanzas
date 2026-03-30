'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'


const PAISES = [
  { value: 'AR', label: '🇦🇷 Argentina' },
  { value: 'MX', label: '🇲🇽 México' },
  { value: 'BR', label: '🇧🇷 Brasil' },
  { value: 'CO', label: '🇨🇴 Colombia' },
  { value: 'CL', label: '🇨🇱 Chile' },
  { value: 'PE', label: '🇵🇪 Perú' },
  { value: 'UY', label: '🇺🇾 Uruguay' },
  { value: 'US', label: '🇺🇸 Estados Unidos' },
  { value: 'ES', label: '🇪🇸 España' },
  { value: 'OT', label: '🌍 Otro' },
]

export default function RegisterPage() {
  const supabase = createClient()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [pais,     setPais]     = useState('AR')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, pais },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  async function handleGoogleRegister() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  if (success) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
        <div className="text-4xl">📬</div>
        <h2 className="text-lg font-semibold text-white">Revisá tu email</h2>
        <p className="text-zinc-400 text-sm">
          Te enviamos un link de confirmación a <span className="text-white">{email}</span>.
          Hacé click en el link para activar tu cuenta.
        </p>
        <Link href="/login" className="inline-block text-blue-400 hover:text-blue-300 text-sm">
          Volver al login
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Crear cuenta gratis</h1>
        <p className="text-zinc-400 text-sm mt-1">Empezá a seguir los mercados que te importan</p>
      </div>

      {/* Google */}
      <button
        onClick={handleGoogleRegister}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-zinc-900 font-medium text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continuar con Google
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-zinc-800" />
        <span className="text-zinc-600 text-xs">o con email</span>
        <div className="flex-1 border-t border-zinc-800" />
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Nombre</label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            required placeholder="Tu nombre"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            required placeholder="vos@email.com"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Contraseña</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            required placeholder="Mínimo 6 caracteres"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">¿Desde dónde seguís los mercados?</label>
          <select
            value={pais} onChange={(e) => setPais(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
          >
            {PAISES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit" disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white font-medium text-sm py-2.5 rounded-xl transition-colors disabled:cursor-not-allowed"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
        </button>

        <p className="text-xs text-zinc-600 text-center">
          Al registrarte aceptás nuestros{' '}
          <Link href="/terminos" className="text-zinc-400 hover:text-white">términos</Link>
          {' '}y{' '}
          <Link href="/privacidad" className="text-zinc-400 hover:text-white">política de privacidad</Link>
        </p>
      </form>

      <p className="text-center text-sm text-zinc-500">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
          Ingresá
        </Link>
      </p>
    </div>
  )
}
