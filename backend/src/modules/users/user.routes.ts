import { Router } from "express"
import { registerWithReferral } from "../referrals/referral.service.js"
import { User } from "./user.model.js"

const router = Router()

// Create root user (no referrer)
router.post("/register-root", async (req, res) => {
  try {
    const { name, phone, floorSizeSqm } = req.body
    const user = await User.create({ name, phone, floorSizeSqm })
    res.status(201).json(user)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

// Create new users (With referrers)
router.post("/register", async (req, res) => {
  try {
    console.log("📝 Registration request:", req.body)
    
    const user = await registerWithReferral(req.body)
    
    console.log("✅ User created:", user._id)
    
    // Populate the user data before returning
    const populatedUser = await User.findById(user._id)
      .populate("leftChild", "name phone floorSizeSqm referralCode")
      .populate("rightChild", "name phone floorSizeSqm referralCode")
      .populate("leftReferredBy", "name phone referralCode")
      .populate("rightReferredBy", "name phone referralCode")
      .populate("referredBy", "name phone referralCode")
    
    console.log("📊 User earnings:", {
      directBonus: populatedUser?.directBonus,
      pairBonus: populatedUser?.pairBonus,
      totalEarnings: populatedUser?.totalEarnings
    })
    
    // Also check the referrer's earnings
    const referralCode = req.body.referralCode || req.body.referredBy
    if (referralCode) {
      // Try to find by referral code first, then by ID
      let referrer = await User.findOne({ referralCode })
      if (!referrer) {
        referrer = await User.findById(referralCode)
      }
      
      if (referrer) {
        console.log("💰 Referrer earnings:", {
          name: referrer.name,
          directBonus: referrer.directBonus,
          pairBonus: referrer.pairBonus,
          totalEarnings: referrer.totalEarnings
        })
      }
    }
    
    res.status(201).json(populatedUser)
  } catch (e: any) {
    console.error("❌ Registration error:", e.message)
    res.status(400).json({ message: e.message })
  }
})

// Login by phone number
router.get("/phone/:phone", async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone })
      .populate("leftChild", "name phone floorSizeSqm referralCode")
      .populate("rightChild", "name phone floorSizeSqm referralCode")
      .populate("leftReferredBy", "name phone referralCode")
      .populate("rightReferredBy", "name phone referralCode")
      .populate("referredBy", "name phone referralCode")
    
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

// Get user by referral code
router.get("/referral-code/:code", async (req, res) => {
  try {
    const user = await User.findOne({ referralCode: req.params.code })
    if (!user) {
      return res.status(404).json({ message: "Invalid referral code" })
    }
    res.json({
      name: user.name,
      referralCode: user.referralCode,
      phone: user.phone,
    })
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("leftChild", "name phone floorSizeSqm referralCode")
      .populate("rightChild", "name phone floorSizeSqm referralCode")
      .populate("leftReferredBy", "name phone referralCode")
      .populate("rightReferredBy", "name phone referralCode")
      .populate("referredBy", "name phone referralCode")
    
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

// Get detailed user stats
router.get("/:id/stats", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("leftChild", "name phone floorSizeSqm referralCode")
      .populate("rightChild", "name phone floorSizeSqm referralCode")
      .populate("leftReferredBy", "name phone referralCode")
      .populate("rightReferredBy", "name phone referralCode")
      .populate("referredBy", "name phone referralCode")
    
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      // Basic info
      id: user._id,
      name: user.name,
      phone: user.phone,
      referralCode: user.referralCode,
      floorSizeSqm: user.floorSizeSqm,
      
      // Tree structure
      leftLegSqm: user.leftLegSqm,
      rightLegSqm: user.rightLegSqm,
      
      // Children
      leftChild: user.leftChild ? {
        id: (user.leftChild as any)._id,
        name: (user.leftChild as any).name,
        phone: (user.leftChild as any).phone,
        floorSizeSqm: (user.leftChild as any).floorSizeSqm,
        referralCode: (user.leftChild as any).referralCode,
      } : null,
      
      rightChild: user.rightChild ? {
        id: (user.rightChild as any)._id,
        name: (user.rightChild as any).name,
        phone: (user.rightChild as any).phone,
        floorSizeSqm: (user.rightChild as any).floorSizeSqm,
        referralCode: (user.rightChild as any).referralCode,
      } : null,
      
      // Who referred the children
      leftReferredBy: user.leftReferredBy ? {
        id: (user.leftReferredBy as any)._id,
        name: (user.leftReferredBy as any).name,
        phone: (user.leftReferredBy as any).phone,
        referralCode: (user.leftReferredBy as any).referralCode,
      } : null,
      
      rightReferredBy: user.rightReferredBy ? {
        id: (user.rightReferredBy as any)._id,
        name: (user.rightReferredBy as any).name,
        phone: (user.rightReferredBy as any).phone,
        referralCode: (user.rightReferredBy as any).referralCode,
      } : null,
      
      // Pairs
      matchedPairsSqm: user.matchedPairsSqm,
      estimatedPairs: Math.floor(user.matchedPairsSqm / 15),
      
      // Carry-over
      carryLeftSqm: user.carryLeftSqm,
      carryRightSqm: user.carryRightSqm,
      
      // Earnings
      directBonus: user.directBonus,
      pairBonus: user.pairBonus,
      totalEarnings: user.totalEarnings,
      
      // Referrer
      referredBy: user.referredBy ? {
        id: (user.referredBy as any)._id,
        name: (user.referredBy as any).name,
        phone: (user.referredBy as any).phone,
        referralCode: (user.referredBy as any).referralCode,
      } : null,
    })
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

export default router
