import mongoose from 'mongoose';
import { initialMilestones } from './data/seedMilestones.js';

let cachedDb = null;

const milestoneSchema = new mongoose.Schema({
  serialNumber: { type: Number, required: true, unique: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  targetDate: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  remarks: { type: String, default: '' }
}, { timestamps: true });

const getModel = () => {
  return mongoose.models.Milestone || mongoose.model('Milestone', milestoneSchema);
};

const connectToDatabase = async () => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined in Netlify');
  }

  const db = await mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000
  });

  // Seed if empty
  const Milestone = getModel();
  const count = await Milestone.countDocuments();
  if (count === 0) {
    await Milestone.insertMany(initialMilestones);
  }

  cachedDb = db;
  return db;
};

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const path = event.path.replace('/.netlify/functions/api', '').replace('/api', '') || '/';
  const method = event.httpMethod;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    await connectToDatabase();
    const Milestone = getModel();

    // GET /api/milestones or /api/milestones/
    if (method === 'GET' && (path === '/milestones' || path === '/milestones/' || path === '/')) {
      const items = await Milestone.find().sort({ serialNumber: 1 }).lean();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          count: items.length,
          data: items.map(i => ({ ...i, id: i._id.toString() }))
        })
      };
    }

    // GET /api/milestones/stats
    if (method === 'GET' && path === '/milestones/stats') {
      const all = await Milestone.find().lean();
      const total = all.length;
      const completed = all.filter(m => m.completed).length;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            total,
            completed,
            pending: total - completed,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
          }
        })
      };
    }

    // GET /api/milestones/status
    if (method === 'GET' && path === '/milestones/status') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            isMongoConnected: true,
            storageType: 'MongoDB Atlas (Netlify Serverless)',
            uri: 'Configured in Netlify'
          }
        })
      };
    }

    // POST /api/milestones/:id/toggle
    const toggleMatch = path.match(/^\/milestones\/([^/]+)\/toggle$/);
    if (method === 'POST' && toggleMatch) {
      const idOrSerial = toggleMatch[1];
      const body = JSON.parse(event.body || '{}');
      const { password, completed } = body;

      const expectedPassword = process.env.GATE_TRACKER_PASSWORD || 'Vikas123$';
      if (!password || password !== expectedPassword) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Incorrect password. Confirmation required to update milestone.'
          })
        };
      }

      // Query document
      let doc;
      if (mongoose.Types.ObjectId.isValid(idOrSerial)) {
        doc = await Milestone.findById(idOrSerial);
      } else {
        doc = await Milestone.findOne({ serialNumber: Number(idOrSerial) });
      }

      if (!doc) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ success: false, message: 'Milestone not found' })
        };
      }

      // Update completed and timestamp
      const now = new Date();
      doc.completed = completed;
      doc.completedAt = completed ? now : null;
      await doc.save();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: completed ? 'Milestone marked as completed' : 'Milestone marked as pending',
          data: {
            ...doc.toObject(),
            id: doc._id.toString()
          }
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, message: `Route not found: ${method} ${path}` })
    };
  } catch (error) {
    console.error('API Handler Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message || 'Internal server error'
      })
    };
  }
};
