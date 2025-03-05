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

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap styles
import MapComponent from "./MapComponent"; // Import map component

function App() {
  return <MapComponent />; // Display full-screen map
}

export default App;
