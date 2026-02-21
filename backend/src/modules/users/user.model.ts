import mongoose from "mongoose"
import crypto from "crypto"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    phone: { type: String, required: true, unique: true },
    
    referralCode: { type: String, unique: true, sparse: true }, // Unique code for sharing

    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who recruited them

    leftChild: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Binary tree left position
    rightChild: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Binary tree right position
    
    // Track who actually referred the left and right children
    leftReferredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who recruited left child
    rightReferredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who recruited right child

    floorSizeSqm: { type: Number, default: 0 },

    // Floor maintenance & verification
    floorStatus: { 
      type: String, 
      enum: ["active", "needs_inspection", "suspended"], 
      default: "active" 
    },
    lastInspectionDate: { type: Date },
    floorConditionRating: { type: Number, min: 1, max: 5, default: 5 }, // 1-5 stars
    maintenanceNotes: { type: String },
    
    // Community endorsement
    communityRating: { type: Number, min: 0, max: 5, default: 0 },
    totalEndorsements: { type: Number, default: 0 },
    
    // Location for analytics
    district: { type: String },
    village: { type: String },

    // Earnings tracking
    totalEarnings: { type: Number, default: 0 },
    directBonus: { type: Number, default: 0 },
    pairBonus: { type: Number, default: 0 },
    
    // Earnings eligibility
    earningsEnabled: { type: Boolean, default: true }, // Can be disabled if floor condition poor

    // Binary tree counters (total sqm in each leg)
    leftLegSqm: { type: Number, default: 0 },
    rightLegSqm: { type: Number, default: 0 },

    // Matched pairs tracking
    matchedPairsSqm: { type: Number, default: 0 }, // Total sqm already paid out as pairs
    
    // Carry-over (unmatched sqm in each leg)
    carryLeftSqm: { type: Number, default: 0 },
    carryRightSqm: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Generate unique referral code before saving
userSchema.pre("save", async function () {
  if (!this.referralCode) {
    // Generate a unique 8-character code
    let code = crypto.randomBytes(4).toString("hex").toUpperCase()
    
    // Ensure uniqueness
    const UserModel = this.constructor as mongoose.Model<any>
    let exists = await UserModel.findOne({ referralCode: code })
    while (exists) {
      code = crypto.randomBytes(4).toString("hex").toUpperCase()
      exists = await UserModel.findOne({ referralCode: code })
    }
    
    this.referralCode = code
  }
})

export const User = mongoose.model("User", userSchema)
