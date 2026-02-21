import mongoose from "mongoose"

const endorsementSchema = new mongoose.Schema(
  {
    endorsedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    endorserUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    
    // Verification
    verified: { type: Boolean, default: false },
    relationship: { 
      type: String, 
      enum: ["neighbor", "family", "friend", "downline", "upline", "other"],
      required: true 
    },
  },
  { timestamps: true }
)

// Prevent duplicate endorsements
endorsementSchema.index({ endorsedUserId: 1, endorserUserId: 1 }, { unique: true })

export const Endorsement = mongoose.model("Endorsement", endorsementSchema)
