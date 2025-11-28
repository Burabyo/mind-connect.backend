import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "No token provided" })
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret-key")
    ;(req as any).userId = decoded.id
    ;(req as any).userRole = decoded.role
    next()
  } catch (error) {
    res.status(401).json({ error: "Invalid token" })
  }
}
