import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'

export default function AIAssistant() {
  const [summary, setSummary] = useState(null)
  const [foodSuggestions, setFoodSuggestions] = useState(null)
  const [wellnessTips, setWellnessTips] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('summary')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [sumRes, foodRes, tipsRes] = await Promise.all([
        axios.get('/api/ai/summary'),
        axios.get('/api/ai/food-suggestions'),
        axios.get('/api/ai/wellness-tips')
      ])
      setSummary(sumRes.data)
      setFoodSuggestions(foodRes.data)
      setWellnessTips(tipsRes.data)
    } catch {
      toast.error('Could not load AI insights')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '3rem', animation: 'pulse-soft 1.5s ease infinite' }}>🤖</div>
      <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>AI analyzing your health data...</p>
    </div>
  )

  return (
    <div className="page-container fade-in-up">
      <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
        🤖 AI Health Assistant
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
        Personalized health insights just for you, Asifa ❤️
      </p>

      {/* Love note */}
      {summary?.love_note && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '16px 20px', marginBottom: '24px',
            background: 'linear-gradient(135deg, rgba(255,107,157,0.12), rgba(200,162,200,0.12))',
            border: '1.5px solid rgba(255,107,157,0.25)', borderRadius: 'var(--radius-lg)',
            fontFamily: 'var(--font-script)', fontSize: '1.1rem', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
          ❤️ {summary.love_note}
        </motion.div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'summary', label: '📊 Daily Summary' },
          { key: 'food', label: '🍽️ Food Suggestions' },
          { key: 'tips', label: '💡 Wellness Tips' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '8px 20px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.85rem',
            background: activeTab === tab.key ? 'var(--primary)' : 'rgba(255,107,157,0.1)',
            color: activeTab === tab.key ? 'white' : 'var(--primary)', transition: 'all 0.3s'
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Summary Tab */}
      {activeTab === 'summary' && summary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Insights */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
              🔍 Today's Health Insights
            </h3>
            {summary.insights.map((insight, i) => (
              <div key={i} style={{
                padding: '12px 16px', marginBottom: '10px',
                background: 'rgba(255,255,255,0.7)', borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,107,157,0.1)',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5
              }}>
                {insight}
              </div>
            ))}
          </motion.div>

          {/* Recommendations */}
          {summary.recommendations.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
                ✅ Recommendations
              </h3>
              {summary.recommendations.map((rec, i) => (
                <div key={i} style={{
                  padding: '12px 16px', marginBottom: '10px',
                  background: 'rgba(129,199,132,0.1)', borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(129,199,132,0.2)',
                  fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#2E7D32', lineHeight: 1.5
                }}>
                  {rec}
                </div>
              ))}
            </motion.div>
          )}

          {/* Recovery prediction + Daily tip */}
          <div className="grid-2">
            {summary.recovery_prediction && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '22px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
                  📈 Recovery Prediction
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {summary.recovery_prediction}
                </p>
              </motion.div>
            )}
            {summary.daily_tip && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card" style={{ padding: '22px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
                  💡 Today's Wellness Tip
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {summary.daily_tip}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Food Suggestions */}
      {activeTab === 'food' && foodSuggestions && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {['breakfast', 'lunch', 'snack', 'dinner'].map((meal, mi) => (
            <motion.div key={meal} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: mi * 0.1 }}
              className="glass-card" style={{ padding: '22px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: '14px', color: 'var(--text-primary)' }}>
                {meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : meal === 'snack' ? '🍎' : '🌙'} {meal.charAt(0).toUpperCase() + meal.slice(1)}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {foodSuggestions[meal]?.map((food, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.7)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,107,157,0.1)' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{food.name}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.76rem', color: 'var(--text-muted)', maxWidth: '60%', textAlign: 'right' }}>{food.reason}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="glass-card" style={{ padding: '22px', borderColor: 'rgba(239,83,80,0.2)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: '14px', color: '#C62828' }}>
              ⚠️ Foods to Avoid During Recovery
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {foodSuggestions.avoid?.map((food, i) => (
                <span key={i} className="badge" style={{ background: 'rgba(239,83,80,0.1)', color: '#C62828' }}>
                  ✕ {food}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Wellness Tips */}
      {activeTab === 'tips' && wellnessTips && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {wellnessTips.tips?.map((tip, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
              className="glass-card" style={{ padding: '22px' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '12px' }}>{tip.icon}</span>
              <span className="badge badge-pink" style={{ marginBottom: '10px', display: 'inline-block' }}>{tip.category}</span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tip.tip}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Refresh button */}
      <div style={{ textAlign: 'center', marginTop: '28px' }}>
        <button onClick={loadAll} className="btn-glass">
          🔄 Refresh Insights
        </button>
      </div>
    </div>
  )
}
