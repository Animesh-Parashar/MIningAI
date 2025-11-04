const express = require('express');
const axios = require('axios');
const { supabase } = require('./supabase'); // Import the client

console.log('[router.js] File is being read by Node.js');

const router = express.Router();

console.log('[router.js] Router object created');

// --- Supabase Error Logging Helper ---
// (Assumes you have a table named 'logs')
async function logError(endpoint, err) {
  const errorMessage = err?.message || 'Unknown error';
  console.error(`${endpoint} err`, errorMessage, err);
  
  // Try to log to Supabase, but don't fail the request if this fails
  const { error: logError } = await supabase
    .from('logs')
    .insert({
      endpoint: endpoint,
      error_message: errorMessage,
      details: err?.stack || err
    });
  
  if (logError) {
    console.error('Failed to log error to Supabase:', logError.message);
  }
}

// --- Gemini API Caller ---
async function callGemini(payload) {
  const url = process.env.GEMINI_API_URL;
  const key = process.env.GEMINI_API_KEY;
  if (!url || !key) {
    throw new Error('GEMINI_API_URL or GEMINI_API_KEY not set');
  }

  const body = { input: payload };
  const resp = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    timeout: 60000
  });
  return resp.data;
}

// --- NEW ENDPOINT: POST /api/incidents ---
router.get('/incidents', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM incidents ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ POST a new incident
router.post('/incidents', async (req, res) => {
  const {
    mine,
    owner,
    district,
    state,
    mineral,
    place,
    date,
    time,
    casualties,
    injured,
    cause,
    best_practices,
    code
  } = req.body;

  try {
    const query = `
      INSERT INTO incidents (
        mine, owner, district, state, mineral, place, date, time,
        casualties, injured, cause, best_practices, code
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`;
    const values = [
      mine, owner, district, state, mineral, place, date, time,
      casualties, injured, cause, best_practices, code
    ];
    const result = await pool.query(query, values);
    res.status(201).json({ ok: true, incident: result.rows[0] });
  } catch (error) {
    console.error('Error inserting incident:', error);
    res.status(500).json({ error: 'Database insert error' });
  }
});



// --- Existing Routes (Updated with Supabase Error Logging) ---
console.log('[router.js] Registering other routes (/chat, /reports, etc.)...');

// POST /api/chat
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });
    const out = await callGemini({ type: 'chat', message });
    res.json({ ok: true, out });
  } catch (err) {
    await logError('/api/chat', err); // Use new logger
    res.status(500).json({ error: 'chat failed', details: err?.message });
  }
});

// POST /api/reports
router.post('/reports', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });
    const out = await callGemini({ type: 'report', prompt });
    res.json({ ok: true, out });
  } catch (err) {
    await logError('/api/reports', err); // Use new logger
    res.status(500).json({ error: 'reports failed', details: err?.message });
  }
});

// POST /api/trends
router.post('/trends', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });
    const out = await callGemini({ type: 'trends', prompt });
    res.json({ ok: true, out });
  } catch (err) {
    await logError('/api/trends', err); // Use new logger
    res.status(500).json({ error: 'trends failed', details: err?.message });
  }
});

// POST /api/realtime
router.post('/realtime', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });
    const out = await callGemini({ type: 'realtime', prompt });
    res.json({ ok: true, out });
  } catch (err) {
    await logError('/api/realtime', err); // Use new logger
    res.status(500).json({ error: 'realtime failed', details: err?.message });
  }
});

// GET /api/settings
router.get('/settings', (req, res) => {
  // return defaults; extend to load persisted settings
  res.json({ ok: true, settings: { notifications: true, threshold: 0.7 } });
});

// POST /api/settings
router.post('/settings', (req, res) => {
  // echo back; in production persist to DB
  const settings = req.body || {};
  res.json({ ok: true, settings });
});

// GET /api/admin/status
router.get('/admin/status', (req, res) => {
  res.json({ ok: true, status: 'ok', uptime: process.uptime() });
});

// POST /api/admin/action
router.post('/admin/action', (req, res) => {
  const { action } = req.body;
  // perform admin action (placeholder)
  res.json({ ok: true, actionReceived: action || null });
});

// GET /api/home
router.get('/home', (req, res) => {
  res.json({ ok: true, message: 'MinesafeAI backend' });
});

console.log('[router.js] All routes registered.');
module.exports = router;

