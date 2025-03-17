import React, { useState, useEffect } from 'react';
import './RouteSidebar.css';

const RouteSidebar = ({ routes, onRouteSelect }) => {
  const [expandedRoute, setExpandedRoute] = useState(null);

  const toggleExpand = (routeId) => {
    setExpandedRoute(expandedRoute === routeId ? null : routeId);
  };

  return (
    <div className="route-sidebar">
      <h2>Available Routes</h2>
      <div className="routes-list">
        {routes.map((route, index) => (
          <div
            key={route.id || `route-${index}`}
            className={`route-card ${expandedRoute === route.id ? 'expanded' : ''}`}
            onClick={() => toggleExpand(route.id)}
          >
            <div className="route-header">
              <span className="route-cities">{route.pickup} - {route.dropoff}</span>
            </div>
            <div className="route-details">
              <div className="route-day-date">{route.day}, {route.date}</div>
              <div className="route-time">{route.time}</div>
            </div>
            <div className="route-footer">
              <span className="route-duration">{route.duration}</span>
              <span className="route-distance">{route.distance}</span>
              <span className="route-pay">{route.pay}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteSidebar;
