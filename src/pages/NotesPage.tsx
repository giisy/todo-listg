import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pin, Trash2, Search, Edit3, X, Check } from 'lucide-react'
import { format } from 'date-fns'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'
import type { Note } from '@/types'

const NOTE_COLORS = [
  { bg: '#1A1A1A', label: 'Default' },
  { bg: '#1e2a3a', label: 'Blue' },
  { bg: '#1e2a1e', label: 'Green' },
  { bg: '#2a1e2a', label: 'Purple' },
  { bg: '#2a2a1e', label: 'Yellow' },
  { bg: '#2a1e1e', label: 'Red' },
]

// Modal detail note — full popup dengan edit
function NoteDetailModal({ note, onClose }: { note: Note; onClose: () => void }) {
  const { dispatch } = useApp()
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [color, setColor] = useState(note.color || NOTE_COLORS[0].bg)
  const [hasChanges, setHasChanges] = useState(false)

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_NOTE',
      payload: { ...note, title, content, color, updatedAt: new Date().toISOString() },
    })
    onClose()
  }

  const handleDelete = () => {
    dispatch({ type: 'DELETE_NOTE', payload: note.id })
    onClose()
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-bg-card border border-border rounded-xl shadow-modal w-full max-w-2xl mx-4 flex flex-col"
          style={{ maxHeight: '85vh', background: color }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { dispatch({ type: 'UPDATE_NOTE', payload: { ...note, isPinned: !note.isPinned, updatedAt: new Date().toISOString() } }); onClose() }}
                className="btn-icon w-7 h-7"
                title={note.isPinned ? 'Unpin' : 'Pin'}
              >
                <Pin size={13} className={note.isPinned ? 'text-[var(--accent-color)] fill-current' : ''} />
              </button>
              <button onClick={handleDelete} className="btn-icon w-7 h-7 hover:text-accent-rose" title="Delete note">
                <Trash2 size={13} />
              </button>
            </div>
            <button onClick={onClose} className="btn-icon w-7 h-7"><X size={15} /></button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <input
              value={title}
              onChange={e => { setTitle(e.target.value); setHasChanges(true) }}
              className="w-full bg-transparent text-lg font-semibold text-text-primary placeholder:text-text-muted focus:outline-none border-none"
              placeholder="Note title..."
              autoFocus
            />
            <textarea
              value={content}
              onChange={e => { setContent(e.target.value); setHasChanges(true) }}
              className="w-full flex-1 bg-transparent text-sm text-text-secondary placeholder:text-text-muted focus:outline-none border-none resize-none leading-relaxed"
              placeholder="Write your note here..."
              rows={12}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border/30">
            <div className="flex items-center gap-2">
              <span className="text-2xs text-text-muted">Color:</span>
              {NOTE_COLORS.map(c => (
                <button
                  key={c.bg}
                  onClick={() => { setColor(c.bg); setHasChanges(true) }}
                  className={cn('w-5 h-5 rounded-full border-2 transition-all', color === c.bg ? 'border-white scale-110' : 'border-border/50')}
                  style={{ background: c.bg }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xs text-text-muted">
                {format(new Date(note.updatedAt), 'MMM d, yyyy')}
              </span>
              {hasChanges && (
                <button onClick={handleSave} className="btn-primary text-xs py-1.5">
                  <Check size={12} /> Save
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

export default function NotesPage() {
  const { state, dispatch, generateId } = useApp()
  const [isAdding, setIsAdding] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newColor, setNewColor] = useState(NOTE_COLORS[0].bg)
  const [search, setSearch] = useState('')

  const notes = state.notes.filter(n =>
    !search ||
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  )
  const pinned = notes.filter(n => n.isPinned)
  const others = notes.filter(n => !n.isPinned)

  const handleAdd = () => {
    if (!newTitle.trim() && !newContent.trim()) return
    dispatch({
      type: 'ADD_NOTE',
      payload: {
        id: generateId(),
        title: newTitle || 'Untitled',
        content: newContent,
        color: newColor,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
    setNewTitle('')
    setNewContent('')
    setNewColor(NOTE_COLORS[0].bg)
    setIsAdding(false)
  }

  const NoteCard = ({ note }: { note: Note }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="group rounded-lg border border-border/40 p-4 flex flex-col gap-2 cursor-pointer hover:border-border/80 hover:scale-[1.01] transition-all duration-200"
      style={{ background: note.color || '#1A1A1A' }}
      onClick={() => setSelectedNote(note)}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-text-primary leading-snug flex-1 min-w-0 truncate">
          {note.title}
        </h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => dispatch({ type: 'UPDATE_NOTE', payload: { ...note, isPinned: !note.isPinned, updatedAt: new Date().toISOString() } })}
            className="btn-icon w-6 h-6"
          >
            <Pin size={11} className={note.isPinned ? 'text-[var(--accent-color)] fill-current' : ''} />
          </button>
          <button
            onClick={() => dispatch({ type: 'DELETE_NOTE', payload: note.id })}
            className="btn-icon w-6 h-6 hover:text-accent-rose"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
      {note.content && (
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-4">{note.content}</p>
      )}
      <p className="text-2xs text-text-muted mt-auto pt-1">
        {format(new Date(note.updatedAt), 'MMM d, yyyy')}
      </p>
    </motion.div>
  )

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-6xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Notes</h2>
            <p className="text-xs text-text-muted mt-0.5">{state.notes.length} notes</p>
          </div>
          <button onClick={() => setIsAdding(true)} className="btn-primary">
            <Plus size={15} /> New Note
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-bg-card w-full max-w-sm">
          <Search size={13} className="text-text-muted" />
          <input type="text" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-text-primary placeholder:text-text-muted flex-1 focus:outline-none" />
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card p-4 space-y-3">
              <input placeholder="Note title..." value={newTitle} onChange={e => setNewTitle(e.target.value)} className="input font-medium" autoFocus />
              <textarea placeholder="Write something..." value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} className="input resize-none" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-text-muted">Color:</span>
                  {NOTE_COLORS.map(c => (
                    <button key={c.bg} onClick={() => setNewColor(c.bg)} className={cn('w-5 h-5 rounded-full border-2 transition-all', newColor === c.bg ? 'border-white scale-110' : 'border-border')} style={{ background: c.bg }} />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsAdding(false)} className="btn-ghost text-xs py-1"><X size={12} /> Cancel</button>
                  <button onClick={handleAdd} className="btn-primary text-xs py-1"><Check size={12} /> Add Note</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {pinned.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Pin size={13} className="text-[var(--accent-color)]" />
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Pinned</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <AnimatePresence>{pinned.map(n => <NoteCard key={n.id} note={n} />)}</AnimatePresence>
            </div>
          </div>
        )}

        {others.length > 0 && (
          <div className="space-y-3">
            {pinned.length > 0 && <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Others</span>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <AnimatePresence>{others.map(n => <NoteCard key={n.id} note={n} />)}</AnimatePresence>
            </div>
          </div>
        )}

        {notes.length === 0 && !isAdding && (
          <div className="card p-12 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent-color)]/10 flex items-center justify-center">
              <Edit3 size={28} className="text-[var(--accent-color)]/60" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-text-primary">No notes yet</p>
              <p className="text-xs text-text-muted mt-1">Click "New Note" to get started</p>
            </div>
          </div>
        )}
      </div>

      {/* Note detail modal */}
      {selectedNote && <NoteDetailModal note={selectedNote} onClose={() => setSelectedNote(null)} />}
    </div>
  )
}