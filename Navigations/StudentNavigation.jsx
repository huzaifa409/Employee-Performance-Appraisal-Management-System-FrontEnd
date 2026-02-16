import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StudentDashboard from "../Components/Student/StudentDashboard"





const stack = createNativeStackNavigator();



const StudentNavigation = ({ userId, onLogout }) => {
  return (
    <stack.Navigator initialRouteName="StudentDashboard">
      <stack.Screen
        name="StudentDashboard"
        options={{ headerShown: false }}
        children={(props) => (
          <StudentDashboard {...props} userId={userId} onLogout={onLogout} />
        )}
      />
    
    </stack.Navigator>
  );
};

export default StudentNavigation;