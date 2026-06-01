import { Router } from "express";
import { getAllLeads, getLeadById, createLead, updateLead, deleteLead } from "../controllers/leadController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// GET /api/leads -> Retrieve all leads (Protected)
router.get("/", authMiddleware as any, getAllLeads as any);

// GET /api/leads/:id -> View details of specific lead (Protected)
router.get("/:id", authMiddleware as any, getLeadById as any);

// POST /api/leads -> Ingest new lead (Publicly accessible for contact form websites, auto-alerts admin)
router.post("/", createLead as any);

// PUT /api/leads/:id -> Edit full details, logging notes & follow-ups (Protected)
router.put("/:id", authMiddleware as any, updateLead as any);

// DELETE /api/leads/:id -> Purge lead from repository (Protected)
router.delete("/:id", authMiddleware as any, deleteLead as any);

export default router;
