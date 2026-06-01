import { Response } from "express";
import { DB } from "../config/db";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { sendLeadNotificationEmail } from "../services/notificationService";

/**
 * Lists all leads with matching search, filter status, and date sort.
 * GET /api/leads
 */
export async function getAllLeads(req: AuthenticatedRequest, res: Response) {
  try {
    const allLeads = await DB.leads.findMany();

    // Gather and apply query parameters
    const search = (req.query.search as string || "").trim().toLowerCase();
    const status = (req.query.status as string || "").trim();
    const source = (req.query.source as string || "").trim();
    const sortBy = (req.query.sortBy as string || "createdAt_desc").trim(); // options: createdAt_asc, createdAt_desc, followUp_asc

    let filtered = [...allLeads];

    // 1. Case-insensitive search indexing (name, email, company, notes)
    if (search) {
      filtered = filtered.filter(l => 
        (l.name && l.name.toLowerCase().includes(search)) ||
        (l.email && l.email.toLowerCase().includes(search)) ||
        (l.company && l.company.toLowerCase().includes(search)) ||
        (l.notes && l.notes.toLowerCase().includes(search))
      );
    }

    // 2. Status Badge Filtering
    if (status) {
      filtered = filtered.filter(l => l.status === status);
    }

    // 3. Source badge Filtering
    if (source) {
      filtered = filtered.filter(l => l.source === source);
    }

    // 4. Client and Server Sorting
    if (sortBy === "createdAt_asc") {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "createdAt_desc") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "followUp_asc") {
      // Leads with follow up dates should come early, invalid/empty dates last
      filtered.sort((a, b) => {
        if (!a.followUpDate) return 1;
        if (!b.followUpDate) return -1;
        return new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime();
      });
    }

    return res.json({
      count: filtered.length,
      leads: filtered
    });
  } catch (error: any) {
    console.error("Listing leads error:", error);
    return res.status(500).json({ error: "Failed to retrieve CRM leads list." });
  }
}

/**
 * Reads a singular lead record.
 * GET /api/leads/:id
 */
export async function getLeadById(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  try {
    const lead = await DB.leads.findById(id);
    if (!lead) {
      return res.status(404).json({ error: `Could not find a lead matching registered ID '${id}'.` });
    }
    return res.json({ lead });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load individual lead detail profile." });
  }
}

/**
 * Creates a new lead, logs initial entry, and fires email notifications.
 * POST /api/leads
 */
export async function createLead(req: AuthenticatedRequest, res: Response) {
  const { name, email, phone, company, source, status, notes, followUpDate } = req.body;

  // Form Validation
  if (!name || !email) {
    return res.status(400).json({ error: "Contact full name and email address are both required to process new leads." });
  }

  // Basic email pattern validate
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please specify a valid email address." });
  }

  try {
    const leadInput = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || "").trim(),
      company: (company || "").trim() || "Independent",
      source: source || "Website",
      status: status || "New",
      notes: (notes || "").trim(),
      followUpDate: followUpDate || ""
    };

    const created = await DB.leads.create(leadInput);

    // Fire email alerting in the background (Non-blocking)
    sendLeadNotificationEmail(created).catch(err => {
      console.error("Delayed dispatch email container error:", err);
    });

    return res.status(201).json({
      message: "Lead created and registered successfully in database.",
      lead: created
    });
  } catch (error: any) {
    console.error("Create lead error:", error);
    return res.status(500).json({ error: "An unexpected database state blocked creation of this lead." });
  }
}

/**
 * Updates details of an existing lead, appending changes seamlessly to historical logs.
 * PUT /api/leads/:id
 */
export async function updateLead(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { name, email, phone, company, source, status, notes, followUpDate } = req.body;

  // Validate changes if any field exists
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please specify a valid email structure." });
    }
  }

  try {
    const updated = await DB.leads.update(id, {
      ...(name !== undefined && { name: name.trim() }),
      ...(email !== undefined && { email: email.trim().toLowerCase() }),
      ...(phone !== undefined && { phone: phone.trim() }),
      ...(company !== undefined && { company: company.trim() }),
      ...(source !== undefined && { source }),
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes: notes.trim() }),
      ...(followUpDate !== undefined && { followUpDate })
    });

    if (!updated) {
      return res.status(404).json({ error: "The targeted lead record does not exist or was deleted." });
    }

    return res.json({
      message: "Lead details and follow-ups successfully modified.",
      lead: updated
    });
  } catch (error: any) {
    console.error("Update lead database error:", error);
    return res.status(500).json({ error: "Failed to persist updated lead profile changes." });
  }
}

/**
 * Permanently removes a lead record.
 * DELETE /api/leads/:id
 */
export async function deleteLead(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  try {
    const isDeleted = await DB.leads.delete(id);
    if (!isDeleted) {
      return res.status(404).json({ error: "Lead record not found or already deleted from archives." });
    }

    return res.json({
      message: "Lead record successfully archived and deleted from the database."
    });
  } catch (error) {
    return res.status(500).json({ error: "Could not safely process lead removal on server." });
  }
}
