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
 

  // Fetch routes from API
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch('https://1fa0252a-8d91-4b30-98d1-a126a6323e93.mock.pstmn.io/routes');
        const data = await response.json();

        const formattedRoutes = data.map((route) => {
          const firstStop = route.stops.find(stop => stop.stop_sequence === 1);
          const lastStop = route.stops.reduce((prev, current) =>
            prev.stop_sequence > current.stop_sequence ? prev : current
          );

          return {
            id: route.load_id,
            pickupLong: firstStop ? Number(firstStop.longitude) : null,
            pickupLat: firstStop ? Number(firstStop.latitude) : null,
            dropoffLong: lastStop ? Number(lastStop.longitude) : null,
            dropoffLat: lastStop ? Number(lastStop.latitude) : null,
            day: new Date(firstStop.pickup_time).toLocaleDateString('en-US', { weekday: 'long' }),
            date: new Date(firstStop.pickup_time).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
            time: `${new Date(firstStop.pickup_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(lastStop.dropoff_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
            duration: `${Math.ceil(route.total_distance / 60)} hrs`,
            distance: `${route.total_distance} mi`,
            pay: `$${route.cost}`,
            stops: route.stops
          };
        });

        setApiRoutes(formattedRoutes);
      } catch (error) {
        console.error('Error fetching routes:', error);
      }
    };

    fetchRoutes();
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
      {apiRoutes.length > 0 && <MapComponent routes={apiRoutes} />}
      <RouteSidebar onRouteSelect={handleRouteSelect} />
    </div>
  );
}

export default App;
