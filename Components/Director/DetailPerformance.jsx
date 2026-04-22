import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import BASE_URL from "../../API-URL/API";

const DetailPerformance = ({ route }) => {
  const { teacherId, courseCode } = route.params;

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  const [evaluationType, setEvaluationType] = useState("student");

  const [data, setData] = useState([]);

  const evaluationOptions = [
    { label: "Student", value: "student" },
    { label: "Peer", value: "peer" },
  ];

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchDetails();
    }
  }, [selectedSession, evaluationType]);

  const fetchSessions = async () => {
    const res = await fetch(`${BASE_URL}/Performance/GetSessions`);
    const result = await res.json();

    setSessions(result.map((s) => ({
      label: s.name,
      value: s.id,
    })));
  };

  const fetchDetails = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/Performance/GetTeacherQuestionStatsFull?teacherId=${teacherId}&sessionId=${selectedSession}&evaluationType=${evaluationType}&courseCode=${courseCode}`
      );

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Question Analysis</Text>

      {/* 🔽 SESSION DROPDOWN */}
      <Dropdown
        style={styles.dropdown}
        data={sessions}
        labelField="label"
        valueField="value"
        placeholder="Select Session"
        value={selectedSession}
        onChange={(item) => setSelectedSession(item.value)}
      />

      {/* 🔽 EVALUATION TYPE */}
      <Dropdown
        style={styles.dropdown}
        data={evaluationOptions}
        labelField="label"
        valueField="value"
        value={evaluationType}
        onChange={(item) => setEvaluationType(item.value)}
      />

      {/* 🔥 RESULTS */}
      {data.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.question}>{item.QuestionText}</Text>

          <Text style={styles.avg}>
            Average: {item.AverageScore.toFixed(2)} / 4
          </Text>

          <Text>Poor ⭐: {item.Score1}</Text>
          <Text>Average ⭐⭐: {item.Score2}</Text>
          <Text>Good ⭐⭐⭐: {item.Score3}</Text>
          <Text>Excellent ⭐⭐⭐⭐: {item.Score4}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default DetailPerformance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 15,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },

  dropdown: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginVertical: 8,
    elevation: 3,
  },

  question: {
    fontWeight: "bold",
    marginBottom: 8,
  },

  avg: {
    color: "#16a34a",
    fontWeight: "bold",
    marginBottom: 5,
  },
});