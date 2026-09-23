/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // El servidor de desarrollo descarta páginas inactivas y eso fuerza
  // una recarga. Una sesión de exhibición puede quedar horas abierta.
  onDemandEntries: {
    maxInactiveAge: 12 * 60 * 60 * 1000,
    pagesBufferLength: 8,
  },
}

export default nextConfig
