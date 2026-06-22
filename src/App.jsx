import { Routes, Route } from 'react-router-dom'
import QuestBoard from './pages/QuestBoard'
import Login from './pages/Login'
import Register from './pages/Register'
import Confirm from './pages/Confirm'
import QuestDetail from './pages/QuestDetail'
import Profile from './pages/Profile'
import ThankYou from './pages/ThankYou'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<QuestBoard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/confirm" element={<Confirm />} />
      <Route path="/quest/:id" element={<QuestDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/thankyou" element={<ThankYou />} />
    </Routes>
  )
}
