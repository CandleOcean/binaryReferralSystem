import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    phone: { type: String, required: true, unique: true },

    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    leftChild: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rightChild: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    floorSizeSqm: { type: Number, default: 0 },

    // Earnings tracking
    totalEarnings: { type: Number, default: 0 },
    directBonus: { type: Number, default: 0 },
    pairBonus: { type: Number, default: 0 },

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

export const User = mongoose.model("users", userSchema)
