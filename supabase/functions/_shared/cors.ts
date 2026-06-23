function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get('Origin') ?? ''
  // Allow any localhost origin in development; production locks to FRONTEND_URL
  if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
    return origin
  }
  return Deno.env.get('FRONTEND_URL') ?? 'http://localhost:5173'
}

export function getCorsHeaders(req: Request) {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(req),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  }
}

// Backwards-compat export used by handlers that don't have the request handy
export const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('FRONTEND_URL') ?? 'http://localhost:5173',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
  }
  return null
}
