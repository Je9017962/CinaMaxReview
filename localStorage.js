// ─── Keys ─────────────────────────────────────────────────────────────────────
const MOVIES_KEY  = 'cinamax_movies'
const REVIEWS_KEY = 'cinamax_reviews'
const USERS_KEY   = 'cinamax_users'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const load = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const loadObj = (key) => load(key, {})

const save = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`Failed to save ${key}:`, e)
  }
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_MOVIES = [
  {
    id: 1, title: 'Dune: Part Two', year: 2024,
    director: 'Denis Villeneuve', genre: ['Sci-Fi', 'Adventure'],
    synopsis: 'Paul Atreides unites with Chani and the Fremen to seek revenge against the conspirators who destroyed his family.',
    poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    userAdded: false,
  },
  {
    id: 2, title: 'Oppenheimer', year: 2023,
    director: 'Christopher Nolan', genre: ['Drama', 'Thriller'],
    synopsis: 'The story of J. Robert Oppenheimer\'s role in the development of the atomic bomb during World War II.',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    userAdded: false,
  },
  {
    id: 3, title: 'Poor Things', year: 2023,
    director: 'Yorgos Lanthimos', genre: ['Drama', 'Romance'],
    synopsis: 'The incredible tale of Bella Baxter, a young woman brought back to life by an eccentric scientist.',
    poster: 'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXExtvSD0ogg4QV.jpg',
    userAdded: false,
  },
  {
    id: 4, title: 'Past Lives', year: 2023,
    director: 'Celine Song', genre: ['Drama', 'Romance'],
    synopsis: 'Two childhood friends reunite in New York City after 20 years apart, examining destiny, choice, and love.',
    poster: 'https://image.tmdb.org/t/p/w500/k3waqVXsnaHb02LT7RIkaODLKDjp.jpg',
    userAdded: false,
  },
  {
    id: 5, title: 'Killers of the Flower Moon', year: 2023,
    director: 'Martin Scorsese', genre: ['Drama', 'Thriller'],
    synopsis: 'Members of the Osage Nation are murdered under mysterious circumstances, sparking the birth of the FBI.',
    poster: 'https://image.tmdb.org/t/p/w500/dB6J5zsSXPmMEHLKAkjV3bFSSgB.jpg',
    userAdded: false,
  },
  {
    id: 6, title: 'The Holdovers', year: 2023,
    director: 'Alexander Payne', genre: ['Drama', 'Comedy'],
    synopsis: 'A curmudgeonly instructor is forced to stay on campus over the holidays with a troublemaker student and a grieving cook.',
    poster: 'https://image.tmdb.org/t/p/w500/VHSzNBTwxV8vh7wylo7O9CLdgbA.jpg',
    userAdded: false,
  },
  {
    id: 7, title: 'Saltburn', year: 2023,
    director: 'Emerald Fennell', genre: ['Drama', 'Thriller'],
    synopsis: 'A student at Oxford University finds himself drawn into the world of a charming and aristocratic classmate.',
    poster: 'https://image.tmdb.org/t/p/w500/qjhahNLSZ705B5JP92YMEYPocPz.jpg',
    userAdded: false,
  },
  {
    id: 8, title: 'The Zone of Interest', year: 2023,
    director: 'Jonathan Glazer', genre: ['Drama'],
    synopsis: 'The commandant of Auschwitz and his wife attempt to build a dream life next to the camp.',
    poster: 'https://image.tmdb.org/t/p/w500/hUe8p3s8P7oKULHBYKORDGFpxqb.jpg',
    userAdded: false,
  },
]

// ─── Movies ───────────────────────────────────────────────────────────────────

/** Return all movies. Seeds defaults if store is empty. */
export const getMovies = () => {
  const stored = load(MOVIES_KEY)
  if (stored.length === 0) {
    save(MOVIES_KEY, SEED_MOVIES)
    return SEED_MOVIES
  }
  return stored
}

/**
 * Add a user-submitted movie.
 * Required: { title, year, director, genre[], synopsis, poster? }
 */
export const addMovie = (movie) => {
  const movies = load(MOVIES_KEY)
  const newMovie = {
    ...movie,
    id: Date.now(),
    poster: movie.poster || '',
    userAdded: true,
    addedBy: movie.addedBy || 'Guest',
    addedAt: new Date().toISOString(),
  }
  save(MOVIES_KEY, [...movies, newMovie])
  return newMovie
}

/** Merge updatedFields into the movie matching id. */
export const updateMovie = (id, updatedFields) => {
  const movies = load(MOVIES_KEY).map((m) =>
    m.id === id ? { ...m, ...updatedFields } : m
  )
  save(MOVIES_KEY, movies)
}

/** Remove a movie and all its reviews. */
export const deleteMovie = (id) => {
  save(MOVIES_KEY, load(MOVIES_KEY).filter((m) => m.id !== id))
  save(REVIEWS_KEY, load(REVIEWS_KEY).filter((r) => r.movieId !== id))
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

/** Return all reviews. */
export const getReviews = () => load(REVIEWS_KEY)

/** Return reviews for a specific movieId. */
export const getReviewsByMovie = (movieId) =>
  load(REVIEWS_KEY).filter((r) => String(r.movieId) === String(movieId))

/**
 * Add a review.
 * Required: { movieId, stars, text }
 * Optional: { user } — if omitted or empty, stored as 'Guest'
 */
export const addReview = (review) => {
  const reviews = load(REVIEWS_KEY)
  const newReview = {
    ...review,
    id: Date.now(),
    // If no user supplied, mark as Guest
    user: review.user?.trim() || 'Guest',
    isGuest: !review.user?.trim(),
    date: new Date().toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }),
  }
  save(REVIEWS_KEY, [...reviews, newReview])
  return newReview
}

/** Update stars and/or text of an existing review. */
export const updateReview = (id, updatedFields) => {
  save(
    REVIEWS_KEY,
    load(REVIEWS_KEY).map((r) => (r.id === id ? { ...r, ...updatedFields } : r))
  )
}

/** Delete a review by id. */
export const deleteReview = (id) => {
  save(REVIEWS_KEY, load(REVIEWS_KEY).filter((r) => r.id !== id))
}

// ─── Users (profile data) ─────────────────────────────────────────────────────

/** Load the user store object. */
export const getUsers = () => loadObj(USERS_KEY)

/**
 * Update profile fields for a user.
 * Allowed fields: { bio, avatarEmoji, displayName }
 */
export const updateUserProfile = (username, fields) => {
  const users = loadObj(USERS_KEY)
  if (!users[username]) return
  users[username] = { ...users[username], ...fields }
  save(USERS_KEY, users)
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Wipe all app data (useful for dev/testing). */
export const clearAll = () => {
  localStorage.removeItem(MOVIES_KEY)
  localStorage.removeItem(REVIEWS_KEY)
}
