
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

//   return <div id="myMap" className="w-100 vh-100"></div>;
// };

// export default MapComponent;

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

import { useEffect } from "react";

const MapComponent = () => {
  useEffect(() => {
    if (window.TrimbleMaps) {
      window.TrimbleMaps.APIKey = "299354C7A83A67439273691EA750BB7F";

      const myMap = new window.TrimbleMaps.Map({
        container: "myMap",
        center: new window.TrimbleMaps.LngLat(-66, 35),
        zoom: 3
      });

      myMap.on("load", function () {
        console.log("Map loaded successfully");
      });
    }
  }, []);

  return <div id="myMap" style={{ height: "800px", width: "1200px" }}></div>;
};

export default MapComponent;
