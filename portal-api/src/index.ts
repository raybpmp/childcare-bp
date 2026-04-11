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

// --- Firebase Admin (token verification only) ---
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || path.join(__dirname, '../service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

// --- MariaDB Pool ---
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ccbp_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Auth Middleware — verifies Firebase ID token and attaches decoded user to req.
 * This is the ONLY gate. No additional auth logic beyond this.
 */
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

// --- Table name validation (alphanumeric + underscores only, prevents injection) ---
const isValidName = (name: string) => /^[a-z0-9_]+$/i.test(name);

// =============================================================================
// TRANSPARENT BRIDGE ROUTES
// These routes authenticate the caller then proxy to the database.
// NO MANAGEMENT LOGIC HERE. NO FEATURE-SPECIFIC ENDPOINTS.
// The frontend (Dashboard) decides what query to run through the mirror.
// =============================================================================

/**
 * POST /api/v1/_query
 * The Absolute Mirror. Executes any SQL provided by the authenticated caller.
 * Used for schema discovery (SHOW TABLES, DESCRIBE) and all management tasks.
 */
app.post('/api/v1/_query', authenticate, async (req: any, res: any) => {
  const { sql, params } = req.body;

  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ error: 'Missing sql field' });
  }

  try {
    // USE .query() for the mirror — .execute() is for prepared statements only
    const [result] = await pool.query(sql, params || []);
    res.json(result);
  } catch (error: any) {
    console.error('_query mirror error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/:table
 * Fetch rows from any table.
 */
app.get('/api/v1/:table', authenticate, async (req: any, res: any) => {
  const { table } = req.params;
  if (!isValidName(table)) return res.status(400).json({ error: 'Invalid table name' });

  try {
    const filters = req.query;
    const filterKeys = Object.keys(filters);
    let query = `SELECT * FROM \`${table}\``;
    let values: any[] = [];

    if (filterKeys.length > 0) {
      const conditions = filterKeys.filter(k => isValidName(k)).map(k => {
        values.push(filters[k]);
        return `\`${k}\` = ?`;
      });
      if (conditions.length > 0) query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const [rows] = await pool.query(query, values);
    res.json(rows);
  } catch (error: any) {
    console.error(`GET /${table} mirror error:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/:table
 * Insert a row into any table.
 */
app.post('/api/v1/:table', authenticate, async (req: any, res: any) => {
  const { table } = req.params;
  const data = req.body;
  if (!isValidName(table)) return res.status(400).json({ error: 'Invalid table name' });

  try {
    const keys = Object.keys(data).filter(k => isValidName(k));
    if (keys.length === 0) return res.status(400).json({ error: 'No valid fields' });

    const columns = keys.map(k => `\`${k}\``).join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(k => data[k]);

    const [result]: any = await pool.query(
      `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders})`,
      values
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error: any) {
    console.error(`POST /${table} mirror error:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/v1/:table/:id
 * Update a row by primary key.
 */
app.put('/api/v1/:table/:id', authenticate, async (req: any, res: any) => {
  const { table, id } = req.params;
  const data = req.body;
  if (!isValidName(table)) return res.status(400).json({ error: 'Invalid table name' });

  try {
    const keys = Object.keys(data).filter(k => isValidName(k));
    if (keys.length === 0) return res.status(400).json({ error: 'No valid fields' });

    const setClause = keys.map(k => `\`${k}\` = ?`).join(', ');
    const values = keys.map(k => data[k]);

    const idColumn = req.query.key || 'id';
    if (!isValidName(idColumn)) return res.status(400).json({ error: 'Invalid key column' });

    values.push(id);
    const [result]: any = await pool.query(
      `UPDATE \`${table}\` SET ${setClause} WHERE \`${idColumn}\` = ?`,
      values
    );
    res.json({ success: true, affected: result.affectedRows });
  } catch (error: any) {
    console.error(`PUT /${table}/${id} mirror error:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/v1/:table/:id
 * Delete a row by primary key.
 */
app.delete('/api/v1/:table/:id', authenticate, async (req: any, res: any) => {
  const { table, id } = req.params;
  if (!isValidName(table)) return res.status(400).json({ error: 'Invalid table name' });

  try {
    const idColumn = req.query.key || 'id';
    if (!isValidName(idColumn)) return res.status(400).json({ error: 'Invalid key column' });

    const [result]: any = await pool.query(
      `DELETE FROM \`${table}\` WHERE \`${idColumn}\` = ?`,
      [id]
    );
    res.json({ success: true, affected: result.affectedRows });
  } catch (error: any) {
    console.error(`DELETE /${table}/${id} mirror error:`, error);
    res.status(500).json({ error: error.message });
  }
});

// --- Health Check (no auth required) ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Portal API bridge running on port ${PORT}`);
});
