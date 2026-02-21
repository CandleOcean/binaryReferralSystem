import { Endorsement } from "./endorsement.model.js"
import { User } from "../users/user.model.js"

interface EndorsementData {
  endorsedUserId: string
  endorserUserId: string
  rating: number
  comment?: string
  relationship: string
}

export async function createEndorsement(data: EndorsementData) {
  // Prevent self-endorsement
  if (data.endorsedUserId === data.endorserUserId) {
    throw new Error("Cannot endorse yourself")
  }
  
  // Check if endorsement already exists
  const existing = await Endorsement.findOne({
    endorsedUserId: data.endorsedUserId,
    endorserUserId: data.endorserUserId,
  })
  
  if (existing) {
    throw new Error("You have already endorsed this user")
  }
  
  const endorsement = await Endorsement.create(data)
  
  // Update user's community rating
  await updateUserCommunityRating(data.endorsedUserId)
  
  return endorsement
}

async function updateUserCommunityRating(userId: string) {
  const endorsements = await Endorsement.find({ endorsedUserId: userId })
  
  if (endorsements.length === 0) return
  
  const avgRating = endorsements.reduce((sum, e) => sum + e.rating, 0) / endorsements.length
  
  await User.findByIdAndUpdate(userId, {
    communityRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
    totalEndorsements: endorsements.length,
  })
}

export async function getUserEndorsements(userId: string) {
  return Endorsement.find({ endorsedUserId: userId })
    .populate("endorserUserId", "name phone")
    .sort({ createdAt: -1 })
}

export async function getEndorsementStats(userId: string) {
  const endorsements = await Endorsement.find({ endorsedUserId: userId })
  
  const ratingBreakdown = {
    5: endorsements.filter(e => e.rating === 5).length,
    4: endorsements.filter(e => e.rating === 4).length,
    3: endorsements.filter(e => e.rating === 3).length,
    2: endorsements.filter(e => e.rating === 2).length,
    1: endorsements.filter(e => e.rating === 1).length,
  }
  
  const relationshipBreakdown = endorsements.reduce((acc, e) => {
    acc[e.relationship] = (acc[e.relationship] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    total: endorsements.length,
    ratingBreakdown,
    relationshipBreakdown,
  }
}
