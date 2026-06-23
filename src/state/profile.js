import api from '../lib/api'

export async function getProfile(userId) {
  const res = await api.get(`/rest/v1/profiles?user_id=eq.${userId}&select=username,xp`)
  return res.data[0] ?? null
}

export async function getAllSubmissions(userId) {
  const res = await api.get(
    `/rest/v1/submissions?user_id=eq.${userId}&select=id,quest_id,status,created_at,quests(id,title)&order=created_at.desc&limit=50`,
  )
  return res.data
}
