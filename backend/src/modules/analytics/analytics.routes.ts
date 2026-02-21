import { Router } from "express"
import { getSystemStats, getGrowthProjection, getDistrictStats, getTopEarners, getUserTree } from "./analytics.service.js"

const router = Router()

// Get overall system statistics
router.get("/system", async (req, res) => {
  try {
    const stats = await getSystemStats()
    res.json(stats)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

// Get growth projection for a user
router.get("/projection/:userId", async (req, res) => {
  try {
    const months = parseInt(req.query.months as string) || 6
    const projection = await getGrowthProjection(req.params.userId, months)
    res.json(projection)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

// Get statistics by district
router.get("/districts", async (req, res) => {
  try {
    const stats = await getDistrictStats()
    res.json(stats)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

// Get top earners
router.get("/top-earners", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const topEarners = await getTopEarners(limit)
    res.json(topEarners)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

// Get user's network tree
router.get("/tree/:userId", async (req, res) => {
  try {
    const depth = parseInt(req.query.depth as string) || 3
    const tree = await getUserTree(req.params.userId, depth)
    res.json(tree)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

export default router
