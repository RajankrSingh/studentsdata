export const metadata = {
  title: 'File Upload System',
  description: 'Simple file upload and download system'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

