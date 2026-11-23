import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    // Solo WebP: codificar AVIF consume ~5-10x más CPU y las fotos ya se guardan en WebP al subirlas.
    formats: ['image/webp'],
    // Las URLs de las fotos cambian al subir una nueva, así que se puede cachear 30 días sin riesgo.
    // Menos re-optimizaciones = menos CPU.
    minimumCacheTTL: 2_592_000,
    localPatterns: [
      { pathname: '/api/media/file/**' },
      { pathname: '/brand/**' },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
