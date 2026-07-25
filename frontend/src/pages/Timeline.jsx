import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'

export default function Timeline() {
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', event_date: '', icon: '❤️', color: '#FF6B9D', is_milestone: false })

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await axios.get('/api/timeline/')
      setEvents(res.data)
    } catch { }
  }

  const addEvent = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/timeline/', form)
      toast.success('💝 Memory added to your timeline!')
      setShowForm(false)
      setForm({ title: '', description: '', event_date: '', icon: '❤️', color: '#FF6B9D', is_milestone: false })
      load()
    } catch { toast.error('Could not add event') }
  }

  const deleteEvent = async (id) => {
    try {
      await axios.delete(`/api/timeline/${id}`)
      toast.success('Event removed')
      load()
    } catch { }
  }

  return (
    <div className="page-container fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>
            💝 Memory Timeline
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Our beautiful journey together ❤️
          </p>
        </div>
        <button onClick={() => setShowForm(p => !p)} className="btn-primary">
          {showForm ? '✕ Close' : '+ Add Memory'}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '16px', color: 'var(--primary)' }}>💝 Add New Memory</h3>
          <form onSubmit={addEvent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Title *</label>
              <input className="input-glass" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., First Meeting" required />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Date</label>
              <input className="input-glass" type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Description</label>
              <textarea className="input-glass" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="The story behind this memory..." style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Icon</label>
              <input className="input-glass" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="❤️" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '24px' }}>
              <input type="checkbox" id="milestone" checked={form.is_milestone} onChange={e => setForm(f => ({ ...f, is_milestone: e.target.checked }))} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
              <label htmlFor="milestone" style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>Mark as Milestone ⭐</label>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn-glass">Cancel</button>
              <button type="submit" className="btn-primary">💝 Add Memory</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Timeline */}
      <div style={{ position: 'relative' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute', left: '32px', top: 0, bottom: 0,
          width: 2, background: 'linear-gradient(180deg, var(--primary), var(--secondary), transparent)',
          borderRadius: 1
        }} />

        {events.map((event, i) => (
          <motion.div key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ display: 'flex', gap: '20px', marginBottom: '24px', paddingLeft: '10px' }}>
            {/* Node */}
            <div style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                background: event.is_milestone
                  ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                  : 'rgba(255,255,255,0.9)',
                border: `2px solid ${event.color || 'var(--primary)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                boxShadow: event.is_milestone ? '0 4px 16px rgba(255,107,157,0.35)' : 'none'
              }}>
                {event.icon}
              </div>
            </div>

            {/* Content */}
            <div style={{
              flex: 1, padding: '18px', borderRadius: 'var(--radius-lg)',
              background: event.is_milestone
                ? 'linear-gradient(135deg, rgba(255,107,157,0.1), rgba(200,162,200,0.1))'
                : 'rgba(255,255,255,0.7)',
              border: `1px solid ${event.color || 'rgba(255,107,157,0.2)'}30`,
              backdropFilter: 'blur(10px)',
              position: 'relative'
            }}>
              {event.is_milestone && (
                <span style={{ position: 'absolute', top: 12, right: 12, fontSize: '0.7rem', background: 'rgba(255,107,157,0.15)', color: 'var(--primary)', padding: '3px 8px', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                  ⭐ Milestone
                </span>
              )}
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: event.color || 'var(--text-primary)', marginBottom: '4px' }}>
                {event.title}
              </h3>
              {event.event_date && (
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  📅 {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
              {event.description && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {event.description}
                </p>
              )}
              <button onClick={() => deleteEvent(event.id)} style={{
                marginTop: '10px', border: 'none', background: 'rgba(239,83,80,0.08)', color: '#EF5350',
                borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-heading)', fontWeight: 600
              }}>Remove</button>
            </div>
          </motion.div>
        ))}
      </div>

      {events.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>💝</div>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '1rem' }}>
            Your beautiful memories will appear here. Start adding them!
          </p>
        </div>
      )}
    </div>
  )
}
