import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import bcryptjs from "bcryptjs";

// Load environment variables (just in case)
import dotenv from "dotenv";
dotenv.config();

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export interface ILead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: "New" | "Contacted" | "Follow Up" | "Converted" | "Lost";
  notes: string;
  followUpDate: string;
  createdAt: string;
  // History timeline to satisfy 'follow-up history' requirement
  history: Array<{
    id: string;
    note: string;
    status: string;
    followUpDate: string;
    createdAt: string;
  }>;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

interface ILocalDB {
  users: IUser[];
  leads: ILead[];
}

let isMongoConnected = false;

// Initialize Mongo Schemas
const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  company: { type: String, required: true },
  source: { type: String, required: true },
  status: { type: String, enum: ["New", "Contacted", "Follow Up", "Converted", "Lost"], default: "New" },
  notes: { type: String, default: "" },
  followUpDate: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  history: [
    {
      note: { type: String },
      status: { type: String },
      followUpDate: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

// Avoid Mongoose OverwriteModelError
const MongoLead = (mongoose.models.Lead || mongoose.model("Lead", LeadSchema)) as any;

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MongoUser = (mongoose.models.User || mongoose.model("User", UserSchema)) as any;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("⚠️ No MONGODB_URI environment variable detected. Falling back to secure local file storage.");
    initLocalDB();
    return;
  }

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log("⚡ MongoDB connected successfully.");
    await seedDefaultAdmin();
  } catch (error: any) {
    console.error("❌ MongoDB connection error:", error.message);
    console.log("⚠️ Falling back to clean local file storage due to connection failure.");
    isMongoConnected = false;
    initLocalDB();
  }
}

// -----------------------------------------------------------------------------
// LOCAL FILE-BASED STORAGE ENGINE (SAFE & ROBUST FOR PREVIEW)
// -----------------------------------------------------------------------------
function initLocalDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const salt = bcryptjs.genSaltSync(10);
    const defaultPass = process.env.DEFAULT_ADMIN_PASSWORD || "AdminPassword2026!";
    const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@crm.com";
    const passHash = bcryptjs.hashSync(defaultPass, salt);

    const initialData: ILocalDB = {
      users: [
        {
          id: "admin-default-id",
          name: "System Admin",
          email: defaultEmail,
          passwordHash: passHash,
          createdAt: new Date().toISOString()
        }
      ],
      leads: [
        {
          id: "lead-1",
          name: "Sarah Jenkins",
          email: "sarah.j@techstart.io",
          phone: "555-0199",
          company: "TechStart Inc",
          source: "Website",
          status: "New",
          notes: "Filled contact form. Interested in premium tier.",
          followUpDate: "2026-06-05",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          history: [
            {
              id: "h1",
              note: "Lead created via website contact form integration.",
              status: "New",
              followUpDate: "2026-06-05",
              createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: "lead-2",
          name: "Michael Chen",
          email: "michael@quantum-labs.com",
          phone: "555-0248",
          company: "Quantum Labs",
          source: "LinkedIn",
          status: "Contacted",
          notes: "Reached out via LinkedIn DM. Sent our services deck.",
          followUpDate: "2026-06-03",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          history: [
            {
              id: "h2",
              note: "Contacted Michael. Sent pricing matrix. Waiting on feedback.",
              status: "Contacted",
              followUpDate: "2026-06-03",
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: "lead-3",
          name: "Jessica Alva",
          email: "j.alva@referralhub.net",
          phone: "555-0371",
          company: "ReferralHub Ltd",
          source: "Referral",
          status: "Follow Up",
          notes: "Needs minor security integrations. Follow up to resolve technical questions.",
          followUpDate: "2026-06-02",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          history: [
            {
              id: "h3",
              note: "Completed initial discovery call. Booked custom tech review.",
              status: "Follow Up",
              followUpDate: "2026-06-02",
              createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: "lead-4",
          name: "Daniel Craig",
          email: "daniel@royal-ops.uk",
          phone: "555-0421",
          company: "Royal Ops Ltd",
          source: "Instagram",
          status: "Converted",
          notes: "Acquired CRM subscription! Closed deal with account representative.",
          followUpDate: "",
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          history: [
            {
              id: "h4",
              note: "Verified contract signature. Successfully closed deal.",
              status: "Converted",
              followUpDate: "",
              createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf8");
    console.log("📂 Local Database initialized with default records.");
  }
}

function readLocalDB(): ILocalDB {
  try {
    initLocalDB();
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Local database read error:", e);
    return { users: [], leads: [] };
  }
}

function writeLocalDB(data: ILocalDB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("Local database write error:", e);
  }
}

async function seedDefaultAdmin() {
  if (isMongoConnected) {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@crm.com";
    const existing = await MongoUser.findOne({ email: adminEmail });
    if (!existing) {
      const salt = await bcryptjs.genSalt(10);
      const defaultPass = process.env.DEFAULT_ADMIN_PASSWORD || "AdminPassword2026!";
      const passHash = await bcryptjs.hashSync(defaultPass, salt);
      await MongoUser.create({
        name: "System Admin",
        email: adminEmail,
        passwordHash: passHash,
      });
      console.log(`👤 MongoDB Admin seeded successfully: ${adminEmail}`);
    }
  }
}

// -----------------------------------------------------------------------------
// UNIFIED DATABASE SERVICE INTERFACES
// -----------------------------------------------------------------------------
export const DB = {
  isMongoDB: () => isMongoConnected,

  // User Authentication Data Access
  users: {
    findByEmail: async (email: string): Promise<IUser | null> => {
      if (isMongoConnected) {
        const u = await MongoUser.findOne({ email: email.toLowerCase() });
        if (!u) return null;
        return {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          createdAt: u.createdAt.toISOString()
        };
      } else {
        const db = readLocalDB();
        const found = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        return found || null;
      }
    },

    findById: async (id: string): Promise<IUser | null> => {
      if (isMongoConnected) {
        const u = await MongoUser.findById(id);
        if (!u) return null;
        return {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          createdAt: u.createdAt.toISOString()
        };
      } else {
        const db = readLocalDB();
        const found = db.users.find(u => u.id === id);
        return found || null;
      }
    },

    create: async (name: string, email: string, passwordHash: string): Promise<IUser> => {
      if (isMongoConnected) {
        const u = await MongoUser.create({ name, email: email.toLowerCase(), passwordHash });
        return {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          createdAt: u.createdAt.toISOString()
        };
      } else {
        const db = readLocalDB();
        const newUser: IUser = {
          id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name,
          email: email.toLowerCase(),
          passwordHash,
          createdAt: new Date().toISOString()
        };
        db.users.push(newUser);
        writeLocalDB(db);
        return newUser;
      }
    }
  },

  // Leads Data Access
  leads: {
    findMany: async (): Promise<ILead[]> => {
      if (isMongoConnected) {
        const list = await MongoLead.find().sort({ createdAt: -1 });
        return list.map((l: any) => ({
          id: l._id.toString(),
          name: l.name,
          email: l.email,
          phone: l.phone,
          company: l.company,
          source: l.source,
          status: l.status,
          notes: l.notes,
          followUpDate: l.followUpDate,
          createdAt: l.createdAt.toISOString(),
          history: (l.history || []).map((h: any) => ({
            id: h._id ? h._id.toString() : `hist-${Math.random()}`,
            note: h.note,
            status: h.status,
            followUpDate: h.followUpDate,
            createdAt: h.createdAt ? h.createdAt.toISOString() : new Date().toISOString()
          }))
        }));
      } else {
        const db = readLocalDB();
        // Return cloned leads sorted by descending dates
        return [...db.leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    },

    findById: async (id: string): Promise<ILead | null> => {
      if (isMongoConnected) {
        try {
          const l = await MongoLead.findById(id);
          if (!l) return null;
          return {
            id: l._id.toString(),
            name: l.name,
            email: l.email,
            phone: l.phone,
            company: l.company,
            source: l.source,
            status: l.status,
            notes: l.notes,
            followUpDate: l.followUpDate,
            createdAt: l.createdAt.toISOString(),
            history: (l.history || []).map((h: any) => ({
              id: h._id ? h._id.toString() : `hist-${Math.random()}`,
              note: h.note,
              status: h.status,
              followUpDate: h.followUpDate,
              createdAt: h.createdAt ? h.createdAt.toISOString() : new Date().toISOString()
            }))
          };
        } catch {
          return null;
        }
      } else {
        const db = readLocalDB();
        const found = db.leads.find(l => l.id === id);
        return found ? JSON.parse(JSON.stringify(found)) : null; // deep copy
      }
    },

    create: async (leadData: Omit<ILead, "id" | "createdAt" | "history">): Promise<ILead> => {
      if (isMongoConnected) {
        const initialHistoryItem = {
          note: `Lead created initially | Source: ${leadData.source}.`,
          status: leadData.status,
          followUpDate: leadData.followUpDate,
          createdAt: new Date()
        };

        const l = await MongoLead.create({
          ...leadData,
          history: [initialHistoryItem]
        });

        return {
          id: l._id.toString(),
          name: l.name,
          email: l.email,
          phone: l.phone,
          company: l.company,
          source: l.source,
          status: l.status,
          notes: l.notes,
          followUpDate: l.followUpDate,
          createdAt: l.createdAt.toISOString(),
          history: [{
            id: l.history[0]._id.toString(),
            note: l.history[0].note,
            status: l.history[0].status,
            followUpDate: l.history[0].followUpDate,
            createdAt: l.history[0].createdAt.toISOString()
          }]
        };
      } else {
        const db = readLocalDB();
        const nowStr = new Date().toISOString();
        const newLead: ILead = {
          id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          company: leadData.company,
          source: leadData.source,
          status: leadData.status,
          notes: leadData.notes,
          followUpDate: leadData.followUpDate,
          createdAt: nowStr,
          history: [
            {
              id: `hist-${Date.now()}-001`,
              note: `Lead created initially | Source: ${leadData.source}.`,
              status: leadData.status,
              followUpDate: leadData.followUpDate,
              createdAt: nowStr
            }
          ]
        };
        db.leads.push(newLead);
        writeLocalDB(db);
        return newLead;
      }
    },

    update: async (id: string, updateData: Partial<Omit<ILead, "id" | "createdAt" | "history">>): Promise<ILead | null> => {
      if (isMongoConnected) {
        try {
          const l = await MongoLead.findById(id);
          if (!l) return null;

          // Track specific status or notes modifications to add to the follow-up history
          let notesChanged = updateData.notes !== undefined && updateData.notes !== l.notes;
          let statusChanged = updateData.status !== undefined && updateData.status !== l.status;
          let dateChanged = updateData.followUpDate !== undefined && updateData.followUpDate !== l.followUpDate;

          // Apply changes
          if (updateData.name !== undefined) l.name = updateData.name;
          if (updateData.email !== undefined) l.email = updateData.email;
          if (updateData.phone !== undefined) l.phone = updateData.phone;
          if (updateData.company !== undefined) l.company = updateData.company;
          if (updateData.source !== undefined) l.source = updateData.source;
          if (updateData.status !== undefined) l.status = updateData.status;
          if (updateData.notes !== undefined) l.notes = updateData.notes;
          if (updateData.followUpDate !== undefined) l.followUpDate = updateData.followUpDate;

          if (statusChanged || notesChanged || dateChanged) {
            let noteParts = [];
            if (statusChanged) noteParts.push(`Status updated to '${updateData.status}'`);
            if (dateChanged) noteParts.push(`Follow-up date scheduled for '${updateData.followUpDate || "None"}'`);
            if (notesChanged) noteParts.push(`Added timeline detail: "${updateData.notes}"`);

            l.history.push({
              note: noteParts.join(". ") || "Lead information updated.",
              status: l.status,
              followUpDate: l.followUpDate,
              createdAt: new Date()
            });
          }

          await l.save();

          return {
            id: l._id.toString(),
            name: l.name,
            email: l.email,
            phone: l.phone,
            company: l.company,
            source: l.source,
            status: l.status,
            notes: l.notes,
            followUpDate: l.followUpDate,
            createdAt: l.createdAt.toISOString(),
            history: l.history.map((h: any) => ({
              id: h._id ? h._id.toString() : `hist-${Math.random()}`,
              note: h.note,
              status: h.status,
              followUpDate: h.followUpDate,
              createdAt: h.createdAt.toISOString()
            }))
          };
        } catch {
          return null;
        }
      } else {
        const db = readLocalDB();
        const leadIndex = db.leads.findIndex(l => l.id === id);
        if (leadIndex === -1) return null;

        const currentLead = db.leads[leadIndex];
        const nowStr = new Date().toISOString();

        let notesChanged = updateData.notes !== undefined && updateData.notes !== currentLead.notes;
        let statusChanged = updateData.status !== undefined && updateData.status !== currentLead.status;
        let dateChanged = updateData.followUpDate !== undefined && updateData.followUpDate !== currentLead.followUpDate;

        // Apply fields safely
        const updatedLead: ILead = {
          ...currentLead,
          ...updateData,
          history: [...currentLead.history]
        };

        if (statusChanged || notesChanged || dateChanged) {
          let noteParts = [];
          if (statusChanged) noteParts.push(`Status updated to '${updateData.status}'`);
          if (dateChanged) noteParts.push(`Follow-up date scheduled for '${updateData.followUpDate || "None"}'`);
          if (notesChanged) noteParts.push(`Added timeline detail: "${updateData.notes}"`);

          updatedLead.history.push({
            id: `hist-${Date.now()}-${Math.floor(Math.random()*1000)}`,
            note: noteParts.join(". ") || "Lead information updated.",
            status: updatedLead.status,
            followUpDate: updatedLead.followUpDate || "",
            createdAt: nowStr
          });
        }

        db.leads[leadIndex] = updatedLead;
        writeLocalDB(db);
        return JSON.parse(JSON.stringify(updatedLead));
      }
    },

    delete: async (id: string): Promise<boolean> => {
      if (isMongoConnected) {
        try {
          const res = await MongoLead.findByIdAndDelete(id);
          return !!res;
        } catch {
          return false;
        }
      } else {
        const db = readLocalDB();
        const initialLen = db.leads.length;
        db.leads = db.leads.filter(l => l.id !== id);
        writeLocalDB(db);
        return db.leads.length < initialLen;
      }
    }
  }
};
