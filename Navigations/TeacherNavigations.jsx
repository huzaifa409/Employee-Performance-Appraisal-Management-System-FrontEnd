import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TeacherDashboard from "../Components/Teacher/TeacherDashboard"
import ClassHeldReportScreen from "../Components/Teacher/ClassHeldReport"
import CourseManagementEvaluationScreen from "../Components/Teacher/CourseManagementEvaluationScreen"
import ViewCHRDetails from "../Components/Teacher/ViewCHRDetails"
import TeachersCoursesScreen from "../Components/Teacher/TeacherCourseScreen"
import PeerEvaluationScreen from "../Components/Teacher/PeerEvaluationScreen"


const stack = createNativeStackNavigator();


const TeacherNavigation = ({ userId, onLogout }) => {
  return (
    <stack.Navigator initialRouteName="TeacherDashboard">
      <stack.Screen
        name="TeacherDashboard"
        options={{ headerShown: false }}
        children={(props) => (
          <TeacherDashboard {...props} userId={userId} onLogout={onLogout} />
        )}
      />
      <stack.Screen
        name="ClassHeldReportScreen"
        component={ClassHeldReportScreen}
        options={{ headerShown: false }}
      />
      <stack.Screen
        name="CourseManagementEvaluationScreen"
        component={CourseManagementEvaluationScreen}
        options={{ headerShown: false }}
      />
      <stack.Screen
        name="ViewCHRDetails"
        component={ViewCHRDetails}
        options={{ headerShown: false }}
      />
      <stack.Screen
        name="TeachersCoursesScreen"
        children={(props) => (
          <TeachersCoursesScreen {...props} evaluatorID={userId} />
        )}
        options={{ headerShown: false }}
      />
      <stack.Screen
        name="PeerEvaluationScreen"
        component={PeerEvaluationScreen}
        options={{ headerShown: false }}
      />
    </stack.Navigator>
  );
};

export default TeacherNavigation;