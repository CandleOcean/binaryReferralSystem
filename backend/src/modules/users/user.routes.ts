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
    const user = await registerWithReferral(req.body)
    res.status(201).json(user)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

// Login by phone number
router.get("/phone/:phone", async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

export default router
