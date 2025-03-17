import { useState, useEffect } from 'react';
import './App.css';
import './components/RouteSidebar.css';
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap styles
import MapComponent from "./MapComponent"; // Import map component
import RouteSidebar from './components/RouteSidebar';
import { Button } from 'react-bootstrap';
import SearchModal from './components/SearchModal';
import SearchIcon from '@mui/icons-material/Search';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [apiRoutes, setApiRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);


  // Fetch routes from API
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/all_routes', {
          method : 'GET', 
          headers: {
            'Content-Type': 'application/json'
        }
        });
        const data = await response.json();
        // const routes = data.routes.filter(route => {return route.stops.length > 1})
        const routes = data.routes.filter(route => route.stops.length > 1).slice(0, 10); // Get only the first 10 routes


        console.log(routes[0])

        const formattedRoutes = routes.map((route) => {
          const firstStop = route.stops.find(stop => stop.stop_sequence === 1 || stop.stop_sequence === "1");
          const lastStop = route.stops.reduce((prev, current) =>
            prev.stop_sequence > current.stop_sequence ? prev : current
          );

          return {
            id: route.load_id,
            pickup: firstStop ? `${firstStop.city}, ${firstStop.state}` : 'Unknown',
            dropoff: lastStop ? `${lastStop.city}, ${lastStop.state}` : 'Unknown',
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
      {/* <Button 
        variant="primary" 
        onClick={() => setShowModal(true)} 
        style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000 }}
      >
        Search
      </Button> */}
      <Button
        variant="light"
        onClick={() => setShowModal(true)}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          border: '1px solid #ccc',
          padding: '12px 12px', // Increased padding for a bigger button
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
        }}
       
      >
        <SearchIcon style={{ fontSize: '32px' }} /> {/* Increased icon size */}
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
