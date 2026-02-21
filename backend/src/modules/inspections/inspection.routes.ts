import { Router } from "express"
import { createInspection, getUserInspections, getInspectionStats } from "./inspection.service.js"

const router = Router()

// Create new inspection
router.post("/", async (req, res) => {
  try {
    const inspection = await createInspection(req.body)
    res.status(201).json(inspection)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

// Get inspections for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const inspections = await getUserInspections(req.params.userId)
    res.json(inspections)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

// Get inspection statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = await getInspectionStats()
    res.json(stats)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

export default router
