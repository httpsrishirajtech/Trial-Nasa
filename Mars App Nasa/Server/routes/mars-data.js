const express = require('express');
const axios = require('axios');
const router = express.Router();

const NASA_API_KEY = process.env.NASA_API_KEY;

// GET /api/mars-data - Aggregated Mars mission info
router.get('/', async (req, res) => {
  try {
    // Get NEO (Near Earth Objects) data as supplementary
    const neoResponse = await axios.get('https://api.nasa.gov/neo/rest/v1/feed', {
      params: {
        api_key: NASA_API_KEY,
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      }
    });

    res.json({
      neo_count: neoResponse.data.element_count,
      mars_missions: getMarsLandingSites(),
      regions_of_interest: getMarsRegions(),
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Mars Data error:', error.message);
    res.json({
      mars_missions: getMarsLandingSites(),
      regions_of_interest: getMarsRegions(),
      last_updated: new Date().toISOString()
    });
  }
});

function getMarsLandingSites() {
  return [
    {
      id: 'curiosity',
      name: 'Curiosity Rover',
      location: 'Gale Crater',
      lat: -4.5895,
      lng: 137.4417,
      status: 'Active',
      launch_date: '2011-11-26',
      landing_date: '2012-08-06',
      mission: 'Mars Science Laboratory',
      description: 'Investigating Mars climate and geology, assessing whether Gale Crater was habitable.',
      icon: '🚗',
      color: '#ff6b35'
    },
    {
      id: 'perseverance',
      name: 'Perseverance Rover',
      location: 'Jezero Crater',
      lat: 18.4447,
      lng: 77.4508,
      status: 'Active',
      launch_date: '2020-07-30',
      landing_date: '2021-02-18',
      mission: 'Mars 2020',
      description: 'Seeking signs of ancient life, collecting rock/soil samples for future return to Earth.',
      icon: '🤖',
      color: '#4fc3f7'
    },
    {
      id: 'insight',
      name: 'InSight Lander',
      location: 'Elysium Planitia',
      lat: 4.5024,
      lng: 135.6234,
      status: 'Concluded',
      launch_date: '2018-05-05',
      landing_date: '2018-11-26',
      mission: 'InSight',
      description: 'Studied interior of Mars using seismology and heat flow measurements.',
      icon: '📡',
      color: '#ce93d8'
    },
    {
      id: 'opportunity',
      name: 'Opportunity Rover',
      location: 'Meridiani Planum',
      lat: -1.9462,
      lng: 354.4734,
      status: 'Concluded',
      launch_date: '2003-07-07',
      landing_date: '2004-01-25',
      mission: 'Mars Exploration Rover B',
      description: 'Operated for nearly 15 years, found evidence of past liquid water.',
      icon: '🏛️',
      color: '#a5d6a7'
    },
    {
      id: 'spirit',
      name: 'Spirit Rover',
      location: 'Gusev Crater',
      lat: -14.5684,
      lng: 175.4729,
      status: 'Concluded',
      launch_date: '2003-06-10',
      landing_date: '2004-01-04',
      mission: 'Mars Exploration Rover A',
      description: 'Explored Gusev Crater, found evidence of volcanic and possible water activity.',
      icon: '🏛️',
      color: '#ffe082'
    },
    {
      id: 'pathfinder',
      name: 'Mars Pathfinder',
      location: 'Ares Vallis',
      lat: 19.1300,
      lng: -33.2200,
      status: 'Concluded',
      launch_date: '1996-12-04',
      landing_date: '1997-07-04',
      mission: 'Mars Pathfinder',
      description: 'First rover on Mars (Sojourner), proved viability of airbag landing.',
      icon: '🏛️',
      color: '#ff8a65'
    }
  ];
}

function getMarsRegions() {
  return [
    {
      id: 'olympus_mons',
      name: 'Olympus Mons',
      lat: 18.65,
      lng: -133.8,
      type: 'volcano',
      description: 'Largest volcano in the solar system. 21.9 km high, 600 km wide.',
      scientific_value: 'High',
      hazard_level: 'High',
      icon: '🌋'
    },
    {
      id: 'valles_marineris',
      name: 'Valles Marineris',
      lat: -13.9,
      lng: -59.2,
      type: 'canyon',
      description: 'System of canyons 4000 km long, 200 km wide, up to 7 km deep.',
      scientific_value: 'Very High',
      hazard_level: 'High',
      icon: '🏔️'
    },
    {
      id: 'hellas_basin',
      name: 'Hellas Planitia',
      lat: -42.4,
      lng: 70.5,
      type: 'impact_basin',
      description: 'Deepest impact crater on Mars. Atmospheric pressure ~89% higher.',
      scientific_value: 'High',
      hazard_level: 'Medium',
      icon: '⭕'
    },
    {
      id: 'jezero',
      name: 'Jezero Crater',
      lat: 18.4447,
      lng: 77.4508,
      type: 'crater',
      description: 'Ancient lake bed. Perseverance rover searching for microbial fossils.',
      scientific_value: 'Very High',
      hazard_level: 'Low',
      icon: '🔬'
    },
    {
      id: 'north_pole',
      name: 'North Polar Cap',
      lat: 90.0,
      lng: 0.0,
      type: 'ice_cap',
      description: 'Water ice and CO₂ dry ice cap. Potential water resource for colonists.',
      scientific_value: 'High',
      hazard_level: 'High',
      icon: '❄️'
    },
    {
      id: 'ares_vallis',
      name: 'Ares Vallis',
      lat: 19.13,
      lng: -33.22,
      type: 'channel',
      description: 'Ancient flood channel carved by catastrophic water flows.',
      scientific_value: 'High',
      hazard_level: 'Low',
      icon: '🌊'
    }
  ];
}

module.exports = router;
