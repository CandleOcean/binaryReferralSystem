import { Router } from "express"
import { createEndorsement, getUserEndorsements, getEndorsementStats } from "./endorsement.service.js"

const router = Router()

// Create endorsement
router.post("/", async (req, res) => {
  try {
    const endorsement = await createEndorsement(req.body)
    res.status(201).json(endorsement)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

// Get endorsements for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const endorsements = await getUserEndorsements(req.params.userId)
    res.json(endorsements)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

// Get endorsement statistics
router.get("/stats/:userId", async (req, res) => {
  try {
    const stats = await getEndorsementStats(req.params.userId)
    res.json(stats)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

export default router
