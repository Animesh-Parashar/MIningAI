require('dotenv').config();
const express = require('express');
const cors = require('cors');
console.log('Loading router.js from:', __dirname);
const apiRouter = require('./router');

const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: FRONTEND_URL }));

app.use('/api', apiRouter);
app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

app.listen(PORT, () => {
  console.log(`MinesafeAI backend listening on port ${PORT}`);
  console.log(`Accepting requests from: ${FRONTEND_URL}`);
});
