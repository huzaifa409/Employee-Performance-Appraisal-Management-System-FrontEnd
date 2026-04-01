import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DirectorDashboard from "../Components/Director/DirectorDashboard";
import MakeQuestionaire from "../Components/Director/MakeQuestionaire";
import Addkpi from "../Components/Director/AppKpi";
import ConfidentialEvaluation from "../Components/Director/ConfidentialEvaluation";
import PeerEvaluator from "../Components/Director/PeerEvaluators";
import SeePerformance from "../Components/Director/SeePerformance";
import CreateEvaluationQuestionaire from "../Components/Director/CreateEvaluationQuestionaire"
import EditEvaluationQuestionnaire from "../Components/Director/EditEvaluationQuestionnaire"
import EmailSettings from "../Components/Director/EmailSettings"
import ComparisonScreen from "../Components/Director/ComparisonScreen"

const Stack = createNativeStackNavigator();

const DirectorNavigation = ({ onLogout }) => {
  return (
    <Stack.Navigator initialRouteName="DirectorDashboard">
      <Stack.Screen
        name="DirectorDashboard"
        component={DirectorDashboard}
        options={{ headerShown: false }}
        initialParams={{ onLogout }} // pass logout function safely
      />
      <Stack.Screen
        name="MakeQuestionaire"
        component={MakeQuestionaire}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Addkpi"
        component={Addkpi}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ConfidentialEvaluation"
        component={ConfidentialEvaluation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PeerEvaluator"
        component={PeerEvaluator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SeePerformance"
        component={SeePerformance}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateEvaluationQuestionaire"
        component={CreateEvaluationQuestionaire}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditEvaluationQuestionnaire"
        component={EditEvaluationQuestionnaire}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EmailSettings"
        component={EmailSettings}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ComparisonScreen"
        component={ComparisonScreen}
        options={{ headerShown: false }}
      />

    </Stack.Navigator>
  );
};

export default DirectorNavigation;
