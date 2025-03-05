import { useState } from 'react'
import './App.css'
import './components/RouteSidebar.css';
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap styles
import MapComponent from "./MapComponent"; // Import map component
import RouteSidebar from './components/RouteSidebar';

function App() {
  const routes = [
    {
      id: 1,
      pickup: "La Crosse, WI",
      pickupLat: 43.8138,
      pickupLng: -91.2519,
      dropoff: "Lafayette, IL",
      dropoffLat: 40.4173,
      dropoffLng: -88.6111,
      day: "Thursday",
      date: "02.13.25",
      time: "16:20-18:14",
      duration: "1H 54M",
      distance: "140 Mi",
      pay: "$347.00",
      pickupInstructions: "Check in at main entrance",
      dropoffInstructions: "Unload at dock 5"
    },
    {
      id: 2,
      pickup: "Rochester, WI",
      pickupLat: 42.7545,
      pickupLng: -88.2216,
      dropoff: "Indianapolis, IL",
      dropoffLat: 39.7684,
      dropoffLng: -86.1581,
      day: "Friday",
      date: "02.14.25",
      time: "09:10-11:10",
      duration: "4H",
      distance: "196 Mi",
      pay: "$614.79"
    },
    {
      id: 3,
      pickup: "Madison, WI",
      pickupLat: 43.0731,
      pickupLng: -89.4012,
      dropoff: "Muncie, IL",
      dropoffLat: 40.1934,
      dropoffLng: -88.3947,
      day: "Friday",
      date: "02.14.25",
      time: "09:10-11:10",
      duration: "4H",
      distance: "196 Mi",
      pay: "$614.79"
    },
    {
      id: 4,
      pickup: "Dubuque, WI",
      pickupLat: 42.5006,
      pickupLng: -90.6646,
      dropoff: "Indianapolis, IL",
      dropoffLat: 39.7684,
      dropoffLng: -86,
      day: "Friday",
      date: "02.14.25",
      time: "09:10-11:10",
      duration: "4H",
      distance: "196 Mi",
      pay: "$614.79"
    },
    {
      id: 5,
      pickup: "Waterloo, WI",
      pickupLat: 43.1833,
      pickupLng: -88.9893,
      dropoff: "Bloomington, IL",
      dropoffLat: 40.4842,
      dropoffLng: -88.9937,
      day: "Friday",
      date: "02.14.25",
      time: "09:10-11:10",
      duration: "4H",
      distance: "196 Mi",
      pay: "$614.79"
    }
  ];

  const [selectedRouteId, setSelectedRouteId] = useState(null);

  const handleRouteSelect = (routeId) => {
    setSelectedRouteId(routeId);
    console.log(`Route ${routeId} selected`);
  };

  return (
    <div>
      <MapComponent routes={routes}/> {/* Full-screen map */}
      <RouteSidebar routes={routes} onRouteSelect={handleRouteSelect} />
    </div>
  );
}

export default App;
