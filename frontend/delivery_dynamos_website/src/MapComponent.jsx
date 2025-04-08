import { useEffect, useRef } from "react";
import "./App.css";

const MapComponent = ({ routes }) => {
  // Add useRef to store the map reference
  const mapRef = useRef(null);

  useEffect(() => {
    // Ensure TrimbleMaps is available
    window.TrimbleMaps.APIKey = "299354C7A83A67439273691EA750BB7F"; // Replace with actual API key

    const map = new window.TrimbleMaps.Map({
      container: "map",
      style: window.TrimbleMaps.Common.Style.TRANSPORTATION,
      center: [-89.5, 44.5], // Center on Wisconsin
      zoom: 7, // Adjust zoom level
    });

    // Store map in ref
    mapRef.current = map;

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

    map.on('load', () => {
      // Convert routes data into GeoJSON format
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

      // Add routes data source to the map
      if (map.getSource("routesSource")) {
        map.getSource("routesSource").setData(routesGeojson);
      } else {
        map.addSource("routesSource", { type: "geojson", data: routesGeojson });
      }

      // Add a layer for pickup points
      map.addLayer({
        id: 'pickupPoints',
        type: 'symbol',
        source: 'routesSource',
        layout: {
          'icon-image': ['concat', ['get', '1'], '-fill-blue'], // e.g., "1-fill-blue"
          'icon-size': 1.0,
          'icon-allow-overlap': true
        },
        filter: ['==', ['get', 'type'], 'pickup']
      });

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
      
      routes.forEach(route => {
        const myRoute = new window.TrimbleMaps.Route({
          routeId: `route-${route.id}`,
          stops: [
            new window.TrimbleMaps.LngLat(route.pickupLong, route.pickupLat),
            new window.TrimbleMaps.LngLat(route.dropoffLong, route.dropoffLat)
          ],
        });
        myRoute.addTo(map);
      });
    });

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [routes]);

  return <div id="map"></div>; // Map container
};

export default MapComponent;