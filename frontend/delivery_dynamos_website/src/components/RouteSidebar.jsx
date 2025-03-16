import React, { useState, useEffect } from 'react';
import './RouteSidebar.css';

const RouteSidebar = ({ onRouteSelect }) => {
  const [routes, setRoutes] = useState([]);
  const [expandedRoute, setExpandedRoute] = useState(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch('https://1fa0252a-8d91-4b30-98d1-a126a6323e93.mock.pstmn.io/routes');
        const data = await response.json();

        const formattedRoutes = data.map((route) => {
          const firstStop = route.stops.find(stop => stop.stop_sequence === 1);
          const lastStop = route.stops.reduce((prev, current) =>
            prev.stop_sequence > current.stop_sequence ? prev : current
          );

          return {
            id: route.load_id,
            pickup: firstStop ? `${firstStop.city}, ${firstStop.state}` : 'Unknown',
            dropoff: lastStop ? `${lastStop.city}, ${lastStop.state}` : 'Unknown',
            day: new Date(firstStop.pickup_time).toLocaleDateString('en-US', { weekday: 'long' }),
            date: new Date(firstStop.pickup_time).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
            time: `${new Date(firstStop.pickup_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(lastStop.dropoff_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
            duration: `${Math.ceil(route.total_distance / 60)} hrs`,
            distance: `${route.total_distance} mi`,
            pay: `$${route.cost}`,
            stops: route.stops
          };
        });

        setRoutes(formattedRoutes);
      } catch (error) {
        console.error('Error fetching routes:', error);
      }
    };

    fetchRoutes();
  }, []);

  const toggleExpand = (routeId) => {
    setExpandedRoute(expandedRoute === routeId ? null : routeId);
  };

  return (
    <div className="route-sidebar">
      <h2>Available Routes</h2>
      <div className="routes-list">
        {routes.map((route) => (
          <div 
            key={route.id}
            className={`route-card ${expandedRoute === route.id ? 'expanded' : ''}`}
            onClick={() => toggleExpand(route.id)}
          >
            <div className="route-header">
              <span className="route-number">{route.id}.</span>
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

            {/* Expanded Details */}
            {expandedRoute === route.id && (
              <div className="expanded-details">
                <h3>Stop Details</h3>
                {route.stops.map((stop) => (
                  <div key={stop.stop_id} className="stop-card">
                    <p><strong>Stop {stop.stop_sequence}:</strong> {stop.location_name}</p>
                    <p>{stop.address_line_1}, {stop.city}, {stop.state} {stop.postal_code}</p>
                    <p><strong>Pickup:</strong> {new Date(stop.pickup_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p><strong>Dropoff:</strong> {new Date(stop.dropoff_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                ))}
                <div className="confirm-button">
                  <button>Confirm Trip</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteSidebar;
