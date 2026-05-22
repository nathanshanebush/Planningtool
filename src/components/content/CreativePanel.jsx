import React, { useRef, useState } from 'react'
import { FileText, CheckCircle2, RefreshCw, XCircle, Trash2, Upload } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { useCreatives, useUploadCreative, useAddCreativeFeedback, useDeleteCreative } from '../../hooks/useCreatives'

const STATUS_CONFIG = {
  pending:        { label: 'Pending Review',  className: 'bg-white/10 text-white/60' },
  approved:       { label: 'Approved',        className: 'bg-green-500/20 text-green-400' },
  needs_revision: { label: 'Needs Revision',  className: 'bg-amber-500/20 text-amber-400' },
  rejected:       { label: 'Rejected',        className: 'bg-red-500/20 text-red-400' },
}

const FEEDBACK_ICON = {
  approve:  { Icon: CheckCircle2, className: 'text-green-400' },
  revision: { Icon: RefreshCw,    className: 'text-amber-400' },
  reject:   { Icon: XCircle,      className: 'text-red-400' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  )
}

function FeedbackItem({ item }) {
  const cfg = FEEDBACK_ICON[item.type] ?? FEEDBACK_ICON.revision
  const { Icon } = cfg
  return (
    <div className="flex gap-2 text-sm">
      <Icon size={14} className={`mt-0.5 shrink-0 ${cfg.className}`} />
      <div>
        <span className="font-medium text-white/90 mr-1">{item.author}:</span>
        <span className="text-white/70">{item.comment}</span>
        <span className="block text-white/30 text-xs mt-0.5">
          {formatDistanceToNow(parseISO(item.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  )
}

function AssetCard({ asset, tacticId, uploaderName }) {
  const [selectedType, setSelectedType] = useState(null)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const addFeedback = useAddCreativeFeedback()
  const deleteCreative = useDeleteCreative()

  const handleSubmit = () => {
    if (!selectedType) return
    if (selectedType !== 'approve' && !comment.trim()) {
      setError('A comment is required for Revision and Reject.')
      return
    }
    setError('')
    addFeedback.mutate(
      { assetId: asset.id, tacticId, author: uploaderName, type: selectedType, comment: comment.trim() },
      { onSuccess: () => { setComment(''); setSelectedType(null) } }
    )
  }

  const isImage = asset.file_type?.startsWith('image/') && asset.file_url

  const typeButtons = [
    { type: 'approve',  label: 'Approve',  activeClass: 'border-green-500 text-green-400' },
    { type: 'revision', label: 'Revision', activeClass: 'border-amber-500 text-amber-400' },
    { type: 'reject',   label: 'Reject',   activeClass: 'border-red-500 text-red-400' },
  ]

  return (
    <div className="relative bg-jet border border-white/10 rounded-xl overflow-hidden group">
      <button
        onClick={() => deleteCreative.mutate({ assetId: asset.id, tacticId })}
        className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/80"
        title="Delete asset"
      >
        <Trash2 size={13} className="text-white" />
      </button>

      {isImage ? (
        <img src={asset.file_url} alt={asset.file_name} className="w-full max-h-40 object-contain bg-black/20" />
      ) : (
        <div className="h-20 flex items-center justify-center gap-2 bg-white/5">
          <FileText size={28} className="text-white/30" />
          <span className="text-white/40 text-xs">{asset.file_name}</span>
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-white truncate">{asset.file_name}</p>
            <p className="text-xs text-white/40 mt-0.5">Uploaded by {asset.uploaded_by}</p>
          </div>
          <StatusBadge status={asset.status} />
        </div>

        {asset.feedback?.length > 0 && (
          <div className="max-h-32 overflow-y-auto space-y-2 border-t border-white/10 pt-3">
            {asset.feedback.map((f) => (
              <FeedbackItem key={f.id} item={f} />
            ))}
          </div>
        )}

        <div className="border-t border-white/10 pt-3 space-y-2">
          <div className="flex gap-2">
            {typeButtons.map(({ type, label, activeClass }) => (
              <button
                key={type}
                onClick={() => setSelectedType(t => t === type ? null : type)}
                className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors
                  ${selectedType === type
                    ? activeClass + ' bg-white/5'
                    : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white/70'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {selectedType && (
            <>
              <textarea
                value={comment}
                onChange={(e) => { setComment(e.target.value); setError('') }}
                placeholder={selectedType === 'approve' ? 'Optional comment…' : 'Add a comment (required)…'}
                rows={2}
                className="w-full bg-coal border border-white/10 text-white placeholder-white/30 rounded-lg px-3 py-2 text-xs outline-none focus:border-orange/60 resize-none"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={addFeedback.isPending}
                className="w-full py-1.5 bg-orange text-white text-xs font-medium rounded-lg hover:bg-orange/90 transition-colors disabled:opacity-50"
              >
                {addFeedback.isPending ? 'Sending…' : 'Submit Feedback'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function CreativePanel({ tacticId, uploaderName = 'You' }) {
  const fileRef = useRef(null)
  const { data: assets = [], isLoading } = useCreatives(tacticId)
  const uploadCreative = useUploadCreative()

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files ?? [])
    files.forEach((file) => {
      uploadCreative.mutate({ tacticId, file, uploadedBy: uploaderName })
    })
    e.target.value = ''
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Creative Assets</h3>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploadCreative.isPending}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors disabled:opacity-50"
        >
          <Upload size={13} />
          {uploadCreative.isPending ? 'Uploading…' : 'Upload'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf,.doc,.docx"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {isLoading && (
        <p className="text-white/40 text-sm text-center py-6">Loading assets…</p>
      )}

      {!isLoading && assets.length === 0 && (
        <div className="text-center py-10 text-white/30 text-sm">
          No creative assets yet. Upload one to get started.
        </div>
      )}

      {!isLoading && assets.length > 0 && (
        <div className="space-y-4">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} tacticId={tacticId} uploaderName={uploaderName} />
          ))}
        </div>
      )}
    </div>
  )
}
