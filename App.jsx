import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import Login from "./Components/Login/Login";
import DataCellNavigation from "./Navigations/DataCellNavigations";
import HODNavigation from "./Navigations/HODNavigations";
import DirectorNavigation from "./Navigations/DirectorNavigations";

export default function App() {
  const [role, setRole] = useState(null);

  return (
    <NavigationContainer>
      {!role && <Login onLogin={(newRole) => setRole(newRole)} />}

      {role === "DATACELL" && <DataCellNavigation onLogout={() => setRole(null)} />}
      {role === "HOD" && <HODNavigation onLogout={() => setRole(null)} />}
      {role === "DIRECTOR" && <DirectorNavigation onLogout={() => setRole(null)} />}
    </NavigationContainer>
  );
}
