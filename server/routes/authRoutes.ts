import { Router } from "express";
import { login, getProfile } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// POST /api/auth/login -> Authenticate admin
router.post("/login", login);

// GET /api/auth/me -> Custom route to decode current user on startup
router.get("/me", authMiddleware as any, getProfile as any);

export default router;
