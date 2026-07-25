import React from 'react'
import { motion } from 'framer-motion'

export default function About() {
  return (
    <div className="page-container fade-in-up">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '5rem', marginBottom: '20px' }}>❤️</div>
        <h1 style={{
          fontFamily: 'var(--font-script)', fontSize: '2.8rem',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', marginBottom: '16px'
        }}>
          Asifa – My Recovery Companion
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '32px' }}>
          This application was built with love, care, and genuine concern for Asifa's health and happiness. Every feature, every color, every love message — all created with one purpose: to support her recovery journey and remind her that she is deeply loved.
        </p>

        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px', textAlign: 'left' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '16px' }}>
            🌟 Features
          </h2>
          {[
            '💊 Complete Medicine Tracker with reminders',
            '💧 Water intake tracker with animated bottle',
            '📅 Daily schedule with beautiful timeline',
            '😊 Mood tracker with emoji selection',
            '🌙 Sleep quality monitoring',
            '🌡️ Symptom severity tracking',
            '📖 Personal health journal',
            '📈 Recovery progress with charts',
            '🤖 AI Health Assistant',
            '🖼️ Memory Gallery',
            '💝 Relationship Timeline',
            '🏆 Achievement system',
            '🚨 Emergency information',
            '📊 PDF Reports',
            '🌟 Motivation Center with Love Letters & Duas',
          ].map((f, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,107,157,0.08)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {f}
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '16px' }}>
            🤲 A Prayer for Asifa
          </h2>
          <p style={{ fontFamily: 'var(--font-script)', fontSize: '1.6rem', color: 'var(--primary)', direction: 'rtl', textAlign: 'right', lineHeight: 1.8, marginBottom: '10px' }}>
            اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ وَاشْفِهِ
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            O Allah, Lord of mankind, remove her difficulty and grant her complete healing. Ameen.
          </p>
        </div>

        <p style={{ fontFamily: 'var(--font-script)', fontSize: '1.4rem', color: 'var(--primary)' }}>
          Made with ❤️ — just for you, Asifa
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          Version 1.0.0 • Built with FastAPI + React + SQLite
        </p>
      </motion.div>
    </div>
  )
}
