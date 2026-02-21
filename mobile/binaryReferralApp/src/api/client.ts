const BASE_URL = 'http://192.168.1.5:4000'

export interface User {
  _id: string
  name: string
  phone: string
  floorSizeSqm: number
  referralCode: string
  referredBy?: string
  leftChild?: string
  rightChild?: string
  
  // Add these new fields:
  leftReferredBy?: string  // Who recruited the left child
  rightReferredBy?: string // Who recruited the right child
  
  totalEarnings: number
  directBonus: number
  pairBonus: number
  leftLegSqm: number
  rightLegSqm: number
  matchedPairsSqm: number
  carryLeftSqm: number
  carryRightSqm: number
  floorStatus: 'active' | 'needs_inspection' | 'suspended'
  lastInspectionDate?: string
  floorConditionRating: number
  maintenanceNotes?: string
  communityRating: number
  totalEndorsements: number
  district?: string
  village?: string
  earningsEnabled: boolean
  createdAt: string
  updatedAt: string
}


export interface RegisterData {
  name: string
  phone: string
  floorSizeSqm: number
  referralCode?: string  // Changed from referredBy to referralCode
  district?: string
  village?: string
}

export interface GrowthProjection {
  month: number
  newRecruits: number
  totalDownline: number
  newPairs: number
  totalPairs: number
  directBonus: number
  pairBonus: number
  monthlyEarnings: number
  cumulativeEarnings: number
}

export interface Endorsement {
  _id: string
  endorsedUserId: string
  endorserUserId: any
  rating: number
  comment?: string
  relationship: string
  createdAt: string
}

export interface TreeNode {
  _id: string
  name: string
  phone: string
  floorSizeSqm: number
  totalEarnings: number
  directBonus: number
  pairBonus: number
  leftLegSqm: number
  rightLegSqm: number
  matchedPairsSqm: number
  floorStatus: string
  communityRating: number
  depth: number
  leftChild: TreeNode | null
  rightChild: TreeNode | null
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
  const endpoint = data.referralCode ? '/api/users/register' : '/api/users/register-root'
  return apiPost(endpoint, data)
}

export async function loginUser(phone: string): Promise<User | null> {
  // For now, we'll need to add a login endpoint to backend
  // This is a placeholder that searches by phone
  return apiGet(`/api/users/phone/${phone}`)
}

export async function getGrowthProjection(userId: string, months: number = 6) {
  return apiGet(`/api/analytics/projection/${userId}?months=${months}`)
}

export async function getUserEndorsements(userId: string): Promise<Endorsement[]> {
  return apiGet(`/api/endorsements/user/${userId}`)
}

export async function createEndorsement(data: {
  endorsedUserId: string
  endorserUserId: string
  rating: number
  comment?: string
  relationship: string
}) {
  return apiPost('/api/endorsements', data)
}

export async function getUserTree(userId: string, depth: number = 3): Promise<TreeNode> {
  return apiGet(`/api/analytics/tree/${userId}?depth=${depth}`)
}
