import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const LOVE_MESSAGES = [
  "❤️ I'm proud of you for taking your medicine today.",
  "🌸 You're one step closer to recovery.",
  "✨ Seeing you healthy is my favorite dream.",
  "🤲 Allah is with you, and so am I.",
  "💧 Drink some water, beautiful.",
  "😊 Your smile is my medicine.",
  "💎 Take care of yourself because you're precious.",
  "💓 Every heartbeat reminds me how much I care about you.",
  "💪 You're stronger than yesterday.",
  "🌟 Don't forget to smile today.",
  "❤️ I'll always be beside you.",
  "🎯 One more step toward recovery.",
  "🏥 Your health is the most important thing to me.",
  "🌙 Rest well tonight, you deserve it.",
  "🌺 You make recovery look beautiful.",
  "🚀 Keep going, you're doing amazing.",
  "❤️ I love you more than words can express.",
  "🤝 Your recovery journey is our journey together.",
  "🤲 Allah ka shukar hai, you're getting better every day.",
  "🌈 After the storm, comes the rainbow.",
]

const DUAS = [
  { arabic: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ وَاشْفِهِ", transliteration: "Allahumma Rabb an-nas, adhhib al-ba's washfiha", meaning: "O Allah, Lord of mankind, remove the difficulty and cure her.", type: "Healing Dua" },
  { arabic: "بِسْمِ اللَّهِ أَرْقِيكَ مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ", transliteration: "Bismillahi arqeeka min kulli shay'in yu'dheeka", meaning: "In the name of Allah, I perform ruqyah for you from everything that harms you.", type: "Ruqyah" },
  { arabic: "وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ", transliteration: "Wa idha maridtu fahuwa yashfeen", meaning: "And when I am ill, it is He who cures me.", type: "Quran 26:80" },
  { arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", transliteration: "Inna ma'al-'usri yusra", meaning: "Verily, with hardship comes ease.", type: "Quran 94:6" },
  { arabic: "وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ", transliteration: "Wa nunazzilu minal Qurani ma huwa shifa'un wa rahmah", meaning: "And We send down of the Quran that which is healing and mercy.", type: "Quran 17:82" },
]

const HEALING_QUOTES = [
  { text: "The body heals with play, the mind heals with laughter, and the spirit heals with joy.", author: "Proverb" },
  { text: "Healing is not linear. It's okay to have setbacks.", author: "Unknown" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Strength grows in the moments when you think you can't go on.", author: "Unknown" },
  { text: "You are braver than you believe, stronger than you seem.", author: "A.A. Milne" },
  { text: "Every day is a new beginning. Take a deep breath and start again.", author: "Unknown" },
]

export default function Motivation() {
  const [currentMsg, setCurrentMsg] = useState(0)
  const [serverQuote, setServerQuote] = useState(null)
  const [activeTab, setActiveTab] = useState('love')

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMsg(prev => (prev + 1) % LOVE_MESSAGES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    axios.get('/api/dashboard/quote?category=healing')
      .then(r => setServerQuote(r.data))
      .catch(() => { })
  }, [])

  const tabs = ['love', 'duas', 'quotes']

  return (
    <div className="page-container fade-in-up">
      <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
        🌟 Motivation Center ❤️
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
        Daily doses of love, healing, and spiritual strength
      </p>

      {/* Rotating Love Message */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{
          padding: '32px', marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(255,107,157,0.15), rgba(200,162,200,0.15))',
          border: '1.5px solid rgba(255,107,157,0.3)',
          borderRadius: 'var(--radius-xl)',
          textAlign: 'center',
          boxShadow: '0 8px 40px rgba(255,107,157,0.15)'
        }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💝</div>
        <h2 style={{ fontFamily: 'var(--font-script)', color: 'var(--primary)', fontSize: '1.4rem', marginBottom: '16px' }}>
          Daily Love Letter for Asifa
        </h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMsg}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.7, fontWeight: 500 }}
          >
            {LOVE_MESSAGES[currentMsg]}
          </motion.p>
        </AnimatePresence>
        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
          {LOVE_MESSAGES.map((_, i) => (
            <div key={i} onClick={() => setCurrentMsg(i)} style={{
              width: i === currentMsg ? 20 : 6, height: 6,
              borderRadius: 3, background: i === currentMsg ? 'var(--primary)' : 'rgba(255,107,157,0.3)',
              transition: 'all 0.3s', cursor: 'pointer'
            }} />
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 20px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.85rem',
            background: activeTab === tab ? 'var(--primary)' : 'rgba(255,107,157,0.1)',
            color: activeTab === tab ? 'white' : 'var(--primary)', transition: 'all 0.3s'
          }}>
            {tab === 'love' ? '❤️ Love Notes' : tab === 'duas' ? '🤲 Islamic Duas' : '✨ Healing Quotes'}
          </button>
        ))}
      </div>

      {/* Love Notes */}
      {activeTab === 'love' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {LOVE_MESSAGES.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                padding: '20px', background: 'rgba(255,255,255,0.7)',
                borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,107,157,0.2)',
                backdropFilter: 'blur(10px)',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                color: 'var(--text-primary)', lineHeight: 1.6
              }}>
              {msg}
            </motion.div>
          ))}
        </div>
      )}

      {/* Duas */}
      {activeTab === 'duas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {DUAS.map((dua, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card" style={{ padding: '24px' }}>
              <div className="badge badge-purple" style={{ marginBottom: '12px' }}>{dua.type}</div>
              <p style={{ fontFamily: 'var(--font-script)', fontSize: '1.5rem', color: 'var(--primary)', direction: 'rtl', textAlign: 'right', lineHeight: 1.8, marginBottom: '10px' }}>
                {dua.arabic}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>
                {dua.transliteration}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                🌙 {dua.meaning}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quotes */}
      {activeTab === 'quotes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {HEALING_QUOTES.map((q, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✨</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '10px' }}>
                "{q.text}"
              </p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                — {q.author}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
