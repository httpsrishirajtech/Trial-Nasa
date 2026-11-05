const express = require('express');
const axios = require('axios');
const router = express.Router();

const NASA_API_KEY = process.env.NASA_API_KEY;
const BASE_URL = 'https://api.nasa.gov/mars-photos/api/v1';

// GET /api/manifest?rover=curiosity
router.get('/', async (req, res) => {
  try {
    const { rover = 'curiosity' } = req.query;
    const validRovers = ['curiosity', 'perseverance', 'opportunity', 'spirit'];
    
    if (!validRovers.includes(rover.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid rover name' });
    }

    const response = await axios.get(`${BASE_URL}/manifests/${rover}`, {
      params: { api_key: NASA_API_KEY }
    });

    const manifest = response.data.photo_manifest;
    
    res.json({
      name: manifest.name,
      landing_date: manifest.landing_date,
      launch_date: manifest.launch_date,
      status: manifest.status,
      max_sol: manifest.max_sol,
      max_date: manifest.max_date,
      total_photos: manifest.total_photos,
      // Last 10 sols of data
      recent_sols: manifest.photos ? manifest.photos.slice(-10) : []
    });
  } catch (error) {
    console.error('Rover Manifest error:', error.message);
    res.status(500).json({ error: 'Failed to fetch rover manifest', details: error.message });
  }
});

module.exports = router;
