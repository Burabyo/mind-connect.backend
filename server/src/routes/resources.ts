import { Router, type Request, type Response } from "express"
import { pool } from "../index.js"
import { verifyToken } from "../middleware/auth.js"

const router = Router()

// Get all resources
router.get("/", async (req: Request, res: Response) => {
  try {
    const category = req.query.category
    let query = "SELECT * FROM resources WHERE is_active = true"
    const params: any[] = []

    if (category) {
      query += " AND category = $1"
      params.push(category)
    }

    query += " ORDER BY created_at DESC"

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch resources" })
  }
})

// Save resource
router.post("/save", verifyToken, async (req: Request, res: Response) => {
  try {
    const { resource_id } = req.body
    const user_id = (req as any).userId

    const result = await pool.query(
      "INSERT INTO saved_resources (user_id, resource_id, saved_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING RETURNING *",
      [user_id, resource_id],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: "Failed to save resource" })
  }
})

// Get saved resources
router.get("/saved", verifyToken, async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).userId
    const result = await pool.query(
      "SELECT r.* FROM resources r JOIN saved_resources sr ON r.id = sr.resource_id WHERE sr.user_id = $1 ORDER BY sr.saved_at DESC",
      [user_id],
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch saved resources" })
  }
})

export default router
