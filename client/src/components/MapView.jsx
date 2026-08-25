import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import './MapView.css';
import { apiService } from '../services/api';
import GeminiChat from './GeminiChat';

const nancyIcon = L.divIcon({
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <img src="/Nancy.png" style="width:60px;height:60px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);" />
      <span style="font-size:12px;font-weight:600;color:#2c3e50;background:rgba(146, 168, 219, 0.8);border-radius:8px;padding:2px 6px;margin-top:2px;">Nancy</span>
    </div>
  `,
  className: '',
  iconSize: [60, 70],
  iconAnchor: [30, 70],
  popupAnchor: [0, -60]
});

const aliciaIcon = L.divIcon({
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <img src="/Alicia.png" style="width:60px;height:60px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);" />
      <span style="font-size:12px;font-weight:600;color:#2c3e50;background:rgba(233, 160, 160, 0.8);border-radius:8px;padding:2px 6px;margin-top:2px;">You</span>
    </div>
  `,
  className: '',
  iconSize: [60, 70],
  iconAnchor: [30, 70],
  popupAnchor: [0, -60]
});

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapUpdater = ({ location }) => {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map) return;
    if (location) {
      if (!markerRef.current) {
        markerRef.current = L.marker([location.latitude, location.longitude]).addTo(map);
      } else {
        markerRef.current.setLatLng([location.latitude, location.longitude]);
      }
    }
    return () => {
      if (markerRef.current) {
        try {
          map.removeLayer(markerRef.current);
        } catch (e) {}
        markerRef.current = null;
      }
    };
  }, [location, map]);

  return null;
};

const FitBounds = ({ markers = [], userLocation }) => {
  return null;
};

const getMarkerIcon = (type, size = 28) => {
  const emoji = type === 'library' ? '📚' : (type === 'coffee' ? '☕' : '📍');
  const html = `<div style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;background:#ffffff;border:2px solid rgba(0,0,0,0.08);box-shadow:0 1px 3px rgba(0,0,0,0.2);font-size:${Math.floor(size * 0.6)}px">${emoji}</div>`;
  return L.divIcon({ html, className: 'custom-emoji-icon', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
};

export default function MapView({ 
  center = [47.6567, -122.3066],
  zoom = 13,
  height = "400px",
  showUserLocation = true,
  onLocationUpdate = null,
  markers = [],
  isPaused = false
}) {
  const [userLocation, setUserLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [error, setError] = useState(null);
  const [smoothedLocation, setSmoothedLocation] = useState(null);
  const [enhancedLocationData, setEnhancedLocationData] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [isLoadingEnhanced, setIsLoadingEnhanced] = useState(false);
  const [googleMapsConfigured, setGoogleMapsConfigured] = useState(false);
  const [nearbyBuilding, setNearbyBuilding] = useState(null);
  const [showYouAreHereButton, setShowYouAreHereButton] = useState(false);
  const [locationStartTime, setLocationStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  
  const startTimeRef = useRef(null);
  const locationBufferRef = useRef([]);

  const smoothLocation = useCallback((newLocation, buffer) => {
    const updatedBuffer = [...buffer, newLocation].slice(-5);
    
    if (updatedBuffer.length < 2) {
      return newLocation;
    }
    
    const avgLat = updatedBuffer.reduce((sum, loc) => sum + loc.latitude, 0) / updatedBuffer.length;
    const avgLng = updatedBuffer.reduce((sum, loc) => sum + loc.longitude, 0) / updatedBuffer.length;
    const avgAccuracy = updatedBuffer.reduce((sum, loc) => sum + loc.accuracy, 0) / updatedBuffer.length;
    
    return {
      latitude: avgLat,
      longitude: avgLng,
      accuracy: avgAccuracy,
      timestamp: newLocation.timestamp,
      smoothed: true
    };
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const startLocationSession = useCallback(async (marker) => {
    try {
      const sessionData = {
        locationId: marker.id,
        locationName: marker.name,
        latitude: marker.latitude,
        longitude: marker.longitude,
        targetHours: marker.targetHours || 4
      };

      const response = await apiService.startLocationSession(sessionData);
      setActiveSession(response.session);
      setSessionId(response.session.id);
      console.log('✅ Location session started:', response.session);
    } catch (error) {
      // Silently handle
    }
  }, []);

  const endLocationSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      await apiService.endLocationSession(sessionId);
      console.log('✅ Location session ended');
    } catch (error) {
      // Silently handle
    } finally {
      setActiveSession(null);
      setSessionId(null);
    }
  }, [sessionId]);

  const addSessionCheckpoint = useCallback(async (latitude, longitude, accuracy) => {
    if (!sessionId) return;

    try {
      await apiService.addSessionCheckpoint({
        sessionId,
        latitude,
        longitude,
        accuracy
      });
    } catch (error) {
      // Silently handle
    }
  }, [sessionId]);

  const formatElapsedTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000
    };
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed
        };
        
        setUserLocation(location);
        setError(null);

        checkProximityToBuildings(location.latitude, location.longitude);

        onLocationUpdate?.(location);
      },
      (error) => {
        setError('Failed to get location: ' + error.message);
      },
      options
    );
  };

  const getEnhancedLocationData = useCallback(async (latitude, longitude) => {
    if (!googleMapsConfigured) return;
    
    setIsLoadingEnhanced(true);
    try {
      const enhancedData = await apiService.getEnhancedLocation(latitude, longitude);
      if (enhancedData.success) {
        setEnhancedLocationData(enhancedData);
        setNearbyPlaces(enhancedData.nearbyPlaces || []);
      }
    } catch (error) {
      // Silently handle
    } finally {
      setIsLoadingEnhanced(false);
    }
  }, [googleMapsConfigured]);

  const checkGoogleMapsConfig = useCallback(async () => {
    try {
      const config = await apiService.checkLocationConfig();
      setGoogleMapsConfigured(config.configured);
    } catch (error) {
      setGoogleMapsConfigured(false);
    }
  }, []);

  const saveLocationToBackend = useCallback(async (location) => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (!token) {
      return;
    }

    try {
      await apiService.trackLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        enhancedData: enhancedLocationData
      });
    } catch (error) {
      // Silently handle
    }
  }, [enhancedLocationData]);

  useEffect(() => {
    checkGoogleMapsConfig();
  }, [checkGoogleMapsConfig]);

  useEffect(() => {
    const recoverActiveSessions = async () => {
      try {
        const activeSessions = await apiService.getActiveLocationSessions();
        if (activeSessions && activeSessions.length > 0) {
          const session = activeSessions[0];
          setActiveSession(session);
          setSessionId(session.id);

          const marker = markers.find(m => m.id === session.location_id);
          if (marker) {
            setNearbyBuilding(marker);
            setShowYouAreHereButton(true);
            setShowProgressBar(true);

            const sessionStartTime = new Date(session.session_start_time).getTime();
            const currentTime = Date.now();
            const elapsed = currentTime - sessionStartTime;
            setLocationStartTime(sessionStartTime);
            setElapsedTime(elapsed);
          }
        }
      } catch (error) {
        // Silently handle
      }
    };

    recoverActiveSessions();
  }, [markers]);

  useEffect(() => {
    let interval;
    if (locationStartTime && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - locationStartTime);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [locationStartTime, isPaused]);

  useEffect(() => {
    getCurrentLocation();
    startTimeRef.current = Date.now();
  }, []);

  const checkProximityToBuildings = useCallback((userLat, userLng) => {
    if (!Array.isArray(markers) || markers.length === 0) return;

    const PROXIMITY_THRESHOLD = 50;

    for (const marker of markers) {
      if (marker.latitude && marker.longitude) {
        const distance = calculateDistance(userLat, userLng, marker.latitude, marker.longitude);

        if (distance <= PROXIMITY_THRESHOLD) {
          if (nearbyBuilding && nearbyBuilding.id === marker.id) {
            setNearbyBuilding(marker);
            setShowYouAreHereButton(true);
            return;
          }

          setNearbyBuilding(marker);
          setShowYouAreHereButton(true);
          setLocationStartTime(Date.now());
          setElapsedTime(0);
          setShowProgressBar(true);

          startLocationSession(marker);
          return;
        }
      }
    }

    if (nearbyBuilding) {
      endLocationSession();
    }

    setNearbyBuilding(null);
    setShowYouAreHereButton(false);
    setLocationStartTime(null);
    setElapsedTime(0);
    setShowProgressBar(false);
  }, [markers, calculateDistance, nearbyBuilding, startLocationSession, endLocationSession]);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000
    };
    
    const trackLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed
          };
          
          const smoothed = smoothLocation(location, locationBufferRef.current);
          locationBufferRef.current = [...locationBufferRef.current, location].slice(-5);
          
          setUserLocation(smoothed);
          setSmoothedLocation(smoothed);

          checkProximityToBuildings(smoothed.latitude, smoothed.longitude);

          if (sessionId && nearbyBuilding) {
            addSessionCheckpoint(smoothed.latitude, smoothed.longitude, smoothed.accuracy);
          }
          
          setLocationHistory(prev => {
            const newHistory = [...prev];
            if (prev.length > 0) {
              const lastLocation = prev[prev.length - 1];
              const distance = calculateDistance(
                lastLocation.latitude, lastLocation.longitude,
                location.latitude, location.longitude
              );
              location.distanceFromLast = distance;
            }
            return [...newHistory.slice(-99), location];
          });
          
          onLocationUpdate?.(smoothed);
          
          if (googleMapsConfigured) {
            getEnhancedLocationData(location.latitude, location.longitude);
          }

          saveLocationToBackend(smoothed);
        },
        (error) => {
          setError('Location tracking error: ' + error.message);
        },
        options
      );
    };

    trackLocation();
    
    const intervalId = setInterval(trackLocation, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [smoothLocation, onLocationUpdate, sessionId, nearbyBuilding, googleMapsConfigured, isPaused]);

  return (
    <div className="map-container relative">
        {error && (
          <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">{error}</div>
        )}

      <div style={{ height, width: '100%' }}>
        <MapContainer
          center={userLocation ? [userLocation.latitude, userLocation.longitude] : center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}{r}.jpg"
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
          />

          <Marker position={[47.6597, -122.3067]} icon={nancyIcon} zIndexOffset={1000}>
            <Popup><strong>Nancy</strong><br />📍 5000 University Way NE, Seattle, WA 98105</Popup>
          </Marker>
          
          {showUserLocation && userLocation && (
            <>
              <Marker 
                position={[userLocation.latitude, userLocation.longitude]}
                icon={aliciaIcon}
                zIndexOffset={1000}
              >
                <Popup>
                  <div>
                    <strong>Your Location</strong>
                    <br />Lat: {userLocation.latitude.toFixed(8)}<br />Lng: {userLocation.longitude.toFixed(8)}
                  </div>
                </Popup>
              </Marker>

              {showYouAreHereButton && nearbyBuilding && (
                <Marker
                  position={[userLocation.latitude, userLocation.longitude]}
                  icon={L.divIcon({
                    className: 'you-are-here-button',
                    html: `<div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); border: 2px solid white;">${nearbyBuilding.name}</div>`,
                    iconSize: [200, 40],
                    iconAnchor: [100, 40]
                  })}
                >
                  <Popup>
                    <div className="p-3">
                      <h4 className="font-semibold text-green-800">{nearbyBuilding.name}</h4>
                      <div className="text-2xl font-mono font-bold text-blue-800">{formatElapsedTime(elapsedTime)}</div>
                    </div>
                  </Popup>
                </Marker>
              )}
            </>
          )}

          {Array.isArray(markers) && markers.map((m, idx) => (
            <Marker
              key={m.id ?? idx}
              position={[m.latitude, m.longitude]}
              icon={getMarkerIcon(
                (/library/i.test(m.name)) ? 'library' : (/cafe|coffee|starbucks|bagel|boba|snooze|toast|coffeemaker/i.test(m.name) ? 'coffee' : 'default')
              )}
            >
              <Tooltip permanent direction="top" className="map-tooltip">{m.name}</Tooltip>
              <Popup>
                <div><strong>{m.name}</strong><br />Lat: {m.latitude.toFixed(8)}<br />Lng: {m.longitude.toFixed(8)}</div>
              </Popup>
            </Marker>
          ))}

          <FitBounds markers={markers} userLocation={userLocation} />
          <MapUpdater location={userLocation} />
        </MapContainer>
      </div>

      <GeminiChat />
    </div>
  );
}