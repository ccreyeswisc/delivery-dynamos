import { useState, useEffect, useCallback } from 'react';
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
  const [originCoordinates, setOriginCoordinatesInApp] = useState(null);
  const [originRadius, setOriginRadiusInApp] = useState(50); // default radius
  const [destinationCoordinates, setDestinationCoordinatesInApp] = useState(null);
  const [destinationRadius, setDestinationRadiusInApp] = useState(50); // default radius
  
  // Add new state for date range from search
  const [originDateFrom, setOriginDateFrom] = useState(null);
  const [originDateTo, setOriginDateTo] = useState(null);

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
        setFilteredRoutes(formattedRoutes); // Initialize filtered routes
      } catch (error) {
        console.error('Error fetching routes:', error);
      }
    };

    fetchRoutes();
  }, []);

  // Use memoized version of handleDateFilter to prevent infinite loops
  const handleDateFilter = useCallback((daysFromNow) => {
    if (apiRoutes.length === 0) return;
    
    console.log(`Filtering for routes up to ${daysFromNow} days from now`);
    
    // If daysFromNow is -1, show all routes
    if (daysFromNow === -1) {
      console.log("Showing all routes");
      setFilteredRoutes(apiRoutes);
      return;
    }
    
    // Use originDateFrom as the base date if available, otherwise use today
    const baseDate = originDateFrom ? new Date(originDateFrom) : new Date();
    baseDate.setHours(0, 0, 0, 0); // Reset time portion for fair comparison
    
    // Debug logs
    console.log("Base date for filtering:", baseDate);
    console.log("Total routes before filtering:", apiRoutes.length);
    
    const filtered = apiRoutes.filter(route => {
      // Make sure we have a valid pickup date
      if (!route.pickupDate || isNaN(route.pickupDate)) {
        return false;
      }
      
      // Clone the date to avoid mutation issues
      const pickupDate = new Date(route.pickupDate);
      pickupDate.setHours(0, 0, 0, 0); // Reset time portion for fair comparison
      
      // For routes after or on the base date
      if (pickupDate >= baseDate) {
        // Calculate days difference
        const diffTime = pickupDate - baseDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Show routes that are within the selected number of days
        return diffDays <= daysFromNow;
      }
      
      // Exclude routes before the base date
      return false;
    });
    
    console.log("Routes after filtering:", filtered.length);
    setFilteredRoutes(filtered);
  }, [apiRoutes, originDateFrom]); // Add originDateFrom to dependencies

  const handleRouteSelect = useCallback((routeId) => {
    setSelectedRouteId(routeId);
    console.log(`Route ${routeId} selected`);
  }, []);

  // Custom handler to receive dates from SearchModal
  const handleSearchComplete = useCallback((formattedRoutes, searchDates) => {
    // Store date information if available
    if (searchDates) {
      setOriginDateFrom(searchDates.originDateFrom);
      setOriginDateTo(searchDates.originDateTo);
    }
    
    // Update routes with search results
    setApiRoutes(formattedRoutes);
    setFilteredRoutes(formattedRoutes);
    
    console.log(`Updated Results: ${formattedRoutes.length} routes found`);
  }, []);

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
        setApiRoutes={handleSearchComplete}  
        setOriginCoordinatesInApp={setOriginCoordinatesInApp}
        setOriginRadiusInApp={setOriginRadiusInApp}
        setDestinationCoordinatesInApp={setDestinationCoordinatesInApp}
        setDestinationRadiusInApp={setDestinationRadiusInApp}/>

      {/* Pass the fetched routes to MapComponent */}
      {filteredRoutes.length > 0 && 
      <MapComponent 
        key={JSON.stringify(filteredRoutes)} 
        routes={filteredRoutes}   
        originCoordinates={originCoordinates}
        originRadius={originRadius}
        destinationCoordinates={destinationCoordinates}
        destinationRadius={destinationRadius}/>}

      <RouteSidebar 
        routes={filteredRoutes} 
        onRouteSelect={handleRouteSelect}
        setApiRoutes={setApiRoutes}
      />

      {/* Date Range Slider with date props */}
      {apiRoutes.length > 0 && (
        <DateRangeSlider 
          onFilterChange={handleDateFilter} 
          originDateFrom={originDateFrom}
          originDateTo={originDateTo}
        />
      )}
    </div>
  );
}

export default App;