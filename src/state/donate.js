import api from '../lib/api'

export async function createDonationSession(amountCents) {
  const res = await api.post('/functions/v1/donate', { amount_cents: amountCents })
  return res.data.url
}
