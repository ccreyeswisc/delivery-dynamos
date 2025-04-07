import { createContext, useState } from "react";

export const RouteContext = createContext();

export const RouteProvider = ({ children }) => {
  const [selectedRouteId, setSelectedRouteId] = useState(null);

  return (
    <RouteContext.Provider value={{ selectedRouteId, setSelectedRouteId }}>
      {children}
    </RouteContext.Provider>
  );
};
