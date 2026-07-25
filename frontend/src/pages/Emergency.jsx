import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Emergency() {
  const { user } = useAuth()

  const emergencyInfo = {
    bloodGroup: user?.blood_group || 'B+',
    doctor: user?.doctor_name || 'Dr. Ahmed',
    hospital: user?.hospital || 'City Hospital',
    contact: user?.emergency_contact || '+92-300-0000000',
    medicines: ['Paracetamol 500mg', 'Metronidazole 400mg', 'ORS Sachet', 'Vitamin C 1000mg', 'Probiotics'],
    allergies: 'No known allergies',
    insurance: 'National Insurance Co.',
  }

  return (
    <div className="page-container fade-in-up">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{
          padding: '20px 24px', marginBottom: '28px',
          background: 'rgba(239,83,80,0.1)', borderRadius: 'var(--radius-lg)',
          border: '2px solid rgba(239,83,80,0.25)', display: 'flex', gap: '12px', alignItems: 'center'
        }}>
        <span style={{ fontSize: '2rem' }}>🚨</span>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: '#C62828', marginBottom: '4px' }}>
            Emergency Information
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#E53935' }}>
            Critical medical information for Asifa — always keep this accessible
          </p>
        </div>
      </motion.div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Medical ID */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: '16px', color: '#C62828', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🩺 Medical ID
          </h3>
          {[
            { label: 'Full Name', value: user?.full_name || 'Asifa', icon: '👤' },
            { label: 'Blood Group', value: emergencyInfo.bloodGroup, icon: '🩸' },
            { label: 'Allergies', value: emergencyInfo.allergies, icon: '⚠️' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,107,157,0.08)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {item.icon} {item.label}
              </span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {item.value}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Doctor & Hospital */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: '16px', color: '#1565C0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏥 Doctor & Hospital
          </h3>
          {[
            { label: 'Doctor', value: emergencyInfo.doctor, icon: '👨‍⚕️' },
            { label: 'Hospital', value: emergencyInfo.hospital, icon: '🏥' },
            { label: 'Insurance', value: emergencyInfo.insurance, icon: '📋' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,107,157,0.08)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {item.icon} {item.label}
              </span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {item.value}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Emergency Contacts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: '16px', color: '#E53935', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📞 Emergency Contacts
          </h3>
          {[
            { name: 'Emergency Contact', number: emergencyInfo.contact, relation: 'Family' },
            { name: 'Doctor Direct', number: '+92-XXX-XXXXXXX', relation: 'Doctor' },
            { name: 'Ambulance', number: '1122', relation: 'Emergency' },
            { name: 'Hospital', number: '+92-XXX-XXXXXXX', relation: 'Hospital' },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,107,157,0.08)' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{c.name}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.relation}</div>
              </div>
              <a href={`tel:${c.number}`} style={{
                fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem',
                color: '#E53935', textDecoration: 'none', padding: '4px 10px',
                background: 'rgba(239,83,80,0.1)', borderRadius: 'var(--radius-full)'
              }}>
                📞 {c.number}
              </a>
            </div>
          ))}
        </motion.div>

        {/* Current Medicines */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: '16px', color: '#7B1FA2', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💊 Current Medicines
          </h3>
          {emergencyInfo.medicines.map((med, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,107,157,0.08)' }}>
              <span style={{ fontSize: '1rem' }}>💊</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.87rem', color: 'var(--text-secondary)' }}>{med}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Important note */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        style={{
          padding: '18px 22px', background: 'rgba(255,107,157,0.08)',
          borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,107,157,0.2)',
          fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-secondary)',
          display: 'flex', gap: '10px', alignItems: 'flex-start'
        }}>
        <span style={{ fontSize: '1.2rem' }}>❤️</span>
        <span>
          This information is provided for emergency purposes. In case of medical emergency, call 1122 immediately.
          Allah is your protector and healer — <em>لَا تَخَفْ وَلَا تَحْزَنْ</em> (Fear not, and grieve not).
        </span>
      </motion.div>
    </div>
  )
}
