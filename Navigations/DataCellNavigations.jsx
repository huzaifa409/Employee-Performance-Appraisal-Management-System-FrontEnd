import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DcDashboard from '../Components/DataCell/DataCellDashboard'
import UploadTeachers from'../Components/DataCell/UploadTeachers'
import UploadStudents from '../Components/DataCell/UploadStudents'
import UploadCourses from '../Components/DataCell/UploadCourse'
import UploadEnrollment from '../Components/DataCell/UploadEnrollment'


const stack=createNativeStackNavigator();


const DCNavigation =()=>
{

return(
        <stack.Navigator initialRouteName="DataCellDashboard">

          <stack.Screen name="DataCellDashboard" component={DcDashboard} options={{ headerShown: false }}  />
          <stack.Screen name="UploadTeachers" component={UploadTeachers} options={{ headerShown: false }}  />
          <stack.Screen name="UploadStudents" component={UploadStudents} options={{ headerShown: false }}  />
          <stack.Screen name="UploadCourses" component={UploadCourses} options={{ headerShown: false }}  />
          <stack.Screen name="UploadEnrollment" component={UploadEnrollment} options={{ headerShown: false }}  />

   


        </stack.Navigator>

    )




}


export default DCNavigation;