import { useEffect } from "react";
import "./App.css";

const MapComponent = () => {
  useEffect(() => {
    // Ensure TrimbleMaps is available
    if (window.TrimbleMaps) {
      window.TrimbleMaps.APIKey = "299354C7A83A67439273691EA750BB7F"; // Replace with actual API key

      new window.TrimbleMaps.Map({
        container: "map",
        style: window.TrimbleMaps.Common.Style.TRANSPORTATION,
        center: [-89.5, 44.5], // Center on Wisconsin
        zoom: 7, // Adjust zoom level
      });
    }
  }, []);

  return <div id="map"></div>; // Map container
};

export default MapComponent;
