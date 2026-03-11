import { Link } from 'react-router-dom'
import { getMovies } from '../localStorage.js'

const B = {
  primary: '#1a56db', accent: '#38bdf8',
  heroGrad: '#0a0f1e', cardBg: '#0d1529', cardBg2: '#111e3a',
}

export default function MovieListPage() {
  const movies = getMovies()

  return (
    <div style={{ minHeight: '100vh', background: B.heroGrad, color: '#eef2ff', fontFamily: 'Georgia, serif' }}>

      {/* Header */}
      <header style={{ padding: '0 32px', borderBottom: '1px solid rgba(56,189,248,0.08)', background: 'rgba(8,12,28,0.97)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'Georgia, serif' }}>
              Cina<span style={{ color: B.accent }}>Max</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, fontSize: 14 }}>Review</span>
            </span>
          </Link>
          <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <NavLink to="/submit-review">Submit Review</NavLink>
            <NavLink to="/my-submissions">My Submissions</NavLink>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div style={{ padding: '60px 32px 48px', textAlign: 'center', background: 'linear-gradient(160deg,#080f24 0%,#0a0f1e 65%)', borderBottom: '1px solid rgba(26,86,219,0.2)' }}>
        <h1 style={{ fontSize: 'clamp(32px,5vw,60px)', fontWeight: 900, margin: '0 0 12px', fontFamily: 'Georgia, serif', background: `linear-gradient(135deg,#fff 30%,${B.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          What's Worth Watching?
        </h1>
        <p style={{ color: '#3a5070', fontSize: 16, maxWidth: 480, margin: '0 auto 28px' }}>
          Real reviews from real cinephiles. Discover, rate, and discuss the latest releases.
        </p>
        <Link to="/submit-review">
          <button style={{ background: `linear-gradient(135deg,${B.primary},#1040b0)`, border: 'none', borderRadius: 10, color: '#fff', padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: 1 }}>
            + WRITE A REVIEW
          </button>
        </Link>
      </div>

      {/* Movie Grid */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px 60px' }}>
        {movies.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#2a4060', padding: '80px 0', fontSize: 16 }}>
            No movies yet. <Link to="/submit-review" style={{ color: B.accent }}>Add the first review!</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 24 }}>
            {movies.map(movie => (
              <Link key={movie.id} to={`/movie/${movie.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: `linear-gradient(160deg,${B.cardBg},${B.cardBg2})`,
                  border: '1px solid rgba(56,189,248,0.08)', borderRadius: 16,
                  overflow: 'hidden', cursor: 'pointer', height: '100%',
                  transition: 'transform 0.25s, box-shadow 0.25s',
                  boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(26,86,219,0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 30px rgba(0,0,0,0.5)' }}
                >
                  {/* Poster */}
                  <div style={{ height: 260, backgroundImage: `url(${movie.poster})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', backgroundColor: B.cardBg2 }}>
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top,${B.cardBg} 0%,transparent 60%)` }} />
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(26,86,219,0.88)', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                      ★ {movie.rating.toFixed(1)}
                    </div>
                    <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(movie.genre || []).map(g => (
                        <span key={g} style={{ fontSize: 11, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 20, padding: '2px 10px', color: '#aac8e8', fontFamily: 'monospace' }}>{g}</span>
                      ))}
                    </div>
                  </div>
                  {/* Info */}
                  <div style={{ padding: '14px 18px 18px' }}>
                    <div style={{ fontSize: 11, color: '#4a6a8a', fontFamily: 'monospace', marginBottom: 4 }}>{movie.year} · {movie.director}</div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: '#eef2ff', lineHeight: 1.2, marginBottom: 6, fontFamily: 'Georgia, serif' }}>{movie.title}</div>
                    <div style={{ fontSize: 13, color: '#607090', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{movie.synopsis}</div>
                    <div style={{ marginTop: 10, fontSize: 12, color: '#3a5070', fontFamily: 'monospace' }}>{(movie.reviews || []).length} review{(movie.reviews || []).length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function NavLink({ to, children }) {
  return (
    <Link to={to} style={{ color: '#3a6080', textDecoration: 'none', fontSize: 13, fontFamily: 'monospace', letterSpacing: 1, transition: 'color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
      onMouseLeave={e => e.currentTarget.style.color = '#3a6080'}
    >{children}</Link>
  )
}
