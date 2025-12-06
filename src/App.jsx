import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.enskys.space'

const SPORTS = [
  { label: 'FOOTBALL', value: 'Football', icon: '⚽' },
  { label: 'BASKETBALL', value: 'Basketball', icon: '🏀' },
]

const today = new Date().toISOString().slice(0, 10)

const formatTime = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

const formatDay = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function App() {
  const [introComplete, setIntroComplete] = useState(false)
  const [date, setDate] = useState(today)
  const [sport, setSport] = useState('Football')
  const [country, setCountry] = useState('')
  const [league, setLeague] = useState('')
  const [allCountries, setAllCountries] = useState([])
  const [allLeagues, setAllLeagues] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  
  const lastOptionsKey = useRef('')

  // Fetch events with current filters
  const fetchEvents = async (filterDate, filterSport, filterCountry, filterLeague) => {
    const params = new URLSearchParams({ date: filterDate, sport: filterSport })
    if (filterCountry) params.append('country', filterCountry)
    if (filterLeague) params.append('league', filterLeague)
    
    console.log('Fetching with params:', params.toString())
    
    const res = await fetch(`${API_BASE}/events?${params.toString()}`)
    if (!res.ok) throw new Error('Backend offline')
    const payload = await res.json()
    return payload.events || []
  }

  // Load options (all leagues/countries for current date+sport)
  const loadOptions = async (forDate, forSport) => {
    try {
      const events = await fetchEvents(forDate, forSport, '', '')
      const countries = [...new Set(events.map((ev) => ev.country).filter(Boolean))].sort()
      const leagues = [...new Set(events.map((ev) => ev.tournament).filter(Boolean))].sort()
      setAllCountries(countries)
      setAllLeagues(leagues)
      lastOptionsKey.current = `${forDate}-${forSport}`
    } catch (err) {
      console.error('Failed to load options:', err)
    }
  }

  // Main effect: load events when filters change
  useEffect(() => {
    if (!introComplete) return

    let cancelled = false
    
    const load = async () => {
      setLoading(true)
      setError('')
      
      try {
        // Check if we need to reload options (date/sport changed)
        const optionsKey = `${date}-${sport}`
        if (optionsKey !== lastOptionsKey.current) {
          await loadOptions(date, sport)
        }
        
        // Fetch filtered events
        const data = await fetchEvents(date, sport, country, league)
        if (!cancelled) {
          setEvents(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          setEvents([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    
    load()
    
    return () => { cancelled = true }
  }, [date, sport, country, league, introComplete])

  // Reset filters when sport changes
  useEffect(() => {
    setCountry('')
    setLeague('')
  }, [sport])

  // Intro timer
  useEffect(() => {
    const timer = setTimeout(() => setIntroComplete(true), 2800)
    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchEvents(date, sport, country, league)
      setEvents(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const liveCount = events.length
  const sportIcon = SPORTS.find(s => s.value === sport)?.icon || '⚽'

  if (!introComplete) {
    return (
      <div className="intro">
        <div className="intro-pitch">
          <img src="/pitch.jpg" alt="" />
        </div>
        <div className="intro-ball">
          <div className="ball-inner" />
        </div>
        <div className="intro-text">
          <span className="intro-pre">LIVE SPORTS</span>
          <h1 className="intro-title">EPIC<span>SPORT</span></h1>
          <div className="intro-loader">
            <div className="intro-loader-bar" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Ambient background */}
      <div className="ambient">
        <div className="ambient-orb orb-1" />
        <div className="ambient-orb orb-2" />
        <div className="ambient-grid" />
      </div>

      {/* Topbar */}
      <header className="topbar">
        <div className="logo">
          <div className="logo-mark">
            <span>E</span>
          </div>
          <div className="logo-text">
            <strong>EPICSPORT</strong>
            <span>streaming</span>
          </div>
        </div>
        <nav className="nav">
          {SPORTS.map((s) => (
            <button
              key={s.value}
              className={`nav-item ${sport === s.value ? 'active' : ''}`}
              onClick={() => setSport(s.value)}
            >
              <span className="nav-icon">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>
        <div className="topbar-right">
          <div className="live-badge">
            <span className="live-dot" />
            <span>{liveCount}</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <img src="/pitch.jpg" alt="" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">{sport === 'Football' ? 'UEFA • EUROPE' : 'WORLDWIDE'}</div>
          <h1 className="hero-title">
            {sport === 'Football' ? (
              <>MATCHES<br/><span>LIVE</span></>
            ) : (
              <>BASKETBALL<br/><span>GLOBAL</span></>
            )}
          </h1>
          <p className="hero-sub">
            Free streaming • Multiple channels • No ads
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">{liveCount}</span>
              <span className="stat-label">events</span>
            </div>
            <div className="stat">
              <span className="stat-value">{allLeagues.length}</span>
              <span className="stat-label">leagues</span>
            </div>
            <div className="stat">
              <span className="stat-value">{allCountries.length}</span>
              <span className="stat-label">countries</span>
            </div>
          </div>
        </div>
        <div className="hero-ball">
          <div className="floating-ball">{sportIcon}</div>
        </div>
      </section>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>DATE</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>COUNTRY</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">All ({allCountries.length})</option>
            {allCountries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>LEAGUE</label>
          <select value={league} onChange={(e) => setLeague(e.target.value)}>
            <option value="">All ({allLeagues.length})</option>
            {allLeagues.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          {loading ? 'LOADING...' : 'REFRESH'}
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Events Grid */}
      <section className="events">
        <div className="events-header">
          <h2>
            <span className="events-count">{liveCount}</span>
            EVENTS {formatDay(date).toUpperCase()}
          </h2>
          {(country || league) && (
            <div className="active-filters">
              {country && <span className="filter-tag">{country}</span>}
              {league && <span className="filter-tag">{league}</span>}
              <button className="clear-filters" onClick={() => { setCountry(''); setLeague('') }}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        {events.length === 0 && !loading ? (
          <div className="empty">
            <div className="empty-icon">📭</div>
            <p>No events found for the selected filters</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event, idx) => (
              <article
                key={`${event.match}-${idx}`}
                className={`event-card ${selectedEvent === idx ? 'expanded' : ''}`}
                onClick={() => setSelectedEvent(selectedEvent === idx ? null : idx)}
                style={{ '--delay': `${idx * 0.05}s` }}
              >
                <div className="event-top">
                  <div className="event-league">
                    <span className="league-dot" />
                    {event.tournament}
                  </div>
                  <div className="event-time">
                    {formatTime(event.start_time_utc)}
                  </div>
                </div>

                <h3 className="event-match">
                  {event.teams?.[0] || event.match.split('-')[0]?.trim()}
                  <span className="vs">VS</span>
                  {event.teams?.[1] || event.match.split('-')[1]?.trim()}
                </h3>

                <div className="event-meta">
                  {event.country && (
                    <span className="meta-tag country">{event.country}</span>
                  )}
                  <span className="meta-tag sport">{event.sport}</span>
                </div>

                <div className={`event-channels ${selectedEvent === idx ? 'show' : ''}`}>
                  <div className="channels-label">AVAILABLE CHANNELS</div>
                  <div className="channels-grid">
                    {event.channels?.length ? (
                      event.channels.map((ch, i) => (
                        <Link
                          key={i}
                          to={`/watch?url=${encodeURIComponent(ch)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="channel-btn"
                        >
                          <span className="channel-icon">▶</span>
                          Stream {i + 1}
                        </Link>
                      ))
                    ) : (
                      <span className="no-channels">Unavailable</span>
                    )}
                  </div>
                </div>

                <div className="event-cta">
                  <span>{selectedEvent === idx ? 'HIDE' : 'VIEW CHANNELS'}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={selectedEvent === idx ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
                  </svg>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>
          <strong>EPICSPORT</strong> — Source: topembed.pw • Football filtered Europe • Basketball global
        </p>
      </footer>
      </div>
  )
}

export default App
