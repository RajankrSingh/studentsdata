'use client'

import { useState } from 'react'

export default function UploadPage() {
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setIsUploading(true)

    const formData = new FormData(e.target)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Success! File "${data.fileName}" uploaded successfully.`)
        e.target.reset() // Reset form
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>File Upload</h1>
      <p style={styles.subtitle}>Upload Excel or CSV files</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="file" style={styles.label}>
            Select File (Excel/CSV only):
          </label>
          <input
            type="file"
            id="file"
            name="file"
            accept=".xls,.xlsx,.csv"
            required
            style={styles.input}
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          style={{
            ...styles.button,
            ...(isUploading && styles.buttonDisabled)
          }}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {message && (
        <div
          style={{
            ...styles.message,
            ...(message.startsWith('Success') ? styles.success : styles.error)
          }}
        >
          {message}
        </div>
      )}

      <div style={styles.footer}>
        <a href="/files" style={styles.link}>
          View All Files →
        </a>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '50px auto',
    padding: '30px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  title: {
    fontSize: '32px',
    marginBottom: '10px',
    color: '#333'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px'
  },
  form: {
    backgroundColor: '#f9f9f9',
    padding: '30px',
    borderRadius: '8px',
    border: '1px solid #ddd'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#0070f3',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  buttonDisabled: {
    backgroundColor: '#999',
    cursor: 'not-allowed'
  },
  message: {
    marginTop: '20px',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '14px'
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb'
  },
  footer: {
    marginTop: '30px',
    textAlign: 'center'
  },
  link: {
    color: '#0070f3',
    textDecoration: 'none',
    fontSize: '14px'
  }
}

