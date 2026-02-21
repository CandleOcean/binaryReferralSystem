import mongoose from "mongoose"

const inspectionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    inspectorName: { type: String, required: true },
    
    // Floor condition assessment
    cleanlinessRating: { type: Number, min: 1, max: 5, required: true },
    structuralIntegrity: { type: Number, min: 1, max: 5, required: true },
    overallRating: { type: Number, min: 1, max: 5, required: true },
    
    // Details
    notes: { type: String },
    photos: [{ type: String }], // URLs to inspection photos
    
    // Actions taken
    actionRequired: { type: Boolean, default: false },
    actionNotes: { type: String },
    earningsAffected: { type: Boolean, default: false }, // Did this affect earnings eligibility?
    
    // Location
    gpsCoordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  { timestamps: true }
)

export const Inspection = mongoose.model("Inspection", inspectionSchema)
