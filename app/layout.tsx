import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthGuard from '@/components/AuthGuard'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema de Fila Administrativo',
  description: 'Sistema para gerenciar filas e usuários com webhooks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthGuard>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </AuthGuard>
      </body>
    </html>
  )
}
