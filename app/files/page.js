import { createServerClient } from '@/lib/supabaseClient'
import DownloadButton from '@/app/components/DownloadButton'

async function getFiles() {
  const supabase = createServerClient()
  
  const { data, error } = await supabase.storage
    .from('uploads')
    .list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (error) {
    console.error('Error fetching files:', error)
    return []
  }

  return data || []
}

function formatDateFromFileName(fileName) {
  const match = fileName.match(/-(\d+)\./)
  if (!match) return 'N/A'
  
  try {
    const timestamp = parseInt(match[1])
    const date = new Date(timestamp)
    return date.toLocaleString()
  } catch {
    return 'N/A'
  }
}

export default async function FilesPage() {
  const files = await getFiles()

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Uploaded Files</h1>
      <p style={styles.subtitle}>
        {files.length === 0 ? 'No files uploaded yet' : `${files.length} file(s) found`}
      </p>

      <div style={styles.backLink}>
        <a href="/" style={styles.link}>← Back to Upload</a>
      </div>

      {files.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No files have been uploaded yet.</p>
          <a href="/" style={styles.link}>Upload your first file</a>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>File Name</th>
              <th style={styles.th}>Uploaded At</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.name} style={styles.tr}>
                <td style={styles.td}>{file.name}</td>
                <td style={styles.td}>
                  {formatDateFromFileName(file.name)}
                </td>
                <td style={styles.td}>
                  <DownloadButton fileName={file.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1000px',
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
    marginBottom: '20px'
  },
  backLink: {
    marginBottom: '20px'
  },
  link: {
    color: '#0070f3',
    textDecoration: 'none',
    fontSize: '14px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  th: {
    backgroundColor: '#f5f5f5',
    padding: '12px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '14px',
    color: '#333',
    borderBottom: '2px solid #ddd'
  },
  tr: {
    borderBottom: '1px solid #eee'
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#333'
  },
  downloadButton: {
    display: 'inline-block',
    padding: '6px 12px',
    backgroundColor: '#0070f3',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  errorText: {
    color: '#d32f2f',
    fontSize: '13px'
  }
}

