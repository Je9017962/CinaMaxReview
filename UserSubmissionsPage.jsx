import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getMovies, getReviews } from '../localStorage.js'

const B = { primary: '#1a56db', accent: '#38bdf8', heroGrad: '#0a0f1e', cardBg: '#0d1529' }

export default function UserSubmissionsPage() {
  const [username, setUsername] = useState('')
  const [searched, setSearched] = useState(false)

  const allMovies = getMovies()
  const allReviews = getReviews()

  // Also pull reviews embedded in movie objects (seeded data)
  const embeddedReviews = allMovies.flatMap(m =>
    (m.reviews || []).map(r => ({ ...r, movieId: m.id }))
  )

  const combined = [
    ...allReviews,
    ...embeddedReviews.filter(er =>
      !allReviews.some(r => r.user === er.user && r.movieId === er.movieId && r.date === er.date)
    )
  ]

  const userReviews = searched
    ? combined.filter(r => r.user?.toLowerCase() === username.trim().toLowerCase())
    : []

  const getMovie = (id) => allMovies.find(m => String(m.id) === String(id))

  return (
    <div style={{ minHeight: '100vh', background: B.heroGrad, color: '#eef2ff', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <header style={{ padding: '0 32px', borderBottom: '1px solid rgba(56,189,248,0.08)', background: 'rgba(8,12,28,0.97)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <Link to="/" style={{ textDecoration: 'none', fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'Georgia, serif' }}>
            Cina<span style={{ color: B.accent }}>Max</span><span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, fontSize: 14 }}>Review</span>
          </Link>
          <nav style={{ display: 'flex', gap: 24 }}>
            {[['/', 'All Films'], ['/submit-review', 'Submit Review'], ['/my-submissions', 'My Submissions']].map(([to, label]) => (
              <Link key={to} to={to} style={{ color: '#3a6080', textDecoration: 'none', fontSize: 13, fontFamily: 'monospace' }}>{label}</Link>
            ))}
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 32px 60px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, fontFamily: 'Georgia, serif', marginBottom: 8 }}>My Submissions</h1>
        <p style={{ color: '#3a5070', fontSize: 14, fontFamily: 'monospace', marginBottom: 36 }}>Enter your username to see all your reviews.</p>

        {/* Username lookup */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
          <input
            value={username}
            onChange={e => { setUsername(e.target.value); setSearched(false) }}
            onKeyDown={e => e.key === 'Enter' && setSearched(true)}
            placeholder="Enter your username…"
            style={{
              flex: 1, minWidth: 200,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none',
            }}
          />
          <button onClick={() => setSearched(true)}
            style={{ background: `linear-gradient(135deg,${B.primary},#1040b0)`, border: 'none', borderRadius: 10, color: '#fff', padding: '12px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', letterSpacing: 1 }}>
            LOOK UP
          </button>
        </div>

        {/* Results */}
        {searched && username.trim() && (
          <>
            {userReviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#2a4060' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🎬</div>
                <p style={{ fontSize: 16, marginBottom: 8 }}>No reviews found for <strong style={{ color: '#eef2ff' }}>{username}</strong></p>
                <p style={{ fontSize: 13, marginBottom: 24 }}>Double-check your username or write your first review!</p>
                <Link to="/submit-review">
                  <button style={{ background: `linear-gradient(135deg,${B.primary},#1040b0)`, border: 'none', borderRadius: 10, color: '#fff', padding: '11px 24px', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', letterSpacing: 1 }}>
                    WRITE A REVIEW
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: `hsl(${username.charCodeAt(0) * 20 + 200},60%,38%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>
                    {username[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{username}</div>
                    <div style={{ fontSize: 12, color: '#3a5070', fontFamily: 'monospace' }}>{userReviews.length} review{userReviews.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>

                {userReviews.map((r, i) => {
                  const movie = getMovie(r.movieId)
                  return (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(56,189,248,0.08)', borderRadius: 14, padding: 20, marginBottom: 14 }}>
                      {movie && (
                        <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none' }}>
                          <div style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'center' }}>
                            {movie.poster && (
                              <div style={{ width: 48, height: 64, borderRadius: 6, backgroundImage: `url(${movie.poster})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                            )}
                            <div>
                              <div style={{ fontSize: 16, fontWeight: 800, color: '#eef2ff', fontFamily: 'Georgia, serif' }}>{movie.title}</div>
                              <div style={{ fontSize: 12, color: '#4a6a8a', fontFamily: 'monospace' }}>{movie.year} · {movie.director}</div>
                            </div>
                          </div>
                        </Link>
                      )}
                      <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
                        {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 18, color: s <= r.stars ? '#F5C518' : '#2a3050' }}>★</span>)}
                      </div>
                      <p style={{ color: '#8090b0', fontSize: 14, lineHeight: 1.7, margin: '0 0 10px' }}>{r.text}</p>
                      <div style={{ fontSize: 11, color: '#3a5070', fontFamily: 'monospace' }}>{r.date}</div>
                    </div>
                  )
                })}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
