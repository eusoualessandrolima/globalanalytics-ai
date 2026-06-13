import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GlobalAnalytics AI',
  description: 'Análise inteligente de campanhas Meta Ads',
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
