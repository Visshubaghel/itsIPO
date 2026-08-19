# itsIPO – IPO Tracker & Account Ledger Application

A minimal, fast, and ultra-sleek fintech web application for managing multi-account IPO applications, tracking money sent and received per person, and maintaining a complete transaction history with automated balance calculations.

## 🚀 Features

- **IPO Applications Hub**: Add new IPOs with automatic batch generation for all active family/friend accounts. Easily update statuses (`Not Applied`, `Applied`, `Approved`, `Allotted` 🎉, `Rejected`) and custom application amounts.
- **Fixed People Accounts**: Maintain account details (Bank/Broker, UPI ID, default IPO application amounts, notes) and toggle active status.
- **Money & History**: Record money sent and received per person, link transfers to specific IPOs, calculate live balances, and search/filter complete transaction logs.
- **Vercel & MongoDB Atlas Ready**: Includes Node.js serverless functions under `/api/*` for MongoDB Atlas integration.
- **Local Persistence & Backup**: Full IndexedDB offline persistence via Dexie.js plus 1-click JSON export/import backups.

---

## 🛠️ Tech Stack

- **Frontend**: Vite, React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Local Database**: IndexedDB (Dexie.js)
- **Cloud Database**: MongoDB Atlas (Serverless API)
- **Deployment**: Vercel (`vercel.json`)

---

## 📦 Deployment to Vercel with MongoDB Atlas

1. **Import Repository to Vercel**: Connect your GitHub repository `https://github.com/Visshubaghel/itsIPO.git` to Vercel.
2. **Configure Environment Variable**:
   In your Vercel Project Settings ➔ **Environment Variables**, add:
   - `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
   - `MONGODB_DB`: `ipo_tracker` (optional)
3. **Deploy**: Vercel will automatically host the Vite frontend and Node.js serverless endpoints in `/api/*`.

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/Visshubaghel/itsIPO.git
cd itsIPO

# Install dependencies
npm install

# Run dev server
npm run dev
```
