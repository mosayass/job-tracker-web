const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Allows the frontend to talk to this API
app.use(express.json()); // Automatically parses incoming JSON payloads (like [FromBody] in C#)

// Database Connection Configuration
const pool = new Pool({
    user: 'postgres',       
    host: 'localhost',
    database: 'jobtracker_db', 
    password: '123456', 
    port: 5432,
});

// "EnsureCreated" Logic: Create table if it doesn't exist
const initDb = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS jobs (
            id VARCHAR(255) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            company VARCHAR(255) NOT NULL,
            url TEXT,
            status VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(createTableQuery);
        console.log("Database initialized: 'jobs' table is ready.");
    } catch (err) {
        console.error("Error creating table:", err);
    }
};

initDb();

// --- API ROUTES (Controllers) ---

// GET: Retrieve all jobs
app.get('/api/jobs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Add a new job
app.post('/api/jobs', async (req, res) => {
    try {
        const { id, title, company, url, status, createdAt } = req.body;
        
        try {
            new URL(url);
        } catch (_) {
            return res.status(400).json({ error: "Invalid URL provided." });
        }

        const insertQuery = `
            INSERT INTO jobs (id, title, company, url, status, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;
        const result = await pool.query(insertQuery, [id, title, company, url, status, createdAt]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Update a job's status
app.put('/api/jobs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updateQuery = 'UPDATE jobs SET status = $1 WHERE id = $2 RETURNING *;';
        const result = await pool.query(updateQuery, [status, id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Remove a job
app.delete('/api/jobs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM jobs WHERE id = $1;', [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
});