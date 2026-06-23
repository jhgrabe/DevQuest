import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCors } from '../_shared/cors.ts'
import { requireAuth } from '../_shared/auth.ts'

const POLL_INTERVAL_MS = 1000
const MAX_POLLS = 30

interface TestCase {
  stdin: string
  expected_stdout: string
}

interface TestResult {
  passed: boolean
  stdout: string
  stderr: string
  expected: string
}

async function submitToJudge0(
  baseUrl: string,
  languageId: number,
  sourceCode: string,
  stdin: string,
  ch: Record<string, string>,
): Promise<string> {
  const res = await fetch(`${baseUrl}/submissions?base64_encoded=false`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language_id: languageId, source_code: sourceCode, stdin }),
  })
  if (!res.ok) {
    throw new Response(
      JSON.stringify({ error: 'Judge0 submission failed', detail: await res.text() }),
      { status: 502, headers: { 'Content-Type': 'application/json', ...ch } },
    )
  }
  const { token } = await res.json()
  return token
}

async function pollJudge0(
  baseUrl: string,
  token: string,
  ch: Record<string, string>,
): Promise<{ stdout: string; stderr: string; statusId: number }> {
  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
    const res = await fetch(
      `${baseUrl}/submissions/${token}?base64_encoded=false&fields=status,stdout,stderr`,
    )
    if (!res.ok) continue
    const data = await res.json()
    if (data.status?.id >= 3) {
      return {
        stdout: data.stdout ?? '',
        stderr: data.stderr ?? '',
        statusId: data.status.id,
      }
    }
  }
  throw new Response(
    JSON.stringify({ error: 'Judge is busy — retry' }),
    { status: 502, headers: { 'Content-Type': 'application/json', ...ch } },
  )
}

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

    const { quest_id, submission_id, source_code, refine } = body
    if (!quest_id || !submission_id || !source_code) {
      return new Response(
        JSON.stringify({ error: 'quest_id, submission_id, and source_code are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...ch } },
      )
    }

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: quest, error: questError } = await serviceClient
      .from('quests')
      .select('language_id, test_cases, xp_reward')
      .eq('id', quest_id)
      .single()

    if (questError || !quest) {
      return new Response(JSON.stringify({ error: 'Quest not found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...ch },
      })
    }

    const judgeBase = Deno.env.get('JUDGE0_BASE_URL')!
    const testCases: TestCase[] = quest.test_cases
    const results: TestResult[] = []

    for (const tc of testCases) {
      const token = await submitToJudge0(judgeBase, quest.language_id, source_code, tc.stdin, ch)
      const { stdout, stderr, statusId } = await pollJudge0(judgeBase, token, ch)

      if (statusId === 6) {
        results.push({ passed: false, stdout, stderr, expected: tc.expected_stdout })
        for (const rest of testCases.slice(results.length)) {
          results.push({ passed: false, stdout: '', stderr: 'Compilation error', expected: rest.expected_stdout })
        }
        break
      }

      results.push({
        passed: stdout.trim() === tc.expected_stdout.trim(),
        stdout,
        stderr,
        expected: tc.expected_stdout,
      })
    }

    const allPassed = results.length === testCases.length && results.every((r) => r.passed)
    const firstFailed = results.find((r) => !r.passed)

    await serviceClient
      .from('submissions')
      .update({
        status: allPassed ? 'passed' : 'failed',
        stdout: results.map((r, i) => `Test ${i + 1}: ${r.stdout.trim()}`).join('\n'),
        stderr: firstFailed?.stderr ?? '',
      })
      .eq('id', submission_id)
      .eq('user_id', user.id)

    let xpAwarded = 0
    if (allPassed) {
      const { count } = await serviceClient
        .from('submissions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('quest_id', quest_id)
        .eq('status', 'passed')
        .neq('id', submission_id)

      if (count === 0) {
        const { data: profile } = await serviceClient
          .from('profiles')
          .select('xp')
          .eq('user_id', user.id)
          .single()

        const newXp = (profile?.xp ?? 0) + quest.xp_reward
        await serviceClient
          .from('profiles')
          .update({ xp: newXp })
          .eq('user_id', user.id)

        xpAwarded = quest.xp_reward
      } else if (refine) {
        const refineXp = Math.floor(quest.xp_reward * 0.25)
        const { data: profile } = await serviceClient
          .from('profiles')
          .select('xp')
          .eq('user_id', user.id)
          .single()

        const newXp = (profile?.xp ?? 0) + refineXp
        await serviceClient
          .from('profiles')
          .update({ xp: newXp })
          .eq('user_id', user.id)

        xpAwarded = refineXp
      }
    }

    return new Response(
      JSON.stringify({ passed: allPassed, results, xp_awarded: xpAwarded }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...ch } },
    )
  } catch (err) {
    if (err instanceof Response) return err
    console.error('execute error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...ch },
    })
  }
})
