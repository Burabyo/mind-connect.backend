import { Router, type Request, type Response } from "express"
import { pool } from "../index.js"
import { verifyToken } from "../middleware/auth.js"

const router = Router()

// Get all posts
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT p.*, u.name as author_name FROM posts p JOIN users u ON p.user_id = u.id WHERE p.is_published = true ORDER BY p.created_at DESC",
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" })
  }
})

// Create post
router.post("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const { title, content, is_anonymous } = req.body
    const user_id = (req as any).userId

    const result = await pool.query(
      "INSERT INTO posts (user_id, title, content, is_anonymous, is_published, created_at) VALUES ($1, $2, $3, $4, true, NOW()) RETURNING *",
      [user_id, title, content, is_anonymous || false],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to create post" })
  }
})

// Like post
router.post("/:id/like", verifyToken, async (req: Request, res: Response) => {
  try {
    const post_id = req.params.id
    const user_id = (req as any).userId

    await pool.query("INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [
      post_id,
      user_id,
    ])

    const result = await pool.query("SELECT COUNT(*) as likes FROM post_likes WHERE post_id = $1", [post_id])
    res.json({ likes: Number.parseInt(result.rows[0].likes) })
  } catch (error) {
    res.status(500).json({ error: "Failed to like post" })
  }
})

export default router
