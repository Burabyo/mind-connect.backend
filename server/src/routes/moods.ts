import { Router, type Request, type Response } from "express"
import { pool } from "../index.js"
import { verifyToken } from "../middleware/auth.js"

const router = Router()

// Record mood check-in
router.post("/checkin", verifyToken, async (req: Request, res: Response) => {
  try {
    const { mood, intensity, notes } = req.body
    const user_id = (req as any).userId

    const result = await pool.query(
      "INSERT INTO mood_checkins (user_id, mood, intensity, notes, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
      [user_id, mood, intensity || 5, notes || null],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: "Failed to record mood" })
  }
})

// Get mood history
router.get("/history", verifyToken, async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).userId
    const days = req.query.days || 30

    const result = await pool.query(
      "SELECT * FROM mood_checkins WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 day' * $2 ORDER BY created_at DESC",
      [user_id, days],
    )

    // Calculate streak
    const rows = result.rows
    let streak = 0
    let lastDate = null

    for (const row of rows) {
      const checkDate = new Date(row.created_at).toDateString()
      if (lastDate === null || checkDate === lastDate) {
        streak++
        lastDate = checkDate
      } else if (new Date(lastDate).getTime() - new Date(checkDate).getTime() === 24 * 60 * 60 * 1000) {
        streak++
        lastDate = checkDate
      } else {
        break
      }
    }

    res.json({ moods: rows, streak })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch mood history" })
  }
})

export default router
