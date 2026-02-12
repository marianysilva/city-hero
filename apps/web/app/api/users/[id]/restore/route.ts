import { NextRequest, NextResponse } from 'next/server'
import { BACKEND_URL, getAuthHeaders } from '@/lib/api-proxy'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  let res: Response
  try {
    res = await fetch(`${BACKEND_URL}/users/${id}/restore`, {
      method: 'POST',
      headers: { ...(await getAuthHeaders()) },
    })
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 })
  }

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 })
  }

  const data = await res.text()
  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
