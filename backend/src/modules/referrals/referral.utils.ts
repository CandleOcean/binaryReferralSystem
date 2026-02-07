import mongoose from "mongoose"
import { User } from "../users/user.model.js"

/**
 * Get user's referral statistics
 */
export const getUserStats = async (userId: string) => {
  const user = await User.findById(userId)
    .populate("leftChild")
    .populate("rightChild")
    .populate("referredBy")

  if (!user) throw new Error("User not found")

  const totalPairs = Math.floor(user.matchedPairsSqm / 15) // Assuming 15 sqm average

  return {
    name: user.name,
    phone: user.phone,
    floorSizeSqm: user.floorSizeSqm,
    
    // Tree structure
    leftLegSqm: user.leftLegSqm,
    rightLegSqm: user.rightLegSqm,
    
    // Pairs
    totalPairsSqm: user.matchedPairsSqm,
    estimatedPairs: totalPairs,
    
    // Carry-over
    carryLeftSqm: user.carryLeftSqm,
    carryRightSqm: user.carryRightSqm,
    
    // Earnings
    directBonus: user.directBonus,
    pairBonus: user.pairBonus,
    totalEarnings: user.totalEarnings,
    
    // Relationships
    referredBy: user.referredBy ? {
      id: (user.referredBy as any)._id,
      name: (user.referredBy as any).name,
    } : null,
    leftChild: user.leftChild ? {
      id: (user.leftChild as any)._id,
      name: (user.leftChild as any).name,
    } : null,
    rightChild: user.rightChild ? {
      id: (user.rightChild as any)._id,
      name: (user.rightChild as any).name,
    } : null,
  }
}

/**
 * Get downline tree (for visualization)
 */
export const getDownlineTree = async (
  userId: string,
  depth: number = 3
): Promise<any> => {
  const user = await User.findById(userId)
    .populate("leftChild")
    .populate("rightChild")

  if (!user || depth === 0) return null

  return {
    id: user._id,
    name: user.name,
    floorSizeSqm: user.floorSizeSqm,
    leftLegSqm: user.leftLegSqm,
    rightLegSqm: user.rightLegSqm,
    totalEarnings: user.totalEarnings,
    left: user.leftChild
      ? await getDownlineTree((user.leftChild as any)._id.toString(), depth - 1)
      : null,
    right: user.rightChild
      ? await getDownlineTree((user.rightChild as any)._id.toString(), depth - 1)
      : null,
  }
}

/**
 * Calculate potential earnings if user recruits X people
 */
export const calculatePotentialEarnings = (
  directRecruits: number,
  avgFloorSizeSqm: number = 15,
  months: number = 6
) => {
  const results = []
  let totalDownline = directRecruits
  let totalPairs = 0

  for (let month = 1; month <= months; month++) {
    if (month === 1) {
      // First month: direct recruits only
      const pairs = Math.floor(directRecruits / 2)
      const pairEarnings = pairs * avgFloorSizeSqm * 1000
      const directBonus = directRecruits * avgFloorSizeSqm * 250
      
      totalPairs = pairs
      
      results.push({
        month,
        directRecruits,
        downlineGrowth: directRecruits,
        totalPairs: pairs,
        pairEarnings,
        directBonus,
        totalEarnings: pairEarnings + directBonus,
      })
    } else {
      // Subsequent months: exponential growth
      const newDownline = totalDownline * 2
      const newPairs = Math.floor(newDownline / 2)
      const pairEarnings = newPairs * avgFloorSizeSqm * 1000
      
      totalDownline = newDownline
      totalPairs = newPairs
      
      results.push({
        month,
        directRecruits: 0,
        downlineGrowth: newDownline,
        totalPairs: newPairs,
        pairEarnings,
        directBonus: 0,
        totalEarnings: pairEarnings,
      })
    }
  }

  const grandTotal = results.reduce((sum, r) => sum + r.totalEarnings, 0)

  return {
    breakdown: results,
    grandTotal,
    totalDownline,
    totalPairs,
  }
}
