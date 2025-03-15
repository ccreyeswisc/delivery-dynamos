import { useState, useEffect } from 'react';
import './App.css';
import './components/RouteSidebar.css';
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap styles
import MapComponent from "./MapComponent"; // Import map component
import RouteSidebar from './components/RouteSidebar';
import { Button } from 'react-bootstrap';
import SearchModal from './components/SearchModal';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [apiRoutes, setApiRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
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

  // Fetch routes from API
  useEffect(() => {
    fetch("https://1fa0252a-8d91-4b30-98d1-a126a6323e93.mock.pstmn.io/all-routes")
      .then(response => response.json())
      .then(data => {
        // Transform data to match the expected structure
        // const transformedRoutes = data.map(route => ({
        //   id: route.load_id,
        //   totalDistance: route.total_distance,
        //   totalWeight: route.total_weight,
        //   cost: route.cost,
        //   numberOfStops: route.number_of_stops,
        //   stops: route.stops.map(stop => ({
        //     id: stop.stop_id,
        //     sequence: stop.stop_sequence,
        //     locationName: stop.location_name,
        //     pickupTime: stop.pickup_time,
        //     dropoffTime: stop.dropoff_time,
        //     address: `${stop.address.address_line_1}, ${stop.address.city}, ${stop.address.state} ${stop.address.postal_code}`,
        //     coordinates: {
        //       lat: stop.address.coordinates.lat,
        //       lng: stop.address.coordinates.long
        //     }
        //   }))
        // }));
        // setApiRoutes(transformedRoutes);
        const transformedRoutes = apiRoutes.map(route => {
          // Ensure there are at least two stops to define a route
          if (route.stops.length < 2) return null;
        
          return {
            id: route.id,
            pickup: route.stops[0].locationName,
            pickupLat: route.stops[0].coordinates.lat,
            pickupLng: route.stops[0].coordinates.lng,
            dropoff: route.stops[route.stops.length - 1].locationName,
            dropoffLat: route.stops[route.stops.length - 1].coordinates.lat,
            dropoffLng: route.stops[route.stops.length - 1].coordinates.lng,
            stops: route.stops.map(stop => ({
              id: stop.id,
              lat: stop.coordinates.lat,
              lng: stop.coordinates.lng,
              name: stop.locationName,
            })),
            totalDistance: route.totalDistance,
            totalWeight: route.totalWeight,
            cost: route.cost
          };
        }).filter(route => route !== null); // Remove null routes
        
        setApiRoutes(transformedRoutes);
        
      })
      .catch(error => console.error("Error fetching routes:", error));
  }, []);

  const handleRouteSelect = (routeId) => {
    setSelectedRouteId(routeId);
    console.log(`Route ${routeId} selected`);
  };

  return (
    <div>
      {/* Search Button */}
      <Button 
        variant="primary" 
        onClick={() => setShowModal(true)} 
        style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000 }}
      >
        Search
      </Button>

      {/* Search Modal */}
      <SearchModal show={showModal} handleClose={() => setShowModal(false)} />

      {/* Map and Sidebar */}
      <MapComponent routes={routes} /> {/* Pass API data */}
      <RouteSidebar onRouteSelect={handleRouteSelect} />
    </div>
  );
}

export default App;
