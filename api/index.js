import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { initialMilestones } from './data/seedMilestones.js';

const app = express();

app.use(cors());
app.use(express.json());

let isConnected = false;

// Mongoose Milestone Schema
const milestoneSchema = new mongoose.Schema({
  serialNumber: { type: Number, required: true, unique: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  targetDate: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  remarks: { type: String, default: '' }
}, { timestamps: true });

const Milestone = mongoose.models.Milestone || mongoose.model('Milestone', milestoneSchema);

// Cached DB Connection for Serverless Execution
const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ MONGODB_URI environment variable not configured in Vercel');
    return;
  }

  try {
    await mongoose.connect(uri, {
      dbName: 'gate_prep',
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000
    });
    isConnected = true;

    // Auto-seed if collection is empty
    const count = await Milestone.countDocuments();
    if (count === 0) {
      await Milestone.insertMany(initialMilestones);
    }
  } catch (error) {
    console.error('MongoDB connection error in Vercel function:', error.message);
  }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// GET /api/milestones
app.get(['/api/milestones', '/api/milestones/'], async (req, res) => {
  try {
    if (isConnected && mongoose.connection.readyState === 1) {
      const items = await Milestone.find().sort({ serialNumber: 1 }).lean();
      return res.json({
        success: true,
        count: items.length,
        data: items.map(i => ({ ...i, id: i._id.toString() }))
      });
    }
    // Fallback if DB is not connected yet
    return res.json({
      success: true,
      count: initialMilestones.length,
      data: initialMilestones
    });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch milestones' });
  }
});

// GET /api/milestones/stats
app.get('/api/milestones/stats', async (req, res) => {
  try {
    if (isConnected && mongoose.connection.readyState === 1) {
      const all = await Milestone.find().lean();
      const total = all.length;
      const completed = all.filter(m => m.completed).length;
      return res.json({
        success: true,
        data: {
          total,
          completed,
          pending: total - completed,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        }
      });
    }
    return res.json({
      success: true,
      data: {
        total: initialMilestones.length,
        completed: 0,
        pending: initialMilestones.length,
        percentage: 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// GET /api/milestones/status
app.get('/api/milestones/status', (req, res) => {
  res.json({
    success: true,
    data: {
      isMongoConnected: isConnected,
      storageType: isConnected ? 'MongoDB Atlas (Vercel Serverless)' : 'Initial Seed (Fallback)',
      provider: 'Vercel'
    }
  });
});

// POST /api/milestones/:id/toggle
app.post('/api/milestones/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { password, completed } = req.body;

    const expectedPassword = process.env.GATE_TRACKER_PASSWORD || 'Vikas123$';
    if (!password || password !== expectedPassword) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Confirmation required to check/uncheck milestone.'
      });
    }

    let doc;
    if (mongoose.Types.ObjectId.isValid(id)) {
      doc = await Milestone.findById(id);
    } else {
      doc = await Milestone.findOne({ serialNumber: Number(id) });
    }

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    doc.completed = completed;
    doc.completedAt = completed ? new Date() : null;
    await doc.save();

    return res.json({
      success: true,
      message: completed ? 'Milestone marked as completed' : 'Milestone marked as pending',
      data: {
        ...doc.toObject(),
        id: doc._id.toString()
      }
    });
  } catch (error) {
    console.error('Error toggling milestone:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update milestone'
    });
  }
});

export default app;
