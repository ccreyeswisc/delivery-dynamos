import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import './components/RouteSidebar.css';
import RouteSidebar from './components/RouteSidebar';

function App() {
  const routes = [
    {
      id: 1,
      pickup: "La Crosse, WI",
      dropoff: "Lafayette, IL",
      day: "Thursday",
      date: "02.13.25",
      time: "16:20-18:14",
      duration: "1H 54M",
      distance: "140 Mi",
      pay: "$347.00",
      pickupInstructions: "Check in at main entrance",
      dropoffInstructions: "Unload at dock 5"
    },
    {
      id: 2,
      pickup: "Rochester, WI",
      dropoff: "Indianapolis, IL",
      day: "Friday",
      date: "02.14.25",
      time: "09:10-11:10",
      duration: "4H",
      distance: "196 Mi",
      pay: "$614.79"
    },
    {
      id: 3,
      pickup: "Madison, WI",
      dropoff: "Muncie, IL",
      day: "Friday",
      date: "02.14.25",
      time: "09:10-11:10",
      duration: "4H",
      distance: "196 Mi",
      pay: "$614.79"
    },
    {
      id: 4,
      pickup: "Dubuque, WI",
      dropoff: "Indianapolis, IL",
      day: "Friday",
      date: "02.14.25",
      time: "09:10-11:10",
      duration: "4H",
      distance: "196 Mi",
      pay: "$614.79"
    },
    {
      id: 5,
      pickup: "Waterloo, WI",
      dropoff: "Bloomington, IL",
      day: "Friday",
      date: "02.14.25",
      time: "09:10-11:10",
      duration: "4H",
      distance: "196 Mi",
      pay: "$614.79"
    }
  ];

  const [selectedRouteId, setSelectedRouteId] = useState(null);
  
  const handleRouteSelect = (routeId) => {
    setSelectedRouteId(routeId);
    console.log(`Route ${routeId} selected`);
    //update map
  };

  return (
      <div className="app">
      <RouteSidebar 
        routes={routes} 
        onRouteSelect={handleRouteSelect} //route is selected and should expand info
      />
      <div className="map-container">
        {/* map component*/}
        <div className="map-placeholder">
          <h2>Map Area</h2>
          {selectedRouteId && <p>Selected Route: {selectedRouteId}</p>}
        </div>
      </div>
    </div>
  )

// import "./App.css";
// import MapComponent from "./MapComponent"; // Import the map component
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { Container, Row, Col } from 'react-bootstrap'; // Import Bootstrap components
// // import TrimbleMaps from "@trimblemaps/trimblemaps-js";


// function App() {

//   return (
//     <Container fluid className="h-100">
//       <Row className="h-100">
//         {/* Left Side - Map (Fixed Size & Centered) */}
//         <Col lg={6} className="d-flex align-items-center justify-content-center">
//           {/* <div id="myMap" style={{ height: "800px", width: "1200px" }}></div>; */}
//           <MapComponent />
//         </Col>

//         {/* Right Side - Content (Centered) */}
//         <Col lg={6} className="d-flex align-items-center justify-content-center bg-primary text-white">
//           <h2>Right Side Content</h2>
//         </Col>
//       </Row>
//     </Container>
//   );
// }

// export default App;

// import "./App.css";
// import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap styles
// import MapComponent from "./MapComponent"; // Import map component

// function App() {
//   return <MapComponent />; // Display full-screen map
// }

// export default App;
