// ComparisonResult.js

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import BASE_URL from "../../API-URL/API";

const ComparisonResult = ({ route }) => {
  const { teacherA, teacherB, courseCode } = route.params;

  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);

  useEffect(() => {
    fetchComparison();
  }, []);

  const fetchComparison = async () => {
    const res = await fetch(
      `${BASE_URL}/Performance/CompareTeachers?teacherA=${teacherA}&teacherB=${teacherB}&courseCode=${courseCode}`
    );
    const data = await res.json();

    setDataA(data.teacherA);
    setDataB(data.teacherB);
  };

  const chartData = [
    { value: dataA?.peer || 0, label: "Peer", frontColor: "blue" },
    { value: dataB?.peer || 0, label: "Peer", frontColor: "green" },
  ];

  return (
    <View style={styles.container}>
      <Text>{dataA?.name} - {dataA?.final}%</Text>
      <Text>{dataB?.name} - {dataB?.final}%</Text>

      <BarChart data={chartData} />
    </View>
  );
};

export default ComparisonResult;