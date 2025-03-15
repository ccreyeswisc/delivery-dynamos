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
                    coordinates: [route.pickupLng, route.pickupLat]
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
                    coordinates: [route.dropoffLng, route.dropoffLat]
                  }
                }
              ])
            };
          
            // Add routes data source to the map
            map.addSource('routesSource', {
              type: 'geojson',
              data: routesGeojson
            });
          
            // Add a layer for pickup points
            map.addLayer({
              id: 'pickupPoints',
              type: 'symbol',
              source: 'routesSource',
              layout: {
                'icon-image': ['concat', ['get', 'id'], '-fill-blue'], // e.g., "1-fill-blue"
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
                'icon-image': ['concat', ['get', 'id'], '-fill-red'], // e.g., "1-fill-red"
                'icon-size': 1.0,
                'icon-allow-overlap': true
              },
              filter: ['==', ['get', 'type'], 'dropoff']
            });
            routes.forEach(route => {
                const myRoute = new TrimbleMaps.Route({
                  routeId: `route-${route.id}`,
                  stops: [
                    new TrimbleMaps.LngLat(route.pickupLng, route.pickupLat),
                    new TrimbleMaps.LngLat(route.dropoffLng, route.dropoffLat)
                  ]
                  
                });
                myRoute.addTo(map)
              
              });   
          });  
             
 
    
    }, [routes]);
    


    return <div id="map"></div>; // Map container
};

export default MapComponent;
// import { useEffect } from "react";
// import "./App.css";

// const MapComponent = ({ routes }) => {
//     useEffect(() => {
//         if (!window.TrimbleMaps) {
//             console.error("TrimbleMaps library is not loaded.");
//             return;
//         }

//         window.TrimbleMaps.APIKey = "299354C7A83A67439273691EA750BB7F"; // Replace with actual API key

//         const map = new window.TrimbleMaps.Map({
//             container: "map",
//             style: window.TrimbleMaps.Common.Style.TRANSPORTATION,
//             center: [-89.5, 44.5], // Center on Wisconsin
//             zoom: 7, // Adjust zoom level
//         });

//         map.on("load", () => {
//             const routesGeojson = {
//                 type: "FeatureCollection",
//                 features: routes.flatMap(route =>
//                     route.stops.flatMap((stop, index) => [
//                         {
//                             type: "Feature",
//                             properties: {
//                                 id: `${route.id}-pickup-${index}`,
//                                 type: "pickup",
//                             },
//                             geometry: {
//                                 type: "Point",
//                                 coordinates: [stop.coordinates.lng, stop.coordinates.lat],
//                             },
//                         },
//                     ])
//                 ),
//             };

//             if (map.getSource("routesSource")) {
//                 map.getSource("routesSource").setData(routesGeojson);
//             } else {
//                 map.addSource("routesSource", {
//                     type: "geojson",
//                     data: routesGeojson,
//                 });

//                 map.addLayer({
//                     id: "pickupPoints",
//                     type: "circle",
//                     source: "routesSource",
//                     paint: {
//                         "circle-radius": 6,
//                         "circle-color": "#007cbf",
//                     },
//                 });
//             }

//             routes.forEach(route => {
//                 if (route.stops.length >= 2) {
//                     const myRoute = new TrimbleMaps.Route({
//                         routeId: `route-${route.id}`,
//                         stops: route.stops.map(stop =>
//                             new TrimbleMaps.LngLat(stop.coordinates.lng, stop.coordinates.lat)
//                         ),
//                     });
//                     myRoute.addTo(map);
//                 }
//             });
//         });

//         return () => {
//             if (map) {
//                 map.remove();
//             }
//         };
//     }, [routes]);

//     return <div id="map" style={{ width: "100%", height: "100vh" }}></div>; // Ensure map container is visible
// };

// export default MapComponent;
