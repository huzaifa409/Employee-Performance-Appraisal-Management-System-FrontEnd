import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import BASE_URL from "../../API-URL/API";

// ✅ SQLite function
import { getConfidentialAverageForTeacher } from "../../Database/db";

const ComparisonResult = ({ route }) => {
  const {
    teacherA,
    teacherB,
    courseCode,
    mode,
    session1,
    session2,
  } = route.params;

  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);

  const [confA, setConfA] = useState(null);
  const [confB, setConfB] = useState(null);

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchSessions();
    fetchComparison();
  }, []);

  // =========================
  // FETCH SESSIONS
  // =========================
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/Performance/GetSessions`);
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error("Session Error:", err);
    }
  };

  // =========================
  // MAIN FETCH
  // =========================
  const fetchComparison = async () => {
    try {
      const res = await fetch(`${BASE_URL}/Performance/CompareTeachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          teacherA,
          teacherB,
          courseCode,
          session1,
          session2,
        }),
      });

      const data = await res.json();
      setDataA(data[0]);
      setDataB(data[1]);

      console.log("🔥 API RESULT A:", data[0]);
      console.log("🔥 API RESULT B:", data[1]);

      // =========================
      // CONFIDENTIAL FETCH (FIXED + DEBUG)
      // =========================

      const sessionForCourse = session1 || session2;

      console.log("🔥 DEBUG INPUTS:");
      console.log("Teacher A:", teacherA);
      console.log("Teacher B:", teacherB);
      console.log("Session1:", session1);
      console.log("Session2:", session2);
      console.log("Course:", courseCode);

      const cA = await getConfidentialAverageForTeacher(
        teacherA,
        mode === "course" ? sessionForCourse : session1,
        courseCode
      );

      const cB = await getConfidentialAverageForTeacher(
        teacherB,
        mode === "course" ? sessionForCourse : session2,
        courseCode
      );

      console.log("🔥 CONF A RESULT:", cA);
      console.log("🔥 CONF B RESULT:", cB);

      setConfA(cA);
      setConfB(cB);
    } catch (err) {
      console.error("Comparison Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  // =========================
  // WINNER LOGIC (SAFE FIX)
  // =========================
  const scoreA =
    (dataA?.OverallAverageOutOfHundred || 0) +
    (confA?.avgOutOf10 || 0) * 10;

  const scoreB =
    (dataB?.OverallAverageOutOfHundred || 0) +
    (confB?.avgOutOf10 || 0) * 10;

  const winner =
    scoreA > scoreB
      ? dataA?.Name
      : scoreB > scoreA
      ? dataB?.Name
      : "Tie";

  const getSessionName = (id) => {
    const s = sessions.find((sess) => sess.id === id);
    return s ? s.name : `Session ${id}`;
  };

  const labelA =
    mode === "course" ? dataA?.Name : getSessionName(session1);

  const labelB =
    mode === "course" ? dataB?.Name : getSessionName(session2);

  const codeA = mode === "course" ? "T1" : "S1";
  const codeB = mode === "course" ? "T2" : "S2";

  // =========================
  // CHART DATA
  // =========================
  const chartData = [
    { value: dataA?.PeerAverageOutOfTen || 0, label: "Peer A", frontColor: "#22c55e" },
    { value: dataB?.PeerAverageOutOfTen || 0, label: "Peer B", frontColor: "#f87171" },

    { value: dataA?.StudentAverageOutOfTen || 0, label: "Student A", frontColor: "#16a34a" },
    { value: dataB?.StudentAverageOutOfTen || 0, label: "Student B", frontColor: "#ef4444" },

    { value: confA?.avgOutOf10 || 0, label: "Conf A", frontColor: "#8b5cf6" },
    { value: confB?.avgOutOf10 || 0, label: "Conf B", frontColor: "#a78bfa" },

    { value: dataA?.OverallAverageOutOfHundred || 0, label: "Overall A", frontColor: "#065f46" },
    { value: dataB?.OverallAverageOutOfHundred || 0, label: "Overall B", frontColor: "#7f1d1d" },
  ];

  const finalChartData = [
    {
      value: dataA?.OverallAverageOutOfHundred || 0,
      label: codeA,
      frontColor: "#2563eb",
    },
    {
      value: dataB?.OverallAverageOutOfHundred || 0,
      label: codeB,
      frontColor: "#dc2626",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Comparison Result</Text>

      {/* WINNER
      <View style={styles.winnerCard}>
        <Text style={styles.winnerText}>
           {winner === "Tie" ? "It's a Tie!" : `${winner} Wins`}
        </Text>
      </View> */}

      {/* CARDS */}
      <View style={styles.row}>
        {/* A */}
        <View style={styles.card}>
          <Text style={styles.name}>{labelA}</Text>

          <Text style={styles.label}>Peer</Text>
          <Text style={styles.value}>
            {dataA?.PeerAverageOutOfTen?.toFixed(2) || "0"} / 10
          </Text>

          <Text style={styles.label}>Student</Text>
          <Text style={styles.value}>
            {dataA?.StudentAverageOutOfTen?.toFixed(2) || "0"} / 10
          </Text>

          <Text style={styles.label}>Confidential</Text>
          <Text style={styles.value}>
            {confA?.avgOutOf10?.toFixed(2) || "0"} / 10
          </Text>

          <Text style={styles.label}>Overall</Text>
          <Text style={styles.percent}>
            {dataA?.OverallAverageOutOfHundred?.toFixed(2) || "0"}%
          </Text>
        </View>

        {/* B */}
        <View style={styles.card}>
          <Text style={styles.name}>{labelB}</Text>

          <Text style={styles.label}>Peer</Text>
          <Text style={styles.value}>
            {dataB?.PeerAverageOutOfTen?.toFixed(2) || "0"} / 10
          </Text>

          <Text style={styles.label}>Student</Text>
          <Text style={styles.value}>
            {dataB?.StudentAverageOutOfTen?.toFixed(2) || "0"} / 10
          </Text>

          <Text style={styles.label}>Confidential</Text>
          <Text style={styles.value}>
            {confB?.avgOutOf10?.toFixed(2) || "0"} / 10
          </Text>

          <Text style={styles.label}>Overall</Text>
          <Text style={styles.percent}>
            {dataB?.OverallAverageOutOfHundred?.toFixed(2) || "0"}%
          </Text>
        </View>
      </View>

      {/* CHART 1
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Performance Breakdown</Text>
        <BarChart
          data={chartData}
          barWidth={28}
          spacing={18}
          roundedTop
          hideRules
          yAxisThickness={0}
          xAxisThickness={0}
        />
      </View> */}

      {/* CHART 2 */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Overall Result %</Text>
        <BarChart
          data={finalChartData}
          barWidth={50}
          spacing={50}
          roundedTop
          hideRules
          yAxisThickness={0}
          xAxisThickness={0}
        />
      </View>

      {/* DEBUG PANEL (TEMPORARY - REMOVE LATER)
      <View style={{ padding: 10, backgroundColor: "#000", borderRadius: 10 }}>
        <Text style={{ color: "#0f0" }}>
          CONF A: {JSON.stringify(confA)}
        </Text>
        <Text style={{ color: "#0f0" }}>
          CONF B: {JSON.stringify(confB)}
        </Text>
      </View> */}

      {/* DETAILS */}
      <View style={styles.details}>
        <Text style={styles.detailText}>
          Mode: {mode === "course" ? "Course Comparison" : "Session Comparison"}
        </Text>

        {mode === "course" && (
          <Text style={styles.detailText}>Course: {courseCode}</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default ComparisonResult;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f3f6f4",
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#111827",
  },

  winnerCard: {
    backgroundColor: "#dcfce7",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#86efac",
  },

  winnerText: {
    fontWeight: "bold",
    color: "#166534",
    fontSize: 15,
  },

  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  name: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 10,
    color: "#111827",
  },

  label: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 8,
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  percent: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
    color: "#065f46",
  },

  chartContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    elevation: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  chartTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 14,
    color: "#111827",
  },

  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 5,
  },

  colorBox: {
    width: 12,
    height: 12,
    marginRight: 5,
    borderRadius: 3,
  },

  legendText: {
    fontSize: 11,
    color: "#374151",
  },

  details: {
    marginTop: 10,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  detailText: {
    fontSize: 13,
    marginBottom: 5,
    color: "#374151",
  },
});