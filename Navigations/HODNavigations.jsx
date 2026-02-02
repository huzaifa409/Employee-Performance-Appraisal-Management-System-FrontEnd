import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HODDashboard from '../Components/HOD/HODDashboard'
import AddPeerEvaluator from "../Components/HOD/AddPeerEvaluator";
import AddKPI from "../Components/HOD/AddKPI"
import CourseManagement from "../Components/HOD/CourseManagement";



const stack = createNativeStackNavigator();


const HodNavigation = () => {
    return (
        <stack.Navigator initialRouteName="HodDashboard">

            <stack.Screen name="HodDashboard" component={HODDashboard} options={{ headerShown: false }}  />
            <stack.Screen name="AddPeerEvaluator" component={AddPeerEvaluator} options={{ headerShown: false }}  />
            <stack.Screen name="AddKPI" component={AddKPI} options={{ headerShown: false }}  />
            <stack.Screen name="CourseManagement" component={CourseManagement} options={{ headerShown: false }}  />



        </stack.Navigator>

    )
}


export default HodNavigation;

