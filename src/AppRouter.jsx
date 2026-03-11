import { Routes, Route } from 'react-router-dom'
import MovieListPage from './MovieListPage.jsx'
import MovieDetailPage from './MovieDetailPage.jsx'
import ReviewFormPage from './ReviewFormPage.jsx'
import UserSubmissionsPage from './UserSubmissionsPage.jsx'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/"                 element={<MovieListPage />} />
      <Route path="/movie/:id"        element={<MovieDetailPage />} />
      <Route path="/submit-review"    element={<ReviewFormPage />} />
      <Route path="/my-submissions"   element={<UserSubmissionsPage />} />
    </Routes>
  )
}
