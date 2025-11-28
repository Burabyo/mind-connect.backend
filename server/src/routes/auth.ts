import { Router, type Request, type Response } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { pool } from "../index.js"

const router = Router()

// Register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name, age, role, school } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Check if user exists
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ error: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const result = await pool.query(
      "INSERT INTO users (email, password, name, age, role, school, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id, email, name, role",
      [email, hashedPassword, name, age || null, role || "student", school || null],
    )

    const token = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email, role: result.rows[0].role },
      process.env.JWT_SECRET || "secret-key",
      { expiresIn: "24h" },
    )

    res.json({ user: result.rows[0], token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Registration failed" })
  }
})

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const user = result.rows[0]
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret-key",
      { expiresIn: "24h" },
    )

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Login failed" })
  }
})

// Get current user
router.get("/me", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) return res.status(401).json({ error: "No token" })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret-key")
    const result = await pool.query("SELECT id, email, name, age, role, school FROM users WHERE id = $1", [decoded.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(401).json({ error: "Invalid token" })
  }
})

export default router
