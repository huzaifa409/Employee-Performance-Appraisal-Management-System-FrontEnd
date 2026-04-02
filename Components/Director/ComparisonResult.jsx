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

const MAX_POINTS = 4;

const ComparisonResult = ({ route }) => {
  const { teacherA, teacherB, courseCode, mode, session1, session2 } =
    route.params;

  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchSessions();
    fetchComparison();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/Performance/GetSessions`);
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

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
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  const winner =
    dataA?.Percentage > dataB?.Percentage
      ? dataA.Name
      : dataB?.Percentage > dataA?.Percentage
      ? dataB.Name
      : "Tie";

  const getSessionName = (id) => {
    const s = sessions.find((sess) => sess.id === id);
    return s ? s.name : `Session ${id}`;
  };

  const labelA = mode === "course" ? dataA?.Name : getSessionName(session1);
  const labelB = mode === "course" ? dataB?.Name : getSessionName(session2);

  const codeA = mode === "course" ? "T1" : "S1";
  const codeB = mode === "course" ? "T2" : "S2";

  // Chart 1: Evaluation breakdown
  const chartData = [
    { value: dataA?.Peer || 0, label: "Peer", frontColor: "#22c55e" },
    { value: dataB?.Peer || 0, label: "Peer", frontColor: "#f87171" },
    { value: dataA?.Student || 0, label: "Student", frontColor: "#16a34a" },
    { value: dataB?.Student || 0, label: "Student", frontColor: "#ef4444" },
    { value: dataA?.Percentage || 0, label: "Final %", frontColor: "#065f46" },
    { value: dataB?.Percentage || 0, label: "Final %", frontColor: "#7f1d1d" },
  ];

  // Chart 2: Final % only
  const finalChartData = [
    { value: dataA?.Percentage || 0, label: codeA, frontColor: "#2563eb" },
    { value: dataB?.Percentage || 0, label: codeB, frontColor: "#dc2626" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <Text style={styles.header}>Comparison Result</Text>

      {/* WINNER */}
      <View style={styles.winnerCard}>
        <Text style={styles.winnerText}>
          🏆 {winner === "Tie" ? "It's a Tie!" : `${winner} Wins`}
        </Text>
      </View>

      {/* CARDS */}
      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.name}>{labelA}</Text>
          <Text style={styles.label}>Peer Score</Text>
          <Text style={styles.value}>
            {dataA?.Peer?.toFixed(2) || "0"} / {MAX_POINTS}
          </Text>
          <Text style={styles.label}>Student Score</Text>
          <Text style={styles.value}>
            {dataA?.Student?.toFixed(2) || "0"} / {MAX_POINTS}
          </Text>
          <Text style={styles.label}>Final %</Text>
          <Text style={styles.percent}>{dataA?.Percentage?.toFixed(2)}%</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.name}>{labelB}</Text>
          <Text style={styles.label}>Peer Score</Text>
          <Text style={styles.value}>
            {dataB?.Peer?.toFixed(2) || "0"} / {MAX_POINTS}
          </Text>
          <Text style={styles.label}>Student Score</Text>
          <Text style={styles.value}>
            {dataB?.Student?.toFixed(2) || "0"} / {MAX_POINTS}
          </Text>
          <Text style={styles.label}>Final %</Text>
          <Text style={styles.percent}>{dataB?.Percentage?.toFixed(2)}%</Text>
        </View>
      </View>

      {/* CHART 1: Evaluation Breakdown */}
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
          // showLine
          initialSpacing={10}
          stackBars={false}
          xAxisLabelTextStyle={{ fontSize: 10 }}
          renderTopLabel={(item) => null}
          xAxisLabelRotation={-45}
        />

        {/* LEGEND */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: "#22c55e" }]} />
            <Text style={styles.legendText}>Peer {codeA}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: "#f87171" }]} />
            <Text style={styles.legendText}>Peer {codeB}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: "#16a34a" }]} />
            <Text style={styles.legendText}>Student {codeA}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: "#ef4444" }]} />
            <Text style={styles.legendText}>Student {codeB}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: "#065f46" }]} />
            <Text style={styles.legendText}>Final % {codeA}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: "#7f1d1d" }]} />
            <Text style={styles.legendText}>Final % {codeB}</Text>
          </View>
        </View>
      </View>

      {/* CHART 2: Final Result % */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Final Result %</Text>
        <BarChart
          data={finalChartData}
          barWidth={50}
          spacing={50}
          roundedTop
          hideRules
          yAxisThickness={0}
          xAxisThickness={0}
          xAxisLabelTextStyle={{ fontSize: 12 }}
          xAxisLabelRotation={0}
          renderTopLabel={(item) => (
            <Text style={{ fontSize: 12, fontWeight: "bold", textAlign: "center" }}>
              {item.value?.toFixed(2)}%
            </Text>
          )}
          xAxisLabelTextFormatter={(item, index) =>
            index === 0 ? `${codeA}\n${labelA}` : `${codeB}\n${labelB}`
          }
        />
      </View>

      {/* DETAILS */}
      <View style={styles.details}>
        <Text style={styles.detailText}>
          Mode: {mode === "course" ? "Course Comparison" : "Session Comparison"}
        </Text>
        {mode === "course" && <Text style={styles.detailText}>Course: {courseCode}</Text>}
        {mode === "session" && (
          <>
            <Text style={styles.detailText}>Session 1: {getSessionName(session1)}</Text>
            <Text style={styles.detailText}>Session 2: {getSessionName(session2)}</Text>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default ComparisonResult;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f3f6f4" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  winnerCard: {
    backgroundColor: "#dcfce7",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  winnerText: { fontWeight: "bold", color: "#166534", fontSize: 15 },
  row: { flexDirection: "row", gap: 10, marginBottom: 20 },
  card: { flex: 1, backgroundColor: "#fff", padding: 15, borderRadius: 12, elevation: 4 },
  name: { fontWeight: "bold", fontSize: 15, marginBottom: 5 },
  label: { fontSize: 11, color: "#6b7280", marginTop: 8 },
  value: { fontSize: 14, fontWeight: "600" },
  percent: { fontSize: 18, fontWeight: "bold", marginTop: 5 },
  chartContainer: { backgroundColor: "#fff", padding: 15, borderRadius: 12, elevation: 4, marginBottom: 20 },
  chartTitle: { fontWeight: "bold", marginBottom: 10 },
  legend: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", marginTop: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", marginRight: 10, marginBottom: 5 },
  colorBox: { width: 15, height: 15, marginRight: 5 },
  legendText: { fontSize: 12 },
  details: { marginTop: 20, backgroundColor: "#fff", padding: 15, borderRadius: 12 },
  detailText: { fontSize: 13, marginBottom: 5 },
});