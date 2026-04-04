import express from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Initialize Firebase Admin
// We expect service-account.json to be in the root of portal-api/
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || path.join(__dirname, '../service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

// 2. Initialize MySQL Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ccbp_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 3. Auth Middleware
const authenticate = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// 4. Universal Proxy Routes

// GET /api/v1/:table
app.get('/api/v1/:table', authenticate, async (req: any, res: any) => {
  const { table } = req.params;
  const uid = req.user.uid;

  try {
    // SECURITY: Use parameterized query to prevent SQL injection
    // NOTE: We only allow alphanumeric table names for safety
    if (!/^[a-z0-9_]+$/i.test(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    const [rows] = await pool.execute(
      `SELECT * FROM \`${table}\` WHERE uid = ?`,
      [uid]
    );
    res.json(rows);
  } catch (error: any) {
    console.error(`Error fetching from ${table}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/:table
app.post('/api/v1/:table', authenticate, async (req: any, res: any) => {
  const { table } = req.params;
  const uid = req.user.uid;
  const data = req.body;

  try {
    if (!/^[a-z0-9_]+$/i.test(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    // Automatically inject the uid into the data
    const rowData = { ...data, uid };

    const keys = Object.keys(rowData).map(key => `\`${key}\``).join(', ');
    const placeholders = Object.keys(rowData).map(() => '?').join(', ');
    const values = Object.values(rowData);

    const [result]: any = await pool.execute(
      `INSERT INTO \`${table}\` (${keys}) VALUES (${placeholders})`,
      values as any[]
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (error: any) {
    console.error(`Error inserting into ${table}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Portal Database Connector running on port ${PORT}`);
});
