import { Router, type Request, type Response } from "express"
import { pool } from "../index.js"
import { verifyToken } from "../middleware/auth.js"

const router = Router()

// Create victory
router.post("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const { title, description, category } = req.body
    const user_id = (req as any).userId

    const result = await pool.query(
      "INSERT INTO victories (user_id, title, description, category, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
      [user_id, title, description, category || "general"],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: "Failed to create victory" })
  }
})

// Get user victories
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).userId
    const result = await pool.query("SELECT * FROM victories WHERE user_id = $1 ORDER BY created_at DESC", [user_id])
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch victories" })
  }
})

export default router
