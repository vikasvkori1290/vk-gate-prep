# Great Preparation 2027 Tracker of Vikas

Plain Black & White GATE CSE preparation tracker featuring all 104 core syllabus milestones, password-protected checkbox confirmations, exact timestamp auditing, and seamless MongoDB integration.

---

## 🚀 Two Ways to Run & Deploy

### Option 1: Direct Deploy to Netlify (Zero Server Hosting Needed)
Netlify runs the React client frontend and uses **Netlify Serverless Functions** (`netlify/functions/api.js`) to connect directly to MongoDB. You do **not** need any separate server running.

1. Push this project to your GitHub repository.
2. In [Netlify](https://app.netlify.com/):
   - Click **"Add new site"** &rarr; **"Import an existing project"** &rarr; select your GitHub repository.
   - Netlify will automatically detect `netlify.toml` (Base directory: `client`, Publish directory: `dist`).
3. Under **Site configuration** &rarr; **Environment variables**, add:
   - `MONGODB_URI`: Your MongoDB connection string (e.g. from MongoDB Atlas Free Tier: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/gate_prep?retryWrites=true&w=majority`).
   - `GATE_TRACKER_PASSWORD`: `Vikas123$`
4. Click **Deploy Site**.
5. Done! Netlify handles both frontend and MongoDB database queries serverlessly in one single deployment.

---

### Option 2: Local Development

#### 1. Start the Backend Server:
```bash
cd server
npm run dev
```
*(Runs on `http://localhost:5000`, connects to MongoDB via `MONGODB_URI` in `server/.env` or uses persistent local JSON fallback).*

#### 2. Start the Frontend Client:
```bash
cd client
npm run dev
```
*(Runs on `http://localhost:3000` and proxies `/api` to the backend).*

---

## 🔒 Password & Timestamp Behavior

- **Confirmation Password**: `Vikas123$`
- **Timestamp Recording**:
  - Checking a milestone requires entering `Vikas123$`.
  - When verified, the exact date and time (e.g. `21 Sept 2026, 07:46:30 pm`) is saved to MongoDB.
  - If you uncheck a milestone and check it again later, a **brand new timestamp** is recorded and saved to MongoDB.
