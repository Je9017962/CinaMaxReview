import { useParams, Link, useNavigate } from 'react-router-dom'
import { getMovies, getReviewsByMovie } from './localStorage.js'
import { Header } from './MovieListPage.jsx'

export default function MovieDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const movies = getMovies()
  const movie = movies.find(m => String(m.id) === String(id))

  if (!movie) {
    return (
      <Shell>
        <div style={{ textAlign: 'center', padding: '80px 32px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
          <h2 style={{ color: 'var(--color-text)', marginBottom: 12 }}>Movie not found</h2>
          <Link to="/" style={{ color: 'var(--color-accent)' }}>← Back to all films</Link>
        </div>
      </Shell>
    )
  }

  const lsReviews = getReviewsByMovie(movie.id)
  const allReviews = [
    ...(movie.reviews || []),
    ...lsReviews.filter(lr => !(movie.reviews || []).some(r => r.user === lr.user && r.date === lr.date))
  ]
  const avgRating = allReviews.length
    ? (allReviews.reduce((s, r) => s + r.stars, 0) / allReviews.length).toFixed(1)
    : movie.rating?.toFixed(1) ?? '—'

  return (
    <Shell>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 32px 0' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: 14, fontFamily: 'monospace', padding: 0 }}>← Back</button>
      </div>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 32px 60px' }}>

        {/* Hero */}
        <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 32, position: 'relative', height: 300, backgroundColor: 'var(--color-card2)' }}>
          {movie.poster && <div style={{ width: '100%', height: '100%', backgroundImage: `url(${movie.poster})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,var(--color-bg) 0%,rgba(0,4,20,0.2) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 28, left: 32 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {(movie.genre || []).map(g => <span key={g} style={{ fontSize: 11, background: 'rgba(26,86,219,0.8)', borderRadius: 20, padding: '3px 12px', color: '#fff', fontFamily: 'monospace' }}>{g}</span>)}
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900, color: '#fff', fontFamily: 'Georgia, serif', lineHeight: 1.1, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{movie.title}</h1>
            <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{movie.year} · Directed by {movie.director}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { label: 'AVG RATING', value: `★ ${avgRating}`, gold: true },
            { label: 'REVIEWS',    value: allReviews.length },
            { label: 'YEAR',       value: movie.year },
          ].map(({ label, value, gold }) => (
            <div key={label} style={{ background: gold ? 'rgba(245,197,24,0.07)' : 'var(--color-card)', border: `1px solid ${gold ? 'rgba(245,197,24,0.2)' : 'var(--color-border)'}`, borderRadius: 12, padding: '12px 24px', textAlign: 'center', minWidth: 100 }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: gold ? 'var(--color-star)' : 'var(--color-text)', fontFamily: 'monospace' }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'monospace', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, fontSize: 16, marginBottom: 28, borderLeft: '3px solid var(--color-primary)', paddingLeft: 20 }}>{movie.synopsis}</p>

        <Link to={`/submit-review?movieId=${movie.id}`}>
          <button style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-deep))', border: 'none', borderRadius: 12, color: '#fff', padding: '13px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: 1, marginBottom: 40 }}>+ WRITE A REVIEW</button>
        </Link>

        {/* Reviews */}
        <h2 style={{ color: 'var(--color-text)', fontFamily: 'Georgia, serif', fontSize: 22, marginBottom: 20, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
          Reviews ({allReviews.length})
        </h2>
        {allReviews.length === 0
          ? <p style={{ color: 'var(--color-text-faint)', fontStyle: 'italic' }}>No reviews yet — be the first!</p>
          : allReviews.map((r, i) => (
            <div key={`${r.user}-${i}`} style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 18, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: `hsl(${(r.user||'?').charCodeAt(0)*20+200},60%,38%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                    {(r.user||'?')[0].toUpperCase()}
                  </div>
                  <span style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: 14 }}>{r.user}</span>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(n => <span key={n} style={{ fontSize: 16, color: n <= r.stars ? 'var(--color-star)' : 'var(--color-star-empty)' }}>★</span>)}
                </div>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.7, margin: '0 0 8px' }}>{r.text}</p>
              <div style={{ fontSize: 11, color: 'var(--color-text-faint)', fontFamily: 'monospace' }}>{r.date}</div>
            </div>
          ))
        }
      </div>
    </Shell>
  )
}

function Shell({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'Georgia, serif' }}>
      <Header />
      {children}
    </div>
  )
}
