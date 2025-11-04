// router.js
const express = require('express');
const { supabase } = require('./supabase');
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('[router.js] File loaded by Node.js ✅');
const router = express.Router();

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'on', 'in', 'at', 'while', 'during', 'of', 'for', 'and', 'is', 'was',
  'show', 'me', 'what', 'happened', 'tell', 'about', 'give', 'list', 'accidents', 'incidents'
]);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_TREND);

// ---------- Utility Helpers ----------
// (parseDate, parseYear, getMeaningfulCause, logError... no changes from previous)

const parseDate = (d, t) => {
  if (!d) return null;
  const clean = d.replace(/[.\/]/g, '-');
  const parts = clean.split('-');
  if (parts.length !== 3) return null;
  let [day, month, year] = parts.map((x) => parseInt(x, 10));
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (year < 100) year += 2000;
  if (month > 12) [day, month] = [month, day];
  if (t) {
    const [hh, mm] = t.split(':').map((x) => parseInt(x, 10));
    return new Date(year, month - 1, day, hh || 0, mm || 0);
  }
  return new Date(year, month - 1, day);
};

const parseYear = (d, t) => {
  const date = parseDate(d, t);
  return date ? date.getFullYear() : null;
};

const getMeaningfulCause = (cause) => {
  if (!cause) return 'Unknown';
  const words = cause.toLowerCase().split(' ');
  let key = words[0] || 'Unknown';
  if (STOP_WORDS.has(key) && words.length > 1) key = words[1];
  key = key.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
  return key.charAt(0).toUpperCase() + key.slice(1);
};

async function logError(endpoint, err) {
  const message = err?.message || 'Unknown error';
  console.error(`${endpoint} Error:`, message);
  await supabase.from('logs').insert({
    endpoint,
    error_message: message,
    details: err?.stack || JSON.stringify(err),
  });
}

// ---------- Routes ----------

// ✅ GET all incidents (No change)
router.get('/incidents', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    await logError('/api/incidents', error);
    res.status(500).json({ error: 'Database fetch failed' });
  }
});

// ✅ POST new incident (No change)
router.post('/incidents', async (req, res) => {
  try {
    const incident = req.body;
    const { data, error } = await supabase
      .from('incidents')
      .insert(incident)
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ ok: true, incident: data });
  } catch (error) {
    await logError('/api/incidents-post', error);
    res.status(500).json({ error: 'Database insert failed' });
  }
});

// ✅ AI Analysis - /trends (No change)
router.post('/trends', async (req, res) => {
  const { summary } = req.body;
  if (!summary) return res.status(400).json({ error: 'summary object required' });

  try {
    const {
      totalIncidents, totalCasualties, totalInjuries,
      topCauses = [], topStates = [], topMinerals = [], years = [], filters = {},
    } = summary;

    const prompt = `
You are a senior mining safety analyst. Use this structured summary:
- Incidents: ${totalIncidents}, Casualties: ${totalCasualties}, Injuries: ${totalInjuries}
- Top Causes: ${topCauses.join(', ') || 'N/A'}
- Top States: ${topStates.join(', ') || 'N/A'}
- Top Minerals: ${topMinerals.join(', ') || 'N/A'}
- Years: ${years.join(', ') || 'N/A'}
- Filters: ${JSON.stringify(filters)}

Write a 2-3 sentence professional summary including:
1. Key trends/causes.
2. Most affected areas.
3. One actionable recommendation.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    res.json({ ok: true, out: { summary: text } });
  } catch (err) {
    await logError('/api/trends', err);
    res.status(500).json({ error: 'AI analysis failed', details: err?.message });
  }
});

// ✅ Chat (HEAVILY UPDATED)
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    const lowerMessage = message.toLowerCase();
    let contextData = [];
    
    // --- 1. Dynamic Query Building ---
    let query = supabase
      .from('incidents')
      // Select the columns Gemini should see.
      .select('date, state, mineral, cause_label, cause, casualties, injured, mine, best_practices');

    // --- 2. Intent Detection ---

    // Intent: "most casualties" or "top accidents"
    if (lowerMessage.includes('most') || lowerMessage.includes('top')) {
      if (lowerMessage.includes('casualt') || lowerMessage.includes('death')) {
        query = query.order('casualties', { ascending: false });
      } else if (lowerMessage.includes('injur')) {
        query = query.order('injured', { ascending: false });
      }
    } else {
      // Default sort by date
      query = query.order('date', { ascending: false });
    }

    // Intent: Check for a specific year
    const yearMatch = lowerMessage.match(/\b(201[6-9]|202[0-4])\b/); // Matches 2016-2024
    if (yearMatch) {
      const year = yearMatch[0];
      // Use gte (greater than or equal) and lt (less than) to filter for the whole year
      query = query.gte('date', `${year}-01-01`).lt('date', `${parseInt(year) + 1}-01-01`);
    }

    // Intent: Keyword search (if not asking for "top")
    const keywords = lowerMessage.split(' ')
      .filter(word => !STOP_WORDS.has(word) && word.length > 3)
      .map(kw => kw.replace(/[^\w]/g, '')); // Clean punctuation

    if (keywords.length > 0) {
      // Search in all relevant text fields
      const orFilters = keywords
        .map(kw => `cause_label.ilike.%${kw}%,cause.ilike.%${kw}%,state.ilike.%${kw}%,mineral.ilike.%${kw}%,mine.ilike.%${kw}%`)
        .join(',');
      query = query.or(orFilters);
    }
    
    // --- 3. Execute Query ---
    // Always limit the context size to avoid overloading the AI
    query = query.limit(7); 
    const { data, error } = await query;

    if (error) {
      console.warn('Supabase context fetch error:', error.message);
      // Don't fail, just proceed without DB context
    } else {
      contextData = data;
    }

    // --- 4. Create Prompt for Gemini ---
    const systemMessage = `You are a professional and helpful Digital Mine Safety Officer.
Your role is to answer questions about mine safety incidents.
- Use the "Relevant Incidents" data provided below to answer the user's question.
- **Always** prioritize information from this data.
- If the data is empty or does not contain the answer, politely state that you don't have specific information on that topic, but you can answer other safety questions.
- Do not make up information or statistics.
- When you provide data (like casualties or causes), *mention that it is based on the available records* for their query.
- Format your answers clearly. Use **bold** text for emphasis and bullet points (-) for lists.`;

    const finalPrompt = `
${systemMessage}

---
Relevant Incidents (Data for you to use):
${contextData.length > 0 ? JSON.stringify(contextData, null, 2) : 'No specific incidents found in the database for this query.'}
---

User Question:
${message}

Answer:
`;

    // --- 5. Call Gemini ---
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const result = await model.generateContent(finalPrompt);
    const text = result.response.text().trim();

    res.json({ ok: true, out: text }); // Send the raw text back

  } catch (err) {
    await logError('/api/chat', err);
    res.status(500).json({ error: 'chat failed', details: err?.message });
  }
});


// --- Other Routes (No Change) ---

// ✅ Report generation
router.post('/reports', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const result = await model.generateContent(prompt);
    res.json({ ok: true, out: result.response.text() });
  } catch (err) {
    await logError('/api/reports', err);
    res.status(500).json({ error: 'reports failed', details: err?.message });
  }
});

// ✅ Realtime analysis
router.post('/realtime', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const result = await model.generateContent(prompt);
    res.json({ ok: true, out: result.response.text() });
  } catch (err) {
    await logError('/api/realtime', err);
    res.status(500).json({ error: 'realtime failed', details: err?.message });
  }
});

// ✅ Settings
router.get('/settings', (req, res) => {
  res.json({ ok: true, settings: { notifications: true, threshold: 0.7 } });
});

// ✅ Admin
router.get('/admin/status', (req, res) => {
  res.json({ ok: true, status: 'ok', uptime: process.uptime() });
});

router.post('/admin/action', (req, res) => {
  const { action } = req.body;
  res.json({ ok: true, actionReceived: action || null });
});

// ✅ Root
router.get('/home', (req, res) => {
  res.json({ ok: true, message: 'MinesafeAI backend active 🚀' });
});

console.log('[router.js] All routes successfully registered ✅');
module.exports = router;

