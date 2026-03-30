import { Metadata } from 'next'
import SalaClient from '@/components/sala/sala-client'

export const metadata: Metadata = {
  title: 'Sala de Trading en Vivo | INBIG Finanzas',
  description: 'Sala de trading en vivo con traders reales. Sesiones de Asia, Europa y Nueva York en español.',
}

// Sesiones de trading — actualizás los IDs de YouTube cuando tengás el canal
const SESIONES = [
  {
    id: 'asia',
    label: 'Sesión Asia',
    horario: '22:00 – 02:00 ART',
    descripcion: 'Apertura de mercados asiáticos — Nikkei, Hang Seng, Shanghai',
    youtubeChannelId: '', // Completar con ID del canal YouTube de INBIG
    youtubeVideoId: '', // ID del video en vivo actual (opcional, para embed directo)
  },
  {
    id: 'europa',
    label: 'Sesión Europa',
    horario: '05:00 – 12:00 ART',
    descripcion: 'Apertura Londres, Frankfurt, París — EUR/USD, DAX, FTSE',
    youtubeChannelId: '',
    youtubeVideoId: '',
  },
  {
    id: 'ny',
    label: 'Sesión Nueva York',
    horario: '10:30 – 17:00 ART',
    descripcion: 'Wall Street en vivo — S&P 500, NASDAQ, Dow Jones, Forex',
    youtubeChannelId: '',
    youtubeVideoId: '',
  },
]

export default function SalaPage() {
  return <SalaClient sesiones={SESIONES} />
}
