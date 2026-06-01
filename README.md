# Client Lead Management System (Mini CRM)
A complete, premium, production-ready, full-stack CRM and pipeline management portal. Designed for businesses to capture, qualify, negotiate, and track contact leads from initial website submissions to successful deals.

---

## 🚀 Architectural Highlight: Dynamic Hybrid DB Fallback
To ensure a **flawless out-of-the-box experience in sandboxed preview containers**, the database uses a robust **Data Access Abstraction Layer** in `server/config/db.ts`:
- **Direct MongoDB Integrations**: When a custom `MONGODB_URI` secret key is supplied, the system immediately binds schemas onto a live **MongoDB Atlas** cluster using **Mongoose**.
- **Sandboxed Local File Database Fallback**: If no MongoDB connection string is provided, the application automatically boots from a structured, synchronous, local file-based database in `./data/db.json`. High-speed CRUD, tracking metrics, session credentials, and follow-up timelines remain **100% functional, persistent, and active** during sand sandbox reviews without crashing!

---

## 🛠️ Stack Profile
- **Frontend Core**: React 19 (functional hooks) + Tailwind CSS (v4)
- **Fluid Layout Transitions**: Framer Motion (`motion/react`)
- **Backend Service**: Node.js + Express.js API cluster
- **Authentication Protocol**: JWT (HMAC-SHA256) + BCrypt access logs
- **E-Mail Alerts System**: Nodemailer + SMTP trigger integrations
- **Persistence Store**: Mongoose (MongoDB) OR dynamic local JSON fallback

---

## 📂 Project Structure
```text
/
├── data/                    # Local storage fallback database records directory
│   └── db.json              # Persistent JSON database (Users, Leads & Timelines)
├── server/
│   ├── config/              
│   │   └── db.ts            # Dynamic Hybrid Storage engine (MongoDB/JSON DB)
│   ├── controllers/         
│   │   ├── authController.ts # Administrator JWT authentication actions
│   │   └── leadController.ts # Lead CRUD & Timeline transaction operations
│   ├── middleware/          
│   │   └── authMiddleware.ts # JWT secure route interceptor
│   ├── routes/              
│   │   ├── authRoutes.ts    # Authentication router bindings
│   │   └── leadRoutes.ts    # Secured lead registry actions
│   └── services/            
│       └── notificationService.ts # Nodemailer alerts & SMTP dispatch
├── src/
│   ├── components/          # Sharable client visual nodes
│   ├── context/             
│   │   ├── AuthContext.tsx  # Caches tokens & Administrator sessions
│   │   ├── ThemeContext.tsx # Maintains Light/Dark visual appearance
│   │   └── ToastContext.tsx # Stateful animated slide-in alerts (Framer Motion)
│   ├── pages/               
│   │   ├── LoginPage.tsx    # Administrator access terminal
│   │   ├── DashboardPage.tsx# KPIs, SVG trends, bento charts & recent logs
│   │   ├── LeadsPage.tsx    # Advanced filters, searches, sorting & tables
│   │   ├── AddLeadPage.tsx  # Ingest validator form and SMTP alert hints
│   │   ├── LeadDetailPage.tsx# Details form & historic timeline logger
│   │   └── SettingsPage.tsx # Core checks, DB diagnostics, and SMTP readouts
│   ├── App.tsx              # Sidebar frameworks, mobile panels & animation frame switcher
│   ├── index.css            # Google font integrations & Tailwind v4
│   └── types.ts             # Global TS definitions
├── server.ts                # Main Full-stack Node server (Vite-middleware router)
├── package.json             # Dev compile and package scripts
└── tsconfig.json            # Strict TypeScript configuration parameters
```

---

## 🔑 Environment Settings (`.env`)
To customize persistent keys and SMTP alerts, copy `/ .env.example` into a local `/ .env` file:
```env
# MongoDB Connection String (leave blank to use the secure sandboxed local JSON-file fallback!)
MONGODB_URI="mongodb+srv://<user>:<pass>@cluster0.abc.mongodb.net/crm"

# JWT secret passphrase for signing administrative security tokens
JWT_SECRET="super-secret-key-crm-2026"

# Pre-seeded administrator credentials on boot/fallback mode
DEFAULT_ADMIN_EMAIL="admin@crm.com"
DEFAULT_ADMIN_PASSWORD="AdminPassword2026!"

# SMTP Nodemailer Credentials for real email alerts (e.g., Mailtrap, SendGrid, Gmail SES)
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="your-smtp-token-username"
SMTP_PASS="your-smtp-token-password"
SMTP_FROM="alerts@crm.com"
ADMIN_EMAIL="amruthabethu9@gmail.com"
```

---

## ⚡ Setup & Execution Processes

### 1. Initialize Roster
Install all node dependencies compiled for the pipeline:
```bash
npm install
```

### 2. Live Local Development Mode
Launch Vite and the full-stack Express server concurrently on port 3000:
```bash
npm run dev
```
Open [http://localhost:3000/](http://localhost:3000/) in your web browser. Under development mode, Vite will dynamically mount live modules inside the Node runtime.

### 3. Production Bundling & Deployment
Build the optimized static assets and compile the Express server into a standalone self-contained CJS file to bypass server execution resolution conflicts:
```bash
npm run build
```

Then, launch the production-ready server utilizing node standard runtime:
```bash
npm start
```

---

## 👤 Immediate Trial Credentials (Pre-seeded DB)
You can log in immediately upon booting the application using the following admin test key:
- **Email**: `admin@crm.com`
- **Passphrase**: `AdminPassword2026!`
