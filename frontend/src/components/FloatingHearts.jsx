import React, { useState, useEffect } from 'react'

const HEARTS = ['❤️', '🩷', '💕', '💗', '💖', '🌸', '✨', '💝']

function Heart({ id, style, symbol }) {
  return (
    <div
      className="floating-heart"
      style={{
        left: style.left,
        fontSize: style.size,
        animationDuration: style.duration,
        animationDelay: style.delay,
        ...style
      }}
    >
      {symbol}
    </div>
  )
}

export default function FloatingHearts({ count = 12 }) {
  const [hearts, setHearts] = useState([])

  useEffect(() => {
    const generated = Array.from({ length: count }, (_, i) => ({
      id: i,
      symbol: HEARTS[Math.floor(Math.random() * HEARTS.length)],
      style: {
        left: `${Math.random() * 100}%`,
        size: `${0.8 + Math.random() * 1.2}rem`,
        duration: `${8 + Math.random() * 12}s`,
        delay: `${Math.random() * 15}s`,
        opacity: 0.4 + Math.random() * 0.3,
      }
    }))
    setHearts(generated)
  }, [count])

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {hearts.map(h => (
        <Heart key={h.id} {...h} />
      ))}
    </div>
  )
}
