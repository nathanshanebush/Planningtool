import React, { useRef, useState } from 'react'
import { Upload, X, File } from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'

export function CreativeUpload({ tacticId }) {
  const { canUpload } = usePermissions()
  const fileRef = useRef(null)
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles).map((f) => ({
      id: `${Date.now()}-${f.name}`,
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f),
    }))
    setFiles((prev) => [...prev, ...arr])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (!canUpload) return
    addFiles(e.dataTransfer.files)
  }

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id))

  const isImage = (type) => type.startsWith('image/')

  return (
    <div className="p-6 space-y-4">
      {canUpload && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
            ${dragging ? 'border-orange bg-orange/5' : 'border-white/20 hover:border-white/40'}
          `}
        >
          <Upload size={32} className="text-white/30 mx-auto mb-3" />
          <p className="text-white font-medium text-sm mb-1">Drop files here or click to upload</p>
          <p className="text-white/40 text-xs">Images, PDFs, videos up to 50MB</p>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {files.map((f) => (
            <div key={f.id} className="relative bg-white/5 rounded-lg overflow-hidden border border-white/10 group">
              {isImage(f.type) ? (
                <img src={f.url} alt={f.name} className="w-full h-32 object-cover" />
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <File size={32} className="text-white/40" />
                </div>
              )}
              <div className="p-2">
                <p className="text-xs text-white truncate">{f.name}</p>
                <p className="text-xs text-white/40">{(f.size / 1024).toFixed(1)} KB</p>
              </div>
              {canUpload && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(f.id) }}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} className="text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {files.length === 0 && !canUpload && (
        <p className="text-white/40 text-sm text-center py-6">No creative assets uploaded yet.</p>
      )}
    </div>
  )
}
