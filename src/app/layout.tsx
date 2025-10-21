import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zero Noise - Decentralized File Sharing',
  description: 'P2P file sharing on IPFS - Simple, fast, permanent',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
