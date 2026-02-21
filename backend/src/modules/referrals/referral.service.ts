import mongoose from "mongoose"
import { User } from "../users/user.model.js"

const PAIR_BONUS_PER_SQM = 1000 // 1,000 UGX per sqm for complete pairs
const DIRECT_BONUS_PER_SQM = 250 // 250 UGX per sqm for direct recruits

/**
 * Breadth-first search for first available placement
 */
export const findPlacement = async (
  rootUserId: mongoose.Types.ObjectId
): Promise<{ parentId: mongoose.Types.ObjectId; position: "left" | "right" }> => {
  const queue: mongoose.Types.ObjectId[] = [rootUserId]

  while (queue.length > 0) {
    const currentId = queue.shift()!
    const user = await User.findById(currentId)

    if (!user) continue

    if (!user.leftChild) {
      return { parentId: user._id, position: "left" }
    }

    if (!user.rightChild) {
      return { parentId: user._id, position: "right" }
    }

    queue.push(user.leftChild, user.rightChild)
  }

  throw new Error("No available placement found")
}

/**
 * Update upline with new sqm and calculate pair bonuses
 * This propagates up the entire tree from the placement point
 */
const updateUplineEarnings = async (
  placementParentId: mongoose.Types.ObjectId,
  position: "left" | "right",
  floorSizeSqm: number
) => {
  let currentUser = await User.findById(placementParentId)
  let level = 0

  while (currentUser) {
    level++
    console.log(`\n🔼 Level ${level}: ${currentUser.name}`)
    console.log(`   Before: leftLeg=${currentUser.leftLegSqm}, rightLeg=${currentUser.rightLegSqm}`)
    
    // Add sqm to the appropriate leg
    if (position === "left") {
      currentUser.leftLegSqm += floorSizeSqm
    } else {
      currentUser.rightLegSqm += floorSizeSqm
    }
    
    console.log(`   After: leftLeg=${currentUser.leftLegSqm}, rightLeg=${currentUser.rightLegSqm}`)

    // Calculate new pairs
    const minLegSqm = Math.min(currentUser.leftLegSqm, currentUser.rightLegSqm)
    const newPairsSqm = minLegSqm - currentUser.matchedPairsSqm
    
    console.log(`   Pairs: min=${minLegSqm}, matched=${currentUser.matchedPairsSqm}, new=${newPairsSqm}`)

    if (newPairsSqm > 0) {
      const pairEarning = newPairsSqm * PAIR_BONUS_PER_SQM
      console.log(`   💰 Pair bonus: ${newPairsSqm} sqm × ${PAIR_BONUS_PER_SQM} = ${pairEarning} UGX`)
      currentUser.pairBonus += pairEarning
      currentUser.totalEarnings += pairEarning
      currentUser.matchedPairsSqm = minLegSqm
    }

    // Update carry-over
    currentUser.carryLeftSqm = currentUser.leftLegSqm - currentUser.matchedPairsSqm
    currentUser.carryRightSqm = currentUser.rightLegSqm - currentUser.matchedPairsSqm
    
    console.log(`   Carry: left=${currentUser.carryLeftSqm}, right=${currentUser.carryRightSqm}`)
    console.log(`   Total earnings: ${currentUser.totalEarnings}`)

    await currentUser.save()

    // Move up to the next parent
    if (!currentUser.referredBy) break
    
    const parentUser = await User.findById(currentUser.referredBy)
    if (!parentUser) break

    // Determine which leg the current user is on relative to parent
    if (parentUser.leftChild?.toString() === currentUser._id.toString()) {
      position = "left"
    } else if (parentUser.rightChild?.toString() === currentUser._id.toString()) {
      position = "right"
    } else {
      break // Current user not properly linked to parent
    }

    currentUser = parentUser
  }
}

/**
 * Register user with referral logic
 */
export const registerWithReferral = async ({
  name,
  phone,
  referredBy,
  referralCode,
  floorSizeSqm,
  district,
  village,
}: {
  name: string
  phone: string
  referredBy?: string // User ID of referrer
  referralCode?: string // Referral code (alternative to referredBy)
  floorSizeSqm: number
  district?: string
  village?: string
}) => {
  // ROOT USER (no referral)
  if (!referredBy && !referralCode) {
    return await User.create({ name, phone, floorSizeSqm, district, village })
  }

  // Find referrer by ID or referral code
  let actualReferrer
  if (referredBy) {
    actualReferrer = await User.findById(referredBy)
  } else if (referralCode) {
    actualReferrer = await User.findOne({ referralCode })
  }
  
  if (!actualReferrer) throw new Error("Invalid referral code or referrer ID")

  // Find placement under referrer tree
  const { parentId, position } = await findPlacement(actualReferrer._id)

  // Create user
  const newUser = await User.create({
    name,
    phone,
    referredBy: actualReferrer._id,
    floorSizeSqm,
    district,
    village,
  })

  // Attach to binary tree and track who referred this child
  const updateFields: any = {
    [position === "left" ? "leftChild" : "rightChild"]: newUser._id,
    [position === "left" ? "leftReferredBy" : "rightReferredBy"]: actualReferrer._id,
  }
  
  await User.findByIdAndUpdate(parentId, updateFields)

  // Direct bonus ONLY to actual referrer (one-time)
  const directBonusAmount = floorSizeSqm * DIRECT_BONUS_PER_SQM
  console.log(`💵 Calculating direct bonus: ${floorSizeSqm} sqm × ${DIRECT_BONUS_PER_SQM} = ${directBonusAmount} UGX`)
  console.log(`💰 Referrer before: directBonus=${actualReferrer.directBonus}, totalEarnings=${actualReferrer.totalEarnings}`)
  
  actualReferrer.directBonus += directBonusAmount
  actualReferrer.totalEarnings += directBonusAmount
  await actualReferrer.save()
  
  console.log(`💰 Referrer after: directBonus=${actualReferrer.directBonus}, totalEarnings=${actualReferrer.totalEarnings}`)

  // Update entire upline with pair bonuses
  await updateUplineEarnings(parentId, position, floorSizeSqm)

  return newUser
}
