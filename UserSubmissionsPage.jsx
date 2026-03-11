import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getMovies, getReviews, updateReview, deleteReview } from '../localStorage.js'
import ThemeToggle from '../ThemeToggle.jsx'
import s from './UserSubmissions.module.css'

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Outstanding']

// Stable avatar color from username
const avatarColor = (name) =>
  `hsl(${((name || '?').charCodeAt(0) * 20 + 200) % 360},60%,38%)`

export default function UserSubmissionsPage() {
  const [username,  setUsername]  = useState('')
  const [searched,  setSearched]  = useState(false)
  const [reviews,   setReviews]   = useState([])
  const [editing,   setEditing]   = useState(null)   // review id being edited
  const [deleting,  setDeleting]  = useState(null)   // review id awaiting confirm
  const [toast,     setToast]     = useState('')     // success message

  const allMovies = getMovies()
  const movieById = (id) => allMovies.find(m => String(m.id) === String(id))

  // Merge standalone reviews + reviews embedded in movie objects
  const getAllUserReviews = useCallback((user) => {
    const lsReviews = getReviews().filter(
      r => r.user?.toLowerCase() === user.toLowerCase()
    )
    const embedded = allMovies
      .flatMap(m => (m.reviews || []).map(r => ({ ...r, movieId: m.id })))
      .filter(r =>
        r.user?.toLowerCase() === user.toLowerCase() &&
        !lsReviews.some(lr => lr.movieId === r.movieId && lr.date === r.date)
      )
    return [...lsReviews, ...embedded]
  }, [allMovies])

  const handleSearch = () => {
    if (!username.trim()) return
    setReviews(getAllUserReviews(username.trim()))
    setSearched(true)
    setEditing(null)
    setDeleting(null)
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  const confirmDelete = (id) => {
    deleteReview(id)
    setReviews(prev => prev.filter(r => r.id !== id))
    setDeleting(null)
    showToast('Review deleted.')
  }

  // ── Edit ────────────────────────────────────────────────────────────────────
  const handleSave = (id, stars, text) => {
    updateReview(id, { stars, text })
    setReviews(prev => prev.map(r => r.id === id ? { ...r, stars, text } : r))
    setEditing(null)
    showToast('Review updated!')
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={s.shell}>

      {/* Header */}
      <header className={s.header}>
        <div className={s.headerInner}>
          <Link to="/" className={s.logo}>
            Cina<span className={s.logoAccent}>Max</span>
            <span className={s.logoSub}>Review</span>
          </Link>
          <nav className={s.nav}>
            {[['/', 'All Films'], ['/submit-review', 'Submit Review'], ['/my-submissions', 'My Submissions']]
              .map(([to, label]) => <Link key={to} to={to} className={s.navLink}>{label}</Link>)}
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <div className={s.page}>
        <h1 className={s.pageTitle}>My Submissions</h1>
        <p className={s.pageSubtitle}>Enter your username to view, edit, or delete your reviews.</p>

        {/* Username lookup */}
        <div className={s.lookup}>
          <input
            className={s.lookupInput}
            value={username}
            onChange={e => { setUsername(e.target.value); setSearched(false) }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Enter your username…"
          />
          <button className={s.lookupBtn} onClick={handleSearch}>LOOK UP</button>
        </div>

        {/* Results */}
        {searched && username.trim() && (
          reviews.length === 0 ? (
            <div className={s.empty}>
              <div className={s.emptyIcon}>🎬</div>
              <h3 className={s.emptyTitle}>No reviews found for "{username}"</h3>
              <p className={s.emptyText}>Double-check your username or write your first review!</p>
              <Link to="/submit-review" className={s.writeBtn}>WRITE A REVIEW</Link>
            </div>
          ) : (
            <>
              {/* User profile strip */}
              <div className={s.profile}>
                <div className={s.avatar} style={{ background: avatarColor(username) }}>
                  {username[0].toUpperCase()}
                </div>
                <div>
                  <div className={s.profileName}>{username}</div>
                  <div className={s.profileMeta}>
                    {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Review cards */}
              <div className={s.list}>
                {reviews.map(review => (
                  <ReviewCard
                    key={review.id ?? `${review.movieId}-${review.date}`}
                    review={review}
                    movie={movieById(review.movieId)}
                    isEditing={editing === review.id}
                    isDeleting={deleting === review.id}
                    onEdit={() => setEditing(review.id)}
                    onCancelEdit={() => setEditing(null)}
                    onSave={(stars, text) => handleSave(review.id, stars, text)}
                    onDelete={() => setDeleting(review.id)}
                    onCancelDelete={() => setDeleting(null)}
                    onConfirmDelete={() => confirmDelete(review.id)}
                    // Embedded seed reviews don't have an id — disable edit/delete for those
                    canMutate={!!review.id}
                  />
                ))}
              </div>
            </>
          )
        )}
      </div>

      {/* Toast */}
      {toast && <div className={s.toast}>✓ {toast}</div>}
    </div>
  )
}

// ── ReviewCard ────────────────────────────────────────────────────────────────
function ReviewCard({ review, movie, isEditing, isDeleting, onEdit, onCancelEdit, onSave, onDelete, onCancelDelete, onConfirmDelete, canMutate }) {

  const [editStars,   setEditStars]   = useState(review.stars)
  const [editText,    setEditText]    = useState(review.text)
  const [editHovered, setEditHovered] = useState(0)
  const [editError,   setEditError]   = useState('')

  // Reset edit state when opened
  const handleOpenEdit = () => {
    setEditStars(review.stars)
    setEditText(review.text)
    setEditError('')
    onEdit()
  }

  const handleSave = () => {
    if (editStars === 0)              { setEditError('Please choose a rating.'); return }
    if (editText.trim().length < 10)  { setEditError('Review must be at least 10 characters.'); return }
    if (editText.trim().length > 1000){ setEditError('Review must be under 1000 characters.'); return }
    onSave(editStars, editText.trim())
  }

  const charCount   = editText.trim().length
  const charHintCls = charCount > 1000 ? s.limit : charCount > 800 ? s.warn : ''

  return (
    <div className={s.card}>

      {/* Card header: movie info + action buttons */}
      <div className={s.cardHeader}>
        <div className={s.movieInfo}>
          {movie?.poster && (
            <div
              className={s.poster}
              style={{ backgroundImage: `url(${movie.poster})` }}
            />
          )}
          <div>
            {movie
              ? <Link to={`/movie/${movie.id}`} className={s.movieTitle}>{movie.title}</Link>
              : <span className={s.movieTitle}>Unknown Movie</span>
            }
            {movie && (
              <div className={s.movieMeta}>{movie.year} · {movie.director}</div>
            )}
          </div>
        </div>

        {canMutate && !isEditing && !isDeleting && (
          <div className={s.actions}>
            <button className={s.editBtn}   onClick={handleOpenEdit}>Edit</button>
            <button className={s.deleteBtn} onClick={onDelete}>Delete</button>
          </div>
        )}
      </div>

      {/* Star display */}
      {!isEditing && (
        <>
          <div className={s.stars}>
            {[1,2,3,4,5].map(n => (
              <span key={n} className={`${s.star} ${n <= review.stars ? s.active : ''}`}>★</span>
            ))}
          </div>
          <p className={s.reviewText}>{review.text}</p>
          <div className={s.reviewDate}>{review.date}</div>
        </>
      )}

      {/* Inline edit form */}
      {isEditing && (
        <div className={s.editForm}>
          <div>
            <div className={s.editStars}>
              {[1,2,3,4,5].map(n => (
                <span
                  key={n}
                  className={`${s.editStar} ${n <= (editHovered || editStars) ? s.active : ''}`}
                  onClick={() => setEditStars(n)}
                  onMouseEnter={() => setEditHovered(n)}
                  onMouseLeave={() => setEditHovered(0)}
                >★</span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#3a5070', fontFamily: 'monospace', marginTop: 4 }}>
              {STAR_LABELS[editHovered || editStars]}
            </div>
          </div>

          <div>
            <textarea
              className={s.editTextarea}
              value={editText}
              onChange={e => { setEditText(e.target.value); setEditError('') }}
              rows={4}
            />
            <div className={`${s.editHint} ${charHintCls}`}>{charCount} / 1000</div>
            {editError && <div className={s.editError}>{editError}</div>}
          </div>

          <div className={s.editActions}>
            <button className={s.saveBtn} onClick={handleSave}>SAVE CHANGES</button>
            <button className={s.cancelBtn} onClick={onCancelEdit}>Cancel</button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {isDeleting && (
        <div className={s.deleteConfirm}>
          <span>Are you sure you want to delete this review?</span>
          <button className={s.confirmYes} onClick={onConfirmDelete}>Yes, delete</button>
          <button className={s.confirmNo}  onClick={onCancelDelete}>Cancel</button>
        </div>
      )}
    </div>
  )
}
