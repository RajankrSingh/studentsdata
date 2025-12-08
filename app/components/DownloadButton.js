'use client'

import { useState } from 'react'

export default function DownloadButton({ fileName }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleDownload = async () => {
    setLoading(true)
    setError(null)

    try {
      // Request signed URL from server just before download
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fileName })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate download URL')
      }

      const data = await response.json()
      
      if (data.signedUrl) {
        // Create a temporary link and click it to download
        const link = document.createElement('a')
        link.href = data.signedUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        throw new Error('No download URL received')
      }
    } catch (err) {
      console.error('Download error:', err)
      setError(err.message || 'Failed to download file')
    } finally {
      setLoading(false)
    }
  }

  const downloadButtonStyle = {
    display: 'inline-block',
    padding: '6px 12px',
    backgroundColor: loading ? '#cccccc' : '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s'
  }

  const errorTextStyle = {
    color: '#d32f2f',
    fontSize: '12px',
    marginTop: '4px'
  }

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={loading}
        style={downloadButtonStyle}
        title={loading ? 'Downloading...' : 'Click to download'}
      >
        {loading ? 'Downloading...' : 'Download'}
      </button>
      {error && <div style={errorTextStyle}>{error}</div>}
    </div>
  )
}
