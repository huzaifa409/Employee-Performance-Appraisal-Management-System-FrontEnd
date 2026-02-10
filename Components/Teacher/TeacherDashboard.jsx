import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const TeacherDashboard = () => {

  const kpiData = [
    { value: 80, label: "Peer" },
    { value: 90, label: "Students" },
    { value: 95, label: "Conf." },
    { value: 98, label: "CHR" },
    { value: 78, label: "Society" },
    { value: 88, label: "Admin" },
  ];

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome, Teacher 👋</Text>
        <Text style={styles.sub}>Your Performance Overview — Fall 2025</Text>
      </View>

      {/* Green Strip */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          Monitor your teaching performance and manage course materials.
        </Text>
      </View>

      {/* KPI Section */}
      <Text style={styles.sectionTitle}>KPI Metrics Overview</Text>
      <Text style={styles.sectionSub}>
        Your performance across different KPI categories
      </Text>

      <View style={styles.chartWrap}>
        <BarChart
          data={kpiData}
          barWidth={22}
          spacing={20}
          roundedTop
          frontColor="#2e7d32"
          yAxisThickness={0}
          xAxisThickness={0}
          hideRules
          maxValue={100}
        />
      </View>

      <Text style={styles.score}>89%</Text>
      <Text style={styles.scoreLabel}>Overall Performance Score</Text>

      {/* Simple Performance Views */}
      <Text style={styles.sectionTitle}>Performance Sections</Text>

      <TouchableOpacity style={styles.row}>
        <View>
          <Text style={styles.rowTitle}>Class Held Report</Text>
          <Text style={styles.rowSub}>View your CHR performance</Text>
        </View>
        <Text style={styles.see}>See performance</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row}>
        <View>
          <Text style={styles.rowTitle}>Course Management</Text>
          <Text style={styles.rowSub}>Check course evaluation performance</Text>
        </View>
        <Text style={styles.see}>See performance</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row}>
        <View>
          <Text style={styles.rowTitle}>Society Mentors</Text>
          <Text style={styles.rowSub}>See mentor evaluation performance</Text>
        </View>
        <Text style={styles.see}>See performance</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={styles.logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

    </ScrollView>
  );
};

export default TeacherDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f5",
  },

  header: {
    padding: 18,
  },

  welcome: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1b5e20",
  },

  sub: {
    marginTop: 4,
    color: "#666",
  },

  banner: {
    backgroundColor: "#2e7d32",
    marginHorizontal: 16,
    padding: 10,
    borderRadius: 6,
  },

  bannerText: {
    color: "white",
    fontSize: 13,
  },

  sectionTitle: {
    marginTop: 18,
    marginHorizontal: 16,
    fontWeight: "700",
    fontSize: 15,
  },

  sectionSub: {
    marginHorizontal: 16,
    fontSize: 12,
    color: "#666",
  },

  chartWrap: {
    marginTop: 10,
    marginHorizontal: 10,
    paddingVertical: 10,
  },

  score: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "800",
    color: "#2e7d32",
    marginTop: 10,
  },

  scoreLabel: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
  },

  row: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rowTitle: {
    fontWeight: "700",
  },

  rowSub: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  see: {
    color: "#2e7d32",
    fontWeight: "700",
    fontSize: 12,
  },

  logout: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d32f2f",
    alignItems: "center",
    backgroundColor: "white",
  },

  logoutText: {
    color: "#d32f2f",
    fontWeight: "700",
  },
});
