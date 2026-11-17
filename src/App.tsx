import { useState, useCallback } from 'react'
import './App.css'

interface DownloadItem {
  id: string
  name: string
  url: string
  size?: string
  type: 'file' | 'folder'
  children?: DownloadItem[]
  modified?: string
}

interface ArchiveFile {
  name: string
  size: number
  format?: string
  source?: string
  mtime?: string
}

interface ArchiveItem {
  identifier: string
  title: string
  mediatype: string
  files: ArchiveFile[]
  createdate?: string
  publicdate?: string
}

const initialItems: DownloadItem[] = [
  {
    id: 'setups',
    name: 'Setups',
    url: '',
    type: 'folder',
    modified: 'Software installers',
    children: [
      {
        id: 'setups-1',
        name: 'CRRuntime_32bit_13_0_5.zip',
        url: 'https://archive.org/download/crruntime-32bit-13-0-5/CRRuntime_32bit_13_0_5.zip',
        type: 'file',
        modified: 'crruntime'
      },
      {
        id: 'setups-2',
        name: 'SQL Native Client.zip',
        url: 'https://archive.org/download/crruntime-32bit-13-0-5/SQL%20Native%20Client.zip',
        type: 'file',
        modified: 'sql native client'
      },
      {
        id: 'setups-3',
        name: 'SQL 2014.zip',
        url: 'https://archive.org/download/sql-2014/SQL%202014.zip',
        type: 'file',
        modified: 'sql 14'
      },
      {
        id: 'setups-4',
        name: 'Crystal Reports 9.zip',
        url: 'https://archive.org/download/sql-2022/Crystal.Reports.9.zip',
        type: 'file',
        modified: 'crystal report'
      },
      {
        id: 'setups-5',
        name: 'SQL 2022.zip',
        url: 'https://archive.org/download/sql-2022/SQL2022.zip',
        type: 'file',
        modified: 'sql 22'
      }
    ]
  },
  {
    id: 'program-files',
    name: 'Program Files',
    url: '',
    type: 'folder',
    modified: 'Application programs',
    children: [
      {
        id: 'pf-1',
        name: 'IMS PF 04 2026 SQL 14.zip',
        url: 'https://archive.org/download/ims-pf-04-2026-sql-14/IMS%20PF%2004%202026%20SQL%2014.zip',
        type: 'file',
        modified: 'inventry program file'
      }
    ]
  }
]

function FileIcon({ name, type }: { name: string; type: 'file' | 'folder' }) {
  const ext = name.split('.').pop()?.toLowerCase()
  
  if (type === 'folder') {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 8.5L9.5 5H22C23.1046 5 24 5.89543 24 7V21C24 22.1046 23.1046 23 22 23H6C4.89543 23 4 22.1046 4 21V8.5Z" stroke="#FFB340" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M6 11.5L9.5 8H22" stroke="#FFB340" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
      </svg>
    )
  }
  
  const iconColors: Record<string, string> = {
    pdf: '#E84C3D',
    doc: '#2B7CE9',
    docx: '#2B7CE9',
    xls: '#1D6F42',
    xlsx: '#1D6F42',
    txt: '#6E6E6E',
    md: '#6E6E6E',
    png: '#8B5CF6',
    jpg: '#8B5CF6',
    jpeg: '#8B5CF6',
    svg: '#F59E0B',
    zip: '#EF4444',
    dmg: '#007AFF',
  }
  
  const color = iconColors[ext || ''] || '#007AFF'
  
  return (
    <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4L24 4C25.1046 4 26 4.89543 26 6V30C26 31.1046 25.1046 32 24 32H4C2.89543 32 2 31.1046 2 30V6C2 4.89543 2.89543 4 4 4Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <path d="M8 12H20" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
      <path d="M8 18H20" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
      <path d="M8 24H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
    </svg>
  )
}

function FileRow({ item, depth = 0, onToggle, onDownload, isExpanded }: { 
  item: DownloadItem; 
  depth: number; 
  onToggle: (id: string) => void;
  onDownload: (url: string, name: string) => void;
  isExpanded: boolean;
}) {
  const isFolder = item.type === 'folder'
  const hasChildren = isFolder && item.children && item.children.length > 0
  
  return (
    <div className="file-row" style={{ paddingLeft: `${16 + depth * 20}px` }}>
      <div className="file-main" onClick={() => hasChildren ? onToggle(item.id) : onDownload(item.url, item.name)}>
        {hasChildren && (
          <button 
            className={`expand-btn ${isExpanded ? 'expanded' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 6L9 6M6 3L6 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
        {!hasChildren && <div className="expand-placeholder" />}
        <FileIcon name={item.name} type={item.type} />
        <div className="file-info">
          <span className="file-name">{item.name}</span>
          {item.size && <span className="file-size">{item.size}</span>}
        </div>
        <div className="file-meta">
          {item.modified && <span className="file-date">{item.modified}</span>}
          {!isFolder && (
            <button 
              className="download-btn"
              onClick={(e) => { e.stopPropagation(); onDownload(item.url, item.name); }}
              aria-label={`Download ${item.name}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3L12 7H4L8 3Z" fill="#007AFF"/>
                <path d="M8 7V13" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M5 10L8 13L11 10" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      {isExpanded && hasChildren && item.children && (
        <div className="file-children">
          {item.children.map(child => (
            <FileRow 
              key={child.id} 
              item={child} 
              depth={depth + 1} 
              onToggle={onToggle} 
              onDownload={onDownload}
              isExpanded={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Toolbar({ onImportClick, searchQuery, onSearchChange }: { 
  onImportClick: () => void
  searchQuery: string
  onSearchChange: (value: string) => void
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <div className="window-controls">
          <div className="control close" />
          <div className="control minimize" />
          <div className="control maximize" />
        </div>
        <div className="path-bar">
          <span className="path-segment">📁</span>
          <span className="path-separator">/</span>
          <span className="path-segment active">Downloads</span>
        </div>
      </div>
      <div className="toolbar-right">
        <button className="view-btn active" aria-label="List view">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="2" rx="1" fill="currentColor"/>
            <rect x="2" y="7" width="12" height="2" rx="1" fill="currentColor"/>
            <rect x="2" y="11" width="12" height="2" rx="1" fill="currentColor"/>
          </svg>
        </button>
        <button className="view-btn" aria-label="Icon view">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor"/>
            <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor"/>
            <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor"/>
            <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor"/>
          </svg>
        </button>
        <button className="import-btn" onClick={onImportClick} aria-label="Import from Archive.org">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L12 6H4L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 6V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M4 10H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="2" y="11" width="12" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span>Import</span>
        </button>
        <div className="search-box">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search" 
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

function StatusBar({ itemCount }: { itemCount: number }) {
  return (
    <div className="status-bar">
      <span>{itemCount} items</span>
      <div className="status-right">
        <span>📁 5 folders</span>
        <span>📄 12 files</span>
      </div>
    </div>
  )
}

function ImportModal({ isOpen, onClose, onImport }: { 
  isOpen: boolean
  onClose: () => void
  onImport: (identifier: string) => void
}) {
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) return
    
    // Extract identifier from full URL if provided
    const extractIdentifier = (input: string): string => {
      // Match archive.org/details/identifier or just identifier
      const match = input.match(/archive\.org\/details\/([^\/\?]+)/)
      return match ? match[1] : input
    }
    
    const cleanIdentifier = extractIdentifier(identifier.trim())
    
    setLoading(true)
    setError(null)
    
    try {
      await onImport(cleanIdentifier)
      onClose()
      setIdentifier('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import')
    } finally {
      setLoading(false)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import from Archive.org</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <p className="modal-description">
            Enter an Archive.org item identifier or full URL (e.g., <code>sql-2022</code> or <code>archive.org/details/sql-2022</code>)
          </p>
          <div className="input-group">
            <label htmlFor="identifier">Item Identifier or URL</label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder="e.g., sql-2022 or https://archive.org/details/sql-2022"
              disabled={loading}
              autoFocus
            />
          </div>
          {error && <div className="modal-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !identifier.trim()}>
              {loading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ProgressModal({ isOpen, message, progress }: { 
  isOpen: boolean
  message: string
  progress: number
}) {
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay">
      <div className="modal progress-modal">
        <div className="modal-body">
          <div className="spinner" />
          <p>{message}</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['setups', 'program-files']))
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState<DownloadItem[]>(initialItems)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [progressModalOpen, setProgressModalOpen] = useState(false)
  const [progressMessage, setProgressMessage] = useState('')
  const [progressValue, setProgressValue] = useState(0)
  
  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  
  const handleDownload = (url: string, name: string) => {
    if (!url) return
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }
  
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return dateStr
    }
  }
  
  const fetchArchiveItem = async (identifier: string): Promise<ArchiveItem> => {
    // Use CORS proxy since archive.org doesn't allow direct browser requests
    const proxyUrl = 'https://api.allorigins.win/raw?url='
    const targetUrl = `https://archive.org/metadata/${identifier}`
    const response = await fetch(`${proxyUrl}${encodeURIComponent(targetUrl)}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch item: ${response.statusText}`)
    }
    return response.json()
  }
  
  const importFromArchive = useCallback(async (identifier: string) => {
    setProgressModalOpen(true)
    setProgressMessage('Fetching item metadata...')
    setProgressValue(10)
    
    const archiveItem = await fetchArchiveItem(identifier)
    
    setProgressMessage('Processing files...')
    setProgressValue(50)
    
    const downloadItems: DownloadItem[] = archiveItem.files
      .filter(f => f.name !== `${identifier}_archive.torrent` && f.name !== `${identifier}_files.xml` && f.name !== `${identifier}_meta.xml`)
      .map((file, index) => ({
        id: `archive-${identifier}-${index}`,
        name: file.name,
        url: `https://archive.org/download/${identifier}/${encodeURIComponent(file.name)}`,
        size: formatSize(file.size),
        type: 'file' as const,
        modified: file.mtime ? formatDate(file.mtime) : archiveItem.publicdate ? formatDate(archiveItem.publicdate) : ''
      }))
    
    const folderItem: DownloadItem = {
      id: `archive-${identifier}`,
      name: archiveItem.title || identifier,
      url: '',
      type: 'folder',
      modified: archiveItem.publicdate ? formatDate(archiveItem.publicdate) : '',
      children: downloadItems
    }
    
    setProgressMessage('Adding to download list...')
    setProgressValue(90)
    
    setItems(prev => [folderItem, ...prev])
    setExpandedFolders(prev => {
      const next = new Set(prev)
      next.add(`archive-${identifier}`)
      return next
    })
    
    setProgressValue(100)
    setTimeout(() => setProgressModalOpen(false), 500)
  }, [])
  
  // Flatten all items for search (including nested children)
  const flattenItems = (itemList: DownloadItem[]): DownloadItem[] => {
    const result: DownloadItem[] = []
    for (const item of itemList) {
      result.push(item)
      if (item.children) {
        result.push(...flattenItems(item.children))
      }
    }
    return result
  }
  
  const allItemsFlat = flattenItems(items)
  
  const filteredItems = searchQuery
    ? allItemsFlat.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.modified && item.modified.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : items
  
  const totalItems = searchQuery 
    ? filteredItems.length
    : items.reduce((acc, item) => {
        return acc + 1 + (item.children?.length || 0)
      }, 0)
  
  return (
    <div className="app">
      <div className="window">
        <Toolbar 
        onImportClick={() => setImportModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
        <div className="content">
          <div className="sidebar">
            <div className="sidebar-section">
              <h3>FAVORITES</h3>
              <ul>
                <li className="active"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4L8 8L13 4V13C13 13.5523 12.5523 14 12 14H4C3.44772 14 3 13.5523 3 13V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Downloads</li>
                <li><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2ZM8 4C10.2091 4 12 5.79086 12 8C12 10.2091 10.2091 12 8 12C5.79086 12 4 10.2091 4 8C4 5.79086 5.79086 4 8 4Z" stroke="currentColor" strokeWidth="1.5"/></svg> Documents</li>
                <li><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4C2 3.44772 2.44772 3 3 3H13C13.5523 3 14 3.44772 14 4V12C14 12.5523 13.5523 13 13 13H3C2.44772 13 2 12.5523 2 12V4ZM7 7L11 11M11 7L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Desktop</li>
              </ul>
            </div>
            <div className="sidebar-section">
              <h3>TAGS</h3>
              <ul>
                <li><span className="tag" style={{ background: '#FF3B30' }}></span> Red</li>
                <li><span className="tag" style={{ background: '#FF9500' }}></span> Orange</li>
                <li><span className="tag" style={{ background: '#FFCC00' }}></span> Yellow</li>
                <li><span className="tag" style={{ background: '#34C759' }}></span> Green</li>
                <li><span className="tag" style={{ background: '#007AFF' }}></span> Blue</li>
                <li><span className="tag" style={{ background: '#AF52DE' }}></span> Purple</li>
              </ul>
            </div>
          </div>
          <div className="file-list">
            <div className="column-header">
              <div className="col-name">Name</div>
              <div className="col-size">Size</div>
              <div className="col-date">Modified</div>
              <div className="col-action"></div>
            </div>
            <div className="files">
              {searchQuery ? (
                // Flat search results
                filteredItems.map(item => (
                  <FileRow 
                    key={item.id} 
                    item={{ ...item, type: 'file' }} 
                    depth={0}
                    onToggle={() => {}} 
                    onDownload={handleDownload}
                    isExpanded={false}
                  />
                ))
              ) : (
                // Hierarchical view
                filteredItems.map(item => (
                  <FileRow 
                    key={item.id} 
                    item={item} 
                    depth={0}
                    onToggle={toggleFolder} 
                    onDownload={handleDownload}
                    isExpanded={expandedFolders.has(item.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
        <StatusBar itemCount={totalItems} />
      </div>
      
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={importFromArchive}
      />
      
      <ProgressModal
        isOpen={progressModalOpen}
        message={progressMessage}
        progress={progressValue}
      />
    </div>
  )
}