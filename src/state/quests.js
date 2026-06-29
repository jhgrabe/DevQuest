import api from '../lib/api'

const QUEST_FIELDS = 'id,title,description,topic,difficulty,language_id,estimated_minutes,starter_code,preamble,xp_reward'

export async function getQuests() {
  const res = await api.get(`/rest/v1/quests?select=${QUEST_FIELDS}&order=created_at.asc`)
  return res.data
}

export async function getQuest(id) {
  const res = await api.get(`/rest/v1/quests?select=${QUEST_FIELDS}&id=eq.${encodeURIComponent(id)}`)
  return res.data[0] ?? null
}
