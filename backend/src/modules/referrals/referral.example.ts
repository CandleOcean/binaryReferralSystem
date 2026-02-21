/**
 * Example usage of the Binary Referral System
 * 
 * This demonstrates how the system implements the exact logic from your requirements:
 * - 1,000 UGX per sqm for complete pairs
 * - 250 UGX per sqm for direct recruits
 * - Automatic upline propagation
 * - Carry-over tracking
 */

import { registerWithReferral } from "./referral.service.js"
import { getUserStats, calculatePotentialEarnings } from "./referral.utils.js"

/**
 * Example: Simulate the 6-month scenario from your document
 */
export async function simulateGrowthScenario() {
  console.log("🎯 Binary Referral System Simulation\n")
  
  // Month 1: Root user recruits 2 people (15 sqm each)
  const rootUser = await registerWithReferral({
    name: "Alice (Root)",
    phone: "+256700000001",
    floorSizeSqm: 15,
  })
  
  console.log("✅ Root user created:", rootUser.name)
  console.log("📋 Referral Code:", rootUser.referralCode)
  
  // First direct recruit (left) - using referral code
  const user2 = await registerWithReferral({
    name: "Bob",
    phone: "+256700000002",
    referralCode: rootUser.referralCode || undefined,
    floorSizeSqm: 15,
  })
  
  console.log("✅ Bob joined (left leg) using code:", rootUser.referralCode)
  
  // Second direct recruit (right) - using referral code
  const user3 = await registerWithReferral({
    name: "Carol",
    phone: "+256700000003",
    referralCode: rootUser.referralCode || undefined,
    floorSizeSqm: 15,
  })
  
  console.log("✅ Carol joined (right leg) using code:", rootUser.referralCode)
  console.log("\n📊 After Month 1:")
  
  const stats = await getUserStats(rootUser._id.toString())
  console.log(`
  Direct Bonus: ${stats.directBonus} UGX (2 recruits × 15 sqm × 250)
  Pair Bonus: ${stats.pairBonus} UGX (1 pair × 15 sqm × 1,000)
  Total Earnings: ${stats.totalEarnings} UGX
  
  Left Leg: ${stats.leftLegSqm} sqm
  Right Leg: ${stats.rightLegSqm} sqm
  Matched Pairs: ${stats.totalPairsSqm} sqm
  Carry Left: ${stats.carryLeftSqm} sqm
  Carry Right: ${stats.carryRightSqm} sqm
  `)
  
  return rootUser._id.toString()
}

/**
 * Example: Show potential earnings calculator
 */
export function showPotentialEarnings() {
  console.log("\n💰 Potential Earnings Calculator\n")
  console.log("Scenario: Each customer refers 2 people, 15 sqm average floor\n")
  
  const projection = calculatePotentialEarnings(2, 15, 6)
  
  console.log("Month | Direct | Downline | Pairs | Pair Earnings | Direct Bonus | Total")
  console.log("------|--------|----------|-------|---------------|--------------|-------")
  
  projection.breakdown.forEach((month) => {
    console.log(
      `  ${month.month}   |   ${month.directRecruits}    |    ${month.downlineGrowth.toString().padStart(3)}   |  ${month.totalPairs.toString().padStart(3)}  | ${month.pairEarnings.toLocaleString().padStart(11)} | ${month.directBonus.toLocaleString().padStart(10)} | ${month.totalEarnings.toLocaleString()}`
    )
  })
  
  console.log("\n✅ Grand Total: " + projection.grandTotal.toLocaleString() + " UGX")
  console.log(`📈 Total Downline: ${projection.totalDownline} people`)
  console.log(`🎯 Total Pairs: ${projection.totalPairs} pairs\n`)
}

/**
 * Key Features Implemented:
 * 
 * ✅ Binary tree structure (left/right legs)
 * ✅ Automatic placement using BFS
 * ✅ Direct bonus: 250 UGX/sqm (one-time, only to actual referrer)
 * ✅ Pair bonus: 1,000 UGX/sqm (ongoing, to entire upline)
 * ✅ Upline propagation (all ancestors earn from pairs)
 * ✅ Carry-over tracking (unmatched sqm in each leg)
 * ✅ Cumulative pair tracking (matchedPairsSqm)
 * ✅ Separate tracking of directBonus, pairBonus, totalEarnings
 * 
 * How it works:
 * 1. User A recruits User B → A gets 250 UGX/sqm direct bonus
 * 2. User A recruits User C → A gets another 250 UGX/sqm direct bonus
 * 3. Now A has 1 complete pair → A gets 1,000 UGX/sqm pair bonus
 * 4. When B or C recruit → A gets more pair bonuses as legs grow
 * 5. All of A's upline also get pair bonuses from B and C's recruits
 */
