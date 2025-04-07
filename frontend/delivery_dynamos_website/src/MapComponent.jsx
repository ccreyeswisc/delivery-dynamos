import { useContext, useEffect, useRef } from "react";
import { RouteContext } from "./context/RouteContext";
import "./App.css";

const MapComponent = ({ routes }) => {
  const { selectedRouteId, setSelectedRouteId } = useContext(RouteContext);
  const mapRef = useRef(null);
  const routesRef = useRef([]);

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
