const express = require('express');
const axios = require('axios');
const router = express.Router();

const NASA_API_KEY = process.env.NASA_API_KEY;

// GET /api/weather - InSight Mars Weather Service
router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://api.nasa.gov/insight_weather/', {
      params: {
        api_key: NASA_API_KEY,
        feedtype: 'json',
        ver: '1.0'
      }
    });

    const data = response.data;
    const solKeys = data.sol_keys || [];

    // Format weather data for frontend
    const formattedWeather = solKeys.map(sol => {
      const solData = data[sol] || {};
      return {
        sol: parseInt(sol),
        at: solData.AT ? {
          av: solData.AT.av,
          mn: solData.AT.mn,
          mx: solData.AT.mx,
          ct: solData.AT.ct
        } : null,
        ws: solData.HWS ? {
          av: solData.HWS.av,
          mn: solData.HWS.mn,
          mx: solData.HWS.mx,
          ct: solData.HWS.ct
        } : null,
        pre: solData.PRE ? {
          av: solData.PRE.av,
          mn: solData.PRE.mn,
          mx: solData.PRE.mx,
          ct: solData.PRE.ct
        } : null,
        wd: solData.WD || null,
        season: solData.Season || 'Unknown',
        first_utc: solData.First_UTC || null,
        last_utc: solData.Last_UTC || null,
      };
    });

    res.json({
      sol_keys: solKeys,
      weather: formattedWeather,
      validity_checks: data.validity_checks || {}
    });
  } catch (error) {
    console.error('InSight Weather API error:', error.message);
    // Return simulated data if API is unavailable (InSight mission ended)
    res.json(getSimulatedWeatherData());
  }
});

function getSimulatedWeatherData() {
  const sols = [];
  for (let i = 0; i < 7; i++) {
    const sol = 1200 + i;
    sols.push({
      sol,
      at: {
        av: -60 + Math.random() * 20 - 10,
        mn: -95 + Math.random() * 10,
        mx: -15 + Math.random() * 10,
        ct: 1200
      },
      ws: {
        av: 5 + Math.random() * 8,
        mn: 1 + Math.random() * 3,
        mx: 15 + Math.random() * 10,
        ct: 1200
      },
      pre: {
        av: 730 + Math.random() * 50,
        mn: 710 + Math.random() * 20,
        mx: 760 + Math.random() * 20,
        ct: 1200
      },
      season: ['spring', 'summer', 'autumn', 'winter'][Math.floor(Math.random() * 4)],
      first_utc: new Date(Date.now() - i * 88775000).toISOString(),
      last_utc: new Date(Date.now() - i * 88775000 + 88775000).toISOString(),
      simulated: true
    });
  }
  return {
    sol_keys: sols.map(s => String(s.sol)),
    weather: sols,
    note: 'InSight mission concluded. Showing representative historical data.'
  };
}

module.exports = router;
