import { NextRequest, NextResponse } from 'next/server'
import { BACKEND_URL, getAuthHeaders, backendFetch } from '@/lib/api-proxy'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const res = await backendFetch(`${BACKEND_URL}/users/${id}`, {
    headers: { ...(await getAuthHeaders()) },
    cache: 'no-store',
  })
  if (!res) return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 })

  const data = await res.text()
  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  let name: unknown, is_active: unknown, role: unknown
  try {
    const body = await request.json()
    ;({ name, is_active, role } = body)
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const res = await backendFetch(`${BACKEND_URL}/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
    body: JSON.stringify({ name, is_active, role }),
  })
  if (!res) return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 })

  const data = await res.text()
  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const res = await backendFetch(`${BACKEND_URL}/users/${id}`, {
    method: 'DELETE',
    headers: { ...(await getAuthHeaders()) },
  })
  if (!res) return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 })

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 })
  }

  const data = await res.text()
  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
