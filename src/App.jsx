import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './state/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import QuestBoard from './pages/QuestBoard'
import Login from './pages/Login'
import Register from './pages/Register'
import Confirm from './pages/Confirm'
import QuestDetail from './pages/QuestDetail'
import Profile from './pages/Profile'
import ThankYou from './pages/ThankYou'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/thankyou" element={<ThankYou />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><QuestBoard /></ProtectedRoute>} />
        <Route path="/quest/:id" element={<ProtectedRoute><QuestDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}
