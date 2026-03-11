import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getMovies } from '../localStorage.js'
import ThemeToggle from '../ThemeToggle.jsx'

export default function MovieListPage() {
  const movies = getMovies()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const GENRES = ['All', 'Drama', 'Romance', 'Horror', 'Thriller', 'Comedy', 'Sci-Fi', 'Action', 'Animation', 'Adventure']

  const filtered = movies.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.director?.toLowerCase().includes(search.toLowerCase())
    const matchGenre = filter === 'All' || (m.genre || []).includes(filter)
    return matchSearch && matchGenre
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'Georgia, serif' }}>
      <Header />

      {/* Hero */}
      <div style={{ padding: '60px 32px 48px', textAlign: 'center', background: 'var(--color-bg-deep)', borderBottom: '1px solid var(--color-border)' }}>
        <h1 style={{ fontSize: 'clamp(32px,5vw,60px)', fontWeight: 900, margin: '0 0 12px', fontFamily: 'Georgia, serif', color: 'var(--color-text)' }}>
          What's Worth Watching?
        </h1>
        <p style={{ color: 'var(--color-text-faint)', fontSize: 16, maxWidth: 480, margin: '0 auto 28px' }}>
          Real reviews from real cinephiles. Discover, rate, and discuss the latest releases.
        </p>
        <Link to="/submit-review">
          <button style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-deep))', border: 'none', borderRadius: 10, color: '#fff', padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: 1 }}>
            + WRITE A REVIEW
          </button>
        </Link>

        {/* Search */}
        <div style={{ maxWidth: 480, margin: '28px auto 20px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)', fontSize: 16 }}>⌕</span>
          <input
            placeholder="Search films or directors…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: 'var(--color-input-bg)', border: '1px solid var(--color-input-border)', borderRadius: 14, padding: '14px 16px 14px 44px', color: 'var(--color-text)', fontSize: 15, outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        {/* Genre filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {GENRES.map(g => (
            <button key={g} onClick={() => setFilter(g)}
              style={{ background: filter === g ? 'linear-gradient(135deg,var(--color-primary),var(--color-primary-deep))' : 'var(--color-input-bg)', border: filter === g ? '1px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: 20, padding: '8px 18px', color: filter === g ? '#fff' : 'var(--color-text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', letterSpacing: 0.5 }}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px 60px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-faint)', padding: '80px 0', fontSize: 16 }}>
            No movies match your search. <Link to="/submit-review" style={{ color: 'var(--color-accent)' }}>Add the first review!</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 24 }}>
            {filtered.map(movie => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        )}
      </main>
    </div>
  )
}

function MovieCard({ movie }) {
  const avgRating = movie.reviews?.length
    ? (movie.reviews.reduce((s, r) => s + r.stars, 0) / movie.reviews.length).toFixed(1)
    : movie.rating?.toFixed(1) ?? '—'

  return (
    <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', height: '100%', boxShadow: 'var(--shadow-card)', transition: 'transform 0.25s, box-shadow 0.25s' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-card)' }}
      >
        <div style={{ height: 260, backgroundImage: `url(${movie.poster})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', backgroundColor: 'var(--color-card2)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,var(--color-card) 0%,transparent 60%)' }} />
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(26,86,219,0.88)', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>★ {avgRating}</div>
          <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(movie.genre || []).map(g => (
              <span key={g} style={{ fontSize: 11, background: 'rgba(255,255,255,0.15)', border: '1px solid var(--color-border-mid)', borderRadius: 20, padding: '2px 10px', color: 'var(--color-text)', fontFamily: 'monospace' }}>{g}</span>
            ))}
          </div>
        </div>
        <div style={{ padding: '14px 18px 18px' }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-meta)', fontFamily: 'monospace', marginBottom: 4 }}>{movie.year} · {movie.director}</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.2, marginBottom: 6, fontFamily: 'Georgia, serif' }}>{movie.title}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{movie.synopsis}</div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--color-text-faint)', fontFamily: 'monospace' }}>{(movie.reviews || []).length} review{(movie.reviews || []).length !== 1 ? 's' : ''}</div>
        </div>
      </div>
    </Link>
  )
}

export function Header() {
  return (
    <header style={{ padding: '0 32px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-header-bg)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        <Link to="/" style={{ textDecoration: 'none', fontSize: 22, fontWeight: 900, color: 'var(--color-text)', fontFamily: 'Georgia, serif' }}>
          Cina<span style={{ color: 'var(--color-accent)' }}>Max</span>
          <span style={{ color: 'var(--color-text-faint)', fontWeight: 400, fontSize: 14 }}>Review</span>
        </Link>
        <nav style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {[['/', 'All Films'], ['/submit-review', 'Submit Review'], ['/my-submissions', 'My Submissions']].map(([to, label]) => (
            <Link key={to} to={to} style={{ color: 'var(--color-text-faint)', textDecoration: 'none', fontSize: 13, fontFamily: 'monospace', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-faint)'}
            >{label}</Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
