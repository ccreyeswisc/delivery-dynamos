import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { City } from 'country-state-city';

const SearchModal = ({ show, handleClose }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originRadius, setOriginRadius] = useState(50);
  const [destinationRadius, setDestinationRadius] = useState(50);
  const [originDateFrom, setOriginDateFrom] = useState(null);
  const [originDateTo, setOriginDateTo] = useState(null);
  const [destinationDateFrom, setDestinationDateFrom] = useState(null);
  const [destinationDateTo, setDestinationDateTo] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  const [filteredOriginCities, setFilteredOriginCities] = useState([]);  // Separate filtered cities for origin
  const [filteredDestinationCities, setFilteredDestinationCities] = useState([]);  // Separate filtered cities for destination

  useEffect(() => {
    // Load all cities in the US when the component mounts
    const allCities = City.getAllCities().filter(city => city.countryCode === 'US');
    setCityOptions(allCities);
  }, []);

  const handleCitySearch = (input, setFunction, setFilteredCities) => {
    setFunction(input);
    if (input.length > 1) {
      const matches = cityOptions.filter(city =>
        city.name.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredCities(matches);
    } else {
      setFilteredCities([]);
    }
  };

  const selectCity = (city, setFunction, setFilteredCities) => {
    setFunction(`${city.name}, ${city.stateCode}`);  // Display city with state
    setFilteredCities([]);
  };

  const handleConfirm = async () => {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Search successful:', responseData);
      alert('Route Selected Successfully!');
    } catch (error) {
      console.error('Error searching routes:', error);
      alert('Failed to search routes. Please try again.');
    }
  };


  return (
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
                    key={`${city.name}-${city.stateCode}`}  // Create a unique key by combining name and stateCode
                    className="list-group-item list-group-item-action"
                    onClick={() => selectCity(city, setOrigin, setFilteredOriginCities)}
                  >
                    {city.name}, {city.stateCode}  {/* Display both city and state */}
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
                    {city.name}, {city.stateCode}  {/* Display both city and state */}
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
        <Button variant="secondary" onClick={handleClose} className="flex-grow-1">
          Close
        </Button>
        <Button variant="primary" onClick={handleConfirm} className="flex-grow-1">
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SearchModal;
