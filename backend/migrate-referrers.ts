/**
 * Migration script to populate leftReferredBy and rightReferredBy
 * for existing users in the database
 * 
 * Run with: npx tsx migrate-referrers.ts
 */

import mongoose from "mongoose"
import dotenv from "dotenv"
import { User } from "./src/modules/users/user.model.js"

dotenv.config()

async function migrateReferrers() {
  try {
    await mongoose.connect(process.env.MONGO_URI!)
    console.log("✅ Connected to MongoDB")

    const users = await User.find({})
      .populate("leftChild")
      .populate("rightChild")

    let updated = 0

    for (const user of users) {
      let needsUpdate = false
      const updates: any = {}

      // If user has a left child, set leftReferredBy to the child's referredBy
      if (user.leftChild && !user.leftReferredBy) {
        const leftChild = await User.findById((user.leftChild as any)._id)
        if (leftChild?.referredBy) {
          updates.leftReferredBy = leftChild.referredBy
          needsUpdate = true
        }
      }

      // If user has a right child, set rightReferredBy to the child's referredBy
      if (user.rightChild && !user.rightReferredBy) {
        const rightChild = await User.findById((user.rightChild as any)._id)
        if (rightChild?.referredBy) {
          updates.rightReferredBy = rightChild.referredBy
          needsUpdate = true
        }
      }

      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, updates)
        console.log(`✅ Updated ${user.name}`)
        updated++
      }
    }

    console.log(`\n✅ Migration complete! Updated ${updated} users.`)
    process.exit(0)
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  }
}

migrateReferrers()
