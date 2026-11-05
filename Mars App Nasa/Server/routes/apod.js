const express = require('express');
const axios = require('axios');
const router = express.Router();
const NASA_API_KEY = process.env.NASA_API_KEY;
// GET /api/apod?date=2024-01-01&count=5
router.get('/', async (req, res) => {
  try {
    const { date, count, start_date, end_date } = req.query;
    const params = { api_key: NASA_API_KEY };
    if (count) params.count = Math.min(parseInt(count), 10);
    else if (start_date && end_date) {
      params.start_date = start_date;
      params.end_date = end_date;
    } else if (date) {
      params.date = date;
    }
    const response = await axios.get('https://api.nasa.gov/planetary/apod', { params });
    res.json(response.data);
  } catch (error) {
    console.error('APOD API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch APOD', details: error.message });
  }
});
module.exports = router;