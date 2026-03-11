const SAMPLE_MOVIES = [
  {
    id: 1, title: "Hamnet", year: 2026, genre: ["Drama", "Romance"],
    director: "Chloé Zhao",
    poster: "https://picsum.photos/seed/hamnet2026/400/600",
    synopsis: "From Academy Award-winning director Chloé Zhao, this lyrical adaptation of Maggie O'Farrell's novel follows Agnes (Jessie Buckley) and William Shakespeare (Paul Mescal) as they grapple with the devastating loss of their son to plague in 16th-century England — and how that grief quietly forged the greatest play ever written.",
    rating: 4.3,
    reviews: [
      { user: "FilmCritic99", stars: 5, text: "Jessie Buckley is thunderous. One of those rare performances that simply beggars belief. A film to shatter you.", date: "Jan 12, 2026" },
      { user: "CinemaLover", stars: 4, text: "Slow to start, but the final act is absolutely devastating. Zhao at her most poetic.", date: "Jan 18, 2026" },
    ],
  },
  {
    id: 2, title: "28 Years Later: The Bone Temple", year: 2026, genre: ["Horror", "Thriller"],
    director: "Nia DaCosta",
    poster: "https://picsum.photos/seed/28yearslater/400/600",
    synopsis: "The third chapter in Danny Boyle's landmark rage-virus saga. Director Nia DaCosta and writer Alex Garland take the series in a bolder, darker direction as Ralph Fiennes anchors a story of survival in a still-quarantined Britain — funnier, more stylish, and just as haunting as its predecessors.",
    rating: 4.1,
    reviews: [
      { user: "OceanDreamer", stars: 4, text: "DaCosta absolutely delivers. Fiennes is astonishing and the film finds new angles in a story I thought was exhausted.", date: "Jan 20, 2026" },
    ],
  },
  {
    id: 3, title: "Send Help", year: 2026, genre: ["Thriller", "Comedy"],
    director: "Sam Raimi",
    poster: "https://picsum.photos/seed/sendhelp2026/400/600",
    synopsis: "Sam Raimi returns to gleeful mayhem with this darkly comedic survival thriller. Two colleagues — a nightmare boss and a fed-up employee — are the sole survivors of a plane crash on a deserted island, forced to set aside their war to stay alive. Rachel McAdams and Dylan O'Brien are magnetic together.",
    rating: 3.8,
    reviews: [
      { user: "AnimeFan2026", stars: 4, text: "McAdams and O'Brien have insane chemistry. Raimi chaos, sharp script — genuinely one of January's best surprises.", date: "Jan 10, 2026" },
      { user: "KidAtHeart", stars: 3, text: "Fun for two thirds, then the third act goes completely off the rails. Still worth a watch.", date: "Jan 15, 2026" },
    ],
  },
  {
    id: 4, title: "The Bride!", year: 2026, genre: ["Horror", "Drama"],
    director: "Maggie Gyllenhaal",
    poster: "https://picsum.photos/seed/thebride2026/400/600",
    synopsis: "Maggie Gyllenhaal reimagines the classic Bride of Frankenstein through a radical feminist lens. Set in 1930s Chicago, a murdered young woman (Jessie Buckley) is reborn at the hands of Dr. Frankenstein (Christian Bale) — and quickly becomes not just a companion, but the catalyst for a social revolution.",
    rating: 3.1,
    reviews: [],
  },
]

const LS_REVIEWS_KEY = 'cinamax_reviews'

function loadReviews() {
  try {
    return JSON.parse(localStorage.getItem(LS_REVIEWS_KEY)) || []
  } catch {
    return []
  }
}

function saveReviews(reviews) {
  localStorage.setItem(LS_REVIEWS_KEY, JSON.stringify(reviews))
}

export function getMovies() {
  return SAMPLE_MOVIES
}

export function getReviews() {
  return loadReviews()
}

export function getReviewsByMovie(movieId) {
  return loadReviews().filter(r => String(r.movieId) === String(movieId))
}

export function addReview({ movieId, user, stars, text }) {
  const reviews = loadReviews()
  const review = {
    id: Date.now(),
    movieId,
    user,
    stars,
    text,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }
  reviews.push(review)
  saveReviews(reviews)
  return review
}

export function updateReview(id, updates) {
  const reviews = loadReviews()
  const idx = reviews.findIndex(r => r.id === id)
  if (idx !== -1) {
    reviews[idx] = { ...reviews[idx], ...updates }
    saveReviews(reviews)
  }
}

export function deleteReview(id) {
  const reviews = loadReviews().filter(r => r.id !== id)
  saveReviews(reviews)
}
