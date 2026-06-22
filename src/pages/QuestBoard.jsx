import { useAuth } from '../state/AuthContext'

export default function QuestBoard() {
  const { user, logout } = useAuth()

  return (
    <div>
      <h1>QuestBoard</h1>
      <p>Logged in as {user?.email}</p>
      <button onClick={logout}>Log out</button>
    </div>
  )
}
