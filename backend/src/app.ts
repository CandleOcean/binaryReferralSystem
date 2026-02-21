import express from 'express'
import cors from 'cors'
import userRoutes from "./modules/users/user.routes.js"
import inspectionRoutes from "./modules/inspections/inspection.routes.js"
import endorsementRoutes from "./modules/endorsements/endorsement.routes.js"
import analyticsRoutes from "./modules/analytics/analytics.routes.js"

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Binary Referral API running 🚀' })
})

app.get('/test-connection', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Connection working!',
    serverTime: new Date().toISOString(),
    clientIP: req.ip
  })
})

// Debug endpoint - remove in production
app.get('/debug/users', async (req, res) => {
  try {
    const User = (await import('./modules/users/user.model.js')).User
    const users = await User.find({}, 'name phone referralCode totalEarnings').limit(20)
    res.json({ 
      count: users.length,
      users: users.map(u => ({
        name: u.name,
        phone: u.phone,
        referralCode: u.referralCode,
        totalEarnings: u.totalEarnings
      }))
    })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

app.use("/api/users", userRoutes)
app.use("/api/inspections", inspectionRoutes)
app.use("/api/endorsements", endorsementRoutes)
app.use("/api/analytics", analyticsRoutes)


export default app
