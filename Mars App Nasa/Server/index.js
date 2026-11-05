require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const marsPhotosRouter = require('./routes/mars-photos');
const weatherRouter = require('./routes/weather');
const apodRouter = require('./routes/apod');
const marsDataRouter = require('./routes/mars-data');
const roverManifestRouter = require('./routes/rover-manifest');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    nasa_api_key_configured: !!process.env.NASA_API_KEY
  });
});

// Routes
app.use('/api/photos', marsPhotosRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/apod', apodRouter);
app.use('/api/mars-data', marsDataRouter);
app.use('/api/manifest', roverManifestRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Mars Explorer Server running on http://localhost:${PORT}`);
  console.log(`🔑 NASA API Key: ${process.env.NASA_API_KEY ? 'Configured ✓' : 'MISSING ✗'}`);
  console.log(`📡 Endpoints:`);
  console.log(`   GET /api/health`);
  console.log(`   GET /api/photos?rover=curiosity&sol=1000&camera=NAVCAM`);
  console.log(`   GET /api/weather`);
  console.log(`   GET /api/apod`);
  console.log(`   GET /api/mars-data`);
  console.log(`   GET /api/manifest?rover=curiosity`);
});
