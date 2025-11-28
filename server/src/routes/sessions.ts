import { Router, type Request, type Response } from "express"
import { pool } from "../index.js"
import { verifyToken } from "../middleware/auth.js"

const router = Router()

// Get available counselors
router.get("/counselors", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT id, name, specialization, available_hours FROM users WHERE role = $1", [
      "counselor",
    ])
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch counselors" })
  }
})

// Book session
router.post("/book", verifyToken, async (req: Request, res: Response) => {
  try {
    const { counselor_id, date, time, topic } = req.body
    const student_id = (req as any).userId

    const result = await pool.query(
      "INSERT INTO sessions (student_id, counselor_id, scheduled_date, scheduled_time, topic, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *",
      [student_id, counselor_id, date, time, topic, "scheduled"],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to book session" })
  }
})

// Get student sessions
router.get("/my-sessions", verifyToken, async (req: Request, res: Response) => {
  try {
    const student_id = (req as any).userId
    const result = await pool.query(
      "SELECT s.*, u.name as counselor_name FROM sessions s JOIN users u ON s.counselor_id = u.id WHERE s.student_id = $1 ORDER BY s.scheduled_date DESC",
      [student_id],
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" })
  }
})

// Get counselor sessions
router.get("/counselor-sessions", verifyToken, async (req: Request, res: Response) => {
  try {
    const counselor_id = (req as any).userId
    const result = await pool.query(
      "SELECT s.*, u.name as student_name, u.email as student_email FROM sessions s JOIN users u ON s.student_id = u.id WHERE s.counselor_id = $1 ORDER BY s.scheduled_date DESC",
      [counselor_id],
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" })
  }
})

// Update session status
router.patch("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body
    const sessionId = req.params.id

    const result = await pool.query(
      "UPDATE sessions SET status = $1, notes = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
      [status, notes || null, sessionId],
    )

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: "Failed to update session" })
  }
})

export default router
