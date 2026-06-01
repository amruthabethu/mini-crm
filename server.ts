import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { connectDB } from "./server/config/db";
import authRoutes from "./server/routes/authRoutes";
import leadRoutes from "./server/routes/leadRoutes";

// Configure local environment configuration keys
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize unified database engine (MongoDB attempt, falling back securely inside sandbox)
  await connectDB();

  // 1. Configure standard server handlers (JSON body parses, etc.)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 2. Bind backend API business controllers
  app.use("/api/auth", authRoutes);
  app.use("/api/leads", leadRoutes);

  // 3. Integrate dynamic UI assets based on execution mode
  if (process.env.NODE_ENV !== "production") {
    console.log("🛠️ Starting Live Web Development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("📦 Loading production assets from dist/ directory...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // 4. Bind listeners to standard ports
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Full-stack CRM running at http://0.0.0.0:${PORT}/`);
  });
}

startServer().catch((err) => {
  console.error("☠️ Full-stack server crashed on startup:", err);
});
