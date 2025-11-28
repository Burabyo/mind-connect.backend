import { Router, type Request, type Response } from "express"
import { pool } from "../index.js"
import { verifyToken } from "../middleware/auth.js"

const router = Router()

// Get analytics dashboard (admin/counselor)
router.get("/dashboard", verifyToken, async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).userId
    const userRole = (req as any).userRole

    // Check if user is counselor or admin
    if (userRole !== "counselor" && userRole !== "admin") {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const totalSessions = await pool.query("SELECT COUNT(*) as total FROM sessions WHERE counselor_id = $1", [user_id])

    const completedSessions = await pool.query(
      "SELECT COUNT(*) as total FROM sessions WHERE counselor_id = $1 AND status = $2",
      [user_id, "completed"],
    )

    const commonIssues = await pool.query(
      "SELECT topic, COUNT(*) as count FROM sessions WHERE counselor_id = $1 GROUP BY topic ORDER BY count DESC LIMIT 5",
      [user_id],
    )

    res.json({
      totalSessions: totalSessions.rows[0].total,
      completedSessions: completedSessions.rows[0].total,
      commonIssues: commonIssues.rows,
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" })
  }
})

export default router
