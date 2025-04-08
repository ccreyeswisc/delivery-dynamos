import { useState, useEffect } from 'react';
import './App.css';
import './components/RouteSidebar.css';
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap styles
import MapComponent from "./MapComponent"; // Import map component
import RouteSidebar from './components/RouteSidebar';
import { Button } from 'react-bootstrap';
import SearchModal from './components/SearchModal';
import SearchIcon from '@mui/icons-material/Search';
import DateRangeSlider from './components/DateRangeSlider';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [apiRoutes, setApiRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);

  // Fetch routes from API
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/all_routes', {
          method: 'GET', 
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        const routes = data.routes.filter(route => route.stops.length > 1).slice(0, 100);

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
            stops: route.stops,
            pickupDate: new Date(firstStop.pickup_time)
          };
        });

        setApiRoutes(formattedRoutes);
        console.log(formattedRoutes);
      } catch (error) {
        console.error('Error fetching routes:', error);
      }
    };

    fetchRoutes();
  }, []);

  // Initialize filtered routes when API routes change
  useEffect(() => {
    // Initially, show all routes
    setFilteredRoutes(apiRoutes);
  }, [apiRoutes]);

  const handleDateFilter = (daysFromNow) => {
    if (apiRoutes.length === 0) return;
    
    console.log(`Filtering for routes up to ${daysFromNow} days from now`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time portion
    
    // Debug logs
    console.log("Today's date:", today);
    console.log("Total routes before filtering:", apiRoutes.length);
    
    const filtered = apiRoutes.filter(route => {
      // Make sure we have a valid pickup date
      if (!route.pickupDate || isNaN(route.pickupDate)) {
        console.log(`Route ${route.id} has invalid pickup date:`, route.pickupDate);
        return false;
      }
      
      // Clone the date to avoid mutation issues
      const pickupDate = new Date(route.pickupDate);
      pickupDate.setHours(0, 0, 0, 0); // Reset time portion for fair comparison
      
      // Calculate days difference
      const diffTime = pickupDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // For debugging
      if (diffDays >= 0 && diffDays <= daysFromNow) {
        console.log(`Including route ${route.id} with date ${pickupDate.toLocaleDateString()} (${diffDays} days from now)`);
      }
      
      // Show routes that are within the selected number of days
      return diffDays >= 0 && diffDays <= daysFromNow;
    });
    
    console.log("Routes after filtering:", filtered.length);
    setFilteredRoutes(filtered);
  };

  const handleRouteSelect = (routeId) => {
    setSelectedRouteId(routeId);
    console.log(`Route ${routeId} selected`);
  };

  // Handle search results
  const handleSearchResults = (searchResults) => {
    if (!searchResults || !searchResults.routes) {
      console.error("Invalid search results", searchResults);
      return;
    }

    const formattedRoutes = searchResults.routes.map((route) => {
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
        day: firstStop.pickup_time ? new Date(firstStop.pickup_time).toLocaleDateString('en-US', { weekday: 'long' }) : 'Unknown',
        date: firstStop.pickup_time ? new Date(firstStop.pickup_time).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : 'Unknown',
        time: firstStop.pickup_time && lastStop.dropoff_time
          ? `${new Date(firstStop.pickup_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(lastStop.dropoff_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
          : 'Unknown',
        duration: route.total_distance ? `${Math.ceil(route.total_distance / 60)} hrs` : 'N/A',
        distance: route.total_distance ? `${route.total_distance} mi` : 'N/A',
        pay: route.cost ? `$${route.cost}` : 'N/A',
        stops: route.stops,
        pickupDate: firstStop.pickup_time ? new Date(firstStop.pickup_time) : null
      };
    });

    setApiRoutes(formattedRoutes);
    setFilteredRoutes(formattedRoutes);
  };

  return (
    <div>
      {/* Search Button */}
      <Button
        variant="light"
        onClick={() => setShowModal(true)}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          border: '1px solid #ccc',
          padding: '12px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
        }}
      >
        <SearchIcon style={{ fontSize: '32px' }} />
      </Button>

      <SearchModal 
        show={showModal} 
        handleClose={() => setShowModal(false)} 
        setApiRoutes={handleSearchResults} 
      />

      {/* Pass the filtered routes to MapComponent and RouteSidebar */}
      {filteredRoutes.length > 0 && (
        <MapComponent routes={filteredRoutes} />
      )}

      <RouteSidebar 
        routes={filteredRoutes} 
        onRouteSelect={handleRouteSelect} 
      />

      {/* Date Range Slider */}
      {apiRoutes.length > 0 && (
        <DateRangeSlider onFilterChange={handleDateFilter} />
      )}
    </div>
  );
}

export default App;