import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HODDashboard from '../Components/HOD/HODDashboard'
import AddPeerEvaluator from "../Components/HOD/AddPeerEvaluator";
import AddKPI from "../Components/HOD/AddKPI"
import CourseManagement from "../Components/HOD/CourseManagement";
import CHRPointSetting from "../Components/HOD/CHRPointSetting"



const stack = createNativeStackNavigator();


const HodNavigation = ({onLogout}) => {
    return (
        <stack.Navigator initialRouteName="HodDashboard">

            <stack.Screen name="HodDashboard" component={HODDashboard} options={{ headerShown: false }}   initialParams={{ onLogout }}  />
            <stack.Screen name="AddPeerEvaluator" component={AddPeerEvaluator} options={{ headerShown: false }}  />
            <stack.Screen name="AddKPI" component={AddKPI} options={{ headerShown: false }}  />
            <stack.Screen name="CourseManagement" component={CourseManagement} options={{ headerShown: false }}  />
            <stack.Screen name="CHRPointSetting" component={CHRPointSetting} options={{ headerShown: false }}  />



        </stack.Navigator>

    )
}


export default HodNavigation;

