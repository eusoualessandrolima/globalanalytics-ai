import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Global Analytics Intelligence',
  description: 'Marketing Intelligence Platform — análise inteligente de campanhas Meta Ads',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background text-white">
        {children}
      </body>
    </html>
  )
}
