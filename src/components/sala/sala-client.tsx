'use client'

import { useState, useEffect } from 'react'
import { Radio, Calendar, Users, Clock, ChevronRight, PlayCircle, Bell } from 'lucide-react'
import Link from 'next/link'

interface Sesion {
  id: string
  label: string
  horario: string
  descripcion: string
  youtubeChannelId: string
  youtubeVideoId: string
}

interface Props {
  sesiones: Sesion[]
}

// Calendario de próximas sesiones (hardcoded — en el futuro integrar con Google Calendar)
const PROXIMAS_SESIONES = [
  { dia: 'Lun 31 Mar', hora: '10:30', sesion: 'Nueva York', trader: 'Jonatan R.', tema: 'Análisis apertura semanal' },
  { dia: 'Mar 01 Abr', hora: '05:00', sesion: 'Europa', trader: 'Equipo INBIG', tema: 'BCE — impacto en EUR/USD' },
  { dia: 'Mié 02 Abr', hora: '10:30', sesion: 'Nueva York', trader: 'Jonatan R.', tema: 'FOMC minutes — reacción en vivo' },
  { dia: 'Jue 03 Abr', hora: '22:00', sesion: 'Asia', trader: 'Equipo INBIG', tema: 'BOJ — política monetaria Japón' },
  { dia: 'Vie 04 Abr', hora: '10:30', sesion: 'Nueva York', trader: 'Jonatan R.', tema: 'NFP — Non Farm Payrolls en vivo' },
]

// Determina si hay sesión activa según horario Argentina
function getSesionActiva(): string | null {
  const now = new Date()
  // UTC offset para Argentina ART = UTC-3
  const argHour = (now.getUTCHours() - 3 + 24) % 24
  const argMin = now.getUTCMinutes()
  const totalMin = argHour * 60 + argMin

  if (totalMin >= 22 * 60 || totalMin < 2 * 60) return 'asia'
  if (totalMin >= 5 * 60 && totalMin < 12 * 60) return 'europa'
  if (totalMin >= 630 && totalMin < 17 * 60) return 'ny' // 10:30 = 630 min
  return null
}

export default function SalaClient({ sesiones }: Props) {
  const [sesionActiva, setSesionActiva] = useState<string | null>(null)
  const [sesionSeleccionada, setSesionSeleccionada] = useState<string>('ny')
  const [horaArg, setHoraArg] = useState<string>('')

  useEffect(() => {
    const update = () => {
      const activa = getSesionActiva()
      setSesionActiva(activa)
      if (activa) setSesionSeleccionada(activa)

      const now = new Date()
      const argHour = (now.getUTCHours() - 3 + 24) % 24
      const argMin = now.getUTCMinutes().toString().padStart(2, '0')
      setHoraArg(`${argHour}:${argMin} ART`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [])

  const sesionActual = sesiones.find(s => s.id === sesionSeleccionada) ?? sesiones[2]
  const hayVideoEnVivo = !!sesionActual.youtubeVideoId || !!sesionActual.youtubeChannelId

  const embedUrl = sesionActual.youtubeVideoId
    ? `https://www.youtube.com/embed/${sesionActual.youtubeVideoId}?autoplay=1&mute=0`
    : sesionActual.youtubeChannelId
    ? `https://www.youtube.com/embed/live_stream?channel=${sesionActual.youtubeChannelId}&autoplay=1`
    : null

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d0d18]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-emerald-400" />
            <div>
              <h1 className="font-bold text-lg text-white">Sala de Trading</h1>
              <p className="text-xs text-white/40">INBIG Finanzas — El Netflix Financiero de LATAM</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-sm hidden sm:block">{horaArg}</span>
            {sesionActiva ? (
              <span className="flex items-center gap-1.5 bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full border border-red-500/30 animate-pulse">
                <span className="w-2 h-2 bg-red-400 rounded-full" />
                EN VIVO
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-white/5 text-white/40 text-xs px-3 py-1.5 rounded-full border border-white/10">
                <Clock className="w-3 h-3" />
                PRÓXIMAMENTE
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Selector de sesiones */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {sesiones.map(s => {
            const estaActiva = sesionActiva === s.id
            const seleccionada = sesionSeleccionada === s.id
            return (
              <button
                key={s.id}
                onClick={() => setSesionSeleccionada(s.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  seleccionada
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                {estaActiva && <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />}
                <span>{s.label}</span>
                <span className="text-xs opacity-60">{s.horario}</span>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player principal */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video embed */}
            <div className="relative bg-[#0d0d18] border border-white/10 rounded-xl overflow-hidden aspect-video">
              {hayVideoEnVivo && embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                // Placeholder cuando no hay video configurado
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <PlayCircle className="w-10 h-10 text-white/20" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 font-medium">Canal INBIG — Próximamente</p>
                    <p className="text-white/30 text-sm mt-1">inbigfinanzas.com</p>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <a
                      href="https://www.youtube.com/@inbigfinanzas"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Suscribite al canal
                    </a>
                    <button className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white/80 text-sm px-4 py-2 rounded-lg transition-colors">
                      <Bell className="w-4 h-4" />
                      Activar notificaciones
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Info de la sesión */}
            <div className="bg-[#0d0d18] border border-white/10 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-white">{sesionActual.label}</h2>
                  <p className="text-white/50 text-sm mt-1">{sesionActual.descripcion}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 text-sm font-medium">{sesionActual.horario}</p>
                  <p className="text-white/30 text-xs mt-0.5">horario Argentina</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar — Calendario + Info */}
          <div className="space-y-4">
            {/* Próximas sesiones */}
            <div className="bg-[#0d0d18] border border-white/10 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white">Próximas Sesiones</span>
              </div>
              <div className="divide-y divide-white/5">
                {PROXIMAS_SESIONES.map((s, i) => (
                  <div key={i} className="px-4 py-3 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">{s.tema}</p>
                        <p className="text-white/40 text-xs mt-0.5">{s.trader}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-emerald-400 text-xs font-mono">{s.hora}</p>
                        <p className="text-white/30 text-xs">{s.dia}</p>
                      </div>
                    </div>
                    <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full ${
                      s.sesion === 'Nueva York' ? 'bg-blue-500/20 text-blue-400' :
                      s.sesion === 'Europa' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {s.sesion}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Traders */}
            <div className="bg-[#0d0d18] border border-white/10 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white">El Equipo</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    JR
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Jonatan Romero</p>
                    <p className="text-white/40 text-xs">Fundador · Forex & Crypto</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-60">
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 font-bold text-sm">
                    +
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">Trader #2</p>
                    <p className="text-white/30 text-xs">Próximamente</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Premium */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-white font-medium text-sm">Acceso completo desde $8/mes</p>
              <p className="text-white/50 text-xs mt-1 mb-3">
                Sala en vivo · Terminal Bloomberg · IA Copilot · Señales premium
              </p>
              <Link
                href="/planes"
                className="flex items-center justify-between bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold px-4 py-2.5 rounded-lg transition-colors"
              >
                Ver planes
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
