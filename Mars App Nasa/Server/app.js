/* ================================================================
   MARS EXPLORER — Main Application
   NASA API Integration + Interactive Map + Mission Planning
   ================================================================ */

// ==================== CONFIG ====================
const CONFIG = {
  NASA_API_KEY: 'T3qKKmFvMKKaINbPTeAWh7W54TVMU3RW1AUguMdp',
  NASA_BASE: 'https://api.nasa.gov',
  MARS_PHOTOS_BASE: 'https://api.nasa.gov/mars-photos/api/v1',
  INSIGHT_BASE: 'https://api.nasa.gov/insight_weather',
};

// ==================== STATE ====================
const STATE = {
  currentPanel: 'map',
  weatherData: null,
  waypoints: [],
  planningRoute: false,
  marsMap: null,
  waypointLayer: null,
  routeLine: null,
  tempChart: null,
  pressureChart: null,
  windChart: null,
  scienceChecked: 0,
  scienceTotal: 8,
  rovers: {
    curiosity: { maxSol: null, totalPhotos: null },
    perseverance: { maxSol: null, totalPhotos: null },
  }
};

// ==================== LANDING SITES DATA ====================
const LANDING_SITES = [
  { id: 'curiosity', name: 'Curiosity Rover', lat: -4.5895, lng: 137.4417, status: 'Active', mission: 'Mars Science Laboratory', landing: '2012-08-06', color: '#ff6b35', icon: '🚗', desc: 'Investigating Mars climate and geology in Gale Crater. Searching for past habitable environments.' },
  { id: 'perseverance', name: 'Perseverance Rover', lat: 18.4447, lng: 77.4508, status: 'Active', mission: 'Mars 2020', landing: '2021-02-18', color: '#4fc3f7', icon: '🤖', desc: 'Seeking signs of ancient life in Jezero Crater. Collecting samples for Earth return.' },
  { id: 'insight', name: 'InSight Lander', lat: 4.5024, lng: 135.6234, status: 'Concluded', mission: 'InSight', landing: '2018-11-26', color: '#ce93d8', icon: '📡', desc: 'Studied Martian interior using seismology. Detected over 1300 marsquakes.' },
  { id: 'opportunity', name: 'Opportunity Rover', lat: -1.9462, lng: 354.4734 - 360, status: 'Concluded', mission: 'MER-B', landing: '2004-01-25', color: '#a5d6a7', icon: '🏛️', desc: 'Operated 15 years. Found hematite "blueberries" and evidence of ancient water.' },
  { id: 'spirit', name: 'Spirit Rover', lat: -14.5684, lng: 175.4729, status: 'Concluded', mission: 'MER-A', landing: '2004-01-04', color: '#ffe082', icon: '🏛️', desc: 'Explored Gusev Crater. Discovered silica-rich soil indicating past water.' },
  { id: 'pathfinder', name: 'Mars Pathfinder', lat: 19.1300, lng: -33.2200, status: 'Concluded', mission: 'Mars Pathfinder', landing: '1997-07-04', color: '#ff8a65', icon: '🏛️', desc: 'First rover on Mars (Sojourner). Proved airbag landing viability.' },
];

const REGIONS_OF_INTEREST = [
  { id: 'olympus_mons', name: 'Olympus Mons', lat: 18.65, lng: -133.8, type: 'Volcano', value: 'Very High', icon: '🌋', desc: 'Largest volcano in solar system. 21.9 km high, 600 km wide.' },
  { id: 'valles_marineris', name: 'Valles Marineris', lat: -13.9, lng: -59.2, type: 'Canyon System', value: 'Very High', icon: '🏔️', desc: '4000 km long canyon system. Up to 7 km deep. Evidence of ancient water flow.' },
  { id: 'hellas_basin', name: 'Hellas Planitia', lat: -42.4, lng: 70.5, type: 'Impact Basin', value: 'High', icon: '⭕', desc: 'Deepest impact crater on Mars. 7 km deep. Highest atmospheric pressure.' },
  { id: 'jezero', name: 'Jezero Crater', lat: 18.44, lng: 77.45, type: 'Ancient Lake', value: 'Very High', icon: '🔬', desc: 'Ancient delta lake bed. Active Perseverance site for biosignature search.' },
  { id: 'north_pole', name: 'North Polar Cap', lat: 83.0, lng: 0.0, type: 'Ice Cap', value: 'High', icon: '❄️', desc: 'Water ice and CO₂ dry ice. Potential water resource for future colonists.' },
  { id: 'ares_vallis', name: 'Ares Vallis', lat: 19.13, lng: -33.22, type: 'Flood Channel', value: 'Medium', icon: '🌊', desc: 'Ancient catastrophic flood channel. Mars Pathfinder landing site.' },
];

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  // Show loading screen then initialize
  setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
    initApp();
  }, 3800);

  // Animate loading status text
  const statuses = [
    'Initializing systems...',
    'Connecting to NASA APIs...',
    'Loading Mars topography...',
    'Syncing rover telemetry...',
    'Calibrating instruments...',
    'Mission ready. Launch!'
  ];
  let si = 0;
  const statusEl = document.getElementById('loading-status');
  const statusInterval = setInterval(() => {
    si++;
    if (si < statuses.length && statusEl) statusEl.textContent = statuses[si];
    else clearInterval(statusInterval);
  }, 600);
});

function initApp() {
  setupNavigation();
  setupSidebar();
  initMarsMap();
  initMarsTime();
  loadWeatherData();
  loadMarsData();
  setupGallery();
  setupMissionPanel();
  setupAPOD();
  setupLightbox();
  setupManifestModal();
  updateScienceProgress();
}

// ==================== NAVIGATION ====================
function setupNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const panelTitles = {
    map: 'SURFACE MAP',
    weather: 'ATMOSPHERIC CONDITIONS',
    gallery: 'ROVER PHOTO GALLERY',
    mission: 'MISSION PLANNER',
    apod: 'SPACE VIEW — APOD',
    telemetry: 'TELEMETRY DASHBOARD'
  };

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.dataset.panel;
      switchPanel(panel);

      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.getElementById('panel-title').textContent = panelTitles[panel] || '';

      if (panel === 'telemetry' && STATE.weatherData) {
        setTimeout(() => renderTelemetryCharts(), 200);
      }
    });
  });
}

function switchPanel(panel) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`panel-${panel}`);
  if (target) target.classList.add('active');
  STATE.currentPanel = panel;

  if (panel === 'map') {
    setTimeout(() => STATE.marsMap && STATE.marsMap.invalidateSize(), 200);
  }
}

// ==================== SIDEBAR ====================
function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });
}

// ==================== MARS MAP ====================
function initMarsMap() {
  // Use USGS Mars CTX Mosaic tiles (public domain NASA/USGS)
  const marsMap = L.map('mars-map', {
    center: [0, 0],
    zoom: 3,
    minZoom: 1,
    maxZoom: 8,
    attributionControl: true,
    zoomControl: true,
  });

  // Mars CTX Mosaic from USGS Astrogeology
  const marsTileLayer = L.tileLayer(
    'https://api.nasa.gov/mars-wmts/catalog/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    {
      attribution: '© NASA/JPL/USGS Mars MDIM',
      tileSize: 256,
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    }
  );

  // Fallback: OpenPlanetaryMap Mars
  const marsOPM = L.tileLayer(
    'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png',
    {
      attribution: '© OpenPlanetaryMap | © NASA/JPL/USGS',
      maxZoom: 8,
      tileSize: 256,
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAABjE+ibYAAAAASUVORK5CYII='
    }
  );

  marsTileLayer.addTo(marsMap);
  marsTileLayer.on('tileerror', () => {
    // Try OPM as fallback
    if (!marsMap.hasLayer(marsOPM)) {
      marsTileLayer.remove();
      marsOPM.addTo(marsMap);
    }
  });

  STATE.marsMap = marsMap;
  STATE.waypointLayer = L.layerGroup().addTo(marsMap);

  // Add landing site markers
  addLandingSiteMarkers();

  // Add regions of interest
  addRegionMarkers();

  // Map click for route planning
  marsMap.on('click', onMapClick);

  // Setup layer toggles
  setupLayerToggles();

  // Route planning button
  document.getElementById('btn-plan-route').addEventListener('click', toggleRoutePlanning);
  document.getElementById('btn-clear-route').addEventListener('click', clearRoute);
}

function createDivIcon(site) {
  const color = site.color || '#ff6b35';
  const html = `
    <div style="
      width: 24px; height: 24px;
      background: ${color};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid rgba(255,255,255,0.4);
      box-shadow: 0 0 12px ${color}80;
      display: flex; align-items: center; justify-content: center;
      position: relative;
    ">
      <div style="transform: rotate(45deg); font-size: 10px; position: absolute;">${site.icon || '📍'}</div>
    </div>`;
  return L.divIcon({ html, className: '', iconSize: [24, 32], iconAnchor: [12, 32], popupAnchor: [0, -32] });
}

function createRegionIcon(region) {
  const html = `
    <div style="
      background: rgba(255, 224, 130, 0.15);
      border: 1.5px solid rgba(255, 224, 130, 0.5);
      border-radius: 50%;
      width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px;
      box-shadow: 0 0 10px rgba(255,224,130,0.3);
      backdrop-filter: blur(4px);
    ">${region.icon}</div>`;
  return L.divIcon({ html, className: '', iconSize: [28, 28], iconAnchor: [14, 14] });
}

const layerGroups = {
  sites: null,
  regions: null,
};

function addLandingSiteMarkers() {
  const group = L.layerGroup();
  LANDING_SITES.forEach(site => {
    const marker = L.marker([site.lat, site.lng], { icon: createDivIcon(site) });
    marker.bindPopup(`
      <div class="popup-title">${site.icon} ${site.name}</div>
      <div class="popup-info">
        <div>📍 <span>${site.lat.toFixed(4)}°, ${site.lng.toFixed(4)}°</span></div>
        <div>🛸 <span>${site.mission}</span></div>
        <div>🗓️ <span>${site.landing}</span></div>
        <div>⚡ Status: <span style="color:${site.status === 'Active' ? '#4ade80' : '#9ca3af'}">${site.status}</span></div>
        <div style="margin-top:8px;font-size:0.7rem;color:#b08060;line-height:1.5">${site.desc}</div>
      </div>
    `, { maxWidth: 280 });
    group.addLayer(marker);
  });
  group.addTo(STATE.marsMap);
  layerGroups.sites = group;
}

function addRegionMarkers() {
  const group = L.layerGroup();
  REGIONS_OF_INTEREST.forEach(region => {
    const marker = L.marker([region.lat, region.lng], { icon: createRegionIcon(region) });
    marker.bindPopup(`
      <div class="popup-title">${region.icon} ${region.name}</div>
      <div class="popup-info">
        <div>🏷️ Type: <span>${region.type}</span></div>
        <div>🔬 Scientific Value: <span>${region.value}</span></div>
        <div style="margin-top:8px;font-size:0.7rem;color:#b08060;line-height:1.5">${region.desc}</div>
      </div>
    `, { maxWidth: 280 });
    group.addLayer(marker);
  });
  group.addTo(STATE.marsMap);
  layerGroups.regions = group;
}

function setupLayerToggles() {
  document.getElementById('layer-sites').addEventListener('change', (e) => {
    if (e.target.checked) layerGroups.sites.addTo(STATE.marsMap);
    else STATE.marsMap.removeLayer(layerGroups.sites);
  });

  document.getElementById('layer-regions').addEventListener('change', (e) => {
    if (e.target.checked) layerGroups.regions.addTo(STATE.marsMap);
    else STATE.marsMap.removeLayer(layerGroups.regions);
  });

  document.getElementById('layer-route').addEventListener('change', (e) => {
    if (e.target.checked) {
      STATE.planningRoute = true;
      document.getElementById('btn-plan-route').style.background = 'rgba(255,107,53,0.3)';
    } else {
      STATE.planningRoute = false;
      document.getElementById('btn-plan-route').style.background = '';
    }
  });
}

function toggleRoutePlanning() {
  STATE.planningRoute = !STATE.planningRoute;
  const btn = document.getElementById('btn-plan-route');
  const checkbox = document.getElementById('layer-route');

  if (STATE.planningRoute) {
    btn.textContent = '✅ Click Map to Add';
    btn.style.background = 'rgba(255,107,53,0.3)';
    checkbox.checked = true;
    STATE.marsMap.getContainer().style.cursor = 'crosshair';
  } else {
    btn.textContent = '📍 Add Waypoint';
    btn.style.background = '';
    STATE.marsMap.getContainer().style.cursor = '';
  }
}

function onMapClick(e) {
  if (!STATE.planningRoute) return;
  const { lat, lng } = e.latlng;
  addWaypoint(lat, lng);
}

function addWaypoint(lat, lng) {
  const num = STATE.waypoints.length + 1;
  STATE.waypoints.push({ lat, lng, num });

  const icon = L.divIcon({
    html: `<div style="
      width:22px;height:22px;
      background:#ff4444;
      border:2px solid #ff8080;
      border-radius:50%;
      box-shadow:0 0 10px rgba(255,68,68,0.6);
      display:flex;align-items:center;justify-content:center;
      color:white;font-size:9px;font-weight:700;
      font-family:'JetBrains Mono',monospace;
    ">${num}</div>`,
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  const marker = L.marker([lat, lng], { icon })
    .bindPopup(`
      <div class="popup-title">📍 Waypoint ${num}</div>
      <div class="popup-info">
        <div>Lat: <span>${lat.toFixed(4)}°</span></div>
        <div>Lng: <span>${lng.toFixed(4)}°</span></div>
      </div>
    `);
  STATE.waypointLayer.addLayer(marker);

  updateRouteLine();
  updateRouteStats();
  updateWaypointList();

  const routeStatsEl = document.getElementById('route-stats');
  if (STATE.waypoints.length > 0) routeStatsEl.classList.remove('hidden');
}

function updateRouteLine() {
  if (STATE.routeLine) STATE.marsMap.removeLayer(STATE.routeLine);
  if (STATE.waypoints.length < 2) return;

  const coords = STATE.waypoints.map(w => [w.lat, w.lng]);
  STATE.routeLine = L.polyline(coords, {
    color: '#ff4444',
    weight: 2,
    opacity: 0.8,
    dashArray: '8 4'
  }).addTo(STATE.marsMap);
}

function updateRouteStats() {
  let totalDist = 0;
  for (let i = 1; i < STATE.waypoints.length; i++) {
    const a = STATE.waypoints[i - 1];
    const b = STATE.waypoints[i];
    totalDist += haversineKm(a.lat, a.lng, b.lat, b.lng);
  }
  const hours = totalDist / 0.14; // Rover speed ~0.14 km/h on average
  document.getElementById('route-distance').textContent = `${totalDist.toFixed(1)} km`;
  document.getElementById('route-duration').textContent = `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
  document.getElementById('route-waypoints').textContent = STATE.waypoints.length;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 3389.5; // Mars radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function clearRoute() {
  STATE.waypoints = [];
  STATE.waypointLayer.clearLayers();
  if (STATE.routeLine) STATE.marsMap.removeLayer(STATE.routeLine);
  STATE.routeLine = null;
  document.getElementById('route-stats').classList.add('hidden');
  updateWaypointList();
  document.getElementById('route-distance').textContent = '0.0 km';
  document.getElementById('route-duration').textContent = '0h 0m';
  document.getElementById('route-waypoints').textContent = '0';
}

function updateWaypointList() {
  const list = document.getElementById('waypoint-list');
  if (STATE.waypoints.length === 0) {
    list.innerHTML = '<div class="wp-empty">No waypoints added. Use the Surface Map panel to add waypoints by enabling route mode and clicking on the map.</div>';
    return;
  }
  list.innerHTML = STATE.waypoints.map(wp => `
    <div class="wp-item">
      <div class="wp-num">${wp.num}</div>
      <div class="wp-coords">${wp.lat.toFixed(4)}°, ${wp.lng.toFixed(4)}°</div>
    </div>
  `).join('');
}

// ==================== MARS TIME ====================
function initMarsTime() {
  updateMarsTime();
  setInterval(updateMarsTime, 1000);
}

function updateMarsTime() {
  // Mars Sol calculation (approximate)
  const earthMs = Date.now();
  const j2000 = 946727935816; // J2000.0 in ms
  const dayMs = 86400000;
  const marsDay = 88775244; // Martian sol in ms

  const jd = (earthMs - j2000) / dayMs + 2451545.0;
  const marsEpoch = 2405522.0028779 ; // Mars epoch
  const sol = Math.floor((jd - marsEpoch) / (marsDay / dayMs));

  document.getElementById('current-sol').textContent = sol.toLocaleString();

  // Approximate Local Solar Time
  const marsMs = earthMs * (dayMs / marsDay);
  const marsMoD = marsMs % marsDay;
  const h = Math.floor(marsMoD / 3600000);
  const m = Math.floor((marsMoD % 3600000) / 60000);
  const s = Math.floor((marsMoD % 60000) / 1000);
  document.getElementById('mars-time').textContent =
    `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} LST`;
}

// ==================== WEATHER DATA ====================
async function loadWeatherData() {
  try {
    const res = await fetch(
      `${CONFIG.INSIGHT_BASE}/?api_key=${CONFIG.NASA_API_KEY}&feedtype=json&ver=1.0`
    );
    const data = await res.json();

    if (data.sol_keys && data.sol_keys.length > 0) {
      processWeatherData(data);
    } else {
      useSimulatedWeather();
    }
  } catch (err) {
    console.warn('InSight API unavailable, using simulated data:', err.message);
    useSimulatedWeather();
  }
}

function processWeatherData(data) {
  const sols = data.sol_keys.map(sol => {
    const d = data[sol];
    return {
      sol: parseInt(sol),
      at: d.AT || null,
      ws: d.HWS || null,
      pre: d.PRE || null,
      wd: d.WD || null,
      season: d.Season || 'Unknown',
      first_utc: d.First_UTC,
      last_utc: d.Last_UTC,
    };
  });
  STATE.weatherData = sols;
  renderWeatherPanel(sols);
}

function useSimulatedWeather() {
  const sols = [];
  for (let i = 6; i >= 0; i--) {
    sols.push({
      sol: 1200 + (6 - i),
      at: { av: -60 + (Math.random() * 20 - 10), mn: -95 + Math.random() * 10, mx: -15 + Math.random() * 10, ct: 1200 },
      ws: { av: 5 + Math.random() * 8, mn: 1 + Math.random() * 3, mx: 15 + Math.random() * 10, ct: 1200 },
      pre: { av: 730 + Math.random() * 50, mn: 710 + Math.random() * 20, mx: 760 + Math.random() * 20, ct: 1200 },
      season: ['spring', 'summer', 'autumn', 'winter'][Math.floor(i % 4)],
      simulated: true,
    });
  }
  STATE.weatherData = sols;
  renderWeatherPanel(sols);
}

function renderWeatherPanel(sols) {
  if (!sols || sols.length === 0) return;
  const latest = sols[sols.length - 1];

  const temp = latest.at ? latest.at.av : null;
  const wind = latest.ws ? latest.ws.av : null;
  const pressure = latest.pre ? latest.pre.av : null;

  // Update topbar
  if (temp !== null) {
    document.getElementById('topbar-temp').textContent = `${temp.toFixed(1)}°C`;
    document.getElementById('weather-temp-big').textContent = `${temp.toFixed(1)}°C`;
    document.getElementById('w-temp-min').textContent = latest.at.mn ? `${latest.at.mn.toFixed(1)}°C` : '—';
    document.getElementById('w-temp-max').textContent = latest.at.mx ? `${latest.at.mx.toFixed(1)}°C` : '—';
  }

  if (wind !== null) {
    document.getElementById('topbar-wind').textContent = `${wind.toFixed(1)} m/s`;
    document.getElementById('w-wind-avg').textContent = `${wind.toFixed(1)} m/s`;
  }

  if (pressure !== null) {
    document.getElementById('w-pressure').textContent = `${pressure.toFixed(0)} Pa`;
  }

  document.getElementById('w-season').textContent = latest.season || '—';
  document.getElementById('weather-condition').textContent =
    `Sol ${latest.sol} • Martian ${latest.season || 'season'} • ${latest.simulated ? 'Historical data' : 'Live InSight data'}`;

  // Render sol history
  renderSolHistory(sols);

  // Render wind rose
  renderWindRose(latest.wd);

  // Update EVA advisory
  updateEVAAdvisory(temp, wind, pressure);
}

function renderSolHistory(sols) {
  const container = document.getElementById('sol-history');
  container.innerHTML = sols.map(s => `
    <div class="sol-card">
      <div class="sol-num">Sol ${s.sol}</div>
      <div class="sol-data">
        <div class="sd-label">AVG TEMP</div>
        <div class="sd-val">${s.at ? s.at.av.toFixed(1) + '°C' : '—'}</div>
      </div>
      <div class="sol-data">
        <div class="sd-label">MIN / MAX</div>
        <div class="sd-val">${s.at ? `${s.at.mn.toFixed(0)} / ${s.at.mx.toFixed(0)}` : '—'}</div>
      </div>
      <div class="sol-data">
        <div class="sd-label">WIND</div>
        <div class="sd-val highlight">${s.ws ? s.ws.av.toFixed(1) + ' m/s' : '—'}</div>
      </div>
      <div class="sol-data">
        <div class="sd-label">PRESSURE</div>
        <div class="sd-val">${s.pre ? s.pre.av.toFixed(0) + ' Pa' : '—'}</div>
      </div>
    </div>
  `).join('');
}

function renderWindRose(wdData) {
  const canvas = document.getElementById('wind-rose-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = 110, cy = 110, r = 90;

  ctx.clearRect(0, 0, 220, 220);

  // Background circles
  ctx.strokeStyle = 'rgba(255,107,53,0.1)';
  ctx.lineWidth = 1;
  [30, 55, 80].forEach(radius => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Cardinal directions
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  ctx.font = 'bold 10px Orbitron, monospace';
  ctx.fillStyle = 'rgba(255,107,53,0.6)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  dirs.forEach((dir, i) => {
    const angle = (i * 45 - 90) * Math.PI / 180;
    const tx = cx + Math.cos(angle) * (r + 8);
    const ty = cy + Math.sin(angle) * (r + 8);
    ctx.fillText(dir, tx, ty);
  });

  // Wind petals (simulated or from data)
  const windDirs = wdData
    ? Object.entries(wdData).map(([dir, val]) => ({ dir, ct: val.ct || 0 }))
    : dirs.map(d => ({ dir: d, ct: Math.floor(Math.random() * 300) }));

  const maxCt = Math.max(...windDirs.map(w => w.ct), 1);

  windDirs.forEach(({ dir, ct }) => {
    const dirMap = { N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5, S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5 };
    const angleDeg = dirMap[dir] ?? (dirs.indexOf(dir) * 45);
    const angle = (angleDeg - 90) * Math.PI / 180;
    const length = (ct / maxCt) * 70;

    if (length < 2) return;

    const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(angle) * length, cy + Math.sin(angle) * length);
    grad.addColorStop(0, 'rgba(255,107,53,0.1)');
    grad.addColorStop(1, 'rgba(255,107,53,0.7)');

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle - 0.15) * length, cy + Math.sin(angle - 0.15) * length);
    ctx.lineTo(cx + Math.cos(angle) * (length + 5), cy + Math.sin(angle) * (length + 5));
    ctx.lineTo(cx + Math.cos(angle + 0.15) * length, cy + Math.sin(angle + 0.15) * length);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  });

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ff6b35';
  ctx.fill();
}

function updateEVAAdvisory(temp, wind, pressure) {
  const list = document.getElementById('eva-advisory-list');
  const items = [];

  const tempOk = temp !== null && temp > -80 && temp < 20;
  items.push({ cls: tempOk ? 'safe' : 'danger', text: `Temperature: ${temp !== null ? temp.toFixed(1) + '°C' : '—'} — ${tempOk ? 'Acceptable for EVA' : 'Extreme cold — extra insulation required'}` });

  const windOk = wind !== null && wind < 15;
  items.push({ cls: windOk ? 'safe' : 'warning', text: `Wind Speed: ${wind !== null ? wind.toFixed(1) + ' m/s' : '—'} — ${windOk ? 'Calm conditions' : 'Monitor dust storm potential'}` });

  const pressOk = pressure !== null && pressure > 500;
  items.push({ cls: pressOk ? 'safe' : 'danger', text: `Atmospheric Pressure: ${pressure !== null ? pressure.toFixed(0) + ' Pa' : '—'} — ${pressOk ? 'Within suit tolerance' : 'Below nominal'}` });

  items.push({ cls: 'danger', text: 'Radiation: High — Limit EVA to 4 hours maximum' });
  items.push({ cls: 'warning', text: 'UV Index: 11+ (Extreme) — Full suit required at all times' });

  list.innerHTML = items.map(item => `
    <div class="eva-item ${item.cls}">
      <span class="eva-status-dot"></span>
      <span>${item.text}</span>
    </div>
  `).join('');
}

// ==================== MARS DATA ====================
async function loadMarsData() {
  loadRoverManifest('curiosity');
  loadRoverManifest('perseverance');
}

async function loadRoverManifest(rover) {
  try {
    const res = await fetch(`${CONFIG.MARS_PHOTOS_BASE}/manifests/${rover}?api_key=${CONFIG.NASA_API_KEY}`);
    const data = await res.json();
    const m = data.photo_manifest;

    if (!m) return;

    STATE.rovers[rover] = { maxSol: m.max_sol, totalPhotos: m.total_photos };

    if (rover === 'curiosity') {
      const el1 = document.getElementById('curiosity-max-sol');
      const el2 = document.getElementById('curiosity-total-photos');
      const el3 = document.getElementById('curiosity-sol-stat');
      if (el1) el1.textContent = m.max_sol?.toLocaleString() || '—';
      if (el2) el2.textContent = m.total_photos?.toLocaleString() || '—';
      if (el3) el3.textContent = m.max_sol?.toLocaleString() || '—';
    } else if (rover === 'perseverance') {
      const el1 = document.getElementById('perseverance-max-sol');
      const el2 = document.getElementById('perseverance-total-photos');
      const el3 = document.getElementById('perseverance-sol-stat');
      if (el1) el1.textContent = m.max_sol?.toLocaleString() || '—';
      if (el2) el2.textContent = m.total_photos?.toLocaleString() || '—';
      if (el3) el3.textContent = m.max_sol?.toLocaleString() || '—';
    }

    // Update total photos stat
    const totalEl = document.getElementById('total-photos-stat');
    if (totalEl && STATE.rovers.curiosity.totalPhotos && STATE.rovers.perseverance.totalPhotos) {
      const total = (STATE.rovers.curiosity.totalPhotos || 0) + (STATE.rovers.perseverance.totalPhotos || 0);
      totalEl.textContent = total.toLocaleString() + '+';
    }

    // Show manifest in modal if requested
    if (STATE.manifestRequested === rover) {
      showManifestModal(m, rover);
      STATE.manifestRequested = null;
    }
  } catch (err) {
    console.error(`Manifest fetch failed for ${rover}:`, err);
    document.getElementById(`${rover}-max-sol`).textContent = 'API Error';
    document.getElementById(`${rover}-total-photos`).textContent = 'API Error';
  }
}

// ==================== GALLERY ====================
function setupGallery() {
  document.getElementById('fetch-photos-btn').addEventListener('click', fetchRoverPhotos);
  document.getElementById('fetch-latest-btn').addEventListener('click', fetchLatestPhotos);

  document.getElementById('rover-select').addEventListener('change', (e) => {
    updateCameraOptions(e.target.value);
  });
}

function updateCameraOptions(rover) {
  const cameras = {
    curiosity: ['ALL', 'FHAZ', 'RHAZ', 'NAVCAM', 'MAST', 'CHEMCAM', 'MAHLI', 'MARDI'],
    perseverance: ['ALL', 'NAVCAM_LEFT', 'NAVCAM_RIGHT', 'FRONT_HAZCAM_LEFT_A', 'FRONT_HAZCAM_RIGHT_A', 'MCZ_RIGHT', 'MCZ_LEFT', 'SKYCAM', 'SHERLOC_WATSON'],
    opportunity: ['ALL', 'FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM', 'MINITES'],
    spirit: ['ALL', 'FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM', 'MINITES'],
  };
  const sel = document.getElementById('camera-select');
  const opts = cameras[rover] || cameras.curiosity;
  sel.innerHTML = opts.map(c => `<option value="${c}">${c === 'ALL' ? 'All Cameras' : c}</option>`).join('');
}

async function fetchRoverPhotos() {
  const rover = document.getElementById('rover-select').value;
  const sol = document.getElementById('sol-input').value;
  const camera = document.getElementById('camera-select').value;

  const btn = document.getElementById('fetch-photos-btn');
  btn.textContent = '⏳ Loading...';
  btn.disabled = true;

  try {
    let url = `${CONFIG.MARS_PHOTOS_BASE}/rovers/${rover}/photos?api_key=${CONFIG.NASA_API_KEY}&sol=${sol}`;
    if (camera !== 'ALL') url += `&camera=${camera}`;

    const res = await fetch(url);
    const data = await res.json();
    renderPhotoGrid(data.photos || [], rover, sol);
  } catch (err) {
    showGalleryError('Failed to fetch photos. Please try again.');
  } finally {
    btn.textContent = '🔭 FETCH PHOTOS';
    btn.disabled = false;
  }
}

async function fetchLatestPhotos() {
  const rover = document.getElementById('rover-select').value;
  const btn = document.getElementById('fetch-latest-btn');
  btn.textContent = '⏳ Loading...';
  btn.disabled = true;

  try {
    const res = await fetch(`${CONFIG.MARS_PHOTOS_BASE}/rovers/${rover}/latest_photos?api_key=${CONFIG.NASA_API_KEY}`);
    const data = await res.json();
    const photos = data.latest_photos || [];
    const sol = photos.length > 0 ? photos[0].sol : '—';
    renderPhotoGrid(photos, rover, sol);
    document.getElementById('sol-input').value = sol;
  } catch (err) {
    showGalleryError('Failed to fetch latest photos.');
  } finally {
    btn.textContent = '⚡ LATEST SHOTS';
    btn.disabled = false;
  }
}

function renderPhotoGrid(photos, rover, sol) {
  const grid = document.getElementById('photo-grid');
  const metaRover = document.getElementById('meta-rover-name');
  const metaSol = document.getElementById('meta-sol');
  const metaCount = document.getElementById('meta-count');

  metaRover.textContent = rover.charAt(0).toUpperCase() + rover.slice(1);
  metaSol.textContent = sol;
  metaCount.textContent = photos.length;

  if (photos.length === 0) {
    grid.innerHTML = `
      <div class="gallery-placeholder">
        <div class="gp-icon">🔭</div>
        <div class="gp-text">No photos found for Sol ${sol}</div>
        <div class="gp-sub">Try a different sol or camera</div>
      </div>`;
    return;
  }

  grid.innerHTML = photos.slice(0, 50).map((photo, i) => `
    <div class="photo-card" style="animation-delay:${i * 0.03}s" onclick="openLightbox('${photo.img_src}', '${photo.camera.full_name}', '${rover}', ${photo.sol}, '${photo.earth_date}')">
      <img src="${photo.img_src}" alt="${photo.camera.name}" loading="lazy" onerror="this.parentElement.style.display='none'" />
      <div class="photo-overlay">
        <div class="photo-camera">${photo.camera.name}</div>
        <div class="photo-sol">Sol ${photo.sol} • ${photo.earth_date}</div>
      </div>
    </div>
  `).join('');
}

function showGalleryError(msg) {
  document.getElementById('photo-grid').innerHTML = `
    <div class="gallery-placeholder">
      <div class="gp-icon">⚠️</div>
      <div class="gp-text">${msg}</div>
    </div>`;
}

// ==================== LIGHTBOX ====================
function setupLightbox() {
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

function openLightbox(src, camera, rover, sol, date) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const info = document.getElementById('lightbox-info');

  img.src = src;
  info.innerHTML = `
    📷 <strong>${camera}</strong> &nbsp;•&nbsp;
    🚗 ${rover.charAt(0).toUpperCase() + rover.slice(1)} &nbsp;•&nbsp;
    Sol <strong>${sol}</strong> &nbsp;•&nbsp;
    🗓️ ${date}
    <br/><br/>
    <a href="${src}" target="_blank" style="color:#ff6b35">🔗 View Full Resolution</a>
  `;
  lb.classList.remove('hidden');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.add('hidden');
  document.getElementById('lightbox-img').src = '';
}

// ==================== MISSION PANEL ====================
function setupMissionPanel() {
  document.getElementById('btn-export-route').addEventListener('click', exportRoute);
  document.getElementById('btn-clear-all-wp').addEventListener('click', () => {
    clearRoute();
  });

  // Science objectives
  document.querySelectorAll('.sci-item input').forEach(cb => {
    cb.addEventListener('change', updateScienceProgress);
  });
}

function updateScienceProgress() {
  const checkboxes = document.querySelectorAll('.sci-item input');
  const checked = [...checkboxes].filter(c => c.checked).length;
  STATE.scienceChecked = checked;
  const pct = (checked / STATE.scienceTotal) * 100;
  document.getElementById('sci-prog-fill').style.width = pct + '%';
  document.getElementById('sci-prog-text').textContent = `${checked}/${STATE.scienceTotal} objectives`;
}

function exportRoute() {
  if (STATE.waypoints.length === 0) {
    alert('No waypoints to export. Add waypoints on the Surface Map first.');
    return;
  }
  const data = {
    mission: 'Mars Explorer Route',
    generated: new Date().toISOString(),
    waypoints: STATE.waypoints.map(w => ({ num: w.num, lat: w.lat, lng: w.lng })),
    totalDistanceKm: STATE.waypoints.length > 1
      ? STATE.waypoints.slice(1).reduce((acc, w, i) => acc + haversineKm(STATE.waypoints[i].lat, STATE.waypoints[i].lng, w.lat, w.lng), 0).toFixed(2)
      : 0
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'mars_route.json';
  a.click();
}

// ==================== MANIFEST MODAL ====================
function setupManifestModal() {
  document.getElementById('manifest-modal-close').addEventListener('click', () => {
    document.getElementById('manifest-modal').classList.add('hidden');
  });
  document.getElementById('manifest-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) document.getElementById('manifest-modal').classList.add('hidden');
  });
}

function showManifestModal(manifest, rover) {
  const modal = document.getElementById('manifest-modal');
  document.getElementById('manifest-modal-title').textContent = `${rover.toUpperCase()} ROVER MANIFEST`;
  document.getElementById('manifest-modal-content').innerHTML = `
    <div class="manifest-stat"><span>Rover Name</span><span>${manifest.name}</span></div>
    <div class="manifest-stat"><span>Launch Date</span><span>${manifest.launch_date}</span></div>
    <div class="manifest-stat"><span>Landing Date</span><span>${manifest.landing_date}</span></div>
    <div class="manifest-stat"><span>Mission Status</span><span style="color:${manifest.status === 'active' ? '#4ade80' : '#9ca3af'}">${manifest.status?.toUpperCase()}</span></div>
    <div class="manifest-stat"><span>Latest Sol</span><span>${manifest.max_sol?.toLocaleString()}</span></div>
    <div class="manifest-stat"><span>Latest Earth Date</span><span>${manifest.max_date}</span></div>
    <div class="manifest-stat"><span>Total Photos</span><span>${manifest.total_photos?.toLocaleString()}</span></div>
    ${manifest.photos && manifest.photos.length > 0 ? `
      <div style="margin-top:16px;font-family:'Orbitron',sans-serif;font-size:0.65rem;color:#6b4a30;letter-spacing:0.2em;margin-bottom:8px">RECENT SOLS</div>
      ${manifest.photos.slice(-5).reverse().map(p => `
        <div class="manifest-stat">
          <span>Sol ${p.sol}</span>
          <span>${p.total_photos} photos · ${p.cameras?.join(', ') || '—'}</span>
        </div>
      `).join('')}
    ` : ''}
  `;
  modal.classList.remove('hidden');
}

// Global function called from rover card buttons
window.loadRoverManifest = async function(rover) {
  const modal = document.getElementById('manifest-modal');
  document.getElementById('manifest-modal-title').textContent = `${rover.toUpperCase()} ROVER MANIFEST`;
  document.getElementById('manifest-modal-content').innerHTML = '<div class="loading-spinner"></div>';
  modal.classList.remove('hidden');

  try {
    const res = await fetch(`${CONFIG.MARS_PHOTOS_BASE}/manifests/${rover}?api_key=${CONFIG.NASA_API_KEY}`);
    const data = await res.json();
    showManifestModal(data.photo_manifest, rover);
  } catch (err) {
    document.getElementById('manifest-modal-content').innerHTML = '<p style="color:#f87171;text-align:center;padding:20px">Failed to load manifest.</p>';
  }
};

// ==================== APOD ====================
function setupAPOD() {
  const dateInput = document.getElementById('apod-date');
  dateInput.value = new Date().toISOString().split('T')[0];

  document.getElementById('fetch-apod-btn').addEventListener('click', fetchAPOD);
  document.getElementById('fetch-apod-random').addEventListener('click', fetchRandomAPOD);

  // Auto-load today's APOD
  fetchAPOD();
}

async function fetchAPOD(date) {
  const dateVal = date || document.getElementById('apod-date').value;
  const display = document.getElementById('apod-display');
  display.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%"><div class="loading-spinner"></div></div>';

  try {
    const url = `${CONFIG.NASA_BASE}/planetary/apod?api_key=${CONFIG.NASA_API_KEY}&date=${dateVal}`;
    const res = await fetch(url);
    const data = await res.json();
    renderAPOD(data);
  } catch (err) {
    display.innerHTML = '<div class="gallery-placeholder"><div class="gp-icon">⚠️</div><div class="gp-text">Failed to load APOD</div></div>';
  }
}

async function fetchRandomAPOD() {
  const display = document.getElementById('apod-display');
  display.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%"><div class="loading-spinner"></div></div>';

  try {
    const url = `${CONFIG.NASA_BASE}/planetary/apod?api_key=${CONFIG.NASA_API_KEY}&count=1`;
    const res = await fetch(url);
    const data = await res.json();
    renderAPOD(Array.isArray(data) ? data[0] : data);
  } catch (err) {
    display.innerHTML = '<div class="gallery-placeholder"><div class="gp-icon">⚠️</div><div class="gp-text">Failed to load APOD</div></div>';
  }
}

function renderAPOD(data) {
  const display = document.getElementById('apod-display');

  if (data.error) {
    display.innerHTML = `<div class="gallery-placeholder"><div class="gp-icon">⚠️</div><div class="gp-text">${data.error.message}</div></div>`;
    return;
  }

  const isVideo = data.media_type === 'video';

  display.innerHTML = `
    <div class="apod-card">
      <div class="apod-image-wrap">
        ${isVideo
          ? `<iframe src="${data.url}" frameborder="0" allowfullscreen style="width:100%;height:400px;border-radius:12px"></iframe>`
          : `<img src="${data.hdurl || data.url}" alt="${data.title}" loading="lazy" style="cursor:zoom-in" onclick="openLightbox('${data.hdurl || data.url}', 'HD', 'APOD', '—', '${data.date}')" />`
        }
      </div>
      <div class="apod-info">
        <div class="apod-date-badge">📅 ${data.date}</div>
        <div class="apod-title">${data.title}</div>
        ${data.copyright ? `<div class="apod-copyright">© ${data.copyright}</div>` : ''}
        <div class="apod-explanation">${data.explanation}</div>
        ${!isVideo ? `<a href="${data.hdurl || data.url}" target="_blank" class="fetch-btn secondary" style="display:inline-block;text-align:center;text-decoration:none;margin-top:8px">🖼️ View HD Image</a>` : ''}
      </div>
    </div>
  `;
}

// ==================== TELEMETRY CHARTS ====================
function renderTelemetryCharts() {
  if (!STATE.weatherData || STATE.weatherData.length === 0) return;

  const sols = STATE.weatherData.map(s => `Sol ${s.sol}`);
  const temps = STATE.weatherData.map(s => s.at ? s.at.av : null);
  const pressures = STATE.weatherData.map(s => s.pre ? s.pre.av : null);
  const winds = STATE.weatherData.map(s => s.ws ? s.ws.av : null);

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10,6,3,0.9)',
        borderColor: 'rgba(255,107,53,0.3)',
        borderWidth: 1,
        titleColor: '#ff6b35',
        bodyColor: '#b08060',
        padding: 10,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,107,53,0.08)' },
        ticks: { color: '#6b4a30', font: { family: 'JetBrains Mono', size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255,107,53,0.08)' },
        ticks: { color: '#6b4a30', font: { family: 'JetBrains Mono', size: 10 } }
      }
    },
    animation: { duration: 1000, easing: 'easeInOutQuart' }
  };

  // Temperature Chart
  const tcCtx = document.getElementById('temp-chart').getContext('2d');
  if (STATE.tempChart) STATE.tempChart.destroy();
  STATE.tempChart = new Chart(tcCtx, {
    type: 'line',
    data: {
      labels: sols,
      datasets: [{
        data: temps,
        borderColor: '#ff6b35',
        backgroundColor: 'rgba(255, 107, 53, 0.08)',
        borderWidth: 2,
        pointBackgroundColor: '#ff6b35',
        pointRadius: 4,
        fill: true,
        tension: 0.4
      }]
    },
    options: chartDefaults
  });

  // Pressure Chart
  const pcCtx = document.getElementById('pressure-chart').getContext('2d');
  if (STATE.pressureChart) STATE.pressureChart.destroy();
  STATE.pressureChart = new Chart(pcCtx, {
    type: 'bar',
    data: {
      labels: sols,
      datasets: [{
        data: pressures,
        backgroundColor: 'rgba(79, 195, 247, 0.3)',
        borderColor: '#4fc3f7',
        borderWidth: 1,
        borderRadius: 4,
      }]
    },
    options: chartDefaults
  });

  // Wind Chart
  const wcCtx = document.getElementById('wind-chart').getContext('2d');
  if (STATE.windChart) STATE.windChart.destroy();
  STATE.windChart = new Chart(wcCtx, {
    type: 'line',
    data: {
      labels: sols,
      datasets: [{
        data: winds,
        borderColor: '#ce93d8',
        backgroundColor: 'rgba(206, 147, 216, 0.08)',
        borderWidth: 2,
        pointBackgroundColor: '#ce93d8',
        pointRadius: 4,
        fill: true,
        tension: 0.4
      }]
    },
    options: chartDefaults
  });
}
