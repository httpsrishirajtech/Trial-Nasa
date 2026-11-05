const express = require('express');
const axios = require('axios');
const router = express.Router();

const NASA_API_KEY = process.env.NASA_API_KEY;
const BASE_URL = 'https://api.nasa.gov/mars-photos/api/v1';

// GET /api/photos?rover=curiosity&sol=1000&camera=NAVCAM&page=1
router.get('/', async (req, res) => {
  try {
    const { rover = 'curiosity', sol, earth_date, camera, page = 1 } = req.query;

    const validRovers = ['curiosity', 'perseverance', 'opportunity', 'spirit'];
    if (!validRovers.includes(rover.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid rover name' });
    }

    const params = {
      api_key: NASA_API_KEY,
      page,
    };

    if (sol) params.sol = sol;
    else if (earth_date) params.earth_date = earth_date;
    else params.sol = 1000; // default sol

    if (camera && camera !== 'ALL') params.camera = camera;

    const response = await axios.get(`${BASE_URL}/rovers/${rover}/photos`, { params });
    
    res.json({
      photos: response.data.photos,
      rover: rover,
      sol: params.sol || null,
      earth_date: params.earth_date || null,
      count: response.data.photos.length
    });
  } catch (error) {
    console.error('Mars Photos API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch Mars photos', details: error.message });
  }
});

// GET /api/photos/latest?rover=curiosity
router.get('/latest', async (req, res) => {
  try {
    const { rover = 'curiosity' } = req.query;
    const response = await axios.get(`${BASE_URL}/rovers/${rover}/latest_photos`, {
      params: { api_key: NASA_API_KEY }
    });
    res.json({
      photos: response.data.latest_photos,
      rover,
      count: response.data.latest_photos.length
    });
  } catch (error) {
    console.error('Latest Photos error:', error.message);
    res.status(500).json({ error: 'Failed to fetch latest photos', details: error.message });
  }
});

// GET /api/photos/cameras - list available cameras per rover
router.get('/cameras', (req, res) => {
  res.json({
    curiosity: ['FHAZ', 'RHAZ', 'MAST', 'CHEMCAM', 'MAHLI', 'MARDI', 'NAVCAM'],
    perseverance: ['EDL_RUCAM', 'EDL_RDCAM', 'EDL_DDCAM', 'EDL_PUCAM1', 'EDL_PUCAM2', 'NAVCAM_LEFT', 'NAVCAM_RIGHT', 'MCZ_RIGHT', 'MCZ_LEFT', 'FRONT_HAZCAM_LEFT_A', 'FRONT_HAZCAM_RIGHT_A', 'REAR_HAZCAM_LEFT', 'REAR_HAZCAM_RIGHT', 'SKYCAM', 'SHERLOC_WATSON'],
    opportunity: ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM', 'MINITES'],
    spirit: ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM', 'MINITES']
  });
});

module.exports = router;
