import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { City } from 'country-state-city';

const SearchModal = ({ show, handleClose, setApiRoutes }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originRadius, setOriginRadius] = useState(50);
  const [destinationRadius, setDestinationRadius] = useState(50);
  const [originDateFrom, setOriginDateFrom] = useState(null);
  const [originDateTo, setOriginDateTo] = useState(null);
  const [destinationDateFrom, setDestinationDateFrom] = useState(null);
  const [destinationDateTo, setDestinationDateTo] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  const [filteredOriginCities, setFilteredOriginCities] = useState([]); // Separate filtered cities for origin
  const [filteredDestinationCities, setFilteredDestinationCities] = useState([]); // Separate filtered cities for destination
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    // Load all cities in the US when the component mounts
    const allCities = City.getAllCities().filter(city => city.countryCode === 'US');
    setCityOptions(allCities);
  }, []);

  const handleCitySearch = (input, setFunction, setFilteredCities) => {
    setFunction(input);

    // Split input into city and state parts
    const [cityPart, statePart] = input.split(",").map(part => part.trim().toLowerCase());

    const matches = cityOptions.filter(city => {
      const cityName = city.name.toLowerCase();
      const stateCode = city.stateCode.toLowerCase();

      // If only city is typed, filter by city name
      if (statePart === undefined) {
        return cityName.includes(cityPart);
      }

      // If state is also typed, filter by both city name and state code
      return cityName.includes(cityPart) && stateCode.startsWith(statePart);
    });

    setFilteredCities(matches);
  };


  const selectCity = (city, setFunction, setFilteredCities) => {
    setFunction(`${city.name}, ${city.stateCode}`); // Display city with state
    setFilteredCities([]);
  };

  const getCoordinates = async (cityName) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/address-to-coords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: cityName }),
      });

      if (!response.ok) throw new Error(`Failed to fetch coordinates for ${cityName}`);

      const data = await response.json();
      console.log(`Coordinates for ${cityName}:`, data);
      return data;
    } catch (err) {
      console.error(err.message);
      return null;
    }
  };


  const handleConfirm = async () => {
    setLoading(true);

    const originCoords = await getCoordinates(origin);
    const destinationCoords = await getCoordinates(destination);

    console.log("Origin Coords:", originCoords);
    console.log("Destination Coords:", destinationCoords);

    const requestBody = {
      start_location: origin,
      start_radius: originRadius,
      start_pickup_time: originDateFrom ? originDateFrom.toISOString() : null,
      start_dropoff_time: originDateTo ? originDateTo.toISOString() : null,
      end_location: destination,
      end_radius: destinationRadius,
      end_pickup_time: destinationDateFrom ? destinationDateFrom.toISOString() : null,
      end_dropoff_time: destinationDateTo ? destinationDateTo.toISOString() : null,
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/api/search_routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const responseData = await response.json();
      console.log('Search successful:', responseData);

      const formattedRoutes = responseData.routes.map((route) => {
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
          stops: route.stops
        };
      });

      setApiRoutes(formattedRoutes); // Update routes in App
      handleClose(); // Close modal
    } catch (error) {
      console.error('Error searching routes:', error);
      alert('Failed to search routes. Please try again.');
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };


  return (
    <>
      {!loading && (
        <Modal show={show} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Select Route Preferences</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div className="mb-4">
                <h5>Origin</h5>
                <Form.Control
                  type="text"
                  placeholder="Enter city"
                  value={origin}
                  onChange={(e) => handleCitySearch(e.target.value, setOrigin, setFilteredOriginCities)}
                  className="mb-2"
                />
                {filteredOriginCities.length > 0 && (
                  <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
                    {filteredOriginCities.map((city) => (
                      <li
                        key={`${city.name}-${city.stateCode}`} // Create a unique key by combining name and stateCode
                        className="list-group-item list-group-item-action"
                        onClick={() => selectCity(city, setOrigin, setFilteredOriginCities)}
                      >
                        {city.name}, {city.stateCode} {/* Display both city and state */}
                      </li>
                    ))}
                  </ul>
                )}
                <label>Radius: {originRadius} miles</label>
                <Slider
                  value={originRadius}
                  onChange={(e, newValue) => setOriginRadius(newValue)}
                  min={10}
                  max={500}
                  step={10}
                  className="mb-3"
                />
                <div className="d-flex gap-2">
                  <DatePicker label="From" value={originDateFrom} onChange={setOriginDateFrom} renderInput={(params) => <TextField {...params} fullWidth />} />
                  <DatePicker label="To" value={originDateTo} onChange={setOriginDateTo} renderInput={(params) => <TextField {...params} fullWidth />} />
                </div>
              </div>

              <div>
                <h5>Destination</h5>
                <Form.Control
                  type="text"
                  placeholder="Enter city"
                  value={destination}
                  onChange={(e) => handleCitySearch(e.target.value, setDestination, setFilteredDestinationCities)}
                  className="mb-2"
                />
                {filteredDestinationCities.length > 0 && (
                  <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
                    {filteredDestinationCities.map((city) => (
                      <li
                        key={`${city.name}-${city.stateCode}`}
                        className="list-group-item list-group-item-action"
                        onClick={() => selectCity(city, setDestination, setFilteredDestinationCities)}
                      >
                        {city.name}, {city.stateCode}
                      </li>
                    ))}
                  </ul>
                )}
                <label>Radius: {destinationRadius} miles</label>
                <Slider
                  value={destinationRadius}
                  onChange={(e, newValue) => setDestinationRadius(newValue)}
                  min={10}
                  max={500}
                  step={10}
                  className="mb-3"
                />
                <div className="d-flex gap-2">
                  <DatePicker label="From" value={destinationDateFrom} onChange={setDestinationDateFrom} renderInput={(params) => <TextField {...params} fullWidth />} />
                  <DatePicker label="To" value={destinationDateTo} onChange={setDestinationDateTo} renderInput={(params) => <TextField {...params} fullWidth />} />
                </div>
              </div>
            </LocalizationProvider>
          </Modal.Body>
          <Modal.Footer className="d-flex w-100 gap-2">
            <Button variant="secondary" onClick={handleClose} className="flex-grow-1" disabled={loading}>
              Close
            </Button>
            <Button variant="primary" onClick={handleConfirm} className="flex-grow-1" disabled={loading}>
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      {/* Show loading spinner with modal backdrop effect */}
      {loading && (
        <div className="loading-overlay">
          <Spinner animation="border" variant="light" className="loading-spinner" />
        </div>
      )}

      {/* Custom CSS for loading screen */}
      <style>
        {`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5); /* Keep the modal's backdrop effect */
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
        }
        .loading-spinner {
          width: 4rem;
          height: 4rem;
        }
      `}
      </style>
    </>
  );
};

export default SearchModal;