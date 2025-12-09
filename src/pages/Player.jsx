import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import './Player.css'

function Player() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [interactionEnabled, setInteractionEnabled] = useState(false)

  // Get the stream URL from query params
  const streamUrl = searchParams.get('url') || ''

  // Extract channel name from URL for display
  const getChannelName = (url) => {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      return pathParts[pathParts.length - 1] || 'Unknown Channel'
    } catch {
      return 'Live Stream'
    }
  }

  const channelName = getChannelName(streamUrl)

  if (!streamUrl) {
    return (
      <div className="player-page">
        <div className="player-topbar">
          <button className="back-btn" onClick={() => navigate('/')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            BACK TO HOME
          </button>
          <div className="player-logo">
            <span className="logo-mark">E</span>
            <strong>EPICSPORT</strong>
          </div>
          <div />
        </div>
        <div className="player-error">
          <div className="error-icon">📺</div>
          <h2>No Stream Selected</h2>
          <p>Please select a stream from the home page</p>
          <button className="back-home-btn" onClick={() => navigate('/')}>
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="player-page">
      <div className="player-topbar">
        <button className="back-btn" onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          BACK TO HOME
        </button>
        <div className="player-logo">
          <span className="logo-mark">E</span>
          <strong>EPICSPORT</strong>
        </div>
        <div className="player-info">
          <span className="live-indicator">
            <span className="live-dot" />
            LIVE
          </span>
        </div>
      </div>

      <div className="adblock-notice">
        <span className="adblock-icon"></span>
        <span className="adblock-text">For a better experience, use an ad-blocker like <strong>uBlock Origin</strong></span>
      </div>

      <div className={`player-container ${interactionEnabled ? 'interactive' : ''}`}>
        <iframe
          src={streamUrl}
          title="Live Stream"
          allowFullScreen
          allow="autoplay; encrypted-media"
          referrerPolicy="unsafe-url"
        />
        {/* Blocker overlay - prevents clicks when not in interactive mode */}
        {!interactionEnabled && <div className="iframe-blocker" />}

        <div className="player-controls">
          <button
            className={`toggle-interaction ${interactionEnabled ? 'active' : ''}`}
            onClick={() => setInteractionEnabled(!interactionEnabled)}
          >
            {interactionEnabled ? '🔓 INTERACTION ON (click to lock)' : '🔒 UNLOCK TO UNMUTE'}
          </button>

          <a
            href={streamUrl}
            target="_blank"
            rel="noopener"
            className="open-external-btn"
          >
            ↗ NEW TAB
          </a>
        </div>

        {!interactionEnabled && (
          <div className="blocked-notice">
            <span> Protected mode - Click "UNLOCK" to interact with player</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Player
