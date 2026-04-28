import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HODDashboard from '../Components/HOD/HODDashboard'
import AddPeerEvaluator from "../Components/HOD/AddPeerEvaluator";
import AddKPI from "../Components/HOD/AddKPI"
import CourseManagement from "../Components/HOD/CourseManagement";
import CHRPointSetting from "../Components/HOD/CHRPointSetting"
import SeePerformance from "../Components/HOD/SeePerformance";
import ManageSocieties from "../Components/HOD/ManageSocieties";
import SocietyDetails from "../Components/HOD/SocietyDetails";
import AssignChairperson from "../Components/HOD/AssignChairPerson";
import AssignMentors from "../Components/HOD/AssignMentor";




const stack = createNativeStackNavigator();


const HodNavigation = ({ onLogout ,userId  }) => {
    return (
        <stack.Navigator initialRouteName="HodDashboard">

            <stack.Screen name="HodDashboard" component={HODDashboard} options={{ headerShown: false }} initialParams={{ onLogout, userId }} />
            <stack.Screen name="AddPeerEvaluator" component={AddPeerEvaluator} options={{ headerShown: false }} />
            <stack.Screen name="AddKPI" component={AddKPI} options={{ headerShown: false }} />
            <stack.Screen name="CourseManagement" component={CourseManagement} options={{ headerShown: false }} />
            <stack.Screen name="CHRPointSetting" component={CHRPointSetting} options={{ headerShown: false }} />
            <stack.Screen name="SeePerformance" component={SeePerformance} options={{ headerShown: false }} />
            <stack.Screen name="ManageSocieties" component={ManageSocieties} options={{ headerShown: false }} />
            <stack.Screen name="SocietyDetails" component={SocietyDetails}options={{ headerShown: false }}/>
            <stack.Screen name="AssignChairperson" component={AssignChairperson}options={{ headerShown: false }}/>
            <stack.Screen name="AssignMentors" component={AssignMentors}options={{ headerShown: false }}/>



        </stack.Navigator>

    )
}


export default HodNavigation;

