import { Inspection } from "./inspection.model.js"
import { User } from "../users/user.model.js"

interface InspectionData {
  userId: string
  inspectorName: string
  cleanlinessRating: number
  structuralIntegrity: number
  overallRating: number
  notes?: string
  photos?: string[]
  actionRequired?: boolean
  actionNotes?: string
  gpsCoordinates?: {
    latitude: number
    longitude: number
  }
}

export async function createInspection(data: InspectionData) {
  const inspection = await Inspection.create(data)
  
  // Update user's floor status based on inspection
  const user = await User.findById(data.userId)
  if (!user) throw new Error("User not found")
  
  user.lastInspectionDate = new Date()
  user.floorConditionRating = data.overallRating
  
  // Suspend earnings if floor condition is poor (rating < 3)
  if (data.overallRating < 3) {
    user.floorStatus = "suspended"
    user.earningsEnabled = false
    user.maintenanceNotes = data.actionNotes || "Floor maintenance required"
    inspection.earningsAffected = true
  } else if (data.overallRating >= 3 && user.floorStatus === "suspended") {
    // Restore earnings if floor improved
    user.floorStatus = "active"
    user.earningsEnabled = true
    user.maintenanceNotes = "Floor condition restored"
  }
  
  await user.save()
  await inspection.save()
  
  return inspection
}

export async function getUserInspections(userId: string) {
  return Inspection.find({ userId }).sort({ createdAt: -1 })
}

export async function getInspectionStats() {
  const total = await Inspection.countDocuments()
  const suspended = await User.countDocuments({ floorStatus: "suspended" })
  const needsInspection = await User.countDocuments({ floorStatus: "needs_inspection" })
  
  const avgRating = await Inspection.aggregate([
    {
      $group: {
        _id: null,
        avgCleanliness: { $avg: "$cleanlinessRating" },
        avgStructural: { $avg: "$structuralIntegrity" },
        avgOverall: { $avg: "$overallRating" },
      },
    },
  ])
  
  return {
    totalInspections: total,
    suspendedUsers: suspended,
    needsInspection,
    averageRatings: avgRating[0] || { avgCleanliness: 0, avgStructural: 0, avgOverall: 0 },
  }
}
