import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Prompt Generator',
  description: 'Transform vague ideas into powerful AI prompts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation */}
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link href="/" className="text-xl font-bold text-primary-600">
                    AI Prompt Generator
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
                  <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md">
                    Generator
                  </Link>
                  <Link href="/chat" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md">
                    Smart Chat
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  )
}
