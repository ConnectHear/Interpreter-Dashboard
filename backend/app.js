require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// DB Config — values come from .env file
const dbConfig = {
    host: (process.env.DB_HOST || '127.0.0.1').trim(),
    port: Number(process.env.DB_PORT) || 3306,
    user: (process.env.DB_USER || 'staging7connecthear8org6_staging').trim(),
    password: (process.env.DB_PASS || 'Abcd!234Abcd!234').trim(),
    database: (process.env.DB_NAME || 'staging7connecthear8org6_staging').trim(),
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 10000,
};

console.log('--- Database Config ---');
console.log('Host:', dbConfig.host);
console.log('User:', dbConfig.user);
console.log('DB:', dbConfig.database);
console.log('-----------------------');

let pool;
(async () => {
    try {
        pool = mysql.createPool(dbConfig);
        const conn = await pool.getConnection();
        console.log(`✅ MySQL connected to ${dbConfig.host} as ${dbConfig.user}`);
        conn.release();
    } catch (err) {
        console.error(`❌ MySQL connection failed to ${dbConfig.host} for user ${dbConfig.user}:`, err.message);
        console.error('TIP: If the DB is remote, change DB_HOST in your .env file from 127.0.0.1 to the server IP.');
    }
})();

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

// GET /api/dashboard/stats
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);

        const [[{ total_interpreters }]] = await pool.query(
            `SELECT COUNT(*) AS total_interpreters FROM interpreter`
        );
        const [[{ active_interpreters }]] = await pool.query(
            `SELECT COUNT(*) AS active_interpreters FROM interpreter WHERE online_status = 1`
        );
        const [[{ on_call }]] = await pool.query(
            `SELECT COUNT(*) AS on_call FROM interpreter WHERE on_call_status = 1`
        );
        const [[{ total_customers }]] = await pool.query(
            `SELECT COUNT(*) AS total_customers FROM customers`
        );
        const [[{ calls_today }]] = await pool.query(
            `SELECT COUNT(*) AS calls_today FROM monitoring_sessions WHERE DATE(created_at) = ?`,
            [today]
        );
        const [[{ missed_today }]] = await pool.query(
            `SELECT COUNT(*) AS missed_today FROM monitoring_sessions WHERE DATE(created_at) = ? AND status = 3`,
            [today]
        );
        const [[{ completed_today }]] = await pool.query(
            `SELECT COUNT(*) AS completed_today FROM monitoring_sessions WHERE DATE(created_at) = ? AND status = 2`,
            [today]
        );
        const [[{ pending_today }]] = await pool.query(
            `SELECT COUNT(*) AS pending_today FROM monitoring_sessions WHERE DATE(created_at) = ? AND status = 0`,
            [today]
        );

        res.json({
            total_interpreters,
            active_interpreters,
            on_call,
            total_customers,
            calls_today,
            missed_today,
            completed_today,
            pending_today,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/dashboard/calls-trend  (last 7 days)
app.get('/api/dashboard/calls-trend', async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS total,
        SUM(status = 2) AS completed,
        SUM(status = 3) AS cancelled,
        SUM(status = 0) AS pending
      FROM monitoring_sessions
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/dashboard/recent-sessions
app.get('/api/dashboard/recent-sessions', async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT ms.monitoring_id, ms.status, ms.duration, ms.is_chat, ms.created_at,
             c.name AS customer_name, c.email AS customer_email,
             i.name AS interpreter_name
      FROM monitoring_sessions ms
      LEFT JOIN customers c ON c.customer_id = ms.customer_id
      LEFT JOIN interpreter i ON i.interpreter_id = ms.interpreter_id
      ORDER BY ms.created_at DESC
      LIMIT 10
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/dashboard/interpreter-status-distribution
app.get('/api/dashboard/interpreter-status', async (req, res) => {
    try {
        const [[{ online }]] = await pool.query(`SELECT COUNT(*) AS online FROM interpreter WHERE online_status=1 AND on_call_status=0`);
        const [[{ on_call }]] = await pool.query(`SELECT COUNT(*) AS on_call FROM interpreter WHERE on_call_status=1`);
        const [[{ offline }]] = await pool.query(`SELECT COUNT(*) AS offline FROM interpreter WHERE online_status=0`);
        res.json([
            { name: 'Online', value: online },
            { name: 'On Call', value: on_call },
            { name: 'Offline', value: offline },
        ]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── INTERPRETERS ─────────────────────────────────────────────────────────────

// GET /api/interpreters
app.get('/api/interpreters', async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT 
        i.*,
        COALESCE(ms_stats.total_calls, 0) AS total_calls,
        COALESCE(ms_stats.accepted_calls, 0) AS accepted_calls,
        COALESCE(ms_stats.cancelled_calls, 0) AS cancelled_calls,
        COALESCE(inr_stats.missed_calls, 0) AS missed_calls,
        ms_stats.last_call_time
      FROM interpreter i
      LEFT JOIN (
        SELECT 
          interpreter_id, 
          COUNT(*) AS total_calls,
          SUM(status = 2) AS accepted_calls,
          SUM(status = 3) AS cancelled_calls,
          MAX(created_at) AS last_call_time
        FROM monitoring_sessions
        GROUP BY interpreter_id
      ) ms_stats ON i.interpreter_id = ms_stats.interpreter_id
      LEFT JOIN (
        SELECT 
          interpreter_id,
          COUNT(*) AS missed_calls
        FROM interpreter_notification_responses
        GROUP BY interpreter_id
      ) inr_stats ON i.interpreter_id = inr_stats.interpreter_id
      ORDER BY i.name ASC
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/interpreters/:id
app.get('/api/interpreters/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [[interpreter]] = await pool.query(
            `SELECT * FROM interpreter WHERE interpreter_id = ?`, [id]
        );
        if (!interpreter) return res.status(404).json({ error: 'Not found' });

        // Call history with date filter
        const { filter = 'all' } = req.query;
        let dateFilter = '';
        if (filter === 'daily') dateFilter = `AND DATE(ms.created_at) = CURDATE()`;
        else if (filter === 'weekly') dateFilter = `AND ms.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
        else if (filter === 'monthly') dateFilter = `AND ms.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
        else if (filter === 'yearly') dateFilter = `AND ms.created_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)`;

        const [calls] = await pool.query(`
      SELECT ms.*, c.name AS customer_name, c.email AS customer_email
      FROM monitoring_sessions ms
      LEFT JOIN customers c ON c.customer_id = ms.customer_id
      WHERE ms.interpreter_id = ? ${dateFilter}
      ORDER BY ms.created_at DESC
    `, [id]);

        const [missed] = await pool.query(`
      SELECT inr.*, c.name AS customer_name
      FROM interpreter_notification_responses inr
      LEFT JOIN customers c ON c.customer_id = inr.customer_id
      WHERE inr.interpreter_id = ?
      ORDER BY inr.missed_call_time DESC
    `, [id]);

        // Daily breakdown for the last 30 days
        const [dailyStats] = await pool.query(`
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS total,
        SUM(status = 2) AS completed,
        SUM(status = 3) AS cancelled
      FROM monitoring_sessions
      WHERE interpreter_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [id]);

        res.json({ interpreter, calls, missed, dailyStats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── CUSTOMERS ────────────────────────────────────────────────────────────────

// GET /api/customers
app.get('/api/customers', async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT 
        c.*,
        COALESCE(ms_stats.total_calls, 0) AS total_calls,
        COALESCE(ms_stats.completed_calls, 0) AS completed_calls,
        COALESCE(ms_stats.cancelled_calls, 0) AS cancelled_calls,
        COALESCE(inr_stats.missed_by_interpreters, 0) AS missed_by_interpreters,
        ms_stats.last_call
      FROM customers c
      LEFT JOIN (
        SELECT 
          customer_id,
          COUNT(*) AS total_calls,
          SUM(status = 2) AS completed_calls,
          SUM(status = 3) AS cancelled_calls,
          MAX(created_at) AS last_call
        FROM monitoring_sessions
        GROUP BY customer_id
      ) ms_stats ON c.customer_id = ms_stats.customer_id
      LEFT JOIN (
        SELECT 
          customer_id,
          COUNT(*) AS missed_by_interpreters
        FROM interpreter_notification_responses
        GROUP BY customer_id
      ) inr_stats ON c.customer_id = inr_stats.customer_id
      ORDER BY total_calls DESC
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/customers/:id
app.get('/api/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [[customer]] = await pool.query(
            `SELECT * FROM customers WHERE customer_id = ?`, [id]
        );
        if (!customer) return res.status(404).json({ error: 'Not found' });

        const [calls] = await pool.query(`
      SELECT ms.*, i.name AS interpreter_name
      FROM monitoring_sessions ms
      LEFT JOIN interpreter i ON i.interpreter_id = ms.interpreter_id
      WHERE ms.customer_id = ?
      ORDER BY ms.created_at DESC
    `, [id]);

        const [missedByInterpreters] = await pool.query(`
      SELECT inr.*, i.name AS interpreter_name
      FROM interpreter_notification_responses inr
      LEFT JOIN interpreter i ON i.interpreter_id = inr.interpreter_id
      WHERE inr.customer_id = ?
      ORDER BY inr.missed_call_time DESC
    `, [id]);

        res.json({ customer, calls, missedByInterpreters });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── MISSED CALLS ─────────────────────────────────────────────────────────────
app.get('/api/missed-calls', async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT inr.*, 
             i.name AS interpreter_name_detail,
             c.name AS customer_name_detail
      FROM interpreter_notification_responses inr
      LEFT JOIN interpreter i ON i.interpreter_id = inr.interpreter_id
      LEFT JOIN customers c ON c.customer_id = inr.customer_id
      ORDER BY inr.missed_call_time DESC
      LIMIT 100
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
});