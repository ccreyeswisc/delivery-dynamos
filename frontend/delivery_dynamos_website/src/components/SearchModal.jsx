import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const SearchModal = ({ show, handleClose }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originRadius, setOriginRadius] = useState(50);
  const [destinationRadius, setDestinationRadius] = useState(50);
  const [originDateFrom, setOriginDateFrom] = useState(null);
  const [originDateTo, setOriginDateTo] = useState(null);
  const [destinationDateFrom, setDestinationDateFrom] = useState(null);
  const [destinationDateTo, setDestinationDateTo] = useState(null);

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
              placeholder="Enter state"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="mb-2"
            />
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
              <DatePicker
                label="From"
                value={originDateFrom}
                onChange={setOriginDateFrom}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <DatePicker
                label="To"
                value={originDateTo}
                onChange={setOriginDateTo}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </div>
          </div>
          
          <div>
            <h5>Destination</h5>
            <Form.Control
              type="text"
              placeholder="Enter state"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mb-2"
            />
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
              <DatePicker
                label="From"
                value={destinationDateFrom}
                onChange={setDestinationDateFrom}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <DatePicker
                label="To"
                value={destinationDateTo}
                onChange={setDestinationDateTo}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </div>
          </div>
        </LocalizationProvider>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
        <Button variant="primary" onClick={() => alert('Route Selected')}>Confirm</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SearchModal;
