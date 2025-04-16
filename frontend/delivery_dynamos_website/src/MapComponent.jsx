import { useContext, useEffect, useRef, useState } from "react";
import { RouteContext } from "./context/RouteContext";
import "./App.css";

const MapComponent = ({ routes, originCoordinates, originRadius, destinationCoordinates, destinationRadius, radius, center }) => {
  const { selectedRouteId, setSelectedRouteId } = useContext(RouteContext);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const mapRef = useRef(null);
  const routesRef = useRef([]);

  const createGeoJSONCircle = (center, radiusInMiles, points = 64) => {
    const coords = { latitude: center[1], longitude: center[0] };
  
    // Convert miles to kilometers
    const radiusInKm = radiusInMiles * 1.60934;
  
    const km = radiusInKm;
    const ret = [];
    const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
    const distanceY = km / 110.574;
    let theta, x, y;
  
    for (let i = 0; i < points; i++) {
      theta = (i / points) * (2 * Math.PI);
      x = distanceX * Math.cos(theta);
      y = distanceY * Math.sin(theta);
      ret.push([coords.longitude + x, coords.latitude + y]);
    }
  
    ret.push(ret[0]); // close the polygon
  
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [ret],
          },
        },
      ],
    };
  };
  
  const sendLocationToBackend = async (lat, lng) => {
    const data = {
      latitude: lat,
      longitude: lng
    };

    try {
      const response = await fetch('/receive-user-location', {
        method: 'POST',
        // mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const responseData = await response.json();
      console.log('Response from Python backend:', responseData);
    } catch (error) {
      console.error('Error sending location to backend:', error);
    }
  };


  useEffect(() => {
    // Ensure TrimbleMaps is available
    window.TrimbleMaps.APIKey = import.meta.env.VITE_PC_MILER_API_KEY;

    const map = new window.TrimbleMaps.Map({
      container: "map",
      style: window.TrimbleMaps.Common.Style.TRANSPORTATION,
      center: [-89.5, 44.5],
      zoom: 7,
    });

    // Store map in ref
    mapRef.current = map;
    routesRef.current = [];

    // Handle missing style images
    mapRef.current.on('styleimagemissing', (e) => {
      console.log("Missing image:", e.id);
      
      // Create a simple canvas element for the missing marker
      const canvas = document.createElement('canvas');
      canvas.width = 20;
      canvas.height = 20;
      const ctx = canvas.getContext('2d');
      
      // Draw a circle with color based on marker type
      ctx.beginPath();
      ctx.arc(10, 10, 8, 0, 2 * Math.PI);
      
      // Choose color based on the image name
      if (e.id.includes('blue')) {
        ctx.fillStyle = '#3056D3'; // Blue for pickup
      } else if (e.id.includes('red')) {
        ctx.fillStyle = '#E93C33'; // Red for dropoff
      } else {
        ctx.fillStyle = '#888888'; // Gray for unknown
      }
      
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Add the image to the map
      mapRef.current.addImage(e.id, canvas);
    });

    map.on("load", () => {
      if (originCoordinates && originRadius) {
        const coordinates = [originCoordinates.lon, originCoordinates.lat]; // Madison, WI
        console.log(originCoordinates)
        console.log(originRadius)

        const circleData = createGeoJSONCircle(coordinates, originRadius);
        map.addSource('originCircle', {
          type: 'geojson',
          data: circleData,
        });

        map.addLayer({
          id: 'originCircle',
          type: 'fill',
          source: 'originCircle',
          paint: {
            'fill-color': '#007bff',
            'fill-opacity': 0.4,
            'fill-outline-color': '#007bff',
          },
        });
      }
      if (destinationCoordinates && destinationRadius) {
        const destCoordinates = [destinationCoordinates.lon, destinationCoordinates.lat]; // Madison, WI

        const destinationData = createGeoJSONCircle(destCoordinates, destinationRadius);
        map.addSource('destinationCircle', {
          type: 'geojson',
          data: destinationData,
        });

        map.addLayer({
          id: 'destinationCircle',
          type: 'fill',
          source: 'destinationCircle',
          paint: {
            'fill-color': '#dc3545',
            'fill-opacity': 0.4,
            'fill-outline-color': '#dc3545',
          },
        });
      }

      // Display user location if available
      if (location.lat && location.lng) {
        const userLocationEl = document.createElement("div");
        userLocationEl.className = "custom-marker user-location-marker"; // Custom class for user location
  
        new window.TrimbleMaps.Marker({ element: userLocationEl })
          .setLngLat([location.lng, location.lat])
          .addTo(map);
  
        map.setCenter([location.lng, location.lat]);
        map.setZoom(14); // Optionally zoom in for better visibility
      }

      // If search center and radius are provided, draw a circle
      if (center && radius) {
        // Add a circle around the search center point
        if (map.getSource("searchRadiusSource")) {
          map.removeLayer("searchRadiusLayer");
          map.removeSource("searchRadiusSource");
        }

        map.addSource("searchRadiusSource", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [center.lng, center.lat]
            },
            properties: {}
          }
        });

        map.addLayer({
          id: "searchRadiusLayer",
          type: "circle",
          source: "searchRadiusSource",
          paint: {
            "circle-radius": {
              stops: [
                [0, 0],
                [20, radius * 1609.34 / Math.pow(2, (20 - map.getZoom()))] // Convert miles to meters
              ],
              base: 2
            },
            "circle-color": "rgba(99, 99, 255, 0.2)",
            "circle-stroke-color": "rgba(99, 99, 255, 0.8)",
            "circle-stroke-width": 2
          }
        });
      }

      // Convert routes data into GeoJSON format for better performance
      const routesGeojson = {
        type: 'FeatureCollection',
        features: routes.flatMap(route => [
          {
            type: 'Feature',
            properties: {
              id: route.id,
              type: 'pickup'
            },
            geometry: {
              type: 'Point',
              coordinates: [route.pickupLong, route.pickupLat]
            }
          },
          {
            type: 'Feature',
            properties: {
              id: route.id,
              type: 'dropoff'
            },
            geometry: {
              type: 'Point',
              coordinates: [route.dropoffLong, route.dropoffLat]
            }
          }
        ])
      };

      // Add routes data source to the map for GeoJSON layers
      if (map.getSource("routesSource")) {
        map.getSource("routesSource").setData(routesGeojson);
      } else {
        map.addSource("routesSource", { type: "geojson", data: routesGeojson });
        
        // Add a layer for dropoff points
        map.addLayer({
          id: 'dropoffPoints',
          type: 'symbol',
          source: 'routesSource',
          layout: {
            'icon-image': ['concat', ['get', '1'], '-fill-red'], // e.g., "1-fill-red"
            'icon-size': 1.0,
            'icon-allow-overlap': true
          },
          filter: ['==', ['get', 'type'], 'dropoff']
        });
      }

      // Add individual routes with TrimbleMaps.Route for route rendering and interaction
      routes.forEach((route) => {
        const routeId = `route-${route.id}`;

        const myRoute = new window.TrimbleMaps.Route({
          routeId,
          stops: [
            new window.TrimbleMaps.LngLat(route.pickupLong, route.pickupLat),
            new window.TrimbleMaps.LngLat(route.dropoffLong, route.dropoffLat),
          ],
          showStops: false,
          frameRoute: false,
          routeColor: selectedRouteId === route.id ? "#00FF00" : "#808080",
        });

        myRoute.addTo(map);
        routesRef.current.push({ id: route.id, route: myRoute });

        myRoute.on("click", () => {
          console.log("route is clicked");
          setSelectedRouteId(route.id); // Update global context
        });

        // Add custom markers for better visibility
        const pickupEl = document.createElement("div");
        pickupEl.className = "custom-marker pickup-marker";

        const dropoffEl = document.createElement("div");
        dropoffEl.className = "custom-marker dropoff-marker";

        new window.TrimbleMaps.Marker({ element: pickupEl })
          .setLngLat([route.pickupLong, route.pickupLat])
          .addTo(map);

        new window.TrimbleMaps.Marker({ element: dropoffEl })
          .setLngLat([route.dropoffLong, route.dropoffLat])
          .addTo(map);
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [routes, location]);

  // Track user location
  useEffect(() => {
    if (navigator.geolocation) {
      // Continuously watch the position
      const watchID = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude }); // Update React state with new location
          sendLocationToBackend(latitude, longitude); // Send the updated location to the backend
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        {
          enableHighAccuracy: true,  // Use GPS if available
          maximumAge: 0,  // No caching
          timeout: 30000   // Wait max 15 sec
        }
      );

      // Cleanup function to stop tracking when the component unmounts
      return () => {
        if (watchID) {
          navigator.geolocation.clearWatch(watchID);
        }
      };
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);  // Only run once on mount

  // Highlight selected route
  useEffect(() => {
    routesRef.current.forEach(({ id, route }) => {
      const isSelected = id === selectedRouteId;
      route.update({ routeColor: isSelected ? "#00FF00" : "#808080" });
      if (isSelected) {
        route.moveLayer();
      }
    });
  }, [selectedRouteId]);

  return <div id="map" style={{ height: "100vh" }} />;
};

export default MapComponent;
