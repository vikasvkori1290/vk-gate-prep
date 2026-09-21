import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import milestoneRoutes from './routes/milestones.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/milestones', milestoneRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to DB and Start Server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 GATE 2027 Tracker Backend running on port ${PORT}`);
    console.log(`🔑 Default Tracker Password: ${process.env.GATE_TRACKER_PASSWORD || 'gate2027'}`);
  });
};

startServer();
