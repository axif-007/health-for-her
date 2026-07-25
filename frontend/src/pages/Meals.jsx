import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'

const HEALTHY_FOODS = {
  breakfast: [{ name: 'Oatmeal with banana', cal: 280, protein: 8 }, { name: 'Egg toast', cal: 320, protein: 18 }, { name: 'Yogurt & honey', cal: 180, protein: 10 }],
  lunch: [{ name: 'Chicken soup', cal: 250, protein: 22 }, { name: 'Rice & dal', cal: 380, protein: 15 }, { name: 'Grilled chicken & salad', cal: 420, protein: 35 }],
  snack: [{ name: 'Apple', cal: 80, protein: 0 }, { name: 'Dates', cal: 90, protein: 1 }, { name: 'Almonds', cal: 120, protein: 4 }],
  dinner: [{ name: 'Khichdi', cal: 300, protein: 12 }, { name: 'Vegetable soup', cal: 160, protein: 6 }, { name: 'Boiled rice + chicken', cal: 420, protein: 28 }],
}

export default function Meals() {
  const [todayMeals, setTodayMeals] = useState(null)
  const [form, setForm] = useState({ meal_type: 'breakfast', custom_name: '', calories: '', protein: '', notes: '' })
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await axios.get('/api/meals/today')
      setTodayMeals(res.data)
    } catch { }
  }

  const logMeal = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      await axios.post('/api/meals/log', {
        date: new Date().toISOString().split('T')[0],
        meal_type: form.meal_type,
        custom_name: form.custom_name,
        calories: form.calories ? Number(form.calories) : null,
        protein: form.protein ? Number(form.protein) : null,
        notes: form.notes
      })
      toast.success('🍽️ Meal logged!')
      setShowForm(false)
      setForm({ meal_type: 'breakfast', custom_name: '', calories: '', protein: '', notes: '' })
      load()
    } catch { toast.error('Could not log meal') }
    finally { setAdding(false) }
  }

  const quickLog = async (mealType, food) => {
    try {
      await axios.post('/api/meals/log', {
        date: new Date().toISOString().split('T')[0],
        meal_type: mealType, custom_name: food.name, calories: food.cal, protein: food.protein
      })
      toast.success(`✅ ${food.name} logged!`)
      load()
    } catch { }
  }

  const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner']
  const icons = { breakfast: '🌅', lunch: '☀️', snack: '🍎', dinner: '🌙' }

  return (
    <div className="page-container fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>🥗 Meal Planner</h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Today: {todayMeals?.total_calories?.toFixed(0) || 0} kcal · {todayMeals?.total_protein?.toFixed(0) || 0}g protein
          </p>
        </div>
        <button onClick={() => setShowForm(p => !p)} className="btn-primary">
          {showForm ? '✕ Close' : '+ Log Meal'}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <form onSubmit={logMeal} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Meal Type</label>
              <select className="input-glass" value={form.meal_type} onChange={e => setForm(f => ({ ...f, meal_type: e.target.value }))}>
                {mealTypes.map(t => <option key={t} value={t}>{icons[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Food Name *</label>
              <input className="input-glass" value={form.custom_name} onChange={e => setForm(f => ({ ...f, custom_name: e.target.value }))} placeholder="e.g., Chicken soup" required />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Calories (kcal)</label>
              <input className="input-glass" type="number" value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))} placeholder="250" />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Protein (g)</label>
              <input className="input-glass" type="number" value={form.protein} onChange={e => setForm(f => ({ ...f, protein: e.target.value }))} placeholder="20" />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn-glass">Cancel</button>
              <button type="submit" disabled={adding} className="btn-primary">🍽️ Log Meal</button>
            </div>
          </form>
        </motion.div>
      )}

      {mealTypes.map((mealType, mi) => (
        <motion.div key={mealType} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: mi * 0.1 }}
          className="glass-card" style={{ padding: '22px', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {icons[mealType]} {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            {todayMeals?.by_type[mealType]?.length > 0 && (
              <span className="badge badge-green">{todayMeals.by_type[mealType].length} items</span>
            )}
          </h3>

          {/* Today's logged meals */}
          {todayMeals?.by_type[mealType]?.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              {todayMeals.by_type[mealType].map((log, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,107,157,0.07)', borderRadius: 'var(--radius-md)', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>{log.custom_name}</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {log.calories && <span className="badge badge-pink">{log.calories} kcal</span>}
                    {log.protein && <span className="badge badge-blue">{log.protein}g protein</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick-add suggestions */}
          <div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              💡 Quick Add:
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {HEALTHY_FOODS[mealType]?.map(food => (
                <button key={food.name} onClick={() => quickLog(mealType, food)} style={{
                  padding: '5px 12px', borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(255,107,157,0.25)', background: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                  color: 'var(--text-secondary)', transition: 'all 0.2s ease'
                }}>
                  {food.name} <span style={{ color: 'var(--text-muted)' }}>({food.cal}kcal)</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
