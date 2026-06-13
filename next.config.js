/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Bloqueia iframe externo (clickjacking).
  { key: 'X-Frame-Options', value: 'DENY' },
  // Impede MIME sniffing — força browser a respeitar Content-Type declarado.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Restringe Referer cross-origin para não vazar paths internos.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Desabilita APIs sensíveis que esta app não usa.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  // Defesa adicional contra XSS reflexivo em browsers legados.
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Apenas same-origin / data: para imagens (mantém Recharts/inline SVGs).
  // CSP mais estrita exigiria nonces — manter pragmática para não quebrar Tailwind/Framer.
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js/Framer requerem
      "style-src 'self' 'unsafe-inline'", // Tailwind JIT inline styles
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.anthropic.com", // Claude API
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // remove X-Powered-By: Next.js (não vazar versão)
  compress: true,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
