import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getWeatherCollection } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mausamvani_super_secret_jwt_key_2026';

// Configurable Admin Credentials (NDMA / IMD Control Room)
const DEFAULT_ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@mausam.gov.in',
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
  name: 'Officer Rajesh Sharma',
  badge: 'IND-NDMA-0913',
  role: 'CHIEF_DISASTER_CONTROLLER',
  department: 'National Disaster Management Authority (NDMA)'
};

export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Official email and security passkey are required.' });
    }

    // Authenticate against admin record
    if (email.toLowerCase() !== DEFAULT_ADMIN.email.toLowerCase() || password !== DEFAULT_ADMIN.password) {
      return res.status(401).json({ error: 'Invalid officer credentials or unauthorized access attempt.' });
    }

    // Generate JWT Token valid for 24 hours
    const token = jwt.sign(
      {
        email: DEFAULT_ADMIN.email,
        name: DEFAULT_ADMIN.name,
        badge: DEFAULT_ADMIN.badge,
        role: DEFAULT_ADMIN.role,
        department: DEFAULT_ADMIN.department
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`[AUTH SUCCESS] Admin logged in: ${DEFAULT_ADMIN.name} (${DEFAULT_ADMIN.badge})`);

    res.json({
      success: true,
      message: 'Administrative authentication successful.',
      token,
      officer: {
        email: DEFAULT_ADMIN.email,
        name: DEFAULT_ADMIN.name,
        badge: DEFAULT_ADMIN.badge,
        role: DEFAULT_ADMIN.role,
        department: DEFAULT_ADMIN.department
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAdminProfile(req, res) {
  try {
    res.json({
      success: true,
      officer: req.admin
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateVerificationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'VERIFIED' | 'HOAX' | 'UNVERIFIED'

    if (!['VERIFIED', 'HOAX', 'UNVERIFIED'].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'VERIFIED', 'HOAX', or 'UNVERIFIED'." });
    }

    const collection = getWeatherCollection();
    const officerInfo = req.admin || { name: 'Duty Officer', badge: 'NDMA-OPS' };

    let filter = {};
    try {
      filter = { _id: new ObjectId(id) };
    } catch {
      filter = { _id: id };
    }

    const updateDoc = {
      $set: {
        verification_status: status,
        trust_score: status === 'VERIFIED' ? 98 : (status === 'HOAX' ? 5 : 50),
        verified_by: {
          officer_name: officerInfo.name,
          badge: officerInfo.badge,
          department: officerInfo.department
        },
        verified_at: new Date()
      }
    };

    if (collection) {
      const result = await collection.updateOne(filter, updateDoc);
      return res.json({
        success: true,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        message: `Event verification status updated to ${status} by ${officerInfo.name}.`
      });
    }

    res.json({
      success: true,
      message: `Event status updated to ${status} (offline mode).`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
