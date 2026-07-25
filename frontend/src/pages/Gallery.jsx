import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'

export default function Gallery() {
  const [items, setItems] = useState([])
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await axios.get('/api/gallery/')
      setItems(res.data)
    } catch { }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('caption', '')
    try {
      await axios.post('/api/gallery/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('📸 Memory uploaded! ❤️')
      load()
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const toggleFav = async (id) => {
    try {
      await axios.put(`/api/gallery/${id}/favourite`)
      load()
    } catch { }
  }

  const deleteItem = async (id) => {
    try {
      await axios.delete(`/api/gallery/${id}`)
      toast.success('Item deleted')
      setSelected(null)
      load()
    } catch { }
  }

  const filtered = filter === 'all' ? items : filter === 'favourites' ? items.filter(i => i.is_favourite) : items.filter(i => i.file_type === filter)

  return (
    <div className="page-container fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>
            🖼️ Gallery
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Beautiful memories, preserved with love ❤️
          </p>
        </div>
        <label className="btn-primary" style={{ cursor: 'pointer' }}>
          {uploading ? '⏳ Uploading...' : '📸 Upload Memory'}
          <input type="file" accept="image/*,video/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
        </label>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all', 'image', 'video', 'favourites'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 18px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.82rem',
            background: filter === f ? 'var(--primary)' : 'rgba(255,107,157,0.1)',
            color: filter === f ? 'white' : 'var(--primary)', transition: 'all 0.3s'
          }}>
            {f === 'all' ? '🖼️ All' : f === 'image' ? '📷 Photos' : f === 'video' ? '🎥 Videos' : '❤️ Favourites'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🖼️</div>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>No memories here yet. Upload your first photo!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(item)}
              style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer', position: 'relative', aspectRatio: '1', background: 'rgba(255,107,157,0.05)', border: '1px solid rgba(255,107,157,0.15)' }}>
              <img src={item.file_path} alt={item.caption || 'Memory'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: '6px' }}>
                <button onClick={e => { e.stopPropagation(); toggleFav(item.id) }}
                  style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.is_favourite ? '❤️' : '🤍'}
                </button>
              </div>
              {item.caption && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', color: 'white', fontFamily: 'var(--font-body)', fontSize: '0.75rem' }}>
                  {item.caption}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}>
              <img src={selected.file_path} alt={selected.caption || 'Memory'} style={{ maxWidth: '80vw', maxHeight: '70vh', objectFit: 'contain', display: 'block' }} />
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  {selected.caption || new Date(selected.uploaded_at).toLocaleDateString()}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => toggleFav(selected.id)} className="btn-glass" style={{ padding: '6px 14px' }}>
                    {selected.is_favourite ? '❤️ Unfavourite' : '🤍 Favourite'}
                  </button>
                  <button onClick={() => deleteItem(selected.id)} style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1.5px solid rgba(239,83,80,0.4)', background: 'rgba(239,83,80,0.08)', color: '#EF5350', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.82rem' }}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
