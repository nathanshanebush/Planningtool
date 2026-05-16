import React, { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export function CreativeLightbox({ files, index, onClose, onNext, onPrev }) {
  const file = files[index]
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, onNext, onPrev])

  if (!file) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
        <X size={28} />
      </button>
      {index > 0 && (
        <button onClick={onPrev} className="absolute left-4 text-white/70 hover:text-white">
          <ChevronLeft size={36} />
        </button>
      )}
      {index < files.length - 1 && (
        <button onClick={onNext} className="absolute right-4 text-white/70 hover:text-white">
          <ChevronRight size={36} />
        </button>
      )}
      <div className="max-w-4xl max-h-[90vh] w-full px-16">
        {file.type?.startsWith('image/') ? (
          <img src={file.url} alt={file.name} className="max-w-full max-h-[85vh] object-contain mx-auto rounded-lg" />
        ) : (
          <div className="bg-jet rounded-xl p-8 text-center text-white">
            <p className="text-lg font-medium">{file.name}</p>
            <p className="text-white/50 text-sm mt-1">Preview not available</p>
          </div>
        )}
        <p className="text-white/50 text-sm text-center mt-3">{file.name}</p>
      </div>
    </div>
  )
}
