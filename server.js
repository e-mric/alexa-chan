// Quest Mode — one server for everything:
//  POST /alexa      → Alexa skill endpoint (point the dev console here via ngrok)
//  GET  /api/state  → live hero state for the dashboard
//  /                → the dashboard itself
const express = require('express');
const path = require('path');
const { ExpressAdapter } = require('ask-sdk-express-adapter');
const { skill } = require('./lib/skill');
const { state, xpForLevel, phraseOfTheDay } = require('./lib/state');

const app = express();

// Skill verification is disabled for hackathon/local use so the endpoint also
// works from the dev console simulator through ngrok without cert plumbing.
// Private calendar access requires genuine signed Alexa requests.
const verifyAlexa = Boolean(process.env.GOOGLE_REFRESH_TOKEN);
const adapter = new ExpressAdapter(skill, verifyAlexa, verifyAlexa);
app.post('/alexa', adapter.getRequestHandlers());
app.use(express.json({ limit: '8kb' }));
const review = require('./lib/review').getReviewStore();
app.get('/api/review', (req, res) => res.json(review.list()));
app.post('/api/review/:id/rate', (req, res) => {
  try {
    res.json(review.rate(req.params.id, req.body?.rating, req.body?.reviews));
  } catch (error) {
    res.status(error.status || 500).json({ error: error.status ? error.message : 'Unable to save review' });
  }
});

app.get('/api/state', (req, res) => {
  res.json({ ...state, xpToNext: xpForLevel(state.level), phraseOfTheDay: phraseOfTheDay() });
});

app.use(express.static(path.join(__dirname, 'web/build'), { extensions: ['html'] }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Quest Mode server running:`);
  console.log(`  Dashboard:      http://localhost:${PORT}`);
  console.log(`  Alexa endpoint: http://localhost:${PORT}/alexa  (expose with: ngrok http ${PORT})`);
});
