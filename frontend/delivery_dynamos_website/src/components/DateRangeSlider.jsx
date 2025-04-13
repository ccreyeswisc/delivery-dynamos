import React, { useState, useEffect, useCallback } from 'react';
import { Box, Slider, Typography, Switch, FormControlLabel } from '@mui/material';

const DateRangeSlider = ({ onFilterChange }) => {
  const [value, setValue] = useState(30); // Default: show all routes up to 30 days
  const [showAll, setShowAll] = useState(true); // New state to toggle all routes
  
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
    // Don't call onFilterChange directly here
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
    // Only re-run when showAll or applyFilter changes
  }, [showAll, applyFilter]);

  // Format the label to show actual date
  const valueText = (value) => {
    const date = new Date();
    date.setDate(date.getDate() + value);
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
        max={30}
        disabled={showAll}
        sx={{
          ml: 0.5,
          width: 'calc(100% - 8px)',
          '& .MuiSlider-markLabel': {
            transform: 'translateX(0%)',
          },
          '& .MuiSlider-markLabel[data-index="0"]': {
            transform: 'translateX(-50%)',
          }
        }}
        marks={[
          { value: 0, label: 'Today' },
          { value: 7, label: '1w' },
          { value: 14, label: '2w' },
          { value: 30, label: '1m' },
        ]}
      />
      
      {!showAll && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2">Today</Typography>
          <Typography variant="body2">{valueText(value)}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default DateRangeSlider;
