import { useParams, Link, useNavigate } from 'react-router-dom'
import { getMovies, getReviewsByMovie } from '../localStorage.js'

const B = { primary: '#1a56db', accent: '#38bdf8', heroGrad: '#0a0f1e', cardBg: '#0d1529', cardBg2: '#111e3a' }

export default function MovieDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const movies = getMovies()
  const movie = movies.find(m => String(m.id) === String(id))

  if (!movie) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', padding: '80px 32px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
          <h2 style={{ color: '#eef2ff', marginBottom: 12 }}>Movie not found</h2>
          <Link to="/" style={{ color: B.accent }}>← Back to all films</Link>
        </div>
      </PageShell>
    )
  }

  // Merge localStorage reviews on top of embedded ones
  const lsReviews = getReviewsByMovie(movie.id)
  const allReviews = [
    ...(movie.reviews || []),
    ...lsReviews.filter(lr => !(movie.reviews || []).some(r => r.user === lr.user && r.date === lr.date))
  ]

  const avgRating = allReviews.length
    ? (allReviews.reduce((s, r) => s + r.stars, 0) / allReviews.length).toFixed(1)
    : movie.rating.toFixed(1)

  return (
    <PageShell>
      {/* Back */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 32px 0' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: B.accent, cursor: 'pointer', fontSize: 14, fontFamily: 'monospace', letterSpacing: 0.5, padding: 0 }}>
          ← Back
        </button>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 32px 60px' }}>

        {/* Hero poster + title */}
        <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 32, position: 'relative', height: 300, backgroundColor: B.cardBg2 }}>
          {movie.poster && <div style={{ width: '100%', height: '100%', backgroundImage: `url(${movie.poster})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,#0a0f1e 0%,rgba(0,4,20,0.3) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 28, left: 32 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {(movie.genre || []).map(g => (
                <span key={g} style={{ fontSize: 11, background: 'rgba(26,86,219,0.8)', borderRadius: 20, padding: '3px 12px', color: '#fff', fontFamily: 'monospace' }}>{g}</span>
              ))}
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900, color: '#fff', fontFamily: 'Georgia, serif', lineHeight: 1.1 }}>{movie.title}</h1>
            <div style={{ marginTop: 6, fontSize: 13, color: '#7090b0', fontFamily: 'monospace' }}>{movie.year} · Directed by {movie.director}</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <StatBox label="AVG RATING" value={`★ ${avgRating}`} gold />
          <StatBox label="REVIEWS" value={allReviews.length} />
          <StatBox label="YEAR" value={movie.year} />
        </div>

        {/* Synopsis */}
        <p style={{ color: '#8090b0', lineHeight: 1.8, fontSize: 16, marginBottom: 36, borderLeft: `3px solid rgba(26,86,219,0.4)`, paddingLeft: 20 }}>
          {movie.synopsis}
        </p>

        {/* CTA */}
        <Link to={`/submit-review?movieId=${movie.id}`}>
          <button style={{ background: `linear-gradient(135deg,${B.primary},#1040b0)`, border: 'none', borderRadius: 12, color: '#fff', padding: '13px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: 1, marginBottom: 40 }}>
            + WRITE A REVIEW
          </button>
        </Link>

        {/* Reviews */}
        <h2 style={{ color: '#eef2ff', fontFamily: 'Georgia, serif', fontSize: 22, marginBottom: 20, borderBottom: '1px solid rgba(56,189,248,0.1)', paddingBottom: 12 }}>
          Reviews ({allReviews.length})
        </h2>

        {allReviews.length === 0 ? (
          <p style={{ color: '#3a5070', fontStyle: 'italic' }}>No reviews yet — be the first!</p>
        ) : (
          allReviews.map((r, i) => (
            <div key={`${r.user}-${i}`} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(56,189,248,0.07)', borderRadius: 12, padding: 18, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: `hsl(${(r.user || '?').charCodeAt(0) * 20 + 200},60%,38%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                    {(r.user || '?')[0].toUpperCase()}
                  </div>
                  <span style={{ color: '#d0dff5', fontWeight: 600, fontSize: 14 }}>{r.user}</span>
                </div>
                <Stars value={r.stars} />
              </div>
              <p style={{ color: '#8090b0', fontSize: 14, lineHeight: 1.7, margin: '0 0 8px' }}>{r.text}</p>
              <div style={{ fontSize: 11, color: '#3a5070', fontFamily: 'monospace' }}>{r.date}</div>
            </div>
          ))
        )}
      </div>
    </PageShell>
  )
}

function StatBox({ label, value, gold }) {
  return (
    <div style={{ background: gold ? 'rgba(245,197,24,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${gold ? 'rgba(245,197,24,0.2)' : 'rgba(56,189,248,0.1)'}`, borderRadius: 12, padding: '12px 24px', textAlign: 'center', minWidth: 100 }}>
      <div style={{ fontSize: 26, fontWeight: 900, color: gold ? '#F5C518' : '#eef2ff', fontFamily: 'monospace' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#607090', fontFamily: 'monospace', marginTop: 2 }}>{label}</div>
    </div>
  )
}

function Stars({ value }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 16, color: s <= value ? '#F5C518' : '#2a3050' }}>★</span>)}
    </div>
  )
}

function PageShell({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#eef2ff', fontFamily: 'Georgia, serif' }}>
      <header style={{ padding: '0 32px', borderBottom: '1px solid rgba(56,189,248,0.08)', background: 'rgba(8,12,28,0.97)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <Link to="/" style={{ textDecoration: 'none', fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'Georgia, serif' }}>
            Cina<span style={{ color: '#38bdf8' }}>Max</span><span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, fontSize: 14 }}>Review</span>
          </Link>
          <nav style={{ display: 'flex', gap: 24 }}>
            {[['/', 'All Films'], ['/submit-review', 'Submit Review'], ['/my-submissions', 'My Submissions']].map(([to, label]) => (
              <Link key={to} to={to} style={{ color: '#3a6080', textDecoration: 'none', fontSize: 13, fontFamily: 'monospace' }}>{label}</Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  )
}
