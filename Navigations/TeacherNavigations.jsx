import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TeacherDashboard from "../Components/Teacher/TeacherDashboard"
import ClassHeldReportScreen from "../Components/Teacher/ClassHeldReport"
import CourseManagementEvaluationScreen from "../Components/Teacher/CourseManagementEvaluationScreen"
import ViewCHRDetails from "../Components/Teacher/ViewCHRDetails"


const stack = createNativeStackNavigator();


const TeacherNavigation =({onLogout})=>
{

return(
        <stack.Navigator initialRouteName="TeacherDashboard">

          <stack.Screen name="TeacherDashboard" component={TeacherDashboard} options={{ headerShown: false }} initialParams={{ onLogout }}  />
          <stack.Screen name="ClassHeldReportScreen" component={ClassHeldReportScreen} options={{ headerShown: false }} />
          <stack.Screen name="CourseManagementEvaluationScreen" component={CourseManagementEvaluationScreen} options={{ headerShown: false }} />
          <stack.Screen name="ViewCHRDetails" component={ViewCHRDetails} options={{ headerShown: false }} />
         
   


        </stack.Navigator>

    )




}


export default TeacherNavigation;