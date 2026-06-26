import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pin, Trash2, Search, Edit3, X, Check } from 'lucide-react'
import { format } from 'date-fns'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'
import type { Note } from '@/types'

const NOTE_COLORS = [
  { bg: '#1A1E24', label: 'Default' },
  { bg: '#1e2a3a', label: 'Blue' },
  { bg: '#1e2a1e', label: 'Green' },
  { bg: '#2a1e2a', label: 'Purple' },
  { bg: '#2a2a1e', label: 'Yellow' },
  { bg: '#2a1e1e', label: 'Red' },
]

export default function NotesPage() {
  const { state, dispatch, generateId } = useApp()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
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

  const NoteCard = ({ note }: { note: Note }) => {
    const isEditing = editingId === note.id
    const [editTitle, setEditTitle] = useState(note.title)
    const [editContent, setEditContent] = useState(note.content)

    const saveEdit = () => {
      dispatch({
        type: 'UPDATE_NOTE',
        payload: { ...note, title: editTitle, content: editContent, updatedAt: new Date().toISOString() },
      })
      setEditingId(null)
    }

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="group rounded-lg border border-border/60 p-4 flex flex-col gap-2 hover:border-border/80 transition-all duration-200"
        style={{ background: note.color || '#1A1E24' }}
      >
        {isEditing ? (
          <>
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="input text-sm font-semibold"
              autoFocus
            />
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={4}
              className="input text-xs resize-none"
            />
            <div className="flex items-center justify-end gap-2 mt-1">
              <button onClick={() => setEditingId(null)} className="btn-ghost text-xs py-1">
                <X size={12} /> Cancel
              </button>
              <button onClick={saveEdit} className="btn-primary text-xs py-1">
                <Check size={12} /> Save
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-text-primary leading-snug flex-1 min-w-0 truncate">
                {note.title}
              </h3>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => setEditingId(note.id)}
                  className="btn-icon w-6 h-6"
                >
                  <Edit3 size={11} />
                </button>
                <button
                  onClick={() => dispatch({ type: 'UPDATE_NOTE', payload: { ...note, isPinned: !note.isPinned } })}
                  className="btn-icon w-6 h-6"
                >
                  <Pin size={11} className={note.isPinned ? 'text-accent-blue fill-current' : ''} />
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
          </>
        )}
      </motion.div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Notes</h2>
            <p className="text-xs text-text-muted mt-0.5">{state.notes.length} notes</p>
          </div>
          <button onClick={() => setIsAdding(true)} className="btn-primary">
            <Plus size={15} />
            New Note
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-bg-card w-full max-w-sm">
          <Search size={13} className="text-text-muted" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-text-primary placeholder:text-text-muted flex-1 focus:outline-none"
          />
        </div>

        {/* Add note form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="card p-4 space-y-3"
            >
              <input
                placeholder="Note title..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="input font-medium"
                autoFocus
              />
              <textarea
                placeholder="Write something..."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                rows={4}
                className="input resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-text-muted">Color:</span>
                  {NOTE_COLORS.map(c => (
                    <button
                      key={c.bg}
                      onClick={() => setNewColor(c.bg)}
                      className={cn(
                        'w-5 h-5 rounded-full border-2 transition-all',
                        newColor === c.bg ? 'border-white scale-110' : 'border-border'
                      )}
                      style={{ background: c.bg }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsAdding(false)} className="btn-ghost text-xs py-1">
                    <X size={12} /> Cancel
                  </button>
                  <button onClick={handleAdd} className="btn-primary text-xs py-1">
                    <Check size={12} /> Add Note
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pinned */}
        {pinned.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Pin size={13} className="text-accent-blue" />
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Pinned</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <AnimatePresence>
                {pinned.map(n => <NoteCard key={n.id} note={n} />)}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Others */}
        {others.length > 0 && (
          <div className="space-y-3">
            {pinned.length > 0 && (
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Others</span>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <AnimatePresence>
                {others.map(n => <NoteCard key={n.id} note={n} />)}
              </AnimatePresence>
            </div>
          </div>
        )}

        {notes.length === 0 && !isAdding && (
          <div className="card p-12 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 flex items-center justify-center">
              <Edit3 size={28} className="text-accent-blue/60" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-text-primary">No notes yet</p>
              <p className="text-xs text-text-muted mt-1">Click "New Note" to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}