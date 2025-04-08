import { useEffect } from "react";
import "./App.css";

const MapComponent = ({ routes }) => {
  useEffect(() => {
    // Ensure TrimbleMaps is available

    window.TrimbleMaps.APIKey = "299354C7A83A67439273691EA750BB7F"; // Replace with actual API key

    const map = new window.TrimbleMaps.Map({
      container: "map",
      style: window.TrimbleMaps.Common.Style.TRANSPORTATION,
      center: [-89.5, 44.5], // Center on Wisconsin
      zoom: 7, // Adjust zoom level
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
      // map.addSource('routesSource', {
      //   type: 'geojson',
      //   data: routesGeojson
      // });
  
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
        const myRoute = new TrimbleMaps.Route({
          routeId: `route-${route.id}`,
          stops: [
            new TrimbleMaps.LngLat(route.pickupLong, route.pickupLat),
            new TrimbleMaps.LngLat(route.dropoffLong, route.dropoffLat)
          ],
        });
        myRoute.addTo(map)

      });
    });



  }, [routes]);



  return <div id="map"></div>; // Map container
};

export default MapComponent;