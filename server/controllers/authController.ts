import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { DB } from "../config/db";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-crm-2026";

/**
 * Handles administrator authentication, validates credentials, and signs JWT.
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please specify both your registered email address and password." });
  }

  try {
    // 1. Seek the registered admin record in MongoDB or Local JSON Store
    const user = await DB.users.findByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials. Please verify your login credentials and try again." });
    }

    // 2. Compute and compare the hashed password
    const passwordMatch = await bcryptjs.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials. Please verify your login credentials and try again." });
    }

    // 3. Generate a secure session token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" } // Persistent 7-day dashboard login sessions
    );

    return res.json({
      message: "Authentication successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error("Auth login crash:", error);
    return res.status(500).json({ error: "Internal server error occurred while routing authentication request." });
  }
}

/**
 * Validates active authentication state and supplies session profile.
 * GET /api/auth/me
 */
export async function getProfile(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized session state." });
  }

  try {
    const user = await DB.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Corresponding user record could not be located." });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal error checking active administrator status." });
  }
}
