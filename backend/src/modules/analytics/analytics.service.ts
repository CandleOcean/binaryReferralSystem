import { User } from "../users/user.model.js"

const FLOOR_PRICE_PER_SQM = 24000 // UGX
const PAIR_BONUS_PER_SQM = 1000 // UGX
const DIRECT_BONUS_PER_SQM = 250 // UGX

export async function getSystemStats() {
  const totalUsers = await User.countDocuments()
  const activeUsers = await User.countDocuments({ floorStatus: "active" })
  const suspendedUsers = await User.countDocuments({ floorStatus: "suspended" })
  
  const totalFloorSqm = await User.aggregate([
    { $group: { _id: null, total: { $sum: "$floorSizeSqm" } } },
  ])
  
  const totalEarnings = await User.aggregate([
    { $group: { _id: null, total: { $sum: "$totalEarnings" } } },
  ])
  
  const totalRevenue = (totalFloorSqm[0]?.total || 0) * FLOOR_PRICE_PER_SQM
  const totalPaidOut = totalEarnings[0]?.total || 0
  const companyRevenue = totalRevenue - totalPaidOut
  
  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      suspended: suspendedUsers,
    },
    floors: {
      totalSqm: totalFloorSqm[0]?.total || 0,
      totalRevenue,
    },
    earnings: {
      totalPaidOut,
      companyRevenue,
      payoutPercentage: totalRevenue > 0 ? (totalPaidOut / totalRevenue) * 100 : 0,
    },
  }
}

export async function getGrowthProjection(userId: string, months: number = 6) {
  const user = await User.findById(userId)
  if (!user) throw new Error("User not found")
  
  const avgFloorSize = 15 // sqm
  const directRecruits = 2 // Assumption: 2 direct recruits per month
  
  const projections = []
  let totalDownline = 0
  let totalPairs = 0
  let cumulativeEarnings = user.totalEarnings
  
  for (let month = 1; month <= months; month++) {
    // Binary growth: each person recruits 2, so downline doubles
    const newRecruits = Math.pow(2, month)
    totalDownline += newRecruits
    
    // Pairs = min(left, right) - in balanced binary tree, pairs = total/2
    const newPairs = Math.floor(newRecruits / 2)
    totalPairs += newPairs
    
    // Calculate earnings for this month
    const directBonus = month === 1 ? directRecruits * avgFloorSize * DIRECT_BONUS_PER_SQM : 0
    const pairBonus = newPairs * avgFloorSize * PAIR_BONUS_PER_SQM
    const monthlyEarnings = directBonus + pairBonus
    
    cumulativeEarnings += monthlyEarnings
    
    projections.push({
      month,
      newRecruits,
      totalDownline,
      newPairs,
      totalPairs,
      directBonus,
      pairBonus,
      monthlyEarnings,
      cumulativeEarnings,
    })
  }
  
  return {
    userId,
    userName: user.name,
    currentEarnings: user.totalEarnings,
    projections,
    assumptions: {
      avgFloorSize,
      directRecruitsPerMonth: directRecruits,
      pairBonusPerSqm: PAIR_BONUS_PER_SQM,
      directBonusPerSqm: DIRECT_BONUS_PER_SQM,
    },
  }
}

export async function getDistrictStats() {
  const byDistrict = await User.aggregate([
    { $match: { district: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: "$district",
        totalUsers: { $sum: 1 },
        totalFloorSqm: { $sum: "$floorSizeSqm" },
        totalEarnings: { $sum: "$totalEarnings" },
        avgCommunityRating: { $avg: "$communityRating" },
      },
    },
    { $sort: { totalUsers: -1 } },
  ])
  
  return byDistrict.map(d => ({
    district: d._id,
    users: d.totalUsers,
    floorSqm: d.totalFloorSqm,
    earnings: d.totalEarnings,
    avgRating: Math.round(d.avgCommunityRating * 10) / 10,
    revenue: d.totalFloorSqm * FLOOR_PRICE_PER_SQM,
  }))
}

export async function getTopEarners(limit: number = 10) {
  return User.find()
    .sort({ totalEarnings: -1 })
    .limit(limit)
    .select("name phone totalEarnings directBonus pairBonus district communityRating")
}

export async function getUserTree(userId: string, depth: number = 3) {
  const buildTree = async (user: any, currentDepth: number): Promise<any> => {
    if (!user || currentDepth > depth) return null

    const userData = {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      floorSizeSqm: user.floorSizeSqm,
      totalEarnings: user.totalEarnings,
      directBonus: user.directBonus,
      pairBonus: user.pairBonus,
      leftLegSqm: user.leftLegSqm,
      rightLegSqm: user.rightLegSqm,
      matchedPairsSqm: user.matchedPairsSqm,
      floorStatus: user.floorStatus,
      communityRating: user.communityRating,
      depth: currentDepth,
      leftChild: null as any,
      rightChild: null as any,
    }

    if (currentDepth < depth) {
      if (user.leftChild) {
        const leftUser = await User.findById(user.leftChild)
        userData.leftChild = await buildTree(leftUser, currentDepth + 1)
      }
      if (user.rightChild) {
        const rightUser = await User.findById(user.rightChild)
        userData.rightChild = await buildTree(rightUser, currentDepth + 1)
      }
    }

    return userData
  }

  const rootUser = await User.findById(userId)
  if (!rootUser) throw new Error("User not found")

  return buildTree(rootUser, 0)
}
