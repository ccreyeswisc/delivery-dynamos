import { useContext, useEffect, useRef, useState } from "react";
import { RouteContext } from "./context/RouteContext";
import "./App.css";

const MapComponent = ({ routes }) => {
  const { selectedRouteId, setSelectedRouteId } = useContext(RouteContext);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const mapRef = useRef(null);
  const routesRef = useRef([]);

  const sendLocationToBackend = async (lat, lng) => {
    const data = {
      latitude: lat,
      longitude: lng
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/receive-user-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const responseData = await response.json();
      console.log('Response from Python backend:', responseData);
    } catch (error) {
      console.error('Error sending location to backend:', error);
    }
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

      if (location.lat && location.lng) {
        const userLocationEl = document.createElement("div");
        userLocationEl.className = "custom-marker user-location-marker"; // Custom class for user location
  
        const locationMarker = new TrimbleMaps.Marker({ element: userLocationEl })
          .setLngLat([location.lng, location.lat])
          .addTo(map);
  
        markers.push(locationMarker);
        map.setCenter([location.lng, location.lat]);
        map.setZoom(14); // Optionally zoom in for better visibility
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
  }, [location, routes]);


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
          timeout: 15000   // Wait max 15 sec
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

  return <div id="map" style={{ height: "100vh" }} />;
};

export default MapComponent;
