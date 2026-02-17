import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StudentDashboard from "../Components/Student/StudentDashboard"
import StudentEvaluation from "../Components/Student/StudentEvaluationForm"
import Confidential from "../Components/Student/Confidential"
import ConfidentialEvaluation from "../Components/Student/ConfidentialEvaluationForm"





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
      <stack.Screen
        name="StudentEvaluation"
        options={{ headerShown: false }}
        component={StudentEvaluation}
        />  
      <stack.Screen
        name="Confidential"
        options={{ headerShown: false }}
        component={Confidential}
        />  
      <stack.Screen
        name="ConfidentialEvaluation"
        options={{ headerShown: false }}
        component={ConfidentialEvaluation}
        />  
    </stack.Navigator>
  );
};

export default StudentNavigation;