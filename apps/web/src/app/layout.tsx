import type { Metadata } from 'next'
import { ReactQueryProvider } from '@/lib/react-query'
import './globals.css'

export const metadata: Metadata = {
  title: 'Common Elements',
  description: 'Community association platform connecting members with service vendors',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  )
}
