/*
====================================================================
📊 EMPLOYEE PERFORMANCE GRAPH COMPONENT
====================================================================

🎯 PURPOSE:
This component receives API data from parent screen
and converts it into a format required by:

👉 react-native-gifted-charts (BarChart)

====================================================================

📥 INPUT DATA FORMAT (FROM API):

[
  {
    employeeId: 1,
    employeeName: "Huzaifa",
    score: 85
  }
]

====================================================================

📤 REQUIRED CHART FORMAT:

[
  {
    value: 85,
    label: "Huzaifa"
  }
]

====================================================================
*/

import React from "react";
import { View, Text } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const PerformanceGraph = ({ data }) => {

    /*
    ------------------------------------------------------------
    STEP 1: CONVERT API DATA TO CHART FORMAT
    ------------------------------------------------------------
    */

    const chartData = data.map((item) => ({
        value: item.score,          // Y-axis value (bar height)
        label: item.employeeName    // X-axis label
    }));

    /*
    ------------------------------------------------------------
    STEP 2: RENDER GRAPH
    ------------------------------------------------------------
    */

    return (
        <View style={{ marginTop: 20 }}>

            <Text style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 10
            }}>
                📊 Performance Graph
            </Text>

            <BarChart
                data={chartData}
                barWidth={25}
                spacing={30}
                height={220}
                noOfSections={5}
                maxValue={100}
                isAnimated
            />

        </View>
    );
};

export default PerformanceGraph;