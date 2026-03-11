import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getMovies, addReview } from '../localStorage.js'

const B = { primary: '#1a56db', accent: '#38bdf8', heroGrad: '#0a0f1e', cardBg: '#0d1529' }

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
  padding: '12px 14px', color: '#fff', fontSize: 14,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}

export default function ReviewFormPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedId = searchParams.get('movieId')

  const movies = getMovies()

  const [form, setForm] = useState({
    movieId: preselectedId || '',
    username: '',
    stars: 0,
    text: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const setField = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setError('')
  }

  const handleStars = (s) => setForm(f => ({ ...f, stars: s }))

  const handleSubmit = () => {
    if (!form.movieId) { setError('Please select a movie.'); return }
    if (!form.username.trim()) { setError('Please enter your username.'); return }
    if (form.stars === 0) { setError('Please select a star rating.'); return }
    if (form.text.trim().length < 10) { setError('Review must be at least 10 characters.'); return }

    addReview({
      movieId: Number(form.movieId),
      user: form.username.trim(),
      stars: form.stars,
      text: form.text.trim(),
    })

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <PageShell>
        <div style={{ maxWidth: 560, margin: '80px auto', padding: '0 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🎬</div>
          <h2 style={{ color: '#eef2ff', fontFamily: 'Georgia, serif', fontSize: 28, marginBottom: 12 }}>Review Submitted!</h2>
          <p style={{ color: '#607090', marginBottom: 32 }}>Thanks for sharing your take, {form.username}.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/movie/${form.movieId}`}>
              <button style={btnStyle(true)}>VIEW MOVIE →</button>
            </Link>
            <Link to="/my-submissions">
              <button style={btnStyle(false)}>MY SUBMISSIONS</button>
            </Link>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '40px 32px 60px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#eef2ff', fontFamily: 'Georgia, serif', marginBottom: 8 }}>Write a Review</h1>
        <p style={{ color: '#3a5070', marginBottom: 32, fontSize: 14, fontFamily: 'monospace' }}>Share your honest take with the CinaMaxReview community.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Movie selector */}
          <Field label="MOVIE">
            <select value={form.movieId} onChange={setField('movieId')}
              style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
              <option value="">— Select a film —</option>
              {movies.map(m => (
                <option key={m.id} value={m.id}>{m.title} ({m.year})</option>
              ))}
            </select>
          </Field>

          {/* Username */}
          <Field label="YOUR USERNAME">
            <input value={form.username} onChange={setField('username')}
              placeholder="e.g. FilmCritic99" style={inputStyle} />
          </Field>

          {/* Stars */}
          <Field label="YOUR RATING">
            <div style={{ display: 'flex', gap: 8 }}>
              {[1,2,3,4,5].map(s => (
                <span key={s} onClick={() => handleStars(s)}
                  style={{ fontSize: 36, cursor: 'pointer', color: s <= form.stars ? '#F5C518' : '#2a3050', transition: 'color 0.15s', userSelect: 'none' }}>★</span>
              ))}
            </div>
          </Field>

          {/* Review text */}
          <Field label="YOUR REVIEW">
            <textarea value={form.text} onChange={setField('text')}
              placeholder="What did you think? Be specific and honest..."
              rows={6} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} />
          </Field>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(26,86,219,0.12)', border: '1px solid rgba(26,86,219,0.35)', color: B.accent, fontSize: 13, fontFamily: 'monospace' }}>
              ⚠ {error}
            </div>
          )}

          <button onClick={handleSubmit}
            style={{ ...btnStyle(true), alignSelf: 'flex-start', marginTop: 4 }}>
            SUBMIT REVIEW
          </button>
        </div>
      </div>
    </PageShell>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: '#4a6080', fontFamily: 'monospace', letterSpacing: 1, display: 'block', marginBottom: 8 }}>{label}</label>
      {children}
    </div>
  )
}

const btnStyle = (primary) => ({
  background: primary ? `linear-gradient(135deg,#1a56db,#1040b0)` : 'transparent',
  border: primary ? 'none' : '1px solid rgba(56,189,248,0.3)',
  borderRadius: 10, color: primary ? '#fff' : '#38bdf8',
  padding: '12px 28px', fontSize: 13, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'monospace', letterSpacing: 1,
})

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
