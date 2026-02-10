import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TeacherDashboard from "../Components/Teacher/TeacherDashboard"


const stack = createNativeStackNavigator();


const TeacherNavigation =({onLogout})=>
{

return(
        <stack.Navigator initialRouteName="TeacherDashboard">

          <stack.Screen name="TeacherDashboard" component={TeacherDashboard} options={{ headerShown: false }} initialParams={{ onLogout }}  />
         
   


        </stack.Navigator>

    )




}


export default TeacherNavigation;