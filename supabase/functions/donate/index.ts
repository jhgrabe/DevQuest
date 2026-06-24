import { getCorsHeaders, handleCors } from '../_shared/cors.ts'
import { requireAuth } from '../_shared/auth.ts'

Deno.serve(async (req: Request) => {
  const corsRes = handleCors(req)
  if (corsRes) return corsRes

  const ch = getCorsHeaders(req)

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...ch },
    })
  }

  try {
    await requireAuth(req)

    const body = await req.json().catch(() => null)
    if (!body) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...ch },
      })
    }

    const { amount_cents } = body
    if (!amount_cents || typeof amount_cents !== 'number' || amount_cents < 100) {
      return new Response(
        JSON.stringify({ error: 'amount_cents must be a number >= 100' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...ch } },
      )
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!
    const frontendUrl = Deno.env.get('FRONTEND_URL')!

    const params = new URLSearchParams()
    params.set('mode', 'payment')
    params.set('payment_method_types[]', 'card')
    params.set('line_items[0][price_data][currency]', 'usd')
    params.set('line_items[0][price_data][product_data][name]', 'Support DevQuest')
    params.set(
      'line_items[0][price_data][product_data][description]',
      'Help keep DevQuest running and support future quests.',
    )
    params.set('line_items[0][price_data][unit_amount]', String(amount_cents))
    params.set('line_items[0][quantity]', '1')
    params.set('success_url', `${frontendUrl}/thankyou`)
    params.set('cancel_url', `${frontendUrl}/profile`)

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!stripeRes.ok) {
      const detail = await stripeRes.text()
      console.error('Stripe error:', detail)
      return new Response(
        JSON.stringify({ error: 'Payment service unavailable — retry later' }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...ch } },
      )
    }

    const session = await stripeRes.json()

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...ch } },
    )
  } catch (err) {
    if (err instanceof Response) return err
    console.error('donate error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...ch },
    })
  }
})
