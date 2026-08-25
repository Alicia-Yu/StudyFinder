import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MapView from './components/MapView'
import './index.css'

const allDemoMarkers = [
  { id: 'leon', name: 'Leon Coffee House', latitude: 47.6611111111, longitude: -122.3138888889, targetHours: 0.167 },
  { id: 'ugly-mug', name: 'Ugly Mug Cafe', latitude: 47.65, longitude: -122.38, targetHours: 0.167 },
  { id: 'allegro', name: 'Cafe Allegro', latitude: 47.607968, longitude: -122.328452, targetHours: 0.167 },
  { id: 'toasted', name: 'TOASTED Bagels & Coffee', latitude: 47.664491, longitude: -122.311634, targetHours: 0.167 },
  { id: 'solstice', name: 'Cafe Solstice', latitude: 47.6574, longitude: -122.3129, targetHours: 0.167 },
  { id: 'seven', name: 'Seven Coffee Roasters Market & Cafe', latitude: 47.6691, longitude: -122.3060, targetHours: 0.167 },
  { id: 'sunshine', name: 'Seattle Sunshine and Coffee', latitude: 47.6689, longitude: -122.2921, targetHours: 0.167 },
  { id: 'ancient-gate', name: 'Ancient Gate Coffee', latitude: 47.6614, longitude: -122.3130, targetHours: 0.167 },
  { id: 'lune', name: 'Lune Cafe', latitude: 47.6653, longitude: -122.3128, targetHours: 0.167 },
  { id: 'boon-booma', name: 'Boon Booma Coffee', latitude: 47.6604, longitude: -122.3128, targetHours: 0.167 },
  { id: 'suzallo', name: 'Suzallo and Allen Library', latitude: 47.6557, longitude: -122.3084, targetHours: 0.167 },
  { id: 'odegaard', name: 'Odegaard Undergrad Library', latitude: 47.6565, longitude: -122.3104, targetHours: 0.167 },
  { id: 'health-sciences', name: 'Health Sciences Library', latitude: 47.6491, longitude: -122.3070, targetHours: 0.167 },
  { id: 'engineering', name: 'Engineering Library', latitude: 47.6546, longitude: -122.3045, targetHours: 0.167 },
  { id: 'foster', name: 'Foster Library', latitude: 47.6570, longitude: -122.3050, targetHours: 0.167 },
  { id: 'hub', name: 'HUB', latitude: 47.6553, longitude: -122.3052, targetHours: 0.167 },
  { id: 'south-campus', name: 'South Campus Center', latitude: 47.6478, longitude: -122.3058, targetHours: 0.167 },
  { id: 'starbucks', name: 'Starbucks', latitude: 47.6582, longitude: -122.3134, targetHours: 0.167 },
  { id: 'cafe-ave', name: 'Cafe on the Ave', latitude: 47.6584, longitude: -122.3134, targetHours: 0.167 },
  { id: 'snooze', name: 'Snooze', latitude: 47.6588, longitude: -122.3130, targetHours: 0.167 },
  { id: 'boba-up', name: 'Boba up', latitude: 47.6581, longitude: -122.3134, targetHours: 0.167 },
  { id: 'dont-yell', name: "Don't Yell At Me", latitude: 47.6616, longitude: -122.3134, targetHours: 0.167 },
  { id: 'hmart', name: 'HMart Grab & Go', latitude: 47.607968, longitude: -122.328452, targetHours: 0.167 },
  { id: 'pacha', name: 'Pacha Collective', latitude: 47.6803, longitude: -122.3162, targetHours: 0.167 },
  { id: 'mr-west', name: 'Mr West Cafe Bar', latitude: 47.6632, longitude: -122.2989, targetHours: 0.167 },
  { id: 'zoka', name: 'Zoka Coffee & Roaster', latitude: 47.6662, longitude: -122.2974, targetHours: 0.167 },
  { id: 'oh-bear', name: 'Oh! Bear Cafe and Teahouse', latitude: 47.6634, longitude: -122.3161, targetHours: 0.167 },
  { id: 'cafe-happy', name: 'Cafe Happy', latitude: 47.6558, longitude: -122.3202, targetHours: 0.167 }
];

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <MapView height="100vh" markers={allDemoMarkers} />
    </div>
  </StrictMode>,
)