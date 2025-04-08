import React, { useState, useEffect } from 'react';
import { Slider, Box, Typography } from '@mui/material';
import dayjs from 'dayjs';

const DateRangeSlider = ({ routes, onFilterChange }) => {
  const [daysRange, setDaysRange] = useState([0, 30]); // Default: today to 30 days out
  const [availableDates, setAvailableDates] = useState([]);
  const [maxDays, setMaxDays] = useState(30);

  // Extract all available dates from routes when component mounts or routes change
  useEffect(() => {
    if (routes && routes.length > 0) {
      // Extract dates from routes and sort them
      const dates = routes.map(route => {
        // Parse the date from route format ("Month DD")
        const dateStr = route.date;
        const day = dateStr.split(' ')[1];
        const month = dateStr.split(' ')[0];
        
        // Create a proper date object (assuming current year)
        const currentYear = new Date().getFullYear();
        const dateObj = new Date(`${month} ${day}, ${currentYear}`);
        
        return dateObj;
      }).filter(date => !isNaN(date)); // Filter out invalid dates
      
      // Sort dates
      dates.sort((a, b) => a - b);
      
      // Calculate days from today for each date
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time portion
      
      const daysFromToday = dates.map(date => {
        const diffTime = date - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      });
      
      // Store unique days
      const uniqueDays = [...new Set(daysFromToday)].filter(day => day >= 0).sort((a, b) => a - b);
      setAvailableDates(uniqueDays);
      
      // Set max days
      if (uniqueDays.length > 0) {
        setMaxDays(Math.max(...uniqueDays, 30)); // At least 30 days or the max available date
      }
    }
  }, [routes]);

  // Handle slider change
  const handleChange = (event, newValue) => {
    setDaysRange(newValue);
    onFilterChange(newValue[0], newValue[1]);
  };

  // Format the label to show actual date
  const valueText = (value) => {
    const date = new Date();
    date.setDate(date.getDate() + value);
    return dayjs(date).format('MMM D');
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '50%',
        maxWidth: '500px',
        padding: '15px 20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
      }}
    >
      <Typography gutterBottom variant="subtitle1" align="center" fontWeight="bold">
        Filter Routes by Date Range
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">
          {valueText(daysRange[0])}
        </Typography>
        <Typography variant="body2">
          {valueText(daysRange[1])}
        </Typography>
      </Box>
      
      <Slider
        value={daysRange}
        onChange={handleChange}
        valueLabelDisplay="auto"
        valueLabelFormat={valueText}
        min={0}
        max={maxDays}
        marks={[
          { value: 0, label: 'Today' },
          { value: 7, label: '1w' },
          { value: 14, label: '2w' },
          { value: 30, label: '1m' },
        ]}
      />
    </Box>
  );
};

export default DateRangeSlider;