export const metadata = {
  title: 'File Upload System',
  description: 'Simple file upload and download system'
}

import './globals.css'
import Navigation from './components/Navigation'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  )
}

