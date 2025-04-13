import { useContext, useEffect, useRef } from "react";
import { RouteContext } from "./context/RouteContext";
import "./App.css";

const MapComponent = ({ routes, originCoordinates, originRadius, destinationCoordinates, destinationRadius }) => {
  const { selectedRouteId, setSelectedRouteId } = useContext(RouteContext);
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
  
  useEffect(() => {
    window.TrimbleMaps.APIKey = "299354C7A83A67439273691EA750BB7F";

    const map = new window.TrimbleMaps.Map({
      container: "map",
      style: window.TrimbleMaps.Common.Style.TRANSPORTATION,
      center: [-89.5, 44.5],
      zoom: 7,
    });

    const markers = [];
    const routesList = [];
    mapRef.current = map;
    routesRef.current = [];

    map.on("load", () => {
      // if (!originCoordinates || !originRadius) return;
      if (originCoordinates && originRadius) {
        const coordinates = [originCoordinates.lon, originCoordinates.lat]; // Madison, WI
        const testRadius = 100;
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
        const testRadius = 100;

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

      routes.forEach((route) => {
        const routeId = `route-${route.id}`;

        const myRoute = new TrimbleMaps.Route({
          routeId,
          stops: [
            new TrimbleMaps.LngLat(route.pickupLong, route.pickupLat),
            new TrimbleMaps.LngLat(route.dropoffLong, route.dropoffLat),
          ],
          showStops: false,
          frameRoute: false,
          routeColor: "#808080",
        });

        myRoute.addTo(map);
        routesList.push(myRoute);
        routesRef.current.push({ id: route.id, route: myRoute });

        myRoute.on("click", () => {
          console.log("route is clicked")
          setSelectedRouteId(route.id); // Update global context
          routesList.forEach((r) => r.update({ routeColor: "#808080" }));
          myRoute.update({ routeColor: "#00FF00" });
        });

        // Markers
        const pickupEl = document.createElement("div");
        pickupEl.className = "custom-marker pickup-marker";

        const dropoffEl = document.createElement("div");
        dropoffEl.className = "custom-marker dropoff-marker";

        const pickupMarker = new TrimbleMaps.Marker({ element: pickupEl })
          .setLngLat([route.pickupLong, route.pickupLat])
          .addTo(map);

        const dropoffMarker = new TrimbleMaps.Marker({ element: dropoffEl })
          .setLngLat([route.dropoffLong, route.dropoffLat])
          .addTo(map);

        markers.push(pickupMarker, dropoffMarker);
      });
    });

    return () => {
      markers.forEach((marker) => marker.remove());
      if (map) map.remove();
    };
  }, [routes]);


  // 🟣 Highlight selected route
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
