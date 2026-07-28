import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user, setUser } = useAuth()
  const [settings, setSettings] = useState({ theme: 'light', dark_mode: false, music_enabled: true, language: 'en', water_goal_ml: 3000, sleep_goal_hours: 8, calorie_goal: 2000, reminder_frequency_minutes: 60 })
  const [profile, setProfile] = useState({ full_name: '', email: '', blood_group: '', doctor_name: '', hospital: '', emergency_contact: '' })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('settings')
  const [botToken, setBotToken] = useState('')
  const [linking, setLinking] = useState(false)

  useEffect(() => {
    if (user) {
      setProfile({ full_name: user.full_name || '', email: user.email || '', blood_group: user.blood_group || '', doctor_name: user.doctor_name || '', hospital: user.hospital || '', emergency_contact: user.emergency_contact || '' })
    }
    axios.get('/api/settings/').then(r => setSettings(r.data)).catch(() => { })
  }, [user])

  const saveSettings = async () => {
    setSaving(true)
    try {
      await axios.put('/api/settings/', settings)
      toast.success('✅ Settings saved!')
    } catch { toast.error('Could not save settings') }
    finally { setSaving(false) }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await axios.put('/api/auth/me', profile)
      setUser(res.data)
      toast.success('✅ Profile updated!')
    } catch { toast.error('Could not update profile') }
    finally { setSaving(false) }
  }

  return (
    <div className="page-container fade-in-up">
      <h1 className="gradient-text" style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
        ⚙️ Settings
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
        Customize your recovery companion ❤️
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['settings', 'profile', 'integrations'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 22px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.85rem',
            background: activeTab === tab ? 'var(--primary)' : 'rgba(255,107,157,0.1)',
            color: activeTab === tab ? 'white' : 'var(--primary)', transition: 'all 0.3s'
          }}>
            {tab === 'settings' ? '⚙️ App Settings' : tab === 'profile' ? '👤 Profile' : '🔌 Integrations'}
          </button>
        ))}
      </div>

      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Goals */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: '18px', color: 'var(--text-primary)' }}>🎯 Daily Goals</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: '💧 Water Goal', key: 'water_goal_ml', min: 1000, max: 5000, step: 250, unit: 'ml', displayVal: `${(settings.water_goal_ml / 1000).toFixed(1)}L` },
                { label: '🌙 Sleep Goal', key: 'sleep_goal_hours', min: 4, max: 12, step: 0.5, unit: 'h', displayVal: `${settings.sleep_goal_hours}h` },
                { label: '🔥 Calorie Goal', key: 'calorie_goal', min: 1000, max: 3500, step: 100, unit: 'kcal', displayVal: `${settings.calorie_goal} kcal` },
              ].map(g => (
                <div key={g.key}>
                  <label style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>{g.label}</span>
                    <span style={{ color: 'var(--primary)' }}>{g.displayVal}</span>
                  </label>
                  <input type="range" min={g.min} max={g.max} step={g.step} value={settings[g.key]}
                    onChange={e => setSettings(s => ({ ...s, [g.key]: Number(e.target.value) }))}
                    style={{ width: '100%', accentColor: 'var(--primary)' }} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Preferences */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: '18px', color: 'var(--text-primary)' }}>✨ Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: '🎵 Background Music', key: 'music_enabled' },
                { label: '🌙 Dark Mode', key: 'dark_mode' },
              ].map(pref => (
                <div key={pref.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{pref.label}</span>
                  <div onClick={() => setSettings(s => ({ ...s, [pref.key]: !s[pref.key] }))}
                    style={{
                      width: 48, height: 26, borderRadius: 13, cursor: 'pointer', transition: 'all 0.3s',
                      background: settings[pref.key] ? 'var(--primary)' : '#ccc', position: 'relative'
                    }}>
                    <div style={{
                      position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%', background: 'white',
                      transition: 'all 0.3s', left: settings[pref.key] ? 25 : 3,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>🌍 Language</span>
                <select className="input-glass" value={settings.language} onChange={e => setSettings(s => ({ ...s, language: e.target.value }))} style={{ width: 'auto', padding: '8px 14px' }}>
                  <option value="en">English</option>
                  <option value="ur">اردو</option>
                </select>
              </div>
            </div>
          </motion.div>

          <button onClick={saveSettings} disabled={saving} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 28px' }}>
            {saving ? '❤️ Saving...' : '💾 Save Settings'}
          </button>
        </div>
      )}

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: '20px', color: 'var(--text-primary)' }}>👤 Profile Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {[
              { label: 'Full Name', key: 'full_name', placeholder: 'Asifa' },
              { label: 'Email', key: 'email', placeholder: 'asifa@example.com' },
              { label: 'Blood Group', key: 'blood_group', placeholder: 'B+' },
              { label: 'Emergency Contact', key: 'emergency_contact', placeholder: '+92-300-0000000' },
              { label: 'Doctor Name', key: 'doctor_name', placeholder: 'Dr. Ahmed' },
              { label: 'Hospital', key: 'hospital', placeholder: 'City Hospital' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                <input className="input-glass" value={profile[f.key] || ''} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-start' }}>
              <button onClick={saveProfile} disabled={saving} className="btn-primary" style={{ padding: '12px 28px' }}>
                {saving ? '❤️ Saving...' : '💾 Update Profile'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      {activeTab === 'integrations' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '28px' }}>
          
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
            🏃‍♀️ Google Fit
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
            Connect to Google Fit to automatically sync your daily steps, active minutes, and calories!
          </p>

          {user?.google_fit_refresh_token ? (
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', padding: '16px', borderRadius: '12px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>✅</span>
                <div>
                  <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: '#1d4ed8' }}>Google Fit Connected!</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e40af', marginTop: '4px' }}>Your steps and calories will automatically sync.</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '30px' }}>
              <a href={`${axios.defaults.baseURL || ''}/api/fit/login`} style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', color: '#333', border: '1px solid #ccc' }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" style={{ width: 18 }} />
                  Connect Google Fit
                </button>
              </a>
            </div>
          )}

          <hr style={{ borderTop: '1px solid rgba(0,0,0,0.1)', margin: '20px 0' }} />

          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
            🔔 Telegram Notifications
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
            Link a Telegram bot to receive live reminders for your medicines, meals, sleep, and cute love notes throughout the day!
          </p>

          {user?.telegram_chat_id ? (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>✅</span>
                <div>
                  <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: '#047857' }}>Telegram is Linked!</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#065f46', marginTop: '4px' }}>You will receive all notifications via your Telegram bot.</p>
                </div>
              </div>
              <button 
                className="btn-glass" 
                style={{ marginTop: '16px', border: '1px solid #ef4444', color: '#ef4444' }}
                onClick={async () => {
                  try {
                    const res = await axios.post('/api/telegram/unlink');
                    setUser(res.data);
                    toast.success('Telegram unlinked successfully');
                  } catch (e) {
                    toast.error('Failed to unlink');
                  }
                }}
              >
                Unlink Account
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.5)', padding: '20px', borderRadius: '12px' }}>
              <div>
                <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Step 1: Create a Bot</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Open Telegram and search for <b>@BotFather</b>. Send the command <code>/newbot</code> and follow the instructions. Copy the API Token he gives you.
                </p>
              </div>
              
              <div>
                <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Step 2: Message the Bot</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Search for your newly created bot on Telegram and send it the message: <code>/start</code>
                </p>
              </div>

              <div>
                <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Step 3: Link Account</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '8px' }}>
                  Paste your Bot API Token below and click Link.
                </p>
                <input 
                  type="text" 
                  className="input-glass" 
                  placeholder="e.g. 123456789:ABCdefGHIjklMNO..." 
                  value={botToken}
                  onChange={e => setBotToken(e.target.value)}
                  style={{ marginBottom: '12px' }}
                />
                <button 
                  className="btn-primary" 
                  disabled={linking || !botToken}
                  onClick={async () => {
                    setLinking(true);
                    try {
                      const res = await axios.post(`/api/telegram/link?bot_token=${encodeURIComponent(botToken)}`);
                      setUser(res.data);
                      toast.success('🎉 Telegram Linked Successfully!');
                      setBotToken('');
                    } catch (e) {
                      toast.error(e.response?.data?.detail || 'Failed to link Telegram. Did you send /start to the bot?');
                    } finally {
                      setLinking(false);
                    }
                  }}
                >
                  {linking ? 'Linking...' : '🔗 Link Telegram Account'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

    </div>
  )
}
