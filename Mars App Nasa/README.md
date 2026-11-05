# Mars Explorer — NASA Mission Control

A stunning full-stack Mars exploration dashboard powered by NASA APIs.

## 🚀 Quick Start (No Installation Required)

Since this is a standalone web app, **just open `index.html` in your browser**:

```
mars-explorer/
└── index.html   ← Open this file directly in Chrome/Edge/Firefox
```

## 🌐 Features

| Feature | Description |
|---|---|
| 🗺️ Interactive Mars Map | Leaflet.js with NASA/USGS Mars tile layers |
| 📍 Route Planner | Click-to-add waypoints, auto distance & EVA duration |
| 🌡️ Atmospheric Conditions | InSight lander data with 7-sol history |
| 📸 Rover Photo Gallery | Curiosity, Perseverance, Opportunity, Spirit |
| 🌌 APOD Viewer | NASA Astronomy Picture of the Day |
| 📊 Telemetry Charts | Temperature, pressure, wind trends |
| 💨 Wind Rose | Directional wind visualization |
| 🧑‍🚀 EVA Advisory | Go/No-Go system for extravehicular activities |

## 🔑 NASA API Key

Your API key is configured in `app.js` (line 10):
```js
NASA_API_KEY: 'T3qKKmFvMKKaINbPTeAWh7W54TVMU3RW1AUguMdp'
```

For production, store it in `server/.env` and proxy via the Express backend.

## 🖥️ Backend (Optional — Requires Node.js)

If you install Node.js, you can run the full Express backend:

```bash
cd server
npm install
npm run dev
```

The backend proxies all NASA API calls securely through:
- `GET /api/photos` — Mars Rover Photos
- `GET /api/weather` — InSight Weather
- `GET /api/apod` — Astronomy Picture of the Day
- `GET /api/mars-data` — Landing sites & regions
- `GET /api/manifest?rover=curiosity` — Rover manifests

## 📡 NASA APIs Used

1. **Mars Rover Photos API** — `api.nasa.gov/mars-photos`
2. **InSight Weather Service** — `api.nasa.gov/insight_weather`
3. **APOD API** — `api.nasa.gov/planetary/apod`
4. **Mars WMTS Tiles** — NASA/USGS Mars Viking Global Color Mosaic

## 🎮 How to Use

### Surface Map
- Toggle layers (landing sites, regions of interest)
- Click **Add Waypoint** to enter route planning mode
- Click anywhere on Mars to place waypoints
- Route distance and EVA time are auto-calculated

### Rover Gallery
- Select rover: Curiosity, Perseverance, Opportunity, or Spirit
- Enter a sol number (Martian day) or click **Latest Shots**
- Filter by camera type
- Click any photo for full-screen view

### Mission Planner
- View real-time rover manifests (total photos, max sol)
- Track your planned route waypoints
- Check off science objectives with progress tracking
- Export route as JSON

### Atmospheric Conditions
- Real InSight lander data (simulated if API unavailable)
- EVA Go/No-Go advisory based on current conditions
- Wind rose directional diagram

### APOD Viewer
- Browse NASA's astronomy photo archive by date
- Or click Random for a surprise space photo

### Telemetry Dashboard
- Charts for temperature, pressure, and wind over 7 sols
- Mars planetary fact sheet

## 📁 Project Structure

```
mars-explorer/
├── index.html          # Main HTML (standalone web app)
├── styles.css          # Premium dark space theme
├── app.js              # All JavaScript + NASA API calls
├── README.md           # This file
└── server/             # Optional Express backend
    ├── .env            # API keys (NASA_API_KEY)
    ├── index.js        # Express server
    ├── package.json
    └── routes/
        ├── apod.js
        ├── mars-data.js
        ├── mars-photos.js
        ├── rover-manifest.js
        └── weather.js
```
