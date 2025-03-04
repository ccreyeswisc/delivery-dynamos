
// import "./App.css";
// import MapComponent from "./MapComponent"; // Import the map component
// import 'bootstrap/dist/css/bootstrap.min.css';

// function App() {
//   return (
//     <div className="container-fluid h-100">
//       <div className="row h-100">
//         {/* Left half - Map */}
//         <div className="col-6 d-flex flex-column p-0">
//           <MapComponent />
//         </div>

//         {/* Right half - Placeholder for content */}
//         <div className="col-6 d-flex align-items-center justify-content-center">
//           <h2>Right Side Content</h2>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;



// import { useEffect } from "react";

// const MapComponent = () => {
//   useEffect(() => {
//     if (window.TrimbleMaps) {
//       window.TrimbleMaps.APIKey = "299354C7A83A67439273691EA750BB7F";

//       const myMap = new window.TrimbleMaps.Map({
//         container: "myMap",
//         center: new window.TrimbleMaps.LngLat(-96, 35),
//         zoom: 3
//       });

//       myMap.on("load", function () {
//         console.log("Map loaded successfully");
//       });
//     }
//   }, []);

//   return <div id="myMap" className="full-screen"></div>;
// };

// export default MapComponent;

// import "./App.css";
// import MapComponent from "./MapComponent"; // Import the map component
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { Container, Row, Col } from 'react-bootstrap'; // Import Bootstrap components

// function App() {
//   return (
//     <Container fluid className="h-100">
//       <Row className="h-100">
//         {/* Left half - Map (Centered) */}
//         <Col md={6} className="d-flex align-items-center justify-content-center p-0">
//           <MapComponent />
//         </Col>

//         {/* Right half - Content (Centered) */}
//         <Col md={6} className="d-flex align-items-center justify-content-center bg-primary text-white">
//           <h2>Right Side Content</h2>
//         </Col>
//       </Row>
//     </Container>
//   );
// }

// export default App;
import "./App.css";
import MapComponent from "./MapComponent"; // Import the map component
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap'; // Import Bootstrap components

function App() {
  return (
    <Container fluid className="h-100">
      <Row className="h-100">
        {/* Left Side - Map (Fixed Size & Centered) */}
        <Col lg={6} className="d-flex align-items-center justify-content-center">
          <MapComponent />
        </Col>

        {/* Right Side - Content (Centered) */}
        <Col lg={6} className="d-flex align-items-center justify-content-center bg-primary text-white">
          <h2>Right Side Content</h2>
        </Col>
      </Row>
    </Container>
  );
}

export default App;

// import "./App.css";
// import MapComponent from "./MapComponent"; // Import the map component
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { Container, Row, Col } from 'react-bootstrap'; // Import Bootstrap components

// function App() {
//   return (
    
//           <MapComponent />
        

//   );
// }

// export default App;


