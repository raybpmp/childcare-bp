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
// No hardcoded table assumptions. No forced WHERE clauses.
// The frontend decides what to query; this API just executes it safely.
// =============================================================================

/**
 * GET /api/v1/:table
 * Fetch rows from any table. Supports optional query params for filtering.
 * Example: GET /api/v1/users?uid=abc123&role=member
 * If no query params, returns all rows from the table.
 */
app.get('/api/v1/:table', authenticate, async (req: any, res: any) => {
  const { table } = req.params;

  if (!isValidName(table)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  try {
    const filters = req.query;
    const filterKeys = Object.keys(filters);

    let query = `SELECT * FROM \`${table}\``;
    let values: any[] = [];

    if (filterKeys.length > 0) {
      const conditions = filterKeys
        .filter(k => isValidName(k))
        .map(k => {
          values.push(filters[k]);
          return `\`${k}\` = ?`;
        });
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
    }

    const [rows] = await pool.execute(query, values);
    res.json(rows);
  } catch (error: any) {
    console.error(`GET /${table} error:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/:table
 * Insert a row into any table. Body is the row data.
 * The authenticated user's UID is available via req.user.uid
 * but is NOT auto-injected — the frontend decides what fields to send.
 */
app.post('/api/v1/:table', authenticate, async (req: any, res: any) => {
  const { table } = req.params;
  const data = req.body;

  if (!isValidName(table)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  try {
    const keys = Object.keys(data).filter(k => isValidName(k));
    if (keys.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided' });
    }

    const columns = keys.map(k => `\`${k}\``).join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(k => data[k]);

    const [result]: any = await pool.execute(
      `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders})`,
      values
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (error: any) {
    console.error(`POST /${table} error:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/v1/:table/:id
 * Update a row by primary key. Body contains the fields to update.
 * :id matches against the `id` column by default, or `uid` if `id` doesn't exist.
 */
app.put('/api/v1/:table/:id', authenticate, async (req: any, res: any) => {
  const { table, id } = req.params;
  const data = req.body;

  if (!isValidName(table)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  try {
    const keys = Object.keys(data).filter(k => isValidName(k));
    if (keys.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided' });
    }

    const setClause = keys.map(k => `\`${k}\` = ?`).join(', ');
    const values = keys.map(k => data[k]);

    // Determine primary key column: try `id` first, fall back to `uid`
    const idColumn = req.query.key || 'id';
    if (!isValidName(idColumn)) {
      return res.status(400).json({ error: 'Invalid key column name' });
    }

    values.push(id);

    const [result]: any = await pool.execute(
      `UPDATE \`${table}\` SET ${setClause} WHERE \`${idColumn}\` = ?`,
      values
    );

    res.json({ success: true, affected: result.affectedRows });
  } catch (error: any) {
    console.error(`PUT /${table}/${id} error:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/v1/:table/:id
 * Delete a row by primary key.
 */
app.delete('/api/v1/:table/:id', authenticate, async (req: any, res: any) => {
  const { table, id } = req.params;

  if (!isValidName(table)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  try {
    const idColumn = req.query.key || 'id';
    if (!isValidName(idColumn)) {
      return res.status(400).json({ error: 'Invalid key column name' });
    }

    const [result]: any = await pool.execute(
      `DELETE FROM \`${table}\` WHERE \`${idColumn}\` = ?`,
      [id]
    );

    res.json({ success: true, affected: result.affectedRows });
  } catch (error: any) {
    console.error(`DELETE /${table}/${id} error:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/_query
 * Execute a raw SELECT query. For advanced use cases the simple CRUD routes can't cover.
 * Only SELECT statements are allowed (read-only).
 */
app.post('/api/v1/_query', authenticate, async (req: any, res: any) => {
  const { sql, params } = req.body;

  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ error: 'Missing sql field' });
  }

  // Safety: only allow SELECT statements
  const trimmed = sql.trim().toUpperCase();
  if (!trimmed.startsWith('SELECT')) {
    return res.status(403).json({ error: 'Only SELECT queries are allowed via _query' });
  }

  try {
    const [rows] = await pool.execute(sql, params || []);
    res.json(rows);
  } catch (error: any) {
    console.error('_query error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/_schema/:table
 * Returns the column definitions for a table. Useful for dynamic UI generation.
 */
app.get('/api/v1/_schema/:table', authenticate, async (req: any, res: any) => {
  const { table } = req.params;

  if (!isValidName(table)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  try {
    const [rows] = await pool.execute(`DESCRIBE \`${table}\``);
    res.json(rows);
  } catch (error: any) {
    console.error(`DESCRIBE ${table} error:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/_tables
 * Lists all tables in the database.
 */
app.get('/api/v1/_tables', authenticate, async (req: any, res: any) => {
  try {
    const [rows] = await pool.execute('SHOW TABLES');
    res.json(rows);
  } catch (error: any) {
    console.error('SHOW TABLES error:', error);
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
