import { Router, type Request, type Response } from "express"
import { pool } from "../index.js"
import { verifyToken } from "../middleware/auth.js"

const router = Router()

// Start anonymous chat
router.post("/start", verifyToken, async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).userId

    const result = await pool.query(
      "INSERT INTO chat_sessions (student_id, is_anonymous, status, created_at) VALUES ($1, true, $2, NOW()) RETURNING *",
      [user_id, "open"],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: "Failed to start chat" })
  }
})

// Send message
router.post("/message", verifyToken, async (req: Request, res: Response) => {
  try {
    const { chat_id, message } = req.body
    const user_id = (req as any).userId

    const result = await pool.query(
      "INSERT INTO chat_messages (chat_id, sender_id, message, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [chat_id, user_id, message],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" })
  }
})

// Get chat messages
router.get("/:chatId", verifyToken, async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM chat_messages WHERE chat_id = $1 ORDER BY created_at ASC", [
      req.params.chatId,
    ])
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" })
  }
})

export default router
