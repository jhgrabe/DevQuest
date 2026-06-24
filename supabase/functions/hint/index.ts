import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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
    const { user } = await requireAuth(req)

    const body = await req.json().catch(() => null)
    if (!body) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...ch },
      })
    }

    const { submission_id, quest_id, source_code, stderr } = body
    if (!submission_id || !quest_id || !source_code) {
      return new Response(
        JSON.stringify({ error: 'submission_id, quest_id, and source_code are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...ch } },
      )
    }

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: quest, error: questError } = await serviceClient
      .from('quests')
      .select('title, description')
      .eq('id', quest_id)
      .single()

    if (questError || !quest) {
      return new Response(JSON.stringify({ error: 'Quest not found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...ch },
      })
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!
    const geminiModel = Deno.env.get('GEMINI_MODEL')!

    const errorContext = stderr
      ? `The execution produced this error output:\n${stderr}`
      : 'The code ran but produced incorrect output — it did not match the expected results.'

    const prompt = `You are a patient coding mentor on a developer learning platform. A student is working on the following challenge:

Quest: ${quest.title}
Description: ${quest.description}

Their code:
\`\`\`
${source_code}
\`\`\`

${errorContext}

Provide a short, educational hint in 2-3 sentences that:
1. Explains what likely went wrong conceptually
2. Points them toward the right approach to think about
3. Does NOT reveal the solution, show corrected code, or give away the answer

Be encouraging. Never output working code.`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.4 },
        }),
      },
    )

    if (!geminiRes.ok) {
      const detail = await geminiRes.text()
      console.error('Gemini error:', detail)
      return new Response(
        JSON.stringify({ error: 'Hint service unavailable — retry later' }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...ch } },
      )
    }

    const geminiData = await geminiRes.json()
    const hint = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null

    if (hint) {
      await serviceClient
        .from('submissions')
        .update({ hint })
        .eq('id', submission_id)
        .eq('user_id', user.id)
    }

    return new Response(
      JSON.stringify({ hint }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...ch } },
    )
  } catch (err) {
    if (err instanceof Response) return err
    console.error('hint error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...ch },
    })
  }
})
