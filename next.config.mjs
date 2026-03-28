import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      // Fuentes de noticias reales
      { protocol: 'https', hostname: 'ichef.bbci.co.uk' },           // BBC Mundo
      { protocol: 'https', hostname: 'resizer.iproimg.com' },         // iProfesional
      { protocol: 'https', hostname: 'assets.iprofesional.com' },     // iProfesional
      { protocol: 'https', hostname: 'www.cronista.com' },            // El Cronista
      { protocol: 'https', hostname: '**.infobae.com' },              // Infobae
      { protocol: 'https', hostname: 'cloudfront-us-east-1.images.arcpublishing.com' },
      { protocol: 'https', hostname: '**.ambito.com' },               // Ámbito
      { protocol: 'https', hostname: 'images.coingecko.com' },        // CoinGecko
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**' },                          // fallback permisivo (restringir en prod)
    ],
  },
}

export default withSentryConfig(nextConfig, {
  org: 'jonatan-romero',
  project: 'inbig-finanzas',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
})
