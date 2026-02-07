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

  while (currentUser) {
    // Add sqm to the appropriate leg
    if (position === "left") {
      currentUser.leftLegSqm += floorSizeSqm
    } else {
      currentUser.rightLegSqm += floorSizeSqm
    }

    // Calculate new pairs
    const minLegSqm = Math.min(currentUser.leftLegSqm, currentUser.rightLegSqm)
    const newPairsSqm = minLegSqm - currentUser.matchedPairsSqm

    if (newPairsSqm > 0) {
      const pairEarning = newPairsSqm * PAIR_BONUS_PER_SQM
      currentUser.pairBonus += pairEarning
      currentUser.totalEarnings += pairEarning
      currentUser.matchedPairsSqm = minLegSqm
    }

    // Update carry-over
    currentUser.carryLeftSqm = currentUser.leftLegSqm - currentUser.matchedPairsSqm
    currentUser.carryRightSqm = currentUser.rightLegSqm - currentUser.matchedPairsSqm

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
  referrerId,
  floorSizeSqm,
}: {
  name: string
  phone: string
  referrerId?: string
  floorSizeSqm: number
}) => {
  // ROOT USER (no referrer)
  if (!referrerId) {
    return await User.create({ name, phone, floorSizeSqm })
  }

  const actualReferrer = await User.findById(referrerId)
  if (!actualReferrer) throw new Error("Referrer not found")

  // Find placement under referrer tree
  const { parentId, position } = await findPlacement(actualReferrer._id)

  // Create user
  const newUser = await User.create({
    name,
    phone,
    referredBy: actualReferrer._id,
    floorSizeSqm,
  })

  // Attach to binary tree
  await User.findByIdAndUpdate(parentId, {
    [position === "left" ? "leftChild" : "rightChild"]: newUser._id,
  })

  // Direct bonus ONLY to actual referrer (one-time)
  const directBonusAmount = floorSizeSqm * DIRECT_BONUS_PER_SQM
  actualReferrer.directBonus += directBonusAmount
  actualReferrer.totalEarnings += directBonusAmount
  await actualReferrer.save()

  // Update entire upline with pair bonuses
  await updateUplineEarnings(parentId, position, floorSizeSqm)

  return newUser
}
