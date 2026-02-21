import app from './app.js'
import { connectDB } from './config/db.js'
import dotenv from 'dotenv'

dotenv.config()

const PORT = Number(process.env.PORT) || 4000

connectDB().then(() => {
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`)
  })
})
