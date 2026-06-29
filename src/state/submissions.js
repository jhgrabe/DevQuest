import api from '../lib/api'

const SUB_FIELDS = 'id,status,source_code,stdout,stderr,hint,created_at,updated_at'

export async function createSubmission({ userId, questId, sourceCode, languageId }) {
  const res = await api.post(
    '/rest/v1/submissions',
    { user_id: userId, quest_id: questId, source_code: sourceCode, language_id: languageId },
    { headers: { Prefer: 'return=representation' } },
  )
  return res.data[0]
}

export async function getSubmissions(questId) {
  const res = await api.get(
    `/rest/v1/submissions?quest_id=eq.${encodeURIComponent(questId)}&select=${SUB_FIELDS}&order=created_at.desc`,
  )
  return res.data
}

export async function updateSubmission(id, { sourceCode }) {
  const res = await api.patch(
    `/rest/v1/submissions?id=eq.${encodeURIComponent(id)}`,
    { source_code: sourceCode, status: 'pending', stdout: null, stderr: null },
    { headers: { Prefer: 'return=representation' } },
  )
  return res.data[0]
}

export async function deleteSubmission(id) {
  await api.delete(`/rest/v1/submissions?id=eq.${encodeURIComponent(id)}`)
}

export async function executeSubmission(questId, submissionId, sourceCode, refine = false) {
  const res = await api.post('/functions/v1/execute', {
    quest_id: questId,
    submission_id: submissionId,
    source_code: sourceCode,
    ...(refine ? { refine: true } : {}),
  })
  return res.data
}

export async function getCompletedQuestIds(userId) {
  const res = await api.get(
    `/rest/v1/submissions?user_id=eq.${encodeURIComponent(userId)}&status=eq.passed&select=quest_id`,
  )
  return new Set(res.data.map(s => s.quest_id))
}

export async function getHint(submissionId, questId, sourceCode, stderr) {
  const res = await api.post('/functions/v1/hint', {
    submission_id: submissionId,
    quest_id: questId,
    source_code: sourceCode,
    stderr: stderr ?? '',
  })
  return res.data.hint
}
