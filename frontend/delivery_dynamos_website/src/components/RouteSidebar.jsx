import React, { useState } from 'react';
import './RouteSidebar.css';

const RouteSidebar = ({ routes, onRouteSelect }) => {
  const [selectedRoute, setSelectedRoute] = useState(null);

  const handleRouteClick = (routeId) => {
    setSelectedRoute(routeId);
    onRouteSelect(routeId);
  };

  return (
    <div className="route-sidebar">
      <h2>Available Routes</h2>
      <div className="routes-list">
        {routes.map((route) => (
          <div 
            key={route.id}
            className={`route-card ${selectedRoute === route.id ? 'selected' : ''}`}
            onClick={() => handleRouteClick(route.id)}
          >
            <div className="route-header">
              <span className="route-number">{route.id}.</span>
              <span className="route-cities">{route.pickup} - {route.dropoff}</span>
            </div>
            <div className="route-details">
              <div className="route-day-date">{route.day} {route.date}</div>
              <div className="route-time">{route.time}</div>
            </div>
            <div className="route-footer">
              <span className="route-duration">{route.duration}</span>
              <span className="route-distance">{route.distance}</span>
              <span className="route-pay">{route.pay}</span>
            </div>
            {route.pickupInstructions && (
              <div className="route-instructions">
                <div className="pickup-instructions">
                  <strong>Pickup Instructions:</strong> {route.pickupInstructions}
                </div>
                {route.dropoffInstructions && (
                  <div className="dropoff-instructions">
                    <strong>Dropoff Instructions:</strong> {route.dropoffInstructions}
                  </div>
                )}
              </div>
            )}
            <div className="confirm-button">
              <button>Confirm Trip</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteSidebar;