import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ThemeToggle from './ThemeToggle.jsx'
import { getMovies, addReview } from './localStorage.js'
import s from './ReviewForm.module.css'

// Star labels shown beneath the rating
const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Outstanding']

// Per-field validation — returns an object of error strings
function validate(form) {
  const errors = {}
  if (!form.movieId)                        errors.movieId  = 'Please select a movie.'
  if (!form.username.trim())                errors.username = 'Username is required.'
  else if (form.username.trim().length < 2) errors.username = 'Username must be at least 2 characters.'
  if (form.stars === 0)                     errors.stars    = 'Please choose a star rating.'
  if (form.text.trim().length < 10)         errors.text     = 'Review must be at least 10 characters.'
  if (form.text.trim().length > 1000)       errors.text     = 'Review must be under 1000 characters.'
  return errors
}

export default function ReviewFormPage() {
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedId  = searchParams.get('movieId') || ''

  const movies = getMovies()

  const [form, setForm] = useState({
    movieId:  preselectedId,
    username: '',
    stars:    0,
    text:     '',
  })

  const [touched,   setTouched]   = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [hovered,   setHovered]   = useState(0)

  const errors  = validate(form)
  const isValid = Object.keys(errors).length === 0

  const touch    = (field) => () => setTouched(t => ({ ...t, [field]: true }))
  const setField = (k)     => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleStars = (n) => {
    setForm(f => ({ ...f, stars: n }))
    setTouched(t => ({ ...t, stars: true }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched({ movieId: true, username: true, stars: true, text: true })
    if (!isValid) return

    addReview({
      movieId: Number(form.movieId),
      user:    form.username.trim(),
      stars:   form.stars,
      text:    form.text.trim(),
    })

    setSubmitted(true)
    // Auto-redirect to the movie's detail page after 2.5 s
    setTimeout(() => navigate(`/movie/${form.movieId}`), 2500)
  }

  const charCount   = form.text.trim().length
  const charHintCls = charCount > 1000 ? s.limit : charCount > 800 ? s.warn : ''

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Shell>
        <div className={s.success}>
          <div className={s.successIcon}>🎬</div>
          <h2 className={s.successTitle}>Review Submitted!</h2>
          <p className={s.successSub}>
            Thanks, <strong>{form.username}</strong>. Redirecting you to the movie page…
          </p>
          <div className={s.successActions}>
            <Link to={`/movie/${form.movieId}`} className={s.btnPrimary}>VIEW MOVIE →</Link>
            <Link to="/my-submissions"          className={s.btnSecondary}>MY SUBMISSIONS</Link>
          </div>
        </div>
      </Shell>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <Shell>
      <div className={s.page}>
        <h1 className={s.pageTitle}>Write a Review</h1>
        <p className={s.pageSubtitle}>Share your honest take with the CinaMaxReview community.</p>

        <form className={s.form} onSubmit={handleSubmit} noValidate>

          {/* Movie selector */}
          <div className={s.field}>
            <label className={s.label} htmlFor="movieId">MOVIE</label>
            <select
              id="movieId"
              className={`${s.select} ${touched.movieId && errors.movieId ? s.hasError : ''}`}
              value={form.movieId}
              onChange={setField('movieId')}
              onBlur={touch('movieId')}
            >
              <option value="">— Select a film —</option>
              {movies.map(m => (
                <option key={m.id} value={m.id}>{m.title} ({m.year})</option>
              ))}
            </select>
            {touched.movieId && errors.movieId && <span className={s.fieldError}>{errors.movieId}</span>}
          </div>

          {/* Username */}
          <div className={s.field}>
            <label className={s.label} htmlFor="username">YOUR USERNAME</label>
            <input
              id="username"
              className={`${s.input} ${touched.username && errors.username ? s.hasError : ''}`}
              value={form.username}
              onChange={setField('username')}
              onBlur={touch('username')}
              placeholder="e.g. FilmCritic99"
              autoComplete="username"
            />
            {touched.username && errors.username && <span className={s.fieldError}>{errors.username}</span>}
          </div>

          <hr className={s.divider} />

          {/* Star rating */}
          <div className={s.field}>
            <label className={s.label}>YOUR RATING</label>
            <div className={s.stars}>
              {[1, 2, 3, 4, 5].map(n => (
                <span
                  key={n}
                  className={`${s.star} ${n <= (hovered || form.stars) ? s.active : ''}`}
                  onClick={() => handleStars(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  role="button"
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                >★</span>
              ))}
            </div>
            <div className={s.starLabel}>{STAR_LABELS[hovered || form.stars]}</div>
            {touched.stars && errors.stars && <span className={s.fieldError}>{errors.stars}</span>}
          </div>

          <hr className={s.divider} />

          {/* Review text */}
          <div className={s.field}>
            <label className={s.label} htmlFor="reviewText">YOUR REVIEW</label>
            <textarea
              id="reviewText"
              className={`${s.textarea} ${touched.text && errors.text ? s.hasError : ''}`}
              value={form.text}
              onChange={setField('text')}
              onBlur={touch('text')}
              placeholder="What did you think? Be specific and honest — no spoilers!"
              rows={6}
            />
            <div className={`${s.fieldHint} ${charHintCls}`}>{charCount} / 1000</div>
            {touched.text && errors.text && <span className={s.fieldError}>{errors.text}</span>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={s.submitBtn}
            disabled={Object.keys(touched).length > 0 && !isValid}
          >
            SUBMIT REVIEW
          </button>

        </form>
      </div>
    </Shell>
  )
}

function Shell({ children }) {
  return (
    <div className={s.shell}>
      <header className={s.header}>
        <div className={s.headerInner}>
          <Link to="/" className={s.logo}>
            Cina<span className={s.logoAccent}>Max</span>
            <span className={s.logoSub}>Review</span>
          </Link>
          <nav className={s.nav}>
            {[
              ['/',                'All Films'],
              ['/submit-review',  'Submit Review'],
              ['/my-submissions', 'My Submissions'],
            ].map(([to, label]) => (
              <Link key={to} to={to} className={s.navLink}>{label}</Link>
            ))}
            <ThemeToggle />
          </nav>
        </div>
      </header>
      {children}
    </div>
  )
}
