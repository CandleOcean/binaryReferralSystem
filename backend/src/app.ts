import express from 'express'
import cors from 'cors'
import userRoutes from "./modules/users/user.routes.js"

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Binary Referral API running 🚀' })
})

app.use("/api/users", userRoutes)


export default app
