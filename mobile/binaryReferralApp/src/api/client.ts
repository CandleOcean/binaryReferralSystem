const BASE_URL = 'http://10.0.2.2:4000'

export interface User {
  _id: string
  name: string
  phone: string
  floorSizeSqm: number
  referredBy?: string
  leftChild?: string
  rightChild?: string
  totalEarnings: number
  directBonus: number
  pairBonus: number
  leftLegSqm: number
  rightLegSqm: number
  matchedPairsSqm: number
  carryLeftSqm: number
  carryRightSqm: number
  createdAt: string
  updatedAt: string
}

export interface RegisterData {
  name: string
  phone: string
  floorSizeSqm: number
  referredBy?: string
}

export async function apiGet(path: string) {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'API error' }))
    throw new Error(error.message || 'API error')
  }
  return res.json()
}

export async function apiPost(path: string, data: any) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'API error' }))
    throw new Error(error.message || 'API error')
  }
  return res.json()
}

export async function registerUser(data: RegisterData): Promise<User> {
  const endpoint = data.referredBy ? '/api/users/register' : '/api/users/register-root'
  return apiPost(endpoint, data)
}

export async function loginUser(phone: string): Promise<User | null> {
  // For now, we'll need to add a login endpoint to backend
  // This is a placeholder that searches by phone
  return apiGet(`/api/users/phone/${phone}`)
}
