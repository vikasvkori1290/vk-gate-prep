import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialMilestones } from '../data/seedMilestones.js';
import { Milestone } from '../models/Milestone.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/milestones.json');

let isMongoConnected = false;

// Ensure data folder exists
const ensureDataDir = () => {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const readLocalData = () => {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialMilestones, null, 2), 'utf-8');
    return initialMilestones;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local data file, recreating from seed:', err);
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialMilestones, null, 2), 'utf-8');
    return initialMilestones;
  }
};

const writeLocalData = (data) => {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gate_prep';
  try {
    console.log(`Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    isMongoConnected = true;
    console.log('✅ Successfully connected to MongoDB database.');

    // Seed database if empty
    const count = await Milestone.countDocuments();
    if (count === 0) {
      console.log('Seeding initial 104 GATE milestones into MongoDB...');
      await Milestone.insertMany(initialMilestones);
      console.log('✅ 104 milestones seeded successfully into MongoDB.');
    }
  } catch (error) {
    isMongoConnected = false;
    console.warn('⚠️ MongoDB connection could not be established:', error.message);
    console.log('📁 Active Fallback: Using persistent local JSON database at server/data/milestones.json');
    readLocalData(); // Ensure seeded
  }
};

export const getDBStatus = () => {
  return {
    isMongoConnected,
    storageType: isMongoConnected ? 'MongoDB' : 'Persistent Local JSON (Fallback)',
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gate_prep'
  };
};

export const dbService = {
  async getAll() {
    if (isMongoConnected) {
      const items = await Milestone.find().sort({ serialNumber: 1 }).lean();
      return items.map(item => ({
        ...item,
        id: item._id.toString()
      }));
    } else {
      const items = readLocalData();
      return items.map(item => ({
        ...item,
        id: item.id || `local_${item.serialNumber}`
      }));
    }
  },

  async toggleMilestone(idOrSerialNumber, newCompletedState) {
    const now = new Date().toISOString();
    const completedAt = newCompletedState ? now : null;

    if (isMongoConnected) {
      let doc;
      if (mongoose.Types.ObjectId.isValid(idOrSerialNumber)) {
        doc = await Milestone.findById(idOrSerialNumber);
      } else {
        doc = await Milestone.findOne({ serialNumber: Number(idOrSerialNumber) });
      }

      if (!doc) {
        throw new Error('Milestone not found');
      }

      doc.completed = newCompletedState;
      doc.completedAt = completedAt;
      await doc.save();
      return {
        ...doc.toObject(),
        id: doc._id.toString()
      };
    } else {
      const items = readLocalData();
      const index = items.findIndex(
        item => item.id === idOrSerialNumber || 
                String(item.serialNumber) === String(idOrSerialNumber) ||
                `local_${item.serialNumber}` === idOrSerialNumber
      );

      if (index === -1) {
        throw new Error('Milestone not found');
      }

      items[index].completed = newCompletedState;
      items[index].completedAt = completedAt;
      writeLocalData(items);

      return {
        ...items[index],
        id: items[index].id || `local_${items[index].serialNumber}`
      };
    }
  },

  async resetAll() {
    if (isMongoConnected) {
      await Milestone.deleteMany({});
      await Milestone.insertMany(initialMilestones);
      const items = await Milestone.find().sort({ serialNumber: 1 }).lean();
      return items.map(item => ({ ...item, id: item._id.toString() }));
    } else {
      writeLocalData(initialMilestones);
      return readLocalData();
    }
  },

  async getStats() {
    const all = await this.getAll();
    const total = all.length;
    const completed = all.filter(m => m.completed).length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const subjectsMap = {};
    for (const item of all) {
      if (!subjectsMap[item.subject]) {
        subjectsMap[item.subject] = { total: 0, completed: 0 };
      }
      subjectsMap[item.subject].total += 1;
      if (item.completed) {
        subjectsMap[item.subject].completed += 1;
      }
    }

    return {
      total,
      completed,
      pending,
      percentage,
      subjectsMap
    };
  }
};
