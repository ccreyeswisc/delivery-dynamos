import React, { useState, useEffect, useCallback } from 'react';
import { Box, Slider, Typography, Switch, FormControlLabel } from '@mui/material';

const DateRangeSlider = ({ onFilterChange, originDateFrom, originDateTo }) => {
  const [value, setValue] = useState(30); // Default: show all routes up to 30 days
  const [showAll, setShowAll] = useState(true); // Toggle for showing all routes
  const [minDate, setMinDate] = useState(new Date());
  const [maxDate, setMaxDate] = useState(new Date());
  const [dateRange, setDateRange] = useState(30); // Default 30 days
  
  // Set up the date range when component mounts or when search dates change
  useEffect(() => {
    // If we have valid search dates from the origin search
    if (originDateFrom && originDateTo) {
      // Convert DayJS objects to JavaScript Dates if needed
      const fromDate = originDateFrom.toDate ? originDateFrom.toDate() : new Date(originDateFrom);
      const toDate = originDateTo.toDate ? originDateTo.toDate() : new Date(originDateTo);
      
      // Calculate the difference in days between the dates
      const diffTime = Math.abs(toDate - fromDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setMinDate(fromDate);
      setMaxDate(toDate);
      setDateRange(diffDays || 1); // Use calculated range (min 1 day)
      setValue(diffDays || 1); // Start with showing the full range
    } else {
      // Default to today + 30 days if no search dates
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);
      
      setMinDate(today);
      setMaxDate(thirtyDaysLater);
      setDateRange(30);
      setValue(30);
    }
  }, [originDateFrom, originDateTo]);
  
  // Use useCallback to memoize the filter function
  const applyFilter = useCallback(() => {
    if (showAll) {
      // Special value to show all routes
      onFilterChange(-1);
    } else {
      // Apply current slider value
      onFilterChange(value);
    }
  }, [showAll, value, onFilterChange]);

  // Handle slider change
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Handle slider change complete (only trigger filter when user stops sliding)
  const handleChangeCommitted = (event, newValue) => {
    if (!showAll) {
      onFilterChange(newValue);
    }
  };

  // Handle toggle switch
  const handleToggleChange = (event) => {
    setShowAll(event.target.checked);
  };

  // Apply the filter when component mounts or when showAll changes
  useEffect(() => {
    applyFilter();
  }, [showAll, applyFilter]);

  // Format the label to show actual date
  const valueText = (value) => {
    // Create a new date object for the label based on minDate + days
    const date = new Date(minDate);
    date.setDate(minDate.getDate() + value);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMarks = () => {
    const marks = [
      { value: 0, label: 'Start' }
    ];
    if (dateRange >= 7) marks.push({ value: Math.min(7, dateRange), label: '1w' });
    if (dateRange >= 14) marks.push({ value: Math.min(14, dateRange), label: '2w' });
    if (dateRange >= 30) marks.push({ value: 30, label: '1m' });
    
    if (dateRange > 1) {
      // Only add End label if it's not too close to 1m
      if (Math.abs(dateRange - 30) > 5) {
        marks.push({ value: dateRange, label: 'End' });
      } else {
        marks.push({ value: dateRange, label: '' });
      }
    }
    
    return marks;
  };

  // Format the start and end dates
  const formatDateLabel = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: '30px',
        left: '30px',
        transform: 'none',
        width: '300px',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography fontWeight="bold">
          Filter Routes by Date
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={showAll}
              onChange={handleToggleChange}
              size="small"
            />
          }
          label="Show All"
          labelPlacement="start"
        />
      </Box>
      
      <Slider
        value={value}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        valueLabelDisplay="auto"
        valueLabelFormat={valueText}
        min={0}
        max={dateRange}
        disabled={showAll}
        sx={{
          ml: 0.5,
          width: 'calc(100% - 8px)',
          '& .MuiSlider-markLabel': {
            transform: 'translateX(0%)',
          },
          '& .MuiSlider-markLabel[data-index="0"]': {
            transform: 'translateX(-50%)',
          },
          '& .MuiSlider-markLabel[data-index="4"]': { // End label
            transform: 'translateX(-50%)',
          }
        }}
        marks={getMarks()}
      />
      
      {!showAll && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 1,
            px: 0.2
          }}
        >
          <Typography variant="body2" sx={{ minWidth: '60px' }}>
            {formatDateLabel(minDate)}
          </Typography>
          <Typography variant="body2" sx={{ minWidth: '60px', textAlign: 'right' }}>
            {formatDateLabel(new Date(minDate.getTime() + (value * 24 * 60 * 60 * 1000)))}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DateRangeSlider;