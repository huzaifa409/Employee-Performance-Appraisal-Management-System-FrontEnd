import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";

import Login from "./Components/Login/Login";
import DataCellNavigation from "./Navigations/DataCellNavigations";
import HODNavigation from "./Navigations/HODNavigations";
import DirectorNavigation from "./Navigations/DirectorNavigations";
import TeacherNavigation from "./Navigations/TeacherNavigations";
import StudentNavigation from "./Navigations/StudentNavigation";

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <NavigationContainer>
      {!user && (
        <Login
          onLogin={(role, userId) =>
            setUser({ role, userId })
          }
        />
      )}

      {user?.role === "DATACELL" && (
        <DataCellNavigation
          userId={user.userId}
          onLogout={() => setUser(null)}
        />
      )}

      {user?.role === "HOD" && (
        <HODNavigation
          userId={user.userId}
          onLogout={() => setUser(null)}
        />
      )}

      {user?.role === "DIRECTOR" && (
        <DirectorNavigation
          userId={user.userId}
          onLogout={() => setUser(null)}
        />
      )}

      {user?.role === "TEACHER" && (
        <TeacherNavigation
          userId={user.userId}
          onLogout={() => setUser(null)}
        />
      )}

      {user?.role === "STUDENT" && (
        <StudentNavigation
          userId={user.userId}
          onLogout={() => setUser(null)}
        />
      )}
    </NavigationContainer>
  );
}
