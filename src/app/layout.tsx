import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/layout/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'INbig Finanzas — El Wall Street de LATAM',
    template: '%s | INbig Finanzas',
  },
  description:
    'La plataforma financiera más completa de Latinoamérica. Mercados, crypto, noticias y análisis con IA.',
  keywords: ['finanzas', 'mercados', 'crypto', 'inversiones', 'latam', 'argentina', 'bolsa'],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://inbigfinanzas.com',
    siteName: 'INbig Finanzas',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
