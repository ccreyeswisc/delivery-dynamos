import { useContext, useRef, useEffect } from 'react';
import { RouteContext } from '../context/RouteContext';
import './RouteSidebar.css';

const RouteSidebar = ({ routes }) => {
  const { selectedRouteId, setSelectedRouteId } = useContext(RouteContext);
  const routeRefs = useRef({});

  const toggleExpand = (routeId) => {
    setSelectedRouteId(routeId === selectedRouteId ? null : routeId);
  };

  // 🔽 Scroll into view when a route is selected
  useEffect(() => {
    if (selectedRouteId && routeRefs.current[selectedRouteId]) {
      routeRefs.current[selectedRouteId].scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [selectedRouteId]);

  return (
    <div className="route-sidebar">
      <h2>Available Routes</h2>
      <div className="routes-list">
        {routes.map((route, index) => (
          <div
            key={route.id || `route-${index}`}
            className={`route-card ${selectedRouteId === route.id ? 'expanded' : ''}`}
            onClick={() => toggleExpand(route.id)}
            ref={(el) => (routeRefs.current[route.id] = el)} // 🔧 Assign ref
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

            {selectedRouteId === route.id && (
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
