// import { useEffect } from "react";
// import "./App.css";

// const MapComponent = ({ routes }) => {
//   useEffect(() => {
//     // Ensure TrimbleMaps is available

//     window.TrimbleMaps.APIKey = "299354C7A83A67439273691EA750BB7F"; // Replace with actual API key

//     const map = new window.TrimbleMaps.Map({
//       container: "map",
//       style: window.TrimbleMaps.Common.Style.TRANSPORTATION,
//       center: [-89.5, 44.5], // Center on Wisconsin
//       zoom: 7, // Adjust zoom level
//     });

//     map.on('load', () => {
//       // Convert routes data into GeoJSON format
//       const routesGeojson = {
//         type: 'FeatureCollection',
//         features: routes.flatMap(route => [
//           {
//             type: 'Feature',
//             properties: {
//               id: route.id,
//               type: 'pickup'
//             },
//             geometry: {
//               type: 'Point',
//               coordinates: [route.pickupLong, route.pickupLat]
//             }
//           },
//           {
//             type: 'Feature',
//             properties: {
//               id: route.id,
//               type: 'dropoff'
//             },
//             geometry: {
//               type: 'Point',
//               coordinates: [route.dropoffLong, route.dropoffLat]
//             }
//           }
//         ])
//       };

//       // Add routes data source to the map
//       // map.addSource('routesSource', {
//       //   type: 'geojson',
//       //   data: routesGeojson
//       // });

//       if (map.getSource("routesSource")) {
//         map.getSource("routesSource").setData(routesGeojson);
//       } else {
//         map.addSource("routesSource", { type: "geojson", data: routesGeojson });
//       }

//       // // Add a layer for pickup points
//       // map.addLayer({
//       //   id: 'pickupPoints',
//       //   type: 'symbol',
//       //   source: 'routesSource',
//       //   layout: {
//       //     'icon-image': ['concat', ['get', '1'], '0-fill-blue'], // e.g., "1-fill-blue"
//       //     'icon-size': 1.0,
//       //     'icon-allow-overlap': true
//       //   },
//       //   filter: ['==', ['get', 'type'], 'pickup']
//       // });

//       // // Add a layer for dropoff points
//       // map.addLayer({
//       //   id: 'dropoffPoints',
//       //   type: 'symbol',
//       //   source: 'routesSource',
//       //   layout: {
//       //     'icon-image': ['concat', ['get', '1'], '0-fill-red'], // e.g., "1-fill-red"
//       //     'icon-size': 1.0,
//       //     'icon-allow-overlap': true
//       //   },
//       //   filter: ['==', ['get', 'type'], 'dropoff']
//       // });
//       routes.forEach(route => {
//         const myRoute = new TrimbleMaps.Route({
//           routeId: `route-${route.id}`,
//           stops: [
//             new TrimbleMaps.LngLat(route.pickupLong, route.pickupLat),
//             new TrimbleMaps.LngLat(route.dropoffLong, route.dropoffLat)
//           ],
//           showStops: false,
//           routeColor: "#808080"
//         });
//         myRoute.addTo(map)

//         // Add pickup marker
//         const pickupMarker = new TrimbleMaps.Marker({
//           position: new TrimbleMaps.LngLat(route.pickupLong, route.pickupLat),
//           map: map,
//           draggable: false
//         });

//         pickupMarker.on('click', () => {  
//           console.log(`Pickup marker clicked for route ${route.id}`);
//           myRoute.update({ routeColor: 'purple' });
//         });

//         // Add dropoff marker
//         const dropoffMarker = new TrimbleMaps.Marker({
//           position: new TrimbleMaps.LngLat(route.dropoffLong, route.dropoffLat),
//           map: map,
//           draggable: false
//         });

//         dropoffMarker.on('click', () => {
//           console.log(`Dropoff marker clicked for route ${route.id}`);
//           myRoute.update({ routeColor: 'purple' });
//         });
//       });

//     });

//   }, [routes]);



//   return <div id="map"></div>; // Map container
// };

// export default MapComponent;

import { useEffect } from "react";
import "./App.css";

const MapComponent = ({ routes }) => {
  useEffect(() => {
    window.TrimbleMaps.APIKey = "299354C7A83A67439273691EA750BB7F";

    const map = new window.TrimbleMaps.Map({
      container: "map",
      style: window.TrimbleMaps.Common.Style.TRANSPORTATION,
      center: [-89.5, 44.5],
      zoom: 7,
    });

    const markers = [];

    map.on("load", () => {
      routes.forEach((route) => {
        const routeId = `route-${route.id}`;

        const myRoute = new TrimbleMaps.Route({
          routeId,
          stops: [
            new TrimbleMaps.LngLat(route.pickupLong, route.pickupLat),
            new TrimbleMaps.LngLat(route.dropoffLong, route.dropoffLat),
          ],
          showStops: false,
          routeColor: "#808080",
        });
        myRoute.addTo(map);

        // ✅ Create custom DOM elements for pickup and dropoff
        const pickupEl = document.createElement("div");
        pickupEl.className = "custom-marker pickup-marker";

        const dropoffEl = document.createElement("div");
        dropoffEl.className = "custom-marker dropoff-marker";

        // ✅ Add pickup marker (blue)
        const pickupMarker = new TrimbleMaps.Marker({
          element: pickupEl,
          draggable: false,
        })
          .setLngLat([route.pickupLong, route.pickupLat])
          .addTo(map);

        pickupMarker.on("click", () => {
          console.log(`Pickup marker clicked for route ${route.id}`);
          myRoute.update({ routeColor: "purple" });
        });

        // ✅ Add dropoff marker (red)
        const dropoffMarker = new TrimbleMaps.Marker({
          element: dropoffEl,
          draggable: false,
        })
          .setLngLat([route.dropoffLong, route.dropoffLat])
          .addTo(map);

        dropoffMarker.on("click", () => {
          console.log(`Dropoff marker clicked for route ${route.id}`);
          myRoute.update({ routeColor: "purple" });
        });

        markers.push(pickupMarker, dropoffMarker);
      });
    });

    return () => {
      markers.forEach((marker) => marker.remove());
      if (map) map.remove();
    };
  }, [routes]);

  return <div id="map" style={{ height: "100vh" }}></div>;
};

export default MapComponent;
