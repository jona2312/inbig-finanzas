/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  // Preparado para internacionalización LATAM
  // i18n: { locales: ['es'], defaultLocale: 'es' },
}

export default nextConfig
